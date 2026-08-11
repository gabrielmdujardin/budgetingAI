import { Category, Transaction } from '@/types/transaction';

export const INCOME_CATEGORIES: Category[] = ['SALARY', 'INVESTMENTS'];

export function isIncomeCategory(category: Category): boolean {
  return INCOME_CATEGORIES.includes(category);
}

export function getTransactionTone(transaction: Pick<Transaction, 'category'>): 'income' | 'expense' {
  return isIncomeCategory(transaction.category) ? 'income' : 'expense';
}

export function getSignedAmount(transaction: Pick<Transaction, 'amount' | 'category'>): number {
  return isIncomeCategory(transaction.category) ? transaction.amount : -transaction.amount;
}

export function sumIncome(transactions: Transaction[] = []): number {
  return transactions
    .filter((transaction) => isIncomeCategory(transaction.category))
    .reduce((total, transaction) => total + transaction.amount, 0);
}

export function sumExpenses(transactions: Transaction[] = []): number {
  return transactions
    .filter((transaction) => !isIncomeCategory(transaction.category))
    .reduce((total, transaction) => total + transaction.amount, 0);
}
