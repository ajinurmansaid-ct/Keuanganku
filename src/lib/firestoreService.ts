import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
  getDocs,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  Transaction,
  CategoryBudget,
  SavingsGoal,
  RecurringBill,
  DebtItem,
} from '../types';

// Collections names
const COLL_TRANSACTIONS = 'transactions';
const COLL_BUDGETS = 'budgets';
const COLL_SAVINGS = 'savingsGoals';
const COLL_RECURRING = 'recurringBills';
const COLL_DEBTS = 'debts';

// 1. Transactions Firestore Sync
export function subscribeToTransactions(callback: (txs: Transaction[]) => void) {
  const colRef = collection(db, COLL_TRANSACTIONS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: Transaction[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as Transaction);
      });
      // Sort by date descending then createdAt descending
      items.sort((a, b) => {
        if (b.date !== a.date) {
          return b.date.localeCompare(a.date);
        }
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
      callback(items);
    },
    (err) => {
      console.warn('Firestore transactions sync error (falling back to local):', err);
    }
  );
}

export async function saveTransactionToFirestore(tx: Transaction) {
  try {
    const docRef = doc(db, COLL_TRANSACTIONS, tx.id);
    await setDoc(docRef, tx, { merge: true });
  } catch (err) {
    console.error('Error saving transaction to Firestore:', err);
  }
}

export async function deleteTransactionFromFirestore(id: string) {
  try {
    const docRef = doc(db, COLL_TRANSACTIONS, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting transaction from Firestore:', err);
  }
}

// 2. Debts Firestore Sync
export function subscribeToDebts(callback: (debts: DebtItem[]) => void) {
  const colRef = collection(db, COLL_DEBTS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: DebtItem[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as DebtItem);
      });
      items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      callback(items);
    },
    (err) => {
      console.warn('Firestore debts sync error:', err);
    }
  );
}

export async function saveDebtToFirestore(debt: DebtItem) {
  try {
    const docRef = doc(db, COLL_DEBTS, debt.id);
    await setDoc(docRef, debt, { merge: true });
  } catch (err) {
    console.error('Error saving debt to Firestore:', err);
  }
}

export async function deleteDebtFromFirestore(id: string) {
  try {
    const docRef = doc(db, COLL_DEBTS, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting debt from Firestore:', err);
  }
}

// 3. Savings Goals Firestore Sync
export function subscribeToSavingsGoals(callback: (goals: SavingsGoal[]) => void) {
  const colRef = collection(db, COLL_SAVINGS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: SavingsGoal[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as SavingsGoal);
      });
      items.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      callback(items);
    },
    (err) => {
      console.warn('Firestore savings sync error:', err);
    }
  );
}

export async function saveSavingsGoalToFirestore(goal: SavingsGoal) {
  try {
    const docRef = doc(db, COLL_SAVINGS, goal.id);
    await setDoc(docRef, goal, { merge: true });
  } catch (err) {
    console.error('Error saving savings goal to Firestore:', err);
  }
}

export async function deleteSavingsGoalFromFirestore(id: string) {
  try {
    const docRef = doc(db, COLL_SAVINGS, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting savings goal from Firestore:', err);
  }
}

// 4. Recurring Bills Firestore Sync
export function subscribeToRecurringBills(callback: (bills: RecurringBill[]) => void) {
  const colRef = collection(db, COLL_RECURRING);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: RecurringBill[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as RecurringBill);
      });
      items.sort((a, b) => a.dueDay - b.dueDay);
      callback(items);
    },
    (err) => {
      console.warn('Firestore recurring bills sync error:', err);
    }
  );
}

export async function saveRecurringBillToFirestore(bill: RecurringBill) {
  try {
    const docRef = doc(db, COLL_RECURRING, bill.id);
    await setDoc(docRef, bill, { merge: true });
  } catch (err) {
    console.error('Error saving recurring bill to Firestore:', err);
  }
}

export async function deleteRecurringBillFromFirestore(id: string) {
  try {
    const docRef = doc(db, COLL_RECURRING, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting recurring bill from Firestore:', err);
  }
}

// 5. Budgets Firestore Sync
export function subscribeToBudgets(callback: (budgets: CategoryBudget[]) => void) {
  const colRef = collection(db, COLL_BUDGETS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: CategoryBudget[] = [];
      snapshot.forEach((d) => {
        items.push(d.data() as CategoryBudget);
      });
      callback(items);
    },
    (err) => {
      console.warn('Firestore budgets sync error:', err);
    }
  );
}

export async function saveBudgetsToFirestore(budgets: CategoryBudget[]) {
  try {
    const batch = writeBatch(db);
    budgets.forEach((b) => {
      const docRef = doc(db, COLL_BUDGETS, b.categoryId);
      batch.set(docRef, b);
    });
    await batch.commit();
  } catch (err) {
    console.error('Error saving budgets to Firestore:', err);
  }
}

// Bulk Sync / Seed all initial local data to Firestore if cloud is empty
export async function syncInitialDataToCloudIfEmpty(
  localTransactions: Transaction[],
  localBudgets: CategoryBudget[],
  localSavings: SavingsGoal[],
  localRecurring: RecurringBill[],
  localDebts: DebtItem[]
) {
  try {
    const txSnapshot = await getDocs(collection(db, COLL_TRANSACTIONS));
    if (txSnapshot.empty && localTransactions.length > 0) {
      const batch = writeBatch(db);
      localTransactions.forEach((tx) => {
        batch.set(doc(db, COLL_TRANSACTIONS, tx.id), tx);
      });
      localBudgets.forEach((b) => {
        batch.set(doc(db, COLL_BUDGETS, b.categoryId), b);
      });
      localSavings.forEach((s) => {
        batch.set(doc(db, COLL_SAVINGS, s.id), s);
      });
      localRecurring.forEach((r) => {
        batch.set(doc(db, COLL_RECURRING, r.id), r);
      });
      localDebts.forEach((d) => {
        batch.set(doc(db, COLL_DEBTS, d.id), d);
      });
      await batch.commit();
      console.log('Seeded initial data to Firestore cloud database successfully.');
    }
  } catch (err) {
    console.warn('Initial cloud seed check skipped or failed:', err);
  }
}
