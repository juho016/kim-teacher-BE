from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import text
from .database import get_db, engine, SessionLocal
from . import models, schemas
from .ai import structure, tutor # AI 모듈 임포트
import io
import os
import uuid
from pypdf import PdfReader
# from openai import OpenAI # 제거
from fastapi.middleware.cors import CORSMiddleware

# DB 테이블 자동 생성
models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# 접근권한 설정 (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 곳에서의 접속을 허용 (개발용)
    allow_credentials=True,
    allow_methods=["*"],  # 모든 메소드(GET, POST 등) 허용
    allow_headers=["*"],  # 모든 헤더 허용
)

# --- Helper: 고정 테스트 사용자 (test@test.com / 1234) ---
def get_or_create_test_user(db: Session):
    # 1. 고정된 이메일로 유저 찾기
    user = db.query(models.UserAccount).filter(models.UserAccount.email == "test@test.com").first()
    
    # 2. 없으면 생성
    if not user:
        user = models.UserAccount(
            user_id=uuid.uuid4(),
            email="test@test.com",
            password_hash="1234", # 실제로는 해시화해야 함
            nickname="TestUser"
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

# --- Background Task: 문서 구조 분석 ---
def process_document_structure(pdf_id: uuid.UUID):
    db = SessionLocal()
    try:
        pages = db.query(models.PdfPage).filter(models.PdfPage.pdf_id == pdf_id).order_by(models.PdfPage.page_number).all()
        full_text = ""
        for page in pages:
            if page.page_text:
                full_text += f"--- Page {page.page_number} ---\n{page.page_text}\n\n"
        
        # [수정] 토큰 제한을 피하기 위해 텍스트 길이를 3000자로 대폭 축소
        full_text = full_text[:3000]

        structure_response = structure.analyze_document_structure(full_text)

        for idx, concept_data in enumerate(structure_response.concepts):
            concept = models.Concept(
                concept_id=uuid.uuid4(),
                pdf_id=pdf_id,
                title=concept_data.title,
                description=concept_data.description,
                start_page=concept_data.start_page,
                end_page=concept_data.end_page,
                order_index=idx + 1
            )
            db.add(concept)
        
        db.commit()
        print(f"PDF {pdf_id} structure analysis completed.")

    except Exception as e:
        print(f"Error in structure analysis: {e}")
    finally:
        db.close()

# --- Background Task: 튜터 스크립트 생성 ---
def process_lecture_generation(concept_id: uuid.UUID, room_id: uuid.UUID):
    db = SessionLocal()
    try:
        concept = db.query(models.Concept).filter(models.Concept.concept_id == concept_id).first()
        if not concept: return

        pages = db.query(models.PdfPage).filter(
            models.PdfPage.pdf_id == concept.pdf_id,
            models.PdfPage.page_number >= concept.start_page,
            models.PdfPage.page_number <= concept.end_page
        ).order_by(models.PdfPage.page_number).all()

        concept_text = "\n".join([p.page_text for p in pages if p.page_text])
        
        if not concept_text: return

        script_data = tutor.generate_lecture_script(concept.title, concept_text)

        new_script = models.AiTutorScript(
            script_id=uuid.uuid4(),
            room_id=room_id,
            concept_id=concept_id,
            lecture_text=script_data.script,
            tts_voice_style="default"
        )
        db.add(new_script)
        db.commit()
        print(f"Lecture script generated for concept {concept.title}")

    except Exception as e:
        print(f"Error in lecture generation: {e}")
    finally:
        db.close()

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

# --- [NEW] 로그인 API ---
@app.post("/login")
def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.UserAccount).filter(models.UserAccount.email == request.email).first()

    if not user:
        raise HTTPException(status_code=401, detail="존재하지 않는 이메일입니다.")
    
    if user.password_hash != request.password:
        raise HTTPException(status_code=401, detail="비밀번호가 틀렸습니다.")

    return {
        "message": "로그인 성공", 
        "user_id": str(user.user_id),
        "nickname": user.nickname
    }

# --- 1. PDF 업로드 ---
@app.post("/pdf/upload", response_model=schemas.PdfUploadResponse)
async def upload_pdf(file: UploadFile = File(...), db: Session = Depends(get_db)):
    user = get_or_create_test_user(db)
    content = await file.read()
    pdf_reader = PdfReader(io.BytesIO(content))
    total_pages = len(pdf_reader.pages)

    pdf = models.Pdf(
        pdf_id=uuid.uuid4(),
        user_id=user.user_id,
        file_name=file.filename,
        storage_url="local_storage"
    )
    db.add(pdf)
    db.commit()
    db.refresh(pdf)

    pages_to_save = []
    for i, page in enumerate(pdf_reader.pages):
        new_page = models.PdfPage(
            page_id=uuid.uuid4(),
            pdf_id=pdf.pdf_id,
            page_number=i + 1,
            page_text=page.extract_text() or ""
        )
        pages_to_save.append(new_page)
    
    db.add_all(pages_to_save)
    db.commit()

    return {
        "pdf_id": pdf.pdf_id,
        "file_name": pdf.file_name,
        "total_pages": total_pages,
        "message": "PDF uploaded and pages saved successfully."
    }

# --- 2. 학습방 생성 ---
@app.post("/learning-rooms", response_model=schemas.LearningRoomResponse, status_code=201)
def create_learning_room(room_data: schemas.LearningRoomCreate, db: Session = Depends(get_db)):
    user = get_or_create_test_user(db)
    
    pdf = db.query(models.Pdf).filter(models.Pdf.pdf_id == room_data.pdf_id).first()
    if not pdf:
        raise HTTPException(status_code=404, detail="PDF not found")

    new_room = models.LearningRoom(
        room_id=uuid.uuid4(),
        user_id=user.user_id,
        pdf_id=room_data.pdf_id,
        study_goal=room_data.study_goal
    )
    db.add(new_room)
    db.commit()
    db.refresh(new_room)

    return new_room

# --- 3. 문서 구조 분석 요청 (개념 추출) ---
@app.post("/pdf/{pdf_id}/structure", response_model=schemas.StructureAnalysisResponse)
def analyze_structure(pdf_id: uuid.UUID, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    pdf = db.query(models.Pdf).filter(models.Pdf.pdf_id == pdf_id).first()
    if not pdf: raise HTTPException(status_code=404, detail="PDF not found")

    background_tasks.add_task(process_document_structure, pdf_id)

    return {
        "pdf_id": pdf.pdf_id,
        "message": "Document structure analysis started. Concepts will be extracted."
    }

# --- 4. 개념별 튜터링 스크립트 생성 요청 ---
@app.post("/concepts/{concept_id}/lecture", response_model=schemas.AnalysisResponse)
def generate_lecture(concept_id: uuid.UUID, request: schemas.AnalysisRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    concept = db.query(models.Concept).filter(models.Concept.concept_id == concept_id).first()
    if not concept: raise HTTPException(status_code=404, detail="Concept not found")

    room = db.query(models.LearningRoom).filter(models.LearningRoom.room_id == request.room_id).first()
    if not room: raise HTTPException(status_code=404, detail="Room not found")

    background_tasks.add_task(process_lecture_generation, concept_id, request.room_id)

    return {
        "pdf_id": concept.pdf_id,
        "room_id": request.room_id,
        "message": "Lecture script generation started in background."
    }

# --- 5. 분석 결과 조회 ---
@app.get("/pdf/{pdf_id}/pages", response_model=schemas.PdfPagesDetailResponse)
def get_pdf_pages_detail(pdf_id: uuid.UUID, db: Session = Depends(get_db)):
    pdf = db.query(models.Pdf).filter(models.Pdf.pdf_id == pdf_id).first()
    if not pdf: raise HTTPException(status_code=404, detail="PDF not found")

    pages = db.query(models.PdfPage).filter(models.PdfPage.pdf_id == pdf_id).order_by(models.PdfPage.page_number).all()

    return {
        "pdf_id": pdf.pdf_id,
        "file_name": pdf.file_name,
        "pages": pages
    }

# --- 6. [NEW] 개념 목록 조회 API ---
@app.get("/pdf/{pdf_id}/concepts", response_model=schemas.ConceptListResponse)
def get_pdf_concepts(pdf_id: uuid.UUID, db: Session = Depends(get_db)):
    pdf = db.query(models.Pdf).filter(models.Pdf.pdf_id == pdf_id).first()
    if not pdf: raise HTTPException(status_code=404, detail="PDF not found")

    concepts = db.query(models.Concept).filter(models.Concept.pdf_id == pdf_id).order_by(models.Concept.order_index).all()

    return {
        "pdf_id": pdf.pdf_id,
        "concepts": concepts
    }
