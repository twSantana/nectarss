import type { RecurringTransaction, Transaction } from '../types';
import { Calendar as CalendarIcon, ChevronRight, AlertTriangle } from 'lucide-react';

interface FierceUpcomingBillsProps {
    recurringTransactions: RecurringTransaction[];
    transactions: Transaction[];
}

export function FierceUpcomingBills({ recurringTransactions, transactions }: FierceUpcomingBillsProps) {
    const now = new Date();
    const currentDay = now.getDate();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Map bills to calculate days remaining and if paid
    let upcoming = recurringTransactions
        .filter(r => r.type === 'expense')
        .map(bill => {
            const monthTxs = transactions.filter(t => 
                t.recurrenceId === bill.id && 
                new Date(t.date).getMonth() === currentMonth &&
                new Date(t.date).getFullYear() === currentYear
            );
            const isPaid = monthTxs.some(t => t.isPaid);
            
            let daysRemaining = bill.dayOfMonth - currentDay;
            let isOverdue = false;
            let urgencyLevel = 'normal'; // 'normal', 'warning', 'overdue'

            if (!isPaid && daysRemaining < 0) {
                isOverdue = true;
                urgencyLevel = 'overdue';
            } else if (!isPaid && daysRemaining <= 5 && daysRemaining >= 0) {
                urgencyLevel = 'warning';
            } else if (daysRemaining < 0 && isPaid) {
                // Paid this month, show for next month
                const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
                daysRemaining = (daysInMonth - currentDay) + bill.dayOfMonth;
            }

            return { ...bill, isPaid, daysRemaining, isOverdue, urgencyLevel };
        });

    upcoming.sort((a, b) => {
        if (a.isPaid && !b.isPaid) return 1;
        if (!a.isPaid && b.isPaid) return -1;
        if (a.isOverdue && !b.isOverdue) return -1;
        if (!a.isOverdue && b.isOverdue) return 1;
        return a.daysRemaining - b.daysRemaining;
    });

    const bills = upcoming.slice(0, 4);

    return (
        <div className="glass-panel" style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '24px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', margin: 0 }}>
                    Contas Fixas Mensais
                </h3>
                <button style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                }}>
                    Ver Mais <ChevronRight size={16} />
                </button>
            </div>

            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
                {bills.length > 0 ? (
                    bills.map(bill => (
                        <div key={bill.id} style={{
                            minWidth: '150px',
                            padding: '16px',
                            background: bill.urgencyLevel === 'overdue' ? 'rgba(239, 68, 68, 0.15)' : bill.urgencyLevel === 'warning' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.05)',
                            borderRadius: '16px',
                            border: `1px solid ${bill.urgencyLevel === 'overdue' ? 'rgba(239,68,68,0.3)' : bill.urgencyLevel === 'warning' ? 'rgba(245,158,11,0.3)' : 'var(--glass-border)'}`,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            {/* Color Bar */}
                            <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: bill.urgencyLevel === 'overdue' ? 'var(--expense-color)' : bill.urgencyLevel === 'warning' ? '#f59e0b' : 'var(--accent-color)' }} />

                            <div>
                                <p style={{ color: '#fff', fontSize: '14px', fontWeight: 500, margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {bill.description}
                                </p>
                                {bill.urgencyLevel === 'overdue' && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: 'var(--expense-color)', fontWeight: 800, textTransform: 'uppercase' }}><AlertTriangle size={12}/> Vencida</div>}
                                {bill.urgencyLevel === 'warning' && <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '10px', color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase' }}><CalendarIcon size={12}/> Vence em {bill.daysRemaining} dias</div>}
                                {bill.isPaid && <div style={{ fontSize: '10px', color: 'var(--income-color)', fontWeight: 800, textTransform: 'uppercase' }}>Pago</div>}
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 'auto' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                                    <CalendarIcon size={12} /> Dia {bill.dayOfMonth}
                                </div>
                                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>
                                    {(bill.category || 'NA').substring(0, 2).toUpperCase()}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ color: 'var(--text-secondary)', fontSize: '14px', width: '100%', textAlign: 'center', padding: '24px 0' }}>
                        Nenhuma conta recorrente agendada.
                    </div>
                )}
            </div>
        </div>
    );
}
