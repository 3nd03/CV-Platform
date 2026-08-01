from database.db_client import get_connection

# Every table referenced by a save_* function in database/db_client.py, keyed by
# table name. career_roadmap_results is confirmed missing from RDS; the rest are
# included as CREATE TABLE IF NOT EXISTS so this migration also backfills any
# other table that fell out of sync between the code and the live database.
TABLES = {
    "career_roadmap_results": """
        CREATE TABLE IF NOT EXISTS career_roadmap_results (
            id SERIAL PRIMARY KEY,
            profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
            result JSONB,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """,
    "cv_uploads": """
        CREATE TABLE IF NOT EXISTS cv_uploads (
            id SERIAL PRIMARY KEY,
            profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
            s3_key TEXT,
            uploaded_at TIMESTAMP DEFAULT NOW()
        );
    """,
    "skill_gap_results": """
        CREATE TABLE IF NOT EXISTS skill_gap_results (
            id SERIAL PRIMARY KEY,
            profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
            result JSONB,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """,
    "cv_analysis_results": """
        CREATE TABLE IF NOT EXISTS cv_analysis_results (
            id SERIAL PRIMARY KEY,
            profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
            result JSONB,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """,
    "cover_letters": """
        CREATE TABLE IF NOT EXISTS cover_letters (
            id SERIAL PRIMARY KEY,
            profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
            job_description TEXT,
            letter_text TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """,
    "job_role_suggestions": """
        CREATE TABLE IF NOT EXISTS job_role_suggestions (
            id SERIAL PRIMARY KEY,
            profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
            result JSONB,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """,
    "linkedin_messages": """
        CREATE TABLE IF NOT EXISTS linkedin_messages (
            id SERIAL PRIMARY KEY,
            profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
            context TEXT,
            message_text TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """,
    "interview_prep_results": """
        CREATE TABLE IF NOT EXISTS interview_prep_results (
            id SERIAL PRIMARY KEY,
            profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
            result JSONB,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """,
    "cv_download_results": """
        CREATE TABLE IF NOT EXISTS cv_download_results (
            id SERIAL PRIMARY KEY,
            profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
            result JSONB,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """,
    "salary_insights_results": """
        CREATE TABLE IF NOT EXISTS salary_insights_results (
            id SERIAL PRIMARY KEY,
            profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
            result JSONB,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """,
    "cv_translations": """
        CREATE TABLE IF NOT EXISTS cv_translations (
            id SERIAL PRIMARY KEY,
            profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
            target_language TEXT,
            result TEXT,
            created_at TIMESTAMP DEFAULT NOW()
        );
    """,
    "applications": """
        CREATE TABLE IF NOT EXISTS applications (
            id SERIAL PRIMARY KEY,
            profile_id INT REFERENCES profiles(id) ON DELETE CASCADE,
            company TEXT,
            role TEXT,
            date_applied DATE,
            status TEXT DEFAULT 'Applied',
            created_at TIMESTAMP DEFAULT NOW()
        );
    """,
}


def run_migration() -> None:
    conn = get_connection()
    cur = conn.cursor()
    for table_name, statement in TABLES.items():
        cur.execute(statement)
        print(f"Ensured table exists: {table_name}")
    conn.commit()
    cur.close()
    conn.close()
    print("Migration complete.")


if __name__ == "__main__":
    run_migration()
