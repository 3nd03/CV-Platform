import os
import json
import psycopg2
from dotenv import load_dotenv

load_dotenv()

def get_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

def init_db():
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("""
        CREATE TABLE IF NOT EXISTS sessions (
            session_id TEXT PRIMARY KEY,
            created_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS profiles (
            session_id TEXT REFERENCES sessions(session_id),
            data JSONB,
            PRIMARY KEY (session_id)
        );
        CREATE TABLE IF NOT EXISTS cv_uploads (
            session_id TEXT REFERENCES sessions(session_id),
            s3_key TEXT,
            uploaded_at TIMESTAMP DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS skill_gap_results (
            session_id TEXT REFERENCES sessions(session_id),
            result JSONB,
            PRIMARY KEY (session_id)
        );
        CREATE TABLE IF NOT EXISTS cv_analysis_results (
            session_id TEXT REFERENCES sessions(session_id),
            result JSONB,
            PRIMARY KEY (session_id)
        );
        CREATE TABLE IF NOT EXISTS cover_letters (
            session_id TEXT REFERENCES sessions(session_id),
            job_description TEXT,
            letter_text TEXT,
            PRIMARY KEY (session_id)
        );
        CREATE TABLE IF NOT EXISTS job_role_suggestions (
            session_id TEXT REFERENCES sessions(session_id),
            result JSONB,
            PRIMARY KEY (session_id)
        );
        CREATE TABLE IF NOT EXISTS linkedin_messages (
            session_id TEXT REFERENCES sessions(session_id),
            context TEXT,
            message_text TEXT,
            PRIMARY KEY (session_id)
        );
        CREATE TABLE IF NOT EXISTS interview_prep_results (
            session_id TEXT REFERENCES sessions(session_id),
            result JSONB,
            PRIMARY KEY (session_id)
        );
    """)
    conn.commit()
    cur.close()
    conn.close()

def ensure_session(session_id):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute(
        "INSERT INTO sessions (session_id) VALUES (%s) ON CONFLICT DO NOTHING;",
        (session_id,)
    )
    conn.commit()
    cur.close()
    conn.close()

def _upsert(table, session_id, column, value):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("INSERT INTO sessions (session_id) VALUES (%s) ON CONFLICT DO NOTHING;", (session_id,))
    cur.execute(
        f"""INSERT INTO {table} (session_id, {column}) VALUES (%s, %s)
            ON CONFLICT (session_id) DO UPDATE SET {column} = EXCLUDED.{column};""",
        (session_id, value)
    )
    conn.commit()
    cur.close()
    conn.close()

def save_profile(session_id, profile_dict):
    _upsert("profiles", session_id, "data", json.dumps(profile_dict))

def save_cv_upload(session_id, s3_key):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("INSERT INTO sessions (session_id) VALUES (%s) ON CONFLICT DO NOTHING;", (session_id,))
    cur.execute(
        "INSERT INTO cv_uploads (session_id, s3_key) VALUES (%s, %s);",
        (session_id, s3_key)
    )
    conn.commit()
    cur.close()
    conn.close()

def save_skill_gap(session_id, result_dict):
    _upsert("skill_gap_results", session_id, "result", json.dumps(result_dict))

def save_cv_analysis(session_id, result_dict):
    _upsert("cv_analysis_results", session_id, "result", json.dumps(result_dict))

def save_cover_letter(session_id, job_description, letter_text):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("INSERT INTO sessions (session_id) VALUES (%s) ON CONFLICT DO NOTHING;", (session_id,))
    cur.execute("""
        INSERT INTO cover_letters (session_id, job_description, letter_text)
        VALUES (%s, %s, %s)
        ON CONFLICT (session_id) DO UPDATE
        SET job_description = EXCLUDED.job_description, letter_text = EXCLUDED.letter_text;
    """, (session_id, job_description, letter_text))
    conn.commit()
    cur.close()
    conn.close()

def save_job_roles(session_id, result_dict):
    _upsert("job_role_suggestions", session_id, "result", json.dumps(result_dict))

def save_linkedin_message(session_id, context, message_text):
    conn = get_connection()
    cur = conn.cursor()
    cur.execute("INSERT INTO sessions (session_id) VALUES (%s) ON CONFLICT DO NOTHING;", (session_id,))
    cur.execute("""
        INSERT INTO linkedin_messages (session_id, context, message_text)
        VALUES (%s, %s, %s)
        ON CONFLICT (session_id) DO UPDATE
        SET context = EXCLUDED.context, message_text = EXCLUDED.message_text;
    """, (session_id, context, message_text))
    conn.commit()
    cur.close()
    conn.close()

def save_interview_prep(session_id, result_dict):
    _upsert("interview_prep_results", session_id, "result", json.dumps(result_dict))