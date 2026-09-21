import React, { useState } from 'react';
import { BotIcon, UserIcon, LockIcon, ArrowRightIcon, ShieldCheckIcon } from '../components/Icons';
import { login } from '../services/api';

const Login = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const demoAccounts = [
    { label: 'Customer Login', email: 'rahul.verma@bank.com', pass: 'customer123' },
    { label: 'Enterprise VIP', email: 'vip.client@bank.com', pass: 'vip123' },
    { label: 'Demo Account', email: 'demo@bank.com', pass: 'demo123' }
  ];

  const handleDemoSelect = (acc) => {
    setEmail(acc.email);
    setPassword(acc.pass);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const data = await login(email, password);
      onLoginSuccess(data);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-backdrop">
      <div className="auth-wrapper">
        {/* Left Hero */}
        <div className="auth-hero">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div className="brand-icon-wrapper" style={{ width: 44, height: 44 }}>
                <BotIcon size={26} />
              </div>
              <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif' }}>
                Bank AI Platform
              </span>
            </div>

            <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#ffffff', marginBottom: '12px', lineHeight: 1.2 }}>
              Autonomous Multi-Agent Financial Assistant
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.6, marginBottom: '32px' }}>
              Experience real-time AI account management, multi-agent query routing (Account, Transaction, and Loan agents), and PII guardrails.
            </p>
          </div>

          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px', color: '#cbd5e1' }}>
              Select Quick Demo Credentials:
            </span>
            <div className="demo-roles-grid">
              {demoAccounts.map((acc, idx) => (
                <button
                  key={idx}
                  className="demo-role-btn"
                  onClick={() => handleDemoSelect(acc)}
                  type="button"
                >
                  <UserIcon size={14} style={{ color: '#00f2fe' }} />
                  <span>{acc.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="auth-form-card">
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '4px' }}>
            Banking Portal Login
          </h3>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '24px' }}>
            Access your secure AI-managed accounts and financial tools
          </p>

          {error && (
            <div style={{ backgroundColor: '#ffe4e6', color: '#be123c', padding: '10px 14px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '18px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="search-filter-bar" style={{ flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
              <div className="input-group" style={{ width: '100%' }}>
                <UserIcon className="input-icon" size={18} />
                <input
                  type="email"
                  className="form-control"
                  placeholder="Email Address (e.g. rahul.verma@bank.com)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="input-group" style={{ width: '100%' }}>
                <LockIcon className="input-icon" size={18} />
                <input
                  type="password"
                  className="form-control"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
              <span>{loading ? 'Authenticating...' : 'Sign In to Account'}</span>
              <ArrowRightIcon size={18} />
            </button>
          </form>

          <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#64748b' }}>
            <ShieldCheckIcon size={16} style={{ color: '#10b981' }} />
            <span>Presidio PII Protection & 256-bit Encryption Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;