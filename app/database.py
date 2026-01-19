# app/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# [디버깅용] 이 줄을 추가해서 터미널에 주소가 찍히는지 확인하세요!
print(f"------------\n로드된 주소: {DATABASE_URL}\n------------") 

engine = create_engine(DATABASE_URL, pool_pre_ping=True)

# 2. 세션 공장
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. 모델 베이스
Base = declarative_base()

# 4. 의존성 함수 (FastAPI에서 갖다 쓰는 용도)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()