from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq

from backend.app.config import settings
from backend.app.routes.chat import router as chat_router
from backend.app.database.database import supabase


app = FastAPI(title="EduViGo API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://edu-vi-ogw6vypec-vishwanathpatil.vercel.app",
        "https://edu-vi-go.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(chat_router)


@app.get("/")
def root():
    return {
        "message": "EduViGo API is running",
        "groq_configured": bool(settings.GROQ_API_KEY),
        "supabase_configured": bool(
            settings.SUPABASE_URL
        ),
        "service_role_configured": bool(
            settings.SUPABASE_SERVICE_ROLE_KEY
        ),
    }


@app.get("/test-groq")
def test_groq():
    client = Groq(api_key=settings.GROQ_API_KEY)

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "user",
                "content": "Reply with exactly: EduViGo AI is working",
            }
        ],
        temperature=0,
    )

    return {
        "message": response.choices[0].message.content
    }


@app.get("/test-supabase")
def test_supabase():
    response = (
        supabase
        .table("subjects")
        .select("id")
        .limit(1)
        .execute()
    )

    return {
        "supabase_connected": True,
        "rows_found": len(response.data),
    }