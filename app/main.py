from fastapi import FastAPI,Query

from app.auth.routes import router as auth_router
from app.accounts.routes import router as account_router
from app.transactions.routes import router as transaction_router
from app.loans.routes import router as loan_router
from app.agents.coordinator_agent import coordinator_agent
from app.chat.routes import router as chat_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Bank Multi-Agent System"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth_router)
app.include_router(account_router)
app.include_router(transaction_router)
app.include_router(loan_router)
app.include_router(chat_router)

@app.get("/")
def home():
    return {
        "message": "Bank Multi-Agent System is running"
    }

@app.get("/coordinator/test")
def test_coordinator(
    message: str = Query(...)
):
    agent = coordinator_agent(message)

    return {
        "selected_agent": agent
    }