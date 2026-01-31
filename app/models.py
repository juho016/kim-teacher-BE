from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Boolean, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from .database import Base

# --- 신규 통합 모델 (UUID 기반) ---

class UserAccount(Base):
    __tablename__ = 'user_account'
    user_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    nickname = Column(String(100))

class Pdf(Base):
    __tablename__ = 'pdf'
    pdf_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('user_account.user_id'), nullable=False)
    file_name = Column(String(255), nullable=False)
    storage_url = Column(Text, nullable=True)
    upload_date = Column(DateTime(timezone=True), server_default=func.now())
    
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

    pdf = relationship("Pdf", back_populates="rooms")
    extractions = relationship("PdfExtractionPage", back_populates="room")
    scripts = relationship("AiTutorScript", back_populates="room") # 추가

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

    pdf = relationship("Pdf", back_populates="concepts")

# --- [NEW] AI 튜터 스크립트 테이블 ---
class AiTutorScript(Base):
    __tablename__ = 'ai_tutor_script'
    script_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    room_id = Column(UUID(as_uuid=True), ForeignKey('learning_room.room_id'), nullable=False)
    concept_id = Column(UUID(as_uuid=True), ForeignKey('concept.concept_id'), nullable=True) # 어떤 개념에 대한 스크립트인지
    generated_at = Column(DateTime(timezone=True), server_default=func.now())
    lecture_text = Column(Text, nullable=True)
    audio_url = Column(Text, nullable=True)
    tts_voice_style = Column(String(50), nullable=True)

    room = relationship("LearningRoom", back_populates="scripts")
