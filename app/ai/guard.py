import os
import json
from typing import Type, TypeVar
from pydantic import BaseModel
import google.generativeai as genai

# 제네릭 타입 정의
T = TypeVar("T", bound=BaseModel)

def configure_gemini():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not set")
    genai.configure(api_key=api_key)

def call_gpt(
    system_role: str,
    user_prompt: str,
    output_model: Type[T],
    model_name: str = "gemini-2.5-flash-lite" # 더 가벼운 모델로 변경
) -> T:
    """
    Gemini를 호출하고, 응답을 output_model 형식으로 강제 검증하여 반환합니다.
    """
    configure_gemini()

    try:
        # Gemini 모델 설정
        model = genai.GenerativeModel(
            model_name=model_name,
            generation_config={
                "response_mime_type": "application/json" # JSON 모드 강제
            },
            system_instruction=system_role # 시스템 프롬프트 설정
        )

        # 프롬프트에 스키마 정보 추가 (Gemini가 구조를 더 잘 이해하도록)
        schema_hint = f"\nThe output must strictly follow this JSON schema:\n{output_model.model_json_schema()}"
        full_prompt = user_prompt + schema_hint

        response = model.generate_content(full_prompt)

        content = response.text
        
        # 1차: JSON 파싱 시도
        try:
            json_data = json.loads(content)
        except json.JSONDecodeError:
            # 가끔 마크다운 코드 블록(```json ... ```)으로 감싸서 줄 때가 있음
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
                json_data = json.loads(content)
            else:
                raise ValueError(f"Gemini output is not valid JSON: {content}")
            
        # 2차: Pydantic 모델 검증
        validated_data = output_model(**json_data)
        
        return validated_data

    except Exception as e:
        print(f"Gemini Guardrail Error: {e}")
        raise e
