import React from 'react';

interface Alert {
    category: string;
    budget: number;
    spent: number;
    exceeded_by: number;
}

interface Props {
    alerts: Alert[];
}

const BudgetAlerts: React.FC<Props> = ({ alerts }) => {
    if (alerts.length === 0) {
        return null;
    }

    return (
        <div className="budget-alerts">
            <h4>⚠️ Budget Alerts</h4>
            {alerts.map((alert, index) => (
                <div key={index} className="alert-item danger">
                    <span className="alert-icon">🔴</span>
                    <div className="alert-content">
                        <span className="alert-category">{alert.category}</span>
                        <span className="alert-details">
                            Spent ৳{alert.spent.toFixed(2)} / Budget ৳{alert.budget.toFixed(2)}
                        </span>
                        <span className="alert-exceeded">
                            Exceeded by ৳{alert.exceeded_by.toFixed(2)}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BudgetAlerts;