"""
Find Me Backend - FastAPI Application
Discover verified global internships with highest priority on Indian Government,
State Government, and active open opportunities.
"""

import os
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

from .data_internships import INTERNSHIPS
from .data_courses import COURSES
from .match_engine import calculate_match_score, analyze_skill_gap, EXCHANGE_RATES
from .feed_service import get_all_internships

app = FastAPI(
    title="Find Me API",
    description="Discover verified global internships with top priority on Indian Government and State Government programs.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserProfile(BaseModel):
    name: Optional[str] = "Student"
    education_level: str = "Bachelor's"
    degree: str = "Computer Science"
    graduation_year: int = 2027
    skills: List[str] = Field(default_factory=lambda: ["Python", "Git", "Data Analysis", "SQL"])
    languages: List[str] = Field(default_factory=lambda: ["English", "Hindi"])
    experience_level: str = "No prior experience"
    preferred_countries: List[str] = Field(default_factory=lambda: ["India", "Global Remote"])
    prefer_remote: bool = False
    desired_industries: List[str] = Field(default_factory=lambda: ["Government & Public Policy", "Technology & Software", "Space & Aerospace"])
    citizenship: str = "India"
    eligible_government: bool = True

class MatchRequest(BaseModel):
    profile: UserProfile
    min_score: Optional[int] = 0

class ActionPlanRequest(BaseModel):
    profile: UserProfile
    tracked_ids: List[str] = Field(default_factory=list)


@app.get("/api/internships")
def list_internships(
    search: Optional[str] = None,
    sector: Optional[str] = None,
    gov_type: Optional[str] = None,
    country: Optional[str] = None,
    work_mode: Optional[str] = None,
    industry: Optional[str] = None,
    education_level: Optional[str] = None,
    is_paid: Optional[bool] = None,
    live: Optional[bool] = False
):
    """Retrieve filtered internships worldwide with priority on open deadlines and verified portals."""
    items = get_all_internships(live_fetch=live)
    
    filtered = []
    for item in items:
        # Gov Type (Government of India, State Government, Private, etc.)
        if gov_type and gov_type.lower() != "all":
            if item.get("gov_type", "").lower() != gov_type.lower():
                continue

        if sector and sector.lower() != "all" and item.get("sector", "").lower() != sector.lower():
            continue
        if country and country.lower() != "all" and country.lower() not in item.get("country", "").lower():
            continue
        if work_mode and work_mode.lower() != "all" and item.get("work_mode", "").lower() != work_mode.lower():
            continue
        if industry and industry.lower() != "all" and industry.lower() not in item.get("industry", "").lower():
            continue
        if education_level and education_level.lower() != "all":
            allowed = [e.lower() for e in item.get("education_level", [])]
            if allowed and education_level.lower() not in allowed:
                continue
        if is_paid is not None and item.get("is_paid") != is_paid:
            continue
        if search:
            query = search.lower()
            text_to_search = " ".join([
                item.get("title", ""),
                item.get("organization", ""),
                item.get("city", ""),
                item.get("country", ""),
                item.get("gov_type", ""),
                item.get("industry", ""),
                " ".join(item.get("required_skills", [])),
                " ".join(item.get("preferred_skills", [])),
                item.get("description", "")
            ]).lower()
            if query not in text_to_search:
                continue
        filtered.append(item)
        
    return {"total": len(filtered), "internships": filtered}


@app.get("/api/internships/{internship_id}")
def get_internship_detail(internship_id: str):
    """Get single internship details."""
    for item in INTERNSHIPS:
        if item.get("id") == internship_id:
            return item
    raise HTTPException(status_code=404, detail="Internship listing not found")


@app.post("/api/match")
def match_internships(req: MatchRequest):
    """
    Score and rank internships against user profile.
    Prioritizes Indian Government and State Government programs for Indian users.
    """
    profile_dict = req.profile.model_dump()
    all_items = get_all_internships(live_fetch=False)
    
    scored_items = []
    for item in all_items:
        match_info = calculate_match_score(profile_dict, item)
        if match_info["total_score"] >= (req.min_score or 0):
            item_copy = dict(item)
            item_copy["match"] = match_info
            scored_items.append(item_copy)
            
    # Sort descending by Match Score
    scored_items.sort(key=lambda x: x["match"]["total_score"], reverse=True)
    
    return {
        "profile_summary": {
            "name": req.profile.name,
            "education": f"{req.profile.education_level} in {req.profile.degree}",
            "citizenship": req.profile.citizenship,
            "skills_count": len(req.profile.skills),
            "remote_pref": req.profile.prefer_remote
        },
        "total_matches": len(scored_items),
        "results": scored_items
    }


@app.get("/api/courses")
def list_courses(
    skill: Optional[str] = None,
    level: Optional[str] = None,
    provider: Optional[str] = None
):
    """Retrieve verified free courses from Skill India, SWAYAM, NPTEL, Google, Microsoft, IBM, AWS, etc."""
    filtered = []
    for course in COURSES:
        if skill and skill.lower() != "all" and skill.lower() not in course.get("skill", "").lower():
            continue
        if level and level.lower() != "all" and level.lower() not in course.get("level", "").lower():
            continue
        if provider and provider.lower() != "all" and provider.lower() not in course.get("provider_category", "").lower():
            continue
        filtered.append(course)
        
    return {"total": len(filtered), "courses": filtered}


@app.post("/api/skillup-recommendations")
def get_skillup_recommendations(req: MatchRequest):
    """
    Analyzes missing skills and matches free courses from Skill India, SWAYAM, NPTEL, and global tech leaders.
    """
    profile_dict = req.profile.model_dump()
    all_items = get_all_internships(live_fetch=False)
    
    gap_analysis = analyze_skill_gap(profile_dict, all_items[:10])
    top_missing = gap_analysis["top_missing_skills"]
    
    recommended_courses = []
    seen_course_ids = set()
    
    for missing_skill in top_missing:
        for course in COURSES:
            if course["id"] not in seen_course_ids and course["skill"].lower() == missing_skill.lower():
                recommended_courses.append({
                    **course,
                    "reason": f"Enhances critical skill ({missing_skill}) required by active target internships"
                })
                seen_course_ids.add(course["id"])
                
    if len(recommended_courses) < 6:
        for course in COURSES:
            if course["id"] not in seen_course_ids:
                recommended_courses.append({
                    **course,
                    "reason": f"National or Global Accredited Competency ({course['skill']})"
                })
                seen_course_ids.add(course["id"])
                if len(recommended_courses) >= 8:
                    break
                    
    return {
        "missing_skills": top_missing[:6],
        "recommended_courses": recommended_courses
    }


@app.post("/api/actionplan")
def generate_action_plan(req: ActionPlanRequest):
    """
    Generates personalized action plan:
    1. Priority applications (Indian Government, approaching deadlines, top match scores)
    2. Missing skills to prioritize with Skill India, SWAYAM, and global certifications
    3. Action checklist
    """
    profile_dict = req.profile.model_dump()
    all_items = {item["id"]: item for item in get_all_internships(live_fetch=False)}
    
    if req.tracked_ids:
        target_items = [all_items[t_id] for t_id in req.tracked_ids if t_id in all_items]
    else:
        target_items = list(all_items.values())[:6]
        
    scored = []
    for item in target_items:
        match_info = calculate_match_score(profile_dict, item)
        scored.append({
            "id": item["id"],
            "title": item["title"],
            "organization": item["organization"],
            "sector": item["sector"],
            "gov_type": item.get("gov_type", "Private"),
            "deadline": item["deadline"],
            "application_url": item["application_url"],
            "work_mode": item["work_mode"],
            "match_score": match_info["total_score"],
            "why_matched": match_info["why_matched"],
            "missing_skills": match_info["missing_skills"]
        })
        
    scored.sort(key=lambda x: (x["deadline"], -x["match_score"]))
    
    gap = analyze_skill_gap(profile_dict, target_items)
    priority_skills = gap["top_missing_skills"][:4]
    
    skill_courses = []
    for skill in priority_skills:
        for c in COURSES:
            if c["skill"].lower() == skill.lower():
                skill_courses.append({
                    "skill": skill,
                    "course_title": c["title"],
                    "provider": c["provider"],
                    "duration": c["duration"],
                    "enrollment_url": c["enrollment_url"],
                    "free_details": c["free_details"]
                })
                break

    return {
        "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC"),
        "student_name": req.profile.name,
        "education_summary": f"{req.profile.education_level} in {req.profile.degree} (Graduation: {req.profile.graduation_year})",
        "priority_applications": scored[:4],
        "priority_skills_to_learn": priority_skills,
        "recommended_courses": skill_courses,
        "action_checklist": [
            {"step": 1, "task": "Verify official portal guidelines on NITI Aayog, MeitY, RBI, or host portal before submitting documents.", "status": "pending"},
            {"step": 2, "task": "Prepare formal Bonafide Student Certificate / NOC from college/university for government applications.", "status": "pending"},
            {"step": 3, "task": "Enroll in free accredited skill bridge courses (SWAYAM, Skill India, Google, Microsoft, AWS) to enhance resume credentials.", "status": "pending"},
            {"step": 4, "task": "Submit applications for earliest deadline programs first and track status on Find Me tracker.", "status": "pending"}
        ]
    }


@app.get("/api/currencies")
def get_currencies():
    """Returns supported currencies and exchange rates."""
    return {"base": "INR", "rates": EXCHANGE_RATES}


@app.get("/api/stats")
def get_stats():
    """Provides dashboard statistics."""
    items = INTERNSHIPS
    gov_india_count = sum(1 for i in items if i.get("gov_type") == "Government of India")
    state_gov_count = sum(1 for i in items if i.get("gov_type") == "State Government")
    priv_count = sum(1 for i in items if i.get("sector") == "Private")
    remote_count = sum(1 for i in items if i.get("work_mode") == "Remote")
    
    return {
        "total_internships": len(items),
        "gov_india_count": gov_india_count,
        "state_gov_count": state_gov_count,
        "government_count": gov_india_count + state_gov_count + sum(1 for i in items if i.get("gov_type") == "Government"),
        "private_count": priv_count,
        "remote_count": remote_count,
        "total_free_courses": len(COURSES),
        "last_refresh_time": "08 Sep 2026, 17:30 IST"
    }

frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend"))
if os.path.isdir(frontend_dir):
    app.mount("/static", StaticFiles(directory=frontend_dir), name="static")

    @app.get("/")
    def serve_index():
        return FileResponse(os.path.join(frontend_dir, "index.html"))
