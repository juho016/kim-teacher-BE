import google.generativeai as genai
from . import guard

def generate_answer(concept_text: str, user_question: str) -> str:
    """
    주어진 개념 텍스트(Context) 내에서 사용자의 질문에 답변합니다.
    맥락과 벗어나는 질문은 거절합니다.
    """
    guard.configure_gemini() # API 키 설정

    # [수정] 역할과 규칙을 훨씬 더 강력하고 명확하게 정의
    system_role = """
    You are a specialized Q&A bot for an educational platform. Your ONLY function is to answer questions based on the 'Context' provided below.

    1.  **Analyze the User's Question:** Determine if the question can be answered using ONLY the information within the 'Context' text.
    2.  **Answer if Relevant:** If the question is directly related to the Context, provide a clear and detailed explanation based on the information given.
    3.  **Refuse if Irrelevant:** If the question is about a different topic, asks for personal opinions, or requires any information outside of the provided 'Context', you MUST refuse to answer. Your ONLY valid refusal response is the exact Korean phrase: "죄송합니다. 해당 내용은 제공된 학습 자료에 없어 답변해 드릴 수 없습니다."
    4.  **Do not use any external knowledge.** Do not search the web. Do not use your general knowledge base. Your world is only the 'Context'.
    """

    user_prompt = f"""
    Context:
    ---
    {concept_text}
    ---
    
    Question: {user_question}
    """

    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.5-flash-lite",
            system_instruction=system_role
        )

        response = model.generate_content(user_prompt)

        return response.text
    except Exception as e:
        print(f"Q&A Generation Error: {e}")
        return "답변을 생성하는 중 오류가 발생했습니다."
