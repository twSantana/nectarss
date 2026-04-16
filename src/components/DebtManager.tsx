import { useMemo } from 'react';
import type { Transaction } from '../types';
import { Calendar as CalendarIcon, AlertTriangle, CheckCircle, Wallet } from 'lucide-react';
import { CATEGORY_LABELS } from '../utils';

interface DebtManagerProps {
    transactions: Transaction[];
    onTogglePaid: (id: string, currentStatus: boolean) => void;
}

export function DebtManager({ transactions, onTogglePaid }: DebtManagerProps) {
    const todayDate = new Date();
    todayDate.setUTCHours(0, 0, 0, 0);

    const pendingDebts = useMemo(() => {
        return transactions.filter(t => t.type === 'expense' && t.isPaid === false);
    }, [transactions]);

    const { overdue, today, upcoming } = useMemo(() => {
        const result = {
            overdue: [] as Transaction[],
            today: [] as Transaction[],
            upcoming: [] as Transaction[]
        };

        pendingDebts.forEach(debt => {
            const debtDate = new Date(debt.date);
            debtDate.setUTCHours(0, 0, 0, 0);

            if (debtDate.getTime() < todayDate.getTime()) {
                result.overdue.push(debt);
            } else if (debtDate.getTime() === todayDate.getTime()) {
                result.today.push(debt);
            } else {
                result.upcoming.push(debt);
            }
        });

        // Sort by date ascending
        const sortAsc = (a: Transaction, b: Transaction) => new Date(a.date).getTime() - new Date(b.date).getTime();
        result.overdue.sort(sortAsc);
        result.today.sort(sortAsc);
        result.upcoming.sort(sortAsc);

        return result;
    }, [pendingDebts, todayDate]);

    const totalOverdue = overdue.reduce((sum, t) => sum + t.amount, 0);
    const totalToday = today.reduce((sum, t) => sum + t.amount, 0);
    const totalUpcoming = upcoming.reduce((sum, t) => sum + t.amount, 0);

    const renderDebtCard = (debt: Transaction, urgency: 'overdue' | 'today' | 'upcoming') => {
        const categoryLabel = CATEGORY_LABELS[debt.category as keyof typeof CATEGORY_LABELS] || debt.category || 'Outros';
        const isOverdue = urgency === 'overdue';
        const isToday = urgency === 'today';

        const borderColor = isOverdue ? 'rgba(239, 68, 68, 0.4)' : isToday ? 'rgba(245, 158, 11, 0.4)' : 'var(--glass-border)';
        const bgColor = isOverdue ? 'rgba(239, 68, 68, 0.05)' : isToday ? 'rgba(245, 158, 11, 0.05)' : 'var(--glass-bg)';
        const accentColor = isOverdue ? 'var(--expense-color)' : isToday ? '#f59e0b' : 'var(--accent-color)';

        return (
            <div key={debt.id} style={{
                background: bgColor,
                border: `1px solid ${borderColor}`,
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.2s'
            }} className="debt-card hover-glow">
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: accentColor }} />
                
                <div style={{ marginLeft: '12px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600, color: '#fff', fontSize: '16px' }}>{debt.description}</span>
                        <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', color: 'var(--text-secondary)' }}>
                            {categoryLabel}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '14px', color: 'var(--text-secondary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isOverdue ? 'var(--expense-color)' : isToday ? '#f59e0b' : 'var(--text-secondary)' }}>
                            {isOverdue ? <AlertTriangle size={14} /> : <CalendarIcon size={14} />}
                            {new Date(debt.date).toLocaleDateString('pt-BR')}
                            {isOverdue && ' (Atrasada)'}
                            {isToday && ' (Hoje)'}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Wallet size={14} />
                            {debt.paymentMethod === 'credit' ? 'Crédito' : debt.paymentMethod === 'pix' ? 'Pix' : debt.paymentMethod === 'debit' ? 'Débito' : 'Dinheiro'}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '18px', fontWeight: 700, color: '#fff' }}>
                            R$ {debt.amount.toFixed(2).replace('.', ',')}
                        </span>
                    </div>
                    <button 
                        onClick={() => onTogglePaid(debt.id, false)}
                        style={{
                            background: 'var(--income-color)',
                            color: '#000',
                            border: 'none',
                            padding: '8px 16px',
                            borderRadius: '12px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            cursor: 'pointer',
                            transition: 'transform 0.1s'
                        }}
                        onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.95)'}
                        onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
                        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <CheckCircle size={18} />
                        Pagar
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }} className="animate-fade-in">
            {/* Header / Summary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.05)' }}>
                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px' }}>Vencidas (Atrasadas)</h4>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--expense-color)' }}>
                        R$ {totalOverdue.toFixed(2).replace('.', ',')}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>{overdue.length} contas</p>
                </div>
                <div className="glass-panel" style={{ padding: '24px', textAlign: 'center', border: '1px solid rgba(245, 158, 11, 0.3)', background: 'rgba(245, 158, 11, 0.05)' }}>
                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px' }}>Vencem Hoje</h4>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#f59e0b' }}>
                        R$ {totalToday.toFixed(2).replace('.', ',')}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>{today.length} contas</p>
                </div>
                <div className="glass-panel" style={{ padding: '24px', textAlign: 'center' }}>
                    <h4 style={{ color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '14px' }}>Próximas (Mês)</h4>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: '#fff' }}>
                        R$ {totalUpcoming.toFixed(2).replace('.', ',')}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '4px' }}>{upcoming.length} contas</p>
                </div>
            </div>

            {pendingDebts.length === 0 ? (
                <div className="glass-panel" style={{ textAlign: 'center', padding: '64px 24px' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '32px', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                        <CheckCircle size={32} color="var(--income-color)" />
                    </div>
                    <h3 style={{ fontSize: '20px', color: '#fff', marginBottom: '8px' }}>Tudo em dia!</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Você não possui nenhuma conta pendente no momento.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                    {overdue.length > 0 && (
                        <div>
                            <h3 style={{ fontSize: '18px', color: 'var(--expense-color)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <AlertTriangle size={20} /> Vencidas e Não Pagas
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {overdue.map(t => renderDebtCard(t, 'overdue'))}
                            </div>
                        </div>
                    )}

                    {today.length > 0 && (
                        <div>
                            <h3 style={{ fontSize: '18px', color: '#f59e0b', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CalendarIcon size={20} /> Vencem Hoje
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {today.map(t => renderDebtCard(t, 'today'))}
                            </div>
                        </div>
                    )}

                    {upcoming.length > 0 && (
                        <div>
                            <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <CalendarIcon size={20} /> Próximos Vencimentos
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {upcoming.map(t => renderDebtCard(t, 'upcoming'))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
