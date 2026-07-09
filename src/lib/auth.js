import { supabase } from './supabase';

/**
 * Register a new user
 * @param {string} email 
 * @param {string} password 
 * @param {string} username 
 * @returns {Promise<{user: object|null, error: Error|null}>}
 */
export async function register(email, password, username) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: username,
      },
    },
  });
  return { user: data?.user, error };
}

/**
 * Login an existing user
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{user: object|null, error: Error|null}>}
 */
export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { user: data?.user, error };
}

/**
 * Log out the current user
 */
export async function logout() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Get the current session
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { session: data?.session, error };
}

/**
 * Listen to auth state changes
 * @param {function} callback 
 */
export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session);
  });
}
