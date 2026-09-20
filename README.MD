# Banking Multi-Agent System

A secure AI-driven banking assistant built with **FastAPI**, **React (Vite)**, **Groq LLMs**, and **Supabase (PostgreSQL)**.

## Architecture

- **Coordinator Agent**: Classifies and routes user queries to the appropriate agent (`ACCOUNT`, `TRANSACTION`, or `LOAN`).
- **Account Agent**: Retrieves balances and account status via secure tool calling.
- **Transaction Agent**: Retrieves transaction history and recent transactions.
- **Loan Agent**: Calculates EMIs, explains loan products & rates, assesses eligibility, checks active loans, and submits loan applications.
- **Security & Guardrails**:
  - PII Masking (Microsoft Presidio)
  - Input validation & prompt injection sanitization
  - Audit logging for every user and agent interaction
  - JWT Authentication & RBAC

---

## Supabase Database Setup

1. Create a new project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor** in your Supabase dashboard.
3. Open and run the contents of [`app/database/supabase_schema.sql`](file:///c:/Users/victus/Downloads/multi-agent/multi-agent/app/database/supabase_schema.sql) to create all tables:
   - `users`
   - `customers`
   - `accounts`
   - `transactions`
   - `conversation_memory`
   - `audit_logs`
4. Copy your database connection string from Supabase (**Project Settings** -> **Database** -> **Connection string** -> **URI / Direct Connection**).

---

## Configuration (`.env`)

Update your [`.env`](file:///c:/Users/victus/Downloads/multi-agent/multi-agent/.env) file:

```env
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres
JWT_SECRET=your-secure-jwt-secret
GROQ_API_KEY=gsk_...
```

---

## Installation & Running

### 1. Backend (FastAPI)

```bash
# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend (React)

```bash
cd frontend
npm install
npm run dev
```
