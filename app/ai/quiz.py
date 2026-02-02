from . import guard
from .. import schemas

def generate_quizzes(concept_title: str, concept_text: str, num_quizzes: int = 3) -> schemas.QuizGenerationResponse:
    """
    주어진 개념 텍스트를 기반으로 4지 선다형 퀴즈를 생성합니다.
    """
    
    system_role = """
    You are a quiz generator for an AI tutor.
    Your task is to create multiple-choice quizzes based on the provided concept text.
    Each quiz must have 4 choices, one correct answer, and an explanation.
    The output must be a JSON object containing a list of quizzes.
    """

    user_prompt = f"""
    Generate {num_quizzes} multiple-choice quizzes for the following concept.
    
    Concept Title: {concept_title}
    
    Concept Text:
    {concept_text}
    """

    quiz_response = guard.call_gpt(
        system_role=system_role,
        user_prompt=user_prompt,
        output_model=schemas.QuizGenerationResponse,
        model_name="gemini-2.5-flash-lite"
    )
    
    return quiz_response
