from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.auth.dependencies import get_current_user
from app.tools.loan_tools import (
    get_available_loan_products,
    calculate_loan_emi,
    get_user_loans,
    check_loan_eligibility,
    apply_for_loan
)
from app.tools.audit_tools import save_audit_log

router = APIRouter(
    prefix="/loans",
    tags=["Loans"]
)


class EmiCalculationRequest(BaseModel):
    principal_amount: float
    interest_rate_annual: float
    tenure_months: int


class EligibilityCheckRequest(BaseModel):
    loan_type: str
    requested_amount: float
    monthly_income: float


class LoanApplicationRequest(BaseModel):
    loan_type: str
    amount: float
    tenure_months: int
    purpose: Optional[str] = "General"


@router.get("/products")
def get_products():
    """Retrieve all available bank loan products."""
    return {
        "products": get_available_loan_products()
    }


@router.get("/my-loans")
def get_my_loans(
    current_user: dict = Depends(get_current_user)
):
    """Retrieve all active and previous loans for authenticated user."""
    user_id = current_user["user_id"]
    loans = get_user_loans(user_id=user_id)
    return {
        "loans": loans
    }


@router.post("/calculate-emi")
def calculate_emi(request: EmiCalculationRequest):
    """Calculate monthly installment, total interest, and total payable amount."""
    result = calculate_loan_emi(
        principal_amount=request.principal_amount,
        interest_rate_annual=request.interest_rate_annual,
        tenure_months=request.tenure_months
    )
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/check-eligibility")
def check_eligibility(
    request: EligibilityCheckRequest,
    current_user: dict = Depends(get_current_user)
):
    """Assess user eligibility for loan amount based on income."""
    user_id = current_user["user_id"]
    return check_loan_eligibility(
        user_id=user_id,
        loan_type=request.loan_type,
        requested_amount=request.requested_amount,
        monthly_income=request.monthly_income
    )


@router.post("/apply")
def submit_loan_application(
    request: LoanApplicationRequest,
    current_user: dict = Depends(get_current_user)
):
    """Submit a loan application."""
    user_id = current_user["user_id"]
    result = apply_for_loan(
        user_id=user_id,
        loan_type=request.loan_type,
        amount=request.amount,
        tenure_months=request.tenure_months,
        purpose=request.purpose
    )

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    save_audit_log(
        user_id=user_id,
        agent_name="LOAN",
        action="APPLY_LOAN",
        resource_type="LOAN_APPLICATION",
        resource_id=result.get("application_id", 0),
        status="SUCCESS",
        details=f"User applied for {request.loan_type} of ${request.amount}"
    )

    return result
