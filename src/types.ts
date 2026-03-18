export type TransactionType = 'income' | 'expense';
export type PaymentMethod = 'credit' | 'debit' | 'pix' | 'cash';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  paymentMethod?: PaymentMethod; // Added for tracking payment type
  category?: string; // Optional for backwards compatibility with stored data
  isRecurring?: boolean; // Keep for backward compatibility of already generated ones
  recurrenceId?: string; // Keep for backward compatibility
  installmentId?: string; // Groups transactions from the same installment purchase
  isPaid?: boolean; // Tracking check-in status (paid or not paid)
}

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  paymentMethod?: PaymentMethod;
  dayOfMonth: number; // 1-31
}

export interface Budget {
  id: string;
  category: string;
  amount: number;
}

export interface SavingsGoal {
  id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
}
