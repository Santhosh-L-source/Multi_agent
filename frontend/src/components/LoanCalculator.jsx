import React, { useState } from 'react';
import { CreditCardIcon, CheckCircleIcon } from './Icons';

const LoanCalculator = ({ onApplyLoan }) => {
  const [amount, setAmount] = useState(500000);
  const [rate, setRate] = useState(9.5);
  const [tenure, setTenure] = useState(3);
  const [loanType, setLoanType] = useState('PERSONAL_LOAN');

  const monthlyRate = (rate / 12) / 100;
  const months = tenure * 12;

  const emi = months > 0 && monthlyRate > 0
    ? Math.round((amount * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1))
    : 0;

  const totalPayment = emi * months;
  const totalInterest = Math.max(0, totalPayment - amount);

  return (
    <div className="content-card">
      <div className="card-header">
        <div className="card-header-title">
          <CreditCardIcon size={20} style={{ color: '#0284c7' }} />
          <span>Interactive Loan EMI & Eligibility Calculator</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '28px' }}>
        {/* Sliders Form */}
        <div>
          <div style={{ marginBottom: '18px' }}>
            <label className="form-label">Loan Product Type</label>
            <select className="form-select" style={{ width: '100%' }} value={loanType} onChange={(e) => setLoanType(e.target.value)}>
              <option value="PERSONAL_LOAN">Personal Loan (9.5% starting rate)</option>
              <option value="HOME_LOAN">Home Loan (8.5% starting rate)</option>
              <option value="AUTO_LOAN">Auto Loan (9.0% starting rate)</option>
              <option value="EDUCATION_LOAN">Education Loan (7.9% starting rate)</option>
            </select>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>Loan Amount</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0284c7' }}>₹{amount.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="50000"
              max="10000000"
              step="50000"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#0284c7' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>Interest Rate (% per annum)</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#10b981' }}>{rate}%</span>
            </div>
            <input
              type="range"
              min="5"
              max="20"
              step="0.1"
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#10b981' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#334155' }}>Loan Tenure (Years)</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#6366f1' }}>{tenure} Years ({months} Months)</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#6366f1' }}
            />
          </div>
        </div>

        {/* Calculation Result Summary */}
        <div style={{ background: '#f8fafc', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b' }}>
              Estimated Monthly EMI
            </span>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#0f172a', fontFamily: 'Outfit, sans-serif', margin: '4px 0 16px 0' }}>
              ₹{emi.toLocaleString()} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>/ month</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: '#475569', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Principal Amount:</span>
                <strong>₹{amount.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Interest Payable:</span>
                <strong style={{ color: '#f59e0b' }}>₹{totalInterest.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #cbd5e1' }}>
                <span>Total Amount Payable:</span>
                <strong style={{ color: '#0f172a' }}>₹{totalPayment.toLocaleString()}</strong>
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px' }}
            onClick={() => onApplyLoan && onApplyLoan({ amount, rate, tenure, loan_type: loanType })}
          >
            <CheckCircleIcon size={18} />
            <span>Submit Instant Loan Application</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoanCalculator;
