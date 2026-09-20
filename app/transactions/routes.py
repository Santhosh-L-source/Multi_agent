from fastapi import APIRouter, Depends, HTTPException

from app.auth.dependencies import get_current_user
from app.tools.transaction_tools import get_user_transactions
from app.agents.transaction_agent import transaction_agent
from app.tools.audit_tools import save_audit_log

router = APIRouter(
    prefix="/transactions",
    tags=["Transactions"]
)


@router.get("/{account_id}")
def get_transactions(
    account_id: int,
    current_user: dict = Depends(get_current_user)
):

    user_id = current_user["user_id"]

    transactions = get_user_transactions(
        user_id=user_id,
        account_id=account_id
    )

    if not transactions:
        save_audit_log(
            user_id=user_id,
            agent_name="TRANSACTION",
            action="VIEW_TRANSACTIONS",
            resource_type="ACCOUNT",
            resource_id=account_id,
            status="DENIED",
            details="Unauthorized transaction access attempt"
        )

        raise HTTPException(
            status_code=403,
            detail="You are not authorized to access this account"
        )
    save_audit_log(
        user_id=user_id,
        agent_name="TRANSACTION",
        action="VIEW_TRANSACTIONS",
        resource_type="ACCOUNT",
        resource_id=account_id,
        status="SUCCESS",
        details="User viewed transaction history"
    )
    return {
        "account_id": account_id,
        "transactions": transactions
    }