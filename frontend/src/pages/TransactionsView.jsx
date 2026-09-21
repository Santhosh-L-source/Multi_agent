import React, { useEffect, useState } from 'react';
import { PieChartIcon, SendIcon, RefreshIcon } from '../components/Icons';
import Modal from '../components/Modal';
import { fetchTransactions, recordTransfer } from '../services/api';

const TransactionsView = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Transfer Modal
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({ recipient: '', amount: '', note: '' });

  const loadTxns = async () => {
    setLoading(true);
    try {
      const data = await fetchTransactions();
      setTransactions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTxns();
  }, []);

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!transferForm.recipient || !transferForm.amount) return;

    try {
      await recordTransfer(transferForm);
      setIsTransferModalOpen(false);
      setTransferForm({ recipient: '', amount: '', note: '' });
      loadTxns();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = transactions.filter(t => {
    const matchesFilter = filterType === 'ALL' || t.transaction_type === filterType;
    const matchesSearch = (t.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (t.transaction_id || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transaction Ledger & Transfers</h1>
          <p className="page-subtitle">Real-time audit record of credits, debits, online transfers, and merchant payments</p>
        </div>

        <button className="btn btn-primary" onClick={() => setIsTransferModalOpen(true)}>
          <SendIcon size={16} />
          <span>New Money Transfer</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="content-card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div className="input-group" style={{ maxWidth: 360 }}>
            <input
              type="text"
              className="form-control"
              style={{ paddingLeft: '14px' }}
              placeholder="Search by description or Transaction ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>Filter:</span>
            {['ALL', 'CREDIT', 'DEBIT'].map((type) => (
              <button
                key={type}
                className={`btn btn-sm ${filterType === type ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilterType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="content-card">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '32px 0', color: '#64748b' }}>Loading transaction records...</p>
        ) : filtered.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '32px 0', color: '#64748b' }}>No transactions found matching your criteria.</p>
        ) : (
          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Description / Merchant</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, idx) => (
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
                    <td>
                      <span className="badge badge-info">{t.status}</span>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#64748b' }}>{t.created_at}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Express Transfer */}
      <Modal isOpen={isTransferModalOpen} onClose={() => setIsTransferModalOpen(false)} title="Express Fund Transfer">
        <form onSubmit={handleTransferSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>Recipient Name / Account *</label>
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

export default TransactionsView;
