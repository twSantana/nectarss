import { useState } from 'react';
import type { RecurringTransaction, TransactionType } from '../types';
import { CATEGORY_LABELS } from '../utils';

interface RecurringModalProps {
    isOpen: boolean;
    onClose: () => void;
    templates: RecurringTransaction[];
    onSave: (template: Omit<RecurringTransaction, 'id'>) => void;
    onDelete: (id: string) => void;
}

export function RecurringModal({ isOpen, onClose, templates, onSave, onDelete }: RecurringModalProps) {
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<TransactionType>('expense');
    const [category, setCategory] = useState('outros');
    const [dayOfMonth, setDayOfMonth] = useState('10');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount || !dayOfMonth) return;

        onSave({
            description,
            amount: parseFloat(amount),
            type,
            category,
            dayOfMonth: parseInt(dayOfMonth, 10)
        });

        // Reset
        setDescription('');
        setAmount('');
        setType('expense');
        setCategory('outros');
        setDayOfMonth('10');
        setIsAdding(false);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <div className="glass-panel animate-fade-in" style={{
                width: '100%',
                maxWidth: '600px',
                maxHeight: '90vh',
                overflowY: 'auto',
                background: 'var(--bg-gradient-end)',
                position: 'relative',
                animationDuration: '0.2s'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '24px' }}>Contas Recorrentes</h2>
                    <button
                        onClick={onClose}
                        style={{ background: 'transparent', padding: '8px', color: 'var(--text-secondary)' }}
                        title="Fechar"
                    >
                        ✕
                    </button>
                </div>

                <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>
                    Gerencie contas que se repetem todo mês. O aplicativo irá gerá-las automaticamente no dia especificado.
                </p>

                {isAdding ? (
                    <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '8px', marginBottom: '24px', border: '1px solid var(--glass-border)' }}>
                        <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Nova Conta</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                            <div style={{ gridColumn: '1 / -1' }}>
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Descrição</label>
                                <input required value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Conta de Luz" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Valor (R$)</label>
                                <input required type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="150.00" />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Tipo</label>
                                <select value={type} onChange={e => setType(e.target.value as TransactionType)}>
                                    <option value="income">Entrada</option>
                                    <option value="expense">Saída</option>
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Categoria</label>
                                <select value={category} onChange={e => setCategory(e.target.value)}>
                                    {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                        <option key={key} value={key}>{label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Dia do Mês (1-31)</label>
                                <input required type="number" min="1" max="31" value={dayOfMonth} onChange={e => setDayOfMonth(e.target.value)} />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => setIsAdding(false)} style={{ background: 'transparent', border: '1px solid var(--text-secondary)' }}>Cancelar</button>
                            <button type="submit">Salvar Conta</button>
                        </div>
                    </form>
                ) : (
                    <button
                        onClick={() => setIsAdding(true)}
                        style={{ width: '100%', marginBottom: '24px', background: 'rgba(59, 130, 246, 0.1)', border: '1px dashed var(--accent-color)', color: 'var(--accent-color)' }}
                    >
                        + Adicionar Nova Conta Recorrente
                    </button>
                )}

                <div>
                    {templates.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-secondary)' }}>
                            Nenhuma conta recorrente cadastrada.
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {templates.map(t => (
                                <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: 600 }}>{t.description}</span>
                                            <span style={{ fontSize: '12px', padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                                                Dia {t.dayOfMonth}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'flex', gap: '12px' }}>
                                            <span>{CATEGORY_LABELS[t.category as keyof typeof CATEGORY_LABELS] || t.category}</span>
                                            <span style={{ color: t.type === 'income' ? 'var(--income-color)' : 'var(--expense-color)' }}>
                                                {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onDelete(t.id)}
                                        style={{ padding: '8px', background: 'transparent', color: 'var(--expense-color)', border: '1px solid var(--expense-color)' }}
                                    >
                                        Excluir
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
