import type { Transaction } from '../types';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Gift, ArrowRight } from 'lucide-react';

interface FierceRewardsProps {
    transactions: Transaction[];
}

// Generate aesthetic colors for the pie chart
const PIE_COLORS = ['#38bdf8', '#7b2cbf', '#f43f5e', '#fbbf24', '#34d399', '#f97316'];

export function FierceRewards({ transactions }: FierceRewardsProps) {
    // We'll treat expenses natively to define the "rewards" in the Fierce clone style
    const expenseTransactions = transactions.filter(t => t.type === 'expense');

    const categoryTotals = expenseTransactions.reduce((acc, t) => {
        const cat = t.category || 'Outros';
        acc[cat] = (acc[cat] || 0) + t.amount;
        return acc;
    }, {} as Record<string, number>);

    const data = Object.entries(categoryTotals)
        .sort((a, b) => b[1] - a[1]) // highest first
        .map(([name, value], index) => ({
            name,
            value,
            color: PIE_COLORS[index % PIE_COLORS.length]
        }));

    const totalSpent = data.reduce((acc, item) => acc + item.value, 0);

    return (
        <div className="glass-panel" style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '24px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Gift size={20} />
                    Fierce Rewards <span style={{ color: 'var(--text-secondary)', cursor: 'help' }}>ⓘ</span>
                </h3>
                <button style={{
                    background: 'rgba(255,255,255,0.1)',
                    border: '1px solid var(--glass-border)',
                    color: '#fff',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '12px'
                }}>
                    Month ⌄
                </button>
            </div>

            <div style={{ height: '220px', width: '100%', position: 'relative', marginTop: '16px' }}>
                {data.length > 0 ? (
                    <>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={95}
                                    stroke="none"
                                    paddingAngle={5}
                                    dataKey="value"
                                    cornerRadius={10}
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'rgba(40,40,40,0.9)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        color: '#fff',
                                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                        backdropFilter: 'blur(12px)'
                                    }}
                                    itemStyle={{ fontWeight: 600 }}
                                    formatter={(value: any) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                                />
                            </PieChart>
                        </ResponsiveContainer>

                        {/* Center Text */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            textAlign: 'center'
                        }}>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '12px', margin: '0 0 4px 0' }}>Gastos do Mês</p>
                            <p style={{ color: '#fff', fontSize: '20px', fontWeight: 700, margin: 0 }}>
                                R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </p>
                        </div>
                    </>
                ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', textAlign: 'center' }}>
                        Nenhum dado para o gráfico de recompensas.
                    </div>
                )}
            </div>

            {/* Legend / Breakdown */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
                {data.slice(0, 4).map((item, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                                {item.name}
                            </span>
                        </div>
                        <span style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>
                            R$ {item.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                ))}
            </div>

            <button style={{
                marginTop: '24px',
                width: '100%',
                padding: '16px',
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid var(--glass-border)',
                borderRadius: '16px',
                color: '#fff',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: 600,
                cursor: 'pointer'
            }}>
                Transfer to Earn <ArrowRight size={18} />
            </button>

        </div>
    );
}
