# app/main.py
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from .database import get_db

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "kim-teacher-platform backend is running"}

@app.get("/db-check")
def db_check(db: Session = Depends(get_db)):
    try:
        # DB에 "1 주세요" 라고 요청 (가장 확실한 테스트)
        result = db.execute(text("SELECT 1"))
        return {"status": "success", "message": "DB Connected!", "result": result.scalar()}
    except Exception as e:
        return {"status": "fail", "error": str(e)}