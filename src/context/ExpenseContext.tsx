import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Expense, Budget, DateRange } from '../types';

interface ExpenseState {
  expenses: Expense[];
  budgets: Budget[];
  dateRange: DateRange;
  isLoading: boolean;
  error: string | null;
}

type ExpenseAction =
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'SET_EXPENSES'; payload: Expense[] }
  | { type: 'ADD_BUDGET'; payload: Budget }
  | { type: 'UPDATE_BUDGET'; payload: Budget }
  | { type: 'DELETE_BUDGET'; payload: string }
  | { type: 'SET_BUDGETS'; payload: Budget[] }
  | { type: 'SET_DATE_RANGE'; payload: DateRange }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

interface ExpenseContextType {
  state: ExpenseState;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  deleteExpense: (id: string) => void;
  updateExpense: (expense: Expense) => void;
  addBudget: (budget: Budget) => void;
  updateBudget: (budget: Budget) => void;
  deleteBudget: (category: string) => void;
  setDateRange: (dateRange: DateRange) => void;
}

const initialState: ExpenseState = {
  expenses: [],
  budgets: [],
  dateRange: {
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  },
  isLoading: false,
  error: null
};

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

const expenseReducer = (state: ExpenseState, action: ExpenseAction): ExpenseState => {
  switch (action.type) {
    case 'ADD_EXPENSE':
      return {
        ...state,
        expenses: [...state.expenses, action.payload]
      };
    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload)
      };
    case 'UPDATE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.map(expense => 
          expense.id === action.payload.id ? action.payload : expense
        )
      };
    case 'SET_EXPENSES':
      return {
        ...state,
        expenses: action.payload
      };
    case 'ADD_BUDGET':
      return {
        ...state,
        budgets: [...state.budgets, action.payload]
      };
    case 'UPDATE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.map(budget => 
          budget.category === action.payload.category ? action.payload : budget
        )
      };
    case 'DELETE_BUDGET':
      return {
        ...state,
        budgets: state.budgets.filter(budget => budget.category !== action.payload)
      };
    case 'SET_BUDGETS':
      return {
        ...state,
        budgets: action.payload
      };
    case 'SET_DATE_RANGE':
      return {
        ...state,
        dateRange: action.payload
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
    default:
      return state;
  }
};

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(expenseReducer, initialState);

  // Load data from localStorage on initial render
  useEffect(() => {
    const loadData = () => {
      try {
        const storedExpenses = localStorage.getItem('expenses');
        const storedBudgets = localStorage.getItem('budgets');
        
        if (storedExpenses) {
          dispatch({ type: 'SET_EXPENSES', payload: JSON.parse(storedExpenses) });
        }
        
        if (storedBudgets) {
          dispatch({ type: 'SET_BUDGETS', payload: JSON.parse(storedBudgets) });
        }
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load saved data' });
      }
    };
    
    loadData();
  }, []);

  // Save data to localStorage whenever expenses or budgets change
  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(state.expenses));
  }, [state.expenses]);

  useEffect(() => {
    localStorage.setItem('budgets', JSON.stringify(state.budgets));
  }, [state.budgets]);

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = {
      ...expense,
      id: uuidv4()
    };
    dispatch({ type: 'ADD_EXPENSE', payload: newExpense });
  };

  const deleteExpense = (id: string) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
  };

  const updateExpense = (expense: Expense) => {
    dispatch({ type: 'UPDATE_EXPENSE', payload: expense });
  };

  const addBudget = (budget: Budget) => {
    dispatch({ type: 'ADD_BUDGET', payload: budget });
  };

  const updateBudget = (budget: Budget) => {
    dispatch({ type: 'UPDATE_BUDGET', payload: budget });
  };

  const deleteBudget = (category: string) => {
    dispatch({ type: 'DELETE_BUDGET', payload: category });
  };

  const setDateRange = (dateRange: DateRange) => {
    dispatch({ type: 'SET_DATE_RANGE', payload: dateRange });
  };

  return (
    <ExpenseContext.Provider
      value={{
        state,
        addExpense,
        deleteExpense,
        updateExpense,
        addBudget,
        updateBudget,
        deleteBudget,
        setDateRange
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error('useExpenses must be used within an ExpenseProvider');
  }
  return context;
};