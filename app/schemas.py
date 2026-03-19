from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from uuid import UUID

# --- 로그인 요청 ---
class LoginRequest(BaseModel):
    email: str
    password: str

# --- 기본 모델 ---
class PdfPageBase(BaseModel):
    page_id: UUID
    page_number: int
    page_text: Optional[str] = None

    class Config:
        from_attributes = True

class PdfBase(BaseModel):
    pdf_id: UUID
    file_name: str
    upload_date: datetime

    class Config:
        from_attributes = True

# --- 업로드 응답 ---
class PdfUploadResponse(BaseModel):
    pdf_id: UUID
    file_name: str
    total_pages: int
    message: str

# --- 학습방 (Learning Room) ---
class LearningRoomCreate(BaseModel):
    pdf_id: UUID
    study_goal: Optional[str] = None

class LearningRoomResponse(BaseModel):
    room_id: UUID
    pdf_id: UUID
    user_id: UUID
    study_goal: Optional[str] = None
    last_study_date: datetime

    class Config:
        from_attributes = True

# --- 진도 관련 스키마 ---
class ProgressUpdate(BaseModel):
    current_page: int

class ProgressResponse(BaseModel):
    room_id: UUID
    current_page: int
    total_pages: int
    progress_percentage: float
    last_study_date: datetime

# --- 학습 통계 스키마 ---
class StudyStatisticsResponse(BaseModel):
    total_quizzes_taken: int
    total_questions_solved: int
    total_correct_answers: int
    average_score: float
    accuracy_rate: float
    total_study_time_seconds: int

# --- 약점 분석 스키마 ---
class WeakConceptInfo(BaseModel):
    concept_id: UUID
    title: str
    mastery_state: str
    wrong_count: int

class WeaknessAnalysisResponse(BaseModel):
    room_id: UUID
    weak_concepts: List[WeakConceptInfo]
    message: str

# --- Q&A 관련 스키마 ---
class QnARequest(BaseModel):
    room_id: UUID
    question: str

class QnAResponse(BaseModel):
    answer: str
    log_id: UUID

# --- [NEW] 코넬 노트 관련 스키마 ---
class CornellNoteBase(BaseModel):
    keywords: List[str] = Field(..., description="왼쪽 영역의 키워드 또는 질문")
    notes: str = Field(..., description="오른쪽 영역의 메인 필기 내용")
    summary: str = Field(..., description="하단 영역의 요약")

class CornellNoteCreateRequest(BaseModel):
    room_id: UUID

class CornellNoteSaveRequest(BaseModel):
    room_id: UUID
    keywords: List[str]
    notes: str
    summary: str

class CornellNoteResponse(CornellNoteBase):
    note_id: UUID
    concept_id: UUID
    updated_at: datetime

    class Config:
        from_attributes = True

# --- 분석 결과 (Extraction) ---
class ExtractionBase(BaseModel):
    summary: Optional[str] = None
    cornell_summary: Optional[str] = None
    key_terms: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

# --- 페이지 상세 정보 ---
class PageDetail(BaseModel):
    page_id: UUID
    page_number: int
    page_text: Optional[str] = None
    extraction: Optional[ExtractionBase] = None

    class Config:
        from_attributes = True

class PdfPagesDetailResponse(BaseModel):
    pdf_id: UUID
    file_name: str
    pages: List[PageDetail]

# --- AI 분석 요청 ---
class AnalysisRequest(BaseModel):
    room_id: UUID

# --- AI 분석 응답 ---
class AnalysisResponse(BaseModel):
    pdf_id: UUID
    room_id: UUID
    message: str

# --- GPT가 반환할 개념 구조 JSON 스키마 ---
class ConceptSchema(BaseModel):
    title: str = Field(..., description="개념의 제목")
    description: str = Field(..., description="개념에 대한 간략한 설명")
    start_page: int = Field(..., description="개념이 시작되는 페이지 번호")
    end_page: int = Field(..., description="개념이 끝나는 페이지 번호")
    concept_type: Optional[str] = "concept"
    hierarchy_level: Optional[int] = 0

class DocumentStructureResponse(BaseModel):
    concepts: List[ConceptSchema] = Field(..., description="문서에서 추출된 개념 목록")

class StructureAnalysisResponse(BaseModel):
    pdf_id: UUID
    message: str

# --- GPT가 반환할 튜터링 스크립트 JSON 스키마 ---
class LectureScript(BaseModel):
    title: str = Field(..., description="The title of the concept being explained.")
    script: str = Field(..., description="The main explanation script, like a lecture.")
    example: Optional[str] = Field(None, description="A simple example to help understanding.")
    check_question: str = Field(..., description="A simple question to check if the user understood.")

# --- GPT가 반환할 퀴즈 JSON 스키마 ---
class QuizItem(BaseModel):
    question: str = Field(..., description="The quiz question.")
    choices: List[str] = Field(..., description="List of 4 choices.")
    correct_answer: str = Field(..., description="The correct answer (must be one of the choices).")
    explanation: str = Field(..., description="Explanation of why the answer is correct.")

class QuizGenerationResponse(BaseModel):
    quizzes: List[QuizItem] = Field(..., description="List of generated quizzes.")

# --- 개념 목록 조회 응답 ---
class ConceptInfo(BaseModel):
    concept_id: UUID
    title: str
    description: Optional[str] = None
    start_page: int
    end_page: int
    order_index: int
    concept_type: Optional[str] = None
    hierarchy_level: int

    class Config:
        from_attributes = True

class ConceptListResponse(BaseModel):
    pdf_id: UUID
    concepts: List[ConceptInfo]

# --- 퀴즈 풀이 관련 스키마 ---
class QuizInfo(BaseModel):
    quiz_id: UUID
    question: str
    choices: List[str]

    class Config:
        from_attributes = True

class QuizListResponse(BaseModel):
    concept_id: UUID
    quizzes: List[QuizInfo]

class UserAnswer(BaseModel):
    quiz_id: UUID
    selected_answer: str
    solve_time_seconds: float

class QuizSubmission(BaseModel):
    room_id: UUID
    answers: List[UserAnswer]

class WrongAnswerInfo(BaseModel):
    wrong_id: Optional[UUID] = None
    question: str
    your_answer: str
    correct_answer: str
    explanation: str
    is_mastered: bool = False

    class Config:
        from_attributes = True

class QuizResultResponse(BaseModel):
    quiz_history_id: UUID
    score: int
    total_questions: int
    wrong_answers: List[WrongAnswerInfo]
    updated_mastery: List[Dict[str, Any]]

class WrongAnswerListResponse(BaseModel):
    room_id: UUID
    wrong_answers: List[WrongAnswerInfo]
