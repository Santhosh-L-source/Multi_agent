const API_URL = "http://127.0.0.1:8000";

// Fallback seed data
const defaultAccount = {
  account_id: 5,
  account_number: "ACC-9988776655",
  balance: 487500.00,
  currency: "INR",
  status: "ACTIVE",
  customer_name: "Rahul Verma",
  account_type: "SAVINGS_PLUS",
  branch: "Connaught Place Branch, New Delhi",
  ifsc: "BANK0001048"
};

const defaultTransactions = [
  { transaction_id: "TXN-901", amount: 25000, transaction_type: "CREDIT", status: "COMPLETED", description: "Monthly Salary Deposit", created_at: "2025-06-18 10:30:00" },
  { transaction_id: "TXN-902", amount: 4500, transaction_type: "DEBIT", status: "COMPLETED", description: "Utility Bill & Broadband", created_at: "2025-06-17 14:20:00" },
  { transaction_id: "TXN-903", amount: 12500, transaction_type: "DEBIT", status: "COMPLETED", description: "Shopping & E-Commerce", created_at: "2025-06-15 18:45:00" },
  { transaction_id: "TXN-904", amount: 150000, transaction_type: "CREDIT", status: "COMPLETED", description: "Investment Dividend Returns", created_at: "2025-06-10 09:15:00" },
  { transaction_id: "TXN-905", amount: 2800, transaction_type: "DEBIT", status: "COMPLETED", description: "Dining & Coffee Outings", created_at: "2025-06-08 21:10:00" }
];

const defaultLoans = [
  { loan_id: "LN-101", loan_type: "HOME_LOAN", principal_amount: 3500000, emi_amount: 32450, interest_rate: 8.5, remaining_tenure_months: 180, status: "ACTIVE" },
  { loan_id: "LN-102", loan_type: "AUTO_LOAN", principal_amount: 650000, emi_amount: 14200, interest_rate: 9.2, remaining_tenure_months: 36, status: "ACTIVE" }
];

const getStored = (key, fallback) => {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch (e) {
    return fallback;
  }
};

const setStored = (key, val) => {
  localStorage.setItem(key, JSON.stringify(val));
};

export async function login(email, password) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Login failed");
    
    if (data.access_token) {
      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("user_email", email);
    }
    return data;
  } catch (err) {
    console.warn("Backend auth offline, using demo auth token:", err.message);
    const demoToken = "demo-access-token-" + Date.now();
    localStorage.setItem("access_token", demoToken);
    localStorage.setItem("user_email", email || "customer@bank.com");
    return { access_token: demoToken, token_type: "bearer", user: { email } };
  }
}

export async function fetchAccountDetails(accountId = 5) {
  const token = localStorage.getItem("access_token");
  try {
    const response = await fetch(`${API_URL}/accounts/${accountId}/balance`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Failed to fetch account");
    return data;
  } catch (err) {
    return getStored("bank_account", defaultAccount);
  }
}

export async function fetchTransactions(accountId = 5) {
  const token = localStorage.getItem("access_token");
  try {
    const response = await fetch(`${API_URL}/transactions/${accountId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Failed to fetch transactions");
    return data.transactions || [];
  } catch (err) {
    return getStored("bank_transactions", defaultTransactions);
  }
}

export async function recordTransfer(transferData) {
  const txns = getStored("bank_transactions", defaultTransactions);
  const acc = getStored("bank_account", defaultAccount);

  const amount = parseFloat(transferData.amount) || 0;
  const newTxn = {
    transaction_id: `TXN-${Math.floor(100 + Math.random() * 900)}`,
    amount,
    transaction_type: "DEBIT",
    status: "COMPLETED",
    description: `Transfer to ${transferData.recipient} (${transferData.note || 'Fund Transfer'})`,
    created_at: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };

  txns.unshift(newTxn);
  acc.balance = Math.max(0, acc.balance - amount);

  setStored("bank_transactions", txns);
  setStored("bank_account", acc);
  return newTxn;
}

export async function fetchLoans() {
  return getStored("bank_loans", defaultLoans);
}

export async function submitLoanApplication(loanData) {
  const loans = getStored("bank_loans", defaultLoans);
  const principal = parseFloat(loanData.amount) || 500000;
  const rate = parseFloat(loanData.rate) || 9.5;
  const tenureYears = parseInt(loanData.tenure) || 3;

  const monthlyRate = (rate / 12) / 100;
  const months = tenureYears * 12;
  const emi = Math.round((principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1));

  const newLoan = {
    loan_id: `LN-${Math.floor(200 + Math.random() * 800)}`,
    loan_type: loanData.loan_type || "PERSONAL_LOAN",
    principal_amount: principal,
    emi_amount: emi,
    interest_rate: rate,
    remaining_tenure_months: months,
    status: "ACTIVE"
  };

  loans.push(newLoan);
  setStored("bank_loans", loans);
  return newLoan;
}

export async function sendChatMessage(userMessage) {
  const token = localStorage.getItem("access_token");
  try {
    const response = await fetch(`${API_URL}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        message: userMessage,
        account_id: 5,
        session_id: "session-1"
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "AI Assistant failed to respond");
    
    // Classify agent badge type
    let agentBadge = "COORDINATOR";
    const msgLower = userMessage.toLowerCase();
    if (msgLower.includes("balance") || msgLower.includes("account") || msgLower.includes("status")) {
      agentBadge = "ACCOUNT";
    } else if (msgLower.includes("transaction") || msgLower.includes("history") || msgLower.includes("spent") || msgLower.includes("deposit")) {
      agentBadge = "TRANSACTION";
    } else if (msgLower.includes("loan") || msgLower.includes("emi") || msgLower.includes("interest") || msgLower.includes("borrow")) {
      agentBadge = "LOAN";
    }

    return {
      text: data.response || "How else can I assist you with your banking needs?",
      agent: agentBadge
    };
  } catch (err) {
    // Intelligent AI Coordinator Simulation fallback
    const msgLower = userMessage.toLowerCase();
    const acc = getStored("bank_account", defaultAccount);
    const txns = getStored("bank_transactions", defaultTransactions);

    let replyText = "";
    let agentBadge = "COORDINATOR";

    if (msgLower.includes("balance") || msgLower.includes("account")) {
      agentBadge = "ACCOUNT";
      replyText = `Your current account balance for Account ${acc.account_number} is ₹${acc.balance.toLocaleString()} ${acc.currency}. Account status is ACTIVE.`;
    } else if (msgLower.includes("transaction") || msgLower.includes("recent") || msgLower.includes("history")) {
      agentBadge = "TRANSACTION";
      const lastTxn = txns[0];
      replyText = `Found ${txns.length} recent transactions. Your latest transaction was "${lastTxn.description}" of ₹${lastTxn.amount.toLocaleString()} (${lastTxn.transaction_type}) on ${lastTxn.created_at}.`;
    } else if (msgLower.includes("loan") || msgLower.includes("emi") || msgLower.includes("interest")) {
      agentBadge = "LOAN";
      replyText = `Personal loans are available starting at 9.5% APR. For a ₹5,00,000 loan over 3 years, estimated monthly EMI is approx ₹16,016/month. Would you like to submit an application?`;
    } else {
      replyText = `Hello! I am your Bank AI Coordinator. I can assist you with your Account Balances, Transaction Ledger, and Loan Eligibility calculations. How can I help you today?`;
    }

    return { text: replyText, agent: agentBadge };
  }
}

export async function fetchDashboardTotals() {
  const acc = await fetchAccountDetails();
  const txns = await fetchTransactions();
  const loans = await fetchLoans();

  const totalBalance = acc.balance || 487500;
  const totalIncome = txns.filter(t => t.transaction_type === "CREDIT").reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = txns.filter(t => t.transaction_type === "DEBIT").reduce((sum, t) => sum + t.amount, 0);
  const totalLoanLiabilities = loans.reduce((sum, l) => sum + l.principal_amount, 0);
  const monthlyEMIDue = loans.reduce((sum, l) => sum + l.emi_amount, 0);

  return {
    totalBalance,
    totalIncome,
    totalExpense,
    totalLoanLiabilities,
    monthlyEMIDue,
    transactionCount: txns.length,
    creditScore: 785,
    accountNumber: acc.account_number,
    currency: acc.currency || "INR"
  };
}