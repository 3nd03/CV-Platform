import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routers import auth, profile, tools

load_dotenv()

app = FastAPI(title="Careerly API")

DEV_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002",
    "http://localhost:5173",
]

allowed_origins = list(DEV_ORIGINS)
frontend_url = os.getenv("FRONTEND_URL")
if frontend_url and frontend_url not in allowed_origins:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(tools.router)


@app.get("/health")
def health():
    return {"status": "ok"}
