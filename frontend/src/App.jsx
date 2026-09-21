import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ChatAssistant from './components/ChatAssistant';
import TransactionsView from './pages/TransactionsView';
import LoansView from './pages/LoansView';

function App() {
  const [token, setToken] = useState(localStorage.getItem('access_token'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const userEmail = localStorage.getItem('user_email') || 'customer@bank.com';

  const handleLoginSuccess = (data) => {
    setToken(localStorage.getItem('access_token'));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_email');
    setToken(null);
  };

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userEmail={userEmail}
        onLogout={handleLogout}
      />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'dashboard' && (
          <Dashboard setActiveTab={setActiveTab} />
        )}

        {activeTab === 'chat' && (
          <div className="page-container">
            <div className="page-header">
              <div>
                <h1 className="page-title">AI Multi-Agent Financial Assistant</h1>
                <p className="page-subtitle">Autonomous query classification with Account, Transaction, and Loan agents</p>
              </div>
            </div>
            <ChatAssistant />
          </div>
        )}

        {activeTab === 'transactions' && (
          <TransactionsView />
        )}

        {activeTab === 'loans' && (
          <LoansView />
        )}
      </main>
    </div>
  );
}

export default App;