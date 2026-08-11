import React from 'react';

interface Props {
    walletBalance: number;
    totalIncome: number;
    totalExpense: number;
}

const WalletSummary: React.FC<Props> = ({ walletBalance, totalIncome, totalExpense }) => {
    return (
        <div className="wallet-summary">
            <h3>💰 Wallet Overview</h3>
            <div className="summary-grid">
                <div className="summary-card wallet">
                    <span>Wallet Balance</span>
                    <h2>৳{walletBalance.toFixed(2)}</h2>
                </div>
                <div className="summary-card income">
                    <span>Total Income</span>
                    <h2 className="positive">+৳{totalIncome.toFixed(2)}</h2>
                </div>
                <div className="summary-card expense">
                    <span>Total Expense</span>
                    <h2 className="negative">-৳{totalExpense.toFixed(2)}</h2>
                </div>
            </div>
        </div>
    );
};

export default WalletSummary;