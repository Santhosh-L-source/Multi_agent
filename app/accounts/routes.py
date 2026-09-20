from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from app.database.connection import SessionLocal

from app.auth.dependencies import get_current_user
from app.tools.account_tools import get_account_balance
from app.tools.audit_tools import save_audit_log


router = APIRouter(
    prefix="/accounts",
    tags=["Accounts"]
)



@router.get("/my-account")
def get_my_account(
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user["user_id"]

    db = SessionLocal()

    try:
        result = db.execute(
            text("""
                SELECT
                    a.account_id,
                    a.account_number,
                    a.account_type,
                    a.balance,
                    a.currency,
                    a.status
                FROM accounts a
                JOIN customers c
                    ON a.customer_id = c.customer_id
                WHERE c.user_id = :user_id
            """),
            {
                "user_id": user_id
            }
        ).fetchone()

        if not result:
            raise HTTPException(
                status_code=404,
                detail="No account found"
            )

        return {
            "account_id": result.account_id,
            "account_number": result.account_number,
            "account_type": result.account_type,
            "balance": float(result.balance),
            "currency": result.currency,
            "status": result.status
        }

    finally:
        db.close()




@router.get("/{account_id}/balance")
def get_balance(
    account_id: int,
    current_user: dict = Depends(get_current_user)
):

    user_id = current_user["user_id"]

    account = get_account_balance(
        user_id=user_id,
        account_id=account_id
    )

    if not account:
        save_audit_log(
            user_id=user_id,
            agent_name="ACCOUNT",
            action="VIEW_ACCOUNT",
            resource_type="ACCOUNT",
            resource_id=account_id,
            status="DENIED",
            details="Unauthorized account access attempt"
        )

        raise HTTPException(
            status_code=403,
            detail="You are not authorized to access this account"
        )
    save_audit_log(
        user_id=user_id,
        agent_name="ACCOUNT",
        action="VIEW_ACCOUNT",
        resource_type="ACCOUNT",
        resource_id=account_id,
        status="SUCCESS",
        details="User viewed account balance"
    )

    return account
