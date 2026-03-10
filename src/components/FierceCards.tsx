import type { Transaction } from '../types';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface FierceCardsProps {
    transactions: Transaction[];
}

export function FierceCards({ transactions }: FierceCardsProps) {
    const currentIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((acc, t) => acc + t.amount, 0);

    const currentExpense = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);

    // In a real app we would calculate real APY or returns. 
    // Let's display mock APY aesthetic based on the reference for a highly visual "Fierce" feel.

    return (
        <div className="fierce-cards-grid">

            {/* Income / "Checking" Style Card */}
            <div className="glass-panel" style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '24px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '24px', fontWeight: 600, color: '#fff', margin: 0 }}>
                            R$ {currentIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </h3>
                        <span style={{
                            background: 'rgba(255,255,255,0.1)',
                            padding: '4px 12px',
                            borderRadius: '16px',
                            fontSize: '12px',
                            color: 'var(--text-secondary)'
                        }}>
                            Receitas
                        </span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ArrowUpRight size={16} color="var(--income-color)" /> Segurado Nectar's
                    </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                    <span style={{ color: 'var(--income-color)', fontSize: '14px', fontWeight: 500 }}>
                        Earn 4.50% APY
                    </span>
                    <button style={{
                        background: '#fff',
                        color: '#000',
                        border: 'none',
                        padding: '8px 24px',
                        borderRadius: '16px',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}>
                        Deposit
                    </button>
                </div>
            </div>

            {/* Expense / "Crypto Lending" Style Card */}
            <div className="glass-panel" style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: '24px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
            }}>
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h3 style={{ fontSize: '24px', fontWeight: 600, color: '#fff', margin: 0 }}>
                            R$ {currentExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </h3>
                        <span style={{
                            background: 'rgba(255,255,255,0.1)',
                            padding: '4px 12px',
                            borderRadius: '16px',
                            fontSize: '12px',
                            color: 'var(--text-secondary)'
                        }}>
                            Despesas
                        </span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 16px 0', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <ArrowDownRight size={16} color="var(--expense-color)" /> Faturas e Gastos
                    </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                    <span style={{ color: 'var(--income-color)', fontSize: '14px', fontWeight: 500 }}>
                        Earn 9% APY
                    </span>
                    <button style={{
                        background: '#fff',
                        color: '#000',
                        border: 'none',
                        padding: '8px 24px',
                        borderRadius: '16px',
                        fontWeight: 600,
                        cursor: 'pointer'
                    }}>
                        Pay Bill
                    </button>
                </div>
            </div>

        </div>
    );
}
