from sqlalchemy import text

from app.database.connection import SessionLocal


def get_recent_transactions(
    user_id: int,
    account_id: int
):

    db = SessionLocal()

    try:

        result = db.execute(
            text("""
                SELECT
                    t.transaction_id,
                    t.from_account_id,
                    t.to_account_id,
                    t.amount,
                    t.transaction_type,
                    t.status,
                    t.description,
                    t.created_at
                FROM transactions t
                JOIN accounts a
                    ON (
                        t.from_account_id = a.account_id
                        OR t.to_account_id = a.account_id
                    )
                JOIN customers c
                    ON a.customer_id = c.customer_id
                WHERE a.account_id = :account_id
                  AND c.user_id = :user_id
                ORDER BY t.created_at DESC
                LIMIT 5
            """),
            {
                "account_id": account_id,
                "user_id": user_id
            }
        ).fetchall()

        return [
            {
                "transaction_id": row.transaction_id,
                "from_account_id": row.from_account_id,
                "to_account_id": row.to_account_id,
                "amount": float(row.amount),
                "transaction_type": row.transaction_type,
                "status": row.status,
                "description": row.description,
                "created_at": row.created_at
            }
            for row in result
        ]

    finally:
        db.close()


def get_user_transactions(
    user_id: int,
    account_id: int
):

    db = SessionLocal()

    try:

        result = db.execute(
            text("""
                SELECT
                    t.transaction_id,
                    t.from_account_id,
                    t.to_account_id,
                    t.amount,
                    t.transaction_type,
                    t.status,
                    t.description,
                    t.created_at
                FROM transactions t
                JOIN accounts a
                    ON (
                        t.from_account_id = a.account_id
                        OR t.to_account_id = a.account_id
                    )
                JOIN customers c
                    ON a.customer_id = c.customer_id
                WHERE a.account_id = :account_id
                  AND c.user_id = :user_id
                ORDER BY t.created_at DESC
            """),
            {
                "account_id": account_id,
                "user_id": user_id
            }
        ).fetchall()

        return [
            {
                "transaction_id": row.transaction_id,
                "from_account_id": row.from_account_id,
                "to_account_id": row.to_account_id,
                "amount": float(row.amount),
                "transaction_type": row.transaction_type,
                "status": row.status,
                "description": row.description,
                "created_at": row.created_at
            }
            for row in result
        ]

    finally:
        db.close()