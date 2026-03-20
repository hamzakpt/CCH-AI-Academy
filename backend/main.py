import os
from dotenv import load_dotenv

# Load .env BEFORE any other imports that use env vars
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine
import models
from core import state
from services import transcript_service, embedding_service
from routes import auth_routes, learning_path_routes, analytics_routes, hellen_routes, scenarios

# ----------------------------
# DB table creation
# ----------------------------
models.Base.metadata.create_all(bind=engine)

# ----------------------------
# App init
# ----------------------------
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://learning-path-tau.vercel.app",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:8080",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# Routers
# ----------------------------
app.include_router(auth_routes.router)
app.include_router(learning_path_routes.router)
app.include_router(analytics_routes.router)
app.include_router(hellen_routes.router)
app.include_router(scenarios.router)


@app.get("/")
def home():
    return {"status": "ok"}


# ----------------------------
# Startup: load transcripts + embeddings → populate core.state
# ----------------------------
_DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
TRANSCRIPT_FILE = os.path.join(_DATA_DIR, "Video transcripts and Quizzes.txt")
EMBEDDING_CACHE_FILE = os.path.join(_DATA_DIR, "transcript_embeddings.json")

_transcript_data_raw = transcript_service.parse_transcripts_with_timestamps(TRANSCRIPT_FILE)
state.transcript_data.update(_transcript_data_raw)

_submodule_chunks = transcript_service.build_submodule_chunks(_transcript_data_raw)
state.submodule_chunks_map.update(_submodule_chunks)

_quiz_data = transcript_service.parse_quiz_by_topic(TRANSCRIPT_FILE)
state.quiz_by_topic.update(_quiz_data)

print(f"[Hellen+] Loaded quiz blocks for {len(state.quiz_by_topic)} topics: {list(state.quiz_by_topic.keys())}")
print(f"[Hellen+] Loaded transcripts for {len(state.transcript_data)} submodules")
print(f"[Hellen+] Total chunks: {sum(len(v) for v in state.submodule_chunks_map.values())}")

_embedded = embedding_service.load_or_generate(
    state.submodule_chunks_map,
    EMBEDDING_CACHE_FILE,
    TRANSCRIPT_FILE
)
state.embedded_chunks_map.update(_embedded)
