"""
Authentication and activity logging routes.

Endpoints:
  POST /session/start   — Create a new user session
  POST /session/end     — Close an existing session
  POST /activity/log    — Log a screen visit with duration
"""
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session
from datetime import datetime

import models
from database import get_db
from schemas import SessionStartRequest, ActivityLogRequest

router = APIRouter(tags=["auth"])


@router.post("/session/start")
def start_session(data: SessionStartRequest, db: Session = Depends(get_db)):

    # Ensure user exists
    user = db.query(models.User).filter(
        models.User.username == data.username
    ).first()

    if not user:
        user = models.User(username=data.username)
        db.add(user)
        db.commit()

    session = models.UserSession(username=data.username)
    db.add(session)
    db.commit()
    db.refresh(session)

    return {
        "session_id": session.id,
        "login_time": session.login_time
    }


@router.post("/session/end")
async def end_session(request: Request, db: Session = Depends(get_db)):
    data = await request.json()
    session_id = data.get("session_id")

    session = db.query(models.UserSession).filter(
        models.UserSession.id == session_id
    ).first()

    if session:
        session.logout_time = datetime.utcnow()
        db.commit()

    return {"message": "Session closed"}


@router.post("/activity/log")
def log_activity(data: ActivityLogRequest, db: Session = Depends(get_db)):

    activity = models.ScreenActivity(
        username=data.username,
        session_id=data.session_id,
        screen_name=data.screen_name,
        enter_time=data.enter_time,
        exit_time=data.exit_time,
        duration_seconds=data.duration_seconds
    )

    db.add(activity)
    db.commit()

    return {"message": "Activity logged"}
