import { useState } from 'react';
import type { SavingsGoal } from '../types';
import { Target, Plus, Minus, Trash2 } from 'lucide-react';

interface SavingsGoalsManagerProps {
    goals: SavingsGoal[];
    onAddGoal: (goal: Omit<SavingsGoal, 'id' | 'current_amount'>) => void;
    onUpdateAmount: (id: string, newAmount: number) => void;
    onDeleteGoal: (id: string) => void;
}

export function SavingsGoalsManager({ goals, onAddGoal, onUpdateAmount, onDeleteGoal }: SavingsGoalsManagerProps) {
    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newTarget, setNewTarget] = useState('');
    const [newDeadline, setNewDeadline] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle || !newTarget) return;

        onAddGoal({
            title: newTitle,
            target_amount: parseFloat(newTarget),
            deadline: newDeadline || undefined
        });

        setNewTitle('');
        setNewTarget('');
        setNewDeadline('');
        setIsAdding(false);
    };

    const handleTransaction = (goal: SavingsGoal, type: 'add' | 'remove') => {
        const amountStr = prompt(`Quanto deseja ${type === 'add' ? 'adicionar' : 'remover'} da meta "${goal.title}"?`);
        if (!amountStr) return;

        const amount = parseFloat(amountStr.replace(',', '.'));
        if (isNaN(amount) || amount <= 0) {
            alert('Valor inválido.');
            return;
        }

        const newAmount = type === 'add' ? goal.current_amount + amount : Math.max(0, goal.current_amount - amount);
        onUpdateAmount(goal.id, newAmount);
    };

    return (
        <div className="glass-panel animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Target size={24} color="var(--accent-color)" />
                    <h3 style={{ fontSize: '18px', fontWeight: 600 }}>Metas de Economia</h3>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    style={{ padding: '6px 12px', fontSize: '12px', background: 'var(--glass-bg)' }}
                >
                    {isAdding ? 'Cancelar' : '+ Nova Meta'}
                </button>
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '24px', alignItems: 'flex-end', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '8px', flexWrap: 'wrap' }}>
                    <div style={{ flex: '1 1 200px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>O que você quer alcançar?</label>
                        <input
                            type="text"
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            placeholder="Ex: Viagem, Carro Novo..."
                            required
                        />
                    </div>
                    <div style={{ flex: '1 1 120px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>Valor Alvo (R$)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={newTarget}
                            onChange={e => setNewTarget(e.target.value)}
                            placeholder="0.00"
                            required
                        />
                    </div>
                    <div style={{ flex: '1 1 150px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>Prazo Sugerido (Opcional)</label>
                        <input
                            type="date"
                            value={newDeadline}
                            onChange={e => setNewDeadline(e.target.value)}
                            style={{ colorScheme: 'dark' }}
                        />
                    </div>
                    <button type="submit" style={{ height: '44px', padding: '0 24px' }}>Criar Meta</button>
                </form>
            )}

            {goals.length === 0 && !isAdding ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)' }}>
                    <p>Nenhuma meta de poupança definida ainda.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {goals.map(goal => {
                        const progress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
                        const isCompleted = progress >= 100;

                        return (
                            <div key={goal.id} style={{
                                background: 'rgba(255,255,255,0.02)',
                                padding: '20px',
                                borderRadius: '16px',
                                border: '1px solid var(--glass-border)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '16px'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h4 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>{goal.title}</h4>
                                        {goal.deadline && (
                                            <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                                Prazo: {new Date(goal.deadline + 'T12:00:00Z').toLocaleDateString('pt-BR')}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (confirm(`Tem certeza que deseja excluir a meta "${goal.title}"?`)) {
                                                onDeleteGoal(goal.id);
                                            }
                                        }}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: 0 }}
                                        title="Excluir meta"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>

                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px' }}>
                                        <span style={{ color: isCompleted ? 'var(--income-color)' : 'var(--text-primary)', fontWeight: 600 }}>
                                            R$ {goal.current_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                        <span style={{ color: 'var(--text-secondary)' }}>
                                            de R$ {goal.target_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{
                                            width: `${progress}%`,
                                            height: '100%',
                                            background: isCompleted ? 'var(--income-color)' : 'var(--accent-color)',
                                            transition: 'width 1s ease-out',
                                        }} />
                                    </div>
                                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px', textAlign: 'right' }}>
                                        {progress.toFixed(0)}% concluído
                                    </p>
                                </div>

                                <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
                                    <button
                                        onClick={() => handleTransaction(goal, 'remove')}
                                        style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', padding: '8px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--expense-color)', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '12px' }}
                                    >
                                        <Minus size={14} /> Remover
                                    </button>
                                    <button
                                        onClick={() => handleTransaction(goal, 'add')}
                                        style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '4px', padding: '8px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--income-color)', border: '1px solid rgba(16, 185, 129, 0.2)', fontSize: '12px' }}
                                    >
                                        <Plus size={14} /> Adicionar
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
