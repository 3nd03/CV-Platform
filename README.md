# Careerly

An AI-powered CV and career platform built for a charity hackathon. Users go through a short onboarding chat and land on a dashboard with tools for skill gap analysis, CV review, cover letters, job role suggestions, LinkedIn outreach, and interview prep.

## Features

- **Onboarding chatbot**: 11 questions covering target role, skills, background, experience, goals, and any disabilities or access needs. Every other tool uses the profile this builds.
- **Dashboard**: profile summary, skill gap score, and links to all tools in one place.
- **Skill gap analysis**: match score against the target role, what the user already has, what they're missing, and concrete next steps.
- **CV analyser**: upload a PDF CV (text extracted with PyPDF2) for a structured review covering overall impression, strengths, weaknesses, and specific rewrite suggestions.
- **Cover letter generator**: takes the user profile and a pasted job description and produces a tailored cover letter.
- **Job role suggestions**: three roles to go for now, three to aim for in six months.
- **LinkedIn message generator**: short cold outreach message built from the user profile, with an optional context field for who they're messaging.
- **Interview prep**: five role-specific questions weighted towards the user's known skill gaps.
- **Follow-up chat**: after using any tool, the user can ask a specific question about their result and get an answer grounded in that result and their profile.

## Setup

Requires Python 3.10+ and an Anthropic API key.

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
pip install -e .
```

`pip install -e .` is required on every machine. It makes the absolute imports (`from app...`, `from services...`) work correctly.

Copy `.env.example` to `.env` and fill in your own values:

```
ANTHROPIC_API_KEY=your_key_here
S3_BUCKET_NAME=your_bucket_name
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

## Running the app

```bash
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
  s3_client.py         AWS S3 storage, handles CV PDF uploads

database/
  db_client.py         RDS Postgres, stores profile data and results from every feature

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
- Each feature saves its result to its own table in RDS, linked by a session ID generated when the user opens the app. CV uploads go to S3, and the returned key gets stored alongside the profile.
- If a save to S3 or RDS fails, the app shows a warning and carries on. A database issue never blocks the user from finishing their session.

## Data persistence

- Uploaded CV PDFs are stored in S3.
- Everything else (profile answers, skill gap results, cover letters, and so on) is stored in RDS Postgres, one table per feature.
- A session is identified by a UUID generated the first time the app loads in a browser. Nothing is written to the database until the user actually completes a step, so refreshing the page before that point doesn't create an empty row.

## Accessibility, security and cost

**Accessibility**

Runs in the browser with no install required, works with whatever device someone brings on the day. Outputs from Claude are written in plain language rather than technical jargon. Standard keyboard navigation works out of the box through Streamlit's default components. Onboarding now asks directly about disabilities or access needs, so the profile can account for this going forward. Screen reader and font scaling testing hasn't been done yet, that's a clear next step if this goes further.

**Security**

API keys and AWS credentials live in `.env`, which is never committed. The AWS IAM user is scoped to only the S3 and RDS access it needs. There's no login system, each session is identified by a random ID rather than a personal account. RDS only accepts connections from specific whitelisted IP addresses.

**Cost**

The Claude API is pay-per-token, so cost tracks usage rather than sitting at a fixed monthly rate. AWS is on the free tier for this prototype. A production version serving real users would need proper hosting and would scale in cost with the number of users, worth scoping properly with the charity rather than estimating here.

## Known limitations

- Built in a single day. This is a working prototype, not a production system.
- No consent flow, data retention policy, or way for a user to request their data be deleted. Needed before any real deployment, since CVs contain personal data.
- Built with one user in mind at a time, not tested under concurrent load.

## Roadmap

Features we'd want to add if this moves beyond the prototype stage:

- **Text to speech**: read questions and results aloud, for users who find reading difficult or have visual impairments.
- **Microphone (speech to text)**: answer onboarding questions by voice instead of typing.
- **Job postings**: pull in live roles matched to the user's profile, rather than just suggesting role types.
- **Culture alignment**: help users understand whether a company's culture is a good fit, not just whether their skills match.
- **Career path videos**: short videos showing what a real career path looks like for a given role, to make the suggestions feel less abstract.
