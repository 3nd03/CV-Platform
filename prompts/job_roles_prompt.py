def build_job_roles_prompt(profile: dict, missing_skills: str = "") -> str:
    gap_context = f"\nKNOWN SKILL GAPS:\n{missing_skills}\n" if missing_skills else ""

    return f"""You are a career advisor. Recommend job roles for the candidate below, split into what they can target now and what they could target in six months with focused effort.

CANDIDATE PROFILE:
- Target role: {profile.get("target_role", "Not provided")}
- Current skills: {profile.get("current_skills", "Not provided")}
- Background: {profile.get("background", "Not provided")}
- Experience: {profile.get("experience", "Not provided")}
- Tools and platforms: {profile.get("tools", "Not provided")}
- Self-identified gaps: {profile.get("self_gaps", "Not provided")}
{gap_context}
Return your response using exactly these section labels, in this order. Do not add extra sections or change the label names.

CURRENT_ROLES:
<numbered list of exactly 3 job titles the candidate could realistically apply for now, each followed by a one-line reason>

FUTURE_ROLES:
<numbered list of exactly 3 job titles the candidate could target in six months with focused upskilling, each followed by a one-line reason>
"""
