import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import BudgetForm from '../components/BudgetForm';
import { useExpenses } from '../context/ExpenseContext';

const EditBudgetPage: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const { state } = useExpenses();
  
  const budget = state.budgets.find(b => b.category === category);
  
  if (!budget) {
    return <Navigate to="/budgets" />;
  }
  
  return (
    <div>
      <BudgetForm budget={budget} isEditing={true} />
    </div>
  );
};

export default EditBudgetPage;