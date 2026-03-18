import { useState, useEffect } from 'react';
import type { Transaction, RecurringTransaction } from './types';
import { Dashboard } from './components/Dashboard';
import { TransactionForm } from './components/TransactionForm';
import { TransactionList } from './components/TransactionList';
import { Calendar } from './components/Calendar';
import { CategorySummary } from './components/CategorySummary';
import { UserProfile } from './components/UserProfile';
import { RecurringModal } from './components/RecurringModal';
import { BudgetManager } from './components/BudgetManager';
import { SavingsGoalsManager } from './components/SavingsGoalsManager';
import { AnnualTrends } from './components/AnnualTrends';
import { InstallPrompt } from './components/InstallPrompt';
import { SupportButton } from './components/SupportButton';
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { FierceDashboard } from './components/FierceDashboard';
import { FierceCards } from './components/FierceCards';
import { FierceRewards } from './components/FierceRewards';
import { FierceUpcomingBills } from './components/FierceUpcomingBills';
import { FierceTransactionList } from './components/FierceTransactionList';
import { CATEGORY_LABELS } from './utils';
import { supabase } from './supabase';
import type { Session } from '@supabase/supabase-js';
import './App.css';

function App() {
  const [theme, setTheme] = useState<'classic' | 'fierce'>(() => {
    const saved = localStorage.getItem('finance_app_theme');
    return (saved as 'classic' | 'fierce') || 'classic';
  });
  const [activeSection, setActiveSection] = useState('home'); // Fierce navigation
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState<'main' | 'reports'>('main'); // Classic navigation
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(new Date().getMonth());
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<any[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('finance_app_theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchData = async () => {
      // 1. Fetch transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (txData) {
        let formattedTxs = txData.map(t => ({
          ...t,
          paymentMethod: t.payment_method,
          isRecurring: t.is_recurring,
          recurrenceId: t.recurrence_id,
          installmentId: t.installment_id,
          isPaid: t.is_paid
        }));

        const now = new Date();
        const currentYear = now.getUTCFullYear();
        const currentMonth = now.getUTCMonth();
        const startOfCurrentMonth = new Date(Date.UTC(currentYear, currentMonth, 1, 12, 0, 0, 0));

        let hasUpdates = false;

        formattedTxs = formattedTxs.map(t => {
          const tDate = new Date(t.date);
          const isPastMonth = tDate.getUTCFullYear() < currentYear || (tDate.getUTCFullYear() === currentYear && tDate.getUTCMonth() < currentMonth);
          
          if (t.isPaid === false && isPastMonth) {
            const newDateIso = startOfCurrentMonth.toISOString();
            hasUpdates = true;
            
            // Fire and forget DB update
            supabase.from('transactions').update({ date: newDateIso }).eq('id', t.id).then();
            
            return { ...t, date: newDateIso };
          }
          return t;
        });

        if (hasUpdates) {
          formattedTxs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        }

        setTransactions(formattedTxs);
      }

      // 2. Fetch recurring defaults
      const { data: recData } = await supabase
        .from('recurring_transactions')
        .select('*');

      if (recData) {
        setRecurringTransactions(recData.map(t => ({
          ...t,
          paymentMethod: t.payment_method,
          dayOfMonth: t.day_of_month
        })));
      }

      // 3. Fetch Budgets
      const { data: bData } = await supabase.from('budgets').select('*');
      if (bData) setBudgets(bData);

      // 4. Fetch Savings Goals
      const { data: sgData } = await supabase.from('savings_goals').select('*');
      if (sgData) setSavingsGoals(sgData);
    };

    fetchData();
  }, [session]);

  // Logic to auto-generate recurring transactions for missing month
  useEffect(() => {
    if (!session?.user?.id || transactions.length === 0 || recurringTransactions.length === 0) return;

    const generateMissing = async () => {
      let changed = false;
      const newTxs: any[] = [];
      const now = new Date();
      const currentYear = now.getUTCFullYear();
      const currentMonth = now.getUTCMonth();
      const endOfMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999));

      recurringTransactions.forEach((template) => {
        const existingForTemplate = transactions.filter(t => t.recurrenceId === template.id);

        let latestDate: Date | null = null;
        if (existingForTemplate.length > 0) {
          existingForTemplate.forEach(t => {
            const tDate = new Date(t.date);
            if (!latestDate || tDate.getTime() > latestDate.getTime()) {
              latestDate = tDate;
            }
          });
        }

        if (latestDate) {
          let nextDate = new Date(latestDate);
          nextDate.setUTCMonth(nextDate.getUTCMonth() + 1);
          nextDate.setUTCDate(Math.min(template.dayOfMonth, new Date(nextDate.getUTCFullYear(), nextDate.getUTCMonth() + 1, 0).getUTCDate()));

          while (nextDate.getTime() <= endOfMonth.getTime()) {
            newTxs.push({
              user_id: session.user.id,
              description: template.description,
              amount: template.amount,
              type: template.type,
              category: template.category,
              date: nextDate.toISOString(),
              payment_method: template.paymentMethod,
              is_recurring: true,
              recurrence_id: template.id,
              is_paid: false
            });
            changed = true;

            nextDate = new Date(nextDate);
            nextDate.setUTCMonth(nextDate.getUTCMonth() + 1);
            nextDate.setUTCDate(Math.min(template.dayOfMonth, new Date(nextDate.getUTCFullYear(), nextDate.getUTCMonth() + 1, 0).getUTCDate()));
          }
        } else {
          const candidateDate = new Date();
          candidateDate.setUTCDate(Math.min(template.dayOfMonth, new Date(currentYear, currentMonth + 1, 0).getUTCDate()));
          candidateDate.setUTCHours(12, 0, 0, 0);

          if (candidateDate.getTime() <= endOfMonth.getTime()) {
            newTxs.push({
              user_id: session.user.id,
              description: template.description,
              amount: template.amount,
              type: template.type,
              category: template.category,
              date: candidateDate.toISOString(),
              payment_method: template.paymentMethod,
              is_recurring: true,
              recurrence_id: template.id,
              is_paid: false
            });
            changed = true;
          }
        }
      });

      if (changed && newTxs.length > 0) {
        const { data, error } = await supabase.from('transactions').insert(newTxs).select();
        if (data && !error) {
          const formatted = data.map((t: any) => ({
            ...t,
            paymentMethod: t.payment_method,
            isRecurring: t.is_recurring,
            recurrenceId: t.recurrence_id,
            installmentId: t.installment_id,
            isPaid: t.is_paid
          }));
          setTransactions(prev => {
            const merged = [...formatted, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            return merged;
          });
        }
      }
    };

    generateMissing();
  }, [session, recurringTransactions, transactions.length]);

  const handleAddTransaction = async (newTransaction: Omit<Transaction, 'id'>, installments: number = 1) => {
    if (!session?.user?.id) return;

    if (installments > 1) {
      const installmentId = crypto.randomUUID();
      const baseAmount = newTransaction.amount / installments;
      const newTxs: any[] = [];

      let currentDate = new Date(newTransaction.date);

      for (let i = 1; i <= installments; i++) {
        newTxs.push({
          user_id: session.user.id,
          description: `${newTransaction.description} (${i}/${installments})`,
          amount: baseAmount,
          type: newTransaction.type,
          category: newTransaction.category,
          date: currentDate.toISOString(),
          payment_method: newTransaction.paymentMethod,
          is_recurring: false,
          installment_id: installmentId
        });

        // advance by 1 month properly
        const nextDate = new Date(currentDate);
        const targetMonth = nextDate.getUTCMonth() + 1;
        nextDate.setUTCMonth(targetMonth);
        // Correct date overflow (e.g., Jan 31 -> Mar 3 instead of Feb 28)
        if (nextDate.getUTCMonth() !== (targetMonth % 12)) {
          nextDate.setUTCDate(0);
        }
        currentDate = nextDate;
      }

      const { data, error } = await supabase.from('transactions').insert(newTxs).select();
      if (data && !error) {
        const formatted = data.map((t: any) => ({
          ...t,
          paymentMethod: t.payment_method,
          isRecurring: t.is_recurring,
          recurrenceId: t.recurrence_id,
          installmentId: t.installment_id,
          isPaid: t.is_paid
        }));
        setTransactions(prev => [...formatted, ...prev]);
      }
    } else {
      const dbTx = {
        user_id: session.user.id,
        description: newTransaction.description,
        amount: newTransaction.amount,
        type: newTransaction.type,
        category: newTransaction.category,
        date: newTransaction.date,
        payment_method: newTransaction.paymentMethod,
        is_recurring: newTransaction.isRecurring || false,
      };

      const { data, error } = await supabase.from('transactions').insert(dbTx).select();
      if (data && data[0] && !error) {
        const t = data[0];
        setTransactions(prev => [{
          ...t,
          paymentMethod: t.payment_method,
          isRecurring: t.is_recurring,
          recurrenceId: t.recurrence_id,
          installmentId: t.installment_id,
          isPaid: t.is_paid
        }, ...prev]);
      }
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    const { data, error } = await supabase.from('transactions').delete().eq('id', id).select();
    if (error) {
      alert(`Erro ao deletar: ${error.message}`);
    } else if (data && data.length === 0) {
      alert('Transação não encontrada ou sem permissão para deletar.');
    } else {
      setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleEditTransaction = async (id: string, updated: Omit<Transaction, 'id'>) => {
    const dbTx = {
      description: updated.description,
      amount: updated.amount,
      type: updated.type,
      category: updated.category,
      date: updated.date,
      payment_method: updated.paymentMethod,
    };

    const { data, error } = await supabase.from('transactions').update(dbTx).eq('id', id).select();
    if (error) {
      alert(`Erro ao atualizar: ${error.message}`);
    } else if (data && data.length === 0) {
      alert('Transação não encontrada ou sem permissão para atualizar.');
    } else {
      setTransactions(prev => prev.map(t =>
        t.id === id ? { ...t, ...updated } : t
      ));
    }
  };

  const handleTogglePaid = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('transactions').update({ is_paid: !currentStatus }).eq('id', id);
    if (error) {
      alert(`Erro ao atualizar status: ${error.message}`);
    } else {
      setTransactions(prev => prev.map(t =>
        t.id === id ? { ...t, isPaid: !currentStatus } : t
      ));
    }
  };

  const handleAddRecurring = async (template: Omit<RecurringTransaction, 'id'>) => {
    if (!session?.user?.id) return;

    const dbTemplate = {
      user_id: session.user.id,
      description: template.description,
      amount: template.amount,
      type: template.type,
      category: template.category,
      payment_method: template.paymentMethod,
      day_of_month: template.dayOfMonth
    };

    const { data, error } = await supabase.from('recurring_transactions').insert(dbTemplate).select();
    if (data && data[0] && !error) {
      const t = data[0];
      setRecurringTransactions(prev => [...prev, {
        ...t,
        paymentMethod: t.payment_method,
        dayOfMonth: t.day_of_month
      }]);
    }
  };

  const handleDeleteRecurring = async (id: string) => {
    const { error } = await supabase.from('recurring_transactions').delete().eq('id', id);
    if (!error) {
      setRecurringTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const handleAddBudget = async (budget: Omit<any, 'id'>) => {
    if (!session?.user?.id) return;
    const { data, error } = await supabase.from('budgets').insert({ ...budget, user_id: session.user.id }).select();
    if (data && data[0] && !error) setBudgets(prev => [...prev, data[0]]);
  };

  const handleUpdateBudget = async (id: string, amount: number) => {
    const { error } = await supabase.from('budgets').update({ amount }).eq('id', id);
    if (!error) setBudgets(prev => prev.map(b => b.id === id ? { ...b, amount } : b));
  };

  const handleRemoveBudget = async (id: string) => {
    const { error } = await supabase.from('budgets').delete().eq('id', id);
    if (!error) setBudgets(prev => prev.filter(b => b.id !== id));
  };

  const handleAddSavingsGoal = async (goal: Omit<any, 'id' | 'current_amount'>) => {
    if (!session?.user?.id) return;
    const { data, error } = await supabase.from('savings_goals').insert({ ...goal, current_amount: 0, user_id: session.user.id }).select();
    if (data && data[0] && !error) setSavingsGoals(prev => [...prev, data[0]]);
  };

  const handleUpdateSavingsAmount = async (id: string, newAmount: number) => {
    const { error } = await supabase.from('savings_goals').update({ current_amount: newAmount }).eq('id', id);
    if (!error) setSavingsGoals(prev => prev.map(sg => sg.id === id ? { ...sg, current_amount: newAmount } : sg));
  };

  const handleDeleteSavingsGoal = async (id: string) => {
    const { error } = await supabase.from('savings_goals').delete().eq('id', id);
    if (!error) setSavingsGoals(prev => prev.filter(sg => sg.id !== id));
  };

  const currentYear = new Date().getFullYear();
  const activeMonth = selectedMonth !== null ? selectedMonth : new Date().getMonth();

  const monthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === activeMonth && d.getFullYear() === currentYear;
  });

  const previousMonthTransactions = transactions.filter(t => {
    const d = new Date(t.date);
    const isPrevYear = activeMonth === 0 ? d.getFullYear() === currentYear - 1 : d.getFullYear() === currentYear;
    const prevMonthIndex = activeMonth === 0 ? 11 : activeMonth - 1;
    return d.getMonth() === prevMonthIndex && isPrevYear;
  });

  const displayedTransactions = selectedDateFilter
    ? transactions.filter(t => t.date.split('T')[0] === selectedDateFilter)
    : monthTransactions; // Use month's transactions if no day is selected

  const handleExportCSV = () => {
    // Generate CSV string
    const headers = ['ID', 'Data', 'Tipo', 'Categoria', 'Metodo', 'Descricao', 'Valor (R$)'];
    const rows = transactions.map(t => {
      const date = new Date(t.date).toLocaleDateString('pt-BR');
      const type = t.type === 'income' ? 'Entrada' : 'Saida';
      const category = CATEGORY_LABELS[t.category as keyof typeof CATEGORY_LABELS] || t.category || '';
      const method = t.paymentMethod || '';
      const desc = t.description.replace(/,/g, ''); // prevent breaking csv
      const amount = t.amount.toString().replace('.', ',');

      return [t.id, date, type, category, method, desc, amount].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `financas_export_${currentYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!session) {
    return <Auth onLogin={() => { }} />;
  }

  if (theme === 'fierce') {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
        <Sidebar
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          session={session}
          onOpenRecurring={() => setIsRecurringModalOpen(true)}
          theme={theme}
          onToggleTheme={() => setTheme('classic')}
        />

        <main className="fierce-main">
          {/* Header */}
          <header className="fierce-header">
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                Olá {session.user.email?.split('@')[0]}, 👋
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                {activeSection === 'home' && "Bem-vindo de volta, aqui está o resumo de hoje."}
                {activeSection === 'transactions' && "Registre e acompanhe suas transações."}
                {activeSection === 'goals' && "Acompanhe e defina suas metas financeiras."}
                {activeSection === 'reports' && "Veja análises detalhadas das suas finanças."}
              </p>
            </div>
            <div className="fierce-header-actions">
              <button
                style={{
                  padding: '10px 20px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '20px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                onClick={handleExportCSV}
              >
                Exportar CSV
              </button>
            </div>
          </header>

          {activeSection === 'home' && (
            <div className="fierce-grid animate-fade-in">
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <FierceDashboard
                  transactions={monthTransactions}
                  previousTransactions={previousMonthTransactions}
                />
                <FierceCards transactions={monthTransactions} />

                <div style={{ marginTop: '24px' }}>
                  <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#fff', marginBottom: '24px' }}>Atividade Recente</h3>
                  <div style={{ marginTop: '24px' }}>
                    <FierceTransactionList
                      transactions={displayedTransactions.slice(0, 5)}
                      onDelete={handleDeleteTransaction}
                      onEdit={handleEditTransaction}
                      onTogglePaid={handleTogglePaid}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <FierceRewards transactions={monthTransactions} />
                <FierceUpcomingBills recurringTransactions={recurringTransactions} />
              </div>
            </div>
          )}

          {activeSection === 'transactions' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <TransactionForm onAdd={handleAddTransaction} />
              <div style={{ marginTop: '8px' }}>
                <FierceTransactionList
                  transactions={displayedTransactions}
                  onDelete={handleDeleteTransaction}
                  onEdit={handleEditTransaction}
                  onTogglePaid={handleTogglePaid}
                />
              </div>
            </div>
          )}

          {activeSection === 'goals' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <SavingsGoalsManager
                goals={savingsGoals}
                onAddGoal={handleAddSavingsGoal}
                onUpdateAmount={handleUpdateSavingsAmount}
                onDeleteGoal={handleDeleteSavingsGoal}
              />
              <BudgetManager 
                transactions={monthTransactions} 
                budgets={budgets}
                onAddBudget={handleAddBudget}
                onUpdateBudget={handleUpdateBudget}
                onRemoveBudget={handleRemoveBudget}
              />
            </div>
          )}

          {activeSection === 'reports' && (
             <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
               <AnnualTrends transactions={transactions} currentYear={currentYear} />
               <CategorySummary transactions={monthTransactions} />
             </div>
          )}
        </main>

        <InstallPrompt />
        <RecurringModal
          isOpen={isRecurringModalOpen}
          onClose={() => setIsRecurringModalOpen(false)}
          templates={recurringTransactions}
          onSave={handleAddRecurring}
          onDelete={handleDeleteRecurring}
        />
        <SupportButton />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <header className="animate-fade-in classic-header">
        <div style={{ textAlign: 'center', width: '100%' }}>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 36px)', fontWeight: 700, marginBottom: '8px', background: 'linear-gradient(90deg, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Nectar's
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(14px, 3vw, 18px)' }}>
            Controle suas finanças de forma simples e elegante
          </p>
        </div>

        <div className="classic-header-actions">
          <button
            onClick={() => setTheme(theme === 'classic' ? 'fierce' : 'classic')}
            className="theme-toggle-btn"
            style={{ padding: '8px 16px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            title="Alternar Tema"
          >
            {theme === 'classic' ? 'Fierce Mode ✨' : 'Classic Mode 🏛️'}
          </button>
          <button
            onClick={handleExportCSV}
            style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', fontSize: '14px' }}
            title="Exportar todas as transações (CSV)"
          >
            📥 Exportar CSV
          </button>
          <UserProfile onOpenRecurring={() => setIsRecurringModalOpen(true)} session={session} />
        </div>
      </header>

      <div className="app-layout">
        <main>
          <Dashboard transactions={monthTransactions} previousTransactions={previousMonthTransactions} />

          {/* TAB NAVIGATION */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
            <button
              onClick={() => setActiveTab('main')}
              style={{
                padding: '8px 16px',
                background: activeTab === 'main' ? 'var(--accent-color)' : 'transparent',
                color: activeTab === 'main' ? '#fff' : 'var(--text-secondary)',
                border: activeTab === 'main' ? 'none' : '1px solid var(--glass-border)',
                borderRadius: '8px',
                fontWeight: activeTab === 'main' ? 600 : 400,
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
            >
              Principal
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              style={{
                padding: '8px 16px',
                background: activeTab === 'reports' ? 'var(--accent-color)' : 'transparent',
                color: activeTab === 'reports' ? '#fff' : 'var(--text-secondary)',
                border: activeTab === 'reports' ? 'none' : '1px solid var(--glass-border)',
                borderRadius: '8px',
                fontWeight: activeTab === 'reports' ? 600 : 400,
                transition: 'all 0.2s',
                cursor: 'pointer'
              }}
            >
              Relatórios e Metas
            </button>
          </div>

          {activeTab === 'main' && (
            <div className="animate-fade-in">
              <TransactionForm onAdd={handleAddTransaction} />
              <TransactionList
                transactions={displayedTransactions}
                onDelete={handleDeleteTransaction}
                onEdit={handleEditTransaction}
                onTogglePaid={handleTogglePaid}
              />
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
              <SavingsGoalsManager
                goals={savingsGoals}
                onAddGoal={handleAddSavingsGoal}
                onUpdateAmount={handleUpdateSavingsAmount}
                onDeleteGoal={handleDeleteSavingsGoal}
              />
              <BudgetManager 
                transactions={monthTransactions} 
                budgets={budgets}
                onAddBudget={handleAddBudget}
                onUpdateBudget={handleUpdateBudget}
                onRemoveBudget={handleRemoveBudget}
              />
              <AnnualTrends transactions={transactions} currentYear={currentYear} />
            </div>
          )}
        </main>

        <aside style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {activeTab === 'main' && (
            <Calendar
              transactions={transactions}
              selectedDateFilter={selectedDateFilter}
              onSelectDateFilter={setSelectedDateFilter}
              selectedMonth={selectedMonth}
              onSelectMonth={setSelectedMonth}
            />
          )}

          <CategorySummary transactions={monthTransactions} />
        </aside>
      </div>

      <InstallPrompt />

      <RecurringModal
        isOpen={isRecurringModalOpen}
        onClose={() => setIsRecurringModalOpen(false)}
        templates={recurringTransactions}
        onSave={handleAddRecurring}
        onDelete={handleDeleteRecurring}
      />
      <SupportButton />
    </div>
  );
}

export default App;
