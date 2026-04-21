from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import create_db_and_tables
from app.routes import auth, problems, submissions, hints, practice, history, chatbot, dashboard_router, pdf_router, screen_routes
from app.routes.user_router import router as user_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("🚀 Starting AI Learning Assistant Backend...")
    create_db_and_tables()
    print("✅ Database tables verified/created")

    yield
    print("🛑 Shutting down backend...")


app = FastAPI(
    title="Adaptive AI Learning Assistant",
    version="1.0.0",
    description="Adaptive AI-Based Hint Generation and Learning Assistant System",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(problems.router, prefix="/problems", tags=["Problems"])
app.include_router(submissions.router, prefix="/submissions", tags=["Submissions"])
app.include_router(hints.router, prefix="/hints", tags=["Hints"])
app.include_router(practice.router, prefix="/practice", tags=["Practice"])
app.include_router(history.router, prefix="/history", tags=["History"])
app.include_router(chatbot.router, prefix="/chatbot", tags=["Chatbot"])
app.include_router(dashboard_router.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(pdf_router.router, prefix="/pdf", tags=["PDF Learning"])
app.include_router(screen_routes.router, prefix="/screen", tags=["Screen Parsing"])
app.include_router(user_router)

@app.get("/")
async def root():
    return {
        "status": "success",
        "message": "AI Learning Assistant Backend Running 🚀"
    }


