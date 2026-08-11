import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SearchBar from './components/SearchBar';

// Wallet Components Import
import WalletSummary from './components/Wallet/WalletSummary';
import WalletTransactions from './components/Wallet/WalletTransactions';
import FutureBills from './components/Wallet/FutureBills';
import SavingsGoals from './components/Wallet/SavingsGoals';
import MonthlyBudget from './components/Wallet/MonthlyBudget';
import BudgetAlerts from './components/Wallet/BudgetAlerts';

const API_URL = 'http://localhost:8000';

interface Transaction {
  id: number;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
}

interface WalletTransaction {
  id: number;
  amount: number;
  type: string;
  category?: string;
  description?: string;
  date: string;
}

interface FutureBill {
  id: number;
  title: string;
  amount: number;
  due_date: string;
  category?: string;
  is_paid: number;
}

interface SavingsGoal {
  id: number;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  progress: number;
}

interface Budget {
  id: number;
  category: string;
  budget_amount: number;
  spent_amount: number;
  remaining: number;
  percentage: number;
}

interface BudgetAlert {
  category: string;
  budget: number;
  spent: number;
  exceeded_by: number;
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

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Edit states
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editDescription, setEditDescription] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editType, setEditType] = useState<'income' | 'expense'>('income');

  // ===== DARK MODE STATE =====
  const [darkMode, setDarkMode] = useState(false);

  // ===== FILTER STATES =====
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [filterDate, setFilterDate] = useState('');

  // ===== BUDGET ALERT STATE =====
  const [budgetAlert, setBudgetAlert] = useState<string | null>(null);

  // ===== WALLET STATES =====
  const [walletBalance, setWalletBalance] = useState(0);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [futureBills, setFutureBills] = useState<FutureBill[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [budgetAlerts, setBudgetAlerts] = useState<BudgetAlert[]>([]);

  // ===== TOGGLE DARK MODE =====
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode');
  };

  // ===== USE EFFECT =====
  useEffect(() => {
    if (userId) {
      fetchTransactions();
      fetchSummary();
      fetchWallet();
      fetchWalletTransactions();
      fetchFutureBills();
      fetchSavingsGoals();
      fetchBudget();
      fetchBudgetAlerts();
    }
  }, [userId]);

  // ===== CHECK BUDGET ALERT =====
  useEffect(() => {
    checkBudgetAlert();
  }, [transactions, savingsGoals]);

  // ===== EXISTING FUNCTIONS =====
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

  // ===== WALLET FUNCTIONS =====
  const fetchWallet = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/wallet?user_id=${userId}`);
      setWalletBalance(response.data.balance);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  const fetchWalletTransactions = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/wallet/transactions?user_id=${userId}`);
      setWalletTransactions(response.data);
    } catch (error) {
      console.error('Error fetching wallet transactions:', error);
    }
  };

  const handleAddMoney = async (amount: number, description: string, category: string) => {
    try {
      await axios.post(`${API_URL}/api/wallet/add?user_id=${userId}`, {
        amount,
        type: 'add',
        description: description || 'Added money to wallet',
        category: category || 'other'
      });
      fetchWallet();
      fetchWalletTransactions();
      toast.success('✅ Money added to wallet!');
    } catch (error) {
      console.error('Error adding money:', error);
      toast.error('❌ Failed to add money');
    }
  };

  const handleWithdraw = async (amount: number, description: string, category: string) => {
    try {
      await axios.post(`${API_URL}/api/wallet/withdraw?user_id=${userId}`, {
        amount,
        type: 'withdraw',
        description: description || 'Withdrew from wallet',
        category: category || 'other'
      });
      fetchWallet();
      fetchWalletTransactions();
      toast.success('✅ Money withdrawn successfully!');
    } catch (error: any) {
      console.error('Error withdrawing money:', error);
      toast.error(error.response?.data?.detail || '❌ Failed to withdraw money');
    }
  };

  // ===== FUTURE BILLS FUNCTIONS =====
  const fetchFutureBills = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/future-bills?user_id=${userId}`);
      setFutureBills(response.data);
    } catch (error) {
      console.error('Error fetching future bills:', error);
    }
  };

  const handleAddBill = async (title: string, amount: number, due_date: string, category: string) => {
    try {
      await axios.post(`${API_URL}/api/future-bills?user_id=${userId}`, {
        title,
        amount,
        due_date,
        category
      });
      fetchFutureBills();
      toast.success('✅ Bill added successfully!');
    } catch (error) {
      console.error('Error adding bill:', error);
      toast.error('❌ Failed to add bill');
    }
  };

  const handlePayBill = async (billId: number) => {
    try {
      await axios.post(`${API_URL}/api/future-bills/pay/${billId}?user_id=${userId}`);
      fetchWallet();
      fetchFutureBills();
      fetchWalletTransactions();
      toast.success('✅ Bill paid successfully!');
    } catch (error: any) {
      console.error('Error paying bill:', error);
      toast.error(error.response?.data?.detail || '❌ Failed to pay bill');
    }
  };

  // ===== SAVINGS GOALS FUNCTIONS =====
  const fetchSavingsGoals = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/savings-goals?user_id=${userId}`);
      setSavingsGoals(response.data);
    } catch (error) {
      console.error('Error fetching savings goals:', error);
    }
  };

  const handleAddGoal = async (name: string, target_amount: number, deadline: string) => {
    try {
      await axios.post(`${API_URL}/api/savings-goals?user_id=${userId}`, {
        name,
        target_amount,
        deadline
      });
      fetchSavingsGoals();
      toast.success('✅ Savings goal added!');
    } catch (error) {
      console.error('Error adding savings goal:', error);
      toast.error('❌ Failed to add savings goal');
    }
  };

  const handleAddMoneyToGoal = async (goalId: number, amount: number) => {
    try {
      await axios.post(`${API_URL}/api/savings-goals/add-money/${goalId}?user_id=${userId}`, {
        amount
      });
      fetchWallet();
      fetchSavingsGoals();
      fetchWalletTransactions();
      toast.success('✅ Money added to savings goal!');
    } catch (error: any) {
      console.error('Error adding money to goal:', error);
      toast.error(error.response?.data?.detail || '❌ Failed to add money to goal');
    }
  };

  // ===== BUDGET FUNCTIONS =====
  const fetchBudget = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/budget?user_id=${userId}`);
      setBudgets(response.data);
    } catch (error) {
      console.error('Error fetching budget:', error);
    }
  };

  const fetchBudgetAlerts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/budget/alert?user_id=${userId}`);
      setBudgetAlerts(response.data.alerts);
    } catch (error) {
      console.error('Error fetching budget alerts:', error);
    }
  };

  const handleSetBudget = async (category: string, budget_amount: number) => {
    const month = new Date().toLocaleDateString('en-US', { month: '2-digit', year: 'numeric' });
    try {
      await axios.post(`${API_URL}/api/budget?user_id=${userId}`, {
        month,
        category,
        budget_amount
      });
      fetchBudget();
      fetchBudgetAlerts();
      toast.success('✅ Budget set successfully!');
    } catch (error) {
      console.error('Error setting budget:', error);
      toast.error('❌ Failed to set budget');
    }
  };

  // ===== BUDGET ALERT CHECK =====
  const checkBudgetAlert = () => {
    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalBudget = savingsGoals.reduce((sum, g) => sum + g.target_amount, 0);
    
    if (totalBudget > 0 && totalExpense > totalBudget) {
      setBudgetAlert(`⚠️ Budget exceeded! Expense ৳${totalExpense.toFixed(2)} > Budget ৳${totalBudget.toFixed(2)}`);
      toast.warning(`⚠️ Budget exceeded by ৳${(totalExpense - totalBudget).toFixed(2)}!`);
    } else {
      setBudgetAlert(null);
    }
  };

  // ===== EXISTING FUNCTIONS =====
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
      toast.success('✅ Registration successful!');
      setTimeout(() => {
        setIsLogin(true);
        setUsername('');
        setPassword('');
        setConfirmPassword('');
        setSuccess('');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.detail || '❌ Registration failed');
      toast.error(err.response?.data?.detail || '❌ Registration failed');
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
      toast.success('✅ Login successful!');
    } catch (err: any) {
      setError(err.response?.data?.detail || '❌ Invalid username or password');
      toast.error(err.response?.data?.detail || '❌ Invalid username or password');
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
    setWalletBalance(0);
    setWalletTransactions([]);
    setFutureBills([]);
    setSavingsGoals([]);
    setBudgets([]);
    setBudgetAlerts([]);
    setBudgetAlert(null);
    toast.info('👋 Logged out successfully!');
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
      fetchWallet();
      fetchWalletTransactions();
      toast.success('✅ Transaction added successfully!');
    } catch (error: any) {
      console.error('Error adding transaction:', error);
      toast.error(error.response?.data?.detail || '❌ Failed to add transaction');
    }
  };

  const deleteTransaction = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/api/transactions/${id}?user_id=${userId}`);
      fetchTransactions();
      fetchSummary();
      fetchWallet();
      fetchWalletTransactions();
      toast.success('✅ Transaction deleted successfully!');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('❌ Failed to delete transaction');
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setEditDescription(transaction.description);
    setEditAmount(transaction.amount.toString());
    setEditType(transaction.type);
    setIsEditModalOpen(true);
  };

  const updateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction || !editDescription || !editAmount || !userId) return;

    try {
      await axios.put(`${API_URL}/api/transactions/${editingTransaction.id}?user_id=${userId}`, {
        description: editDescription,
        amount: parseFloat(editAmount),
        type: editType,
        date: editingTransaction.date
      });
      
      setIsEditModalOpen(false);
      setEditingTransaction(null);
      fetchTransactions();
      fetchSummary();
      fetchWallet();
      fetchWalletTransactions();
      toast.success('✅ Transaction updated successfully!');
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('❌ Failed to update transaction');
    }
  };

  // ===== FILTERED TRANSACTIONS (FIXED) =====
  const filteredTransactions = transactions.filter((t) => {
    const matchSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filterType === 'all' || t.type === filterType;
    
    // Date format fix: Convert filter date to match transaction date format
    let matchDate = true;
    if (filterDate) {
      const filterDateObj = new Date(filterDate);
      const filterDateStr = `${filterDateObj.getMonth() + 1}/${filterDateObj.getDate()}/${filterDateObj.getFullYear()}`;
      matchDate = t.date === filterDateStr;
    }
    
    return matchSearch && matchType && matchDate;
  });

  // ============================================
  // SIDEBAR COMPONENT
  // ============================================
  const Sidebar = () => (
    <div className="sidebar">
      <div className="sidebar-logo">💰 Finance</div>
      <nav>
        <Link to="/" className="sidebar-link">📊 Dashboard</Link>
        <Link to="/wallet" className="sidebar-link">💳 Wallet</Link>
        <Link to="/bills" className="sidebar-link">📅 Bills</Link>
        <Link to="/goals" className="sidebar-link">🎯 Goals</Link>
        <Link to="/budget" className="sidebar-link">📊 Budget</Link>
      </nav>
      <div className="sidebar-footer">
        <button onClick={toggleDarkMode} className="dark-mode-toggle">
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
        <button onClick={handleLogout} className="logout-btn-sidebar">🚪 Logout</button>
      </div>
    </div>
  );

  // ============================================
  // DASHBOARD CONTENT
  // ============================================
  const DashboardContent = () => (
    <div className="page-container">
      <header className="dashboard-header">
        <div className="logo-section">
          <span className="logo-icon">💰</span>
          <h1><span className="highlight">Personal</span> Finance Tracker</h1>
        </div>
        <div className="header-right">
          <span className="user-welcome">👋 Hello, <strong>{currentUser}</strong>!</span>
        </div>
      </header>

      {budgetAlert && (
        <div className="budget-alert-banner">
          <span className="alert-icon">🔴</span>
          <span>{budgetAlert}</span>
        </div>
      )}

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

      {/* Filter Section */}
      <div className="filter-section">
        <select 
          value={filterType} 
          onChange={(e) => setFilterType(e.target.value as 'all' | 'income' | 'expense')}
          className="filter-select"
        >
          <option value="all">📊 All</option>
          <option value="income">📈 Income</option>
          <option value="expense">📉 Expense</option>
        </select>
        
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="filter-date"
        />
        
        {filterDate && (
          <button onClick={() => setFilterDate('')} className="clear-filter">
            ✕ Clear Date
          </button>
        )}
      </div>

      <SearchBar
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        onClear={() => setSearchTerm('')}
      />

      {filteredTransactions.length === 0 && searchTerm && (
        <p className="no-result">❌ No transaction found for "{searchTerm}"</p>
      )}

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

      <div className="transaction-list">
        <h2>📋 Recent Transactions</h2>
        {filteredTransactions.length === 0 && !searchTerm && !filterDate && filterType === 'all' ? (
          <p className="empty-msg">📭 No transactions yet. Start adding!</p>
        ) : filteredTransactions.length === 0 ? (
          <p className="empty-msg">📭 No transactions match your filters</p>
        ) : (
          filteredTransactions.map((t) => (
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
                <div className="transaction-actions">
                  <button onClick={() => handleEdit(t)} className="edit-btn">✏️</button>
                  <button onClick={() => deleteTransaction(t.id)} className="delete-btn">🗑️</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {isEditModalOpen && editingTransaction && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>✏️ Edit Transaction</h2>
            <form onSubmit={updateTransaction}>
              <input
                type="text"
                placeholder="Description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Amount (Taka)"
                value={editAmount}
                onChange={(e) => setEditAmount(e.target.value)}
                required
              />
              <select value={editType} onChange={(e) => setEditType(e.target.value as 'income' | 'expense')}>
                <option value="income">📈 Income</option>
                <option value="expense">📉 Expense</option>
              </select>
              <div className="modal-buttons">
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="cancel-btn">Cancel</button>
                <button type="submit" className="save-btn">💾 Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // ============================================
  // WALLET CONTENT
  // ============================================
  const WalletContent = () => (
    <div className="page-container">
      <h1>💳 Wallet</h1>
      <WalletSummary
        walletBalance={walletBalance}
        totalIncome={totalIncome}
        totalExpense={totalExpense}
      />
      <BudgetAlerts alerts={budgetAlerts} />
      <WalletTransactions
        transactions={walletTransactions}
        onAddMoney={handleAddMoney}
        onWithdraw={handleWithdraw}
      />
    </div>
  );

  // ============================================
  // BILLS CONTENT
  // ============================================
  const BillsContent = () => (
    <div className="page-container">
      <h1>📅 Future Bills</h1>
      <FutureBills
        bills={futureBills}
        onAddBill={handleAddBill}
        onPayBill={handlePayBill}
      />
    </div>
  );

  // ============================================
  // GOALS CONTENT
  // ============================================
  const GoalsContent = () => (
    <div className="page-container">
      <h1>🎯 Savings Goals</h1>
      <SavingsGoals
        goals={savingsGoals}
        onAddGoal={handleAddGoal}
        onAddMoney={handleAddMoneyToGoal}
      />
    </div>
  );

  // ============================================
  // BUDGET CONTENT
  // ============================================
  const BudgetContent = () => (
    <div className="page-container">
      <h1>📊 Monthly Budget</h1>
      <MonthlyBudget
        budgets={budgets}
        onSetBudget={handleSetBudget}
      />
    </div>
  );

  // ============================================
  // LOGIN / REGISTER PAGE
  // ============================================
  if (!isLoggedIn) {
    return (
      <>
        <ToastContainer position="top-right" autoClose={3000} />
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
      </>
    );
  }

  // ============================================
  // MAIN APP WITH ROUTER
  // ============================================
  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Router>
        <div className={`app-container ${darkMode ? 'dark-mode' : ''}`}>
          <Sidebar />
          <div className="main-content">
            <Routes>
              <Route path="/" element={<DashboardContent />} />
              <Route path="/wallet" element={<WalletContent />} />
              <Route path="/bills" element={<BillsContent />} />
              <Route path="/goals" element={<GoalsContent />} />
              <Route path="/budget" element={<BudgetContent />} />
            </Routes>
          </div>
        </div>
      </Router>
    </>
  );
}

export default App;