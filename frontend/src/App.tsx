import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

const API_URL = 'http://localhost:8000';

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
}

function App() {
  // Auth states
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState('');
  const [userId, setUserId] = useState<number | null>(null);

  // Transaction states
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    if (userId) {
      fetchTransactions();
      fetchSummary();
    }
  }, [userId]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/transactions?user_id=${userId}`);
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/summary?user_id=${userId}`);
      setTotalIncome(response.data.total_income);
      setTotalExpense(response.data.total_expense);
      setBalance(response.data.balance);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('❌ Passwords do not match!');
      return;
    }

    if (password.length < 4) {
      setError('❌ Password must be at least 4 characters!');
      return;
    }

    try {
      await axios.post(`${API_URL}/api/register`, { username, password });
      setSuccess('✅ Registration successful! Please login.');
      setTimeout(() => {
        setIsLogin(true);
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setSuccess('');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || '❌ Registration failed');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(`${API_URL}/api/login`, { username, password });
      setIsLoggedIn(true);
      setCurrentUser(response.data.username);
      setUserId(response.data.user_id);
      setUsername('');
      setPassword('');
      setSuccess('✅ Login successful!');
    } catch (err: any) {
      setError(err.response?.data?.detail || '❌ Invalid username or password');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser('');
    setUserId(null);
    setTransactions([]);
    setTotalIncome(0);
    setTotalExpense(0);
    setBalance(0);
  };

  const addTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !userId) return;

    try {
      await axios.post(`${API_URL}/api/transactions?user_id=${userId}`, {
        description,
        amount: parseFloat(amount),
        type,
        date: new Date().toLocaleDateString()
      });
      setDescription('');
      setAmount('');
      fetchTransactions();
      fetchSummary();
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const deleteTransaction = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/api/transactions/${id}?user_id=${userId}`);
      fetchTransactions();
      fetchSummary();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  // ============================================
  // LOGIN / REGISTER PAGE
  // ============================================
  if (!isLoggedIn) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-logo">💰</div>
          <h1 className="auth-title">
            <span className="highlight">Personal</span> Finance Tracker
          </h1>
          <p className="auth-subtitle">
            {isLogin ? '🔐 Welcome Back!' : '📝 Create Your Account'}
          </p>

          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <form onSubmit={isLogin ? handleLogin : handleRegister}>
            <div className="auth-input-group">
              <label>👤 Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="auth-input-group">
              <label>🔒 Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {!isLogin && (
              <div className="auth-input-group">
                <label>✅ Confirm Password</label>
                <input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <button type="submit" className="auth-btn">
              {isLogin ? '🚀 Login' : '📝 Register'}
            </button>
          </form>

          <p className="auth-toggle">
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <span onClick={() => { setIsLogin(false); setError(''); setSuccess(''); }}>
                  Register Now ✨
                </span>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <span onClick={() => { setIsLogin(true); setError(''); setSuccess(''); }}>
                  Login Here 🔑
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    );
  }
  

  // ============================================
  // DASHBOARD PAGE
  // ============================================
  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="logo-section">
          <span className="logo-icon">💰</span>
          <h1><span className="highlight">Personal</span> Finance Tracker</h1>
        </div>
        <div className="header-right">
          <span className="user-welcome">👋 Hello, <strong>{currentUser}</strong>!</span>
          <button onClick={handleLogout} className="logout-btn">🚪 Logout</button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="summary-cards">
        <div className="card income-card">
          <div className="card-icon">📈</div>
          <h3>Total Income</h3>
          <p>৳{totalIncome.toFixed(2)}</p>
        </div>
        <div className="card expense-card">
          <div className="card-icon">📉</div>
          <h3>Total Expense</h3>
          <p>৳{totalExpense.toFixed(2)}</p>
        </div>
        <div className="card balance-card">
          <div className="card-icon">💳</div>
          <h3>Balance</h3>
          <p className={balance >= 0 ? 'positive' : 'negative'}>
            ৳{balance.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Add Transaction Form */}
      <div className="form-wrapper">
        <h2 className="form-title">✏️ Add Transaction</h2>
        <form onSubmit={addTransaction} className="add-form">
          <input
            type="text"
            placeholder="📝 Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="💰 Amount (Taka)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <select value={type} onChange={(e) => setType(e.target.value as 'income' | 'expense')}>
            <option value="income">📈 Income</option>
            <option value="expense">📉 Expense</option>
          </select>
          <button type="submit" className="add-btn">➕ Add</button>
        </form>
      </div>

      {/* Transactions List */}
      <div className="transaction-list">
        <h2>📋 Recent Transactions</h2>
        {transactions.length === 0 ? (
          <p className="empty-msg">📭 No transactions yet. Start adding!</p>
        ) : (
          transactions.map((t) => (
            <div key={t.id} className={`transaction-item ${t.type}`}>
              <div className="transaction-info">
                <span className="transaction-desc">
                  {t.type === 'income' ? '📈' : '📉'} {t.description}
                </span>
                <span className="transaction-date">📅 {t.date}</span>
              </div>
              <div className="transaction-amount">
                <span className={t.type === 'income' ? 'positive' : 'negative'}>
                  {t.type === 'income' ? '+' : '-'} ৳{t.amount.toFixed(2)}
                </span>
                <button onClick={() => deleteTransaction(t.id)} className="delete-btn">🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default App;