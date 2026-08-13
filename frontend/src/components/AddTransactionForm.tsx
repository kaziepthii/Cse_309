import React, { useState } from 'react';

interface Props {
  onAdd: (data: { description: string; amount: number; type: 'income' | 'expense' }) => void;
}

const AddTransactionForm: React.FC<Props> = ({ onAdd }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount) return;
    onAdd({ description, amount: parseFloat(amount), type });
    setDescription('');
    setAmount('');
  };

  return (
    <div className="form-wrapper">
      <h2 className="form-title">✏️ Add Transaction</h2>
      <form onSubmit={handleSubmit} className="add-form">
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
  );
};

export default AddTransactionForm;