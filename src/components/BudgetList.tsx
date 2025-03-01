import React from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, PlusCircle } from 'lucide-react';
import { useExpenses } from '../context/ExpenseContext';

const BudgetList: React.FC = () => {
  const { state, deleteBudget } = useExpenses();
  const { budgets, expenses } = state;

  // Get current month expenses
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const startOfMonth = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
  const endOfMonth = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];
  
  const currentMonthExpenses = expenses.filter(
    expense => expense.date >= startOfMonth && expense.date <= endOfMonth
  );

  // Calculate spending by category
  const spendingByCategory = currentMonthExpenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  const handleDelete = (category: string) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      deleteBudget(category);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Monthly Budgets</h2>
          <Link
            to="/budgets/add"
            className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Budget
          </Link>
        </div>

        {budgets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map(budget => {
              const spent = spendingByCategory[budget.category] || 0;
              const percentage = Math.min(Math.round((spent / budget.amount) * 100), 100);
              const isOverBudget = spent > budget.amount;
              
              return (
                <div key={budget.category} className="border rounded-lg overflow-hidden">
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium capitalize">{budget.category}</h3>
                      <div className="flex space-x-2">
                        <Link
                          to={`/budgets/edit/${budget.category}`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(budget.category)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Budget:</span>
                      <span className="font-medium">${budget.amount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Spent:</span>
                      <span className={`font-medium ${isOverBudget ? 'text-red-600' : ''}`}>
                        ${spent.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Remaining:</span>
                      <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                        ${(budget.amount - spent).toFixed(2)}
                      </span>
                    </div>
                    
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            isOverBudget ? 'bg-red-600' : percentage > 80 ? 'bg-yellow-500' : 'bg-green-600'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-500">0%</span>
                        <span className={`text-xs ${
                          isOverBudget ? 'text-red-600' : percentage > 80 ? 'text-yellow-500' : 'text-green-600'
                        }`}>
                          {percentage}%
                        </span>
                        <span className="text-xs text-gray-500">100%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-500">No budgets found. Set your first budget!</p>
            <Link
              to="/budgets/add"
              className="mt-4 inline-block px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
            >
              Add Budget
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetList;