import type { Transaction } from '../types';

interface DashboardProps {
    transactions: Transaction[];
    previousTransactions?: Transaction[];
}

export function Dashboard({ transactions, previousTransactions = [] }: DashboardProps) {
    const income = transactions
        .filter((t) => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);

    const expense = transactions
        .filter((t) => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

    const balance = income - expense;

    const prevIncome = previousTransactions
        .filter((t) => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);

    const prevExpense = previousTransactions
        .filter((t) => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

    const prevBalance = prevIncome - prevExpense;

    const calculatePercentageChange = (current: number, previous: number) => {
        if (previous === 0) return current > 0 ? 100 : 0;
        return ((current - previous) / Math.abs(previous)) * 100;
    };

    const balanceChange = calculatePercentageChange(balance, prevBalance);
    const incomeChange = calculatePercentageChange(income, prevIncome);
    const expenseChange = calculatePercentageChange(expense, prevExpense);

    const renderIndicator = (change: number, invertGoodBad = false) => {
        if (change === 0) return null;
        const isPositive = change > 0;
        // For expenses, an increase is "bad" (red), decrease is "good" (green)
        const isGood = invertGoodBad ? !isPositive : isPositive;
        const color = isGood ? 'var(--income-color)' : 'var(--expense-color)';
        const text = isPositive ? `▲ ${change.toFixed(1)}%` : `▼ ${Math.abs(change).toFixed(1)}%`;

        return (
            <span style={{ fontSize: '12px', color, fontWeight: 500, marginLeft: '8px', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: '4px' }}>
                {text}
            </span>
        );
    };

    return (
        <>
            <div className="dashboard-grid animate-fade-in" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '24px',
                marginBottom: '32px'
            }}>
                <div className="glass-panel" style={{ borderLeft: '4px solid var(--accent-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Saldo Atual</h3>
                        {renderIndicator(balanceChange)}
                    </div>
                    <p style={{ fontSize: '32px', fontWeight: 'bold' }}>
                        R$ {balance.toFixed(2)}
                    </p>
                </div>

                <div className="glass-panel" style={{ borderLeft: '4px solid var(--income-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Entradas</h3>
                        {renderIndicator(incomeChange)}
                    </div>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--income-color)' }}>
                        R$ {income.toFixed(2)}
                    </p>
                </div>

                <div className="glass-panel" style={{ borderLeft: '4px solid var(--expense-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h3 style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Saídas</h3>
                        {renderIndicator(expenseChange, true)}
                    </div>
                    <p style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--expense-color)' }}>
                        R$ {expense.toFixed(2)}
                    </p>
                </div>
            </div>
        </>
    );
}
