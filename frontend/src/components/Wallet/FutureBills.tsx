import React, { useState } from 'react';

interface Bill {
    id: number;
    title: string;
    amount: number;
    due_date: string;
    category?: string;
    is_paid: number;
}

interface Props {
    bills: Bill[];
    onAddBill: (title: string, amount: number, due_date: string, category: string) => void;
    onPayBill: (billId: number) => void;
}

const FutureBills: React.FC<Props> = ({ bills, onAddBill, onPayBill }) => {
    const [title, setTitle] = useState('');
    const [amount, setAmount] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [category, setCategory] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !amount || !dueDate) return;
        onAddBill(title, parseFloat(amount), dueDate, category);
        setTitle('');
        setAmount('');
        setDueDate('');
        setCategory('');
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="future-bills">
            <h4>📅 Future Bills & Reminders</h4>

            <form onSubmit={handleSubmit} className="wallet-form">
                <input
                    type="text"
                    placeholder="Bill Title (e.g., Hospital Bill)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                />
                <input
                    type="date"
                    value={dueDate}
                    min={today}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                />
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                    <option value="">Category</option>
                    <option value="hospital">🏥 Hospital</option>
                    <option value="education">📚 Education</option>
                    <option value="utility">⚡ Utility</option>
                    <option value="rent">🏠 Rent</option>
                    <option value="loan">💰 Loan</option>
                    <option value="other">📦 Other</option>
                </select>
                <button type="submit">➕ Add Bill</button>
            </form>

            {bills.length === 0 ? (
                <p className="empty-msg">No upcoming bills</p>
            ) : (
                bills.map((bill) => {
                    const dueDate = new Date(bill.due_date);
                    const today = new Date();
                    const isDue = dueDate <= today;
                    const daysLeft = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                    return (
                        <div key={bill.id} className={`bill-item ${isDue ? 'due' : ''}`}>
                            <div className="bill-info">
                                <span className="bill-title">
                                    {bill.category === 'hospital' && '🏥 '}
                                    {bill.category === 'education' && '📚 '}
                                    {bill.category === 'utility' && '⚡ '}
                                    {bill.category === 'rent' && '🏠 '}
                                    {bill.category === 'loan' && '💰 '}
                                    {bill.title}
                                </span>
                                <span className="bill-amount">৳{bill.amount.toFixed(2)}</span>
                            </div>
                            <div className="bill-meta">
                                <span className={`bill-date ${isDue ? 'due' : ''}`}>
                                    📅 Due: {bill.due_date}
                                    {!isDue && daysLeft > 0 && ` (${daysLeft} days left)`}
                                    {isDue && ' ⚠️ Due Today!'}
                                </span>
                                <button
                                    className="pay-btn"
                                    onClick={() => onPayBill(bill.id)}
                                    disabled={bill.is_paid === 1}
                                >
                                    {bill.is_paid === 1 ? '✅ Paid' : '💳 Pay Now'}
                                </button>
                            </div>
                        </div>
                    );
                })
            )}
        </div>
    );
};

export default FutureBills;