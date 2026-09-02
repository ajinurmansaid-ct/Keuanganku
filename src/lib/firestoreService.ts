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
  UserProfile,
} from '../types';
import { DEFAULT_PROFILES } from '../data/sampleProfiles';

// Collections names
const COLL_PROFILES = 'profiles';
const COLL_TRANSACTIONS = 'transactions';
const COLL_BUDGETS = 'budgets';
const COLL_SAVINGS = 'savingsGoals';
const COLL_RECURRING = 'recurringBills';
const COLL_DEBTS = 'debts';

// 0. Profiles Firestore Sync
export function subscribeToProfiles(callback: (profiles: UserProfile[]) => void) {
  const colRef = collection(db, COLL_PROFILES);
  return onSnapshot(
    colRef,
    (snapshot) => {
      if (!snapshot.empty) {
        const items: UserProfile[] = [];
        snapshot.forEach((d) => {
          items.push(d.data() as UserProfile);
        });
        // Sort user_1 then user_2
        items.sort((a, b) => a.id.localeCompare(b.id));
        callback(items);
      }
    },
    (err) => {
      console.warn('Firestore profiles sync error:', err);
    }
  );
}

export async function saveProfilesToFirestore(profiles: UserProfile[]) {
  try {
    const batch = writeBatch(db);
    profiles.forEach((p) => {
      const docRef = doc(db, COLL_PROFILES, p.id);
      batch.set(docRef, p, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.error('Error saving profiles to Firestore:', err);
  }
}

export async function saveSingleProfileToFirestore(profile: UserProfile) {
  try {
    const docRef = doc(db, COLL_PROFILES, profile.id);
    await setDoc(docRef, profile, { merge: true });
  } catch (err) {
    console.error('Error saving single profile to Firestore:', err);
  }
}

// 1. Transactions Firestore Sync
export function subscribeToTransactions(callback: (txs: Transaction[]) => void) {
  const colRef = collection(db, COLL_TRANSACTIONS);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: Transaction[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as Transaction;
        // Default to user_1 if not set for backward compatibility
        if (!data.profileId) {
          data.profileId = 'user_1';
        }
        items.push(data);
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
    const dataToSave = {
      ...tx,
      profileId: tx.profileId || 'user_1',
    };
    await setDoc(docRef, dataToSave, { merge: true });
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
        const data = d.data() as DebtItem;
        if (!data.profileId) {
          data.profileId = 'user_1';
        }
        items.push(data);
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
    const dataToSave = {
      ...debt,
      profileId: debt.profileId || 'user_1',
    };
    await setDoc(docRef, dataToSave, { merge: true });
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
        const data = d.data() as SavingsGoal;
        if (!data.profileId) {
          data.profileId = 'user_1';
        }
        items.push(data);
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
    const dataToSave = {
      ...goal,
      profileId: goal.profileId || 'user_1',
    };
    await setDoc(docRef, dataToSave, { merge: true });
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
        const data = d.data() as RecurringBill;
        if (!data.profileId) {
          data.profileId = 'user_1';
        }
        if (!Array.isArray(data.paidMonths)) {
          data.paidMonths = [];
        }
        items.push(data);
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
    const dataToSave = {
      ...bill,
      profileId: bill.profileId || 'user_1',
      paidMonths: Array.isArray(bill.paidMonths) ? bill.paidMonths : [],
    };
    await setDoc(docRef, dataToSave, { merge: true });
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
        const data = d.data() as CategoryBudget;
        if (!data.profileId) {
          data.profileId = 'user_1';
        }
        items.push(data);
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
      const pId = b.profileId || 'user_1';
      const docId = `${pId}_${b.categoryId}`;
      const docRef = doc(db, COLL_BUDGETS, docId);
      batch.set(docRef, { ...b, profileId: pId });
    });
    await batch.commit();
  } catch (err) {
    console.error('Error saving budgets to Firestore:', err);
  }
}

// Bulk Overwrite Collections in Firestore (Used for Reset, Import, or Synchronizing State)
export async function replaceAllTransactionsInFirestore(txs: Transaction[]) {
  try {
    const existing = await getDocs(collection(db, COLL_TRANSACTIONS));
    const batch = writeBatch(db);
    existing.forEach((d) => batch.delete(d.ref));
    txs.forEach((tx) => {
      batch.set(doc(db, COLL_TRANSACTIONS, tx.id), {
        ...tx,
        profileId: tx.profileId || 'user_1',
      });
    });
    await batch.commit();
  } catch (err) {
    console.error('Error replacing all transactions in Firestore:', err);
  }
}

export async function replaceAllDebtsInFirestore(debts: DebtItem[]) {
  try {
    const existing = await getDocs(collection(db, COLL_DEBTS));
    const batch = writeBatch(db);
    existing.forEach((d) => batch.delete(d.ref));
    debts.forEach((debt) => {
      batch.set(doc(db, COLL_DEBTS, debt.id), {
        ...debt,
        profileId: debt.profileId || 'user_1',
      });
    });
    await batch.commit();
  } catch (err) {
    console.error('Error replacing all debts in Firestore:', err);
  }
}

export async function replaceAllSavingsGoalsInFirestore(goals: SavingsGoal[]) {
  try {
    const existing = await getDocs(collection(db, COLL_SAVINGS));
    const batch = writeBatch(db);
    existing.forEach((d) => batch.delete(d.ref));
    goals.forEach((goal) => {
      batch.set(doc(db, COLL_SAVINGS, goal.id), {
        ...goal,
        profileId: goal.profileId || 'user_1',
      });
    });
    await batch.commit();
  } catch (err) {
    console.error('Error replacing all savings in Firestore:', err);
  }
}

export async function replaceAllRecurringBillsInFirestore(bills: RecurringBill[]) {
  try {
    const existing = await getDocs(collection(db, COLL_RECURRING));
    const batch = writeBatch(db);
    existing.forEach((d) => batch.delete(d.ref));
    bills.forEach((bill) => {
      batch.set(doc(db, COLL_RECURRING, bill.id), {
        ...bill,
        profileId: bill.profileId || 'user_1',
        paidMonths: Array.isArray(bill.paidMonths) ? bill.paidMonths : [],
      });
    });
    await batch.commit();
  } catch (err) {
    console.error('Error replacing all recurring bills in Firestore:', err);
  }
}

// Bulk Sync / Seed all initial local data to Firestore if cloud is empty
export async function syncInitialDataToCloudIfEmpty(
  localProfiles: UserProfile[],
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

      // Seed profiles
      (localProfiles.length > 0 ? localProfiles : DEFAULT_PROFILES).forEach((p) => {
        batch.set(doc(db, COLL_PROFILES, p.id), p);
      });

      // Seed transactions
      localTransactions.forEach((tx) => {
        batch.set(doc(db, COLL_TRANSACTIONS, tx.id), {
          ...tx,
          profileId: tx.profileId || 'user_1',
        });
      });

      // Seed budgets
      localBudgets.forEach((b) => {
        const pId = b.profileId || 'user_1';
        batch.set(doc(db, COLL_BUDGETS, `${pId}_${b.categoryId}`), {
          ...b,
          profileId: pId,
        });
      });

      // Seed savings
      localSavings.forEach((s) => {
        batch.set(doc(db, COLL_SAVINGS, s.id), {
          ...s,
          profileId: s.profileId || 'user_1',
        });
      });

      // Seed recurring
      localRecurring.forEach((r) => {
        batch.set(doc(db, COLL_RECURRING, r.id), {
          ...r,
          profileId: r.profileId || 'user_1',
        });
      });

      // Seed debts
      localDebts.forEach((d) => {
        batch.set(doc(db, COLL_DEBTS, d.id), {
          ...d,
          profileId: d.profileId || 'user_1',
        });
      });

      await batch.commit();
      console.log('Seeded 2-person initial data to Firestore cloud database successfully.');
    }
  } catch (err) {
    console.warn('Initial cloud seed check skipped or failed:', err);
  }
}

// Force push entire current state to Cloud Firestore
export async function pushFullStateToCloud(
  profiles: UserProfile[],
  txs: Transaction[],
  budgets: CategoryBudget[],
  savings: SavingsGoal[],
  recurring: RecurringBill[],
  debts: DebtItem[]
) {
  await Promise.all([
    saveProfilesToFirestore(profiles),
    replaceAllTransactionsInFirestore(txs),
    saveBudgetsToFirestore(budgets),
    replaceAllSavingsGoalsInFirestore(savings),
    replaceAllRecurringBillsInFirestore(recurring),
    replaceAllDebtsInFirestore(debts),
  ]);
}
