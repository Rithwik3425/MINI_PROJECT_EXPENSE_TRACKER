import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Budget, CATEGORIES } from '../types';
import { useExpenses } from '../context/ExpenseContext';

interface BudgetFormProps {
  budget?: Budget;
  isEditing?: boolean;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ budget, isEditing = false }) => {
  const { addBudget, updateBudget } = useExpenses();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    category: 'food',
    amount: ''
  });
  
  const [errors, setErrors] = useState({
    amount: ''
  });

  useEffect(() => {
    if (isEditing && budget) {
      setFormData({
        category: budget.category,
        amount: budget.amount.toString()
      });
    }
  }, [isEditing, budget]);

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      amount: ''
    };

    if (!formData.amount) {
      newErrors.amount = 'Budget amount is required';
      valid = false;
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Budget amount must be a positive number';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const budgetData: Budget = {
      category: formData.category,
      amount: parseFloat(formData.amount)
    };
    
    if (isEditing) {
      updateBudget(budgetData);
    } else {
      addBudget(budgetData);
    }
    
    navigate('/budgets');
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">{isEditing ? 'Edit Budget' : 'Add New Budget'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            disabled={isEditing}
          >
            {CATEGORIES.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>
        </div>
        
        <div className="mb-6">
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
            Monthly Budget Amount
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-500">$</span>
            </div>
            <input
              type="text"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className={`w-full pl-7 px-3 py-2 border rounded-md ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-emerald-500`}
              placeholder="0.00"
            />
          </div>
          {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
        </div>
        
        <div className="flex space-x-4">
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            {isEditing ? 'Update Budget' : 'Add Budget'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/budgets')}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default BudgetForm;