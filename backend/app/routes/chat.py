from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from backend.app.config import settings
from backend.app.services.ai import generate_answer
from backend.app.services.answer_structure import (
    detect_question_type,
)
from backend.app.services.rag import (
    build_academic_context,
    retrieve_questions,
)


router = APIRouter()


class ChatRequest(BaseModel):
    message: str


@router.post("/chat")
def chat(request: ChatRequest):
    question = request.message.strip()

    # ---------------------------------------------------------
    # EMPTY MESSAGE
    # ---------------------------------------------------------

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty.",
        )

    # ---------------------------------------------------------
    # GROQ CONFIGURATION
    # ---------------------------------------------------------

    if not settings.GROQ_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="Groq API key is not configured.",
        )

    # ---------------------------------------------------------
    # QUESTION TYPE
    # ---------------------------------------------------------

    question_type = detect_question_type(
        question
    )

    # ---------------------------------------------------------
    # ACADEMIC RETRIEVAL
    # ---------------------------------------------------------

    try:
        questions = retrieve_questions(
            question
        )

    except Exception as error:
        print(
            "EduViGo RAG error:",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to search academic material.",
        )

    # ---------------------------------------------------------
    # NO ACADEMIC MATERIAL
    # ---------------------------------------------------------

    if not questions:
        return {
            "answer": (
                "I couldn't find this topic in the "
                "EduViGo academic database yet.\n\n"
                "Please try asking a question related to "
                "the study material currently available."
            ),
            "retrieved_questions": 0,
            "question_type": question_type,
        }

    # ---------------------------------------------------------
    # BUILD ACADEMIC CONTEXT
    # ---------------------------------------------------------

    academic_context = build_academic_context(
        questions
    )

    # ---------------------------------------------------------
    # GENERATE AI ANSWER
    # ---------------------------------------------------------

    try:
        answer = generate_answer(
            question=question,
            question_type=question_type,
            academic_context=academic_context,
        )

        return {
            "answer": answer,
            "retrieved_questions": len(questions),
            "question_type": question_type,
        }

    except Exception as error:
        print(
            "EduViGo AI error:",
            error,
        )

        raise HTTPException(
            status_code=500,
            detail="Failed to generate AI response.",
        )