from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import text
from .database import get_db, engine
from . import models, schemas
import io
from pypdf import PdfReader

# DB 테이블 자동 생성 (서버 시작 시)
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "kim-teacher-platform backend is running"}

@app.get("/db-check")
def db_check(db: Session = Depends(get_db)):
    try:
        result = db.execute(text("SELECT 1"))
        return {"status": "success", "message": "DB Connected!", "result": result.scalar()}
    except Exception as e:
        return {"status": "fail", "error": str(e)}

# --- 1순위: 학습 화면 진입 API ---
@app.get("/study/{pdf_id}", response_model=schemas.StudyInitResponse)
def get_study_init(pdf_id: int, user_id: str = "test_user", db: Session = Depends(get_db)):
    # 1. PDF 정보 조회
    pdf = db.query(models.Pdf).filter(models.Pdf.id == pdf_id).first()
    if not pdf:
        raise HTTPException(status_code=404, detail="PDF not found")

    # 2. 페이지 목록 조회
    pages = db.query(models.Page).filter(models.Page.pdf_id == pdf_id).order_by(models.Page.page_number).all()
    
    # 3. 진도율 조회 (없으면 기본값)
    progress = db.query(models.StudyProgress).filter(
        models.StudyProgress.pdf_id == pdf_id,
        models.StudyProgress.user_id == user_id
    ).first()

    # 응답 데이터 구성
    return {
        "pdf": {
            "pdf_id": pdf.id,
            "file_name": pdf.file_name
        },
        "pages": [
            {"page_id": p.id, "page_number": p.page_number} for p in pages
        ],
        "progress": {
            "current_page": progress.current_page if progress else 1,
            "last_study_date": progress.last_study_date if progress else None
        } if progress else None,
        "concepts": []
    }

# --- 3순위: PDF 업로드 및 처리 API ---
@app.post("/pdf/upload", response_model=schemas.PdfUploadResponse)
async def upload_pdf(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # 1. 파일 읽기
    content = await file.read()
    pdf_reader = PdfReader(io.BytesIO(content))
    total_pages = len(pdf_reader.pages)

    # 2. PDF 메타데이터 저장
    pdf = models.Pdf(file_name=file.filename, total_pages=total_pages)
    db.add(pdf)
    db.commit()
    db.refresh(pdf)

    # 3. 페이지별 텍스트 추출 및 저장
    pages_to_save = []
    for i, page in enumerate(pdf_reader.pages):
        text_content = page.extract_text() or "" # 텍스트 없으면 빈 문자열
        new_page = models.Page(
            pdf_id=pdf.id,
            page_number=i + 1,
            text_content=text_content
        )
        pages_to_save.append(new_page)
    
    db.add_all(pages_to_save)
    db.commit()

    return {
        "pdf_id": pdf.id,
        "file_name": pdf.file_name,
        "total_pages": total_pages,
        "message": "PDF uploaded and processed successfully"
    }

# --- (개발용) 더미 데이터 생성 API ---
@app.post("/dev/init-dummy")
def init_dummy_data(db: Session = Depends(get_db)):
    # 이미 데이터가 있으면 패스
    if db.query(models.Pdf).first():
        return {"message": "Data already exists"}

    # 1. PDF 생성
    pdf = models.Pdf(file_name="미적분_기초.pdf", total_pages=3)
    db.add(pdf)
    db.commit()
    db.refresh(pdf)

    # 2. 페이지 생성
    pages = [
        models.Page(pdf_id=pdf.id, page_number=1, text_content="미적분이란..."),
        models.Page(pdf_id=pdf.id, page_number=2, text_content="함수의 극한..."),
        models.Page(pdf_id=pdf.id, page_number=3, text_content="미분 계수...")
    ]
    db.add_all(pages)
    
    # 3. 진도율 생성
    progress = models.StudyProgress(user_id="test_user", pdf_id=pdf.id, current_page=1)
    db.add(progress)
    
    db.commit()
    return {"message": "Dummy data created", "pdf_id": pdf.id}
