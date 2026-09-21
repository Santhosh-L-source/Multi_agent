import React, { useEffect, useState } from 'react';
import {
  WalletIcon,
  TrendingUpIcon,
  CreditCardIcon,
  PieChartIcon,
  SendIcon,
  RefreshIcon,
  BotIcon,
  ShieldCheckIcon
} from '../components/Icons';
import KpiCard from '../components/KpiCard';
import ChatAssistant from '../components/ChatAssistant';
import Modal from '../components/Modal';
import { fetchDashboardTotals, fetchTransactions, recordTransfer } from '../services/api';

const Dashboard = ({ setActiveTab }) => {
  const [totals, setTotals] = useState({
    totalBalance: 487500,
    totalIncome: 175000,
    totalExpense: 19800,
    totalLoanLiabilities: 4150000,
    monthlyEMIDue: 46650,
    transactionCount: 5,
    creditScore: 785,
    accountNumber: "ACC-9988776655",
    currency: "INR"
  });

  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Transfer Modal
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({ recipient: '', amount: '', note: '' });

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const data = await fetchDashboardTotals();
      setTotals(data);

      const txns = await fetchTransactions();
      setRecentTransactions(txns.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!transferForm.recipient || !transferForm.amount) return;

    try {
      await recordTransfer(transferForm);
      setIsTransferModalOpen(false);
      setTransferForm({ recipient: '', amount: '', note: '' });
      loadDashboard();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      {/* Header Banner */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Financial Operating System & AI Dashboard</h1>
          <p className="page-subtitle">Real-Time Account Balances, Cash Flow Totals, and Autonomous Multi-Agent AI</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={loadDashboard} title="Refresh Totals">
            <RefreshIcon size={16} />
            <span>Refresh Data</span>
          </button>
          <button className="btn btn-primary" onClick={() => setIsTransferModalOpen(true)}>
            <SendIcon size={16} />
            <span>Express Fund Transfer</span>
          </button>
        </div>
      </div>

      {/* Account Hero Banner */}
      <div className="account-hero-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8', fontWeight: 700 }}>
              Primary Savings & Investment Account
            </span>
            <div style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#ffffff', margin: '4px 0' }}>
              ₹{totals.totalBalance.toLocaleString()} <span style={{ fontSize: '1rem', color: '#00f2fe', fontWeight: 600 }}>{totals.currency}</span>
            </div>
            <div style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>
              Account Number: <strong>{totals.accountNumber}</strong> • IFSC: <strong>BANK0001048</strong>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div className="shield-badge" style={{ marginBottom: '8px' }}>
              <ShieldCheckIcon size={14} />
              <span>Credit Score: {totals.creditScore} (Excellent)</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Connaught Place Branch, New Delhi</div>
          </div>
        </div>
      </div>

      {/* Dynamic Financial Totals Grid ("Frontend Total Metrics") */}
      <div className="kpi-grid">
        <KpiCard
          title="Total Available Balance"
          value={loading ? '...' : `₹${totals.totalBalance.toLocaleString()}`}
          subtext="Verified Bank Balance"
          icon={WalletIcon}
          color="cyan"
        />

        <KpiCard
          title="Monthly Cash Inflow"
          value={loading ? '...' : `₹${totals.totalIncome.toLocaleString()}`}
          subtext="Salary & Dividend Returns"
          icon={TrendingUpIcon}
          color="emerald"
        />

        <KpiCard
          title="Monthly Cash Outflow"
          value={loading ? '...' : `₹${totals.totalExpense.toLocaleString()}`}
          subtext="Debits & Bills Paid"
          icon={PieChartIcon}
          color="indigo"
        />

        <KpiCard
          title="Active Loan Liabilities"
          value={loading ? '...' : `₹${totals.totalLoanLiabilities.toLocaleString()}`}
          subtext={`Monthly EMI: ₹${totals.monthlyEMIDue.toLocaleString()}`}
          icon={CreditCardIcon}
          color="amber"
          warning={true}
        />
      </div>

      {/* Main Grid: Recent Ledger & Embedded AI Assistant */}
      <div className="dashboard-grid">
        {/* Left Column: Recent Transactions */}
        <div>
          <div className="content-card">
            <div className="card-header">
              <div className="card-header-title">
                <PieChartIcon size={20} style={{ color: '#0284c7' }} />
                <span>Recent Transaction History</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('transactions')}>
                View All Ledger
              </button>
            </div>

            {recentTransactions.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>No transactions recorded.</p>
            ) : (
              <div className="table-wrapper">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Txn ID</th>
                      <th>Description</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((t, idx) => (
                      <tr key={idx}>
                        <td><strong>{t.transaction_id}</strong></td>
                        <td style={{ fontWeight: 600, color: '#0f172a' }}>{t.description}</td>
                        <td>
                          <span className={`badge ${t.transaction_type === 'CREDIT' ? 'badge-success' : 'badge-danger'}`}>
                            {t.transaction_type}
                          </span>
                        </td>
                        <td style={{ fontWeight: 700, color: t.transaction_type === 'CREDIT' ? '#10b981' : '#f43f5e' }}>
                          {t.transaction_type === 'CREDIT' ? '+' : '-'}₹{t.amount.toLocaleString()}
                        </td>
                        <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{t.created_at}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Assistant */}
        <div>
          <ChatAssistant />
        </div>
      </div>

      {/* Modal: Express Transfer */}
      <Modal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} title="Express Fund Transfer">
        <form onSubmit={handleTransferSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>Recipient Account / Name *</label>
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '14px' }}
              placeholder="e.g. Priya Sharma (ACC-112233)"
              value={transferForm.recipient}
              onChange={(e) => setTransferForm({ ...transferForm, recipient: e.target.value })}
              required
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>Amount (₹) *</label>
            <input
              type="number"
              className="form-control"
              style={{ paddingLeft: '14px' }}
              placeholder="e.g. 5000"
              value={transferForm.amount}
              onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>Transfer Note / Purpose</label>
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '14px' }}
              placeholder="e.g. Rent Payment, Project Fee"
              value={transferForm.note}
              onChange={(e) => setTransferForm({ ...transferForm, note: e.target.value })}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsTransferModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Send Funds Instantly
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Dashboard;