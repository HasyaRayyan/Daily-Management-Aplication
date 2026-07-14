// Supabase storage functions for Daily Manager
import { supabase } from '../lib/supabase';

// ==========================================
// TASKS
// ==========================================

/**
 * Get all tasks for a specific date
 * @param {string} dateKey - format: YYYY-MM-DD
 * @returns {Promise<Array>}
 */
export async function getTasks(dateKey) {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('date_key', dateKey)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
  return data || [];
}

/**
 * Add a new task
 * @param {object} task - { id, date_key, text, completed, time, created_at }
 * @returns {Promise<object|null>}
 */
export async function addTask(task) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('tasks')
    .insert({ ...task, user_id: session.user.id })
    .select()
    .single();

  if (error) {
    console.error('Error adding task:', error);
    return null;
  }
  return data;
}

/**
 * Update a task (e.g. toggle completed)
 * @param {string} id
 * @param {object} updates
 * @returns {Promise<object|null>}
 */
export async function updateTask(id, updates) {
  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating task:', error);
    return null;
  }
  return data;
}

/**
 * Delete a task
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function deleteTask(id) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting task:', error);
    return false;
  }
  return true;
}

// ==========================================
// TRANSACTIONS
// ==========================================

/**
 * Get all transactions for a specific date
 * @param {string} dateKey - format: YYYY-MM-DD
 * @returns {Promise<Array>}
 */
export async function getTransactions(dateKey) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('date_key', dateKey)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
  return data || [];
}

/**
 * Add a new transaction
 * @param {object} transaction
 * @returns {Promise<object|null>}
 */
export async function addTransaction(transaction) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('transactions')
    .insert({ ...transaction, user_id: session.user.id })
    .select()
    .single();

  if (error) {
    console.error('Error adding transaction:', error);
    return null;
  }
  return data;
}

/**
 * Delete a transaction
 * @param {string} id
 * @returns {Promise<boolean>}
 */
export async function deleteTransaction(id) {
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting transaction:', error);
    return false;
  }
  return true;
}
