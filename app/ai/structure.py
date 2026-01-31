from . import guard
from .. import schemas

def analyze_document_structure(full_text: str) -> schemas.DocumentStructureResponse:
    """
    PDF 전체 텍스트를 받아 Gemini를 이용해 개념 구조를 분석하고,
    Pydantic 모델로 검증된 JSON을 반환합니다.
    """
    system_prompt = """
    You are an expert in analyzing academic documents. 
    Your task is to identify the main concepts from the provided text, which is a concatenation of pages from a PDF.
    Each concept should have a title, a brief description, and the start and end page numbers.
    The output must be a JSON object that follows the provided schema.
    Do not include page numbers in the title or description.
    """

    user_prompt = f"""
    Analyze the following document text and provide the structure as a JSON object.
    The text is formatted as '--- Page X ---\n[content]'.
    
    Text:
    {full_text}
    """

    # guard.py의 call_gpt 함수를 그대로 사용
    validated_response = guard.call_gpt(
        system_role=system_prompt,
        user_prompt=user_prompt,
        output_model=schemas.DocumentStructureResponse,
        model_name="gemini-2.5-flash-lite" # 모델 이름 변경
    )

    return validated_response
