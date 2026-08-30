// Supabase storage functions for Daily Manager
import { supabase } from '../lib/supabase';

// ==========================================
// PROFILES
// ==========================================
export async function getProfile() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  let { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
}

export async function updateProfile(updates) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: session.user.id, ...updates, updated_at: new Date().toISOString() })
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    return null;
  }
  return data;
}

// ==========================================
// ROUTINES
// ==========================================
export async function getRoutines() {
  const { data, error } = await supabase
    .from('routines')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching routines:', error);
    return [];
  }
  return data || [];
}

export async function addRoutine(title, timeOfDay = 'kapan_saja') {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('routines')
    .insert({ title, time_of_day: timeOfDay, user_id: session.user.id })
    .select()
    .single();

  if (error) return null;
  return data;
}

export async function deleteRoutine(id) {
  await supabase.from('routines').delete().eq('id', id);
}

// ROUTINE LOGS
export async function getRoutineLogs(dateKey) {
  const { data, error } = await supabase
    .from('routine_logs')
    .select('*')
    .eq('date_key', dateKey);

  if (error) {
    console.error('Error fetching routine logs:', error);
    return [];
  }
  return data || [];
}

export async function toggleRoutineLog(routineId, dateKey, completed, notes = null) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('routine_logs')
    .upsert({ 
      routine_id: routineId, 
      user_id: session.user.id, 
      date_key: dateKey, 
      completed,
      notes,
      completed_at: completed ? new Date().toISOString() : null
    }, { onConflict: 'routine_id,date_key' })
    .select()
    .single();

  if (error) {
    console.error('Error toggling routine:', error);
    return null;
  }
  return data;
}

export async function getRoutineHistory(startDateKey, endDateKey) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const { data, error } = await supabase
    .from('routine_logs')
    .select('routine_id, date_key, completed, notes')
    .eq('user_id', session.user.id)
    .gte('date_key', startDateKey)
    .lte('date_key', endDateKey);

  if (error) {
    console.error('Error fetching routine history:', error);
    return [];
  }
  return data || [];
}

// ==========================================
// SCHEDULES
// ==========================================
export async function getSchedules(dateKey) {
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('date_key', dateKey)
    .order('time_start', { ascending: true });

  if (error) {
    console.error('Error fetching schedules:', error);
    return [];
  }
  return data || [];
}

export async function addSchedule(schedule) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('schedules')
    .insert({ ...schedule, user_id: session.user.id })
    .select()
    .single();

  if (error) return null;
  return data;
}

export async function deleteSchedule(id) {
  await supabase.from('schedules').delete().eq('id', id);
}

// ==========================================
// TRANSACTIONS
// ==========================================
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

export async function getTransactionsWithLocation() {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .not('latitude', 'is', null)
    .not('longitude', 'is', null);

  if (error) {
    console.error('Error fetching transactions with location:', error);
    return [];
  }
  return data || [];
}

export async function getTransactionsByMonth(monthPrefix) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .like('date_key', `${monthPrefix}-%`)
    .order('date_key', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching transactions by month:', error);
    return [];
  }
  return data || [];
}

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

export async function deleteTransaction(id) {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  return !error;
}

// ==========================================
// STORAGE UPLOADS
// ==========================================
export async function uploadFile(bucket, path, file) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    console.error('Upload error:', error);
    return null;
  }

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
    
  return publicUrl;
}

// ==========================================
// APP SETTINGS
// ==========================================
export async function getAppVersion() {
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'latest_version')
    .maybeSingle();
    
  if (error) {
    console.error('Error fetching app version:', error);
    return null;
  }
  
  return data?.value || null;
}

// ==========================================
// CUSTOM CATEGORIES
// ==========================================
export async function getCustomCategories() {
  const { data, error } = await supabase
    .from('custom_categories')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching custom categories:', error);
    return [];
  }
  return data || [];
}

export async function addCustomCategory(type, name) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('custom_categories')
    .insert({ type, name, user_id: session.user.id })
    .select()
    .single();

  if (error) {
    console.error('Error adding custom category:', error);
    return null;
  }
  return data;
}

export async function deleteCustomCategory(id) {
  const { error } = await supabase.from('custom_categories').delete().eq('id', id);
  return !error;
}
