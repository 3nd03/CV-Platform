def build_cv_translator_prompt(cv_text: str, target_language: str) -> str:
    return f"""You are a professional CV translator. Translate the CV below into {target_language}.

CV CONTENT:
{cv_text}

Rules:
- Translate the full CV, including section headings.
- Preserve the original structure and formatting, section by section.
- Keep a professional, natural tone appropriate for a CV in {target_language}.
- Do not translate proper nouns such as company names, unless there is a standard translated form.
- Plain text only. No markdown, no asterisks.

Return only the translated CV, nothing else.
"""
