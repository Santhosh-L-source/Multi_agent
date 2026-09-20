from sqlalchemy import text
from typing import Optional
from app.database.connection import SessionLocal

LOAN_PRODUCTS = [
    {
        "loan_type": "HOME_LOAN",
        "name": "Home / Mortgage Loan",
        "interest_rate_annual": 8.50,
        "min_amount": 50000,
        "max_amount": 10000000,
        "min_tenure_months": 12,
        "max_tenure_months": 360,
        "description": "Affordable home loans for buying, constructing, or renovating residential property."
    },
    {
        "loan_type": "PERSONAL_LOAN",
        "name": "Personal Loan",
        "interest_rate_annual": 11.50,
        "min_amount": 10000,
        "max_amount": 500000,
        "min_tenure_months": 6,
        "max_tenure_months": 60,
        "description": "Unsecured personal loan for medical, travel, wedding, or emergency expenses."
    },
    {
        "loan_type": "AUTO_LOAN",
        "name": "Auto / Car Loan",
        "interest_rate_annual": 9.00,
        "min_amount": 50000,
        "max_amount": 2000000,
        "min_tenure_months": 12,
        "max_tenure_months": 84,
        "description": "Competitive rates for financing new or pre-owned vehicles."
    },
    {
        "loan_type": "EDUCATION_LOAN",
        "name": "Education Loan",
        "interest_rate_annual": 8.00,
        "min_amount": 20000,
        "max_amount": 1500000,
        "min_tenure_months": 12,
        "max_tenure_months": 120,
        "description": "Funding higher education in top national and international universities."
    }
]


def get_available_loan_products():
    """Return list of standard bank loan products with terms and interest rates."""
    return LOAN_PRODUCTS


def calculate_loan_emi(
    principal_amount: float,
    interest_rate_annual: float,
    tenure_months: int
):
    """
    Calculate Monthly EMI (Equated Monthly Installment) using standard financial formula:
    EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
    """
    try:
        p = float(principal_amount)
        annual_rate = float(interest_rate_annual)
        n = int(tenure_months)

        if n <= 0 or p <= 0:
            return {"error": "Principal and tenure must be positive numbers."}

        # Monthly interest rate
        r = (annual_rate / 12) / 100

        if r == 0:
            emi = p / n
        else:
            emi = (p * r * ((1 + r) ** n)) / (((1 + r) ** n) - 1)

        total_payment = emi * n
        total_interest = total_payment - p

        return {
            "principal_amount": round(p, 2),
            "interest_rate_annual": f"{annual_rate}%",
            "tenure_months": n,
            "monthly_emi": round(emi, 2),
            "total_interest_payable": round(total_interest, 2),
            "total_amount_payable": round(total_payment, 2)
        }
    except Exception as e:
        return {"error": str(e)}


def get_user_loans(user_id: int):
    """Fetch existing active or completed loans for the authenticated user."""
    db = SessionLocal()
    try:
        result = db.execute(
            text("""
                SELECT
                    l.loan_id,
                    l.loan_type,
                    l.principal_amount,
                    l.interest_rate,
                    l.tenure_months,
                    l.monthly_emi,
                    l.outstanding_balance,
                    l.status,
                    l.created_at
                FROM loans l
                JOIN customers c ON l.customer_id = c.customer_id
                WHERE c.user_id = :user_id
                ORDER BY l.created_at DESC
            """),
            {"user_id": user_id}
        ).fetchall()

        if not result:
            return {"message": "You currently have no active or previous loans with us."}

        return [
            {
                "loan_id": row.loan_id,
                "loan_type": row.loan_type,
                "principal_amount": float(row.principal_amount),
                "interest_rate": float(row.interest_rate),
                "tenure_months": row.tenure_months,
                "monthly_emi": float(row.monthly_emi),
                "outstanding_balance": float(row.outstanding_balance),
                "status": row.status,
                "created_at": row.created_at
            }
            for row in result
        ]
    except Exception as e:
        return {"error": f"Failed to retrieve user loans: {str(e)}"}
    finally:
        db.close()


def check_loan_eligibility(
    user_id: int,
    loan_type: str,
    requested_amount: float,
    monthly_income: float
):
    """Assess user's loan eligibility based on income and requested amount."""
    matched_product = next((p for p in LOAN_PRODUCTS if p["loan_type"].upper() == loan_type.upper()), None)
    if not matched_product:
        return {
            "eligible": False,
            "reason": f"Unknown loan type '{loan_type}'. Valid types: HOME_LOAN, PERSONAL_LOAN, AUTO_LOAN, EDUCATION_LOAN."
        }

    if requested_amount < matched_product["min_amount"]:
        return {
            "eligible": False,
            "reason": f"Requested amount is below minimum limit of ${matched_product['min_amount']} for {matched_product['name']}."
        }

    if requested_amount > matched_product["max_amount"]:
        return {
            "eligible": False,
            "reason": f"Requested amount exceeds maximum limit of ${matched_product['max_amount']} for {matched_product['name']}."
        }

    # Standard affordability rule: estimated EMI should not exceed 50% of monthly income
    est_emi_calc = calculate_loan_emi(
        principal_amount=requested_amount,
        interest_rate_annual=matched_product["interest_rate_annual"],
        tenure_months=matched_product["max_tenure_months"]
    )
    est_emi = est_emi_calc.get("monthly_emi", 0)

    if est_emi > (monthly_income * 0.50):
        return {
            "eligible": False,
            "reason": f"Estimated EMI of ${est_emi} exceeds 50% of monthly income (${monthly_income}). Try a lower amount or longer tenure.",
            "estimated_emi": est_emi,
            "max_allowed_emi": monthly_income * 0.50
        }

    return {
        "eligible": True,
        "loan_product": matched_product["name"],
        "interest_rate": f"{matched_product['interest_rate_annual']}%",
        "requested_amount": requested_amount,
        "estimated_monthly_emi": est_emi,
        "status": "PRE_APPROVED"
    }


def apply_for_loan(
    user_id: int,
    loan_type: str,
    amount: float,
    tenure_months: int,
    purpose: Optional[str] = "General"
):
    """Submit a new loan application in the database."""
    matched_product = next((p for p in LOAN_PRODUCTS if p["loan_type"].upper() == loan_type.upper()), None)
    if not matched_product:
        return {"error": f"Invalid loan type: {loan_type}"}

    emi_data = calculate_loan_emi(
        principal_amount=amount,
        interest_rate_annual=matched_product["interest_rate_annual"],
        tenure_months=tenure_months
    )

    if "error" in emi_data:
        return emi_data

    db = SessionLocal()
    try:
        # Fetch customer_id for this user
        customer = db.execute(
            text("SELECT customer_id FROM customers WHERE user_id = :user_id"),
            {"user_id": user_id}
        ).fetchone()

        customer_id = customer.customer_id if customer else None

        result = db.execute(
            text("""
                INSERT INTO loan_applications
                (
                    user_id,
                    customer_id,
                    loan_type,
                    requested_amount,
                    tenure_months,
                    interest_rate,
                    estimated_emi,
                    purpose,
                    status
                )
                VALUES
                (
                    :user_id,
                    :customer_id,
                    :loan_type,
                    :requested_amount,
                    :tenure_months,
                    :interest_rate,
                    :estimated_emi,
                    :purpose,
                    'PENDING'
                )
                RETURNING application_id
            """),
            {
                "user_id": user_id,
                "customer_id": customer_id,
                "loan_type": matched_product["loan_type"],
                "requested_amount": amount,
                "tenure_months": tenure_months,
                "interest_rate": matched_product["interest_rate_annual"],
                "estimated_emi": emi_data["monthly_emi"],
                "purpose": purpose
            }
        )
        row = result.fetchone()
        db.commit()
        application_id = row[0] if row else None

        return {
            "success": True,
            "application_id": application_id,
            "loan_type": matched_product["name"],
            "requested_amount": amount,
            "tenure_months": tenure_months,
            "estimated_emi": emi_data["monthly_emi"],
            "status": "PENDING",
            "message": f"Loan application #{application_id} submitted successfully and is currently under review."
        }
    except Exception as e:
        db.rollback()
        return {"error": f"Failed to submit application: {str(e)}"}
    finally:
        db.close()
