from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

# 1. PDF 메타데이터
class Pdf(Base):
    __tablename__ = "pdfs"

    id = Column(Integer, primary_key=True, index=True)
    file_name = Column(String, nullable=False)
    total_pages = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    pages = relationship("Page", back_populates="pdf")
    progresses = relationship("StudyProgress", back_populates="pdf")
    logs = relationship("StudyLog", back_populates="pdf")

# 2. PDF 페이지 정보
class Page(Base):
    __tablename__ = "pages"

    id = Column(Integer, primary_key=True, index=True)
    pdf_id = Column(Integer, ForeignKey("pdfs.id"))
    page_number = Column(Integer, nullable=False)
    text_content = Column(Text, nullable=True) # 나중을 위해 텍스트 추출 저장
    image_url = Column(String, nullable=True)  # 페이지 이미지 URL (필요시)

    pdf = relationship("Pdf", back_populates="pages")
    logs = relationship("StudyLog", back_populates="page")

# 3. 학습 진도 (User별 PDF 진행상황)
class StudyProgress(Base):
    __tablename__ = "study_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True) # 임시로 String (추후 User 테이블과 FK 연결 가능)
    pdf_id = Column(Integer, ForeignKey("pdfs.id"))
    current_page = Column(Integer, default=1)
    last_study_date = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    is_completed = Column(Boolean, default=False)

    pdf = relationship("Pdf", back_populates="progresses")

# 4. 학습 로그 (2순위 대비)
class StudyLog(Base):
    __tablename__ = "study_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    pdf_id = Column(Integer, ForeignKey("pdfs.id"))
    page_id = Column(Integer, ForeignKey("pages.id"), nullable=True)
    action = Column(String, nullable=False) # view, quiz, review
    stay_time = Column(Integer, default=0)  # 머문 시간 (초)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    pdf = relationship("Pdf", back_populates="logs")
    page = relationship("Page", back_populates="logs")
