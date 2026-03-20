"""
Learning path CRUD, progress tracking, and time adaptation routes.

Endpoints:
  POST   /learning-paths/draft
  POST   /learning-path/{path_id}/response
  GET    /learning-paths/{username}/draft
  POST   /learning-path/{path_id}/complete
  PATCH  /learning-path/{path_id}/rename
  GET    /learning-paths/{username}
  GET    /learning-path/{path_id}
  POST   /progress
  GET    /progress
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List
import json

import models
from database import get_db
from schemas import (
    UsernameRequest,
    CompleteRequest,
    ResponseCreate,
    DraftOut,
    LearningPathOut,
    ProgressSaveRequest,
    ProgressOut,
    RenameRequest,
)
from utils.helpers import parse_time_available, adapt_to_time, course_links_map, _to_json, _parse_json
from ai.openai_service import generate_learning_recommendation

router = APIRouter(tags=["learning-paths"])


@router.post("/learning-paths/draft")
def create_or_get_draft(data: UsernameRequest, db: Session = Depends(get_db)):

    username = data.username

    draft = db.query(models.LearningPath).filter(
        models.LearningPath.username == username,
        models.LearningPath.status == "draft"
    ).first()

    if draft:
        return {"path_id": draft.id}

    # create user if not exists
    user = db.query(models.User).filter(
        models.User.username == username
    ).first()

    if not user:
        user = models.User(username=username)
        db.add(user)
        db.commit()

    new_draft = models.LearningPath(
        username=username,
        name="Draft Learning Path",
        status="draft"
    )

    db.add(new_draft)
    db.commit()
    db.refresh(new_draft)

    return {"path_id": new_draft.id}


@router.post("/learning-path/{path_id}/response")
def save_response(path_id: str, response: ResponseCreate, db: Session = Depends(get_db)):

    existing = db.query(models.Response).filter(
        models.Response.learning_path_id == path_id,
        models.Response.question_id == response.question_id
    ).first()

    if existing:
        existing.selected_option = response.selected_option
        existing.written_answer = response.written_answer
    else:
        new_response = models.Response(
            learning_path_id=path_id,
            question_id=response.question_id,
            selected_option=response.selected_option,
            written_answer=response.written_answer
        )
        db.add(new_response)

    db.commit()

    return {"message": "Saved"}


@router.get("/learning-paths/{username}/draft", response_model=DraftOut)
def get_draft(username: str, db: Session = Depends(get_db)):

    draft = db.query(models.LearningPath).filter(
        models.LearningPath.username == username,
        models.LearningPath.status == "draft"
    ).first()

    if not draft:
        return {"id": None, "responses": []}

    responses = db.query(models.Response).filter(
        models.Response.learning_path_id == draft.id
    ).all()

    return {
        "id": draft.id,
        "responses": responses
    }


@router.post("/learning-path/{path_id}/complete")
def complete_learning_path(
    path_id: str,
    request: CompleteRequest,
    db: Session = Depends(get_db)
):

    path = db.query(models.LearningPath).filter(
        models.LearningPath.id == path_id
    ).first()

    if not path:
        raise HTTPException(status_code=404, detail="Not found")

    # Get responses
    responses = db.query(models.Response).filter(
        models.Response.learning_path_id == path_id
    ).all()

    if not responses:
        raise HTTPException(status_code=400, detail="No responses found")

    # Save profile info
    path.job_function = request.job_function
    path.experience = request.experience
    path.interests = ",".join(request.interests or [])

    TIME_QUESTION_ID = "question_4"

    time_response = next(
        (r for r in responses if r.question_id == TIME_QUESTION_ID),
        None
    )

    if not time_response or not time_response.selected_option:
        raise HTTPException(
            status_code=400,
            detail="Time availability not provided in responses"
        )

    path.time_available = f"{time_response.selected_option} hours"

    # Map DB question IDs to semantic labels
    question_map = {
        "question_0": "Job Function",
        "question_1": "Experience Level",
        "question_2": "Primary Interest Areas",
        "question_3": "Learning Goals",
        "question_4": "Total Time Available (Hours for 3 Months)"
    }

    profile_data = {
        "Job Function": None,
        "Experience Level": None,
        "Primary Interest Areas": None,
        "Learning Goals": None,
        "Total Time Available (Hours for 3 Months)": None,
        "Additional Details": []
    }

    for r in responses:
        label = question_map.get(r.question_id)

        if r.selected_option and label:
            profile_data[label] = r.selected_option

        if r.written_answer:
            profile_data["Additional Details"].append(r.written_answer)

    answers_text = f"""User Profile:
Job Function: {profile_data["Job Function"]}
Experience Level: {profile_data["Experience Level"]}
Primary Interest Areas: {profile_data["Primary Interest Areas"]}
Learning Goals: {profile_data["Learning Goals"]}
Total Time Available (Next 3 Months): {profile_data["Total Time Available (Hours for 3 Months)"]} hours

Additional Context:
{"; ".join(profile_data["Additional Details"])}
"""

    # 1. Generate AI recommendation
    ai_result = generate_learning_recommendation(
        answers_text,
        path.time_available
    )

    # 2. Parse weekly minutes
    total_budget_minutes = parse_time_available(path.time_available or "")

    # 3. Adapt to user profile
    ai_result = adapt_to_time(
        ai_result,
        total_budget_minutes,
        experience=path.experience,
        interests=" ".join(request.interests or [])
    )

    # Attach course links to each selected path
    for selected_path in ai_result.get("selected_paths", []):
        path_name = selected_path.get("learning_path")
        selected_path["link"] = course_links_map.get(path_name)

    # 4. Save results
    path.recommended_path = "AI Generated Path"
    path.ai_summary = _to_json(ai_result)

    total_submodules = sum(
        len(module["submodules"])
        for selected_path in ai_result.get("selected_paths", [])
        for module in selected_path.get("modules", [])
    )

    path.total_submodules = total_submodules
    path.status = "completed"

    db.commit()

    return {
        "message": "Learning path completed",
        "recommended_path": "AI Generated Path",
        "ai_summary": ai_result
    }


@router.patch("/learning-path/{path_id}/rename")
def rename_learning_path(
    path_id: str,
    data: RenameRequest,
    db: Session = Depends(get_db)
):
    path = db.query(models.LearningPath).filter(
        models.LearningPath.id == path_id
    ).first()

    if not path:
        raise HTTPException(status_code=404, detail="Not found")

    path.name = data.name
    db.commit()

    return {"message": "Renamed", "name": data.name}


@router.get("/learning-paths/{username}", response_model=List[LearningPathOut])
def get_learning_paths(username: str, db: Session = Depends(get_db)):

    paths = db.query(models.LearningPath).filter(
        models.LearningPath.username == username,
        models.LearningPath.status == "completed"
    ).order_by(desc(models.LearningPath.created_at)).all()

    # Deserialize JSON fields
    result = []
    for p in paths:
        result.append(LearningPathOut(
            id=p.id,
            name=p.name,
            created_at=p.created_at,
            job_function=p.job_function,
            experience=p.experience,
            time_available=p.time_available,
            interests=p.interests,
            recommended_path=p.recommended_path,
            ai_summary=_parse_json(p.ai_summary),
            total_submodules=p.total_submodules
        ))
    return result


@router.get("/learning-path/{path_id}", response_model=LearningPathOut)
def get_learning_path_by_id(path_id: str, db: Session = Depends(get_db)):

    path = db.query(models.LearningPath).filter(
        models.LearningPath.id == path_id,
        models.LearningPath.status == "completed"
    ).first()

    if not path:
        raise HTTPException(status_code=404, detail="Learning path not found")

    return LearningPathOut(
        id=path.id,
        name=path.name,
        created_at=path.created_at,
        job_function=path.job_function,
        experience=path.experience,
        time_available=path.time_available,
        interests=path.interests,
        recommended_path=path.recommended_path,
        ai_summary=_parse_json(path.ai_summary),
        total_submodules=path.total_submodules
    )


@router.post("/progress")
def save_progress(data: ProgressSaveRequest, db: Session = Depends(get_db)):

    existing = db.query(models.LearningProgress).filter(
        models.LearningProgress.username == data.username,
        models.LearningProgress.learning_path_id == data.learning_path_id
    ).first()

    if existing:
        existing.progress_json = _to_json(data.progress_json)
        existing.overall_progress = data.overall_progress
    else:
        new_progress = models.LearningProgress(
            username=data.username,
            learning_path_id=data.learning_path_id,
            progress_json=_to_json(data.progress_json),
            overall_progress=data.overall_progress
        )
        db.add(new_progress)

    db.commit()

    return {"message": "Progress saved"}


@router.get("/progress", response_model=ProgressOut)
def get_progress(username: str, learning_path_id: str, db: Session = Depends(get_db)):

    progress = db.query(models.LearningProgress).filter(
        models.LearningProgress.username == username,
        models.LearningProgress.learning_path_id == learning_path_id
    ).first()

    if not progress:
        return {
            "progress_json": {},
            "overall_progress": 0
        }

    return ProgressOut(
        progress_json=_parse_json(progress.progress_json),
        overall_progress=progress.overall_progress
    )
