"""
Pydantic request/response models (schemas) for all DIAI Academy API endpoints.
"""
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime


# ----------------------------
# Learning Path Schemas
# ----------------------------

class ResponseCreate(BaseModel):
    question_id: str
    selected_option: Optional[str] = None
    written_answer: Optional[str] = None


class LearningPathOut(BaseModel):
    id: str  # UUID string
    name: str
    created_at: Optional[datetime]
    job_function: Optional[str]
    experience: Optional[str]
    time_available: Optional[str]
    interests: Optional[str]
    recommended_path: Optional[str]
    ai_summary: Optional[Dict[str, Any]]
    total_submodules: Optional[int]

    class Config:
        orm_mode = True


class DraftOut(BaseModel):
    id: Optional[str]  # UUID string, optional for when no draft exists
    responses: List[ResponseCreate]

    class Config:
        orm_mode = True


class UsernameRequest(BaseModel):
    username: str


class CompleteRequest(BaseModel):
    job_function: Optional[str]
    experience: Optional[str]
    interests: Optional[List[str]] = None
    goals: Optional[List[str]] = None


class RenameRequest(BaseModel):
    name: str


# ----------------------------
# Progress Schemas
# ----------------------------

class ProgressSaveRequest(BaseModel):
    username: str
    learning_path_id: str  # UUID string
    progress_json: Dict[str, bool]
    overall_progress: int


class ProgressOut(BaseModel):
    progress_json: Dict[str, bool]
    overall_progress: int

    class Config:
        orm_mode = True


# ----------------------------
# Session & Activity Schemas
# ----------------------------

class SessionStartRequest(BaseModel):
    username: str


class SessionEndRequest(BaseModel):
    session_id: str  # UUID string


class ActivityLogRequest(BaseModel):
    username: str
    session_id: str  # UUID string
    screen_name: str
    enter_time: datetime
    exit_time: datetime
    duration_seconds: int


# ----------------------------
# Ratings Schemas
# ----------------------------

class UserRatingRequest(BaseModel):
    username: str
    learning_path_id: str  # UUID string
    rating: float  # 1.0 - 5.0
    comment: Optional[str] = None


# ----------------------------
# Hellen+ Chat Schemas
# ----------------------------

class HellenHistoryMessage(BaseModel):
    role: str   # "user" or "assistant"
    content: str


class HellenChatRequest(BaseModel):
    module_name: str
    submodule_names: List[str]
    message: str
    history: Optional[List[HellenHistoryMessage]] = None


class HellenPracticeRequest(BaseModel):
    module_name: str
    submodule_names: List[str]
    user_response: Optional[str] = None   # None triggers the session-opening question
    history: Optional[List[HellenHistoryMessage]] = None


class HellenSourceOut(BaseModel):
    submodule: str
    timestamp: str
    snippet: str


class HellenChatResponse(BaseModel):
    response: str
    sources: List[HellenSourceOut]


# ----------------------------
# Guided Hellen+ Schema
# ----------------------------

class GuidedHellenRequest(BaseModel):
    topic: str
    subtopic: str
    answers: List[str]
    step: int
