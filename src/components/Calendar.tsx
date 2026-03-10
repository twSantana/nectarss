import { useState, useEffect } from 'react';
import type { Transaction } from '../types';

interface CalendarProps {
    transactions: Transaction[];
    selectedDateFilter: string | null;
    onSelectDateFilter: (date: string | null) => void;
    selectedMonth: number | null;
    onSelectMonth: (month: number | null) => void;
}

export function Calendar({ transactions, selectedDateFilter, onSelectDateFilter, selectedMonth, onSelectMonth }: CalendarProps) {
    const [isMinimized, setIsMinimized] = useState(false);
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        const checkMobile = () => {
            if (window.innerWidth <= 768) {
                setIsMinimized(true);
            } else {
                setIsMinimized(false);
            }
        };

        // Initial check
        checkMobile();

        // Listen for window resize
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const months = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    if (isMinimized) {
        return (
            <div className="glass-panel animate-fade-in" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '18px', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        📅 Calendário
                    </h3>
                    <button
                        onClick={() => setIsMinimized(false)}
                        style={{ padding: '6px 12px', fontSize: '12px', background: 'rgba(59, 130, 246, 0.2)', color: 'var(--accent-color)', border: '1px solid var(--accent-color)' }}
                    >
                        Expandir
                    </button>
                </div>
            </div>
        );
    }

    if (selectedMonth === null) {
        return (
            <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontSize: '20px', margin: 0 }}>
                        Calendário {currentYear}
                    </h3>
                    <button
                        onClick={() => setIsMinimized(true)}
                        style={{ background: 'transparent', padding: '4px 8px', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)', fontSize: '12px' }}
                        title="Minimizar"
                    >
                        Comprimir
                    </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {months.map((month, index) => {
                        // Conta as transações do mês para possível feedback visual (opcional)
                        const count = transactions.filter(t => {
                            const d = new Date(t.date);
                            return d.getMonth() === index && d.getFullYear() === currentYear;
                        }).length;

                        return (
                            <button
                                key={month}
                                onClick={() => onSelectMonth(index)}
                                style={{
                                    padding: '12px 8px',
                                    fontSize: '14px',
                                    background: count > 0 ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                    border: count > 0 ? '1px solid var(--accent-color)' : '1px solid var(--glass-border)',
                                    color: 'var(--text-primary)',
                                    position: 'relative'
                                }}
                            >
                                {month.slice(0, 3)}
                                {count > 0 && (
                                    <span style={{
                                        position: 'absolute',
                                        top: '-4px',
                                        right: '-4px',
                                        background: 'var(--accent-color)',
                                        color: 'white',
                                        borderRadius: '50%',
                                        width: '16px',
                                        height: '16px',
                                        fontSize: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        {count}
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>
        );
    }

    const daysInMonth = new Date(currentYear, selectedMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, selectedMonth, 1).getDay();

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

    const monthTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === selectedMonth && d.getFullYear() === currentYear;
    });

    const monthIncome = monthTransactions.filter(t => t.type === 'income').reduce((a, b) => a + b.amount, 0);
    const monthExpense = monthTransactions.filter(t => t.type === 'expense').reduce((a, b) => a + b.amount, 0);

    return (
        <div className="glass-panel animate-fade-in" style={{ animationDelay: '0s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <button
                    onClick={() => {
                        onSelectMonth(null);
                        onSelectDateFilter(null);
                    }}
                    style={{ padding: '6px 12px', fontSize: '12px', background: 'rgba(255, 255, 255, 0.1)', border: '1px solid var(--glass-border)' }}
                >
                    &larr; Voltar
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '18px', margin: 0 }}>{months[selectedMonth]} {currentYear}</h3>
                    <button
                        onClick={() => setIsMinimized(true)}
                        style={{ background: 'transparent', padding: '2px 6px', color: 'var(--text-secondary)', border: '1px solid var(--glass-border)', fontSize: '12px' }}
                        title="Minimizar"
                    >
                        Minimizar
                    </button>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '8px' }}>
                {weekDays.map(d => (
                    <div key={d} style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>{d}</div>
                ))}
                {blanks.map(b => (
                    <div key={`blank-${b}`} />
                ))}
                {days.map(d => {
                    const dayTransactions = monthTransactions.filter(t => new Date(t.date).getDate() === d);
                    const hasIncome = dayTransactions.some(t => t.type === 'income');
                    const hasExpense = dayTransactions.some(t => t.type === 'expense');

                    let bg = 'rgba(255, 255, 255, 0.05)';
                    let border = '1px solid var(--glass-border)';

                    if (hasIncome && hasExpense) {
                        bg = 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(239, 68, 68, 0.3))';
                        border = '1px solid rgba(255, 255, 255, 0.3)';
                    } else if (hasIncome) {
                        bg = 'rgba(16, 185, 129, 0.2)';
                        border = '1px solid var(--income-color)';
                    } else if (hasExpense) {
                        bg = 'rgba(239, 68, 68, 0.2)';
                        border = '1px solid var(--expense-color)';
                    }

                    const isToday = new Date().getDate() === d && new Date().getMonth() === selectedMonth && new Date().getFullYear() === currentYear;

                    const cellDateString = `${currentYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                    const isSelected = selectedDateFilter === cellDateString;

                    if (isSelected) {
                        border = '2px solid var(--accent-color)';
                        bg = bg === 'rgba(255, 255, 255, 0.05)' ? 'rgba(59, 130, 246, 0.15)' : bg;
                    } else if (isToday) {
                        border = '2px solid white';
                    }

                    return (
                        <button
                            key={d}
                            onClick={() => {
                                if (isSelected) {
                                    onSelectDateFilter(null);
                                } else {
                                    onSelectDateFilter(cellDateString);
                                }
                            }}
                            style={{
                                aspectRatio: '1',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: bg,
                                borderRadius: '6px',
                                fontSize: '14px',
                                border: border,
                                transition: 'all 0.2s',
                                cursor: 'pointer',
                                padding: 0,
                                color: 'var(--text-primary)'
                            }}
                            title={dayTransactions.map(t => `${t.description}: R$ ${t.amount}`).join('\n')}
                        >
                            {d}
                        </button>
                    );
                })}
            </div>

            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--glass-border)', fontSize: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Entradas do mês:</span>
                    <span style={{ color: 'var(--income-color)', fontWeight: 600 }}>R$ {monthIncome.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Saídas do mês:</span>
                    <span style={{ color: 'var(--expense-color)', fontWeight: 600 }}>R$ {monthExpense.toFixed(2)}</span>
                </div>
            </div>
        </div>
    );
}
