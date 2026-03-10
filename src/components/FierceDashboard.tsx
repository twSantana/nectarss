import type { Transaction } from '../types';
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Eye } from 'lucide-react';

interface FierceDashboardProps {
    transactions: Transaction[];
    previousTransactions: Transaction[];
}

export function FierceDashboard({ transactions, previousTransactions }: FierceDashboardProps) {
    // Calculate current and previous totals
    const currentTotalAmount = transactions.reduce((acc, t) => {
        return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);

    const previousTotalAmount = previousTransactions.reduce((acc, t) => {
        return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);

    const percentageChange = previousTotalAmount === 0
        ? 100
        : ((currentTotalAmount - previousTotalAmount) / Math.abs(previousTotalAmount)) * 100;

    // Prepare chart data (cumulative sum over time for the active month)
    // Sort transactions by date ascending
    const sortedTransactions = [...transactions].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    let runningTotal = 0;
    const chartData = sortedTransactions.map(t => {
        runningTotal += (t.type === 'income' ? t.amount : -t.amount);
        return {
            date: new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }),
            time: new Date(t.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            balance: runningTotal,
            rawAmount: t.amount,
            type: t.type
        };
    });

    // If no data or just 1 data point, pad it so area chart looks good
    if (chartData.length === 1) {
        chartData.unshift({ ...chartData[0], date: 'Início', balance: 0, rawAmount: 0 });
    }

    const isPositive = currentTotalAmount >= 0;

    return (
        <div className="glass-panel" style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '24px',
            padding: '32px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Background Glow */}
            <div style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(123, 44, 191, 0.15) 0%, transparent 70%)',
                zIndex: 0,
            }} />

            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '14px', fontWeight: 500 }}>Total Balance</span>
                            <Eye size={16} color="var(--text-secondary)" />
                        </div>
                        <h2 style={{ fontSize: '40px', fontWeight: 700, margin: '0 0 8px 0', color: '#fff' }}>
                            R$ {currentTotalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                                color: isPositive ? 'var(--income-color)' : 'var(--expense-color)',
                                fontSize: '14px',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                {isPositive ? '+' : ''}
                                {currentTotalAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                {' '}
                                ({isPositive ? '+' : ''}{percentageChange.toFixed(2)}%)
                            </span>
                            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>this month</span>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '12px' }}>
                        {['1D', '7D', '1M', 'YTD', 'All'].map((period) => (
                            <button key={period} style={{
                                background: period === '1M' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                border: period === '1M' ? '1px solid rgba(255,255,255,0.1)' : 'none',
                                color: period === '1M' ? '#fff' : 'var(--text-secondary)',
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}>
                                {period}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recharts Area Chart */}
                <div style={{ height: '250px', width: '100%', marginTop: '24px' }}>
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent-color)" stopOpacity={0.5} />
                                        <stop offset="95%" stopColor="var(--accent-color)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(40,40,40,0.9)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                        backdropFilter: 'blur(12px)'
                                    }}
                                    itemStyle={{ color: '#fff', fontWeight: 600 }}
                                    labelStyle={{ color: 'var(--text-secondary)', marginBottom: '4px' }}
                                    formatter={(value: any) => [`R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Saldo']}
                                    labelFormatter={(label, payload) => payload?.[0]?.payload?.time ? `${label} (${payload[0].payload.time})` : label}
                                />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                                    dy={10}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="balance"
                                    stroke="var(--accent-color)"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorBalance)"
                                    activeDot={{ r: 6, fill: '#fff', stroke: 'var(--accent-color)', strokeWidth: 3 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                            Nenhum dado de saldo para este mês.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
