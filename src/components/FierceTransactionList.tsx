import type { Transaction } from '../types';
import { Edit2, Trash2, CheckCircle2, Circle } from 'lucide-react';
import { CATEGORY_LABELS } from '../utils';

interface FierceTransactionListProps {
    transactions: Transaction[];
    onDelete: (id: string) => void;
    onEdit: (id: string, updated: Omit<Transaction, 'id'>) => void;
    onTogglePaid: (id: string, currentStatus: boolean) => void;
}

export function FierceTransactionList({ transactions, onDelete, onEdit, onTogglePaid }: FierceTransactionListProps) {
    // Sort by date descending
    const sorted = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Group by date
    const grouped = sorted.reduce((acc, t) => {
        const dateStr = new Date(t.date).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
        if (!acc[dateStr]) acc[dateStr] = [];
        acc[dateStr].push(t);
        return acc;
    }, {} as Record<string, Transaction[]>);

    if (transactions.length === 0) {
        return (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                Nenhuma transação registrada.
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {Object.entries(grouped).map(([date, dayTransactions]) => (
                <div key={date}>
                    <h4 style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', marginBottom: '12px', paddingLeft: '8px' }}>
                        {date}
                    </h4>

                    <div className="glass-panel" style={{
                        background: 'var(--glass-bg)',
                        padding: 0,
                        borderRadius: '16px',
                        overflow: 'hidden',
                        border: '1px solid var(--glass-border)'
                    }}>
                        {dayTransactions.map((t, i) => (
                            <div key={t.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '16px 20px',
                                borderBottom: i < dayTransactions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                                gap: '16px',
                                transition: 'background 0.2s, opacity 0.2s',
                                opacity: t.isPaid === false ? 0.6 : 1,
                                cursor: 'pointer'
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
                                    e.currentTarget.style.opacity = '1';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.opacity = t.isPaid === false ? '0.6' : '1';
                                }}
                            >
                                {/* Toggle Check */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onTogglePaid(t.id, t.isPaid ?? true);
                                    }}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        padding: 0,
                                        color: t.isPaid === false ? 'var(--text-secondary)' : 'var(--accent-color)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}
                                    title={t.isPaid === false ? 'Marcar como pago' : 'Marcar como pendente'}
                                >
                                    {t.isPaid === false ? <Circle size={20} /> : <CheckCircle2 size={20} />}
                                </button>

                                {/* Icon */}
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '12px',
                                    background: t.type === 'income' ? 'var(--income-glow)' : 'var(--expense-glow)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: t.type === 'income' ? 'var(--income-color)' : 'var(--expense-color)',
                                    fontWeight: 'bold',
                                    fontSize: '14px'
                                }}>
                                    {(t.category || 'NA').substring(0, 2).toUpperCase()}
                                </div>

                                {/* Details */}
                                <div style={{ flex: 1, overflow: 'hidden' }}>
                                    <p style={{ color: '#fff', fontSize: '15px', fontWeight: 500, margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {t.description} {t.isRecurring && <span style={{ fontSize: '12px' }}>🔄</span>}
                                    </p>
                                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
                                        {CATEGORY_LABELS[t.category as keyof typeof CATEGORY_LABELS] || t.category}
                                        {t.paymentMethod && ` • ${t.paymentMethod}`}
                                    </p>
                                </div>

                                {/* Amount */}
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{
                                        color: t.type === 'income' ? 'var(--income-color)' : '#fff',
                                        fontSize: '16px',
                                        fontWeight: 600,
                                        margin: '0 0 4px 0'
                                    }}>
                                        {t.type === 'income' ? '+' : '-'} {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </p>

                                    {/* Actions on hover could go here, for simplicity we'll show them small */}
                                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                                        <button onClick={() => {
                                            const amountStr = prompt('Novo valor (R$):', t.amount.toString());
                                            if (amountStr && !isNaN(Number(amountStr))) {
                                                const { id, ...rest } = t;
                                                onEdit(t.id, { ...rest, amount: Number(amountStr) });
                                            }
                                        }} style={{ background: 'transparent', border: 'none', padding: '4px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                                            <Edit2 size={14} />
                                        </button>
                                        <button onClick={() => onDelete(t.id)} style={{ background: 'transparent', border: 'none', padding: '4px', color: 'var(--expense-color)', cursor: 'pointer' }}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
