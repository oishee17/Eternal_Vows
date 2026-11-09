import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  PieChart,
  X,
  CreditCard,
  Edit2,
  Check,
} from 'lucide-react';
import { BudgetCategory, ExpenseItem } from '../../types/wedding';

interface BudgetTrackerProps {
  categories: BudgetCategory[];
  expenses: ExpenseItem[];
  totalBudget: number;
  onUpdateTotalBudget: (newBudget: number) => void;
  onUpdateCategoryAllocation: (categoryId: string, amount: number) => void;
  onAddExpense: (expense: Omit<ExpenseItem, 'id' | 'createdAt'>) => void;
  onToggleExpensePaid: (expenseId: string) => void;
  onDeleteExpense: (expenseId: string) => void;
  onAskAIAboutBudget: (prompt: string) => void;
}

export const BudgetTracker: React.FC<BudgetTrackerProps> = ({
  categories,
  expenses,
  totalBudget,
  onUpdateTotalBudget,
  onUpdateCategoryAllocation,
  onAddExpense,
  onToggleExpensePaid,
  onDeleteExpense,
  onAskAIAboutBudget,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(false);
  const [tempBudget, setTempBudget] = useState(totalBudget.toString());
  const [filterCategory, setFilterCategory] = useState<string>('All');

  // Form State
  const [formCategory, setFormCategory] = useState(categories[0]?.id || '');
  const [formTitle, setFormTitle] = useState('');
  const [formVendor, setFormVendor] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formIsPaid, setFormIsPaid] = useState(false);
  const [formDueDate, setFormDueDate] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Calculations
  const totalCommitted = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalPaid = expenses.filter((e) => e.isPaid).reduce((sum, e) => sum + e.amount, 0);
  const totalPendingPayment = totalCommitted - totalPaid;
  const remainingBudget = totalBudget - totalCommitted;

  // Category-wise totals
  const categoryStats = categories.map((cat) => {
    const catExpenses = expenses.filter((e) => e.categoryId === cat.id);
    const spent = catExpenses.reduce((sum, e) => sum + e.amount, 0);
    const isOver = spent > cat.allocatedAmount;
    const percent = cat.allocatedAmount > 0 ? Math.round((spent / cat.allocatedAmount) * 100) : 0;
    return {
      ...cat,
      spent,
      isOver,
      percent,
      variance: cat.allocatedAmount - spent,
    };
  });

  const overBudgetCategories = categoryStats.filter((c) => c.isOver);

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formAmount) return;

    const selectedCat = categories.find((c) => c.id === formCategory) || categories[0];

    onAddExpense({
      categoryId: selectedCat.id,
      categoryName: selectedCat.name,
      title: formTitle.trim(),
      vendorName: formVendor.trim() || undefined,
      amount: parseFloat(formAmount) || 0,
      isPaid: formIsPaid,
      dueDate: formDueDate || undefined,
      notes: formNotes.trim() || undefined,
    });

    setFormTitle('');
    setFormVendor('');
    setFormAmount('');
    setFormIsPaid(false);
    setFormDueDate('');
    setFormNotes('');
    setShowAddModal(false);
  };

  const handleSaveTotalBudget = () => {
    const val = parseFloat(tempBudget);
    if (!isNaN(val) && val > 0) {
      onUpdateTotalBudget(val);
      setEditingBudget(false);
    }
  };

  const filteredExpenses = expenses.filter(
    (e) => filterCategory === 'All' || e.categoryId === filterCategory
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* 1. HEADER & OVERVIEW TILES */}
      <div className="bg-white rounded-3xl border border-[#E5DAD1] p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#F0EAE3] gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs text-[#5A1E2D] font-medium bg-[#FAF1EE] px-2.5 py-1 rounded-full mb-2">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Intelligent Wedding Budget Engine</span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#23211F]">
              Live Financial Ledger & Expense Tracker
            </h2>
            <p className="text-xs text-[#7A6B65] mt-1">
              Real-time expenditure variance, vendor invoice tracking, and smart allocation warnings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onAskAIAboutBudget('Analyze our Lake Como wedding budget allocations and identify any categories at risk of overspend.')}
              className="bg-[#FAF8F5] border border-[#D9C3B0] text-[#5A1E2D] hover:bg-[#F5EFE9] px-4 py-2.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>AI Budget Analysis</span>
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#5A1E2D] hover:bg-[#471522] text-white px-5 py-2.5 rounded-full text-xs font-medium transition flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Budget */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E5DAD1]">
            <div className="flex items-center justify-between text-xs text-[#8C7A72]">
              <span className="uppercase font-semibold tracking-wider">Total Wedding Budget</span>
              {editingBudget ? (
                <button onClick={handleSaveTotalBudget} className="text-[#5A1E2D] hover:underline">
                  <Check className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={() => setEditingBudget(true)} className="text-[#8C7A72] hover:text-[#5A1E2D]">
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {editingBudget ? (
              <div className="mt-2 flex gap-2">
                <input
                  type="number"
                  value={tempBudget}
                  onChange={(e) => setTempBudget(e.target.value)}
                  className="w-full text-xl font-serif bg-white border border-[#5A1E2D] rounded-lg px-2 py-1"
                  autoFocus
                />
              </div>
            ) : (
              <p className="font-serif text-2xl sm:text-3xl text-[#23211F] mt-2 font-normal">
                ${totalBudget.toLocaleString()}
              </p>
            )}
            <span className="text-[11px] text-[#7A6B65] block mt-1">Planned total allocation</span>
          </div>

          {/* Card 2: Committed Spent */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E5DAD1]">
            <span className="text-xs uppercase font-semibold text-[#8C7A72] tracking-wider block">
              Committed Spent
            </span>
            <p className="font-serif text-2xl sm:text-3xl text-[#23211F] mt-2 font-normal">
              ${totalCommitted.toLocaleString()}
            </p>
            <span className="text-[11px] text-[#7A6B65] block mt-1">
              {Math.round((totalCommitted / totalBudget) * 100)}% of total cap committed
            </span>
          </div>

          {/* Card 3: Settled Paid */}
          <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#E5DAD1]">
            <span className="text-xs uppercase font-semibold text-emerald-800 tracking-wider block">
              Settled & Paid
            </span>
            <p className="font-serif text-2xl sm:text-3xl text-emerald-800 mt-2 font-normal">
              ${totalPaid.toLocaleString()}
            </p>
            <span className="text-[11px] text-[#7A6B65] block mt-1">
              ${totalPendingPayment.toLocaleString()} pending balance due
            </span>
          </div>

          {/* Card 4: Remaining Funds */}
          <div className={`p-5 rounded-2xl border ${remainingBudget < 0 ? 'bg-rose-50 border-rose-300' : 'bg-[#FAF8F5] border-[#E5DAD1]'}`}>
            <span className={`text-xs uppercase font-semibold tracking-wider block ${remainingBudget < 0 ? 'text-rose-700' : 'text-[#5A1E2D]'}`}>
              Remaining Funds
            </span>
            <p className={`font-serif text-2xl sm:text-3xl mt-2 font-normal ${remainingBudget < 0 ? 'text-rose-700' : 'text-[#5A1E2D]'}`}>
              ${remainingBudget.toLocaleString()}
            </p>
            <span className="text-[11px] text-[#7A6B65] block mt-1">
              {remainingBudget < 0 ? 'Budget Cap Exceeded!' : 'Available for contingency'}
            </span>
          </div>
        </div>

        {/* Intelligent Overbudget Alerts */}
        {overBudgetCategories.length > 0 && (
          <div className="mt-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900">
              <span className="font-bold block">Smart Budget Alert: Spending Exceeded in {overBudgetCategories.length} Categories</span>
              <p className="mt-0.5">
                {overBudgetCategories.map((c) => `${c.name} is over by $${Math.abs(c.variance).toLocaleString()}`).join('; ')}.
                Consider reallocating surplus funds from lower-utilization categories.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. CATEGORY BREAKDOWN GRIDS */}
      <div className="bg-white rounded-3xl border border-[#E5DAD1] p-6 sm:p-8 shadow-xs">
        <h3 className="font-serif text-2xl text-[#23211F] mb-1">Category Allocation & Progress</h3>
        <p className="text-xs text-[#7A6B65] mb-6">
          Track allocations against actual commitments. Click on a category to filter the expense ledger below.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categoryStats.map((cat) => (
            <div
              key={cat.id}
              onClick={() => setFilterCategory(filterCategory === cat.id ? 'All' : cat.id)}
              className={`p-4 rounded-2xl border transition cursor-pointer ${
                filterCategory === cat.id
                  ? 'border-[#5A1E2D] bg-[#FAF1EE]'
                  : 'border-[#E5DAD1] bg-[#FAF8F5] hover:border-[#C5A880]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#23211F] truncate">{cat.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  cat.isOver ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {cat.percent}%
                </span>
              </div>

              <div className="mt-3 flex justify-between text-xs text-[#7A6B65]">
                <span>Spent: <strong className="text-[#23211F]">${cat.spent.toLocaleString()}</strong></span>
                <span>Cap: ${cat.allocatedAmount.toLocaleString()}</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-[#EFE8DF] rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    cat.isOver ? 'bg-rose-600' : 'bg-[#5A1E2D]'
                  }`}
                  style={{ width: `${Math.min(100, cat.percent)}%` }}
                />
              </div>

              <div className="mt-2 text-[10px] text-[#8C7A72] flex justify-between">
                <span>{cat.variance >= 0 ? `$${cat.variance.toLocaleString()} left` : `$${Math.abs(cat.variance).toLocaleString()} over`}</span>
                <span className="underline">View entries</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. DETAILED EXPENSE LEDGER */}
      <div className="bg-white rounded-3xl border border-[#E5DAD1] shadow-xs overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-[#F0EAE3] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif text-2xl text-[#23211F]">Itemized Expense Records</h3>
            <p className="text-xs text-[#7A6B65]">
              Showing {filteredExpenses.length} entries {filterCategory !== 'All' ? `for ${categories.find(c => c.id === filterCategory)?.name}` : ''}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {filterCategory !== 'All' && (
              <button
                onClick={() => setFilterCategory('All')}
                className="text-xs text-[#5A1E2D] underline font-medium"
              >
                Clear Category Filter
              </button>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#5A1E2D] hover:bg-[#471522] text-white px-4 py-2 rounded-full text-xs font-medium transition flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" /> Add Record
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#F0EAE3] bg-[#FAF8F5] text-[10px] uppercase tracking-wider font-semibold text-[#8C7A72]">
                <th className="py-4 px-6">Expense Item / Description</th>
                <th className="py-4 px-4">Category</th>
                <th className="py-4 px-4">Vendor / Payee</th>
                <th className="py-4 px-4 text-right">Amount</th>
                <th className="py-4 px-4">Due Date</th>
                <th className="py-4 px-4">Payment Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EAE3]">
              {filteredExpenses.map((expense) => (
                <tr key={expense.id} className="hover:bg-[#FAF8F5]/80 transition">
                  <td className="py-4 px-6 font-medium text-sm text-[#23211F]">
                    {expense.title}
                    {expense.notes && <div className="text-[11px] text-[#8C7A72]">{expense.notes}</div>}
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-[10px] uppercase font-semibold px-2.5 py-0.5 rounded-full bg-[#F4EFEA] text-[#6F5D54] border border-[#E5DAD1]">
                      {expense.categoryName}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-[#4A3B32]">
                    {expense.vendorName || <span className="text-[#8C7A72] italic">Unspecified</span>}
                  </td>
                  <td className="py-4 px-4 text-right font-serif text-base text-[#23211F] font-bold">
                    ${expense.amount.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-[#7A6B65]">
                    {expense.dueDate ? new Date(expense.dueDate).toLocaleDateString() : '—'}
                  </td>
                  <td className="py-4 px-4">
                    <button
                      onClick={() => onToggleExpensePaid(expense.id)}
                      className={`text-xs px-3 py-1 rounded-full font-medium transition ${
                        expense.isPaid
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      {expense.isPaid ? '✓ Paid & Settled' : '⏳ Payment Due'}
                    </button>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => onDeleteExpense(expense.id)}
                      className="p-1.5 text-[#8C7A72] hover:text-rose-700 hover:bg-rose-50 rounded-full transition"
                      title="Delete expense"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MODAL: ADD EXPENSE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-[#D9C3B0] shadow-2xl relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-[#8C7A72] hover:text-[#23211F]"
            >
              <X className="w-5 h-5" />
            </button>

            <span className="text-[11px] uppercase tracking-widest text-[#8C7A72] font-semibold">
              Ledger Entry
            </span>
            <h3 className="font-serif text-2xl text-[#23211F] mt-1 mb-4">
              Record Wedding Expense
            </h3>

            <form onSubmit={handleSaveExpense} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#4A3B32] font-medium mb-1">Item Title / Purpose</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sommelier Wine Pairing Deposit"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden focus:border-[#5A1E2D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">Budget Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">Amount ($ USD)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="4500"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">Vendor / Payee</label>
                  <input
                    type="text"
                    placeholder="e.g. Cucina Lariana"
                    value={formVendor}
                    onChange={(e) => setFormVendor(e.target.value)}
                    className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[#4A3B32] font-medium mb-1">Due Date</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#4A3B32] font-medium mb-1">Notes / Terms</label>
                <input
                  type="text"
                  placeholder="e.g. 50% deposit, remainder due 14 days before ceremony"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full border border-[#D9C3B0] rounded-xl px-3 py-2 bg-white focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="formPaidCheck"
                  checked={formIsPaid}
                  onChange={(e) => setFormIsPaid(e.target.checked)}
                  className="rounded border-[#D9C3B0] text-[#5A1E2D] focus:ring-[#5A1E2D]"
                />
                <label htmlFor="formPaidCheck" className="text-xs font-medium text-[#23211F]">
                  Already settled and paid in full
                </label>
              </div>

              <div className="pt-4 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="border border-[#D9C3B0] bg-white text-[#4A3B32] px-4 py-2 rounded-full font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#5A1E2D] hover:bg-[#471522] text-white px-5 py-2 rounded-full font-medium"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
