import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart3, PieChart, Home, Settings, PlusCircle, DollarSign, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { state: authState, logout } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-4 flex items-center space-x-2">
          <DollarSign className="h-8 w-8 text-emerald-600" />
          <h1 className="text-xl font-bold text-gray-800">Expense Tracker</h1>
        </div>
        
        {/* User info */}
        {authState.user && (
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-700">Welcome,</p>
            <p className="text-sm font-bold text-gray-900">{authState.user.name}</p>
            <p className="text-xs text-gray-500">{authState.user.email}</p>
          </div>
        )}
        
        <nav className="mt-6">
          <ul>
            <li>
              <Link
                to="/"
                className={`flex items-center px-4 py-3 text-gray-700 ${
                  isActive('/') ? 'bg-emerald-50 text-emerald-600 border-r-4 border-emerald-600' : 'hover:bg-gray-50'
                }`}
              >
                <Home className="h-5 w-5 mr-3" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                to="/expenses"
                className={`flex items-center px-4 py-3 text-gray-700 ${
                  isActive('/expenses') ? 'bg-emerald-50 text-emerald-600 border-r-4 border-emerald-600' : 'hover:bg-gray-50'
                }`}
              >
                <BarChart3 className="h-5 w-5 mr-3" />
                Expenses
              </Link>
            </li>
            <li>
              <Link
                to="/budgets"
                className={`flex items-center px-4 py-3 text-gray-700 ${
                  isActive('/budgets') ? 'bg-emerald-50 text-emerald-600 border-r-4 border-emerald-600' : 'hover:bg-gray-50'
                }`}
              >
                <PieChart className="h-5 w-5 mr-3" />
                Budgets
              </Link>
            </li>
            <li>
              <Link
                to="/add"
                className={`flex items-center px-4 py-3 text-gray-700 ${
                  isActive('/add') ? 'bg-emerald-50 text-emerald-600 border-r-4 border-emerald-600' : 'hover:bg-gray-50'
                }`}
              >
                <PlusCircle className="h-5 w-5 mr-3" />
                Add Expense
              </Link>
            </li>
            <li>
              <Link
                to="/settings"
                className={`flex items-center px-4 py-3 text-gray-700 ${
                  isActive('/settings') ? 'bg-emerald-50 text-emerald-600 border-r-4 border-emerald-600' : 'hover:bg-gray-50'
                }`}
              >
                <Settings className="h-5 w-5 mr-3" />
                Settings
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;