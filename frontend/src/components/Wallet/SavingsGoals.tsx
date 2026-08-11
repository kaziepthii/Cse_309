import React, { useState } from 'react';

interface Goal {
    id: number;
    name: string;
    target_amount: number;
    current_amount: number;
    deadline?: string;
    progress: number;
}

interface Props {
    goals: Goal[];
    onAddGoal: (name: string, target_amount: number, deadline: string) => void;
    onAddMoney: (goalId: number, amount: number) => void;
}

const SavingsGoals: React.FC<Props> = ({ goals, onAddGoal, onAddMoney }) => {
    const [name, setName] = useState('');
    const [target, setTarget] = useState('');
    const [deadline, setDeadline] = useState('');
    const [addAmount, setAddAmount] = useState<{ [key: number]: string }>({});

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !target) return;
        onAddGoal(name, parseFloat(target), deadline);
        setName('');
        setTarget('');
        setDeadline('');
    };

    const handleAddMoney = (goalId: number) => {
        const amount = parseFloat(addAmount[goalId] || '0');
        if (amount <= 0) return;
        onAddMoney(goalId, amount);
        setAddAmount({ ...addAmount, [goalId]: '' });
    };

    return (
        <div className="savings-goals">
            <h4>🎯 Savings Goals</h4>

            <form onSubmit={handleSubmit} className="wallet-form">
                <input
                    type="text"
                    placeholder="Goal Name (e.g., New Laptop)"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="number"
                    placeholder="Target Amount"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    required
                />
                <input
                    type="date"
                    placeholder="Deadline (optional)"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                />
                <button type="submit">🎯 Add Goal</button>
            </form>

            {goals.length === 0 ? (
                <p className="empty-msg">No savings goals yet</p>
            ) : (
                goals.map((goal) => (
                    <div key={goal.id} className="goal-item">
                        <div className="goal-header">
                            <span className="goal-name">{goal.name}</span>
                            <span className="goal-amount">
                                ৳{goal.current_amount.toFixed(2)} / ৳{goal.target_amount.toFixed(2)}
                            </span>
                        </div>

                        <div className="progress-bar">
                            <div
                                className="progress"
                                style={{ width: `${Math.min(goal.progress, 100)}%` }}
                            >
                                {goal.progress.toFixed(0)}%
                            </div>
                        </div>

                        {goal.deadline && (
                            <div className="goal-deadline">
                                📅 Deadline: {goal.deadline}
                            </div>
                        )}

                        <div className="goal-add-money">
                            <input
                                type="number"
                                placeholder="Add amount"
                                value={addAmount[goal.id] || ''}
                                onChange={(e) => setAddAmount({ ...addAmount, [goal.id]: e.target.value })}
                                min="1"
                            />
                            <button onClick={() => handleAddMoney(goal.id)}>
                                ➕ Add
                            </button>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default SavingsGoals;