# CV Platform

An AI-powered CV and career platform built for a charity hackathon. Users complete a short onboarding chat, then get a personalised dashboard with tools for skill gap analysis, CV review, cover letters, job role suggestions, LinkedIn outreach, and interview prep.

## Features

- **Onboarding chatbot** — 10 questions covering target role, skills, background, experience, and goals. Builds a profile used by every other tool.
- **Dashboard** — profile summary, skill gap score, and quick links to all tools.
- **Skill gap analysis** — match score against the target role, strong skills, missing skills, and next steps.
- **CV analyser** — upload a CV as a PDF (text extracted with PyPDF2) for a structured review: overall impression, strengths, weaknesses, and specific rewrite suggestions.
- **Cover letter generator** — tailored cover letter from the user profile and a pasted job description.
- **Job role suggestions** — three roles to target now, three to target in six months.
- **LinkedIn message generator** — short cold outreach message based on the user profile and optional context.
- **Interview prep** — five role-specific interview questions, weighted towards the user's known skill gaps.

## Setup

Requires Python 3.10+ and an Anthropic API key.

```
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
pip install -e .
```

`pip install -e .` is required on every machine. It registers the project as an editable package so the absolute imports (`from app...`, `from services...`) resolve correctly.

Copy `.env.example` to `.env` and add your key:

```
ANTHROPIC_API_KEY=your_key_here
```

`.env` is gitignored and excluded from Claude Code's file access via `.claudeignore`. Never commit it.

## Running the app

```
streamlit run app/main.py
```

## Project structure

```
app/
  main.py            Streamlit entry point, routing via st.session_state.page
  chatbot.py          Onboarding flow (10 questions)
  dashboard.py         Profile summary, skill gap score, tool links
  skill_gap.py         Skill gap analysis
  cv_analyser.py       CV scoring and rewrite suggestions
  cover_letter.py      Cover letter generator
  job_roles.py         Job role suggestions
  linkedin_message.py  LinkedIn outreach message generator
  interview_prep.py    Interview question prep

services/
  claude_client.py   Single call_claude(prompt, system="") function; all API calls go through here
  s3_client.py       AWS S3 storage (owned by AWS teammate, not yet wired in)

database/
  db_client.py       RDS Postgres connection and queries (owned by AWS teammate, not yet wired in)

prompts/
  skill_gap_prompt.py
  cv_prompt.py
  cover_letter_prompt.py
  job_roles_prompt.py
  linkedin_prompt.py
  interview_prep_prompt.py

utils/
  helpers.py         Shared profile rendering and page navigation helpers
```

## Architecture notes

- All Claude API calls go through `services/claude_client.py`. Nothing else touches the API directly.
- `call_claude` creates the Anthropic client inside the function on every call, not at module level, so a changed API key never gets served from a stale client.
- Absolute imports throughout, enabled by the editable install (`pyproject.toml`). No `sys.path` hacks.
- Page state and all tool results are cached in `st.session_state` so switching pages never triggers a repeat API call.
- AWS (S3, RDS, Lambda) is owned by a separate teammate and plugs into `services/s3_client.py` and `database/db_client.py`.

## Known limitations

- AWS storage and persistence are not yet wired in; profiles and results only persist for the current session.
