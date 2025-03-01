import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ExpenseProvider } from './context/ExpenseContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import BudgetList from './components/BudgetList';
import ExpenseForm from './components/ExpenseForm';
import BudgetForm from './components/BudgetForm';
import EditExpensePage from './pages/EditExpensePage';
import EditBudgetPage from './pages/EditBudgetPage';
import Settings from './components/Settings';
import Login from './components/Login';
import Register from './components/Register';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <ExpenseProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="expenses" element={<ExpenseList />} />
                <Route path="budgets" element={<BudgetList />} />
                <Route path="add" element={<ExpenseForm />} />
                <Route path="edit/:id" element={<EditExpensePage />} />
                <Route path="budgets/add" element={<BudgetForm />} />
                <Route path="budgets/edit/:category" element={<EditBudgetPage />} />
                <Route path="settings" element={<Settings />} />
              </Route>
            </Route>
            
            {/* Redirect any unknown routes to login */}
            <Route path="*" element={<Navigate to="/login" />} />
          </Routes>
        </Router>
      </ExpenseProvider>
    </AuthProvider>
  );
}

export default App;