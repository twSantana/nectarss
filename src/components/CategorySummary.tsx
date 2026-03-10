import type { Transaction } from '../types';
import { type Category, CATEGORY_LABELS } from '../utils';

interface CategorySummaryProps {
    transactions: Transaction[];
}

export function CategorySummary({ transactions }: CategorySummaryProps) {
    // Only look at expenses
    const expenses = transactions.filter(t => t.type === 'expense');

    if (expenses.length === 0) {
        return null;
    }

    const totalExpense = expenses.reduce((acc, t) => acc + t.amount, 0);

    // Group by category
    const categoryTotals = expenses.reduce((acc, t) => {
        const cat = (t.category || 'outros') as Category;
        acc[cat] = (acc[cat] || 0) + t.amount;
        return acc;
    }, {} as Record<Category, number>);

    // Sort by largest expense first
    const sortedCategories = Object.entries(categoryTotals)
        .sort(([, amountA], [, amountB]) => amountB - amountA) as [Category, number][];

    // Colors for the pie chart
    const pieColors: Record<Category, string> = {
        'casa': '#3B82F6', // Blue
        'alimentacao': '#F59E0B', // Amber
        'transporte': '#6366F1', // Indigo
        'fastfood': '#EF4444', // Red
        'lazer': '#8B5CF6', // Purple
        'saude': '#10B981', // Emerald
        'salario': '#10B981', // Not really used for expenses
        'outros': '#64748B' // Slate
    };

    // Calculate conic-gradient stops for the pie chart
    let currentPercentage = 0;
    const gradientStops = sortedCategories.map(([cat, amount]) => {
        const percentage = (amount / totalExpense) * 100;
        const color = pieColors[cat] || pieColors['outros'];
        const stop = `${color} ${currentPercentage}% ${currentPercentage + percentage}%`;
        currentPercentage += percentage;
        return stop;
    }).join(', ');

    return (
        <div className="glass-panel animate-fade-in" style={{ marginBottom: '32px' }}>
            <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                marginBottom: '24px',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
            }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-color)' }}>
                    <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
                    <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
                </svg>
                Gastos por Categoria
            </h3>

            <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '32px',
                alignItems: 'center',
                flexWrap: 'wrap',
                justifyContent: 'center'
            }}>
                {/* Pie Chart */}
                <div style={{
                    width: '180px',
                    height: '180px',
                    borderRadius: '50%',
                    background: `conic-gradient(${gradientStops})`,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    position: 'relative',
                    flexShrink: 0
                }}>
                    {/* Inner hole for donut chart effect */}
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '110px',
                        height: '110px',
                        backgroundColor: 'var(--bg-gradient-start)', // Matches background to look like a hole
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
                    }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total Gastos</span>
                        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>R$ {totalExpense.toFixed(0)}</span>
                    </div>
                </div>

                {/* Legend List */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    flexGrow: 1,
                    minWidth: '250px'
                }}>
                    {sortedCategories.map(([cat, amount]) => {
                        const bg = pieColors[cat] || pieColors['outros'];
                        const percentage = ((amount / totalExpense) * 100).toFixed(1);

                        return (
                            <div key={cat} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: bg }}></div>
                                    <span style={{ fontWeight: 500, fontSize: '14px' }}>{CATEGORY_LABELS[cat] || cat}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <span style={{ fontSize: '14px', fontWeight: 600 }}>R$ {amount.toFixed(2)}</span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)', width: '40px', textAlign: 'right' }}>{percentage}%</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
