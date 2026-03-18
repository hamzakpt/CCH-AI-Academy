"""
Analytics and ratings routes.

Endpoints:
  GET  /analytics/user/{username}
  GET  /analytics/user/{username}/summary
  GET  /ratings/learning-path/{path_id}
  GET  /ratings/user/{username}
  POST /user-rating
  GET  /user-ratings/{username}
  GET  /analytics/admin
  GET  /analytics/admin/filter-options
  GET  /analytics/admin/growth
  GET  /analytics/admin/engagement
  GET  /analytics/admin/per-user
  GET  /analytics/admin/feedback
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import Optional
from datetime import datetime, timedelta
from collections import defaultdict

import models
from database import get_db
from schemas import UserRatingRequest
from utils.helpers import compute_path_ratings, ADMIN_USERNAMES

router = APIRouter(tags=["analytics"])


# ----------------------------
# Per-User Analytics
# ----------------------------

@router.get("/analytics/user/{username}")
def get_user_analytics(username: str, db: Session = Depends(get_db)):

    sessions = db.query(models.UserSession).filter(
        models.UserSession.username == username
    ).order_by(desc(models.UserSession.login_time)).all()

    result = []

    for session in sessions:

        activities = db.query(models.ScreenActivity).filter(
            models.ScreenActivity.session_id == session.id
        ).all()

        screens = []

        for act in activities:
            screens.append({
                "screen": act.screen_name,
                "enter_time": act.enter_time,
                "exit_time": act.exit_time,
                "duration_seconds": act.duration_seconds
            })

        result.append({
            "session_id": session.id,
            "login_time": session.login_time,
            "logout_time": session.logout_time,
            "screens": screens
        })

    return {
        "username": username,
        "sessions": result
    }


@router.get("/analytics/user/{username}/summary")
def get_user_summary(username: str, db: Session = Depends(get_db)):

    sessions = db.query(models.UserSession).filter(
        models.UserSession.username == username
    ).all()

    total_sessions = len(sessions)

    total_time = 0

    for session in sessions:
        if session.logout_time:
            total_time += (session.logout_time - session.login_time).total_seconds()

    activities = db.query(models.ScreenActivity).filter(
        models.ScreenActivity.username == username
    ).all()

    screen_time = {}

    for act in activities:
        screen_time[act.screen_name] = screen_time.get(act.screen_name, 0) + act.duration_seconds

    return {
        "username": username,
        "total_sessions": total_sessions,
        "total_time_minutes": round(total_time / 60, 1),
        "time_per_screen_seconds": screen_time
    }


# ----------------------------
# Ratings
# ----------------------------

@router.get("/ratings/learning-path/{path_id}")
def get_learning_path_ratings(path_id: int, db: Session = Depends(get_db)):
    """Get per-part average ratings for a single learning path."""
    path = db.query(models.LearningPath).filter(
        models.LearningPath.id == path_id
    ).first()

    if not path:
        raise HTTPException(status_code=404, detail="Learning path not found")

    return compute_path_ratings(path.ai_summary)


@router.get("/ratings/user/{username}")
def get_user_ratings(username: str, db: Session = Depends(get_db)):
    """Get CSV-based average ratings for all of a user's learning paths."""
    paths = db.query(models.LearningPath).filter(
        models.LearningPath.username == username,
        models.LearningPath.status == "completed"
    ).all()

    result = {}
    for lp in paths:
        part_ratings = compute_path_ratings(lp.ai_summary)
        if part_ratings:
            all_ratings = list(part_ratings.values())
            result[str(lp.id)] = round(sum(all_ratings) / len(all_ratings), 1)

    return result


@router.post("/user-rating")
def save_user_rating(data: UserRatingRequest, db: Session = Depends(get_db)):
    """Save or update a user's rating and comment for a learning path."""
    existing = db.query(models.UserRating).filter(
        models.UserRating.username == data.username,
        models.UserRating.learning_path_id == data.learning_path_id
    ).first()

    if existing:
        existing.rating = data.rating
        existing.comment = data.comment
    else:
        new_rating = models.UserRating(
            username=data.username,
            learning_path_id=data.learning_path_id,
            rating=data.rating,
            comment=data.comment
        )
        db.add(new_rating)

    db.commit()
    return {"message": "Rating saved"}


@router.get("/user-ratings/{username}")
def get_all_user_ratings(username: str, db: Session = Depends(get_db)):
    """Get all user-submitted ratings and comments for a user's learning paths."""
    ratings = db.query(models.UserRating).filter(
        models.UserRating.username == username
    ).all()

    result = {}
    for r in ratings:
        result[str(r.learning_path_id)] = {
            "rating": r.rating,
            "comment": r.comment or ""
        }

    return result


# ----------------------------
# Admin Analytics
# ----------------------------

@router.get("/analytics/admin")
def get_admin_analytics(db: Session = Depends(get_db)):
    """Aggregate platform-wide analytics for the admin dashboard."""

    # ── Users ──────────────────────────────────────────────────
    all_users = db.query(models.User).filter(
        ~models.User.username.in_(ADMIN_USERNAMES)
    ).all()
    total_users = len(all_users)

    # ── Sessions ───────────────────────────────────────────────
    all_sessions = db.query(models.UserSession).all()
    total_sessions = len(all_sessions)

    completed_sessions = [s for s in all_sessions if s.logout_time]
    durations = [
        (s.logout_time - s.login_time).total_seconds()
        for s in completed_sessions
    ]
    total_time_seconds = sum(durations)
    avg_session_duration_seconds = (
        round(sum(durations) / len(durations), 1) if durations else 0
    )

    # ── Screen Activity ────────────────────────────────────────
    all_activities = db.query(models.ScreenActivity).all()

    screen_visits: dict = {}
    screen_time: dict = {}

    for act in all_activities:
        screen_visits[act.screen_name] = screen_visits.get(act.screen_name, 0) + 1
        screen_time[act.screen_name] = (
            screen_time.get(act.screen_name, 0) + act.duration_seconds
        )

    # Top 8 screens by visit count
    top_screens = sorted(screen_visits.items(), key=lambda x: x[1], reverse=True)[:8]
    top_screen_time = sorted(screen_time.items(), key=lambda x: x[1], reverse=True)[:8]

    # ── AI Game Usage ──────────────────────────────────────────
    game_screens = {
        "supply-chain": "ai-supply-chain-game",
        "finance": "ai-finance-game",
        "promo": "ai-promo-game",
    }
    ai_game_plays = {
        name: screen_visits.get(screen_id, 0)
        for name, screen_id in game_screens.items()
    }

    # ── Learning Paths ─────────────────────────────────────────
    all_paths = db.query(models.LearningPath).all()
    total_paths_created = len(all_paths)
    total_paths_completed = sum(1 for p in all_paths if p.status == "completed")
    completion_rate = (
        round(total_paths_completed / total_paths_created * 100, 1)
        if total_paths_created > 0
        else 0
    )

    # ── Ratings ────────────────────────────────────────────────
    all_ratings = db.query(models.UserRating).all()
    avg_rating = (
        round(sum(r.rating for r in all_ratings) / len(all_ratings), 2)
        if all_ratings
        else 0
    )

    # ── Per-User Summary ───────────────────────────────────────
    user_summary = []
    for user in all_users:
        user_sessions = [s for s in all_sessions if s.username == user.username]
        u_completed = [s for s in user_sessions if s.logout_time]
        u_total_time = sum(
            (s.logout_time - s.login_time).total_seconds() for s in u_completed
        )
        u_paths = [p for p in all_paths if p.username == user.username and p.status == "completed"]
        u_ratings = [r for r in all_ratings if r.username == user.username]
        u_avg_rating = (
            round(sum(r.rating for r in u_ratings) / len(u_ratings), 2)
            if u_ratings
            else None
        )
        user_summary.append({
            "username": user.username,
            "total_sessions": len(user_sessions),
            "total_time_seconds": round(u_total_time),
            "learning_paths_created": len(u_paths),
            "average_rating": u_avg_rating,
        })

    return {
        "platform_metrics": {
            "total_users": total_users,
            "total_sessions": total_sessions,
            "avg_session_duration_seconds": avg_session_duration_seconds,
            "total_time_seconds": round(total_time_seconds),
        },
        "screen_analytics": {
            "most_visited": [{"screen": s, "visits": v} for s, v in top_screens],
            "time_per_screen": [{"screen": s, "seconds": t} for s, t in top_screen_time],
        },
        "ai_game_analytics": {
            "plays": [{"game": k, "count": v} for k, v in ai_game_plays.items()],
        },
        "learning_analytics": {
            "total_created": total_paths_created,
            "total_completed": total_paths_completed,
            "completion_rate": completion_rate,
        },
        "ratings_analytics": {
            "average_rating": avg_rating,
            "total_ratings": len(all_ratings),
        },
        "users": user_summary,
    }


@router.get("/analytics/admin/filter-options")
def get_filter_options(db: Session = Depends(get_db)):
    """Unique function and level values for filter dropdowns."""
    all_paths = db.query(models.LearningPath).all()
    functions = sorted(set(p.job_function for p in all_paths if p.job_function))
    levels = sorted(set(p.experience for p in all_paths if p.experience))
    return {"functions": functions, "levels": levels}


@router.get("/analytics/admin/growth")
def get_growth_analytics(
    function: Optional[str] = None,
    level: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """User growth analytics — weekly trends, breakdown by function/level."""
    now = datetime.utcnow()

    all_users = db.query(models.User).filter(
        ~models.User.username.in_(ADMIN_USERNAMES)
    ).all()
    all_paths = db.query(models.LearningPath).all()

    user_paths_map = defaultdict(list)
    for path in all_paths:
        user_paths_map[path.username].append(path)

    user_demo = {}
    for username, paths in user_paths_map.items():
        latest = max(paths, key=lambda p: p.id)
        user_demo[username] = {
            "function": latest.job_function or "Unknown",
            "level": latest.experience or "Unknown",
        }

    # Only include users that actually have a learning path
    filtered_users = [
        u for u in all_users
        if u.username in user_demo
    ]

    if function:
        filtered_users = [
            u for u in filtered_users
            if user_demo.get(u.username, {}).get("function") == function
        ]

    if level:
        filtered_users = [
            u for u in filtered_users
            if user_demo.get(u.username, {}).get("level") == level
        ]

    current_week_start = now - timedelta(weeks=1)
    prev_week_start = now - timedelta(weeks=2)
    current_week_users = sum(1 for u in filtered_users if u.created_at >= current_week_start)
    prev_week_users = sum(1 for u in filtered_users if prev_week_start <= u.created_at < current_week_start)
    wow_growth = 0.0
    if prev_week_users > 0:
        wow_growth = round((current_week_users - prev_week_users) / prev_week_users * 100, 1)
    elif current_week_users > 0:
        wow_growth = 100.0

    weeks = []
    for i in range(7, -1, -1):
        ws = now - timedelta(weeks=i + 1)
        we = now - timedelta(weeks=i)
        label_date = (now - timedelta(weeks=i)).strftime("%b %d")
        new_u = sum(1 for u in filtered_users if ws <= u.created_at < we)
        cumul = sum(1 for u in filtered_users if u.created_at < we)
        weeks.append({"week": label_date, "new_users": new_u, "cumulative": cumul})

    func_counts: dict = defaultdict(int)
    level_counts: dict = defaultdict(int)
    for u in filtered_users:
        func_counts[user_demo.get(u.username, {}).get("function", "Unknown")] += 1
        level_counts[user_demo.get(u.username, {}).get("level", "Unknown")] += 1

    return {
        "kpis": {
            "current_week_users": current_week_users,
            "prev_week_users": prev_week_users,
            "new_users_this_week": current_week_users,
            "wow_growth_pct": wow_growth,
            "total_users": len(filtered_users),
        },
        "weekly_trend": weeks,
        "by_function": [{"function": k, "count": v} for k, v in sorted(func_counts.items(), key=lambda x: -x[1])],
        "by_level": [{"level": k, "count": v} for k, v in sorted(level_counts.items(), key=lambda x: -x[1])],
    }


@router.get("/analytics/admin/engagement")
def get_engagement_analytics(
    function: Optional[str] = None,
    level: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """User engagement metrics — WAU, MAU, time per screen, breakdowns."""
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)
    month_ago = now - timedelta(days=30)

    all_users = db.query(models.User).filter(
        ~models.User.username.in_(ADMIN_USERNAMES)
    ).all()
    all_paths = db.query(models.LearningPath).all()
    all_sessions = db.query(models.UserSession).all()
    all_activities = db.query(models.ScreenActivity).all()

    user_paths_map = defaultdict(list)
    for path in all_paths:
        user_paths_map[path.username].append(path)

    user_demo = {}
    for username, paths in user_paths_map.items():
        latest = max(paths, key=lambda p: p.id)
        user_demo[username] = {
            "function": latest.job_function or "Unknown",
            "level": latest.experience or "Unknown",
        }

    filtered_usernames = {
        u.username
        for u in all_users
        if u.username in user_demo
    }

    if function:
        filtered_usernames = {
            u for u in filtered_usernames
            if user_demo.get(u, {}).get("function") == function
        }

        if level:
            filtered_usernames = {
                u for u in filtered_usernames
                if user_demo.get(u, {}).get("level") == level
            }

    wau_names = {s.username for s in all_sessions if s.login_time >= week_ago and s.username in filtered_usernames}
    mau_names = {s.username for s in all_sessions if s.login_time >= month_ago and s.username in filtered_usernames}

    week_acts = [a for a in all_activities if a.username in wau_names and a.enter_time >= week_ago and a.duration_seconds > 0]
    total_week_time = sum(a.duration_seconds for a in week_acts)
    avg_weekly_time = round(total_week_time / len(wau_names) / 60, 1) if wau_names else 0

    screen_time: dict = defaultdict(int)
    for a in all_activities:
        if a.username in filtered_usernames and a.duration_seconds > 0:
            screen_time[a.screen_name] += a.duration_seconds

    func_active: dict = defaultdict(int)
    level_active: dict = defaultdict(int)
    for name in wau_names:
        d = user_demo.get(name, {})
        func_active[d.get("function", "Unknown")] += 1
        level_active[d.get("level", "Unknown")] += 1

    func_time: dict = defaultdict(int)
    func_users_set: dict = defaultdict(set)
    level_time: dict = defaultdict(int)
    level_users_set: dict = defaultdict(set)
    for a in week_acts:
        d = user_demo.get(a.username, {})
        f = d.get("function", "Unknown")
        lv = d.get("level", "Unknown")
        func_time[f] += a.duration_seconds
        func_users_set[f].add(a.username)
        level_time[lv] += a.duration_seconds
        level_users_set[lv].add(a.username)

    top_screens = sorted(screen_time.items(), key=lambda x: -x[1])[:10]

    return {
        "kpis": {"wau": len(wau_names), "mau": len(mau_names), "avg_weekly_time_minutes": avg_weekly_time},
        "time_per_screen": [{"screen": s, "minutes": round(t / 60, 1)} for s, t in top_screens],
        "active_by_function": [{"function": k, "count": v} for k, v in sorted(func_active.items(), key=lambda x: -x[1])],
        "active_by_level": [{"level": k, "count": v} for k, v in sorted(level_active.items(), key=lambda x: -x[1])],
        "avg_time_by_function": sorted(
            [{"function": k, "avg_minutes": round(func_time[k] / len(func_users_set[k]) / 60, 1)} for k in func_time],
            key=lambda x: -x["avg_minutes"],
        ),
        "avg_time_by_level": sorted(
            [{"level": k, "avg_minutes": round(level_time[k] / len(level_users_set[k]) / 60, 1)} for k in level_time],
            key=lambda x: -x["avg_minutes"],
        ),
    }


@router.get("/analytics/admin/per-user")
def get_per_user_analytics(
    function: Optional[str] = None,
    level: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Per-user detailed analytics table and aggregations."""
    now = datetime.utcnow()
    week_ago = now - timedelta(days=7)

    all_users = db.query(models.User).filter(
        ~models.User.username.in_(ADMIN_USERNAMES)
    ).all()
    all_paths = db.query(models.LearningPath).all()
    all_sessions = db.query(models.UserSession).all()
    all_activities = db.query(models.ScreenActivity).all()

    user_paths_map = defaultdict(list)
    for path in all_paths:
        user_paths_map[path.username].append(path)

    user_demo = {}
    for username, paths in user_paths_map.items():
        latest = max(paths, key=lambda p: p.id)
        time_str = latest.time_available or ""
        digits = "".join(filter(str.isdigit, time_str))
        planned_h = int(digits) if digits else 0
        user_demo[username] = {
            "function": latest.job_function or "Unknown",
            "level": latest.experience or "Unknown",
            "planned_hours": planned_h,
        }

    # Only include users that actually have a learning path
    filtered_users = [
        u for u in all_users
        if u.username in user_demo
    ]

    if function:
        filtered_users = [
            u for u in filtered_users
            if user_demo.get(u.username, {}).get("function") == function
        ]

    if level:
        filtered_users = [
            u for u in filtered_users
            if user_demo.get(u.username, {}).get("level") == level
        ]

    sessions_map = defaultdict(list)
    for s in all_sessions:
        sessions_map[s.username].append(s)

    acts_map = defaultdict(list)
    for a in all_activities:
        if a.duration_seconds > 0:
            acts_map[a.username].append(a)

    users_data = []
    for user in filtered_users:
        u_sessions = sessions_map[user.username]
        u_acts = acts_map[user.username]
        total_time_min = round(sum(a.duration_seconds for a in u_acts) / 60, 1)
        weekly_time_min = round(sum(a.duration_seconds for a in u_acts if a.enter_time >= week_ago) / 60, 1)
        total_logins = len(u_sessions)
        weekly_logins = sum(1 for s in u_sessions if s.login_time >= week_ago)
        d = user_demo.get(user.username, {})
        users_data.append({
            "username": user.username,
            "function": d.get("function", "Unknown"),
            "level": d.get("level", "Unknown"),
            "total_time_minutes": total_time_min,
            "weekly_avg_minutes": weekly_time_min,
            "total_logins": total_logins,
            "weekly_logins": weekly_logins,
            "planned_hours_per_week": d.get("planned_hours", 0),
            "created_at": user.created_at.isoformat(),
        })

    func_groups: dict = defaultdict(list)
    level_groups: dict = defaultdict(list)
    for u in users_data:
        if u["function"] != "Unknown":
            func_groups[u["function"]].append(u)
        if u["level"] != "Unknown":
            level_groups[u["level"]].append(u)

    def avg_group(groups, key_name):
        result = []
        for k, g in groups.items():
            result.append({
                key_name: k,
                "avg_total_time": round(sum(u["total_time_minutes"] for u in g) / len(g), 1),
                "avg_weekly_time": round(sum(u["weekly_avg_minutes"] for u in g) / len(g), 1),
                "avg_logins": round(sum(u["total_logins"] for u in g) / len(g), 1),
            })
        return sorted(result, key=lambda x: -x["avg_total_time"])

    planned_vs_actual = [
        {
            "username": u["username"].replace("@cchellenic.com", ""),
            "planned_minutes": u["planned_hours_per_week"] * 60,
            "actual_minutes": u["weekly_avg_minutes"],
        }
        for u in users_data if u["planned_hours_per_week"] > 0
    ][:20]

    return {
        "users": users_data,
        "avg_by_function": avg_group(func_groups, "function"),
        "avg_by_level": avg_group(level_groups, "level"),
        "planned_vs_actual": planned_vs_actual,
    }


@router.get("/analytics/admin/feedback")
def get_feedback_analytics(
    function: Optional[str] = None,
    level: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Ratings and feedback analytics."""
    all_ratings = db.query(models.UserRating).all()
    all_paths = db.query(models.LearningPath).all()
    all_users = db.query(models.User).filter(
        ~models.User.username.in_(ADMIN_USERNAMES)
    ).all()

    user_paths_map = defaultdict(list)
    for path in all_paths:
        user_paths_map[path.username].append(path)

    user_demo = {}
    for username, paths in user_paths_map.items():
        latest = max(paths, key=lambda p: p.id)
        user_demo[username] = {
            "function": latest.job_function or "Unknown",
            "level": latest.experience or "Unknown",
        }

    if function or level:
        ok_names = set()
        for u in all_users:
            d = user_demo.get(u.username, {})
            if function and d.get("function") != function:
                continue
            if level and d.get("level") != level:
                continue
            ok_names.add(u.username)
        all_ratings = [r for r in all_ratings if r.username in ok_names]

    path_map = {p.id: p for p in all_paths}
    path_ratings: dict = defaultdict(list)
    for r in all_ratings:
        p = path_map.get(r.learning_path_id)
        if p:
            name = p.recommended_path or p.name or f"Path {r.learning_path_id}"
            path_ratings[name].append(r.rating)

    rated = sorted(
        [{"name": k, "avg_rating": round(sum(v) / len(v), 2), "count": len(v)} for k, v in path_ratings.items()],
        key=lambda x: -x["avg_rating"],
    )

    func_ratings: dict = defaultdict(list)
    level_ratings: dict = defaultdict(list)
    for r in all_ratings:
        d = user_demo.get(r.username, {})
        func_ratings[d.get("function", "Unknown")].append(r.rating)
        level_ratings[d.get("level", "Unknown")].append(r.rating)

    comments = [r.comment for r in all_ratings if r.comment]
    game_mentions: dict = defaultdict(int)
    for c in comments:
        cl = c.lower()
        if "supply" in cl: game_mentions["Supply Chain"] += 1
        if "finance" in cl or "financial" in cl: game_mentions["Finance"] += 1
        if "promo" in cl or "promotion" in cl: game_mentions["Promo"] += 1

    return {
        "highest_rated": rated[:5],
        "lowest_rated": list(reversed(rated))[:5],
        "feedback_by_function": sorted(
            [{"function": k, "avg_rating": round(sum(v)/len(v), 2), "count": len(v)} for k, v in func_ratings.items()],
            key=lambda x: -x["avg_rating"],
        ),
        "feedback_by_level": sorted(
            [{"level": k, "avg_rating": round(sum(v)/len(v), 2), "count": len(v)} for k, v in level_ratings.items()],
            key=lambda x: -x["avg_rating"],
        ),
        "game_mentions": [{"game": k, "mentions": v} for k, v in sorted(game_mentions.items(), key=lambda x: -x[1])],
        "total_ratings": len(all_ratings),
        "overall_avg_rating": round(sum(r.rating for r in all_ratings) / len(all_ratings), 2) if all_ratings else 0,
        "comments": comments[-20:],
    }
