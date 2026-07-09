// Helper functions for Daily Manager

/**
 * Generate a unique ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

/**
 * Format number as Indonesian Rupiah
 * @param {number} amount
 * @returns {string}
 */
export function formatRupiah(amount) {
  const abs = Math.abs(amount);
  const formatted = new Intl.NumberFormat('id-ID').format(abs);
  return `Rp ${formatted}`;
}

/**
 * Format date to Indonesian locale
 * @param {Date|string} date
 * @returns {string}
 */
export function formatDateIndo(date) {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Format date short
 * @param {Date|string} date
 * @returns {string}
 */
export function formatDateShort(date) {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date;
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
    'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Get date key in YYYY-MM-DD format
 * @param {Date} date
 * @returns {string}
 */
export function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get today's date key
 * @returns {string}
 */
export function getTodayKey() {
  return getDateKey(new Date());
}

/**
 * Check if a dateKey is today
 * @param {string} dateKey
 * @returns {boolean}
 */
export function isToday(dateKey) {
  return dateKey === getTodayKey();
}

/**
 * Get current time string
 * @returns {string}
 */
export function getCurrentTime() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

/**
 * Expense categories
 */
export const EXPENSE_CATEGORIES = [
  { id: 'food', label: 'Makanan', icon: '🍔' },
  { id: 'transport', label: 'Transport', icon: '🚗' },
  { id: 'shopping', label: 'Belanja', icon: '🛍️' },
  { id: 'bills', label: 'Tagihan', icon: '📄' },
  { id: 'health', label: 'Kesehatan', icon: '💊' },
  { id: 'entertainment', label: 'Hiburan', icon: '🎮' },
  { id: 'education', label: 'Pendidikan', icon: '📚' },
  { id: 'other_expense', label: 'Lainnya', icon: '📌' },
];

/**
 * Income categories
 */
export const INCOME_CATEGORIES = [
  { id: 'salary', label: 'Gaji', icon: '💼' },
  { id: 'freelance', label: 'Freelance', icon: '💻' },
  { id: 'business', label: 'Bisnis', icon: '🏪' },
  { id: 'investment', label: 'Investasi', icon: '📈' },
  { id: 'gift', label: 'Hadiah', icon: '🎁' },
  { id: 'other_income', label: 'Lainnya', icon: '💫' },
];

/**
 * Get category info by ID
 */
export function getCategoryInfo(categoryId) {
  const allCategories = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];
  return allCategories.find(c => c.id === categoryId) || { label: 'Lainnya', icon: '📌' };
}
