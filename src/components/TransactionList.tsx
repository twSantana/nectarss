import { useState } from 'react';
import type { Transaction, TransactionType } from '../types';
import { getCategoryFromDescription, CATEGORY_LABELS, type Category } from '../utils';
import { CheckCircle2, Circle } from 'lucide-react';

interface TransactionListProps {
    transactions: Transaction[];
    onDelete: (id: string) => void;
    onEdit: (id: string, updated: Omit<Transaction, 'id'>) => void;
    onTogglePaid: (id: string, currentStatus: boolean) => void;
}

export function TransactionList({ transactions, onDelete, onEdit, onTogglePaid }: TransactionListProps) {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editDesc, setEditDesc] = useState('');
    const [editAmount, setEditAmount] = useState('');
    const [editType, setEditType] = useState<TransactionType>('expense');
    const [editDate, setEditDate] = useState('');
    const [editCategory, setEditCategory] = useState('auto');
    const [editPaymentMethod, setEditPaymentMethod] = useState<'credit' | 'debit' | 'pix' | 'cash'>('pix');
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

    const startEditing = (t: Transaction) => {
        setEditingId(t.id);
        setEditDesc(t.description);
        setEditAmount(t.amount.toString());
        setEditType(t.type);
        setEditDate(t.date.split('T')[0]); // Extract YYYY-MM-DD
        setEditCategory(t.category || 'auto');
        setEditPaymentMethod(t.paymentMethod || 'pix');
    };

    const cancelEditing = () => {
        setEditingId(null);
    };

    const saveEditing = (id: string) => {
        if (!editDesc || !editAmount || !editDate) return;

        const isoDate = new Date(`${editDate}T12:00:00Z`).toISOString();
        const finalCategory = editCategory === 'auto' ? getCategoryFromDescription(editDesc, editType) : editCategory;

        onEdit(id, {
            description: editDesc,
            amount: parseFloat(editAmount),
            type: editType,
            date: isoDate,
            paymentMethod: editPaymentMethod,
            category: finalCategory
        });
        setEditingId(null);
    };

    if (transactions.length === 0) {
        return (
            <div className="glass-panel animate-fade-in" style={{ textAlign: 'center', padding: '48px', animationDelay: '0.2s' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>Nenhuma transação registrada ainda.</p>
                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Adicione uma transação acima para começar.</p>
            </div>
        );
    }

    const filteredTransactions = transactions.filter(t => {
        if (filterType === 'all') return true;
        return t.type === filterType;
    });

    return (
        <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.2s', padding: 0, overflowX: 'auto', WebkitOverflowScrolling: 'touch', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600 }}>Transações</h3>
                <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '4px', borderRadius: '8px' }}>
                    <button
                        onClick={() => setFilterType('all')}
                        style={{ padding: '6px 16px', fontSize: '12px', background: filterType === 'all' ? 'var(--glass-bg)' : 'transparent', color: filterType === 'all' ? '#fff' : 'var(--text-secondary)', border: 'none', borderRadius: '6px' }}
                    >Todas</button>
                    <button
                        onClick={() => setFilterType('income')}
                        style={{ padding: '6px 16px', fontSize: '12px', background: filterType === 'income' ? 'rgba(16, 185, 129, 0.2)' : 'transparent', color: filterType === 'income' ? 'var(--income-color)' : 'var(--text-secondary)', border: 'none', borderRadius: '6px' }}
                    >Entradas</button>
                    <button
                        onClick={() => setFilterType('expense')}
                        style={{ padding: '6px 16px', fontSize: '12px', background: filterType === 'expense' ? 'rgba(239, 68, 68, 0.2)' : 'transparent', color: filterType === 'expense' ? 'var(--expense-color)' : 'var(--text-secondary)', border: 'none', borderRadius: '6px' }}
                    >Saídas</button>
                </div>
            </div>
            <table style={{ minWidth: '600px', width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}>
                    <tr>
                        <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 500 }}>Descrição</th>
                        <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 500 }}>Categoria</th>
                        <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 500 }}>Data</th>
                        <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 500 }}>Valor</th>
                        <th style={{ padding: '16px 24px', color: 'var(--text-secondary)', fontWeight: 500 }}>Ação</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredTransactions.map((t) => {
                        const isEditing = editingId === t.id;

                        if (isEditing) {
                            return (
                                <tr key={t.id} style={{ borderTop: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                                    <td style={{ padding: '12px 16px' }}>
                                        <input
                                            value={editDesc}
                                            onChange={e => setEditDesc(e.target.value)}
                                            style={{ padding: '8px', fontSize: '14px' }}
                                        />
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <select
                                            value={editCategory}
                                            onChange={e => setEditCategory(e.target.value)}
                                            style={{ padding: '8px', fontSize: '14px', width: 'auto' }}
                                        >
                                            <option value="auto">✨ Automático</option>
                                            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                                                <option key={key} value={key}>{label}</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <input
                                            type="date"
                                            value={editDate}
                                            onChange={e => setEditDate(e.target.value)}
                                            style={{ padding: '8px', fontSize: '14px', colorScheme: 'dark', marginBottom: '8px', width: '100%' }}
                                        />
                                        <select
                                            value={editPaymentMethod}
                                            onChange={e => setEditPaymentMethod(e.target.value as any)}
                                            style={{ padding: '8px', fontSize: '14px', width: '100%' }}
                                        >
                                            <option value="pix">Pix</option>
                                            <option value="credit">Cartão de Crédito</option>
                                            <option value="debit">Cartão de Débito</option>
                                            <option value="cash">Dinheiro</option>
                                        </select>
                                    </td>
                                    <td style={{ padding: '12px 16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <select
                                            value={editType}
                                            onChange={e => setEditType(e.target.value as TransactionType)}
                                            style={{ padding: '8px', fontSize: '14px', width: 'auto' }}
                                        >
                                            <option value="income">Entrada</option>
                                            <option value="expense">Saída</option>
                                        </select>
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={editAmount}
                                            onChange={e => setEditAmount(e.target.value)}
                                            style={{ padding: '8px', fontSize: '14px', width: '100px' }}
                                        />
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => saveEditing(t.id)}
                                                style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--accent-color)' }}
                                            >Salvar</button>
                                            <button
                                                onClick={cancelEditing}
                                                style={{ padding: '6px 12px', fontSize: '12px', background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)' }}
                                            >Cancelar</button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        }

                        return (
                            <tr key={t.id} style={{ borderTop: '1px solid var(--glass-border)', transition: 'all 0.2s', opacity: t.isPaid === false ? 0.6 : 1 }}>
                                <td style={{ padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <button
                                            onClick={() => onTogglePaid(t.id, t.isPaid ?? true)}
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
                                            {t.isPaid === false ? <Circle size={18} /> : <CheckCircle2 size={18} />}
                                        </button>
                                        {t.isRecurring && (
                                            <span title="Conta Recorrente" style={{ fontSize: '14px', cursor: 'help' }}>🔄</span>
                                        )}
                                        {t.description}
                                    </div>
                                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {t.paymentMethod === 'credit' ? '💳 Crédito' :
                                            t.paymentMethod === 'debit' ? '💳 Débito' :
                                                t.paymentMethod === 'cash' ? '💵 Dinheiro' :
                                                    '💠 Pix'}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <span style={{
                                        background: 'rgba(255, 255, 255, 0.05)',
                                        padding: '4px 8px',
                                        borderRadius: '4px',
                                        fontSize: '12px',
                                        border: '1px solid var(--glass-border)',
                                        whiteSpace: 'nowrap'
                                    }}>
                                        {t.category ? CATEGORY_LABELS[t.category as Category] : (
                                            t.type === 'income' ? CATEGORY_LABELS['salario'] : CATEGORY_LABELS['outros']
                                        )}
                                    </span>
                                </td>
                                <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>
                                    {new Date(t.date).toLocaleDateString('pt-BR')}
                                </td>
                                <td style={{
                                    padding: '16px 24px',
                                    fontWeight: 600,
                                    color: t.type === 'income' ? 'var(--income-color)' : 'var(--expense-color)'
                                }}>
                                    {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                                </td>
                                <td style={{ padding: '16px 24px' }}>
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => startEditing(t)}
                                            style={{
                                                padding: '6px 12px',
                                                background: 'transparent',
                                                color: 'var(--accent-color)',
                                                border: '1px solid var(--accent-color)',
                                                fontSize: '12px'
                                            }}>
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => onDelete(t.id)}
                                            style={{
                                                padding: '6px 12px',
                                                background: 'transparent',
                                                color: 'var(--expense-color)',
                                                border: '1px solid var(--expense-color)',
                                                fontSize: '12px'
                                            }}>
                                            Excluir
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
