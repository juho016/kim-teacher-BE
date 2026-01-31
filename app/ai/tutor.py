from . import guard
from .. import schemas

def generate_lecture_script(concept_title: str, concept_text: str) -> schemas.LectureScript:
    """
    주어진 개념 텍스트를 기반으로 강의 스크립트를 생성합니다.
    guard.py를 통해 안전하게 Gemini를 호출하고, 검증된 결과를 반환합니다.
    """
    
    system_role = """
    You are a script generator for an AI tutor. 
    Your task is to create a lecture script based on the provided concept text.
    The output must be a JSON object that follows the specified format.
    The script should be easy to understand for a high school student.
    """

    user_prompt = f"""
    Generate a lecture script for the following concept.
    
    Concept Title: {concept_title}
    
    Concept Text:
    {concept_text}
    """

    lecture_script = guard.call_gpt(
        system_role=system_role,
        user_prompt=user_prompt,
        output_model=schemas.LectureScript,
        model_name="gemini-2.5-flash-lite" # 모델 이름 변경
    )
    
    return lecture_script
