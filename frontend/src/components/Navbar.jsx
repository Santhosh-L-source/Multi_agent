import React from 'react';
import {
  WalletIcon,
  BotIcon,
  PieChartIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  LogOutIcon
} from './Icons';

const Navbar = ({ activeTab, setActiveTab, userEmail, onLogout }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: WalletIcon },
    { id: 'chat', label: 'AI Assistant', icon: BotIcon },
    { id: 'transactions', label: 'Transactions & Transfers', icon: PieChartIcon },
    { id: 'loans', label: 'Loans & EMI Calculator', icon: CreditCardIcon },
  ];

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <div className="brand-icon-wrapper">
          <BotIcon size={22} />
        </div>
        <span>Bank AI System</span>
      </div>

      <nav>
        <ul className="navbar-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <Icon size={17} />
                  <span>{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div className="shield-badge">
          <ShieldCheckIcon size={16} />
          <span>PII Masked & Guarded</span>
        </div>

        <button className="btn-logout" onClick={onLogout} title="Logout">
          <LogOutIcon size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
