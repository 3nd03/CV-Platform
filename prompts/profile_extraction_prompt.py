def build_profile_extraction_prompt(cv_text: str) -> str:
    return f"""Extract candidate information from the CV below. Return ONLY a JSON object, no other text, no markdown code fences.

Use exactly these keys: target_role, current_skills, background, experience, tools, location.

- target_role: the most recent or most senior role title on the CV, as a best guess at what they'd target next.
- current_skills: a comma-separated summary of their main technical and professional skills.
- background: a one to two sentence summary of their educational or professional background.
- experience: their years of relevant experience, as a short phrase (e.g. "5 years").
- tools: a comma-separated list of tools, languages, or platforms mentioned.
- location: their location if stated on the CV.

If a value cannot be determined from the CV, use an empty string for that key.

CV CONTENT:
{cv_text}
"""
