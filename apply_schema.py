import os
import sys
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

from app.database.connection import SessionLocal

def create_tables():
    schema_file = os.path.join(os.path.dirname(__file__), "app", "database", "supabase_schema.sql")
    with open(schema_file, "r", encoding="utf-8") as f:
        sql_commands = f.read()

    db = SessionLocal()
    try:
        print("Creating tables in Supabase PostgreSQL...")
        # Split statements by semicolon and execute
        statements = sql_commands.split(";")
        for stmt in statements:
            # Strip lines starting with --
            cleaned_lines = [line for line in stmt.splitlines() if not line.strip().startswith("--")]
            cleaned = "\n".join(cleaned_lines).strip()
            if cleaned:
                db.execute(text(cleaned))
        db.commit()
        print("[OK] All tables (users, customers, accounts, transactions, conversation_memory, audit_logs, loans, loan_applications) created successfully in Supabase!")
    except Exception as e:
        db.rollback()
        print(f"[ERROR] Failed to apply schema: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_tables()
