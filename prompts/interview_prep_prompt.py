def build_interview_prep_prompt(profile: dict, missing_skills: str = "") -> str:
    gap_context = f"\nKNOWN SKILL GAPS:\n{missing_skills}\n" if missing_skills else ""

    return f"""You are an interview coach. Prepare the candidate below for interviews targeting their chosen role.

CANDIDATE PROFILE:
- Target role: {profile.get("target_role", "Not provided")}
- Current skills: {profile.get("current_skills", "Not provided")}
- Background: {profile.get("background", "Not provided")}
- Experience: {profile.get("experience", "Not provided")}
- Self-identified gaps: {profile.get("self_gaps", "Not provided")}
{gap_context}
Return exactly 5 interview questions specific to the target role, weighted towards probing the candidate's weaker areas above. For each question, give a one-line pointer on what a strong answer should cover.

Use this exact format, numbered 1 to 5:

1. <question>
   Strong answer covers: <one-line pointer>

Do not include an introduction, summary, or any text outside the numbered list. Do not use em dashes anywhere in the response.
"""
