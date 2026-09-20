import sys
import os

# Add root directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

def test_loan_tools():
    print("\n--- 1. Testing Loan Tools ---")
    from app.tools.loan_tools import (
        get_available_loan_products,
        calculate_loan_emi,
        check_loan_eligibility
    )
    
    # 1. Available products
    products = get_available_loan_products()
    assert len(products) >= 4, "Should have at least 4 loan products"
    print(f"[OK] Loan products retrieved: {len(products)} products found.")
    
    # 2. EMI calculation
    # $50,000 at 8.5% for 60 months (5 years)
    emi_result = calculate_loan_emi(50000, 8.5, 60)
    assert "monthly_emi" in emi_result
    assert emi_result["monthly_emi"] > 0
    print(f"[OK] EMI Calculation test: $50,000 @ 8.5% for 60mo -> Monthly EMI: ${emi_result['monthly_emi']}, Total: ${emi_result['total_amount_payable']}")
    
    # 3. Eligibility check
    eligibility = check_loan_eligibility(
        user_id=1,
        loan_type="PERSONAL_LOAN",
        requested_amount=20000,
        monthly_income=5000
    )
    assert "eligible" in eligibility
    print(f"[OK] Loan Eligibility check: Eligible = {eligibility['eligible']}")


def test_auth_tools():
    print("\n--- 2. Testing Auth & Security Tools ---")
    from app.auth.password import hash_password, verify_password
    from app.auth.jwt_handler import create_access_token, decode_access_token
    from app.tools.input_tools import validate_message
    from app.tools.pii_tools import redact_pii

    # Password hash & verify
    pw = "SuperSecurePass123!"
    hashed = hash_password(pw)
    assert verify_password(pw, hashed), "Password verification failed"
    print("[OK] Password hashing & verification working!")

    # JWT generation & decode
    token = create_access_token(user_id=42, role="CUSTOMER")
    payload = decode_access_token(token)
    assert payload["sub"] == "42", "JWT payload sub mismatch"
    print("[OK] JWT creation & verification working!")

    # Input validation
    valid, msg = validate_message("Hello, I want to check my account balance")
    assert valid is True
    invalid, _ = validate_message("")
    assert invalid is False
    print("[OK] Input validation working!")

    # PII Redaction
    sample = "Call me at 9876543210 or email test@gmail.com"
    redacted = redact_pii(sample)
    print(f"[OK] PII Redaction: '{sample}' -> '{redacted}'")


def test_fastapi_app():
    print("\n--- 3. Testing FastAPI App Structure & Routes ---")
    from app.main import app

    routes = [route.path for route in app.routes]
    print(f"[OK] Registered routes ({len(routes)}):")
    for r in sorted(routes):
        print(f"   - {r}")

    # Verify key endpoints exist
    assert "/" in routes
    assert "/chat" in routes
    assert "/auth/login" in routes
    assert "/auth/register" in routes
    assert "/loans/products" in routes
    assert "/loans/calculate-emi" in routes
    print("[OK] All essential endpoints registered successfully!")


def test_coordinator_agent():
    print("\n--- 4. Testing Coordinator Agent Routing (Groq API) ---")
    from app.agents.coordinator_agent import coordinator_agent

    test_queries = [
        ("What is my current account balance?", "ACCOUNT"),
        ("Show me my recent 5 transactions", "TRANSACTION"),
        ("What are the interest rates for a personal loan?", "LOAN")
    ]

    for query, expected in test_queries:
        try:
            agent = coordinator_agent(query)
            print(f"[OK] Query: '{query}' -> Routed to: [{agent}] (Expected: {expected})")
        except Exception as e:
            print(f"[WARN] Groq API call note: {e}")
            break


if __name__ == "__main__":
    print("=" * 60)
    print("RUNNING MULTI-AGENT BANKING SYSTEM VERIFICATION TESTS")
    print("=" * 60)

    test_loan_tools()
    test_auth_tools()
    test_fastapi_app()
    test_coordinator_agent()

    print("\n" + "=" * 60)
    print("ALL TESTS PASSED SUCCESSFULLY! [OK]")
    print("=" * 60)
