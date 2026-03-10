import type { RecurringTransaction } from '../types';
import { Calendar as CalendarIcon, ChevronRight } from 'lucide-react';

interface FierceUpcomingBillsProps {
    recurringTransactions: RecurringTransaction[];
}

export function FierceUpcomingBills({ recurringTransactions }: FierceUpcomingBillsProps) {
    // We'll show up to 3 upcoming bills that are expenses
    const bills = recurringTransactions
        .filter(r => r.type === 'expense')
        .slice(0, 3);

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
                    Upcoming Bills
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
                    Connect More <ChevronRight size={16} />
                </button>
            </div>

            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
                {bills.length > 0 ? (
                    bills.map(bill => (
                        <div key={bill.id} style={{
                            minWidth: '140px',
                            padding: '16px',
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '16px',
                            border: '1px solid var(--glass-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '12px'
                        }}>
                            <p style={{ color: '#fff', fontSize: '14px', fontWeight: 500, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {bill.description}
                            </p>

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
