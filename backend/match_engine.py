"""
Find Me - Match Score & Skill Gap Evaluation Engine
Prioritizes Indian Government, State Government, and active open-deadline listings.
"""

from datetime import datetime, date
from typing import Dict, List, Any

# Standard baseline exchange rates relative to USD
EXCHANGE_RATES = {
    "INR": {"symbol": "₹", "rate": 83.5, "name": "Indian Rupee"},
    "USD": {"symbol": "$", "rate": 1.0, "name": "US Dollar"},
    "EUR": {"symbol": "€", "rate": 0.92, "name": "Euro"},
    "GBP": {"symbol": "£", "rate": 0.79, "name": "British Pound"},
    "CAD": {"symbol": "C$", "rate": 1.36, "name": "Canadian Dollar"},
    "AUD": {"symbol": "A$", "rate": 1.52, "name": "Australian Dollar"},
    "JPY": {"symbol": "¥", "rate": 155.0, "name": "Japanese Yen"},
    "CHF": {"symbol": "CHF", "rate": 0.90, "name": "Swiss Franc"},
    "SGD": {"symbol": "S$", "rate": 1.34, "name": "Singapore Dollar"}
}


def calculate_match_score(profile: Dict[str, Any], internship: Dict[str, Any]) -> Dict[str, Any]:
    """
    Computes a personalized match score (0-100%) based on:
    - Skills match (up to 35 pts)
    - Education level & degree match (up to 25 pts)
    - Government & citizenship eligibility (up to 20 pts + Indian Gov Priority Boost)
    - Location & remote preferences (up to 15 pts)
    - Industry & active deadline freshness (up to 5 pts)
    """
    reasons = []
    
    # 1. Skills Evaluation (0 - 35 pts)
    user_skills = set(s.strip().lower() for s in profile.get("skills", []))
    req_skills = internship.get("required_skills", [])
    pref_skills = internship.get("preferred_skills", [])
    
    matched_skills = []
    missing_skills = []
    
    for s in req_skills:
        if s.lower() in user_skills:
            matched_skills.append(s)
        else:
            missing_skills.append(s)
            
    for s in pref_skills:
        if s.lower() in user_skills and s not in matched_skills:
            matched_skills.append(s)

    total_target_skills = len(req_skills) + (len(pref_skills) * 0.5)
    if total_target_skills > 0:
        skill_ratio = (len([s for s in req_skills if s.lower() in user_skills]) + 
                       (len([s for s in pref_skills if s.lower() in user_skills]) * 0.5)) / total_target_skills
        skills_pts = min(35, round(skill_ratio * 35))
    else:
        skills_pts = 20

    if matched_skills:
        reasons.append(f"Matches {len(matched_skills)} of your skills ({', '.join(matched_skills[:3])}{'...' if len(matched_skills)>3 else ''})")
    elif missing_skills:
        reasons.append(f"Learn core skills via Skill Up: {', '.join(missing_skills[:2])}")

    # 2. Education & Degree (0 - 25 pts)
    user_edu = profile.get("education_level", "Bachelor's")
    user_degree = profile.get("degree", "").lower()
    
    edu_allowed = internship.get("education_level", [])
    degrees_allowed = [d.lower() for d in internship.get("degrees", [])]
    
    edu_pts = 0
    if not edu_allowed or user_edu in edu_allowed:
        edu_pts += 15
        reasons.append(f"Direct fit for your {user_edu} degree")
    else:
        edu_pts += 5

    degree_matched = False
    if "any major" in degrees_allowed or not degrees_allowed:
        edu_pts += 10
        degree_matched = True
    elif user_degree:
        for d in degrees_allowed:
            if d in user_degree or user_degree in d or any(word in d for word in user_degree.split()):
                edu_pts += 10
                degree_matched = True
                break
    
    if not degree_matched and user_degree:
        edu_pts += 3

    # 3. Government & Priority Boost (0 - 20 pts + up to +8 priority bonus)
    eligibility_pts = 0
    gov_elig = internship.get("gov_eligibility", "").lower()
    gov_type = internship.get("gov_type", "Private")
    user_citizenship = profile.get("citizenship", "India").lower()
    user_gov_opt_in = profile.get("eligible_government", True)
    user_countries = [c.lower() for c in profile.get("preferred_countries", [])]
    
    is_indian_user = "india" in user_citizenship or any("india" in c for c in user_countries) or not user_countries

    if gov_type in ["Government of India", "State Government"]:
        if user_gov_opt_in:
            if is_indian_user:
                # Highest priority for Indian government opportunities for Indian users
                eligibility_pts = 20
                if gov_type == "Government of India":
                    reasons.insert(0, "🇮🇳 Premier Government of India opportunity")
                else:
                    reasons.insert(0, "🏛️ State Government public service opportunity")
            elif "all" in gov_elig or "international" in gov_elig:
                eligibility_pts = 18
            else:
                eligibility_pts = 10
        else:
            eligibility_pts = 5
    elif internship.get("sector") == "Government":
        if not user_gov_opt_in:
            eligibility_pts = 5
        elif "all" in gov_elig or "member" in gov_elig or "associate" in gov_elig:
            eligibility_pts = 20
            reasons.append("Eligible international multilateral body")
        elif "us citizen" in gov_elig and ("us" in user_citizenship or "united states" in user_citizenship):
            eligibility_pts = 20
        else:
            eligibility_pts = 8
    else:
        # Private / Nonprofit
        eligibility_pts = 18

    # 4. Location & Remote (0 - 15 pts)
    location_pts = 0
    work_mode = internship.get("work_mode", "Onsite")
    user_pref_remote = profile.get("prefer_remote", False)
    user_pref_countries = [c.lower() for c in profile.get("preferred_countries", [])]
    intern_country = internship.get("country", "").lower()
    
    if work_mode == "Remote":
        location_pts = 15
        if user_pref_remote:
            reasons.append("100% remote work flexibility")
    elif user_pref_remote and work_mode != "Remote":
        location_pts = 6
    else:
        if not user_pref_countries or "any" in user_pref_countries or "global" in user_pref_countries:
            location_pts = 13
        elif intern_country in user_pref_countries:
            location_pts = 15
            reasons.append(f"Located in your preferred country ({internship.get('country')})")
        else:
            location_pts = 7

    # 5. Active Deadline & Freshness (0 - 5 pts)
    deadline_pts = 4
    deadline_str = internship.get("deadline")
    if deadline_str:
        try:
            d_date = datetime.strptime(deadline_str, "%Y-%m-%d").date()
            today = date.today()
            if d_date >= today:
                deadline_pts = 5
                reasons.append("Active open deadline")
            else:
                deadline_pts = 1
        except Exception:
            deadline_pts = 3

    # Aggregate Total
    total_score = min(100, max(15, skills_pts + edu_pts + eligibility_pts + location_pts + deadline_pts))

    # Priority boost for Indian government listings for users looking at India
    if is_indian_user and gov_type in ["Government of India", "State Government"]:
        total_score = min(100, total_score + 5)
    
    # Generate concise why-matched summary
    if len(reasons) >= 2:
        why_matched = f"{total_score}% Match • " + " • ".join(reasons[:3])
    elif reasons:
        why_matched = f"{total_score}% Match • " + reasons[0]
    else:
        why_matched = f"{total_score}% Match based on broad profile alignment."

    return {
        "total_score": total_score,
        "skills_score": skills_pts,
        "education_score": edu_pts,
        "eligibility_score": eligibility_pts,
        "location_score": location_pts,
        "deadline_score": deadline_pts,
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "why_matched": why_matched
    }


def analyze_skill_gap(profile: Dict[str, Any], target_internships: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes overall missing skills frequency across target internships.
    """
    user_skills = set(s.strip().lower() for s in profile.get("skills", []))
    missing_freq: Dict[str, int] = {}
    
    for item in target_internships:
        for s in item.get("required_skills", []):
            if s.lower() not in user_skills:
                missing_freq[s] = missing_freq.get(s, 0) + 2
        for s in item.get("preferred_skills", []):
            if s.lower() not in user_skills:
                missing_freq[s] = missing_freq.get(s, 0) + 1
                
    sorted_missing = sorted(missing_freq.items(), key=lambda x: x[1], reverse=True)
    
    return {
        "top_missing_skills": [item[0] for item in sorted_missing],
        "skill_demand_counts": dict(sorted_missing)
    }
