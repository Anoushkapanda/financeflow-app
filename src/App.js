import React, { useState, useEffect, createContext, useContext } from 'react';
import { Plus, TrendingUp, TrendingDown, Wallet, PieChart, Activity, Trash2, Edit3, Calendar, Search, Filter, ArrowUpRight, ArrowDownRight, DollarSign, Sun, Moon } from 'lucide-react';

// Theme Context
const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

// Theme Toggle Component
const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
        isDark 
          ? 'bg-gradient-to-r from-violet-600 to-purple-600 shadow-lg shadow-violet-500/25' 
          : 'bg-gradient-to-r from-amber-400 to-orange-400 shadow-lg shadow-amber-500/25'
      }`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <div
        className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${
          isDark ? 'translate-x-0.5' : 'translate-x-7'
        }`}
      >
        {isDark ? (
          <Moon className="w-3 h-3 text-violet-600 transition-transform duration-300" />
        ) : (
          <Sun className="w-3 h-3 text-amber-600 transition-transform duration-300 rotate-180" />
        )}
      </div>
    </button>
  );
};

const FinanceTracker = () => {
  const { isDark } = useTheme();
  const [transactions, setTransactions] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    type: 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  });

  const categories = {
    expense: [
      { name: 'Food & Dining', icon: '🍽️', color: 'from-orange-400 to-pink-400' },
      { name: 'Transportation', icon: '🚗', color: 'from-blue-400 to-cyan-400' },
      { name: 'Shopping', icon: '🛍️', color: 'from-purple-400 to-pink-400' },
      { name: 'Entertainment', icon: '🎬', color: 'from-red-400 to-pink-400' },
      { name: 'Bills & Utilities', icon: '⚡', color: 'from-yellow-400 to-orange-400' },
      { name: 'Healthcare', icon: '🏥', color: 'from-green-400 to-teal-400' },
      { name: 'Other', icon: '📦', color: 'from-gray-400 to-gray-500' }
    ],
    income: [
      { name: 'Salary', icon: '💼', color: 'from-green-400 to-emerald-400' },
      { name: 'Freelance', icon: '💻', color: 'from-blue-400 to-indigo-400' },
      { name: 'Investment', icon: '📈', color: 'from-purple-400 to-violet-400' },
      { name: 'Business', icon: '🏢', color: 'from-indigo-400 to-blue-400' },
      { name: 'Gift', icon: '🎁', color: 'from-pink-400 to-rose-400' },
      { name: 'Other', icon: '💰', color: 'from-yellow-400 to-amber-400' }
    ]
  };

  const getCategoryDetails = (categoryName, type) => {
    const categoryList = categories[type] || categories.expense;
    return categoryList.find(cat => cat.name === categoryName) || categoryList[categoryList.length - 1];
  };

  const handleSubmit = () => {
    if (!formData.amount || !formData.category || !formData.description) {
      return;
    }

    const newTransaction = {
      id: editingId || Date.now(),
      ...formData,
      amount: parseFloat(formData.amount),
      timestamp: new Date().toISOString()
    };

    if (editingId) {
      setTransactions(transactions.map(t => t.id === editingId ? newTransaction : t));
      setEditingId(null);
    } else {
      setTransactions([newTransaction, ...transactions]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    });
    setShowAddForm(false);
    setEditingId(null);
  };

  const handleEdit = (transaction) => {
    setFormData({
      type: transaction.type,
      amount: transaction.amount.toString(),
      category: transaction.category,
      description: transaction.description,
      date: transaction.date
    });
    setEditingId(transaction.id);
    setShowAddForm(true);
  };

  const handleDelete = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {});

  const filteredTransactions = transactions
    .filter(t => filterType === 'all' || t.type === filterType)
    .filter(t => {
      if (!searchTerm.trim()) return true;
      const searchLower = searchTerm.toLowerCase();
      const descriptionMatch = t.description.toLowerCase().includes(searchLower);
      const categoryMatch = t.category.toLowerCase().includes(searchLower);
      return descriptionMatch || categoryMatch;
    });

  const recentTransactions = filteredTransactions.slice(0, 6);

  // Theme-based classes
  const themeClasses = {
    background: isDark 
      ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
      : 'bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50',
    cardBg: isDark 
      ? 'backdrop-blur-xl bg-white/10 border-white/20' 
      : 'bg-white border-slate-200 shadow-xl',
    cardBgAlt: isDark 
      ? 'bg-white/5 backdrop-blur-sm border-white/10' 
      : 'bg-slate-50 border-slate-200',
    textPrimary: isDark ? 'text-white' : 'text-slate-900',
    textSecondary: isDark ? 'text-purple-200' : 'text-slate-700',
    textMuted: isDark ? 'text-gray-400' : 'text-slate-500',
    inputBg: isDark 
      ? 'bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder-gray-400' 
      : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400',
    inputFocus: isDark ? 'focus:ring-purple-500' : 'focus:ring-violet-500',
    buttonPrimary: 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white',
    buttonSecondary: isDark 
      ? 'bg-white/10 hover:bg-white/20 text-gray-300 border-white/20' 
      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300',
    statsCardIncome: isDark 
      ? 'bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-green-500/30' 
      : 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200',
    statsCardExpense: isDark 
      ? 'bg-gradient-to-br from-red-500/20 to-pink-600/20 border-red-500/30' 
      : 'bg-gradient-to-br from-red-50 to-pink-50 border-red-200',
    statsCardBalance: (balance) => isDark 
      ? balance >= 0 
        ? 'bg-gradient-to-br from-blue-500/20 to-purple-600/20 border-blue-500/30' 
        : 'bg-gradient-to-br from-orange-500/20 to-red-600/20 border-orange-500/30'
      : balance >= 0 
        ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200' 
        : 'bg-gradient-to-br from-orange-50 to-red-50 border-orange-200',
  };

  return (
    <div className={`min-h-screen ${themeClasses.background} transition-all duration-300`}>
      <style>
        {`
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          
          ::-webkit-scrollbar-track {
            background: ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(148, 163, 184, 0.1)'};
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: linear-gradient(45deg, ${isDark ? '#8b5cf6, #a855f7' : '#6366f1, #8b5cf6'});
            border-radius: 10px;
            border: 1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(148, 163, 184, 0.2)'};
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(45deg, ${isDark ? '#7c3aed, #9333ea' : '#4f46e5, #7c3aed'});
          }
          
          * {
            scrollbar-width: thin;
            scrollbar-color: ${isDark ? '#8b5cf6 rgba(255, 255, 255, 0.05)' : '#6366f1 rgba(148, 163, 184, 0.1)'};
          }
        `}
      </style>

      {!isDark && <div className="absolute inset-0 bg-white/30"></div>}
      {isDark && <div className="absolute inset-0 bg-black opacity-10"></div>}
      
      <div className="relative z-10 p-4 max-w-7xl mx-auto">
        <div className={`${themeClasses.cardBg} rounded-2xl sm:rounded-3xl shadow-2xl border p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 transition-all duration-300 relative`}>
          <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
            <ThemeToggle />
          </div>
          
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6 pr-16 sm:pr-20 lg:pr-4 lg:pr-24">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <Wallet className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
              </div>
              <div>
                <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${themeClasses.textPrimary} mb-1 sm:mb-2 transition-colors duration-300`}>FinanceFlow</h1>
                <p className={`${themeClasses.textSecondary} text-sm sm:text-base lg:text-lg transition-colors duration-300`}>Smart money management made beautiful</p>
              </div>
            </div>
            
            <div className="flex justify-end w-full lg:flex-shrink-0">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className={`${themeClasses.buttonPrimary} px-6 py-3 sm:px-8 sm:py-4 lg:px-12 lg:py-5 rounded-xl sm:rounded-xl lg:rounded-2xl flex items-center gap-2 sm:gap-3 lg:gap-4 transition-all duration-300 shadow-lg sm:shadow-xl hover:shadow-violet-500/30 hover:scale-105 font-semibold text-base sm:text-lg lg:text-xl w-full sm:w-full lg:min-w-[280px] justify-center`}
              >
                <Plus className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />
                <span>New Transaction</span>
              </button>
            </div>
          </div>
        </div>

        {showAddForm && (
          <div className={`${themeClasses.cardBg} rounded-2xl sm:rounded-3xl shadow-2xl border p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 transition-all duration-300`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Plus className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
              </div>
              <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold ${themeClasses.textPrimary} transition-colors duration-300`}>
                {editingId ? 'Edit Transaction' : 'Add New Transaction'}
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <div className="space-y-2">
                <label className={`text-sm sm:text-base lg:text-lg font-semibold ${themeClasses.textSecondary} uppercase tracking-wide transition-colors duration-300`}>Transaction Type</label>
                <div className="flex gap-2">
                  {['expense', 'income'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFormData({...formData, type, category: ''})}
                      className={`flex-1 py-3 sm:py-4 lg:py-5 px-4 sm:px-6 lg:px-8 rounded-xl font-semibold capitalize transition-all duration-200 text-sm sm:text-base lg:text-lg ${
                        formData.type === type
                          ? type === 'expense' 
                            ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg' 
                            : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                          : `${themeClasses.buttonSecondary} border`
                      }`}
                    >
                      {type === 'expense' ? <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 inline mr-2" /> : <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 inline mr-2" />}
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-sm sm:text-base lg:text-lg font-semibold ${themeClasses.textSecondary} uppercase tracking-wide transition-colors duration-300`}>Amount</label>
                <div className="relative">
                  <DollarSign className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.textMuted} w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 transition-colors duration-300`} />
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className={`w-full pl-12 sm:pl-14 lg:pl-16 pr-4 py-3 sm:py-4 lg:py-5 ${themeClasses.inputBg} border rounded-xl ${themeClasses.inputFocus} focus:border-transparent text-base sm:text-lg lg:text-xl font-semibold transition-all duration-300`}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-sm sm:text-base lg:text-lg font-semibold ${themeClasses.textSecondary} uppercase tracking-wide transition-colors duration-300`}>Date</label>
                <div className="relative">
                  <Calendar className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.textMuted} w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 transition-colors duration-300`} />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className={`w-full pl-12 sm:pl-14 lg:pl-16 pr-4 py-3 sm:py-4 lg:py-5 ${themeClasses.inputBg} border rounded-xl ${themeClasses.inputFocus} focus:border-transparent text-base sm:text-lg lg:text-xl transition-all duration-300`}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <label className={`text-sm sm:text-base lg:text-lg font-semibold ${themeClasses.textSecondary} uppercase tracking-wide transition-colors duration-300`}>Category</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                  {categories[formData.type].map((category) => (
                    <button
                      key={category.name}
                      onClick={() => setFormData({...formData, category: category.name})}
                      className={`p-3 sm:p-4 lg:p-5 rounded-xl border transition-all duration-200 text-left ${
                        formData.category === category.name
                          ? 'bg-gradient-to-r ' + category.color + ' text-white border-transparent shadow-lg scale-105'
                          : `${themeClasses.buttonSecondary} border`
                      }`}
                    >
                      <div className="text-lg sm:text-xl lg:text-2xl mb-1">{category.icon}</div>
                      <div className="text-xs sm:text-sm lg:text-base font-medium">{category.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className={`text-sm sm:text-base lg:text-lg font-semibold ${themeClasses.textSecondary} uppercase tracking-wide transition-colors duration-300`}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className={`w-full p-4 sm:p-5 lg:p-6 ${themeClasses.inputBg} border rounded-xl ${themeClasses.inputFocus} focus:border-transparent resize-none h-32 sm:h-36 lg:h-40 text-base sm:text-lg lg:text-xl transition-all duration-300`}
                  placeholder="What was this transaction for?"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleSubmit}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-6 sm:px-8 lg:px-10 py-4 sm:py-5 lg:py-6 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-green-500/25 hover:scale-105 text-base sm:text-lg lg:text-xl"
              >
                {editingId ? 'Update Transaction' : 'Add Transaction'}
              </button>
              <button
                onClick={resetForm}
                className={`flex-1 ${themeClasses.buttonSecondary} px-6 sm:px-8 lg:px-10 py-4 sm:py-5 lg:py-6 rounded-xl font-semibold transition-all duration-300 border text-base sm:text-lg lg:text-xl`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8 px-2 sm:px-0">
          <div className={`group ${themeClasses.statsCardIncome} rounded-2xl sm:rounded-3xl shadow-xl border p-4 sm:p-6 lg:p-8 hover:scale-105 transition-all duration-300`}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
              </div>
              <div className="text-right">
                <p className={`${isDark ? 'text-green-300' : 'text-green-600'} text-xs sm:text-sm lg:text-base font-semibold uppercase tracking-wide transition-colors duration-300`}>Total Income</p>
                <p className={`text-xl sm:text-2xl lg:text-4xl font-bold ${themeClasses.textPrimary} transition-colors duration-300 mt-1`}>${totalIncome.toLocaleString()}</p>
              </div>
            </div>
            <div className={`h-2 sm:h-2 lg:h-3 ${isDark ? 'bg-green-500/20' : 'bg-green-200'} rounded-full overflow-hidden transition-colors duration-300`}>
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
            </div>
          </div>

          <div className={`group ${themeClasses.statsCardExpense} rounded-2xl sm:rounded-3xl shadow-xl border p-4 sm:p-6 lg:p-8 hover:scale-105 transition-all duration-300`}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                <TrendingDown className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
              </div>
              <div className="text-right">
                <p className={`${isDark ? 'text-red-300' : 'text-red-600'} text-xs sm:text-sm lg:text-base font-semibold uppercase tracking-wide transition-colors duration-300`}>Total Expenses</p>
                <p className={`text-xl sm:text-2xl lg:text-4xl font-bold ${themeClasses.textPrimary} transition-colors duration-300 mt-1`}>${totalExpenses.toLocaleString()}</p>
              </div>
            </div>
            <div className={`h-2 sm:h-2 lg:h-3 ${isDark ? 'bg-red-500/20' : 'bg-red-200'} rounded-full overflow-hidden transition-colors duration-300`}>
              <div className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full"></div>
            </div>
          </div>

          <div className={`group ${themeClasses.statsCardBalance(balance)} rounded-2xl sm:rounded-3xl shadow-xl border p-4 sm:p-6 lg:p-8 hover:scale-105 transition-all duration-300 sm:col-span-2 lg:col-span-1`}>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg ${
                balance >= 0 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                  : 'bg-gradient-to-r from-orange-500 to-red-600'
              }`}>
                <Wallet className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
              </div>
              <div className="text-right">
                <p className={`text-xs sm:text-sm lg:text-base font-semibold uppercase tracking-wide transition-colors duration-300 ${
                  isDark 
                    ? (balance >= 0 ? 'text-blue-300' : 'text-orange-300')
                    : (balance >= 0 ? 'text-blue-600' : 'text-orange-600')
                }`}>Net Balance</p>
                <p className={`text-xl sm:text-2xl lg:text-4xl font-bold transition-colors duration-300 mt-1 ${
                  balance >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                  {balance >= 0 ? '+' : ''}${balance.toLocaleString()}
                </p>
              </div>
            </div>
            <div className={`h-2 sm:h-2 lg:h-3 rounded-full overflow-hidden transition-colors duration-300 ${
              isDark 
                ? (balance >= 0 ? 'bg-blue-500/20' : 'bg-orange-500/20')
                : (balance >= 0 ? 'bg-blue-200' : 'bg-orange-200')
            }`}>
              <div className={`h-full rounded-full ${
                balance >= 0 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500' 
                  : 'bg-gradient-to-r from-orange-500 to-red-500'
              }`}></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 px-2 sm:px-0">
          <div className={`xl:col-span-2 ${themeClasses.cardBg} rounded-2xl sm:rounded-3xl shadow-2xl border p-4 sm:p-6 lg:p-8 transition-all duration-300`}>
            <div className="mb-4 sm:mb-6">
              <div className="relative">
                <Search className={`absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 ${themeClasses.textMuted} w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-300`} />
                <input
                  type="text"
                  placeholder="Search your transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.target.blur();
                    }
                  }}
                  className={`w-full pl-10 sm:pl-12 pr-10 sm:pr-12 py-3 sm:py-4 ${themeClasses.inputBg} border rounded-xl sm:rounded-2xl ${themeClasses.inputFocus} focus:border-transparent text-base sm:text-lg transition-all duration-300`}
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className={`absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 ${themeClasses.textMuted} hover:${themeClasses.textPrimary} transition-colors duration-300 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full hover:bg-white/10 text-sm sm:text-base`}
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
              {searchTerm && (
                <p className={`${themeClasses.textMuted} text-xs sm:text-sm mt-2 transition-colors duration-300`}>
                  Showing results for "{searchTerm}" • {filteredTransactions.length} found
                </p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-3 sm:gap-0">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <h2 className={`text-lg sm:text-xl lg:text-2xl font-bold ${themeClasses.textPrimary} transition-colors duration-300`}>Recent Activity</h2>
              </div>
              
              <div className="flex gap-1 sm:gap-2 w-full sm:w-auto">
                {['all', 'income', 'expense'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`flex-1 sm:flex-none px-2 sm:px-4 py-1 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold capitalize transition-all duration-200 ${
                      filterType === type
                        ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg'
                        : `${themeClasses.buttonSecondary}`
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
              {recentTransactions.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <div className={`w-16 h-16 sm:w-20 sm:h-20 ${isDark ? 'bg-white/10' : 'bg-slate-100'} rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-colors duration-300`}>
                    <Activity className={`w-8 h-8 sm:w-10 sm:h-10 ${themeClasses.textMuted} transition-colors duration-300`} />
                  </div>
                  <p className={`${themeClasses.textMuted} text-base sm:text-lg mb-2 transition-colors duration-300`}>No transactions found</p>
                  <p className={`${themeClasses.textMuted} text-sm transition-colors duration-300`}>Add a transaction to get started</p>
                </div>
              ) : (
                recentTransactions.map((transaction) => {
                  const categoryDetails = getCategoryDetails(transaction.category, transaction.type);
                  return (
                    <div key={transaction.id} className={`group ${themeClasses.cardBgAlt} rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:${isDark ? 'bg-white/10' : 'bg-slate-100'} transition-all duration-300 border`}>
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center bg-gradient-to-r ${categoryDetails.color} shadow-lg flex-shrink-0`}>
                          <span className="text-lg sm:text-xl">{categoryDetails.icon}</span>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
                            <h3 className={`${themeClasses.textPrimary} font-semibold truncate transition-colors duration-300 text-sm sm:text-base`}>{transaction.description}</h3>
                            <span className={`px-2 py-1 rounded-full text-xs font-semibold self-start sm:self-auto ${
                              transaction.type === 'income' 
                                ? 'bg-green-500/20 text-green-400' 
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {transaction.type}
                            </span>
                          </div>
                          <p className={`${themeClasses.textMuted} text-xs sm:text-sm transition-colors duration-300`}>{transaction.category} • {transaction.date}</p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3 flex-shrink-0">
                          <span className={`text-lg sm:text-xl lg:text-2xl font-bold ${
                            transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                          </span>
                          
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(transaction)}
                              className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 rounded-lg flex items-center justify-center transition-colors"
                            >
                              <Edit3 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(transaction.id)}
                              className="w-7 h-7 sm:w-8 sm:h-8 bg-red-500/20 hover:bg-red-500/40 text-red-400 rounded-lg flex items-center justify-center transition-colors"
                            >
                              <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className={`${themeClasses.cardBg} rounded-2xl sm:rounded-3xl shadow-2xl border p-4 sm:p-6 lg:p-8 transition-all duration-300`}>
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-pink-500 to-rose-600 rounded-lg sm:rounded-xl flex items-center justify-center">
                <PieChart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </div>
              <h2 className={`text-lg sm:text-xl lg:text-2xl font-bold ${themeClasses.textPrimary} transition-colors duration-300`}>Expense Categories</h2>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {Object.keys(expensesByCategory).length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 ${isDark ? 'bg-white/10' : 'bg-slate-100'} rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 transition-colors duration-300`}>
                    <PieChart className={`w-6 h-6 sm:w-8 sm:h-8 ${themeClasses.textMuted} transition-colors duration-300`} />
                  </div>
                  <p className={`${themeClasses.textMuted} mb-2 transition-colors duration-300 text-sm sm:text-base`}>No expense data</p>
                  <p className={`${themeClasses.textMuted} text-xs sm:text-sm transition-colors duration-300`}>Add expense transactions to see breakdown</p>
                </div>
              ) : (
                Object.entries(expensesByCategory)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([category, amount]) => {
                    const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                    const categoryDetails = getCategoryDetails(category, 'expense');
                    
                    return (
                      <div key={category} className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-r ${categoryDetails.color} flex items-center justify-center shadow-sm flex-shrink-0`}>
                              <span className="text-xs sm:text-sm">{categoryDetails.icon}</span>
                            </div>
                            <span className={`${themeClasses.textPrimary} font-medium transition-colors duration-300 text-sm sm:text-base truncate`}>{category}</span>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className={`${themeClasses.textPrimary} font-semibold transition-colors duration-300 text-sm sm:text-base`}>${amount.toLocaleString()}</p>
                            <p className={`${themeClasses.textMuted} text-xs sm:text-sm transition-colors duration-300`}>{percentage.toFixed(1)}%</p>
                          </div>
                        </div>
                        <div className={`w-full ${isDark ? 'bg-white/10' : 'bg-slate-200'} rounded-full h-2 sm:h-3 overflow-hidden transition-colors duration-300`}>
                          <div 
                            className={`h-full bg-gradient-to-r ${categoryDetails.color} rounded-full transition-all duration-1000 ease-out shadow-sm`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <FinanceTracker />
    </ThemeProvider>
  );
};

export default App;