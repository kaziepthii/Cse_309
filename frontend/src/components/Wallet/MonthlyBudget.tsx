import React, { useState } from 'react';

interface Budget {
    id: number;
    category: string;
    budget_amount: number;
    spent_amount: number;
    remaining: number;
    percentage: number;
}

interface Props {
    budgets: Budget[];
    onSetBudget: (category: string, amount: number) => void;
}

const MonthlyBudget: React.FC<Props> = ({ budgets, onSetBudget }) => {
    const [category, setCategory] = useState('');
    const [amount, setAmount] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!category || !amount) return;
        onSetBudget(category, parseFloat(amount));
        setCategory('');
        setAmount('');
    };

    const totalBudget = budgets.reduce((sum, b) => sum + b.budget_amount, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent_amount, 0);
    const totalRemaining = totalBudget - totalSpent;

    return (
        <div className="monthly-budget">
            <h4>📊 Monthly Budget</h4>

            {/* Total Budget Summary */}
            <div className="budget-total">
                <div className="budget-total-item">
                    <span>Total Budget</span>
                    <span>৳{totalBudget.toFixed(2)}</span>
                </div>
                <div className="budget-total-item">
                    <span>Total Spent</span>
                    <span className="expense">৳{totalSpent.toFixed(2)}</span>
                </div>
                <div className="budget-total-item">
                    <span>Remaining</span>
                    <span className={totalRemaining >= 0 ? 'positive' : 'negative'}>
                        ৳{totalRemaining.toFixed(2)}
                    </span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="wallet-form">
                <input
                    type="text"
                    placeholder="Category (e.g., Food, Transport)"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Budget Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />
                <button type="submit">📊 Set Budget</button>
            </form>

            {budgets.length === 0 ? (
                <p className="empty-msg">No budgets set yet</p>
            ) : (
                budgets.map((b) => (
                    <div key={b.id} className="budget-item">
                        <div className="budget-header">
                            <span className="budget-category">{b.category}</span>
                            <span className="budget-amount">৳{b.budget_amount.toFixed(2)}</span>
                        </div>
                        <div className="budget-details">
                            <span>Spent: ৳{b.spent_amount.toFixed(2)}</span>
                            <span className={b.remaining >= 0 ? 'positive' : 'negative'}>
                                Remaining: ৳{b.remaining.toFixed(2)}
                            </span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className={`progress ${b.percentage > 100 ? 'danger' : ''}`}
                                style={{ width: `${Math.min(b.percentage, 100)}%` }}
                            >
                                {b.percentage.toFixed(0)}%
                            </div>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default MonthlyBudget;