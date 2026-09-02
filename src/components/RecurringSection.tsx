import React, { useState } from 'react';
import {
  Repeat,
  Plus,
  Check,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  Calendar,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Zap,
  Tag,
  DollarSign,
  CheckCheck,
  Sparkles,
  ArrowUpRight,
  Lock,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { RecurringBill, Transaction, PaymentMethod, UserProfile, ActiveViewMode } from '../types';
import { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../data/categories';
import {
  formatRupiah,
  getMonthNameIndonesian,
  getTodayDateString,
  getCurrentMonthKey
} from '../utils/formatters';

interface RecurringSectionProps {
  recurringBills: RecurringBill[];
  selectedMonth: string;
  transactions?: Transaction[];
  onOpenAddModal: () => void;
  onOpenEditModal: (bill: RecurringBill) => void;
  onDeleteBill: (id: string) => void;
  onPayBill: (bill: RecurringBill, dateStr?: string) => void;
  onUnpayBill: (bill: RecurringBill) => void;
  onPayAllPending: () => void;
  onToggleActive: (id: string, active: boolean) => void;
  profiles?: UserProfile[];
  activeViewMode?: ActiveViewMode;
}

export const RecurringSection: React.FC<RecurringSectionProps> = ({
  recurringBills,
  selectedMonth,
  transactions = [],
  onOpenAddModal,
  onOpenEditModal,
  onDeleteBill,
  onPayBill,
  onUnpayBill,
  onPayAllPending,
  onToggleActive,
  profiles = [],
  activeViewMode = 'user_1',
}) => {
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'paid'>('all');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [billToDelete, setBillToDelete] = useState<RecurringBill | null>(null);
  const [billToUnpayConfirm, setBillToUnpayConfirm] = useState<RecurringBill | null>(null);
  const [showBatchConfirm, setShowBatchConfirm] = useState(false);

  const profile1 = profiles.find((p) => p.id === 'user_1');
  const profile2 = profiles.find((p) => p.id === 'user_2');

  // Robust check: Determine if a recurring bill is paid for selectedMonth
  // by checking BOTH recorded paidMonths array AND matching transactions
  const checkIsBillPaid = (bill: RecurringBill): boolean => {
    if (bill.paidMonths && bill.paidMonths.includes(selectedMonth)) {
      return true;
    }
    if (transactions && transactions.length > 0) {
      const hasTx = transactions.some((t) => {
        const isSameMonth = t.date.startsWith(selectedMonth);
        const isExpense = t.type === 'expense';
        const isSameProfile = (t.profileId || 'user_1') === (bill.profileId || 'user_1');
        const isTitleMatch =
          t.title.toLowerCase().trim() === bill.title.toLowerCase().trim() ||
          (t.notes && t.notes.toLowerCase().includes(bill.title.toLowerCase()));
        const isAmountMatch = Math.abs(t.amount - bill.amount) < 1;
        return isSameMonth && isExpense && isSameProfile && (isTitleMatch || (isAmountMatch && t.categoryId === bill.categoryId));
      });
      if (hasTx) return true;
    }
    return false;
  };

  const activeBills = recurringBills.filter((b) => b.isActive);

  // Statistics for selected month
  const totalMonthlyCommitment = activeBills.reduce((sum, b) => sum + b.amount, 0);

  const paidBills = activeBills.filter((b) => checkIsBillPaid(b));
  const unpaidBills = activeBills.filter((b) => !checkIsBillPaid(b));

  const totalPaidAmount = paidBills.reduce((sum, b) => sum + b.amount, 0);
  const totalUnpaidAmount = unpaidBills.reduce((sum, b) => sum + b.amount, 0);

  const percentPaid =
    totalMonthlyCommitment > 0
      ? Math.min(100, Math.round((totalPaidAmount / totalMonthlyCommitment) * 100))
      : 0;

  // Filter items
  const displayedBills = recurringBills.filter((bill) => {
    if (filter === 'all') return true;
    const isPaid = checkIsBillPaid(bill);
    if (filter === 'paid') return isPaid;
    if (filter === 'unpaid') return !isPaid && bill.isActive;
    return true;
  });

  // Today's date calculations
  const todayStr = getTodayDateString();
  const currentMonthKey = getCurrentMonthKey();
  const todayDay = new Date().getDate();

  const getDueStatus = (bill: RecurringBill) => {
    const isPaid = checkIsBillPaid(bill);
    if (isPaid) {
      return {
        label: 'Sudah Lunas (Terkunci)',
        color: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold',
        badgeColor: 'bg-emerald-500',
        isOverdue: false,
        isToday: false,
      };
    }

    if (selectedMonth === currentMonthKey) {
      if (todayDay === bill.dueDay) {
        return {
          label: 'Jatuh Tempo Hari Ini!',
          color: 'bg-amber-100 text-amber-900 border-amber-300 font-bold animate-pulse',
          badgeColor: 'bg-amber-500',
          isOverdue: false,
          isToday: true,
        };
      }
      if (todayDay > bill.dueDay) {
        const daysAgo = todayDay - bill.dueDay;
        return {
          label: `Lewat ${daysAgo} hari (Tgl ${bill.dueDay})`,
          color: 'bg-rose-50 text-rose-700 border-rose-200',
          badgeColor: 'bg-rose-500',
          isOverdue: true,
          isToday: false,
        };
      }
      const daysLeft = bill.dueDay - todayDay;
      return {
        label: `Tgl ${bill.dueDay} (${daysLeft} hari lagi)`,
        color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        badgeColor: 'bg-indigo-500',
        isOverdue: false,
        isToday: false,
      };
    }

    // Different month
    return {
      label: `Jatuh Tempo: Tgl ${bill.dueDay}`,
      color: 'bg-slate-100 text-slate-700 border-slate-200',
      badgeColor: 'bg-slate-400',
      isOverdue: false,
      isToday: false,
    };
  };

  const getCategoryDetails = (catId: string) => {
    return (
      EXPENSE_CATEGORIES.find((c) => c.id === catId) || {
        name: 'Pengeluaran',
        bgColor: 'bg-slate-100 text-slate-800 border-slate-200',
      }
    );
  };

  const getPaymentMethodLabel = (pm: PaymentMethod) => {
    const found = PAYMENT_METHODS.find((p) => p.id === pm);
    return found ? found.label.split(' ')[0] : 'Bank';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden transition">
      {/* Section Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-indigo-50/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
              <Repeat className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Pengeluaran Rutin & Tagihan Bulanan
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
                  {getMonthNameIndonesian(selectedMonth).split(' ')[0]}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola tagihan wajib (BPJS, kuota data, uang kas, listrik, langganan) dan catat dalam 1 klik.
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            {unpaidBills.length > 0 && (
              <button
                type="button"
                onClick={() => setShowBatchConfirm(true)}
                className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                title="Catat seluruh tagihan yang belum lunas ke daftar transaksi bulan ini"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Bayar Semua ({unpaidBills.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenAddModal}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tagihan</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              title={isCollapsed ? 'Tampilkan rincian' : 'Sembunyikan'}
            >
              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Overview Stats Cards */}
        {!isCollapsed && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
            {/* Total Wajib */}
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-100">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Tagihan Wajib
              </span>
              <div className="text-base font-bold text-slate-900 mt-0.5">
                {formatRupiah(totalMonthlyCommitment)}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {activeBills.length} pos tagihan aktif
              </p>
            </div>

            {/* Sudah Terbayar */}
            <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                  Sudah Terbayar
                </span>
                <span className="text-xs font-bold text-emerald-700">{percentPaid}%</span>
              </div>
              <div className="text-base font-bold text-emerald-800 mt-0.5">
                {formatRupiah(totalPaidAmount)}
              </div>
              <p className="text-[11px] text-emerald-700 mt-1">
                {paidBills.length} dari {activeBills.length} tagihan lunas
              </p>
            </div>

            {/* Sisa Belum Bayar */}
            <div
              className={`p-3.5 rounded-xl border ${
                unpaidBills.length > 0
                  ? 'bg-rose-50/60 border-rose-100'
                  : 'bg-slate-50/80 border-slate-100'
              }`}
            >
              <span
                className={`text-[11px] font-semibold uppercase tracking-wider block ${
                  unpaidBills.length > 0 ? 'text-rose-800' : 'text-slate-500'
                }`}
              >
                Sisa Belum Dibayar
              </span>
              <div
                className={`text-base font-bold mt-0.5 ${
                  unpaidBills.length > 0 ? 'text-rose-700' : 'text-slate-900'
                }`}
              >
                {formatRupiah(totalUnpaidAmount)}
              </div>
              <p
                className={`text-[11px] mt-1 ${
                  unpaidBills.length > 0 ? 'text-rose-600 font-medium' : 'text-slate-500'
                }`}
              >
                {unpaidBills.length === 0
                  ? '✓ Semua tagihan bulan ini telah lunas!'
                  : `${unpaidBills.length} tagihan menunggu pembayaran`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Main List */}
      {!isCollapsed && (
        <div className="p-5 sm:p-6 space-y-4">
          {/* Filter Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-1.5 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  filter === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({recurringBills.length})
              </button>
              <button
                type="button"
                onClick={() => setFilter('unpaid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                  filter === 'unpaid'
                    ? 'bg-white text-rose-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Belum Bayar</span>
                {unpaidBills.length > 0 && (
                  <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                    {unpaidBills.length}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setFilter('paid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                  filter === 'paid'
                    ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Sudah Lunas</span>
                <span className="text-[10px] text-slate-400">({paidBills.length})</span>
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Menampilkan {displayedBills.length} pos tagihan
            </p>
          </div>

          {/* List Cards */}
          {displayedBills.length === 0 ? (
            <div className="text-center py-8 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <Repeat className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">
                {filter === 'unpaid'
                  ? 'Semua tagihan untuk bulan ini sudah lunas!'
                  : filter === 'paid'
                  ? 'Belum ada tagihan yang dicatat lunas bulan ini.'
                  : 'Belum ada pengeluaran rutin yang ditambahkan.'}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Tambahkan pengeluaran wajib bulanan seperti BPJS, kuota internet, kas warga, dan lainnya agar tidak terlewat.
              </p>
              {filter === 'all' && (
                <button
                  type="button"
                  onClick={onOpenAddModal}
                  className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Tagihan Pertama
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {displayedBills.map((bill) => {
                const isPaid = bill.paidMonths?.includes(selectedMonth);
                const dueStatus = getDueStatus(bill);
                const cat = getCategoryDetails(bill.categoryId);

                return (
                  <div
                    key={bill.id}
                    className={`p-4 rounded-2xl border transition relative flex flex-col justify-between ${
                      !bill.isActive
                        ? 'bg-slate-50/60 border-slate-200 opacity-60'
                        : isPaid
                        ? 'bg-emerald-50/30 border-emerald-200/80 hover:border-emerald-300'
                        : dueStatus.isOverdue
                        ? 'bg-rose-50/20 border-rose-200 hover:border-rose-300'
                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-2xs'
                    }`}
                  >
                    {/* Upper row: Title, Amount, Actions */}
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                              isPaid
                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                            }`}
                          >
                            {isPaid ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <Repeat className="w-4 h-4" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-sm font-bold text-slate-900 truncate">
                                {bill.title}
                              </h4>
                              {activeViewMode === 'combined' && (
                                <span
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                                    (bill.profileId || 'user_1') === 'user_1'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                      : 'bg-violet-50 text-violet-700 border-violet-200'
                                  }`}
                                >
                                  {(bill.profileId || 'user_1') === 'user_1'
                                    ? profile1?.name || 'Orang 1'
                                    : profile2?.name || 'Orang 2'}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-slate-500 mt-0.5">
                              <span className="font-medium text-slate-700">
                                {cat.name}
                              </span>
                              <span>•</span>
                              <span>{getPaymentMethodLabel(bill.paymentMethod)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Top Actions: Edit / Delete */}
                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => onOpenEditModal(bill)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition cursor-pointer"
                            title="Edit tagihan"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setBillToDelete(bill)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Hapus tagihan"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Notes if any */}
                      {bill.notes && (
                        <p className="text-[11px] text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100 truncate">
                          {bill.notes}
                        </p>
                      )}
                    </div>

                    {/* Bottom row: Amount & Status / 1-Click Pay Button */}
                    <div className="mt-3.5 pt-3 border-t border-slate-100/80 flex items-center justify-between gap-2">
                      <div>
                        <div className="text-base font-extrabold text-slate-900">
                          {formatRupiah(bill.amount)}
                          <span className="text-[10px] font-normal text-slate-400 ml-1">/bln</span>
                        </div>
                        {/* Due status badge */}
                        <div className="mt-1">
                          <span
                            className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${dueStatus.color}`}
                          >
                            <Calendar className="w-3 h-3" />
                            {dueStatus.label}
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div>
                        {isPaid ? (
                          <div className="flex items-center gap-1.5">
                            <span className="px-2.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1.5 border border-emerald-200/80 shadow-2xs">
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Lunas & Terkunci</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setBillToUnpayConfirm(bill)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg text-[11px] transition cursor-pointer flex items-center gap-1"
                              title="Buka kunci dan batalkan status lunas untuk bulan ini"
                            >
                              <Lock className="w-3 h-3 text-slate-400" />
                              <span>Ubah</span>
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => onPayBill(bill)}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Catat Bayar</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Security Confirmation Modal for Unpaying/Unlocking Paid Bill */}
      {billToUnpayConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900">Buka Kunci Status Tagihan?</h3>
                <p className="text-xs text-slate-500 truncate">{billToUnpayConfirm.title}</p>
              </div>
            </div>

            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
              <p className="font-semibold flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                Data pembayaran ini terkunci aman.
              </p>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Apakah Anda yakin ingin membatalkan status Lunas untuk periode <strong>{getMonthNameIndonesian(selectedMonth)}</strong> dan mengembalikannya menjadi belum bayar?
              </p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setBillToUnpayConfirm(null)}
                className="px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Batal (Tetap Lunas)
              </button>
              <button
                type="button"
                onClick={() => {
                  onUnpayBill(billToUnpayConfirm);
                  setBillToUnpayConfirm(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-xs cursor-pointer"
              >
                Ya, Ubah Jadi Belum Bayar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation In-App Modal */}
      {billToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900">Hapus Pengeluaran Rutin?</h3>
                <p className="text-xs text-slate-500 truncate">{billToDelete.title}</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>Nominal rutin:</span>
                <strong className="text-slate-900">{formatRupiah(billToDelete.amount)}</strong>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Jatuh tempo:</span>
                <strong className="text-slate-900">Tiap tanggal {billToDelete.dueDay}</strong>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Tagihan ini tidak akan muncul lagi di daftar pengeluaran rutin bulanan. Transaksi terdahulu yang sudah tercatat tidak akan terhapus.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setBillToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteBill(billToDelete.id);
                  setBillToDelete(null);
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Tagihan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Pay Confirmation Modal */}
      {showBatchConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 p-6 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <CheckCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Bayar Semua Tagihan Bulan Ini?
                </h3>
                <p className="text-xs text-slate-500">
                  Bulan: {getMonthNameIndonesian(selectedMonth)}
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5 max-h-48 overflow-y-auto">
              {unpaidBills.map((b) => (
                <div key={b.id} className="flex justify-between items-center text-slate-700 py-0.5">
                  <span className="font-medium truncate mr-2">{b.title}</span>
                  <span className="font-bold shrink-0">{formatRupiah(b.amount)}</span>
                </div>
              ))}
              <div className="border-t border-slate-200 pt-1.5 mt-1 flex justify-between font-extrabold text-slate-900">
                <span>Total ({unpaidBills.length} Tagihan):</span>
                <span className="text-indigo-600">{formatRupiah(totalUnpaidAmount)}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500">
              Sistem akan otomatis mencatat {unpaidBills.length} transaksi pengeluaran baru pada bulan {getMonthNameIndonesian(selectedMonth)} dan menandainya lunas.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowBatchConfirm(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onPayAllPending();
                  setShowBatchConfirm(false);
                }}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 transition shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Bayar & Catat Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
