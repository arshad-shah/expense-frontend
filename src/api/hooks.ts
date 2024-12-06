import { useQuery, useMutation } from '@apollo/client';
import {
  GET_USER,
  GET_ACCOUNTS,
  GET_TRANSACTIONS,
  GET_CATEGORIES,
  GET_BUDGETS,
  CREATE_ACCOUNT,
  CREATE_TRANSACTION,
  CREATE_CATEGORY,
  CREATE_BUDGET,
} from './queries/queries-mutations';
import { Account, AccountInput, Budget, BudgetInput, Category, CategoryInput, Transaction, TransactionInput, User } from '@/types';

export function useUser(id: string) {
  return useQuery<{ user: User }>(GET_USER, {
    variables: { id },
  });
}

export function useAccounts(userId: string) {
  return useQuery<{ accounts: Account[] }>(GET_ACCOUNTS, {
    variables: { userId },
  });
}

export function useTransactions(userId: string, accountId?: string) {
  return useQuery<{ transactions: Transaction[] }>(GET_TRANSACTIONS, {
    variables: { userId, accountId },
  });
}

export function useCategories(userId: string) {
  return useQuery<{ categories: Category[] }>(GET_CATEGORIES, {
    variables: { userId },
  });
}

export function useBudgets(userId: string) {
  return useQuery<{ budgets: Budget[] }>(GET_BUDGETS, {
    variables: { userId },
  });
}

export function useCreateAccount() {
  return useMutation<
    { createAccount: Account },
    { input: AccountInput }
  >(CREATE_ACCOUNT);
}

export function useCreateTransaction() {
  return useMutation<
    { createTransaction: Transaction },
    { input: TransactionInput }
  >(CREATE_TRANSACTION);
}

export function useCreateCategory() {
  return useMutation<
    { createCategory: Category },
    { input: CategoryInput }
  >(CREATE_CATEGORY);
}

export function useCreateBudget() {
  return useMutation<
    { createBudget: Budget },
    { input: BudgetInput }
  >(CREATE_BUDGET);
}