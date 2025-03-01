import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useExpenses } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const Settings: React.FC = () => {
  const { state } = useExpenses();
  const { state: authState } = useAuth();
  const { expenses, budgets } = state;
  
  const [exportDateRange, setExportDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const handleExportDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setExportDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Filter expenses by date range
    const filteredExpenses = expenses.filter(expense => 
      expense.date >= exportDateRange.startDate && expense.date <= exportDateRange.endDate
    );
    
    // Add title
    doc.setFontSize(18);
    doc.text('Expense Report', 14, 22);
    
    // Add user info
    if (authState.user) {
      doc.setFontSize(12);
      doc.text(`User: ${authState.user.name}`, 14, 30);
      doc.text(`Email: ${authState.user.email}`, 14, 36);
    }
    
    // Add date range
    doc.setFontSize(12);
    const dateText = `Date Range: ${format(new Date(exportDateRange.startDate), 'MMM dd, yyyy')} to ${format(new Date(exportDateRange.endDate), 'MMM dd, yyyy')}`;
    doc.text(dateText, 14, authState.user ? 42 : 30);
    
    // Prepare table data
    const tableColumn = ["Date", "Description", "Category", "Amount"];
    const tableRows = filteredExpenses.map(expense => [
      format(new Date(expense.date), 'MM/dd/yyyy'),
      expense.description,
      expense.category.charAt(0).toUpperCase() + expense.category.slice(1),
      `$${expense.amount.toFixed(2)}`
    ]);
    
    // Calculate total
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    tableRows.push(['', '', 'Total', `$${total.toFixed(2)}`]);
    
    // Add table
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: authState.user ? 50 : 40,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [46, 125, 50] },
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' }
    });
    
    // Save the PDF
    doc.save('expense-report.pdf');
  };

  const exportToCSV = () => {
    // Filter expenses by date range
    const filteredExpenses = expenses.filter(expense => 
      expense.date >= exportDateRange.startDate && expense.date <= exportDateRange.endDate
    );
    
    // Prepare CSV content
    const headers = ["Date", "Description", "Category", "Amount"];
    const rows = filteredExpenses.map(expense => [
      expense.date,
      expense.description,
      expense.category,
      expense.amount.toString()
    ]);
    
    // Add total row
    const total = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    rows.push(['', '', 'Total', total.toString()]);
    
    // Convert to CSV string
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'expense-report.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      localStorage.removeItem('expenses');
      localStorage.removeItem('budgets');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
      
      {/* Account Information */}
      {authState.user && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {authState.user.name}</p>
            <p><span className="font-medium">Email:</span> {authState.user.email}</p>
          </div>
        </div>
      )}
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Export Data</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={exportDateRange.startDate}
              onChange={handleExportDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={exportDateRange.endDate}
              onChange={handleExportDateChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={exportToPDF}
            className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Export as PDF
          </button>
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Export as CSV
          </button>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Data Management</h2>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            You have {expenses.length} expenses and {budgets.length} budgets stored.
          </p>
          <p className="text-sm text-gray-500">
            All data is stored locally in your browser. Clearing your browser data will remove all your expense records.
          </p>
        </div>
        
        <button
          onClick={clearAllData}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Clear All Data
        </button>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">About</h2>
        
        <p className="text-gray-600 mb-2">
          Expense Tracker v1.0.0
        </p>
        <p className="text-sm text-gray-500">
          A simple expense tracking application to help you manage your personal finances.
          Track expenses, set budgets, and visualize your spending habits.
        </p>
      </div>
    </div>
  );
};

export default Settings;