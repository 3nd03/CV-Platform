def build_career_roadmap_prompt(profile: dict, skill_gap_result: dict = None) -> str:
    skill_gap_result = skill_gap_result or {}
    return f"""You are a career advisor. Build a step-by-step career roadmap for the candidate below.

CANDIDATE PROFILE:
- Target role: {profile.get("target_role", "Not provided")}
- Current skills: {profile.get("current_skills", "Not provided")}
- Background: {profile.get("background", "Not provided")}
- Experience: {profile.get("experience", "Not provided")}
- Tools and platforms: {profile.get("tools", "Not provided")}
- Timeline: {profile.get("timeline", "Not provided")}
- Self-identified gaps: {profile.get("self_gaps", "Not provided")}

SKILL GAP ANALYSIS (if available):
- Missing skills: {skill_gap_result.get("MISSING_SKILLS", "Not available")}
- Next steps: {skill_gap_result.get("NEXT_STEPS", "Not available")}

Return your response using exactly these section labels, in this order. Do not add extra sections or change the label names. Do not use em dashes anywhere in the response.

WHERE_NOW:
<2 to 3 sentences on the candidate's current position relative to their target role>

THREE_MONTH:
<bullet list of 3 to 5 concrete milestones to reach in the next 3 months>

SIX_MONTH:
<bullet list of 3 to 5 concrete milestones to reach in the next 6 months>

ONE_YEAR:
<bullet list of 3 to 5 concrete milestones describing where the candidate should be in 1 year>
"""
