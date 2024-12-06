import { gql } from '@apollo/client';

export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      email
      firstName
      lastName
      currency
    }
  }
`;

export const GET_ACCOUNTS = gql`
  query GetAccounts($userId: ID!) {
    accounts(userId: $userId) {
      id
      name
      accountType
      bankName
      balance
      currency
      isActive
      lastSync
    }
  }
`;

export const GET_TRANSACTIONS = gql`
  query GetTransactions($userId: ID!, $accountId: ID) {
    transactions(userId: $userId, accountId: $accountId) {
      id
      amount
      type
      description
      transactionDate
      isRecurring
      recurringPattern
      account {
        id
        name
      }
      category {
        id
        name
        icon
        color
      }
    }
  }
`;

export const GET_CATEGORIES = gql`
  query GetCategories($userId: ID!) {
    categories(userId: $userId) {
      id
      name
      type
      icon
      color
      isDefault
      isActive
    }
  }
`;

export const GET_BUDGETS = gql`
  query GetBudgets($userId: ID!) {
    budgets(userId: $userId) {
      id
      name
      amount
      period
      startDate
      endDate
      isActive
      categories {
        allocatedAmount
        spentAmount
        category {
          id
          name
          icon
          color
        }
      }
    }
  }
`;

// mutations.ts
export const CREATE_ACCOUNT = gql`
  mutation CreateAccount($input: AccountInput!) {
    createAccount(input: $input) {
      id
      name
      accountType
      bankName
      balance
      currency
      isActive
    }
  }
`;

export const CREATE_TRANSACTION = gql`
  mutation CreateTransaction($input: TransactionInput!) {
    createTransaction(input: $input) {
      id
      amount
      type
      description
      transactionDate
      isRecurring
      recurringPattern
    }
  }
`;

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CategoryInput!) {
    createCategory(input: $input) {
      id
      name
      type
      icon
      color
      isDefault
      isActive
    }
  }
`;

export const CREATE_BUDGET = gql`
  mutation CreateBudget($input: BudgetInput!) {
    createBudget(input: $input) {
      id
      name
      amount
      period
      startDate
      endDate
      isActive
    }
  }
`;