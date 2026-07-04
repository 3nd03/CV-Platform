def build_cv_prompt(profile: dict, cv_text: str) -> str:
    return f"""You are an expert CV reviewer. Analyse the CV below for a candidate targeting a role as {profile.get("target_role", "not specified")}.

CANDIDATE PROFILE:
- Target role: {profile.get("target_role", "Not provided")}
- Background: {profile.get("background", "Not provided")}
- Experience: {profile.get("experience", "Not provided")}
- Self-identified gaps: {profile.get("self_gaps", "Not provided")}

CV CONTENT:
{cv_text}

Provide a structured review. Use these exact headings:

**Overall Impression**
3 to 5 bullet points on overall fit and first impression.

**What Works Well**
3 to 5 bullet points on genuine strengths in the CV.

**Weaknesses and Gaps**
3 to 5 bullet points on what is missing, weak, or misaligned with the target role.

**Specific Improvements**
3 to 5 bullet points of concrete, actionable changes the candidate should make.

Write in UK English. Be direct, punchy and actionable. No extended paragraphs, no padding, no generic advice. Every section is bullet points only, capped at 5.
"""
