// src/components/Navigation.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Layout, 
  Home, 
  CreditCard, 
  DollarSign, 
  PieChart, 
  User, 
  LogOut 
} from 'lucide-react';

const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  if (!user) return null;

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard' },
    { path: '/accounts', icon: CreditCard, label: 'Accounts' },
    { path: '/transactions', icon: DollarSign, label: 'Transactions' },
    { path: '/budgets', icon: PieChart, label: 'Budgets' },
  ];

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Layout className="h-8 w-8 text-teal-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">ExpenseTracker</span>
            </div>

            {/* Navigation Items */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                    isActivePath(item.path)
                      ? 'text-teal-600 bg-teal-50'
                      : 'text-gray-600 hover:text-teal-600 hover:bg-gray-50'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-1.5" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <Link
              to="/profile"
              className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                isActivePath('/profile')
                  ? 'text-teal-600 bg-teal-50'
                  : 'text-gray-600 hover:text-teal-600 hover:bg-gray-50'
              }`}
            >
              <User className="h-5 w-5 mr-1.5" />
              Profile
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors duration-150"
            >
              <LogOut className="h-5 w-5 mr-1.5" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;