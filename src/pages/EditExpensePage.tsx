import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import ExpenseForm from '../components/ExpenseForm';
import { useExpenses } from '../context/ExpenseContext';

const EditExpensePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state } = useExpenses();
  
  const expense = state.expenses.find(e => e.id === id);
  
  if (!expense) {
    return <Navigate to="/expenses" />;
  }
  
  return (
    <div>
      <ExpenseForm expense={expense} isEditing={true} />
    </div>
  );
};

export default EditExpensePage;