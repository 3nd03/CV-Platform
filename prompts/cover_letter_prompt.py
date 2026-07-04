def build_cover_letter_prompt(profile: dict, job_description: str) -> str:
    return f"""You are an expert career writer. Write a tailored, professional cover letter in UK English for the candidate below.

CANDIDATE PROFILE:
- Target role: {profile.get("target_role", "Not provided")}
- Current skills: {profile.get("current_skills", "Not provided")}
- Background: {profile.get("background", "Not provided")}
- Experience: {profile.get("experience", "Not provided")}
- Tools and platforms: {profile.get("tools", "Not provided")}
- Timeline: {profile.get("timeline", "Not provided")}

JOB DESCRIPTION:
{job_description}

Instructions:
- Write a complete cover letter ready to send. No section labels, no placeholders, no commentary.
- Open with a strong, specific first paragraph that references the role and employer from the job description.
- Reference the candidate's actual skills, background, and experience where relevant.
- Address specific requirements or keywords from the job description directly.
- Keep the tone professional but natural. Avoid generic phrases and corporate clichés.
- Three to four paragraphs. Concise and targeted.
- Close with a clear call to action.
- Use UK English spelling throughout.
"""
