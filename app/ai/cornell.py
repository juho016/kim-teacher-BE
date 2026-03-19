from . import guard
from .. import schemas

def generate_cornell_note(concept_title: str, concept_text: str) -> schemas.CornellNoteBase:
    """
    주어진 개념 텍스트를 기반으로 코넬 노트(키워드, 노트, 요약)를 생성합니다.
    """
    
    system_role = """
    You are an expert note-taker. 
    Your task is to summarize the provided text into the Cornell Note system format.
    The output must be a JSON object with three fields:
    1. 'keywords': A list of key terms or questions (Cue column).
    2. 'notes': The main detailed notes (Notes column).
    3. 'summary': A brief summary of the entire content (Summary column).
    """

    user_prompt = f"""
    Create a Cornell Note for the following concept.
    
    Concept Title: {concept_title}
    
    Concept Text:
    {concept_text}
    """

    cornell_note = guard.call_gpt(
        system_role=system_role,
        user_prompt=user_prompt,
        output_model=schemas.CornellNoteBase,
        model_name="gemini-2.5-flash-lite"
    )
    
    return cornell_note
