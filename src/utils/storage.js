// localStorage utility functions for Daily Manager

const STORAGE_KEYS = {
  TASKS: 'dm_tasks',
  TRANSACTIONS: 'dm_transactions',
};

/**
 * Get all tasks for a specific date
 * @param {string} dateKey - format: YYYY-MM-DD
 * @returns {Array}
 */
export function getTasks(dateKey) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '{}');
    return all[dateKey] || [];
  } catch {
    return [];
  }
}

/**
 * Save tasks for a specific date
 * @param {string} dateKey
 * @param {Array} tasks
 */
export function saveTasks(dateKey, tasks) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '{}');
    all[dateKey] = tasks;
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to save tasks:', e);
  }
}

/**
 * Get all transactions for a specific date
 * @param {string} dateKey - format: YYYY-MM-DD
 * @returns {Array}
 */
export function getTransactions(dateKey) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '{}');
    return all[dateKey] || [];
  } catch {
    return [];
  }
}

/**
 * Save transactions for a specific date
 * @param {string} dateKey
 * @param {Array} transactions
 */
export function saveTransactions(dateKey, transactions) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '{}');
    all[dateKey] = transactions;
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(all));
  } catch (e) {
    console.error('Failed to save transactions:', e);
  }
}

/**
 * Get all data (for summary across dates)
 */
export function getAllTasks() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '{}');
  } catch {
    return {};
  }
}

export function getAllTransactions() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRANSACTIONS) || '{}');
  } catch {
    return {};
  }
}
