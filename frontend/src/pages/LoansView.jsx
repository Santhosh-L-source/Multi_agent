import React, { useEffect, useState } from 'react';
import { CreditCardIcon, CheckCircleIcon } from '../components/Icons';
import LoanCalculator from '../components/LoanCalculator';
import Modal from '../components/Modal';
import { fetchLoans, submitLoanApplication } from '../services/api';

const LoansView = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Apply Modal
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyForm, setApplyForm] = useState({ loan_type: 'PERSONAL_LOAN', amount: 500000, rate: 9.5, tenure: 3 });
  const [applySuccess, setApplySuccess] = useState(null);

  const loadLoans = async () => {
    setLoading(true);
    try {
      const data = await fetchLoans();
      setLoans(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, []);

  const handleCalculatorApply = (calcData) => {
    setApplyForm(calcData);
    setIsApplyModalOpen(true);
  };

  const handleSubmitApplication = async (e) => {
    e.preventDefault();
    try {
      const newLoan = await submitLoanApplication(applyForm);
      setApplySuccess(newLoan);
      loadLoans();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Loans & Credit Facilities</h1>
          <p className="page-subtitle">Manage active borrowing facilities, calculate monthly EMIs, and submit instant applications</p>
        </div>
      </div>

      {/* Embedded Loan Calculator */}
      <LoanCalculator onApplyLoan={handleCalculatorApply} />

      {/* Active Loans Roster */}
      <div className="content-card">
        <div className="card-header">
          <div className="card-header-title">
            <CreditCardIcon size={20} style={{ color: '#6366f1' }} />
            <span>Active Loan Accounts</span>
          </div>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>Loading active loans...</p>
        ) : loans.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '24px 0', color: '#64748b' }}>No active loans found.</p>
        ) : (
          <div className="table-wrapper">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Loan ID</th>
                  <th>Loan Facility Type</th>
                  <th>Principal Amount</th>
                  <th>Monthly EMI</th>
                  <th>Interest Rate</th>
                  <th>Remaining Tenure</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan, idx) => (
                  <tr key={idx}>
                    <td><strong>{loan.loan_id}</strong></td>
                    <td style={{ fontWeight: 600, color: '#0f172a' }}>{loan.loan_type?.replace('_', ' ')}</td>
                    <td>₹{loan.principal_amount?.toLocaleString()}</td>
                    <td style={{ fontWeight: 700, color: '#0284c7' }}>₹{loan.emi_amount?.toLocaleString()} / mo</td>
                    <td style={{ color: '#10b981', fontWeight: 600 }}>{loan.interest_rate}% p.a.</td>
                    <td>{loan.remaining_tenure_months} Months</td>
                    <td>
                      <span className="badge badge-success">{loan.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Submit Loan Application */}
      <Modal isOpen={isApplyModalOpen} onClose={() => setIsApplyModalOpen(false)} title="Submit Instant Loan Application">
        {applySuccess ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <CheckCircleIcon size={48} style={{ color: '#10b981', margin: '0 auto 14px auto' }} />
            <h3 style={{ fontSize: '1.3rem', color: '#0f172a', fontWeight: 800, marginBottom: '6px' }}>
              Application Approved & Created!
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
              Your loan facility <strong>{applySuccess.loan_id}</strong> has been created with an EMI of ₹{applySuccess.emi_amount?.toLocaleString()}/month.
            </p>
            <button className="btn btn-primary" onClick={() => { setIsApplyModalOpen(false); setApplySuccess(null); }}>
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmitApplication}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ fontSize: '0.88rem', color: '#475569' }}>Facility Type: <strong>{applyForm.loan_type?.replace('_', ' ')}</strong></div>
              <div style={{ fontSize: '0.88rem', color: '#475569' }}>Requested Principal: <strong>₹{applyForm.amount?.toLocaleString()}</strong></div>
              <div style={{ fontSize: '0.88rem', color: '#475569' }}>Rate / Tenure: <strong>{applyForm.rate}% for {applyForm.tenure} Years</strong></div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}>Income Verification Status</label>
              <input type="text" className="form-control" style={{ paddingLeft: '14px' }} value="Verified via PAN & Net Banking" disabled />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsApplyModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-emerald">
                Confirm & Submit Application
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default LoansView;
