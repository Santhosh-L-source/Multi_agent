import React, { useState } from 'react';
import { BotIcon, SendIcon, SparklesIcon, ShieldCheckIcon } from './Icons';
import { sendChatMessage } from '../services/api';

const ChatAssistant = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your Bank AI Assistant, powered by a Multi-Agent system (Account, Transaction, and Loan agents with PII guardrails). How can I assist you today?',
      agent: 'COORDINATOR'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const quickPrompts = [
    'What is my current account balance?',
    'Show my recent transactions',
    'Calculate EMI for ₹5,00,000 personal loan',
    'Am I eligible for a home loan?'
  ];

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg = { role: 'user', content: query };
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage(query);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: response.text,
          agent: response.agent
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error communicating with the agent server. Please check FastAPI backend status.',
          agent: 'COORDINATOR'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      {/* Header */}
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BotIcon size={22} style={{ color: '#00f2fe' }} />
          <div>
            <h3 style={{ fontSize: '1.05rem', color: '#ffffff', fontWeight: 700 }}>Bank AI Assistant</h3>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Multi-Agent Coordinator Active</span>
          </div>
        </div>

        <div className="shield-badge" style={{ background: 'rgba(0,242,254,0.1)', color: '#00f2fe', borderColor: 'rgba(0,242,254,0.2)' }}>
          <SparklesIcon size={14} />
          <span>Groq LLM Powered</span>
        </div>
      </div>

      {/* Messages Window */}
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-bubble ${msg.role}`}>
            {msg.role === 'assistant' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span className={`agent-badge ${msg.agent || 'COORDINATOR'}`}>
                  {msg.agent || 'COORDINATOR'} AGENT
                </span>
                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Verified Response</span>
              </div>
            )}
            <div>{msg.content}</div>
          </div>
        ))}
        {loading && (
          <div className="chat-bubble assistant">
            <span className="agent-badge COORDINATOR">ROUTING QUERY...</span>
            <div style={{ marginTop: '4px', color: '#64748b' }}>Analyzing request and consulting agent tools...</div>
          </div>
        )}
      </div>

      {/* Quick Prompts */}
      <div style={{ padding: '8px 16px', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px', overflowX: 'auto' }}>
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSend(p)}
            style={{
              background: '#f1f5f9',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '9999px',
              fontSize: '0.78rem',
              color: '#334155',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              cursor: 'pointer'
            }}
          >
            ⚡ {p}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="chat-input-bar">
        <input
          type="text"
          className="form-control"
          style={{ paddingLeft: '14px' }}
          placeholder="Ask AI about balances, transactions, or loan EMI..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className="btn btn-primary" onClick={() => handleSend()} disabled={loading}>
          <SendIcon size={18} />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
};

export default ChatAssistant;
