import { supabase } from './supabase';

// Helper to convert Username/HP into a valid virtual email for Supabase Auth
const formatIdentifier = (identifier) => {
  if (identifier.includes('@')) return identifier;
  // Remove spaces and special characters for a clean virtual email
  const cleanId = identifier.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return `${cleanId}@dailymanager.app`;
};

/**
 * Register a new user
 * @param {string} identifier (Username or Phone)
 * @param {string} password 
 * @param {string} username (Display Name)
 * @returns {Promise<{user: object|null, error: Error|null}>}
 */
export async function register(identifier, password, username) {
  const email = formatIdentifier(identifier);
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
 * @param {string} identifier (Username or Phone)
 * @param {string} password 
 * @returns {Promise<{user: object|null, error: Error|null}>}
 */
export async function login(identifier, password) {
  const email = formatIdentifier(identifier);
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
