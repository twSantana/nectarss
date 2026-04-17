import type { Transaction, SavingsGoal, Budget, Family } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PrintReportProps {
  currentDate: Date;
  transactions: Transaction[];
  savingsGoals: SavingsGoal[];
  budgets: Budget[];
  families: Family[];
  activeFamilyId: string | null;
  income: number;
  expense: number;
  balance: number;
}

export function PrintReport({
  currentDate,
  transactions,
  savingsGoals,
  budgets,
  families,
  activeFamilyId,
  income,
  expense,
  balance
}: PrintReportProps) {
  const activeFamily = families.find(f => f.id === activeFamilyId);
  const title = activeFamily ? `Relatório Familiar - ${activeFamily.name}` : `Relatório Pessoal`;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="printable-report" style={{ display: 'none' }}>
      <div style={{ textAlign: 'center', borderBottom: '2px solid #ccc', paddingBottom: '20px', marginBottom: '20px' }}>
        <h1 style={{ fontSize: '28px', color: '#000', margin: '0 0 10px 0' }}>Nectar's - Relatório Financeiro</h1>
        <h2 style={{ fontSize: '20px', color: '#444', margin: '0' }}>{title} ({format(currentDate, 'MMMM yyyy', { locale: ptBR })})</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#666', fontWeight: 600 }}>Entradas</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '24px', color: '#10b981', fontWeight: 700 }}>{formatCurrency(income)}</p>
        </div>
        <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#666', fontWeight: 600 }}>Saídas</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '24px', color: '#ef4444', fontWeight: 700 }}>{formatCurrency(expense)}</p>
        </div>
        <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#666', fontWeight: 600 }}>Saldo Mensal</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '24px', color: balance >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>{formatCurrency(balance)}</p>
        </div>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ fontSize: '18px', borderBottom: '1px solid #ddd', paddingBottom: '8px', marginBottom: '16px', color: '#000' }}>Transações ({transactions.length})</h3>
        {transactions.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>Nenhuma transação registrada neste mês.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ background: '#f5f5f5', borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                <th style={{ padding: '12px', color: '#000' }}>Data</th>
                <th style={{ padding: '12px', color: '#000' }}>Descrição / Categoria</th>
                <th style={{ padding: '12px', color: '#000', textAlign: 'right' }}>Valor</th>
              </tr>
            </thead>
            <tbody>
              {transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '12px', color: '#333' }}>{format(new Date(t.date), 'dd/MM/yyyy')}</td>
                  <td style={{ padding: '12px', color: '#333' }}>
                    <span style={{ fontWeight: 600, display: 'block' }}>{t.description}</span>
                    <span style={{ fontSize: '12px', color: '#888' }}>{t.category || 'Sem Categoria'}</span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: t.type === 'income' ? '#059669' : '#dc2626' }}>
                    {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        <div>
          <h3 style={{ fontSize: '16px', borderBottom: '1px solid #ddd', paddingBottom: '8px', marginBottom: '12px', color: '#000' }}>Limites do Orçamento</h3>
          {budgets.length === 0 ? (
             <p style={{ color: '#666', fontStyle: 'italic', fontSize: '12px' }}>Nenhum limite fixo.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: '#444' }}>
              {budgets.map(b => (
                <li key={b.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dotted #ccc' }}>
                  <span>{b.category}</span>
                  <strong>{formatCurrency(b.amount)}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <h3 style={{ fontSize: '16px', borderBottom: '1px solid #ddd', paddingBottom: '8px', marginBottom: '12px', color: '#000' }}>Metas e Poupança</h3>
          {savingsGoals.length === 0 ? (
             <p style={{ color: '#666', fontStyle: 'italic', fontSize: '12px' }}>Nenhuma meta ativa.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: '#444' }}>
              {savingsGoals.map(s => (
                <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dotted #ccc' }}>
                  <span>{s.title}</span>
                  <span><strong>{formatCurrency(s.current_amount)}</strong> de {formatCurrency(s.target_amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

    </div>
  );
}
