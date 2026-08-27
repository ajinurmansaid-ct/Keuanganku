import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Trash2,
  Edit2,
  Copy,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Smartphone,
  Banknote,
  Landmark,
  Calendar,
  Layers,
  Utensils,
  Car,
  Zap,
  ShoppingBag,
  Film,
  HeartPulse,
  GraduationCap,
  Home,
  ShieldCheck,
  MoreHorizontal,
  Wallet,
  Briefcase,
  TrendingUp,
  Gift,
  PlusCircle
} from 'lucide-react';
import {
  formatRupiah,
  formatDateIndonesian,
  getMonthYearKey
} from '../utils/formatters';
import { Transaction, TransactionType, UserProfile, ActiveViewMode, UserProfileId } from '../types';
import { ALL_CATEGORIES } from '../data/categories';

interface TransactionListProps {
  transactions: Transaction[];
  selectedMonth: string;
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  onDuplicate: (tx: Transaction) => void;
  onOpenAddModal: () => void;
  onOpenResetModal?: () => void;
  profiles?: UserProfile[];
  activeViewMode?: ActiveViewMode;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  selectedMonth,
  onEdit,
  onDelete,
  onDuplicate,
  onOpenAddModal,
  onOpenResetModal,
  profiles = [],
  activeViewMode = 'user_1',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userFilter, setUserFilter] = useState<'all' | UserProfileId>('all');

  const p1 = profiles.find((p) => p.id === 'user_1') || profiles[0];
  const p2 = profiles.find((p) => p.id === 'user_2') || profiles[1];

  // Helper icon map
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Utensils': return <Utensils className="w-4 h-4" />;
      case 'Car': return <Car className="w-4 h-4" />;
      case 'Zap': return <Zap className="w-4 h-4" />;
      case 'ShoppingBag': return <ShoppingBag className="w-4 h-4" />;
      case 'Film': return <Film className="w-4 h-4" />;
      case 'HeartPulse': return <HeartPulse className="w-4 h-4" />;
      case 'GraduationCap': return <GraduationCap className="w-4 h-4" />;
      case 'Home': return <Home className="w-4 h-4" />;
      case 'ShieldCheck': return <ShieldCheck className="w-4 h-4" />;
      case 'Wallet': return <Wallet className="w-4 h-4" />;
      case 'Briefcase': return <Briefcase className="w-4 h-4" />;
      case 'TrendingUp': return <TrendingUp className="w-4 h-4" />;
      case 'Gift': return <Gift className="w-4 h-4" />;
      default: return <MoreHorizontal className="w-4 h-4" />;
    }
  };

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case 'bank': return <Landmark className="w-3 h-3" />;
      case 'e-wallet': return <Smartphone className="w-3 h-3" />;
      case 'credit_card': return <CreditCard className="w-3 h-3" />;
      default: return <Banknote className="w-3 h-3" />;
    }
  };

  // Filter transactions for selected month and user search/type criteria
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Month match
      if (selectedMonth && getMonthYearKey(tx.date) !== selectedMonth) {
        return false;
      }

      // User / Profile match
      if (userFilter !== 'all') {
        const txProfile = tx.profileId || 'user_1';
        if (txProfile !== userFilter) {
          return false;
        }
      }

      // Type match
      if (filterType !== 'all' && tx.type !== filterType) {
        return false;
      }

      // Category match
      if (selectedCategory !== 'all' && tx.categoryId !== selectedCategory) {
        return false;
      }

      // Search match
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const titleMatch = tx.title.toLowerCase().includes(query);
        const notesMatch = tx.notes ? tx.notes.toLowerCase().includes(query) : false;
        if (!titleMatch && !notesMatch) return false;
      }

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedMonth, userFilter, filterType, selectedCategory, searchTerm]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 md:p-6">
      {/* Title & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Daftar Transaksi ({filteredTransactions.length})
          </h2>
          <p className="text-xs text-slate-500">
            Riwayat lengkap pengeluaran dan pemasukan untuk bulan ini
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari transaksi..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-5 pb-4 border-b border-slate-100 text-xs">
        {/* Type & User Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-md transition font-medium cursor-pointer ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1 rounded-md transition font-medium cursor-pointer ${
                filterType === 'expense'
                  ? 'bg-rose-600 text-white shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pengeluaran
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1 rounded-md transition font-medium cursor-pointer ${
                filterType === 'income'
                  ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pemasukan
            </button>
          </div>

          {/* User Profile Filter (Visible in Combined view or when both have transactions) */}
          {activeViewMode === 'combined' && (
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setUserFilter('all')}
                className={`px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                  userFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Kedua Orang
              </button>
              <button
                onClick={() => setUserFilter('user_1')}
                className={`px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                  userFilter === 'user_1'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p1?.name || 'Orang 1'}
              </button>
              <button
                onClick={() => setUserFilter('user_2')}
                className={`px-2.5 py-1 rounded-md transition font-medium cursor-pointer ${
                  userFilter === 'user_2'
                    ? 'bg-violet-50 text-violet-800 border border-violet-300 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {p2?.name || 'Orang 2'}
              </button>
            </div>
          )}
        </div>

        {/* Category Select Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 hidden sm:inline">Kategori:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-700 focus:outline-hidden cursor-pointer"
          >
            <option value="all">Semua Kategori</option>
            {ALL_CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Transaction Items */}
      {filteredTransactions.length === 0 ? (
        <div className="py-12 text-center text-slate-400 space-y-3">
          <Layers className="w-10 h-10 mx-auto text-slate-300 stroke-1" />
          <p className="text-sm font-medium">Tidak ada transaksi yang sesuai filter pada periode ini.</p>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              onClick={onOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition shadow-2xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              + Catat Transaksi Baru
            </button>
            {onOpenResetModal && (
              <button
                onClick={onOpenResetModal}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-lg hover:bg-slate-200 transition"
              >
                Muat Data Contoh / Reset
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredTransactions.map((tx) => {
            const cat = ALL_CATEGORIES.find((c) => c.id === tx.categoryId);
            const isExpense = tx.type === 'expense';
            const isUser2 = tx.profileId === 'user_2';
            const ownerName = isUser2 ? (p2?.name || 'Orang 2') : (p1?.name || 'Orang 1');

            return (
              <div
                key={tx.id}
                className="group flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/80 transition gap-3"
              >
                {/* Left: Icon & Info */}
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white shadow-2xs mt-0.5`}
                    style={{ backgroundColor: cat?.color || '#6B7280' }}
                  >
                    {getCategoryIcon(cat?.icon || '')}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">
                        {tx.title}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                        {cat?.name || 'Lainnya'}
                      </span>
                      {/* Owner badge */}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          isUser2
                            ? 'bg-violet-50 text-violet-700 border-violet-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {ownerName}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1">
                      <span className="flex items-center gap-1 text-slate-500 font-medium">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formatDateIndonesian(tx.date)}
                      </span>

                      <span className="flex items-center gap-1 uppercase tracking-wider text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm">
                        {getPaymentIcon(tx.paymentMethod)}
                        {tx.paymentMethod.replace('_', ' ')}
                      </span>

                      {tx.notes && (
                        <span className="text-slate-400 italic truncate max-w-xs">
                          "{tx.notes}"
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                  <div className="text-left sm:text-right">
                    <span
                      className={`text-sm font-bold block ${
                        isExpense ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {isExpense ? '- ' : '+ '}
                      {formatRupiah(tx.amount)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1 opacity-90 sm:opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => onDuplicate(tx)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition"
                      title="Duplikasi"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEdit(tx)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(tx.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Hapus"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
