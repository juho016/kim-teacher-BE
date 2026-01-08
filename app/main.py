# app/main.py

from fastapi import FastAPI

app = FastAPI()


@app.get("/")
def read_root():
    return {"message": "kim-teacher-backend is running"}


@app.get("/api/hello")
def hello():
    return {"message": "Hello from FastAPI!"}
