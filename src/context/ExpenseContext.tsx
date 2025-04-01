import React, { createContext, useContext, useEffect, useReducer } from "react";
import { Budget, DateRange, Expense } from "../types";
import { useAuth } from "./AuthContext";

interface ExpenseState {
  expenses: Expense[];
  budgets: Budget[];
  dateRange: DateRange;
  isLoading: boolean;
  error: string | null;
}

type ExpenseAction =
  | { type: "ADD_EXPENSE"; payload: Expense }
  | { type: "DELETE_EXPENSE"; payload: string }
  | { type: "UPDATE_EXPENSE"; payload: Expense }
  | { type: "SET_EXPENSES"; payload: Expense[] }
  | { type: "ADD_BUDGET"; payload: Budget }
  | { type: "UPDATE_BUDGET"; payload: Budget }
  | { type: "DELETE_BUDGET"; payload: string }
  | { type: "SET_BUDGETS"; payload: Budget[] }
  | { type: "SET_DATE_RANGE"; payload: DateRange }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null };

interface ExpenseContextType {
  state: ExpenseState;
  addExpense: (expense: Omit<Expense, "id">) => Promise<boolean>;
  deleteExpense: (id: string) => Promise<boolean>;
  updateExpense: (expense: Expense) => Promise<boolean>;
  addBudget: (budget: Omit<Budget, "id">) => Promise<boolean>;
  updateBudget: (budget: Budget) => Promise<boolean>;
  deleteBudget: (category: string) => Promise<boolean>;
  setDateRange: (dateRange: DateRange) => void;
  refreshData: () => Promise<void>;
}

const initialState: ExpenseState = {
  expenses: [],
  budgets: [],
  dateRange: {
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  },
  isLoading: false,
  error: null,
};

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

// Get server URL from environment or use default
const serverUrl =
  import.meta.env.REACT_APP_SERVER_URL || "http://localhost:11000";

const expenseReducer = (
  state: ExpenseState,
  action: ExpenseAction
): ExpenseState => {
  switch (action.type) {
    case "ADD_EXPENSE":
      return {
        ...state,
        expenses: [...state.expenses, action.payload],
      };
    case "DELETE_EXPENSE":
      return {
        ...state,
        expenses: state.expenses.filter(
          (expense) => expense.id !== action.payload
        ),
      };
    case "UPDATE_EXPENSE":
      return {
        ...state,
        expenses: state.expenses.map((expense) =>
          expense.id === action.payload.id ? action.payload : expense
        ),
      };
    case "SET_EXPENSES":
      return {
        ...state,
        expenses: action.payload,
      };
    case "ADD_BUDGET":
      return {
        ...state,
        budgets: [...state.budgets, action.payload],
      };
    case "UPDATE_BUDGET":
      return {
        ...state,
        budgets: state.budgets.map((budget) =>
          budget.category === action.payload.category ? action.payload : budget
        ),
      };
    case "DELETE_BUDGET":
      return {
        ...state,
        budgets: state.budgets.filter(
          (budget) => budget.category !== action.payload
        ),
      };
    case "SET_BUDGETS":
      return {
        ...state,
        budgets: action.payload,
      };
    case "SET_DATE_RANGE":
      return {
        ...state,
        dateRange: action.payload,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    case "SET_ERROR":
      return {
        ...state,
        error: action.payload,
      };
    default:
      return state;
  }
};

export const ExpenseProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(expenseReducer, initialState);
  const { state: authState } = useAuth();

  // Create headers with authentication token
  const getHeaders = () => {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authState.token}`,
    };
  };

  // Fetch expenses and budgets from API
  const fetchExpenses = async () => {
    if (!authState.isAuthenticated || !authState.token) return;

    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const { startDate, endDate } = state.dateRange;
      const query = `startDate=${startDate}&endDate=${endDate}`;

      const response = await fetch(`${serverUrl}/api/expense?${query}`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch expenses");
      }

      const data = await response.json();

      // Transform data if needed to match your frontend model
      const expenses = data.map((expense: any) => ({
        id: expense._id,
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        date: new Date(expense.date).toISOString().split("T")[0],
      }));

      dispatch({ type: "SET_EXPENSES", payload: expenses });
    } catch (error) {
      console.error("Error fetching expenses:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to load expenses" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  const fetchBudgets = async () => {
    if (!authState.isAuthenticated || !authState.token) return;

    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const response = await fetch(`${serverUrl}/api/budget`, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch budgets");
      }

      const data = await response.json();

      // Transform data if needed to match your frontend model
      const budgets = data.map((budget: any) => ({
        id: budget._id,
        category: budget.category,
        amount: budget.amount,
      }));

      dispatch({ type: "SET_BUDGETS", payload: budgets });
    } catch (error) {
      console.error("Error fetching budgets:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to load budgets" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Refresh all data
  const refreshData = async () => {
    await Promise.all([fetchExpenses(), fetchBudgets()]);
  };

  // Load data when component mounts or when auth state changes
  useEffect(() => {
    if (authState.isAuthenticated) {
      refreshData();
    }
  }, [authState.isAuthenticated]);

  // Also refresh when date range changes
  useEffect(() => {
    if (authState.isAuthenticated) {
      fetchExpenses();
    }
  }, [state.dateRange]);

  // Add a new expense
  const addExpense = async (expense: Omit<Expense, "id">): Promise<boolean> => {
    if (!authState.isAuthenticated) return false;

    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const response = await fetch(`${serverUrl}/api/expense`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(expense),
      });

      if (!response.ok) {
        throw new Error("Failed to add expense");
      }

      const savedExpense = await response.json();

      // Transform response to match your frontend model
      const newExpense = {
        id: savedExpense._id,
        description: savedExpense.description,
        amount: savedExpense.amount,
        category: savedExpense.category,
        date: new Date(savedExpense.date).toISOString().split("T")[0],
      };

      dispatch({ type: "ADD_EXPENSE", payload: newExpense });
      return true;
    } catch (error) {
      console.error("Error adding expense:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to add expense" });
      return false;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Delete an expense
  const deleteExpense = async (id: string): Promise<boolean> => {
    if (!authState.isAuthenticated) return false;

    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const response = await fetch(`${serverUrl}/api/expense/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to delete expense");
      }

      dispatch({ type: "DELETE_EXPENSE", payload: id });
      return true;
    } catch (error) {
      console.error("Error deleting expense:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to delete expense" });
      return false;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Update an expense
  const updateExpense = async (expense: Expense): Promise<boolean> => {
    if (!authState.isAuthenticated) return false;

    try {
      dispatch({ type: "SET_LOADING", payload: true });

      // Extract id and prepare payload without id for the backend
      const { id, ...expenseData } = expense;

      const response = await fetch(`${serverUrl}/api/expense/${id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(expenseData),
      });

      if (!response.ok) {
        throw new Error("Failed to update expense");
      }

      const updatedExpense = await response.json();

      // Transform response to match your frontend model
      const transformedExpense = {
        id: updatedExpense._id,
        description: updatedExpense.description,
        amount: updatedExpense.amount,
        category: updatedExpense.category,
        date: new Date(updatedExpense.date).toISOString().split("T")[0],
      };

      dispatch({ type: "UPDATE_EXPENSE", payload: transformedExpense });
      return true;
    } catch (error) {
      console.error("Error updating expense:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to update expense" });
      return false;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Add a new budget
  const addBudget = async (budget: Omit<Budget, "id">): Promise<boolean> => {
    if (!authState.isAuthenticated) return false;

    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const response = await fetch(`${serverUrl}/api/budget`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(budget),
      });

      if (!response.ok) {
        throw new Error("Failed to add budget");
      }

      const savedBudget = await response.json();

      // Transform response to match your frontend model
      const newBudget = {
        id: savedBudget._id,
        category: savedBudget.category,
        amount: savedBudget.amount,
      };

      dispatch({ type: "ADD_BUDGET", payload: newBudget });
      return true;
    } catch (error) {
      console.error("Error adding budget:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to add budget" });
      return false;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Update a budget
  const updateBudget = async (budget: Budget): Promise<boolean> => {
    if (!authState.isAuthenticated) return false;

    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const response = await fetch(
        `${serverUrl}/api/budget/${budget.category}`,
        {
          method: "PUT",
          headers: getHeaders(),
          body: JSON.stringify({ amount: budget.amount }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update budget");
      }

      const updatedBudget = await response.json();

      // Transform response to match your frontend model
      const transformedBudget = {
        id: updatedBudget._id,
        category: updatedBudget.category,
        amount: updatedBudget.amount,
      };

      dispatch({ type: "UPDATE_BUDGET", payload: transformedBudget });
      return true;
    } catch (error) {
      console.error("Error updating budget:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to update budget" });
      return false;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Delete a budget
  const deleteBudget = async (category: string): Promise<boolean> => {
    if (!authState.isAuthenticated) return false;

    try {
      dispatch({ type: "SET_LOADING", payload: true });

      const response = await fetch(`${serverUrl}/api/budget/${category}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error("Failed to delete budget");
      }

      dispatch({ type: "DELETE_BUDGET", payload: category });
      return true;
    } catch (error) {
      console.error("Error deleting budget:", error);
      dispatch({ type: "SET_ERROR", payload: "Failed to delete budget" });
      return false;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  };

  // Set date range
  const setDateRange = (dateRange: DateRange) => {
    dispatch({ type: "SET_DATE_RANGE", payload: dateRange });
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
        setDateRange,
        refreshData,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpenses = () => {
  const context = useContext(ExpenseContext);
  if (context === undefined) {
    throw new Error("useExpenses must be used within an ExpenseProvider");
  }
  return context;
};
