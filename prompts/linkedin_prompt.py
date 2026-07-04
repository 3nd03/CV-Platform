def build_linkedin_prompt(profile: dict, context: str = "") -> str:
    target_context = f"\nOUTREACH CONTEXT:\n{context}\n" if context else ""

    return f"""You are an expert career networker. Write a short, cold LinkedIn outreach message in UK English for the candidate below.

CANDIDATE PROFILE:
- Target role: {profile.get("target_role", "Not provided")}
- Current skills: {profile.get("current_skills", "Not provided")}
- Background: {profile.get("background", "Not provided")}
- Experience: {profile.get("experience", "Not provided")}
{target_context}
Instructions:
- Write a complete message ready to send. No section labels, no placeholders, no commentary.
- Maximum 3 short paragraphs, under 150 words total. LinkedIn connection notes get read on a phone.
- Open with a specific, genuine reason for reaching out. No generic flattery.
- Reference the candidate's actual background or skills only where it strengthens the ask.
- End with one clear, low-friction ask, such as a short call or a question.
- Natural, direct tone. No corporate clichés, no emojis.
- Use UK English spelling throughout.
"""
