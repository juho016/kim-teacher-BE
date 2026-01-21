from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- 기본 모델 ---
class PageBase(BaseModel):
    page_number: int
    page_id: int

    class Config:
        from_attributes = True

class PdfBase(BaseModel):
    pdf_id: int
    file_name: str

    class Config:
        from_attributes = True

class ProgressBase(BaseModel):
    current_page: int
    last_study_date: datetime

    class Config:
        from_attributes = True

# --- 1순위: 학습 화면 진입 응답 ---
class StudyInitResponse(BaseModel):
    pdf: PdfBase
    pages: List[PageBase]
    progress: Optional[ProgressBase] = None
    concepts: List[str] = [] # 나중을 위해 빈 리스트

# --- 2순위: 로그 저장 요청 ---
class LogCreate(BaseModel):
    user_id: str
    pdf_id: int
    page_id: Optional[int] = None
    action: str
    stay_time: int

# --- 3순위: PDF 업로드 응답 ---
class PdfUploadResponse(BaseModel):
    pdf_id: int
    file_name: str
    total_pages: int
    message: str
