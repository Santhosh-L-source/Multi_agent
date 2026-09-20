import sys
import os
from sqlalchemy import text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")

print("=" * 60)
print("SUPABASE DATABASE CONNECTION CHECK")
print("=" * 60)

if "[YOUR_PROJECT_REF]" in DATABASE_URL or "[YOUR_SUPABASE_PASSWORD]" in DATABASE_URL or not DATABASE_URL:
    print("[STATUS] NOT LINKED YET (Placeholder credentials detected in .env)")
    print("\nDATABASE_URL in .env is currently:")
    print(f"  {DATABASE_URL}")
    print("\nPlease replace [YOUR_SUPABASE_PASSWORD] and [YOUR_PROJECT_REF] with your real Supabase credentials.")
else:
    print("[STATUS] Attempting connection to Supabase...")
    try:
        from app.database.connection import SessionLocal
        db = SessionLocal()
        result = db.execute(text("SELECT 1")).scalar()
        print(f"[STATUS] LINKED & CONNECTED SUCCESSFULLY! (Test query result: {result})")
        db.close()
    except Exception as e:
        print(f"[STATUS] CONNECTION FAILED: {e}")

print("=" * 60)
