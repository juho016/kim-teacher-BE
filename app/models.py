from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Boolean, JSON, ARRAY, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from .database import Base

class UserAccount(Base):
    __tablename__ = 'user_account'
    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    nickname = Column(String(100))
    
    pdfs = relationship("Pdf", back_populates="user")
    learning_rooms = relationship("LearningRoom", back_populates="user")
    chat_logs = relationship("StudyChatLog", back_populates="user")

class Pdf(Base):
    __tablename__ = 'pdf'
    pdf_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('user_account.user_id'), nullable=False)
    file_name = Column(String(255), nullable=False)
    storage_url = Column(Text, nullable=True)
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("UserAccount", back_populates="pdfs")
    pages = relationship("PdfPage", back_populates="pdf")
    rooms = relationship("LearningRoom", back_populates="pdf")
    concepts = relationship("Concept", back_populates="pdf")

class PdfPage(Base):
    __tablename__ = 'pdf_page'
    page_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pdf_id = Column(UUID(as_uuid=True), ForeignKey('pdf.pdf_id'), nullable=False)
    page_number = Column(Integer, nullable=False)
    page_text = Column(Text, nullable=True)
    thumbnail_url = Column(Text, nullable=True)

    pdf = relationship("Pdf", back_populates="pages")
    extraction = relationship("PdfExtractionPage", back_populates="page", uselist=False)

class LearningRoom(Base):
    __tablename__ = 'learning_room'
    room_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('user_account.user_id'), nullable=False)
    pdf_id = Column(UUID(as_uuid=True), ForeignKey('pdf.pdf_id'), nullable=False)
    current_page = Column(Integer, default=1)
    last_study_date = Column(DateTime(timezone=True), server_default=func.now())
    study_goal = Column(Text, nullable=True)

    user = relationship("UserAccount", back_populates="learning_rooms")
    pdf = relationship("Pdf", back_populates="rooms")
    extractions = relationship("PdfExtractionPage", back_populates="room")
    scripts = relationship("AiTutorScript", back_populates="room")
    quizzes = relationship("AiGeneratedQuiz", back_populates="room")
    quiz_histories = relationship("QuizHistory", back_populates="room")
    mastery_levels = relationship("ConceptMastery", back_populates="room")
    chat_logs = relationship("StudyChatLog", back_populates="room")
    weakness_diagnoses = relationship("WeaknessDiagnosis", back_populates="room")
    cornell_notes = relationship("CornellNote", back_populates="room") # 추가

class PdfExtractionPage(Base):
    __tablename__ = 'pdf_extraction_page'
    pdf_extraction_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    room_id = Column(UUID(as_uuid=True), ForeignKey('learning_room.room_id'), nullable=False)
    page_id = Column(UUID(as_uuid=True), ForeignKey('pdf_page.page_id'), nullable=False)
    pdf_id = Column(UUID(as_uuid=True), ForeignKey('pdf.pdf_id'), nullable=False)
    summary = Column(Text, nullable=True)
    cornell_summary = Column(Text, nullable=True)
    key_terms = Column(JSON, nullable=True)
    concept_json = Column(JSON, nullable=True)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    page = relationship("PdfPage", back_populates="extraction")
    room = relationship("LearningRoom", back_populates="extractions")

class Concept(Base):
    __tablename__ = 'concept'
    concept_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pdf_id = Column(UUID(as_uuid=True), ForeignKey('pdf.pdf_id'), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    start_page = Column(Integer, nullable=False)
    end_page = Column(Integer, nullable=False)
    order_index = Column(Integer, nullable=False)
    concept_type = Column(String(30), nullable=True)
    hierarchy_level = Column(Integer, nullable=False, default=0)
    parent_concept_id = Column(UUID(as_uuid=True), ForeignKey('concept.concept_id'), nullable=True)
    path_text = Column(Text, nullable=True)
    
    parent_concept = relationship("Concept", remote_side=[concept_id], backref="child_concepts")
    pdf = relationship("Pdf", back_populates="concepts")
    mastery_levels = relationship("ConceptMastery", back_populates="concept")
    cornell_notes = relationship("CornellNote", back_populates="concept") # 추가

class AiTutorScript(Base):
    __tablename__ = 'ai_tutor_script'
    script_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    room_id = Column(UUID(as_uuid=True), ForeignKey('learning_room.room_id'), nullable=False)
    concept_id = Column(UUID(as_uuid=True), ForeignKey('concept.concept_id'), nullable=True)
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    lecture_text = Column(Text, nullable=True)
    audio_url = Column(Text, nullable=True)
    tts_voice_style = Column(String(50), nullable=True)

    room = relationship("LearningRoom", back_populates="scripts")

class AiGeneratedQuiz(Base):
    __tablename__ = 'ai_generated_quiz'
    quiz_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    room_id = Column(UUID(as_uuid=True), ForeignKey('learning_room.room_id'), nullable=False)
    concept_id = Column(UUID(as_uuid=True), ForeignKey('concept.concept_id'), nullable=True)
    generation_time = Column(DateTime(timezone=True), server_default=func.now())
    question = Column(Text, nullable=False)
    choices = Column(JSON, nullable=True)
    correct_answer = Column(Text, nullable=False)
    explanation = Column(Text, nullable=True)

    room = relationship("LearningRoom", back_populates="quizzes")

class QuizHistory(Base):
    __tablename__ = 'quiz_history'
    quiz_history_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    room_id = Column(UUID(as_uuid=True), ForeignKey('learning_room.room_id'), nullable=False)
    generated_quiz_ids = Column(ARRAY(UUID(as_uuid=True)), nullable=True)
    score = Column(Integer, default=0)
    total_questions = Column(Integer, default=0)
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    duration_seconds = Column(Integer, default=0)

    room = relationship("LearningRoom", back_populates="quiz_histories")
    wrong_answers = relationship("WrongAnswer", back_populates="history")

class WrongAnswer(Base):
    __tablename__ = 'wrong_answer'
    wrong_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    quiz_history_id = Column(UUID(as_uuid=True), ForeignKey('quiz_history.quiz_history_id'), nullable=False)
    question = Column(Text, nullable=False)
    your_answer = Column(Text, nullable=True)
    correct_answer = Column(Text, nullable=True)
    explanation = Column(Text, nullable=True)
    review_count = Column(Integer, default=0)
    is_mastered = Column(Boolean, default=False)

    history = relationship("QuizHistory", back_populates="wrong_answers")

class ConceptMastery(Base):
    __tablename__ = 'concept_mastery'
    mastery_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    room_id = Column(UUID(as_uuid=True), ForeignKey('learning_room.room_id'), nullable=False)
    concept_id = Column(UUID(as_uuid=True), ForeignKey('concept.concept_id'), nullable=False)
    mastery_state = Column(String(50), default="unseen")
    last_accuracy = Column(Float, default=0.0)
    avg_solve_time = Column(Float, default=0.0)
    retry_count = Column(Integer, default=0, nullable=False)
    revisit_count = Column(Integer, default=0, nullable=False)
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    room = relationship("LearningRoom", back_populates="mastery_levels")
    concept = relationship("Concept", back_populates="mastery_levels")

class StudyChatLog(Base):
    __tablename__ = 'study_chat_log'
    log_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    room_id = Column(UUID(as_uuid=True), ForeignKey('learning_room.room_id'), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey('user_account.user_id'), nullable=True)
    role = Column(String(20), nullable=False)
    message = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    room = relationship("LearningRoom", back_populates="chat_logs")
    user = relationship("UserAccount", back_populates="chat_logs")

class WeaknessDiagnosis(Base):
    __tablename__ = 'weakness_diagnosis'
    diagnosis_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    room_id = Column(UUID(as_uuid=True), ForeignKey('learning_room.room_id'), nullable=False)
    analysis_date = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    weak_area = Column(Text, nullable=True)
    improvement_plan = Column(Text, nullable=True)

    room = relationship("LearningRoom", back_populates="weakness_diagnoses")

# --- [NEW] 코넬 노트 테이블 ---
class CornellNote(Base):
    __tablename__ = 'cornell_note'
    note_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    room_id = Column(UUID(as_uuid=True), ForeignKey('learning_room.room_id'), nullable=False)
    concept_id = Column(UUID(as_uuid=True), ForeignKey('concept.concept_id'), nullable=False)
    
    keywords = Column(JSON, nullable=True) # 왼쪽 (Cue) 영역: ["키워드1", "질문1", ...]
    notes = Column(Text, nullable=True)    # 오른쪽 (Notes) 영역: 메인 필기 내용
    summary = Column(Text, nullable=True)  # 하단 (Summary) 영역: 요약
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    room = relationship("LearningRoom", back_populates="cornell_notes")
    concept = relationship("Concept", back_populates="cornell_notes")
