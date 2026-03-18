import { useState } from 'react';
import type { Transaction, Budget } from '../types';
import { CATEGORY_LABELS, type Category } from '../utils';
import { Edit2, Save, Trash2 } from 'lucide-react';

interface BudgetManagerProps {
    transactions: Transaction[]; // Should be current month's transactions
    budgets: Budget[];
    onAddBudget: (budget: Omit<Budget, 'id'>) => void;
    onUpdateBudget: (id: string, amount: number) => void;
    onRemoveBudget: (id: string) => void;
}

export function BudgetManager({ transactions, budgets, onAddBudget, onUpdateBudget, onRemoveBudget }: BudgetManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [editCategory, setEditCategory] = useState('auto');
    const [editAmount, setEditAmount] = useState('');
    
    // For inline editing
    const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
    const [inlineEditAmount, setInlineEditAmount] = useState('');

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

        onAddBudget({
            category: editCategory,
            amount: parseFloat(editAmount)
        });

        setEditCategory('auto');
        setEditAmount('');
        setIsAdding(false);
    };

    const handleSaveInlineEdit = (id: string) => {
        if (!inlineEditAmount) return;
        onUpdateBudget(id, parseFloat(inlineEditAmount));
        setEditingBudgetId(null);
    };

    return (
        <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Limites de Gastos Mensais</h3>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--glass-bg)' }}
                >
                    {isAdding ? 'Cancelar' : '+ Novo Limite'}
                </button>
            </div>

            {isAdding && (
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

            {budgets.length === 0 && !isAdding ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)' }}>
                    <p>Nenhum limite definido.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {budgets.map((b) => {
                        const spent = spentByCategory[b.category] || 0;
                        const percentage = Math.min((spent / b.amount) * 100, 100);

                        let color = 'var(--accent-color)';
                        if (percentage >= 100) color = 'var(--expense-color)';
                        else if (percentage > 85) color = '#f59e0b'; // Amber

                        return (
                            <div key={b.id} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                                    <span style={{ fontWeight: 500 }}>{CATEGORY_LABELS[b.category as Category] || b.category}</span>
                                    
                                    {editingBudgetId === b.id ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <input 
                                                type="number" 
                                                autoFocus
                                                value={inlineEditAmount} 
                                                onChange={(e) => setInlineEditAmount(e.target.value)} 
                                                style={{ width: '80px', padding: '4px', fontSize: '12px' }} 
                                            />
                                            <button onClick={() => handleSaveInlineEdit(b.id)} style={{ padding: '4px', background: 'transparent', color: 'var(--accent-color)', border: 'none' }} title="Salvar">
                                                <Save size={16} />
                                            </button>
                                            <button onClick={() => setEditingBudgetId(null)} style={{ padding: '4px', background: 'transparent', color: 'var(--text-secondary)', border: 'none' }} title="Cancelar">
                                                ✕
                                            </button>
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span style={{ fontSize: '14px', color: percentage >= 100 ? 'var(--expense-color)' : 'var(--text-secondary)' }}>
                                               <span style={{fontWeight: 600}}>R$ {spent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span> / R$ {b.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                            </span>
                                            <div style={{ display: 'flex', gap: '4px' }}>
                                                <button
                                                    onClick={() => {
                                                        setEditingBudgetId(b.id);
                                                        setInlineEditAmount(b.amount.toString());
                                                    }}
                                                    style={{ background: 'transparent', padding: '4px', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                                    title="Editar Limite"
                                                ><Edit2 size={14} /></button>
                                                <button
                                                    onClick={() => onRemoveBudget(b.id)}
                                                    style={{ background: 'transparent', padding: '4px', border: 'none', color: 'var(--expense-color)', cursor: 'pointer' }}
                                                    title="Remover Limite"
                                                ><Trash2 size={14} /></button>
                                            </div>
                                        </div>
                                    )}

                                </div>
                                <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${percentage}%`,
                                        height: '100%',
                                        background: color,
                                        transition: 'width 0.5s ease-out, background-color 0.5s',
                                    }} />
                                </div>
                                {percentage >= 100 ? (
                                    <p style={{ fontSize: '12px', color: 'var(--expense-color)', marginTop: '8px', textAlign: 'right', fontWeight: 500 }}>
                                        Limite excedido!
                                    </p>
                                ) : percentage > 85 ? (
                                    <p style={{ fontSize: '12px', color: '#f59e0b', marginTop: '8px', textAlign: 'right' }}>
                                        Atenção, chegando perto do limite.
                                    </p>
                                ) : null}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
