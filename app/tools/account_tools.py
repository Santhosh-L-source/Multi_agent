from sqlalchemy import text

from app.database.connection import SessionLocal


def get_account_balance(user_id: int, account_id: int):

    db = SessionLocal()

    try:
        result = db.execute(
            text("""
                SELECT
                    a.account_id,
                    a.account_number,
                    a.balance,
                    a.currency,
                    a.status
                FROM accounts a
                JOIN customers c
                    ON a.customer_id = c.customer_id
                WHERE a.account_id = :account_id
                  AND c.user_id = :user_id
            """),
            {
                "account_id": account_id,
                "user_id": user_id
            }
        ).fetchone()

        if not result:
            return None

        return {
            "account_id": result.account_id,
            "account_number": result.account_number,
            "balance": float(result.balance),
            "currency": result.currency,
            "status": result.status
        }

    finally:
        db.close()