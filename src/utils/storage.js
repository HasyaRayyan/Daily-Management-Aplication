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
// TASKS
// ==========================================
export async function getTasks() {
  const { data, error } = await supabase
    .from('user_tasks')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching tasks:', error);
    return [];
  }
  return data || [];
}

export async function addTask(title, description, deadline, photos = []) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase
    .from('user_tasks')
    .insert({ 
      title, 
      description, 
      deadline: deadline ? deadline : null, 
      photos, 
      completed: false,
      user_id: session.user.id 
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding task:', error);
    alert('Gagal menyimpan tugas: ' + error.message);
    return null;
  }
  return data;
}

export async function updateTask(id, updates) {
  const { data, error } = await supabase
    .from('user_tasks')
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

export async function deleteTask(id) {
  await supabase.from('user_tasks').delete().eq('id', id);
}

export async function toggleTask(id, completed) {
  const { data, error } = await supabase
    .from('user_tasks')
    .update({ 
      completed, 
      completed_at: completed ? new Date().toISOString() : null 
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error toggling task:', error);
    return null;
  }
  return data;
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

export async function getTransactionsByDateRange(startDateKey, endDateKey) {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .gte('date_key', startDateKey)
    .lte('date_key', endDateKey)
    .order('date_key', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching transactions by date range:', error);
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
  if (error) console.error('Error deleting transaction:', error);
}

export async function updateTransaction(id, updates) {
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating transaction:', error);
    return null;
  }
  return data;
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

export async function deleteAccount() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return { error: new Error('Tidak ada sesi aktif') };

  const userId = session.user.id;

  try {
    await Promise.allSettled([
      supabase.from('user_tasks').delete().eq('user_id', userId),
      supabase.from('schedules').delete().eq('user_id', userId),
      supabase.from('transactions').delete().eq('user_id', userId),
      supabase.from('custom_categories').delete().eq('user_id', userId),
      supabase.from('profiles').delete().eq('id', userId),
      supabase.from('user_follows').delete().eq('follower_id', userId),
      supabase.from('user_follows').delete().eq('following_id', userId),
    ]);

    await supabase.auth.signOut();
    return { success: true };
  } catch (err) {
    console.error('Error deleting account:', err);
    return { error: err };
  }
}

// ==========================================
// FOLLOWERS & FOLLOWING
// ==========================================
const LOCAL_FOLLOWS_KEY = 'daily_user_follows';

function getLocalFollows() {
  try {
    const raw = localStorage.getItem(LOCAL_FOLLOWS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalFollows(follows) {
  try {
    localStorage.setItem(LOCAL_FOLLOWS_KEY, JSON.stringify(follows));
  } catch (e) {
    console.error('Failed to save follows locally', e);
  }
}

/**
 * Get all profiles for discovery
 */
export async function getDiscoverProfiles() {
  const { data: { session } } = await supabase.auth.getSession();
  const currentUserId = session?.user?.id;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, updated_at');

    if (!error && data) {
      return data.filter(p => p.id !== currentUserId);
    }
  } catch (err) {
    console.warn('Error fetching profiles from supabase:', err);
  }

  // Fallback to local follows known users
  const local = getLocalFollows();
  const known = [];
  local.forEach(f => {
    if (f.following_id !== currentUserId && !known.some(k => k.id === f.following_id)) {
      known.push({ id: f.following_id, display_name: f.following_name || 'Pengguna', avatar_url: f.following_avatar || null });
    }
    if (f.follower_id !== currentUserId && !known.some(k => k.id === f.follower_id)) {
      known.push({ id: f.follower_id, display_name: f.follower_name || 'Pengguna', avatar_url: f.follower_avatar || null });
    }
  });
  return known;
}

/**
 * Get followers list for a user
 */
export async function getFollowers(userId) {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('user_follows')
      .select('follower_id, created_at')
      .eq('following_id', userId);

    if (!error && data && data.length > 0) {
      const followerIds = data.map(d => d.follower_id);
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', followerIds);

      return (profs || []).map(p => ({
        ...p,
        followed_at: data.find(d => d.follower_id === p.id)?.created_at
      }));
    }
  } catch (err) {
    console.warn('Supabase follows query fallback to local:', err);
  }

  // Fallback to LocalStorage
  const localFollows = getLocalFollows();
  return localFollows
    .filter(f => f.following_id === userId)
    .map(f => ({
      id: f.follower_id,
      display_name: f.follower_name || 'Pengguna',
      avatar_url: f.follower_avatar || null,
      followed_at: f.created_at
    }));
}

/**
 * Get list of users that userId is following
 */
export async function getFollowing(userId) {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('user_follows')
      .select('following_id, created_at')
      .eq('follower_id', userId);

    if (!error && data && data.length > 0) {
      const followingIds = data.map(d => d.following_id);
      const { data: profs } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .in('id', followingIds);

      return (profs || []).map(p => ({
        ...p,
        followed_at: data.find(d => d.following_id === p.id)?.created_at
      }));
    }
  } catch (err) {
    console.warn('Supabase following query fallback to local:', err);
  }

  // Fallback to LocalStorage
  const localFollows = getLocalFollows();
  return localFollows
    .filter(f => f.follower_id === userId)
    .map(f => ({
      id: f.following_id,
      display_name: f.following_name || 'Pengguna',
      avatar_url: f.following_avatar || null,
      followed_at: f.created_at
    }));
}

/**
 * Follow a user
 */
export async function followUser(targetUser) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return { error: 'No session' };

  const currentUserId = session.user.id;
  const targetId = typeof targetUser === 'string' ? targetUser : targetUser.id;
  if (currentUserId === targetId) return { error: 'Tidak dapat mengikuti diri sendiri' };

  const currentUserName = session.user.user_metadata?.username || 'Saya';
  const targetName = typeof targetUser === 'object' ? targetUser.display_name : 'Pengguna';
  const targetAvatar = typeof targetUser === 'object' ? targetUser.avatar_url : null;

  // Try Supabase first
  try {
    const { data, error } = await supabase
      .from('user_follows')
      .insert({ follower_id: currentUserId, following_id: targetId })
      .select()
      .maybeSingle();

    if (!error) {
      return { success: true, data };
    }
  } catch (err) {
    console.warn('Supabase follow error, saving locally:', err);
  }

  // LocalStorage fallback
  const localFollows = getLocalFollows();
  const alreadyFollows = localFollows.some(f => f.follower_id === currentUserId && f.following_id === targetId);
  if (!alreadyFollows) {
    localFollows.push({
      id: `${currentUserId}_${targetId}`,
      follower_id: currentUserId,
      follower_name: currentUserName,
      following_id: targetId,
      following_name: targetName,
      following_avatar: targetAvatar,
      created_at: new Date().toISOString()
    });
    saveLocalFollows(localFollows);
  }
  return { success: true };
}

/**
 * Unfollow a user
 */
export async function unfollowUser(targetUserId) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.id) return { error: 'No session' };

  const currentUserId = session.user.id;

  // Try Supabase
  try {
    await supabase
      .from('user_follows')
      .delete()
      .eq('follower_id', currentUserId)
      .eq('following_id', targetUserId);
  } catch (err) {
    console.warn('Supabase unfollow error:', err);
  }

  // LocalStorage fallback
  const localFollows = getLocalFollows();
  const filtered = localFollows.filter(f => !(f.follower_id === currentUserId && f.following_id === targetUserId));
  saveLocalFollows(filtered);
  return { success: true };
}

