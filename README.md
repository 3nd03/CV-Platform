# CV Platform

An AI-powered CV and career platform built for a charity hackathon. Users go through a short onboarding chat and land on a personal dashboard with tools for skill gap analysis, CV review, cover letters, job role suggestions, LinkedIn outreach, and interview prep.

## Features

- **Onboarding chatbot**: 10 questions covering target role, skills, background, experience, and goals. Every other tool uses the profile this builds.
- **Dashboard**: profile summary, skill gap score, and links to all tools in one place.
- **Skill gap analysis**: match score against the target role, what the user already has, what they are missing, and concrete next steps.
- **CV analyser**: upload a PDF CV (text extracted with PyPDF2) for a structured review covering overall impression, strengths, weaknesses, and specific rewrite suggestions.
- **Cover letter generator**: takes the user profile and a pasted job description and produces a tailored cover letter.
- **Job role suggestions**: three roles to go for now, three to aim for in six months.
- **LinkedIn message generator**: short cold outreach message built from the user profile, with an optional context field for who they are messaging.
- **Interview prep**: five role-specific questions weighted towards the user's known skill gaps.

## Setup

Requires Python 3.10+ and an Anthropic API key.

```
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
pip install -e .
```

`pip install -e .` is required on every machine. It makes the absolute imports (`from app...`, `from services...`) work correctly.

Copy `.env.example` to `.env` and add your key:

```
ANTHROPIC_API_KEY=your_key_here
```

## Running the app

```
streamlit run app/main.py
```

## Project structure

```
app/
  main.py              Entry point, routing via st.session_state.page
  chatbot.py           Onboarding flow
  dashboard.py         Profile summary, skill gap score, tool links
  skill_gap.py         Skill gap analysis
  cv_analyser.py       CV scoring and rewrite suggestions
  cover_letter.py      Cover letter generator
  job_roles.py         Job role suggestions
  linkedin_message.py  LinkedIn outreach message
  interview_prep.py    Interview question prep

services/
  claude_client.py     Single call_claude(prompt, system=""): all API calls go here
  s3_client.py         AWS S3 storage (not yet wired in)

database/
  db_client.py         RDS Postgres (not yet wired in)

prompts/
  skill_gap_prompt.py
  cv_prompt.py
  cover_letter_prompt.py
  job_roles_prompt.py
  linkedin_prompt.py
  interview_prep_prompt.py

utils/
  helpers.py           Shared profile rendering and navigation helpers
```

## Architecture

- All API calls go through `services/claude_client.py`. Nothing else touches the API directly.
- `call_claude` initialises the client inside the function on every call rather than at module level, so a rotated API key is always picked up without restarting the app.
- Absolute imports work throughout via the editable install in `pyproject.toml`. No `sys.path` workarounds.
- Page state and tool results are cached in `st.session_state`. Switching pages never triggers a repeat API call.
- AWS (S3, RDS, Lambda) plugs into `services/s3_client.py` and `database/db_client.py` and is owned by a separate teammate.

## Known limitations

- Profiles and results only last for the current session. AWS persistence is not wired in yet.
