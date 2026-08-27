import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Transaction,
  CategoryBudget,
  FinancialSummary,
  SavingsGoal,
  RecurringBill,
  DebtItem,
  PaymentMethod
} from './types';
import { INITIAL_TRANSACTIONS, DEFAULT_BUDGETS } from './data/sampleTransactions';
import { INITIAL_SAVINGS_GOALS } from './data/sampleSavings';
import { INITIAL_RECURRING_BILLS } from './data/sampleRecurringBills';
import { INITIAL_DEBTS } from './data/sampleDebts';
import {
  subscribeToTransactions,
  saveTransactionToFirestore,
  deleteTransactionFromFirestore,
  subscribeToBudgets,
  saveBudgetsToFirestore,
  subscribeToSavingsGoals,
  saveSavingsGoalToFirestore,
  deleteSavingsGoalFromFirestore,
  subscribeToRecurringBills,
  saveRecurringBillToFirestore,
  deleteRecurringBillFromFirestore,
  subscribeToDebts,
  saveDebtToFirestore,
  deleteDebtFromFirestore,
  syncInitialDataToCloudIfEmpty,
  pushFullStateToCloud,
  replaceAllTransactionsInFirestore,
  replaceAllRecurringBillsInFirestore,
} from './lib/firestoreService';
import {
  getCurrentMonthKey,
  getMonthYearKey,
  getUniqueMonths,
  getTodayDateString
} from './utils/formatters';
import { Header } from './components/Header';
import { DashboardSummary } from './components/DashboardSummary';
import { ChartsSection } from './components/ChartsSection';
import { TransactionList } from './components/TransactionList';
import { SavingsSection } from './components/SavingsSection';
import { SavingsGoalModal } from './components/SavingsGoalModal';
import { SavingsDepositModal } from './components/SavingsDepositModal';
import { SavingsHistoryModal } from './components/SavingsHistoryModal';
import { RecurringSection } from './components/RecurringSection';
import { RecurringBillModal } from './components/RecurringBillModal';
import { DebtSection } from './components/DebtSection';
import { DebtModal } from './components/DebtModal';
import { DebtPaymentModal } from './components/DebtPaymentModal';
import { DebtHistoryModal } from './components/DebtHistoryModal';
import { TransactionFormModal } from './components/TransactionFormModal';
import { BudgetManagerModal } from './components/BudgetManagerModal';
import { AIAdviceModal } from './components/AIAdviceModal';
import { ResetDataModal } from './components/ResetDataModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';

const STORAGE_KEY_TX = 'pencatat_keuangan_tx_v1';
const STORAGE_KEY_BUDGETS = 'pencatat_keuangan_budgets_v1';
const STORAGE_KEY_SAVINGS = 'pencatat_keuangan_savings_v1';
const STORAGE_KEY_RECURRING = 'pencatat_keuangan_recurring_v1';
const STORAGE_KEY_DEBTS = 'pencatat_keuangan_debts_v1';

export default function App() {
  const savingsSectionRef = useRef<HTMLDivElement>(null);
  const recurringSectionRef = useRef<HTMLDivElement>(null);
  const debtSectionRef = useRef<HTMLDivElement>(null);

  // Load initial state from LocalStorage or fallback to sample data
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TX);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse transactions from localStorage', e);
    }
    return INITIAL_TRANSACTIONS;
  });

  const [budgets, setBudgets] = useState<CategoryBudget[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_BUDGETS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse budgets from localStorage', e);
    }
    return DEFAULT_BUDGETS;
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SAVINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse savings goals from localStorage', e);
    }
    return INITIAL_SAVINGS_GOALS;
  });

  const [recurringBills, setRecurringBills] = useState<RecurringBill[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECURRING);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse recurring bills from localStorage', e);
    }
    return INITIAL_RECURRING_BILLS;
  });

  const [debts, setDebts] = useState<DebtItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DEBTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse debts from localStorage', e);
    }
    return INITIAL_DEBTS;
  });

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const current = getCurrentMonthKey();
    const available = getUniqueMonths(INITIAL_TRANSACTIONS);
    return available.includes(current) ? current : available[0] || current;
  });

  // Modal Visibility States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Recurring Bills Modal States
  const [isRecurringModalOpen, setIsRecurringModalOpen] = useState(false);
  const [editingRecurringBill, setEditingRecurringBill] = useState<RecurringBill | null>(null);

  // Debts & Deficit Modal States
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<DebtItem | null>(null);
  const [suggestedDeficitForModal, setSuggestedDeficitForModal] = useState<{
    monthKey: string;
    amount: number;
  } | null>(null);
  const [isDebtPaymentModalOpen, setIsDebtPaymentModalOpen] = useState(false);
  const [activeDebtForPayment, setActiveDebtForPayment] = useState<DebtItem | null>(null);
  const [isDebtHistoryModalOpen, setIsDebtHistoryModalOpen] = useState(false);
  const [activeDebtForHistory, setActiveDebtForHistory] = useState<DebtItem | null>(null);

  // Savings Modal States
  const [isSavingsGoalModalOpen, setIsSavingsGoalModalOpen] = useState(false);
  const [editingSavingsGoal, setEditingSavingsGoal] = useState<SavingsGoal | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [activeDepositGoal, setActiveDepositGoal] = useState<SavingsGoal | null>(null);
  const [depositModalType, setDepositModalType] = useState<'deposit' | 'withdraw'>('deposit');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [activeHistoryGoal, setActiveHistoryGoal] = useState<SavingsGoal | null>(null);

  // Real-time Firestore Cloud Synchronization
  useEffect(() => {
    // 1. Initial check: If cloud database is empty, seed current sample data
    syncInitialDataToCloudIfEmpty(
      transactions,
      budgets,
      savingsGoals,
      recurringBills,
      debts
    );

    // 2. Real-time Listeners
    const unsubTx = subscribeToTransactions((cloudTxs) => {
      if (cloudTxs.length > 0) {
        setTransactions(cloudTxs);
      }
    });

    const unsubBudgets = subscribeToBudgets((cloudBudgets) => {
      if (cloudBudgets.length > 0) {
        setBudgets(cloudBudgets);
      }
    });

    const unsubSavings = subscribeToSavingsGoals((cloudGoals) => {
      if (cloudGoals.length > 0) {
        setSavingsGoals(cloudGoals);
      }
    });

    const unsubRecurring = subscribeToRecurringBills((cloudBills) => {
      if (cloudBills.length > 0) {
        setRecurringBills(cloudBills);
      }
    });

    const unsubDebts = subscribeToDebts((cloudDebts) => {
      if (cloudDebts.length > 0) {
        setDebts(cloudDebts);
      }
    });

    return () => {
      unsubTx();
      unsubBudgets();
      unsubSavings();
      unsubRecurring();
      unsubDebts();
    };
  }, []);

  // Sync state to LocalStorage for offline fallback resilience
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TX, JSON.stringify(transactions));
    } catch (e) {
      console.error('Failed to save transactions to localStorage', e);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_BUDGETS, JSON.stringify(budgets));
    } catch (e) {
      console.error('Failed to save budgets to localStorage', e);
    }
  }, [budgets]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SAVINGS, JSON.stringify(savingsGoals));
    } catch (e) {
      console.error('Failed to save savings goals to localStorage', e);
    }
  }, [savingsGoals]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_RECURRING, JSON.stringify(recurringBills));
    } catch (e) {
      console.error('Failed to save recurring bills to localStorage', e);
    }
  }, [recurringBills]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DEBTS, JSON.stringify(debts));
    } catch (e) {
      console.error('Failed to save debts to localStorage', e);
    }
  }, [debts]);

  // Handle PWA shortcut actions from URL query (e.g. /?action=add_tx or /?action=savings)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const action = params.get('action');
      if (action === 'add_tx') {
        setIsAddModalOpen(true);
      } else if (action === 'savings') {
        setTimeout(() => {
          savingsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 350);
      }
    }
  }, []);

  // Compute Summary Metrics for Selected Month
  const summary = useMemo<FinancialSummary>(() => {
    const monthTx = transactions.filter(
      (t) => getMonthYearKey(t.date) === selectedMonth
    );

    const totalIncome = monthTx
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = monthTx
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    let savingsRate = 0;
    if (totalIncome > 0) {
      savingsRate = Math.max(0, Math.round((balance / totalIncome) * 100));
    }

    // Days in selected month
    const [yearStr, monthStr] = selectedMonth.split('-');
    const daysInMonth = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10), 0).getDate();
    const dailyAverageExpense = Math.round(totalExpense / daysInMonth);

    return {
      totalIncome,
      totalExpense,
      balance,
      savingsRate,
      dailyAverageExpense,
      transactionCount: monthTx.length,
    };
  }, [transactions, selectedMonth]);

  // Compute Previous Month's Financial Performance (to detect deficit/minus)
  const previousMonthData = useMemo(() => {
    if (!selectedMonth) return null;
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const prevDate = new Date(year, month - 2, 1);
    const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;

    const prevTx = transactions.filter(
      (t) => getMonthYearKey(t.date) === prevMonthKey
    );
    if (prevTx.length === 0) return null;

    const totalIncome = prevTx
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpense = prevTx
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpense;

    return {
      monthKey: prevMonthKey,
      summary: {
        totalIncome,
        totalExpense,
        balance,
        savingsRate: totalIncome > 0 ? Math.max(0, Math.round((balance / totalIncome) * 100)) : 0,
        dailyAverageExpense: 0,
        transactionCount: prevTx.length,
      },
    };
  }, [transactions, selectedMonth]);

  // Handlers for Transactions
  const handleSaveTransaction = (
    txData: Omit<Transaction, 'id' | 'createdAt'>,
    editingId?: string
  ) => {
    if (editingId) {
      const existing = transactions.find((t) => t.id === editingId);
      const updatedTx: Transaction = {
        ...txData,
        id: editingId,
        createdAt: existing?.createdAt || Date.now(),
      };
      setTransactions((prev) =>
        prev.map((t) => (t.id === editingId ? updatedTx : t))
      );
      saveTransactionToFirestore(updatedTx);
    } else {
      const newTx: Transaction = {
        ...txData,
        id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        createdAt: Date.now(),
      };
      setTransactions((prev) => [newTx, ...prev]);
      saveTransactionToFirestore(newTx);
    }
    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus transaksi ini?')) {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      deleteTransactionFromFirestore(id);
    }
  };

  const handleDuplicateTransaction = (tx: Transaction) => {
    const duplicated: Transaction = {
      ...tx,
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: `${tx.title} (Salinan)`,
      createdAt: Date.now(),
    };
    setTransactions((prev) => [duplicated, ...prev]);
    saveTransactionToFirestore(duplicated);
  };

  // Handlers for Savings Goals
  const handleSaveSavingsGoal = (
    goalData: Omit<SavingsGoal, 'id' | 'createdAt' | 'history'> & { initialDeposit?: number; id?: string }
  ) => {
    if (goalData.id) {
      const existing = savingsGoals.find((g) => g.id === goalData.id);
      const updatedGoal: SavingsGoal = {
        id: goalData.id,
        title: goalData.title,
        targetAmount: goalData.targetAmount,
        currentAmount: existing?.currentAmount || 0,
        targetDate: goalData.targetDate,
        category: goalData.category,
        color: goalData.color,
        icon: goalData.icon,
        notes: goalData.notes,
        createdAt: existing?.createdAt || Date.now(),
        history: existing?.history || [],
      };
      setSavingsGoals((prev) =>
        prev.map((g) => (g.id === goalData.id ? updatedGoal : g))
      );
      saveSavingsGoalToFirestore(updatedGoal);
    } else {
      const newGoalId = `save-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
      const initialHistory =
        goalData.initialDeposit && goalData.initialDeposit > 0
          ? [
              {
                id: `log-${Date.now()}`,
                date: getCurrentMonthKey() + '-01',
                amount: goalData.initialDeposit,
                type: 'deposit' as const,
                note: 'Saldo tabungan awal saat target dibuat',
                createdAt: Date.now(),
              },
            ]
          : [];

      const newGoal: SavingsGoal = {
        id: newGoalId,
        title: goalData.title,
        targetAmount: goalData.targetAmount,
        currentAmount: goalData.initialDeposit || 0,
        targetDate: goalData.targetDate,
        category: goalData.category,
        color: goalData.color,
        icon: goalData.icon,
        notes: goalData.notes,
        createdAt: Date.now(),
        history: initialHistory,
      };

      setSavingsGoals((prev) => [newGoal, ...prev]);
      saveSavingsGoalToFirestore(newGoal);
    }
    setEditingSavingsGoal(null);
  };

  const handleDeleteSavingsGoal = (id: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
    deleteSavingsGoalFromFirestore(id);
  };

  const handleAddSavingsTransactionAndLog = (params: {
    goalId: string;
    type: 'deposit' | 'withdraw';
    amount: number;
    date: string;
    note?: string;
    syncWithCashflow: boolean;
    paymentMethod: PaymentMethod;
  }) => {
    const { goalId, type, amount, date, note, syncWithCashflow, paymentMethod } = params;

    // 1. Update savings goal history and balance
    let updatedGoalForCloud: SavingsGoal | null = null;
    setSavingsGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const newCurrent =
          type === 'deposit' ? g.currentAmount + amount : Math.max(0, g.currentAmount - amount);
        const newLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          date,
          amount,
          type,
          note,
          syncWithTransactions: syncWithCashflow,
          createdAt: Date.now(),
        };
        const updated = {
          ...g,
          currentAmount: newCurrent,
          history: [newLog, ...g.history],
        };
        updatedGoalForCloud = updated;
        return updated;
      })
    );

    if (updatedGoalForCloud) {
      saveSavingsGoalToFirestore(updatedGoalForCloud);
    }

    // 2. If syncWithCashflow is checked, also record in transactions
    if (syncWithCashflow) {
      const targetGoal = savingsGoals.find((g) => g.id === goalId);
      const goalTitle = targetGoal ? targetGoal.title : 'Tabungan';

      const cashflowTx: Transaction = {
        id: `tx-save-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title:
          type === 'deposit'
            ? `Setoran Tabungan: ${goalTitle}`
            : `Tarik Dana Tabungan: ${goalTitle}`,
        amount,
        type: type === 'deposit' ? 'expense' : 'income',
        categoryId: type === 'deposit' ? 'investment_out' : 'other_income',
        date,
        paymentMethod,
        notes: note ? `[Tabungan] ${note}` : `[Tabungan] Mutasi pos ${goalTitle}`,
        createdAt: Date.now(),
      };

      setTransactions((prev) => [cashflowTx, ...prev]);
      saveTransactionToFirestore(cashflowTx);
    }
  };

  const handleDeleteSavingsLog = (goalId: string, logId: string) => {
    let updatedGoalForCloud: SavingsGoal | null = null;
    setSavingsGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g;
        const targetLog = g.history.find((l) => l.id === logId);
        if (!targetLog) return g;

        const newCurrent =
          targetLog.type === 'deposit'
            ? Math.max(0, g.currentAmount - targetLog.amount)
            : g.currentAmount + targetLog.amount;

        const updatedHistory = g.history.filter((l) => l.id !== logId);

        const updated = {
          ...g,
          currentAmount: newCurrent,
          history: updatedHistory,
        };
        updatedGoalForCloud = updated;
        return updated;
      })
    );

    if (updatedGoalForCloud) {
      saveSavingsGoalToFirestore(updatedGoalForCloud);
    }

    // Keep active history modal in sync
    if (activeHistoryGoal && activeHistoryGoal.id === goalId) {
      setActiveHistoryGoal((prev) => {
        if (!prev) return null;
        const targetLog = prev.history.find((l) => l.id === logId);
        if (!targetLog) return prev;
        const newCurrent =
          targetLog.type === 'deposit'
            ? Math.max(0, prev.currentAmount - targetLog.amount)
            : prev.currentAmount + targetLog.amount;
        return {
          ...prev,
          currentAmount: newCurrent,
          history: prev.history.filter((l) => l.id !== logId),
        };
      });
    }
  };

  const handleResetSampleData = () => {
    setTransactions(INITIAL_TRANSACTIONS);
    setBudgets(DEFAULT_BUDGETS);
    setSavingsGoals(INITIAL_SAVINGS_GOALS);
    setRecurringBills(INITIAL_RECURRING_BILLS);
    setDebts(INITIAL_DEBTS);
    const current = getCurrentMonthKey();
    setSelectedMonth(current);
    pushFullStateToCloud(
      INITIAL_TRANSACTIONS,
      DEFAULT_BUDGETS,
      INITIAL_SAVINGS_GOALS,
      INITIAL_RECURRING_BILLS,
      INITIAL_DEBTS
    );
  };

  const handleClearAllTransactions = () => {
    setTransactions([]);
    setSavingsGoals([]);
    const resetBills = recurringBills.map((b) => ({ ...b, paidMonths: [] }));
    setRecurringBills(resetBills);
    setDebts([]);
    pushFullStateToCloud([], budgets, [], resetBills, []);
  };

  const handleClearCurrentMonthTransactions = () => {
    const remainingTxs = transactions.filter((t) => getMonthYearKey(t.date) !== selectedMonth);
    const updatedBills = recurringBills.map((b) => ({
      ...b,
      paidMonths: (b.paidMonths || []).filter((m) => m !== selectedMonth),
    }));
    setTransactions(remainingTxs);
    setRecurringBills(updatedBills);
    replaceAllTransactionsInFirestore(remainingTxs);
    replaceAllRecurringBillsInFirestore(updatedBills);
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(
      {
        app: 'Pencatat Keuangan Pribadi',
        exportDate: new Date().toISOString(),
        transactions,
        budgets,
        savingsGoals,
        recurringBills,
        debts,
      },
      null,
      2
    );
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_keuangan_${selectedMonth}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.transactions && Array.isArray(parsed.transactions)) {
          const newTxs = parsed.transactions;
          const newBudgets = (parsed.budgets && Array.isArray(parsed.budgets)) ? parsed.budgets : budgets;
          const newSavings = (parsed.savingsGoals && Array.isArray(parsed.savingsGoals)) ? parsed.savingsGoals : savingsGoals;
          const newBills = (parsed.recurringBills && Array.isArray(parsed.recurringBills)) ? parsed.recurringBills : recurringBills;
          const newDebts = (parsed.debts && Array.isArray(parsed.debts)) ? parsed.debts : debts;

          setTransactions(newTxs);
          setBudgets(newBudgets);
          setSavingsGoals(newSavings);
          setRecurringBills(newBills);
          setDebts(newDebts);

          pushFullStateToCloud(newTxs, newBudgets, newSavings, newBills, newDebts);
          alert('Data transaksi, tabungan, pengeluaran rutin, dan hutang berhasil diimpor & disinkronkan ke Cloud!');
        } else {
          alert('Format berkas JSON tidak valid.');
        }
      } catch (err) {
        alert('Gagal membaca berkas JSON.');
      }
    };
    reader.readAsText(file);
  };

  // Debt & Deficit Repayment Handlers
  const handleSaveDebt = (
    debtData: Omit<DebtItem, 'id' | 'createdAt' | 'history' | 'status' | 'remainingAmount'>,
    editingId?: string
  ) => {
    if (editingId) {
      let updatedDebtForCloud: DebtItem | null = null;
      setDebts((prev) =>
        prev.map((d) => {
          if (d.id === editingId) {
            const totalDiff = debtData.totalAmount - d.totalAmount;
            const newRemaining = Math.max(0, d.remainingAmount + totalDiff);
            let newStatus: 'unpaid' | 'partial' | 'paid' = d.status;
            if (newRemaining <= 0) {
              newStatus = 'paid';
            } else if (newRemaining < debtData.totalAmount) {
              newStatus = 'partial';
            } else {
              newStatus = 'unpaid';
            }
            const updated: DebtItem = {
              ...d,
              ...debtData,
              remainingAmount: newRemaining,
              status: newStatus,
            };
            updatedDebtForCloud = updated;
            return updated;
          }
          return d;
        })
      );
      if (updatedDebtForCloud) {
        saveDebtToFirestore(updatedDebtForCloud);
      }
    } else {
      const newDebt: DebtItem = {
        ...debtData,
        id: `debt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        remainingAmount: debtData.totalAmount,
        status: 'unpaid',
        history: [],
        createdAt: Date.now(),
      };
      setDebts((prev) => [newDebt, ...prev]);
      saveDebtToFirestore(newDebt);
    }
  };

  const handleDeleteDebt = (id: string) => {
    setDebts((prev) => prev.filter((d) => d.id !== id));
    deleteDebtFromFirestore(id);
  };

  const handleMakeDebtPayment = (
    debtId: string,
    amount: number,
    paymentMethod: PaymentMethod,
    date: string,
    notes: string,
    syncWithTransactions: boolean
  ) => {
    const targetDebt = debts.find((d) => d.id === debtId);
    if (!targetDebt) return;

    const paymentLogId = `debt_pay_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newLog = {
      id: paymentLogId,
      debtId,
      amount,
      paymentMethod,
      date,
      notes: notes || `Bayar cicilan: ${targetDebt.title}`,
      syncWithTransactions,
      createdAt: Date.now(),
    };

    const newRemaining = Math.max(0, targetDebt.remainingAmount - amount);
    const newStatus: 'unpaid' | 'partial' | 'paid' = newRemaining === 0 ? 'paid' : 'partial';

    // 1. Update Debts
    let updatedDebtForCloud: DebtItem | null = null;
    setDebts((prev) =>
      prev.map((d) => {
        if (d.id === debtId) {
          const updated: DebtItem = {
            ...d,
            remainingAmount: newRemaining,
            status: newStatus,
            history: [newLog, ...d.history],
          };
          updatedDebtForCloud = updated;
          return updated;
        }
        return d;
      })
    );

    if (updatedDebtForCloud) {
      saveDebtToFirestore(updatedDebtForCloud);
    }

    // 2. Optionally sync with transactions as expense
    if (syncWithTransactions) {
      const newTx: Transaction = {
        id: `tx_debt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        title: `Bayar Hutang: ${targetDebt.title}`,
        amount,
        type: 'expense',
        categoryId: 'debt_payment',
        paymentMethod,
        date,
        notes: notes || `Pelunasan hutang (${targetDebt.creditor})`,
        createdAt: Date.now(),
      };
      setTransactions((prev) => [newTx, ...prev]);
      saveTransactionToFirestore(newTx);
    }
  };

  const handleDeleteDebtHistoryItem = (debtId: string, logId: string) => {
    let updatedDebtForCloud: DebtItem | null = null;
    setDebts((prev) =>
      prev.map((d) => {
        if (d.id === debtId) {
          const targetLog = d.history.find((l) => l.id === logId);
          if (!targetLog) return d;
          const restoredRemaining = Math.min(d.totalAmount, d.remainingAmount + targetLog.amount);
          let restoredStatus: 'unpaid' | 'partial' | 'paid' = 'unpaid';
          if (restoredRemaining <= 0) {
            restoredStatus = 'paid';
          } else if (restoredRemaining < d.totalAmount) {
            restoredStatus = 'partial';
          } else {
            restoredStatus = 'unpaid';
          }
          const updated: DebtItem = {
            ...d,
            remainingAmount: restoredRemaining,
            status: restoredStatus,
            history: d.history.filter((l) => l.id !== logId),
          };
          updatedDebtForCloud = updated;
          return updated;
        }
        return d;
      })
    );

    if (updatedDebtForCloud) {
      saveDebtToFirestore(updatedDebtForCloud);
    }
  };

  // Recurring Bills Handlers
  const handleSaveRecurringBill = (
    billData: Omit<RecurringBill, 'id' | 'createdAt' | 'paidMonths'>,
    editingId?: string
  ) => {
    if (editingId) {
      const existing = recurringBills.find((b) => b.id === editingId);
      const updatedBill: RecurringBill = {
        ...billData,
        id: editingId,
        paidMonths: existing?.paidMonths || [],
        createdAt: existing?.createdAt || Date.now(),
      };
      setRecurringBills((prev) =>
        prev.map((b) => (b.id === editingId ? updatedBill : b))
      );
      saveRecurringBillToFirestore(updatedBill);
    } else {
      const newBill: RecurringBill = {
        ...billData,
        id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        paidMonths: [],
        createdAt: Date.now(),
      };
      setRecurringBills((prev) => [newBill, ...prev]);
      saveRecurringBillToFirestore(newBill);
    }
  };

  const handleDeleteRecurringBill = (id: string) => {
    setRecurringBills((prev) => prev.filter((b) => b.id !== id));
    deleteRecurringBillFromFirestore(id);
  };

  const handleToggleRecurringActive = (id: string, active: boolean) => {
    let updatedBillForCloud: RecurringBill | null = null;
    setRecurringBills((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          const updated = { ...b, isActive: active };
          updatedBillForCloud = updated;
          return updated;
        }
        return b;
      })
    );
    if (updatedBillForCloud) {
      saveRecurringBillToFirestore(updatedBillForCloud);
    }
  };

  const handlePayRecurringBill = (bill: RecurringBill, dateStr?: string) => {
    const today = getTodayDateString();
    const currentMonth = getCurrentMonthKey();
    let txDate = dateStr;
    if (!txDate) {
      if (selectedMonth === currentMonth) {
        txDate = today;
      } else {
        const dueDayFormatted = String(Math.min(28, bill.dueDay)).padStart(2, '0');
        txDate = `${selectedMonth}-${dueDayFormatted}`;
      }
    }

    // 1. Create Transaction
    const newTx: Transaction = {
      id: `tx_rec_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: bill.title,
      amount: bill.amount,
      type: 'expense',
      categoryId: bill.categoryId,
      paymentMethod: bill.paymentMethod,
      date: txDate,
      notes: bill.notes ? `Tagihan rutin: ${bill.notes}` : 'Tagihan bulanan rutin',
      createdAt: Date.now(),
    };

    setTransactions((prev) => [newTx, ...prev]);
    saveTransactionToFirestore(newTx);

    // 2. Mark as paid for selectedMonth in recurringBills
    let updatedBillForCloud: RecurringBill | null = null;
    setRecurringBills((prev) =>
      prev.map((b) => {
        if (b.id === bill.id) {
          const currentPaid = b.paidMonths || [];
          if (!currentPaid.includes(selectedMonth)) {
            const updated = {
              ...b,
              paidMonths: [...currentPaid, selectedMonth],
              lastPaidDate: txDate,
            };
            updatedBillForCloud = updated;
            return updated;
          }
        }
        return b;
      })
    );

    if (updatedBillForCloud) {
      saveRecurringBillToFirestore(updatedBillForCloud);
    }
  };

  const handleUnpayRecurringBill = (bill: RecurringBill) => {
    let updatedBillForCloud: RecurringBill | null = null;
    setRecurringBills((prev) =>
      prev.map((b) => {
        if (b.id === bill.id) {
          const updated = {
            ...b,
            paidMonths: (b.paidMonths || []).filter((m) => m !== selectedMonth),
          };
          updatedBillForCloud = updated;
          return updated;
        }
        return b;
      })
    );
    if (updatedBillForCloud) {
      saveRecurringBillToFirestore(updatedBillForCloud);
    }
  };

  const handlePayAllPendingBills = () => {
    const today = getTodayDateString();
    const currentMonth = getCurrentMonthKey();
    const unpaidActiveBills = recurringBills.filter(
      (b) => b.isActive && !b.paidMonths?.includes(selectedMonth)
    );

    if (unpaidActiveBills.length === 0) return;

    const newTransactions: Transaction[] = [];
    const paidIds = new Set<string>();

    unpaidActiveBills.forEach((bill, index) => {
      let txDate = '';
      if (selectedMonth === currentMonth) {
        txDate = today;
      } else {
        const dueDayFormatted = String(Math.min(28, bill.dueDay)).padStart(2, '0');
        txDate = `${selectedMonth}-${dueDayFormatted}`;
      }

      const newTx: Transaction = {
        id: `tx_rec_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 4)}`,
        title: bill.title,
        amount: bill.amount,
        type: 'expense',
        categoryId: bill.categoryId,
        paymentMethod: bill.paymentMethod,
        date: txDate,
        notes: bill.notes ? `Tagihan rutin: ${bill.notes}` : 'Tagihan bulanan rutin',
        createdAt: Date.now() + index,
      };

      newTransactions.push(newTx);
      saveTransactionToFirestore(newTx);
      paidIds.add(bill.id);
    });

    setTransactions((prev) => [...newTransactions, ...prev]);

    setRecurringBills((prev) =>
      prev.map((b) => {
        if (paidIds.has(b.id)) {
          const currentPaid = b.paidMonths || [];
          if (!currentPaid.includes(selectedMonth)) {
            const updated = {
              ...b,
              paidMonths: [...currentPaid, selectedMonth],
              lastPaidDate: today,
            };
            saveRecurringBillToFirestore(updated);
            return updated;
          }
        }
        return b;
      })
    );
  };

  const scrollToSavings = () => {
    savingsSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToRecurring = () => {
    recurringSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToDebt = () => {
    debtSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans antialiased flex flex-col">
      {/* PWA Mobile Support / Install Banner */}
      <PWAInstallPrompt />

      {/* Header */}
      <Header
        selectedMonth={selectedMonth}
        onSelectMonth={setSelectedMonth}
        transactions={transactions}
        onOpenAddModal={() => {
          setEditingTransaction(null);
          setIsAddModalOpen(true);
        }}
        onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        onOpenAIModal={() => setIsAIModalOpen(true)}
        onOpenResetModal={() => setIsResetModalOpen(true)}
        onOpenSavingsSection={scrollToSavings}
        onOpenRecurringSection={scrollToRecurring}
        onOpenDebtSection={scrollToDebt}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onForceSyncCloud={() =>
          pushFullStateToCloud(
            transactions,
            budgets,
            savingsGoals,
            recurringBills,
            debts
          )
        }
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* KPI Dashboard Summary */}
        <DashboardSummary summary={summary} selectedMonth={selectedMonth} />

        {/* Informative Monthly Expense Charts */}
        <ChartsSection
          transactions={transactions}
          budgets={budgets}
          selectedMonth={selectedMonth}
          onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
          onOpenAIModal={() => setIsAIModalOpen(true)}
        />

        {/* Feature: Pengeluaran Rutin & Tagihan Bulanan (BPJS, Paket Data, Uang Kas, dll) */}
        <div ref={recurringSectionRef}>
          <RecurringSection
            recurringBills={recurringBills}
            selectedMonth={selectedMonth}
            onOpenAddModal={() => {
              setEditingRecurringBill(null);
              setIsRecurringModalOpen(true);
            }}
            onOpenEditModal={(bill) => {
              setEditingRecurringBill(bill);
              setIsRecurringModalOpen(true);
            }}
            onDeleteBill={handleDeleteRecurringBill}
            onPayBill={handlePayRecurringBill}
            onUnpayBill={handleUnpayRecurringBill}
            onPayAllPending={handlePayAllPendingBills}
            onToggleActive={handleToggleRecurringActive}
          />
        </div>

        {/* Feature: Hutang & Talangan Defisit Bulan Sebelumnya */}
        <div ref={debtSectionRef}>
          <DebtSection
            debts={debts}
            previousMonthData={previousMonthData}
            onOpenAddDebt={(suggestedDeficit) => {
              setEditingDebt(null);
              setSuggestedDeficitForModal(suggestedDeficit || null);
              setIsDebtModalOpen(true);
            }}
            onOpenEditDebt={(debt) => {
              setEditingDebt(debt);
              setSuggestedDeficitForModal(null);
              setIsDebtModalOpen(true);
            }}
            onDeleteDebt={handleDeleteDebt}
            onOpenPaymentModal={(debt) => {
              setActiveDebtForPayment(debt);
              setIsDebtPaymentModalOpen(true);
            }}
            onOpenHistoryModal={(debt) => {
              setActiveDebtForHistory(debt);
              setIsDebtHistoryModalOpen(true);
            }}
          />
        </div>

        {/* Feature: Pencatat Tabungan & Celengan Target */}
        <div ref={savingsSectionRef}>
          <SavingsSection
            savingsGoals={savingsGoals}
            onOpenAddGoal={() => {
              setEditingSavingsGoal(null);
              setIsSavingsGoalModalOpen(true);
            }}
            onOpenEditGoal={(goal) => {
              setEditingSavingsGoal(goal);
              setIsSavingsGoalModalOpen(true);
            }}
            onDeleteGoal={handleDeleteSavingsGoal}
            onOpenDepositModal={(goal, type) => {
              setActiveDepositGoal(goal);
              setDepositModalType(type);
              setIsDepositModalOpen(true);
            }}
            onOpenHistoryModal={(goal) => {
              setActiveHistoryGoal(goal);
              setIsHistoryModalOpen(true);
            }}
          />
        </div>

        {/* Transaction History & Manager */}
        <TransactionList
          transactions={transactions}
          selectedMonth={selectedMonth}
          onEdit={(tx) => {
            setEditingTransaction(tx);
            setIsAddModalOpen(true);
          }}
          onDelete={handleDeleteTransaction}
          onDuplicate={handleDuplicateTransaction}
          onOpenAddModal={() => {
            setEditingTransaction(null);
            setIsAddModalOpen(true);
          }}
          onOpenResetModal={() => setIsResetModalOpen(true)}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 Pencatat Keuangan Pribadi. Seluruh data tersimpan aman di browser Anda.</p>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setIsResetModalOpen(true)}
              className="text-rose-600 hover:text-rose-700 hover:underline font-medium cursor-pointer"
            >
              Reset Data Keuangan
            </button>
            <span className="text-slate-300">•</span>
            <span className="inline-flex items-center gap-1.5 text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
              Cloud Sync & Penyimpanan Lokal Aktif
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <TransactionFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        initialData={editingTransaction}
        defaultMonth={selectedMonth}
      />

      <BudgetManagerModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        budgets={budgets}
        onSaveBudgets={(newBudgets) => {
          setBudgets(newBudgets);
          saveBudgetsToFirestore(newBudgets);
        }}
        selectedMonth={selectedMonth}
        transactions={transactions}
      />

      <AIAdviceModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        summary={summary}
        transactions={transactions}
        budgets={budgets}
        selectedMonth={selectedMonth}
      />

      <ResetDataModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onClearAll={handleClearAllTransactions}
        onClearCurrentMonth={handleClearCurrentMonthTransactions}
        onResetToSample={handleResetSampleData}
        onExportBackup={handleExportJSON}
        selectedMonth={selectedMonth}
        transactionCount={transactions.length}
        monthTransactionCount={
          transactions.filter((t) => getMonthYearKey(t.date) === selectedMonth).length
        }
      />

      {/* Recurring Bills Modal */}
      <RecurringBillModal
        isOpen={isRecurringModalOpen}
        onClose={() => {
          setIsRecurringModalOpen(false);
          setEditingRecurringBill(null);
        }}
        onSave={handleSaveRecurringBill}
        initialData={editingRecurringBill}
      />

      {/* Debt Modals */}
      <DebtModal
        isOpen={isDebtModalOpen}
        onClose={() => {
          setIsDebtModalOpen(false);
          setEditingDebt(null);
          setSuggestedDeficitForModal(null);
        }}
        onSave={handleSaveDebt}
        initialData={editingDebt}
        suggestedDeficit={suggestedDeficitForModal}
      />

      <DebtPaymentModal
        isOpen={isDebtPaymentModalOpen}
        onClose={() => {
          setIsDebtPaymentModalOpen(false);
          setActiveDebtForPayment(null);
        }}
        debt={activeDebtForPayment}
        onSavePayment={handleMakeDebtPayment}
      />

      <DebtHistoryModal
        isOpen={isDebtHistoryModalOpen}
        onClose={() => {
          setIsDebtHistoryModalOpen(false);
          setActiveDebtForHistory(null);
        }}
        debt={activeDebtForHistory}
        onDeleteLog={handleDeleteDebtHistoryItem}
        onOpenPayment={(debt) => {
          setActiveDebtForPayment(debt);
          setIsDebtPaymentModalOpen(true);
        }}
      />

      {/* Savings Modals */}
      <SavingsGoalModal
        isOpen={isSavingsGoalModalOpen}
        onClose={() => {
          setIsSavingsGoalModalOpen(false);
          setEditingSavingsGoal(null);
        }}
        onSave={handleSaveSavingsGoal}
        initialData={editingSavingsGoal}
      />

      <SavingsDepositModal
        isOpen={isDepositModalOpen}
        onClose={() => {
          setIsDepositModalOpen(false);
          setActiveDepositGoal(null);
        }}
        goal={activeDepositGoal}
        defaultType={depositModalType}
        onAddTransactionAndLog={handleAddSavingsTransactionAndLog}
      />

      <SavingsHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setActiveHistoryGoal(null);
        }}
        goal={activeHistoryGoal}
        onDeleteLog={handleDeleteSavingsLog}
        onOpenDeposit={(goal, type) => {
          setActiveDepositGoal(goal);
          setDepositModalType(type);
          setIsDepositModalOpen(true);
        }}
      />
    </div>
  );
}

