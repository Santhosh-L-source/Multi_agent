import sys
import os
import uuid
from sqlalchemy import text
from fastapi.testclient import TestClient

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from app.database.connection import SessionLocal

client = TestClient(app)

def run_e2e_test():
    print("=" * 65)
    print("RUNNING END-TO-END SUPABASE + MULTI-AGENT INTEGRATION TESTS")
    print("=" * 65)

    # 1. Test Server Root
    res = client.get("/")
    assert res.status_code == 200
    print("[OK] FastAPI Root Endpoint working: ", res.json())

    # 2. Register New User in Supabase
    unique_email = f"user_{uuid.uuid4().hex[:6]}@example.com"
    reg_payload = {
        "name": "Alex Mercer",
        "email": unique_email,
        "password": "Password123!"
    }
    reg_res = client.post("/auth/register", json=reg_payload)
    assert reg_res.status_code == 200, f"Registration failed: {reg_res.text}"
    user_id = reg_res.json()["user_id"]
    print(f"[OK] Registered User in Supabase DB: user_id={user_id}, email={unique_email}")

    # 3. Login to get JWT Token
    login_res = client.post("/auth/login", json={
        "email": unique_email,
        "password": "Password123!"
    })
    assert login_res.status_code == 200, f"Login failed: {login_res.text}"
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    print("[OK] Authenticated and acquired JWT Token")

    # 4. Seed a customer and bank account in Supabase for this user
    db = SessionLocal()
    try:
        cust_res = db.execute(
            text("""
                INSERT INTO customers (user_id, first_name, last_name, phone)
                VALUES (:user_id, 'Alex', 'Mercer', '+1234567890')
                RETURNING customer_id
            """),
            {"user_id": user_id}
        )
        customer_id = cust_res.fetchone()[0]

        acc_res = db.execute(
            text("""
                INSERT INTO accounts (customer_id, account_number, account_type, balance, currency, status)
                VALUES (:customer_id, :acc_num, 'SAVINGS', 15420.50, 'USD', 'ACTIVE')
                RETURNING account_id
            """),
            {
                "customer_id": customer_id,
                "acc_num": f"ACC-{uuid.uuid4().hex[:8].upper()}"
            }
        )
        account_id = acc_res.fetchone()[0]
        db.commit()
        print(f"[OK] Seeded Customer #{customer_id} & Savings Account #{account_id} with $15,420.50 in Supabase")
    finally:
        db.close()

    # 5. Test Live /chat with Account Query
    session_id = f"sess_{uuid.uuid4().hex[:6]}"
    chat_payload = {
        "message": "Hi, what is my current account balance? My email is secret@bank.com",
        "account_id": account_id,
        "session_id": session_id
    }
    print("\n--- Testing Live AI Chat Pipeline (Account Query) ---")
    chat_res = client.post("/chat", json=chat_payload, headers=headers)
    assert chat_res.status_code == 200, f"Chat failed: {chat_res.text}"
    chat_data = chat_res.json()
    print(f"[OK] AI Response from Agent [{chat_data.get('agent')}]:")
    print(f"     \"{chat_data.get('response')}\"")

    # 6. Test Live /chat with Loan Query
    print("\n--- Testing Live AI Chat Pipeline (Loan EMI Query) ---")
    loan_chat_payload = {
        "message": "What is the monthly EMI for a $40,000 personal loan for 36 months?",
        "account_id": account_id,
        "session_id": session_id
    }
    loan_chat_res = client.post("/chat", json=loan_chat_payload, headers=headers)
    assert loan_chat_res.status_code == 200, f"Loan chat failed: {loan_chat_res.text}"
    loan_data = loan_chat_res.json()
    print(f"[OK] AI Response from Agent [{loan_data.get('agent')}]:")
    print(f"     \"{loan_data.get('response')}\"")

    # 7. Verify Conversation Memory & Audit Logs in Supabase
    db = SessionLocal()
    try:
        mem_count = db.execute(
            text("SELECT COUNT(*) FROM conversation_memory WHERE user_id = :uid"),
            {"uid": user_id}
        ).scalar()
        audit_count = db.execute(
            text("SELECT COUNT(*) FROM audit_logs WHERE user_id = :uid"),
            {"uid": user_id}
        ).scalar()
        print(f"\n[OK] Supabase Persisted Memory entries: {mem_count}")
        print(f"[OK] Supabase Persisted Audit Log entries: {audit_count}")
        assert mem_count >= 4, "Should have saved at least 4 memory messages"
        assert audit_count >= 2, "Should have saved at least 2 audit logs"
    finally:
        db.close()

    print("\n" + "=" * 65)
    print("ALL END-TO-END SUPABASE & MULTI-AGENT TESTS PASSED! [OK]")
    print("=" * 65)

if __name__ == "__main__":
    run_e2e_test()
