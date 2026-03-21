import os
import json
from typing import Type, TypeVar
from pydantic import BaseModel
import google.generativeai as genai

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
    model_name: str = "gemini-2.5-flash-lite"
) -> T:
    configure_gemini()

    try:
        model = genai.GenerativeModel(
            model_name=model_name,
            generation_config={
                "response_mime_type": "application/json"
            }
        )

        schema_hint = f"""
The output must strictly follow this JSON schema:
{json.dumps(output_model.model_json_schema(), ensure_ascii=False)}
"""

        full_prompt = f"""
[System Role]
{system_role}

[User Prompt]
{user_prompt}

{schema_hint}
"""

        response = model.generate_content(full_prompt)
        content = response.text

        try:
            json_data = json.loads(content)
        except json.JSONDecodeError:
            if "```json" in content:
                content = content.split("```json")[1].split("```")[0].strip()
                json_data = json.loads(content)
            else:
                raise ValueError(f"Gemini output is not valid JSON: {content}")

        validated_data = output_model(**json_data)
        return validated_data

    except Exception as e:
        print(f"Gemini Guardrail Error: {e}")
        raise e