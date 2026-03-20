from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

from database import get_db
from utils.helpers import _to_json, _parse_json
import models

router = APIRouter(prefix="/scenarios", tags=["scenarios"])

# ----------------------------
# Pydantic Models
# ----------------------------

class HITLActionContent(BaseModel):
    title: str
    sections: List[Dict[str, Any]]


class AgentStepSchema(BaseModel):
    id: str
    title: str
    description: str
    tools: List[str]
    dataUsed: List[str]
    successCriteria: str
    requiresHITL: bool
    hitlMessage: Optional[str] = None
    hitlActionContent: Optional[HITLActionContent] = None
    duration: int  # seconds


class ScenarioBenefits(BaseModel):
    timeSaved: str
    impactMetric: str


class ScenarioCreate(BaseModel):
    id: str
    title: str
    function: str  # Commercial, Supply Chain, Finance, HR, Legal, IT & Marketing, Other
    description: str
    problem: str
    icon: str  # Icon name (e.g., 'ShieldCheck', 'AlertTriangle')
    difficulty: str  # Beginner, Intermediate, Advanced
    estimatedTime: str
    oldWayTime: Optional[str] = None
    oldWaySteps: Optional[List[str]] = None
    steps: List[AgentStepSchema]
    benefits: ScenarioBenefits
    learningModules: List[str]
    flagship: Optional[bool] = False
    active: Optional[bool] = False
    hidden: Optional[bool] = False


class ScenarioOut(BaseModel):
    id: str
    title: str
    function: str
    description: str
    problem: str
    icon: str
    difficulty: str
    estimatedTime: str
    oldWayTime: Optional[str] = None
    oldWaySteps: Optional[List[str]] = None
    steps: List[Dict[str, Any]]
    benefits: Dict[str, str]
    learningModules: List[str]
    flagship: bool = False
    active: bool = False
    hidden: bool = False


# ----------------------------
# Rating Pydantic Models
# ----------------------------

class RatingCreate(BaseModel):
    scenarioId: str
    username: str
    rating: int  # 1-5
    comment: Optional[str] = None


class RatingOut(BaseModel):
    id: str  # UUID string
    scenarioId: str
    username: str
    rating: int
    comment: Optional[str] = None
    createdAt: str


class RatingSummary(BaseModel):
    scenarioId: str
    averageRating: float
    totalRatings: int
    ratings: List[RatingOut]


class AllRatingsSummary(BaseModel):
    ratings: Dict[str, RatingSummary]


# ----------------------------
# Suggestion Pydantic Models
# ----------------------------

class SuggestionCreate(BaseModel):
    username: str
    suggestion: str


class SuggestionOut(BaseModel):
    id: str  # UUID string
    username: str
    suggestion: str
    status: str
    adminNotes: Optional[str] = None
    createdAt: str
    updatedAt: str


class SuggestionUpdate(BaseModel):
    status: Optional[str] = None  # pending, reviewed, implemented, rejected
    adminNotes: Optional[str] = None


class SuggestionListOut(BaseModel):
    suggestions: List[SuggestionOut]
    total: int


# ----------------------------
# Helper Functions
# ----------------------------

def _scenario_to_out(scenario: models.Scenario) -> ScenarioOut:
    """Convert a Scenario ORM object to ScenarioOut Pydantic model."""
    return ScenarioOut(
        id=scenario.id,
        title=scenario.title,
        function=scenario.function,
        description=scenario.description,
        problem=scenario.problem,
        icon=scenario.icon,
        difficulty=scenario.difficulty,
        estimatedTime=scenario.estimated_time,
        oldWayTime=scenario.old_way_time,
        oldWaySteps=_parse_json(scenario.old_way_steps),
        steps=_parse_json(scenario.steps),
        benefits=_parse_json(scenario.benefits),
        learningModules=_parse_json(scenario.learning_modules),
        flagship=bool(scenario.flagship),
        active=bool(scenario.active),
        hidden=bool(scenario.hidden)
    )


# ----------------------------
# Endpoints
# ----------------------------

@router.get("", response_model=List[ScenarioOut])
def get_scenarios(db: Session = Depends(get_db)):
    """Get all scenarios."""
    scenarios = db.query(models.Scenario).all()
    return [_scenario_to_out(s) for s in scenarios]


# ----------------------------
# Rating Endpoints (must be before /{scenario_id} to avoid route conflicts)
# ----------------------------

@router.get("/ratings", response_model=AllRatingsSummary)
def get_all_ratings(db: Session = Depends(get_db)):
    """Get rating summaries for all scenarios."""
    from sqlalchemy import func

    # Get all ratings grouped by scenario
    ratings_data = db.query(
        models.ScenarioRating.scenario_id,
        func.avg(models.ScenarioRating.rating).label('avg_rating'),
        func.count(models.ScenarioRating.id).label('total')
    ).group_by(models.ScenarioRating.scenario_id).all()

    # Build summary dict
    summaries: Dict[str, RatingSummary] = {}

    for scenario_id, avg_rating, total in ratings_data:
        # Get individual ratings for this scenario
        ratings = db.query(models.ScenarioRating).filter(
            models.ScenarioRating.scenario_id == scenario_id
        ).order_by(models.ScenarioRating.created_at.desc()).all()

        summaries[scenario_id] = RatingSummary(
            scenarioId=scenario_id,
            averageRating=round(float(avg_rating), 1),
            totalRatings=total,
            ratings=[
                RatingOut(
                    id=r.id,
                    scenarioId=r.scenario_id,
                    username=r.username,
                    rating=r.rating,
                    comment=r.comment,
                    createdAt=r.created_at.isoformat()
                )
                for r in ratings
            ]
        )

    return AllRatingsSummary(ratings=summaries)


@router.post("/ratings", response_model=RatingOut)
def submit_rating(data: RatingCreate, db: Session = Depends(get_db)):
    """Submit a rating for a scenario."""
    # Verify scenario exists
    scenario = db.query(models.Scenario).filter(models.Scenario.id == data.scenarioId).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    # Validate rating is 1-5
    if data.rating < 1 or data.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be between 1 and 5")

    # Create rating
    rating = models.ScenarioRating(
        scenario_id=data.scenarioId,
        username=data.username,
        rating=data.rating,
        comment=data.comment
    )
    db.add(rating)
    db.commit()
    db.refresh(rating)

    return RatingOut(
        id=rating.id,
        scenarioId=rating.scenario_id,
        username=rating.username,
        rating=rating.rating,
        comment=rating.comment,
        createdAt=rating.created_at.isoformat()
    )


@router.get("/ratings/{scenario_id}", response_model=RatingSummary)
def get_scenario_ratings(scenario_id: str, db: Session = Depends(get_db)):
    """Get all ratings for a specific scenario."""
    # Verify scenario exists
    scenario = db.query(models.Scenario).filter(models.Scenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    # Get all ratings for this scenario
    ratings = db.query(models.ScenarioRating).filter(
        models.ScenarioRating.scenario_id == scenario_id
    ).order_by(models.ScenarioRating.created_at.desc()).all()

    # Calculate average
    total_ratings = len(ratings)
    average_rating = sum(r.rating for r in ratings) / total_ratings if total_ratings > 0 else 0

    return RatingSummary(
        scenarioId=scenario_id,
        averageRating=round(average_rating, 1),
        totalRatings=total_ratings,
        ratings=[
            RatingOut(
                id=r.id,
                scenarioId=r.scenario_id,
                username=r.username,
                rating=r.rating,
                comment=r.comment,
                createdAt=r.created_at.isoformat()
            )
            for r in ratings
        ]
    )


# ----------------------------
# Suggestion Endpoints
# ----------------------------

@router.post("/suggestions", response_model=SuggestionOut)
def submit_suggestion(data: SuggestionCreate, db: Session = Depends(get_db)):
    """Submit a new scenario suggestion."""
    if len(data.suggestion.strip()) < 20:
        raise HTTPException(status_code=400, detail="Suggestion must be at least 20 characters")

    suggestion = models.ScenarioSuggestion(
        username=data.username,
        suggestion=data.suggestion.strip(),
        status="pending"
    )
    db.add(suggestion)
    db.commit()
    db.refresh(suggestion)

    return SuggestionOut(
        id=suggestion.id,
        username=suggestion.username,
        suggestion=suggestion.suggestion,
        status=suggestion.status,
        adminNotes=suggestion.admin_notes,
        createdAt=suggestion.created_at.isoformat(),
        updatedAt=suggestion.updated_at.isoformat()
    )


@router.get("/suggestions", response_model=SuggestionListOut)
def get_suggestions(
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all suggestions (admin endpoint)."""
    query = db.query(models.ScenarioSuggestion)

    if status:
        query = query.filter(models.ScenarioSuggestion.status == status)

    suggestions = query.order_by(models.ScenarioSuggestion.created_at.desc()).all()

    return SuggestionListOut(
        suggestions=[
            SuggestionOut(
                id=s.id,
                username=s.username,
                suggestion=s.suggestion,
                status=s.status,
                adminNotes=s.admin_notes,
                createdAt=s.created_at.isoformat(),
                updatedAt=s.updated_at.isoformat()
            )
            for s in suggestions
        ],
        total=len(suggestions)
    )


@router.put("/suggestions/{suggestion_id}", response_model=SuggestionOut)
def update_suggestion(
    suggestion_id: str,
    data: SuggestionUpdate,
    db: Session = Depends(get_db)
):
    """Update a suggestion status and admin notes (admin endpoint)."""
    suggestion = db.query(models.ScenarioSuggestion).filter(
        models.ScenarioSuggestion.id == suggestion_id
    ).first()

    if not suggestion:
        raise HTTPException(status_code=404, detail="Suggestion not found")

    if data.status is not None:
        valid_statuses = ["pending", "reviewed", "implemented", "rejected"]
        if data.status not in valid_statuses:
            raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")
        suggestion.status = data.status

    if data.adminNotes is not None:
        suggestion.admin_notes = data.adminNotes

    db.commit()
    db.refresh(suggestion)

    return SuggestionOut(
        id=suggestion.id,
        username=suggestion.username,
        suggestion=suggestion.suggestion,
        status=suggestion.status,
        adminNotes=suggestion.admin_notes,
        createdAt=suggestion.created_at.isoformat(),
        updatedAt=suggestion.updated_at.isoformat()
    )


@router.delete("/suggestions/{suggestion_id}")
def delete_suggestion(
    suggestion_id: str,
    db: Session = Depends(get_db)
):
    """Delete a suggestion (admin endpoint)."""
    suggestion = db.query(models.ScenarioSuggestion).filter(
        models.ScenarioSuggestion.id == suggestion_id
    ).first()

    if not suggestion:
        raise HTTPException(status_code=404, detail="Suggestion not found")

    db.delete(suggestion)
    db.commit()
    return {"message": "Suggestion deleted successfully"}


# ----------------------------
# Scenario CRUD Endpoints
# ----------------------------

@router.get("/{scenario_id}", response_model=ScenarioOut)
def get_scenario(scenario_id: str, db: Session = Depends(get_db)):
    """Get a specific scenario by ID."""
    scenario = db.query(models.Scenario).filter(models.Scenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")
    return _scenario_to_out(scenario)


@router.post("", response_model=ScenarioOut)
def create_scenario(
    data: ScenarioCreate,
    db: Session = Depends(get_db)
):
    """Create a new scenario (admin only)."""
    # Check if scenario with this ID already exists
    existing = db.query(models.Scenario).filter(models.Scenario.id == data.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Scenario with this ID already exists")

    scenario = models.Scenario(
        id=data.id,
        title=data.title,
        function=data.function,
        description=data.description,
        problem=data.problem,
        icon=data.icon,
        difficulty=data.difficulty,
        estimated_time=data.estimatedTime,
        old_way_time=data.oldWayTime,
        old_way_steps=_to_json(data.oldWaySteps),
        steps=_to_json([step.model_dump() for step in data.steps]),
        benefits=_to_json(data.benefits.model_dump()),
        learning_modules=_to_json(data.learningModules),
        flagship=1 if data.flagship else 0,
        active=1 if data.active else 0,
        hidden=1 if data.hidden else 0
    )
    db.add(scenario)
    db.commit()
    db.refresh(scenario)
    return _scenario_to_out(scenario)


@router.put("/{scenario_id}", response_model=ScenarioOut)
def update_scenario(
    scenario_id: str,
    data: ScenarioCreate,
    db: Session = Depends(get_db)
):
    """Update an existing scenario (admin only)."""
    scenario = db.query(models.Scenario).filter(models.Scenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    scenario.title = data.title
    scenario.function = data.function
    scenario.description = data.description
    scenario.problem = data.problem
    scenario.icon = data.icon
    scenario.difficulty = data.difficulty
    scenario.estimated_time = data.estimatedTime
    scenario.old_way_time = data.oldWayTime
    scenario.old_way_steps = _to_json(data.oldWaySteps)
    scenario.steps = _to_json([step.model_dump() for step in data.steps])
    scenario.benefits = _to_json(data.benefits.model_dump())
    scenario.learning_modules = _to_json(data.learningModules)
    scenario.flagship = 1 if data.flagship else 0
    scenario.active = 1 if data.active else 0
    scenario.hidden = 1 if data.hidden else 0

    db.commit()
    db.refresh(scenario)
    return _scenario_to_out(scenario)


@router.delete("/{scenario_id}")
def delete_scenario(
    scenario_id: str,
    db: Session = Depends(get_db)
):
    """Delete a scenario (admin only)."""
    scenario = db.query(models.Scenario).filter(models.Scenario.id == scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    db.delete(scenario)
    db.commit()
    return {"message": "Scenario deleted successfully"}


@router.post("/seed")
def seed_scenarios(db: Session = Depends(get_db)):
    """Seed the database with default scenarios."""
    # Default scenarios data
    default_scenarios = [
        {
            "id": "commercial-4",
            "title": "Promo Compliance Check",
            "function": "Commercial",
            "description": "Experience manual price checking, then watch AI do it in seconds.",
            "problem": "You need to audit 150 SKUs across retailer websites vs JBP agreements.",
            "icon": "ShieldCheck",
            "difficulty": "Intermediate",
            "estimated_time": "3 min",
            "old_way_time": "45-60 min",
            "old_way_steps": [
                "Check promo calendar",
                "List participating retailers",
                "Visit each retailer website manually",
                "Navigate to beverage section",
                "Screenshot prices",
                "Compare to contracted price",
                "Track in spreadsheet",
                "Draft compliance emails"
            ],
            "steps": [
                {
                    "id": "step-1",
                    "title": "Identify Active Promotions",
                    "description": "Pull current promos and participating retailers",
                    "tools": ["Promo Management"],
                    "dataUsed": ["Active promotions", "Retailer contracts"],
                    "successCriteria": "\"Buy 2 Get $2 Off\" on Coke 12pk, 24 retailers, runs through month-end",
                    "requiresHITL": False,
                    "duration": 3
                },
                {
                    "id": "step-2",
                    "title": "Scrape Retailer Websites",
                    "description": "Check online prices across all retailers",
                    "tools": ["Web Scraping Engine"],
                    "dataUsed": ["Retailer sites", "Product SKUs"],
                    "successCriteria": "24 checked: 20 compliant, 4 showing full price",
                    "requiresHITL": False,
                    "duration": 7
                },
                {
                    "id": "step-3",
                    "title": "Flag Non-Compliance",
                    "description": "Generate report and alert retailers",
                    "tools": ["Compliance Reporter"],
                    "dataUsed": ["Scraping results", "Contacts"],
                    "successCriteria": "4 violations: FoodMax (2 stores), QuickShop, ValueMart",
                    "requiresHITL": True,
                    "hitlMessage": "4 retailers not honoring the promotion. Review violations before sending alerts.",
                    "hitlActionContent": {
                        "title": "Promo Compliance Violations",
                        "sections": [
                            {"heading": "Promo", "content": "Buy 2 Get $2 Off Coke 12pk - Mar 15-31 - 24 retailers - 83% compliance"},
                            {"heading": "Violations", "bullets": ["FoodMax #4289: $7.99 (should be $6.99)", "FoodMax #4312: $7.99 (should be $6.99)", "QuickShop: $8.49 (should be $7.49)", "ValueMart: $7.79 (should be $6.79)"]},
                            {"heading": "Impact", "content": "$8,400 lost promotional volume over remaining 9 days"}
                        ]
                    },
                    "duration": 4
                }
            ],
            "benefits": {"timeSaved": "42-57 min", "impactMetric": "24 retailers checked - $8.4K leak found"},
            "learning_modules": ["Web Scraping", "Compliance Monitoring"],
            "flagship": 1,
            "active": 1,
            "hidden": 0
        },
        {
            "id": "supply-chain-1",
            "title": "Supplier Risk Detection",
            "function": "Supply Chain",
            "description": "Detect supplier disruptions instantly and activate backup sourcing.",
            "problem": "Major supplier factory disaster detected in global news - need to secure capacity before competitors react.",
            "icon": "AlertTriangle",
            "difficulty": "Intermediate",
            "estimated_time": "3 min",
            "old_way_time": "4 hours",
            "old_way_steps": [
                "Monitor global news manually",
                "Search for supplier names in news articles",
                "Open and read each article",
                "Check supplier database for affected facilities",
                "Verify impact on production capacity",
                "Contact suppliers individually",
                "Search for backup supplier options",
                "Negotiate emergency sourcing",
                "Update risk dashboard"
            ],
            "steps": [
                {
                    "id": "step-1",
                    "title": "Auto-Detect Disruption",
                    "description": "AI monitors global news and maps to supplier database",
                    "tools": ["Global News Monitor", "Supplier Database"],
                    "dataUsed": ["News feeds", "Supplier locations", "Facility data"],
                    "successCriteria": "Tier 1 supplier factory explosion detected in Romania, production at risk",
                    "requiresHITL": False,
                    "duration": 2
                },
                {
                    "id": "step-2",
                    "title": "Assess Impact & Options",
                    "description": "Calculate capacity gap and identify backup suppliers",
                    "tools": ["Capacity Planner", "Supplier Network"],
                    "dataUsed": ["Production volumes", "Alternative suppliers", "Lead times"],
                    "successCriteria": "40% capacity at risk, 3 backup suppliers identified",
                    "requiresHITL": False,
                    "duration": 5
                },
                {
                    "id": "step-3",
                    "title": "Activate Proactive Sourcing",
                    "description": "Secure backup capacity before competitors",
                    "tools": ["Sourcing Agent", "Contract System"],
                    "dataUsed": ["Supplier contracts", "Pricing", "Availability"],
                    "successCriteria": "Backup supplier contracted within 72 seconds of alert",
                    "requiresHITL": True,
                    "hitlMessage": "Major supplier disruption detected. Review backup sourcing plan before activation.",
                    "hitlActionContent": {
                        "title": "Supplier Risk Alert",
                        "sections": [
                            {"heading": "Disruption", "content": "Glass factory explosion - Romania - Tier 1 Supplier A - 40% capacity at risk"},
                            {"heading": "Recommended Action", "bullets": ["Activate Backup Supplier B (Czech Republic)", "Secure 50K units/month capacity", "Lock pricing at current rates"]},
                            {"heading": "Advantage", "content": "Proactive sourcing before competitors react - 5.2K margin protected - 12% cost advantage secured"}
                        ]
                    },
                    "duration": 3
                }
            ],
            "benefits": {"timeSaved": "3 hours 57 min", "impactMetric": "Instant detection - Proactive sourcing - 5.2K margin protected"},
            "learning_modules": ["Risk Monitoring", "Supplier Intelligence"],
            "flagship": 1,
            "active": 1,
            "hidden": 0
        },
        {
            "id": "finance-1",
            "title": "Month-End Accrual Drafting",
            "function": "Finance",
            "description": "Stop chasing emails. Auto-detect unbilled work and draft accruals instantly.",
            "problem": "Month-end close requires chasing 20 department heads via email to identify unbilled POs and ongoing projects.",
            "icon": "DollarSign",
            "difficulty": "Intermediate",
            "estimated_time": "3 min",
            "old_way_time": "24 hours",
            "old_way_steps": [
                "Email all 20 department heads",
                "Ask about unbilled work and ongoing projects",
                "Chase non-responders multiple times",
                "Request detailed PO information",
                "Manually compile responses in spreadsheet",
                "Calculate accrual amounts",
                "Draft journal entries",
                "Gather supporting documentation",
                "Submit for CFO approval"
            ],
            "steps": [
                {
                    "id": "step-1",
                    "title": "Scan Open POs & Projects",
                    "description": "AI analyzes all open purchase orders and project timelines",
                    "tools": ["ERP Integration", "Project Management API"],
                    "dataUsed": ["Open POs", "Delivery confirmations", "Project milestones"],
                    "successCriteria": "120 open POs scanned, 15 projects analyzed, unbilled work detected",
                    "requiresHITL": False,
                    "duration": 2
                },
                {
                    "id": "step-2",
                    "title": "Identify Unbilled Work",
                    "description": "Cross-reference deliveries and progress against invoices",
                    "tools": ["Accrual Detection Engine", "Invoice Matching"],
                    "dataUsed": ["Delivery logs", "GPS tracking", "Invoice register"],
                    "successCriteria": "18 accrual entries identified totaling 248,300 unbilled",
                    "requiresHITL": False,
                    "duration": 3
                },
                {
                    "id": "step-3",
                    "title": "Draft Accrual Entries",
                    "description": "Auto-generate journal entries with supporting evidence",
                    "tools": ["Journal Entry Generator", "Documentation Attachment"],
                    "dataUsed": ["PO details", "Evidence documents", "Account mappings"],
                    "successCriteria": "Complete journal entries with evidence ready for review",
                    "requiresHITL": True,
                    "hitlMessage": "Found 248,300 in unbilled work across 18 entries. Review draft accruals before posting.",
                    "hitlActionContent": {
                        "title": "Month-End Accruals Ready",
                        "sections": [
                            {"heading": "Detection Summary", "content": "120 POs analyzed - 15 projects reviewed - 18 accrual entries drafted - 248,300 total"},
                            {"heading": "Top 3 Accruals", "bullets": ["Logistics Q1: 45,000 (GPS logs confirm delivery, no invoice)", "Marketing Digital: 23,500 (Agency work 80% complete)", "IT Infrastructure: 67,200 (SaaS active, Feb invoice missing)"]},
                            {"heading": "Time Saved", "content": "Zero emails sent - 24 hours saved - 100% coverage vs manual sampling"}
                        ]
                    },
                    "duration": 4
                }
            ],
            "benefits": {"timeSaved": "23 hours 51 min", "impactMetric": "Close time: 5 days to 2 days - Zero email chasing"},
            "learning_modules": ["Accrual Automation", "Month-End Close"],
            "flagship": 1,
            "active": 1,
            "hidden": 0
        },
        {
            "id": "hr-1",
            "title": "Performance Review Calibration",
            "function": "HR",
            "description": "Detect bias and scoring inconsistencies automatically across all performance reviews.",
            "problem": "Q4 performance calibration requires manually reviewing 12 reviews for bias patterns and scoring consistency.",
            "icon": "Users",
            "difficulty": "Intermediate",
            "estimated_time": "3 min",
            "old_way_time": "8 hours",
            "old_way_steps": [
                "Open each PDF review individually",
                "Read manager comments line by line",
                "Manually highlight subjective language",
                "Track gendered adjectives in spreadsheet",
                "Compare scores to department averages",
                "Calculate scoring deviations",
                "Document bias patterns",
                "Draft calibration meeting notes",
                "Schedule follow-up with managers"
            ],
            "steps": [
                {
                    "id": "step-1",
                    "title": "Analyze All Reviews",
                    "description": "AI scans 12 performance reviews for language patterns and scoring",
                    "tools": ["NLP Engine", "Bias Detection Algorithm"],
                    "dataUsed": ["Performance reviews", "Historical scoring data", "Department averages"],
                    "successCriteria": "12 reviews analyzed, 2 critical anomalies detected in 1 second",
                    "requiresHITL": False,
                    "duration": 2
                },
                {
                    "id": "step-2",
                    "title": "Flag Scoring Anomalies",
                    "description": "Identify managers with systematic over/under-scoring patterns",
                    "tools": ["Statistical Analysis", "Scoring Consistency Checker"],
                    "dataUsed": ["Manager scoring history", "Peer benchmarks", "Role comparisons"],
                    "successCriteria": "Manager Martinez scores 1.2 points lower than department average",
                    "requiresHITL": False,
                    "duration": 3
                },
                {
                    "id": "step-3",
                    "title": "Surface Bias Patterns",
                    "description": "Detect gendered language and subjective adjectives automatically",
                    "tools": ["Bias Pattern Analyzer", "Word Cloud Generator"],
                    "dataUsed": ["Review text", "Gender data", "Language policy guidelines"],
                    "successCriteria": "Manager Martinez uses gendered adjectives in 67% of female vs 20% of male reviews",
                    "requiresHITL": True,
                    "hitlMessage": "Critical bias patterns detected. Review findings and approve recommended actions.",
                    "hitlActionContent": {
                        "title": "Performance Calibration Insights",
                        "sections": [
                            {"heading": "Analysis Summary", "content": "12 reviews analyzed - 2 critical anomalies identified - Manager Martinez flagged"},
                            {"heading": "Anomaly 1: Hard Grader", "bullets": ["Manager Martinez avg: 2.3/5", "Department avg: 3.5/5", "Deviation: -1.2 points", "Action: Schedule calibration discussion"]},
                            {"heading": "Anomaly 2: Bias Language", "bullets": ["Female reviews: 67% contain gendered language (supportive, emotional, needs to smile)", "Male reviews: 20% contain gendered language (technical leader, ambitious)", "Action: Flag for rewrite per company policy"]}
                        ]
                    },
                    "duration": 4
                }
            ],
            "benefits": {"timeSaved": "7 hours 51 min", "impactMetric": "Time: 8 hours to 15 min - 100% coverage - Objective bias detection"},
            "learning_modules": ["Bias Detection", "Performance Analytics"],
            "flagship": 1,
            "active": 1,
            "hidden": 0
        },
        {
            "id": "legal-1",
            "title": "Clause Risk Extraction",
            "function": "Other",
            "description": "Extract risky clauses from 60-page contracts instantly vs. hours of manual review.",
            "problem": "You need to review a 60-page vendor agreement to identify liability and indemnity risks before signing.",
            "icon": "Scale",
            "difficulty": "Intermediate",
            "estimated_time": "3 min",
            "old_way_time": "4.5 hours",
            "old_way_steps": [
                "Open 60-page PDF contract",
                "Read each page line by line",
                "Manually highlight risk clauses",
                "Copy-paste clauses into risk spreadsheet",
                "Look up company policy playbook",
                "Compare clauses against standards",
                "Calculate liability exposure",
                "Draft redline recommendations",
                "Email to General Counsel for review"
            ],
            "steps": [
                {
                    "id": "step-1",
                    "title": "Scan Contract Document",
                    "description": "AI reads and parses 60-page vendor agreement",
                    "tools": ["Document Parser", "Contract Intelligence"],
                    "dataUsed": ["Contract PDF", "Company playbook", "Risk taxonomy"],
                    "successCriteria": "60 pages scanned, 147 clauses extracted, 3 high-risk flagged",
                    "requiresHITL": False,
                    "duration": 2
                },
                {
                    "id": "step-2",
                    "title": "Compare Against Playbook",
                    "description": "Check extracted clauses vs Standard Global Indemnity Playbook",
                    "tools": ["Policy Comparison Engine", "Risk Calculator"],
                    "dataUsed": ["Extracted clauses", "Company standards", "Liability thresholds"],
                    "successCriteria": "Section 18.3 offers Unlimited Liability - deviates from $50K cap standard",
                    "requiresHITL": False,
                    "duration": 3
                },
                {
                    "id": "step-3",
                    "title": "Generate Risk Report",
                    "description": "Draft findings with recommended counter-clauses",
                    "tools": ["Risk Reporter", "Clause Library"],
                    "dataUsed": ["Risk findings", "Standard clauses", "Redline templates"],
                    "successCriteria": "3 high-risk clauses identified with standard counter-language ready",
                    "requiresHITL": True,
                    "hitlMessage": "3 risky clauses extracted. Review findings and approve standard counter-language insertion.",
                    "hitlActionContent": {
                        "title": "Contract Risk Analysis Complete",
                        "sections": [
                            {"heading": "Document Analyzed", "content": "Vendor Agreement v4.2 - 60 pages - 147 clauses extracted - 3 high-risk deviations"},
                            {"heading": "Risk Clauses", "bullets": ["Section 18.3 Indemnification: Unlimited Liability (Std: $50K cap)", "Section 22.1 Termination: 90-day notice (Std: 30-day)", "Section 9.4 Data Rights: Perpetual vendor access (Std: Term-limited)"]},
                            {"heading": "Recommended Action", "content": "Insert Mutual Indemnity clause with $50K cap - Add 30-day termination clause - Limit data rights to contract term"}
                        ]
                    },
                    "duration": 4
                }
            ],
            "benefits": {"timeSaved": "4 hours 21 min", "impactMetric": "Review time: 4.5 hrs to 45 sec - 100% clause coverage - Risk-aligned"},
            "learning_modules": ["Contract Intelligence", "Risk Extraction"],
            "flagship": 1,
            "active": 1,
            "hidden": 0
        }
    ]

    created_count = 0
    skipped_count = 0

    for scenario_data in default_scenarios:
        existing = db.query(models.Scenario).filter(models.Scenario.id == scenario_data["id"]).first()
        if existing:
            skipped_count += 1
            continue

        scenario = models.Scenario(
            id=scenario_data["id"],
            title=scenario_data["title"],
            function=scenario_data["function"],
            description=scenario_data["description"],
            problem=scenario_data["problem"],
            icon=scenario_data["icon"],
            difficulty=scenario_data["difficulty"],
            estimated_time=scenario_data["estimated_time"],
            old_way_time=scenario_data.get("old_way_time"),
            old_way_steps=_to_json(scenario_data.get("old_way_steps")),
            steps=_to_json(scenario_data["steps"]),
            benefits=_to_json(scenario_data["benefits"]),
            learning_modules=_to_json(scenario_data["learning_modules"]),
            flagship=scenario_data.get("flagship", 0),
            active=scenario_data.get("active", 0),
            hidden=scenario_data.get("hidden", 0)
        )
        db.add(scenario)
        created_count += 1

    db.commit()
    return {"message": f"Seeded {created_count} scenarios, skipped {skipped_count} existing"}
