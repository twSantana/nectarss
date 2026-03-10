import type { Transaction } from '../types';

interface AnnualTrendsProps {
    transactions: Transaction[];
    currentYear: number;
}

export function AnnualTrends({ transactions, currentYear }: AnnualTrendsProps) {
    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    // Initialize arrays with 0 for all 12 months
    const monthlyIncome = new Array(12).fill(0);
    const monthlyExpense = new Array(12).fill(0);

    transactions.forEach(t => {
        const d = new Date(t.date);
        if (d.getFullYear() === currentYear) {
            const monthIndex = d.getMonth();
            if (t.type === 'income') {
                monthlyIncome[monthIndex] += t.amount;
            } else {
                monthlyExpense[monthIndex] += t.amount;
            }
        }
    });

    // Find the maximum value to scale the bars properly
    const maxVal = Math.max(...monthlyIncome, ...monthlyExpense);
    const scale = maxVal > 0 ? 100 / maxVal : 1;

    return (
        <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.4s', marginTop: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px' }}>Estatísticas Anuais ({currentYear})</h3>

            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '200px', paddingBottom: '32px', position: 'relative', borderBottom: '1px solid var(--glass-border)' }}>
                {/* Y-Axis basic labels (optional, keeping it clean might be better) */}

                {months.map((month, index) => {
                    const inc = monthlyIncome[index];
                    const exp = monthlyExpense[index];
                    const incHeight = Math.max(inc * scale, 2); // min height 2px for visibility
                    const expHeight = Math.max(exp * scale, 2);

                    return (
                        <div key={month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative', height: '100%', justifyContent: 'flex-end' }}>
                            <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '100%' }}>
                                {/* Income Bar */}
                                <div
                                    title={`Entradas: R$ ${inc.toFixed(2)}`}
                                    style={{
                                        width: '12px',
                                        height: `${incHeight}%`,
                                        backgroundColor: 'var(--income-color)',
                                        borderRadius: '4px 4px 0 0',
                                        transition: 'height 0.5s ease-out',
                                        opacity: inc > 0 ? 1 : 0.3
                                    }}
                                />
                                {/* Expense Bar */}
                                <div
                                    title={`Saídas: R$ ${exp.toFixed(2)}`}
                                    style={{
                                        width: '12px',
                                        height: `${expHeight}%`,
                                        backgroundColor: 'var(--expense-color)',
                                        borderRadius: '4px 4px 0 0',
                                        transition: 'height 0.5s ease-out',
                                        opacity: exp > 0 ? 1 : 0.3
                                    }}
                                />
                            </div>
                            <span style={{ position: 'absolute', bottom: '-24px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                                {month}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--income-color)', borderRadius: '2px' }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Entradas</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', backgroundColor: 'var(--expense-color)', borderRadius: '2px' }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Saídas</span>
                </div>
            </div>
        </div>
    );
}
