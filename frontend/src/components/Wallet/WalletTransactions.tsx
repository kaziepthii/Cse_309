import React, { useState } from 'react';

interface Transaction {
    id: number;
    amount: number;
    type: string;
    category?: string;
    description?: string;
    date: string;
}

interface Props {
    transactions: Transaction[];
    onAddMoney: (amount: number, description: string, category: string) => void;
    onWithdraw: (amount: number, description: string, category: string) => void;
}

const WalletTransactions: React.FC<Props> = ({ transactions, onAddMoney, onWithdraw }) => {
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [isAddMode, setIsAddMode] = useState(true);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!amount) return;
        if (isAddMode) {
            onAddMoney(parseFloat(amount), description, category);
        } else {
            onWithdraw(parseFloat(amount), description, category);
        }
        setAmount('');
        setDescription('');
        setCategory('');
    };

    return (
        <div className="wallet-transactions">
            <h4>📋 Wallet Transactions</h4>

            {/* Add/Withdraw Form */}
            <div className="wallet-form">
                <div className="form-toggle">
                    <button
                        className={isAddMode ? 'active' : ''}
                        onClick={() => setIsAddMode(true)}
                    >
                        ➕ Add Money
                    </button>
                    <button
                        className={!isAddMode ? 'active' : ''}
                        onClick={() => setIsAddMode(false)}
                    >
                        💸 Withdraw
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <input
                        type="number"
                        placeholder="Amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Description (optional)"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <option value="">Category</option>
                        <option value="food">🍔 Food</option>
                        <option value="travel">✈️ Travel</option>
                        <option value="shopping">🛍️ Shopping</option>
                        <option value="bill">📄 Bill</option>
                        <option value="salary">💼 Salary</option>
                        <option value="gift">🎁 Gift</option>
                        <option value="other">📦 Other</option>
                    </select>
                    <button type="submit">
                        {isAddMode ? '➕ Add Money' : '💸 Withdraw'}
                    </button>
                </form>
            </div>

            {/* Transaction List */}
            {transactions.length === 0 ? (
                <p className="empty-msg">No transactions yet</p>
            ) : (
                transactions.map((t) => (
                    <div key={t.id} className={`wallet-item ${t.type}`}>
                        <div className="wallet-item-info">
                            <span className="category-icon">
                                {t.category === 'food' && '🍔'}
                                {t.category === 'travel' && '✈️'}
                                {t.category === 'shopping' && '🛍️'}
                                {t.category === 'bill' && '📄'}
                                {t.category === 'salary' && '💼'}
                                {t.category === 'gift' && '🎁'}
                                {t.category === 'other' && '📦'}
                            </span>
                            <span className="description">{t.description || t.type}</span>
                        </div>
                        <span className={t.type === 'income' || t.type === 'add' ? 'positive' : 'negative'}>
                            {t.type === 'income' || t.type === 'add' ? '+' : '-'} ৳{t.amount.toFixed(2)}
                        </span>
                        <span className="date">{t.date}</span>
                    </div>
                ))
            )}
        </div>
    );
};

export default WalletTransactions;