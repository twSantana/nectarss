import { useState, useEffect } from 'react';
import type { Transaction } from '../types';
import { CATEGORY_LABELS, type Category } from '../utils';

interface BudgetManagerProps {
    transactions: Transaction[]; // Should be current month's transactions
}

// We store budgets as Record<Category, number>
type Budgets = Record<string, number>;

export function BudgetManager({ transactions }: BudgetManagerProps) {
    const [budgets, setBudgets] = useState<Budgets>(() => {
        const saved = localStorage.getItem('finance_app_budgets');
        return saved ? JSON.parse(saved) : {};
    });

    const [isEditing, setIsEditing] = useState(false);
    const [editCategory, setEditCategory] = useState('auto');
    const [editAmount, setEditAmount] = useState('');

    useEffect(() => {
        localStorage.setItem('finance_app_budgets', JSON.stringify(budgets));
    }, [budgets]);

    // Calculate spent per category (only expenses)
    const spentByCategory = transactions.reduce((acc, t) => {
        if (t.type === 'expense') {
            const cat = t.category || 'outros';
            acc[cat] = (acc[cat] || 0) + t.amount;
        }
        return acc;
    }, {} as Record<string, number>);


    const handleAddBudget = (e: React.FormEvent) => {
        e.preventDefault();
        if (editCategory === 'auto' || !editAmount) return;

        setBudgets(prev => ({
            ...prev,
            [editCategory]: parseFloat(editAmount)
        }));

        setEditCategory('auto');
        setEditAmount('');
        setIsEditing(false);
    };

    const handleRemoveBudget = (cat: string) => {
        setBudgets(prev => {
            const next = { ...prev };
            delete next[cat];
            return next;
        });
    };

    const budgetEntries = Object.entries(budgets);

    return (
        <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Metas de Gastos</h3>
                <button
                    onClick={() => setIsEditing(!isEditing)}
                    style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--glass-bg)' }}
                >
                    {isEditing ? 'Cancelar' : '+ Nova Meta'}
                </button>
            </div>

            {isEditing && (
                <form onSubmit={handleAddBudget} style={{ display: 'flex', gap: '8px', marginBottom: '24px', alignItems: 'flex-end', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>Categoria</label>
                        <select
                            value={editCategory}
                            onChange={e => setEditCategory(e.target.value)}
                            required
                        >
                            <option value="auto" disabled>Selecione...</option>
                            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                <option key={key} value={key}>{label}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>Limite (R$)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={editAmount}
                            onChange={e => setEditAmount(e.target.value)}
                            placeholder="Ex: 500.00"
                            required
                        />
                    </div>
                    <button type="submit" style={{ height: '44px' }}>Salvar</button>
                </form>
            )}

            {budgetEntries.length === 0 && !isEditing ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)' }}>
                    <p>Nenhuma meta definida.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {budgetEntries.map(([cat, limit]) => {
                        const spent = spentByCategory[cat] || 0;
                        const percentage = Math.min((spent / limit) * 100, 100);

                        let color = 'var(--accent-color)';
                        if (percentage > 90) color = 'var(--expense-color)';
                        else if (percentage > 75) color = '#f59e0b'; // Amber

                        return (
                            <div key={cat} style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 500 }}>{CATEGORY_LABELS[cat as Category] || cat}</span>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                                            R$ {spent.toFixed(2)} / R$ {limit.toFixed(2)}
                                        </span>
                                        <button
                                            onClick={() => handleRemoveBudget(cat)}
                                            style={{ background: 'transparent', padding: '4px', border: 'none', color: 'var(--expense-color)', cursor: 'pointer' }}
                                            title="Remover Meta"
                                        >✕</button>
                                    </div>
                                </div>
                                <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${percentage}%`,
                                        height: '100%',
                                        background: color,
                                        transition: 'width 0.5s ease-out, background-color 0.5s',
                                    }} />
                                </div>
                                {percentage >= 100 && (
                                    <p style={{ fontSize: '12px', color: 'var(--expense-color)', marginTop: '8px', textAlign: 'right' }}>
                                        Limite excedido!
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
