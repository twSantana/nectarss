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
