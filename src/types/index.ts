export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

export interface Budget {
  category: string;
  amount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // Added for authentication
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  error: string | null;
}

export type ExpenseCategory = 
  | 'food'
  | 'transportation'
  | 'housing'
  | 'utilities'
  | 'entertainment'
  | 'healthcare'
  | 'education'
  | 'shopping'
  | 'travel'
  | 'other';

export const CATEGORIES: ExpenseCategory[] = [
  'food',
  'transportation',
  'housing',
  'utilities',
  'entertainment',
  'healthcare',
  'education',
  'shopping',
  'travel',
  'other'
];

export interface DateRange {
  startDate: string;
  endDate: string;
}