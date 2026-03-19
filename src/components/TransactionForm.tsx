import { useState, useEffect } from 'react';
import type { Transaction, TransactionType } from '../types';
import { getCategoryFromDescription, CATEGORY_LABELS } from '../utils';

interface TransactionFormProps {
    onAdd: (transaction: Omit<Transaction, 'id'>, installments: number) => void;
    recentTransactions?: Transaction[];
}

export function TransactionForm({ onAdd, recentTransactions = [] }: TransactionFormProps) {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState<TransactionType>('expense');
    const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState('auto');
    const [paymentMethod, setPaymentMethod] = useState<'credit' | 'debit' | 'pix' | 'cash'>('pix');
    const [isRecurring, setIsRecurring] = useState(false);
    const [installments, setInstallments] = useState(1);
    const [isSuggested, setIsSuggested] = useState(false);

    // AI Autocomplete effect
    useEffect(() => {
        if (description.length > 2) {
            const lowerDesc = description.toLowerCase().trim();
            const matches = recentTransactions.filter(t => 
                t.description.toLowerCase().includes(lowerDesc) || 
                lowerDesc.includes(t.description.toLowerCase())
            );
            
            if (matches.length > 0) {
                const catCounts = matches.reduce((acc, t) => {
                    if (t.category && t.category.trim() !== '' && t.category !== 'auto') {
                         acc[t.category] = (acc[t.category] || 0) + 1;
                    }
                    return acc;
                }, {} as Record<string, number>);
                
                const entries = Object.entries(catCounts);
                if (entries.length > 0) {
                    const mostFrequent = entries.sort((a, b) => b[1] - a[1])[0][0];
                    if (mostFrequent !== 'auto' && mostFrequent !== category) {
                        setCategory(mostFrequent);
                        setIsSuggested(true);
                        return; // Done
                    }
                }
            }
        }
        setIsSuggested(false);
    }, [description, recentTransactions]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount || !date) return;

        // Save date forcing to 12:00 to avoid timezone issues shifting the day
        const isoDate = new Date(`${date}T12:00:00Z`).toISOString();
        const finalCategory = category === 'auto' ? getCategoryFromDescription(description, type) : category;

        onAdd({
            description,
            amount: parseFloat(amount),
            type,
            date: isoDate,
            paymentMethod,
            category: finalCategory,
            isRecurring
        }, installments);

        setDescription('');
        setAmount('');
        setCategory('auto');
        setIsRecurring(false);
        setInstallments(1);
        // Keep the last selected date for convenience when adding multiple
    };

    return (
        <form className="glass-panel animate-fade-in" onSubmit={handleSubmit} style={{ marginBottom: '32px', animationDelay: '0.1s' }}>
            <h3 style={{ marginBottom: '16px', fontSize: '20px' }}>Nova Transação</h3>
            <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr) auto', gap: '16px', alignItems: 'end' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Descrição</label>
                    <input
                        type="text"
                        placeholder="Ex: Conta de Luz"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Valor (R$)</label>
                    <input
                        type="number"
                        step="0.01"
                        placeholder="Ex: 150.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Tipo</label>
                    <select value={type} onChange={(e) => setType(e.target.value as TransactionType)}>
                        <option value="income">Entrada</option>
                        <option value="expense">Saída</option>
                    </select>
                </div>
                <div>
                    <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-secondary)' }}>
                        <span>Categoria</span>
                        {isSuggested && <span style={{ color: 'var(--accent-color)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 900 }}>✨ Sugerido</span>}
                    </label>
                    <select value={category} onChange={(e) => { setCategory(e.target.value); setIsSuggested(false); }}>
                        <option value="auto">✨ Automático</option>
                        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Data</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        required
                        style={{ colorScheme: 'dark' }}
                    />
                </div>
            </div>
            <div style={{ display: 'flex', gap: '16px', marginTop: '16px', alignItems: 'center' }}>
                <div style={{ width: '150px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Pagamento</label>
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as any)}>
                        <option value="pix">Pix</option>
                        <option value="credit">Cartão de Crédito</option>
                        <option value="debit">Cartão de Débito</option>
                        <option value="cash">Dinheiro</option>
                    </select>
                </div>
                <div style={{ width: '150px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-secondary)' }}>Parcelas</label>
                    <select value={installments} onChange={(e) => setInstallments(Number(e.target.value))}>
                        <option value={1}>À vista (1x)</option>
                        {[2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24].map(num => (
                            <option key={num} value={num}>{num}x</option>
                        ))}
                    </select>
                </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    <input
                        type="checkbox"
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--accent-color)', cursor: 'pointer' }}
                    />
                    Conta Recorrente (adiciona automaticamente todo mês)
                </label>
                <button type="submit" style={{ height: '44px' }}>Adicionar</button>
            </div>
        </form>
    );
}
