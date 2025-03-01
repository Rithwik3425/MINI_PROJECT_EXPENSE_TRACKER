import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';
import { PlusCircle, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { useExpenses } from '../context/ExpenseContext';
import { CATEGORIES } from '../types';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard: React.FC = () => {
  const { state } = useExpenses();
  const { expenses, budgets } = state;

  // Get current month data
  const today = new Date();
  const firstDayOfMonth = startOfMonth(today);
  const lastDayOfMonth = endOfMonth(today);
  
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate >= firstDayOfMonth && expenseDate <= lastDayOfMonth;
  });

  // Get last 7 days data
  const last7DaysExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    const sevenDaysAgo = subDays(today, 7);
    return expenseDate >= sevenDaysAgo && expenseDate <= today;
  });

  // Calculate totals
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const currentMonthTotal = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const last7DaysTotal = last7DaysExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Calculate spending by category for current month
  const spendingByCategory = currentMonthExpenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = 0;
    }
    acc[expense.category] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Calculate budget status
  const budgetStatus = budgets.map(budget => {
    const spent = spendingByCategory[budget.category] || 0;
    const remaining = budget.amount - spent;
    const percentage = Math.round((spent / budget.amount) * 100);
    return {
      category: budget.category,
      budget: budget.amount,
      spent,
      remaining,
      percentage
    };
  });

  // Prepare data for pie chart
  const pieChartData = {
    labels: Object.keys(spendingByCategory).map(
      category => category.charAt(0).toUpperCase() + category.slice(1)
    ),
    datasets: [
      {
        data: Object.values(spendingByCategory),
        backgroundColor: [
          '#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0',
          '#00BCD4', '#FFEB3B', '#795548', '#607D8B', '#F44336'
        ],
        borderWidth: 1
      }
    ]
  };

  // Prepare data for bar chart (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i);
    return {
      date,
      dateString: date.toISOString().split('T')[0],
      label: format(date, 'EEE')
    };
  });

  const barChartData = {
    labels: last7Days.map(day => day.label),
    datasets: [
      {
        label: 'Daily Expenses',
        data: last7Days.map(day => {
          return expenses
            .filter(expense => expense.date === day.dateString)
            .reduce((sum, expense) => sum + expense.amount, 0);
        }),
        backgroundColor: 'rgba(76, 175, 80, 0.6)',
        borderColor: 'rgba(76, 175, 80, 1)',
        borderWidth: 1
      }
    ]
  };

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Last 7 Days Expenses'
      }
    }
  };

  // Get recent transactions
  const recentTransactions = [...expenses]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Calculate budget alerts
  const budgetAlerts = budgetStatus.filter(status => status.percentage >= 80);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <Link
          to="/add"
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Expense
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-500 text-sm">Total Expenses</h3>
            <DollarSign className="h-6 w-6 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold">${totalExpenses.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-2">All time</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-500 text-sm">This Month</h3>
            <Calendar className="h-6 w-6 text-blue-600" />
          </div>
          <p className="text-2xl font-bold">${currentMonthTotal.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-2">{format(firstDayOfMonth, 'MMMM yyyy')}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-500 text-sm">Last 7 Days</h3>
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          <p className="text-2xl font-bold">${last7DaysTotal.toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-2">
            {format(subDays(today, 7), 'MMM dd')} - {format(today, 'MMM dd')}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-500 text-sm">Avg. Daily (This Month)</h3>
            <TrendingDown className="h-6 w-6 text-orange-600" />
          </div>
          <p className="text-2xl font-bold">
            ${(currentMonthTotal / Math.max(today.getDate(), 1)).toFixed(2)}
          </p>
          <p className="text-sm text-gray-500 mt-2">Per day</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Spending by Category</h3>
          <div className="h-64">
            {Object.keys(spendingByCategory).length > 0 ? (
              <Pie data={pieChartData} />
            ) : (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-500">No data for current month</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Daily Expenses</h3>
          <div className="h-64">
            <Bar options={barChartOptions} data={barChartData} />
          </div>
        </div>
      </div>

      {/* Budget Status */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Budget Status</h3>
          <Link
            to="/budgets"
            className="text-sm text-emerald-600 hover:text-emerald-800"
          >
            View All
          </Link>
        </div>

        {budgetStatus.length > 0 ? (
          <div className="space-y-4">
            {budgetStatus.map(status => (
              <div key={status.category} className="border-b pb-4 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium capitalize">{status.category}</span>
                  <span className={`text-sm ${
                    status.remaining < 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    ${status.spent.toFixed(2)} / ${status.budget.toFixed(2)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      status.percentage > 100 ? 'bg-red-600' : 
                      status.percentage > 80 ? 'bg-yellow-500' : 'bg-green-600'
                    }`}
                    style={{ width: `${Math.min(status.percentage, 100)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500">
                    {status.percentage}% used
                  </span>
                  <span className={`text-xs ${
                    status.remaining < 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {status.remaining < 0 ? 'Over budget by' : 'Remaining'}: ${Math.abs(status.remaining).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-4 text-center">
            <p className="text-gray-500">No budgets set. Create your first budget!</p>
            <Link
              to="/budgets/add"
              className="mt-2 inline-block text-sm text-emerald-600 hover:text-emerald-800"
            >
              Set Budget
            </Link>
          </div>
        )}
      </div>

      {/* Recent Transactions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Recent Transactions</h3>
            <Link
              to="/expenses"
              className="text-sm text-emerald-600 hover:text-emerald-800"
            >
              View All
            </Link>
          </div>

          {recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {recentTransactions.map(transaction => (
                <div key={transaction.id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-md">
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(transaction.date), 'MMM dd, yyyy')} • 
                      <span className="capitalize ml-1">{transaction.category}</span>
                    </p>
                  </div>
                  <span className="font-medium">${transaction.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-gray-500">No transactions yet</p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-medium mb-4">Budget Alerts</h3>

          {budgetAlerts.length > 0 ? (
            <div className="space-y-3">
              {budgetAlerts.map(alert => (
                <div key={alert.category} className={`p-3 rounded-md ${
                  alert.percentage >= 100 ? 'bg-red-50' : 'bg-yellow-50'
                }`}>
                  <div className="flex justify-between items-center">
                    <p className="font-medium capitalize">{alert.category}</p>
                    <span className={`text-sm font-medium ${
                      alert.percentage >= 100 ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {alert.percentage}% used
                    </span>
                  </div>
                  <p className={`text-sm ${
                    alert.percentage >= 100 ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {alert.percentage >= 100 
                      ? `Over budget by $${Math.abs(alert.remaining).toFixed(2)}` 
                      : `$${alert.remaining.toFixed(2)} remaining of $${alert.budget.toFixed(2)}`}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-gray-500">No budget alerts</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;