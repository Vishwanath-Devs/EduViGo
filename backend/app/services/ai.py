import json

from groq import Groq

from backend.app.config import settings
from backend.app.services.answer_structure import (
    get_json_schema_instruction,
    get_structure,
    render_answer,
)


def generate_answer(
    question: str,
    question_type: str,
    academic_context: str,
) -> str:

    structure = get_structure(question_type)

    schema_instruction = get_json_schema_instruction(
        question_type
    )

    system_prompt = (
        "You are EduViGo, an academic assistant for university students.\n\n"

        "IMPORTANT SOURCE RULE:\n"
        "The supplied ACADEMIC CONTEXT comes from the EduViGo academic database.\n"
        "You must use that context as the ONLY knowledge source for the answer.\n"
        "Do not add facts from your own general knowledge.\n"
        "Do not invent examples, definitions, explanations, statistics, "
        "technical details, or claims that are not supported by the academic context.\n"
        "You may rewrite, simplify, organize, and combine information from the "
        "academic context so that it becomes a clear university exam answer.\n"
        "If the academic context does not contain enough information for a requested "
        "part of the answer, leave that part out instead of inventing information.\n\n"

        "ANSWER STRUCTURE RULES:\n"
        "The backend has already classified the question.\n"
        "The backend also controls the final answer structure.\n"
        "Do not invent additional sections.\n"
        "Return JSON only.\n\n"

        f"QUESTION TYPE: {question_type}\n\n"

        "ALLOWED STRUCTURE:\n"
        f"{structure['sections']}\n\n"

        "REQUIRED FIELDS:\n"
        f"{structure['required']}\n\n"

        "OPTIONAL FIELDS:\n"
        f"{structure['optional']}\n\n"

        f"{schema_instruction}\n\n"

        "ACADEMIC ANSWER RULES:\n"
        "1. Answer the exact question asked.\n"
        "2. Use only the supplied academic context.\n"
        "3. Do not use outside knowledge.\n"
        "4. Do not invent missing information.\n"
        "5. Do not add unrelated information.\n"
        "6. Do not repeat the same idea unnecessarily.\n"
        "7. Preserve important academic facts from the database.\n"
        "8. You may simplify wording for students.\n"
        "9. For an 8-10 mark answer, provide sufficient detail only when "
        "that detail exists in the academic context.\n"
        "10. Keep definitions focused on definitions.\n"
        "11. Keep working questions focused on working.\n"
        "12. Keep comparison questions focused on comparison.\n"
        "13. Keep programming questions focused on programming.\n"
        "14. Use simple, clear university-exam language.\n\n"

        "ACADEMIC CONTEXT:\n"
        f"{academic_context}"
    )

    client = Groq(
        api_key=settings.GROQ_API_KEY
    )

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": question,
            },
        ],
        temperature=0,
        response_format={
            "type": "json_object",
        },
    )

    raw_answer = response.choices[0].message.content

    if not raw_answer:
        raise ValueError(
            "Groq returned an empty response."
        )

    try:
        data = json.loads(raw_answer)

    except json.JSONDecodeError as error:
        raise ValueError(
            "Groq returned invalid JSON."
        ) from error

    return render_answer(
        question=question,
        question_type=question_type,
        data=data,
    )