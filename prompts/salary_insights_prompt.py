def build_salary_insights_prompt(profile: dict) -> str:
    return f"""You are a compensation advisor. Give salary insights for the candidate below.

CANDIDATE PROFILE:
- Target role: {profile.get("target_role", "Not provided")}
- Location: {profile.get("location", "Not provided")}
- Background: {profile.get("background", "Not provided")}
- Experience: {profile.get("experience", "Not provided")}
- Current skills: {profile.get("current_skills", "Not provided")}
- Salary expectations: {profile.get("salary", "Not provided")}

Return your response using exactly these section labels, in this order. Do not add extra sections or change the label names. Do not use em dashes anywhere in the response.

Always give salary figures in pounds sterling using the £ symbol. Never use dollars or the $ symbol, regardless of the candidate's location.

RANGE_JUNIOR:
<typical salary range for a junior-level candidate in this role and location>

RANGE_MID:
<typical salary range for a mid-level candidate in this role and location>

RANGE_SENIOR:
<typical salary range for a senior-level candidate in this role and location>

FACTORS:
<bullet list of 3 to 5 factors that affect salary for this role, e.g. company size, sector, certifications>

NEGOTIATION_TIPS:
<bullet list of 3 to 5 negotiation tips specific to the candidate's background and experience level>
"""
