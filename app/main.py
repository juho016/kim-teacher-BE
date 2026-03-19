from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import text
from .database import get_db, engine, SessionLocal
from . import models, schemas
from .ai import structure, tutor, quiz, qna, cornell # 코넬 모듈 임포트
from .analytics import engine as analytics_engine
import io
import os
import uuid
from pypdf import PdfReader
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
from collections import Counter

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_or_create_test_user(db: Session):
    user = db.query(models.UserAccount).filter(models.UserAccount.email == "test@test.com").first()
    if not user:
        user = models.UserAccount(user_id=uuid.uuid4(), email="test@test.com", password_hash="1234", nickname="TestUser")
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

# --- Background Tasks ---
def process_document_structure(pdf_id: uuid.UUID):
    db = SessionLocal()
    try:
        pages = db.query(models.PdfPage).filter(models.PdfPage.pdf_id == pdf_id).order_by(models.PdfPage.page_number).all()
        full_text = "\n".join([p.page_text for p in pages if p.page_text])[:3000]
        if not full_text: return

        structure_response = structure.analyze_document_structure(full_text)
        for idx, concept_data in enumerate(structure_response.concepts):
            concept = models.Concept(
                concept_id=uuid.uuid4(),
                pdf_id=pdf_id,
                title=concept_data.title,
                description=concept_data.description,
                start_page=concept_data.start_page,
                end_page=concept_data.end_page,
                order_index=idx + 1,
                concept_type="concept",
                hierarchy_level=0,
            )
            db.add(concept)
        db.commit()
        print(f"PDF {pdf_id} structure analysis completed.")
    except Exception as e:
        print(f"Error in structure analysis: {e}")
    finally:
        db.close()

def process_lecture_generation(concept_id: uuid.UUID, room_id: uuid.UUID):
    db = SessionLocal()
    try:
        concept = db.query(models.Concept).filter(models.Concept.concept_id == concept_id).first()
        if not concept: return
        pages = db.query(models.PdfPage).filter(models.PdfPage.pdf_id == concept.pdf_id, models.PdfPage.page_number >= concept.start_page, models.PdfPage.page_number <= concept.end_page).order_by(models.PdfPage.page_number).all()
        concept_text = "\n".join([p.page_text for p in pages if p.page_text])
        if not concept_text: return
        script_data = tutor.generate_lecture_script(concept.title, concept_text)
        new_script = models.AiTutorScript(script_id=uuid.uuid4(), room_id=room_id, concept_id=concept_id, lecture_text=script_data.script)
        db.add(new_script)
        db.commit()
        print(f"Lecture script generated for concept {concept.title}")
    except Exception as e:
        print(f"Error in lecture generation: {e}")
    finally:
        db.close()

def process_quiz_generation(concept_id: uuid.UUID, room_id: uuid.UUID):
    db = SessionLocal()
    try:
        concept = db.query(models.Concept).filter(models.Concept.concept_id == concept_id).first()
        if not concept: return
        pages = db.query(models.PdfPage).filter(models.PdfPage.pdf_id == concept.pdf_id, models.PdfPage.page_number >= concept.start_page, models.PdfPage.page_number <= concept.end_page).order_by(models.PdfPage.page_number).all()
        concept_text = "\n".join([p.page_text for p in pages if p.page_text])
        if not concept_text: return
        
        quiz_response = quiz.generate_quizzes(concept.title, concept_text, num_quizzes=2)
        for q in quiz_response.quizzes:
            new_quiz = models.AiGeneratedQuiz(quiz_id=uuid.uuid4(), room_id=room_id, concept_id=concept_id, question=q.question, choices=q.choices, correct_answer=q.correct_answer, explanation=q.explanation)
            db.add(new_quiz)

        db.commit()
        print(f"Quizzes generated for concept {concept.title}")
    except Exception as e:
        print(f"Error in quiz generation: {e}")
    finally:
        db.close()

def process_cornell_generation(concept_id: uuid.UUID, room_id: uuid.UUID):
    db = SessionLocal()
    try:
        concept = db.query(models.Concept).filter(models.Concept.concept_id == concept_id).first()
        if not concept: return
        
        # 이미 노트가 있으면 생성 안 함 (덮어쓰기 방지)
        existing_note = db.query(models.CornellNote).filter_by(concept_id=concept_id, room_id=room_id).first()
        if existing_note:
            print(f"Cornell note already exists for concept {concept.title}")
            return

        pages = db.query(models.PdfPage).filter(models.PdfPage.pdf_id == concept.pdf_id, models.PdfPage.page_number >= concept.start_page, models.PdfPage.page_number <= concept.end_page).order_by(models.PdfPage.page_number).all()
        concept_text = "\n".join([p.page_text for p in pages if p.page_text])
        if not concept_text: return

        cornell_data = cornell.generate_cornell_note(concept.title, concept_text)
        
        new_note = models.CornellNote(
            note_id=uuid.uuid4(),
            room_id=room_id,
            concept_id=concept_id,
            keywords=cornell_data.keywords,
            notes=cornell_data.notes,
            summary=cornell_data.summary
        )
        db.add(new_note)
        db.commit()
        print(f"Cornell note generated for concept {concept.title}")
    except Exception as e:
        print(f"Error in cornell generation: {e}")
    finally:
        db.close()

# --- API Endpoints ---
@app.get("/")
def read_root(): return {"message": "kim-teacher-platform backend is running"}

@app.post("/login")
def login(request: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.UserAccount).filter(models.UserAccount.email == request.email).first()
    if not user or user.password_hash != request.password:
        raise HTTPException(status_code=401, detail="이메일 또는 비밀번호가 틀렸습니다.")
    return {"message": "로그인 성공", "user_id": str(user.user_id), "nickname": user.nickname}

@app.post("/pdf/upload", response_model=schemas.PdfUploadResponse)
async def upload_pdf(file: UploadFile = File(...), db: Session = Depends(get_db)):
    user = get_or_create_test_user(db)
    content = await file.read()
    pdf_reader = PdfReader(io.BytesIO(content))
    pdf = models.Pdf(pdf_id=uuid.uuid4(), user_id=user.user_id, file_name=file.filename)
    db.add(pdf)
    db.commit()
    db.refresh(pdf)
    pages_to_save = [models.PdfPage(page_id=uuid.uuid4(), pdf_id=pdf.pdf_id, page_number=i + 1, page_text=page.extract_text() or "") for i, page in enumerate(pdf_reader.pages)]
    db.add_all(pages_to_save)
    db.commit()
    return {"pdf_id": pdf.pdf_id, "file_name": pdf.file_name, "total_pages": len(pages_to_save), "message": "PDF uploaded."}

@app.post("/learning-rooms", response_model=schemas.LearningRoomResponse, status_code=201)
def create_learning_room(room_data: schemas.LearningRoomCreate, db: Session = Depends(get_db)):
    user = get_or_create_test_user(db)
    if not db.query(models.Pdf).filter(models.Pdf.pdf_id == room_data.pdf_id).first():
        raise HTTPException(status_code=404, detail="PDF not found")
    new_room = models.LearningRoom(room_id=uuid.uuid4(), user_id=user.user_id, pdf_id=room_data.pdf_id, study_goal=room_data.study_goal)
    db.add(new_room)
    db.commit()
    db.refresh(new_room)
    return new_room

@app.post("/pdf/{pdf_id}/structure", response_model=schemas.StructureAnalysisResponse)
def analyze_structure(pdf_id: uuid.UUID, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    if not db.query(models.Pdf).filter(models.Pdf.pdf_id == pdf_id).first():
        raise HTTPException(status_code=404, detail="PDF not found")
    background_tasks.add_task(process_document_structure, pdf_id)
    return {"pdf_id": pdf_id, "message": "Document structure analysis started."}

@app.get("/pdf/{pdf_id}/concepts", response_model=schemas.ConceptListResponse)
def get_pdf_concepts(pdf_id: uuid.UUID, db: Session = Depends(get_db)):
    pdf = db.query(models.Pdf).filter(models.Pdf.pdf_id == pdf_id).first()
    if not pdf:
        raise HTTPException(status_code=404, detail="PDF not found")
    concepts = db.query(models.Concept).filter(models.Concept.pdf_id == pdf_id).order_by(models.Concept.order_index).all()
    if not concepts:
        raise HTTPException(status_code=404, detail="Concepts not found for this PDF. Please run structure analysis first.")
    return {"pdf_id": pdf_id, "concepts": concepts}

@app.get("/pdf/{pdf_id}/pages", response_model=schemas.PdfPagesDetailResponse)
def get_pdf_pages_detail(pdf_id: uuid.UUID, db: Session = Depends(get_db)):
    pdf = db.query(models.Pdf).filter(models.Pdf.pdf_id == pdf_id).first()
    if not pdf: raise HTTPException(status_code=404, detail="PDF not found")
    pages = db.query(models.PdfPage).filter(models.PdfPage.pdf_id == pdf_id).order_by(models.PdfPage.page_number).all()
    return {"pdf_id": pdf.pdf_id, "file_name": pdf.file_name, "pages": pages}

@app.post("/concepts/{concept_id}/lecture", response_model=schemas.AnalysisResponse)
def generate_lecture(concept_id: uuid.UUID, request: schemas.AnalysisRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    concept = db.query(models.Concept).filter(models.Concept.concept_id == concept_id).first()
    if not concept: raise HTTPException(status_code=404, detail="Concept not found")
    if not db.query(models.LearningRoom).filter(models.LearningRoom.room_id == request.room_id).first():
        raise HTTPException(status_code=404, detail="Room not found")
    background_tasks.add_task(process_lecture_generation, concept_id, request.room_id)
    return {"pdf_id": concept.pdf_id, "room_id": request.room_id, "message": "Lecture script generation started."}

@app.post("/concepts/{concept_id}/quiz", response_model=schemas.AnalysisResponse)
def generate_quiz(concept_id: uuid.UUID, request: schemas.AnalysisRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    concept = db.query(models.Concept).filter(models.Concept.concept_id == concept_id).first()
    if not concept: raise HTTPException(status_code=404, detail="Concept not found")
    if not db.query(models.LearningRoom).filter(models.LearningRoom.room_id == request.room_id).first():
        raise HTTPException(status_code=404, detail="Room not found")
    background_tasks.add_task(process_quiz_generation, concept_id, request.room_id)
    return {"pdf_id": concept.pdf_id, "room_id": request.room_id, "message": "Quiz generation started."}

@app.get("/concepts/{concept_id}/quizzes", response_model=schemas.QuizListResponse)
def get_concept_quizzes(concept_id: uuid.UUID, db: Session = Depends(get_db)):
    quizzes = db.query(models.AiGeneratedQuiz).filter(models.AiGeneratedQuiz.concept_id == concept_id).all()
    return {"concept_id": concept_id, "quizzes": quizzes}

@app.post("/quizzes/submit", response_model=schemas.QuizResultResponse)
def submit_quiz(submission: schemas.QuizSubmission, db: Session = Depends(get_db)):
    room = db.query(models.LearningRoom).filter(models.LearningRoom.room_id == submission.room_id).first()
    if not room: raise HTTPException(status_code=404, detail="Room not found")

    score, total_questions, wrong_answers_to_save, quiz_ids = 0, len(submission.answers), [], []
    concept_results = {}

    for answer in submission.answers:
        quiz = db.query(models.AiGeneratedQuiz).filter(models.AiGeneratedQuiz.quiz_id == answer.quiz_id).first()
        if not quiz: continue
        
        quiz_ids.append(quiz.quiz_id)
        is_correct = quiz.correct_answer.strip().lower() == answer.selected_answer.strip().lower()
        
        if quiz.concept_id not in concept_results:
            concept_results[quiz.concept_id] = {'correct': 0, 'total': 0, 'total_time': 0}
        
        concept_results[quiz.concept_id]['total'] += 1
        concept_results[quiz.concept_id]['total_time'] += answer.solve_time_seconds
        if is_correct:
            score += 1
            concept_results[quiz.concept_id]['correct'] += 1
        else:
            wrong_answers_to_save.append(models.WrongAnswer(wrong_id=uuid.uuid4(), question=quiz.question, your_answer=answer.selected_answer, correct_answer=quiz.correct_answer, explanation=quiz.explanation))

    history = models.QuizHistory(quiz_history_id=uuid.uuid4(), room_id=submission.room_id, generated_quiz_ids=quiz_ids, score=score, total_questions=total_questions, duration_seconds=sum(a.solve_time_seconds for a in submission.answers))
    db.add(history)
    db.commit()

    for wa in wrong_answers_to_save:
        wa.quiz_history_id = history.quiz_history_id
        db.add(wa)

    updated_mastery_list = []
    for concept_id, results in concept_results.items():
        mastery = db.query(models.ConceptMastery).filter_by(room_id=submission.room_id, concept_id=concept_id).first()
        if not mastery:
            mastery = models.ConceptMastery(
                mastery_id=uuid.uuid4(), 
                room_id=submission.room_id, 
                concept_id=concept_id,
                retry_count=0,
                avg_solve_time=0.0
            )
            db.add(mastery)
        
        mastery.retry_count += 1
        mastery.last_accuracy = (results['correct'] / results['total']) * 100
        mastery.avg_solve_time = ((mastery.avg_solve_time * (mastery.retry_count - 1)) + results['total_time']) / mastery.retry_count
        mastery.mastery_state = analytics_engine.classify_concept_state(mastery.last_accuracy, mastery.avg_solve_time, mastery.retry_count)
        updated_mastery_list.append({"concept_id": concept_id, "new_state": mastery.mastery_state})

    db.commit()
    
    return {"quiz_history_id": history.quiz_history_id, "score": score, "total_questions": total_questions, "wrong_answers": wrong_answers_to_save, "updated_mastery": updated_mastery_list}

@app.post("/concepts/{concept_id}/qna", response_model=schemas.QnAResponse)
def ask_question(concept_id: uuid.UUID, request: schemas.QnARequest, db: Session = Depends(get_db)):
    user = get_or_create_test_user(db)
    concept = db.query(models.Concept).filter(models.Concept.concept_id == concept_id).first()
    if not concept: raise HTTPException(status_code=404, detail="Concept not found")

    pages = db.query(models.PdfPage).filter(
        models.PdfPage.pdf_id == concept.pdf_id,
        models.PdfPage.page_number >= concept.start_page,
        models.PdfPage.page_number <= concept.end_page
    ).order_by(models.PdfPage.page_number).all()
    concept_text = "\n".join([p.page_text for p in pages if p.page_text])

    user_log = models.StudyChatLog(log_id=uuid.uuid4(), room_id=request.room_id, user_id=user.user_id, role="user", message=request.question)
    db.add(user_log)
    db.commit()

    answer_text = qna.generate_answer(concept_text, request.question)

    ai_log = models.StudyChatLog(log_id=uuid.uuid4(), room_id=request.room_id, user_id=None, role="assistant", message=answer_text)
    db.add(ai_log)
    db.commit()
    db.refresh(ai_log)

    return {"answer": answer_text, "log_id": ai_log.log_id}

@app.get("/learning-rooms/{room_id}/progress", response_model=schemas.ProgressResponse)
def get_progress(room_id: uuid.UUID, db: Session = Depends(get_db)):
    room = db.query(models.LearningRoom).filter(models.LearningRoom.room_id == room_id).first()
    if not room: raise HTTPException(status_code=404, detail="Room not found")
    total_pages = db.query(models.PdfPage).filter(models.PdfPage.pdf_id == room.pdf_id).count()
    progress_percentage = (room.current_page / total_pages * 100) if total_pages > 0 else 0
    return {"room_id": room.room_id, "current_page": room.current_page, "total_pages": total_pages, "progress_percentage": round(progress_percentage, 1), "last_study_date": room.last_study_date}

@app.post("/learning-rooms/{room_id}/progress", response_model=schemas.ProgressResponse)
def update_progress(room_id: uuid.UUID, update_data: schemas.ProgressUpdate, db: Session = Depends(get_db)):
    room = db.query(models.LearningRoom).filter(models.LearningRoom.room_id == room_id).first()
    if not room: raise HTTPException(status_code=404, detail="Room not found")
    room.current_page = update_data.current_page
    room.last_study_date = datetime.now()
    db.commit()
    db.refresh(room)
    return get_progress(room_id, db)

@app.get("/learning-rooms/{room_id}/statistics", response_model=schemas.StudyStatisticsResponse)
def get_study_statistics(room_id: uuid.UUID, db: Session = Depends(get_db)):
    if not db.query(models.LearningRoom).filter(models.LearningRoom.room_id == room_id).first():
        raise HTTPException(status_code=404, detail="Room not found")
    histories = db.query(models.QuizHistory).filter(models.QuizHistory.room_id == room_id).all()
    total_questions = sum(h.total_questions for h in histories)
    total_correct = sum(h.score for h in histories)
    return {
        "total_quizzes_taken": len(histories),
        "total_questions_solved": total_questions,
        "total_correct_answers": total_correct,
        "average_score": (total_correct / len(histories)) if histories else 0.0,
        "accuracy_rate": (total_correct / total_questions * 100) if total_questions > 0 else 0.0,
        "total_study_time_seconds": sum(h.duration_seconds for h in histories)
    }

@app.get("/learning-rooms/{room_id}/weaknesses", response_model=schemas.WeaknessAnalysisResponse)
def get_weaknesses(room_id: uuid.UUID, db: Session = Depends(get_db)):
    if not db.query(models.LearningRoom).filter(models.LearningRoom.room_id == room_id).first():
        raise HTTPException(status_code=404, detail="Room not found")
    
    weak_masteries = db.query(models.ConceptMastery).filter(
        models.ConceptMastery.room_id == room_id,
        models.ConceptMastery.mastery_state.in_(['struggling', 'careless', 'unstable'])
    ).all()

    weak_concepts_info = []
    for mastery in weak_masteries:
        concept = db.query(models.Concept).filter(models.Concept.concept_id == mastery.concept_id).first()
        if concept:
            weak_concepts_info.append({
                "concept_id": mastery.concept_id,
                "title": concept.title,
                "mastery_state": mastery.mastery_state,
                "wrong_count": mastery.retry_count
            })

    return {
        "room_id": room_id,
        "weak_concepts": weak_concepts_info,
        "message": "Weakness analysis based on mastery state."
    }

@app.get("/learning-rooms/{room_id}/wrong-answers", response_model=schemas.WrongAnswerListResponse)
def get_wrong_answers(room_id: uuid.UUID, db: Session = Depends(get_db)):
    if not db.query(models.LearningRoom).filter(models.LearningRoom.room_id == room_id).first():
        raise HTTPException(status_code=404, detail="Room not found")

    histories = db.query(models.QuizHistory).filter(models.QuizHistory.room_id == room_id).all()
    history_ids = [h.quiz_history_id for h in histories]

    if not history_ids:
        return {"room_id": room_id, "wrong_answers": []}

    wrong_answers = db.query(models.WrongAnswer).filter(
        models.WrongAnswer.quiz_history_id.in_(history_ids),
        models.WrongAnswer.is_mastered == False
    ).all()

    return {
        "room_id": room_id,
        "wrong_answers": wrong_answers
    }

# --- [NEW] 코넬 노트 API ---
@app.post("/concepts/{concept_id}/cornell/generate", response_model=schemas.AnalysisResponse)
def generate_cornell(concept_id: uuid.UUID, request: schemas.CornellNoteCreateRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    concept = db.query(models.Concept).filter(models.Concept.concept_id == concept_id).first()
    if not concept: raise HTTPException(status_code=404, detail="Concept not found")
    if not db.query(models.LearningRoom).filter(models.LearningRoom.room_id == request.room_id).first():
        raise HTTPException(status_code=404, detail="Room not found")
    
    background_tasks.add_task(process_cornell_generation, concept_id, request.room_id)
    return {"pdf_id": concept.pdf_id, "room_id": request.room_id, "message": "Cornell note generation started."}

@app.get("/concepts/{concept_id}/cornell", response_model=schemas.CornellNoteResponse)
def get_cornell_note(concept_id: uuid.UUID, room_id: uuid.UUID, db: Session = Depends(get_db)):
    note = db.query(models.CornellNote).filter_by(concept_id=concept_id, room_id=room_id).first()
    if not note:
        raise HTTPException(status_code=404, detail="Cornell note not found. Generate it first.")
    return note

@app.post("/concepts/{concept_id}/cornell/save", response_model=schemas.CornellNoteResponse)
def save_cornell_note(concept_id: uuid.UUID, request: schemas.CornellNoteSaveRequest, db: Session = Depends(get_db)):
    note = db.query(models.CornellNote).filter_by(concept_id=concept_id, room_id=request.room_id).first()
    if not note:
        # 새로 생성 (사용자가 AI 생성 없이 바로 쓸 수도 있음)
        note = models.CornellNote(
            note_id=uuid.uuid4(),
            room_id=request.room_id,
            concept_id=concept_id,
            keywords=request.keywords,
            notes=request.notes,
            summary=request.summary
        )
        db.add(note)
    else:
        # 업데이트
        note.keywords = request.keywords
        note.notes = request.notes
        note.summary = request.summary
        note.updated_at = datetime.now()
    
    db.commit()
    db.refresh(note)
    return note
