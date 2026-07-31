def build_cv_download_prompt(cv_text: str) -> str:
    return f"""You are an expert CV writer. Rewrite the CV below into a clean, ATS-friendly format.

CV CONTENT:
{cv_text}

Rules:
- Plain text only. No markdown, no asterisks, no tables, no special characters.
- Use clear section headings in capital letters (e.g. SUMMARY, EXPERIENCE, EDUCATION, SKILLS).
- Use simple hyphens for bullet points.
- Keep the candidate's real information. Do not invent experience, dates, or qualifications.
- Standard, readable structure that an applicant tracking system can parse cleanly.
- Write in UK English.

Return only the rewritten CV, nothing else.
"""
