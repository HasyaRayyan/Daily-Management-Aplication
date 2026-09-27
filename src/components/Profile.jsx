import { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import Header from './Header';
import Spinner from './Spinner';
import { 
  getProfile, 
  updateProfile, 
  uploadFile, 
  getCustomCategories, 
  addCustomCategory, 
  deleteCustomCategory, 
  deleteAccount,
  getTasks
} from '../utils/storage';
import { logout, sendPasswordResetOtp, updatePassword } from '../lib/auth';

// Icons
const IconShield = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconUser = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconKey = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7.5" cy="15.5" r="5.5" />
    <path d="m21 2-9.6 9.6" />
    <path d="m15.5 7.5 3 3L22 7l-3-3" />
  </svg>
);

const IconSliders = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="4" y1="21" x2="4" y2="14" />
    <line x1="4" y1="10" x2="4" y2="3" />
    <line x1="12" y1="21" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12" y2="3" />
    <line x1="20" y1="21" x2="20" y2="16" />
    <line x1="20" y1="12" x2="20" y2="3" />
    <line x1="1" y1="14" x2="7" y2="14" />
    <line x1="9" y1="8" x2="15" y2="8" />
    <line x1="17" y1="16" x2="23" y2="16" />
  </svg>
);

const IconAlertTriangle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const IconMail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const IconCamera = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const IconEdit = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const IconCopy = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
  </svg>
);

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconCheckCircle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const IconLogout = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const IconTrash = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const IconSun = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const IconMoon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const IconEye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

const IconSparkles = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
  </svg>
);

const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconCalendar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default function Profile({ session, onBack }) {
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Tab: 'account' | 'security' | 'preferences' | 'danger'
  const [activeTab, setActiveTab] = useState('account');

  // Toast Notification State
  const [toast, setToast] = useState(null);
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Name Modal State
  const [showNameModal, setShowNameModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);

  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passError, setPassError] = useState(null);
  const [passSuccess, setPassSuccess] = useState(null);
  const [sendingResetLink, setSendingResetLink] = useState(false);

  // Delete Account Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Logout Confirmation Modal
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Category Manager State
  const [categoryType, setCategoryType] = useState('expense');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [catLoading, setCatLoading] = useState(false);

  // Copy User ID feedback
  const [copiedId, setCopiedId] = useState(false);

  const fileInputRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profData, taskData, catData] = await Promise.all([
        getProfile(),
        getTasks().catch(() => []),
        getCustomCategories().catch(() => [])
      ]);
      setProfile(profData);
      setTasks(taskData || []);
      setCustomCategories(catData || []);
    } catch (err) {
      console.error('Error loading profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Update Display Name
  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!newName.trim() || savingName) return;
    setSavingName(true);
    await updateProfile({ display_name: newName.trim() });
    setShowNameModal(false);
    await fetchData();
    setSavingName(false);
    showToast('Nama lengkap berhasil diperbarui!');
  };

  // Avatar Upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    try {
      const ext = file.name.split('.').pop();
      const filename = `${session.user.id}_avatar_${Date.now()}.${ext}`;
      const url = await uploadFile('uploads', `avatars/${filename}`, file);
      
      if (url) {
        await updateProfile({ avatar_url: url });
        await fetchData();
        showToast('Foto profil berhasil diperbarui!');
      } else {
        showToast('Gagal mengunggah foto profil', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Terjadi kesalahan saat unggah foto', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Remove Avatar
  const handleRemoveAvatar = async () => {
    if (!window.confirm('Hapus foto profil dan gunakan inisial nama?')) return;
    setLoading(true);
    await updateProfile({ avatar_url: null });
    await fetchData();
    setLoading(false);
    showToast('Foto profil telah dihapus');
  };

  // Direct Update Password
  const handleDirectPasswordChange = async (e) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPassword.length < 6) {
      setPassError('Kata sandi harus minimal 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setSavingPassword(true);
    const { error } = await updatePassword(newPassword);
    if (error) {
      setPassError(error.message);
    } else {
      setPassSuccess('Kata sandi berhasil diperbarui!');
      showToast('Kata sandi berhasil diperbarui!');
      setTimeout(() => {
        setShowPasswordModal(false);
        setNewPassword('');
        setConfirmPassword('');
        setPassSuccess(null);
      }, 1500);
    }
    setSavingPassword(false);
  };

  // Send Password Reset Link to Email
  const handleSendResetEmail = async () => {
    setSendingResetLink(true);
    setPassError(null);
    const { error } = await sendPasswordResetOtp(session.user.email);
    if (error) {
      setPassError(`Gagal mengirim tautan: ${error.message}`);
      showToast(`Gagal mengirim: ${error.message}`, 'error');
    } else {
      const msg = 'Tautan reset kata sandi telah dikirim ke email Anda! Periksa kotak masuk atau spam.';
      setPassSuccess(msg);
      showToast(msg, 'success');
    }
    setSendingResetLink(false);
  };

  // Delete Account
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'HAPUS') return;
    setDeletingAccount(true);
    const result = await deleteAccount();
    if (result?.error) {
      alert(`Gagal menghapus akun: ${result.error.message}`);
      setDeletingAccount(false);
    } else {
      alert('Akun dan seluruh data Anda telah berhasil dihapus.');
      window.location.reload();
    }
  };

  // Theme Management
  const [isDarkMode, setIsDarkMode] = useState(
    typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );

  const setThemeMode = (dark) => {
    if (dark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
      showToast('Mode Gelap diaktifkan');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
      showToast('Mode Terang diaktifkan');
    }
  };

  // Custom Categories
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim() || catLoading) return;
    setCatLoading(true);
    await addCustomCategory(categoryType, newCategoryName.trim());
    setNewCategoryName('');
    const cats = await getCustomCategories();
    setCustomCategories(cats || []);
    setCatLoading(false);
    showToast('Kategori baru berhasil ditambahkan');
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Yakin hapus kategori ini? Transaksi lama tidak akan terhapus.")) return;
    setCatLoading(true);
    await deleteCustomCategory(id);
    const cats = await getCustomCategories();
    setCustomCategories(cats || []);
    setCatLoading(false);
    showToast('Kategori telah dihapus');
  };

  // Copy User ID
  const handleCopyId = () => {
    if (session?.user?.id) {
      navigator.clipboard.writeText(session.user.id);
      setCopiedId(true);
      showToast('User ID berhasil disalin ke papan klip!');
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // Helper date formatting
  const formatIndoDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const d = new Date(dateString);
      const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
      return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    } catch {
      return dateString;
    }
  };

  const formatLastSignIn = (dateString) => {
    if (!dateString) return 'Sesi ini';
    try {
      const d = new Date(dateString);
      return d.toLocaleString('id-ID', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } catch {
      return '-';
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: 'Belum diisi', color: 'bg-brand-200 dark:bg-brand-800' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, text: 'Lemah', color: 'bg-red-500' };
    if (score <= 2) return { score: 2, text: 'Sedang', color: 'bg-amber-500' };
    return { score: 3, text: 'Kuat', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(newPassword);

  const displayName = profile?.display_name || session?.user?.user_metadata?.username || 'Pengguna';
  const avatarUrl = profile?.avatar_url;
  const userEmail = session?.user?.email || '-';
  const joinDate = session?.user?.created_at ? formatIndoDate(session.user.created_at) : 'Baru saja';
  const lastLogin = session?.user?.last_sign_in_at ? formatLastSignIn(session.user.last_sign_in_at) : 'Hari ini';

  // Stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const taskPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const totalCustomCats = customCategories.length;

  return (
    <div className="flex flex-col gap-6 px-4 sm:px-6 pt-6 pb-28 md:pb-12 animate-fade-in max-w-4xl mx-auto w-full">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[300] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-down border text-sm font-bold backdrop-blur-xl ${
          toast.type === 'error'
            ? 'bg-red-950/90 text-red-100 border-red-800 shadow-red-950/30'
            : 'bg-brand-950/90 dark:bg-white/95 text-white dark:text-brand-950 border-brand-800 dark:border-white/50 shadow-brand-950/20'
        }`}>
          {toast.type === 'error' ? (
            <span className="text-red-400"><IconAlertTriangle /></span>
          ) : (
            <span className="text-emerald-400 dark:text-emerald-600"><IconCheckCircle /></span>
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <Header title="Profil Saya" onBack={onBack} />

      {loading && !profile ? (
        <div className="flex flex-col items-center justify-center py-28 gap-4">
          <Spinner size="md" />
          <p className="text-sm font-semibold text-brand-400 animate-pulse">Memuat data profil...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">

          {/* ============================================================ */}
          {/* HERO BANNER PROFILE CARD */}
          {/* ============================================================ */}
          <div className="w-full relative rounded-[2rem] bg-gradient-to-b from-white via-white to-brand-50/80 dark:from-brand-900 dark:via-brand-900 dark:to-brand-950 border border-brand-200/80 dark:border-brand-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.25)] overflow-hidden">
            
            {/* Top Decorative Gradient Mesh / Cover Banner */}
            <div className="h-32 sm:h-36 w-full relative overflow-hidden bg-gradient-to-r from-brand-950 via-brand-800 to-brand-900 dark:from-black dark:via-brand-950 dark:to-brand-900">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white via-transparent to-transparent pointer-events-none" />
              <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              <div className="absolute top-4 left-6 text-white/40 flex items-center gap-2 text-xs font-black tracking-widest uppercase">
                <IconSparkles />
                <span>Daily Assistant Account</span>
              </div>
            </div>

            {/* Avatar & Identity Info */}
            <div className="px-6 sm:px-8 pb-7 pt-0 relative flex flex-col items-center text-center">
              
              {/* Floating Avatar */}
              <div className="relative -mt-16 sm:-mt-20 mb-4 group">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-brand-200 to-brand-100 dark:from-brand-800 dark:to-brand-700 flex items-center justify-center font-black text-4xl sm:text-5xl text-brand-950 dark:text-white shadow-xl overflow-hidden ring-4 ring-white dark:ring-brand-900 border-2 border-brand-200/60 dark:border-brand-700">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <span>{displayName.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                {/* Online status indicator */}
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-brand-900 flex items-center justify-center shadow-sm" title="Akun Aktif">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping opacity-75" />
                </div>

                {/* Change Avatar Button */}
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Ubah Foto Profil"
                  className="absolute bottom-1 right-1 bg-brand-950 dark:bg-white text-white dark:text-brand-950 rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all border-2 border-white dark:border-brand-900 cursor-pointer"
                >
                  <IconCamera />
                </button>
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={handleAvatarChange}
                />
              </div>

              {/* Name & Quick Edit */}
              <div className="flex items-center justify-center gap-2 mb-1">
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-950 dark:text-white">
                  {displayName}
                </h1>
                <button
                  type="button"
                  onClick={() => { setNewName(displayName); setShowNameModal(true); }}
                  className="p-1.5 rounded-full text-brand-400 hover:text-brand-900 dark:hover:text-white hover:bg-brand-100 dark:hover:bg-brand-800 transition-colors"
                  title="Ubah Nama"
                >
                  <IconEdit />
                </button>
              </div>

              {/* Email & Join Badge */}
              <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-100/70 dark:bg-brand-800/60 text-xs font-semibold text-brand-700 dark:text-brand-300 border border-brand-200/50 dark:border-brand-700">
                  <span className="text-emerald-500"><IconCheckCircle /></span>
                  <span>{userEmail}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-xs font-medium text-brand-500 dark:text-brand-400 border border-brand-200/60 dark:border-brand-800">
                  <IconCalendar />
                  <span>Bergabung {joinDate}</span>
                </div>
              </div>

              {/* Quick Stat Highlights */}
              <div className="w-full grid grid-cols-3 gap-2 sm:gap-4 pt-5 border-t border-brand-100 dark:border-brand-800">
                <div className="flex flex-col items-center p-3 rounded-2xl bg-brand-50/70 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800/80">
                  <span className="text-xs font-semibold text-brand-400 dark:text-brand-500 uppercase tracking-wider">Tugas Selesai</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl sm:text-2xl font-black text-brand-950 dark:text-white">{completedTasks}</span>
                    <span className="text-xs font-bold text-brand-400">/{totalTasks}</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{taskPercent}% Beres</span>
                </div>

                <div className="flex flex-col items-center p-3 rounded-2xl bg-brand-50/70 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800/80">
                  <span className="text-xs font-semibold text-brand-400 dark:text-brand-500 uppercase tracking-wider">Kategori</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-xl sm:text-2xl font-black text-brand-950 dark:text-white">{totalCustomCats}</span>
                    <span className="text-xs font-bold text-brand-400">kustom</span>
                  </div>
                  <span className="text-[11px] font-bold text-brand-500 dark:text-brand-400 mt-0.5">Keuangan</span>
                </div>

                <div className="flex flex-col items-center p-3 rounded-2xl bg-brand-50/70 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800/80">
                  <span className="text-xs font-semibold text-brand-400 dark:text-brand-500 uppercase tracking-wider">Status Akun</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400">Aktif</span>
                  </div>
                  <span className="text-[11px] font-medium text-brand-400 mt-0.5">Terverifikasi</span>
                </div>
              </div>

            </div>

          </div>

          {/* ============================================================ */}
          {/* SEGMENTED TAB NAVIGATION */}
          {/* ============================================================ */}
          <div className="w-full flex items-center p-1.5 bg-brand-100/80 dark:bg-brand-900/80 backdrop-blur-md rounded-2xl border border-brand-200/60 dark:border-brand-800 overflow-x-auto scrollbar-none">
            
            <button
              type="button"
              onClick={() => setActiveTab('account')}
              className={`flex-1 min-w-[90px] py-3 px-3 sm:px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'account'
                  ? 'bg-white dark:bg-brand-950 text-brand-950 dark:text-white shadow-sm scale-[1.02]'
                  : 'text-brand-500 dark:text-brand-400 hover:text-brand-900 dark:hover:text-white'
              }`}
            >
              <IconUser />
              <span>Akun</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('security')}
              className={`flex-1 min-w-[100px] py-3 px-3 sm:px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'security'
                  ? 'bg-white dark:bg-brand-950 text-brand-950 dark:text-white shadow-sm scale-[1.02]'
                  : 'text-brand-500 dark:text-brand-400 hover:text-brand-900 dark:hover:text-white'
              }`}
            >
              <IconShield />
              <span>Keamanan</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preferences')}
              className={`flex-1 min-w-[110px] py-3 px-3 sm:px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'preferences'
                  ? 'bg-white dark:bg-brand-950 text-brand-950 dark:text-white shadow-sm scale-[1.02]'
                  : 'text-brand-500 dark:text-brand-400 hover:text-brand-900 dark:hover:text-white'
              }`}
            >
              <IconSliders />
              <span>Preferensi</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('danger')}
              className={`flex-1 min-w-[110px] py-3 px-3 sm:px-4 rounded-xl flex items-center justify-center gap-2 text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                activeTab === 'danger'
                  ? 'bg-red-600 text-white shadow-sm scale-[1.02]'
                  : 'text-red-500/80 hover:text-red-600 dark:text-red-400/80 dark:hover:text-red-300'
              }`}
            >
              <IconAlertTriangle />
              <span>Zona Bahaya</span>
            </button>

          </div>

          {/* ============================================================ */}
          {/* TAB 1: INFORMASI AKUN */}
          {/* ============================================================ */}
          {activeTab === 'account' && (
            <div className="flex flex-col gap-4 animate-fade-in">
              
              {/* Account Detail Cards */}
              <div className="bg-white dark:bg-brand-900 rounded-3xl p-6 border border-brand-100 dark:border-brand-800 shadow-sm flex flex-col gap-5">
                <div className="flex items-center justify-between pb-3 border-b border-brand-100 dark:border-brand-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-800 flex items-center justify-center text-brand-900 dark:text-white">
                      <IconUser />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-brand-950 dark:text-white">Detail Pengguna</h3>
                      <p className="text-xs text-brand-400">Informasi identitas akun dan profil Anda</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Nama Lengkap */}
                  <div className="p-4 rounded-2xl bg-brand-50/70 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-brand-400 dark:text-brand-500 uppercase tracking-wider">Nama Lengkap</span>
                      <p className="text-base font-bold text-brand-950 dark:text-white mt-0.5">{displayName}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setNewName(displayName); setShowNameModal(true); }}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-brand-800 border border-brand-200 dark:border-brand-700 text-xs font-bold hover:bg-brand-100 dark:hover:bg-brand-700 transition-colors cursor-pointer"
                    >
                      Ubah
                    </button>
                  </div>

                  {/* Email */}
                  <div className="p-4 rounded-2xl bg-brand-50/70 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-brand-400 dark:text-brand-500 uppercase tracking-wider">Email Utama</span>
                      <p className="text-base font-bold text-brand-950 dark:text-white mt-0.5">{userEmail}</p>
                    </div>
                    <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1">
                      <IconCheck />
                    </span>
                  </div>

                  {/* User ID */}
                  <div className="p-4 rounded-2xl bg-brand-50/70 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800 flex items-center justify-between">
                    <div className="overflow-hidden pr-2">
                      <span className="text-[11px] font-bold text-brand-400 dark:text-brand-500 uppercase tracking-wider">User ID</span>
                      <p className="text-xs font-mono font-semibold text-brand-700 dark:text-brand-300 mt-1 truncate max-w-[200px] sm:max-w-xs">
                        {session?.user?.id}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyId}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-brand-800 border border-brand-200 dark:border-brand-700 text-xs font-bold hover:bg-brand-100 dark:hover:bg-brand-700 transition-colors cursor-pointer shrink-0"
                    >
                      {copiedId ? <IconCheck /> : <IconCopy />}
                      <span>{copiedId ? 'Tersalin' : 'Salin'}</span>
                    </button>
                  </div>

                  {/* Terakhir Masuk */}
                  <div className="p-4 rounded-2xl bg-brand-50/70 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-brand-400 dark:text-brand-500 uppercase tracking-wider">Terakhir Masuk</span>
                      <p className="text-sm font-bold text-brand-950 dark:text-white mt-0.5 flex items-center gap-1.5">
                        <IconClock />
                        <span>{lastLogin}</span>
                      </p>
                    </div>
                  </div>

                </div>

                {/* Avatar Quick Options */}
                <div className="mt-2 pt-4 border-t border-brand-100 dark:border-brand-800 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-brand-500">
                    Format gambar avatar yang didukung: JPG, PNG, WEBP (Maks 5MB)
                  </div>
                  <div className="flex gap-2">
                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                      >
                        Hapus Foto Profil
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-brand-950 dark:bg-white text-white dark:text-brand-950 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5"
                    >
                      <IconCamera />
                      <span>Ganti Foto</span>
                    </button>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: KEAMANAN */}
          {/* ============================================================ */}
          {activeTab === 'security' && (
            <div className="flex flex-col gap-4 animate-fade-in">
              
              {/* Password Management Card */}
              <div className="bg-white dark:bg-brand-900 rounded-3xl p-6 border border-brand-100 dark:border-brand-800 shadow-sm flex flex-col gap-5">
                <div className="flex items-center justify-between pb-3 border-b border-brand-100 dark:border-brand-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-800 flex items-center justify-center text-brand-900 dark:text-white">
                      <IconKey />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-brand-950 dark:text-white">Kata Sandi & Akses</h3>
                      <p className="text-xs text-brand-400">Atur kredensial keamanan masuk akun Anda</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
                    Terenkripsi
                  </span>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-brand-50/70 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-900 dark:text-white shrink-0 shadow-xs">
                      <IconKey />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-950 dark:text-white">Kata Sandi Akun</p>
                      <p className="text-xs text-brand-500 mt-0.5">••••••••••••••••</p>
                      <p className="text-[11px] text-brand-400 mt-1">Gunakan kombinasi sandi yang unik untuk perlindungan maksimal</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setNewPassword('');
                      setConfirmPassword('');
                      setPassError(null);
                      setPassSuccess(null);
                      setShowPasswordModal(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-brand-950 dark:bg-white text-white dark:text-brand-950 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer shrink-0 shadow-sm"
                  >
                    Ganti Kata Sandi
                  </button>
                </div>

                {/* Email Reset Link Option */}
                <div className="p-4 sm:p-5 rounded-2xl bg-brand-50/70 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-brand-900 dark:text-white shrink-0 shadow-xs">
                      <IconMail />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-950 dark:text-white">Kirim Tautan Reset ke Email</p>
                      <p className="text-xs text-brand-500 mt-0.5">Tautan reset aman akan dikirim ke <span className="font-semibold">{userEmail}</span></p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendResetEmail}
                    disabled={sendingResetLink}
                    className="px-4 py-2.5 rounded-xl bg-white dark:bg-brand-800 text-brand-950 dark:text-white border border-brand-200 dark:border-brand-700 text-xs font-bold hover:bg-brand-100 dark:hover:bg-brand-700 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                  >
                    {sendingResetLink ? 'Mengirim...' : 'Kirim Link Reset'}
                  </button>
                </div>

                {/* Security Advisory */}
                <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 text-xs">
                  <div className="mt-0.5 text-emerald-600 dark:text-emerald-400 shrink-0">
                    <IconShield />
                  </div>
                  <p className="leading-relaxed">
                    Sesi autentikasi Anda dilindungi dengan standar protokol Supabase OAuth 2.0 / JWT. Seluruh pertukaran data dilindungi oleh enkripsi TLS 1.3.
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 3: PREFERENSI */}
          {/* ============================================================ */}
          {activeTab === 'preferences' && (
            <div className="flex flex-col gap-6 animate-fade-in">
              
              {/* Theme Selector Card */}
              <div className="bg-white dark:bg-brand-900 rounded-3xl p-6 border border-brand-100 dark:border-brand-800 shadow-sm flex flex-col gap-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-brand-100 dark:border-brand-800">
                  <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-800 flex items-center justify-center text-brand-900 dark:text-white">
                    <IconSliders />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-brand-950 dark:text-white">Tampilan Tema</h3>
                    <p className="text-xs text-brand-400">Pilih tema antarmuka sesuai kenyamanan mata Anda</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Light Theme Card */}
                  <button
                    type="button"
                    onClick={() => setThemeMode(false)}
                    className={`p-5 rounded-2xl border-2 flex flex-col gap-3 text-left transition-all duration-200 cursor-pointer ${
                      !isDarkMode
                        ? 'border-brand-950 dark:border-white bg-brand-50 dark:bg-brand-800/80 shadow-md ring-2 ring-brand-950/10'
                        : 'border-brand-200 dark:border-brand-800 bg-white dark:bg-brand-900 hover:border-brand-300 dark:hover:border-brand-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shadow-xs">
                        <IconSun />
                      </div>
                      {!isDarkMode && (
                        <span className="w-6 h-6 rounded-full bg-brand-950 text-white flex items-center justify-center text-xs">
                          <IconCheck />
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-brand-950 dark:text-white">Mode Terang (Light)</h4>
                      <p className="text-xs text-brand-500 mt-1">Latar belakang bersih dan kontras tinggi untuk siang hari</p>
                    </div>
                  </button>

                  {/* Dark Theme Card */}
                  <button
                    type="button"
                    onClick={() => setThemeMode(true)}
                    className={`p-5 rounded-2xl border-2 flex flex-col gap-3 text-left transition-all duration-200 cursor-pointer ${
                      isDarkMode
                        ? 'border-brand-950 dark:border-white bg-brand-50 dark:bg-brand-800/80 shadow-md ring-2 ring-white/10'
                        : 'border-brand-200 dark:border-brand-800 bg-white dark:bg-brand-900 hover:border-brand-300 dark:hover:border-brand-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-xl bg-indigo-900 text-indigo-200 flex items-center justify-center shadow-xs">
                        <IconMoon />
                      </div>
                      {isDarkMode && (
                        <span className="w-6 h-6 rounded-full bg-white text-brand-950 flex items-center justify-center text-xs">
                          <IconCheck />
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-brand-950 dark:text-white">Mode Gelap (Dark)</h4>
                      <p className="text-xs text-brand-500 mt-1">Nuansa gelap monokromatik yang nyaman untuk mata di malam hari</p>
                    </div>
                  </button>

                </div>
              </div>

              {/* Custom Financial Categories */}
              <div className="bg-white dark:bg-brand-900 rounded-3xl p-6 border border-brand-100 dark:border-brand-800 shadow-sm flex flex-col gap-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-brand-100 dark:border-brand-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-800 flex items-center justify-center text-brand-900 dark:text-white">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-brand-950 dark:text-white">Kategori Keuangan Kustom</h3>
                      <p className="text-xs text-brand-400">Tambah kategori pengeluaran & pemasukan sesuai kebutuhan Anda</p>
                    </div>
                  </div>

                  {/* Type Filter */}
                  <div className="flex p-1 bg-brand-100 dark:bg-brand-800 rounded-xl self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setCategoryType('expense')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        categoryType === 'expense'
                          ? 'bg-white dark:bg-brand-950 text-brand-950 dark:text-white shadow-xs'
                          : 'text-brand-500 hover:text-brand-900 dark:hover:text-white'
                      }`}
                    >
                      Pengeluaran ({customCategories.filter(c => c.type === 'expense').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryType('income')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        categoryType === 'income'
                          ? 'bg-white dark:bg-brand-950 text-brand-950 dark:text-white shadow-xs'
                          : 'text-brand-500 hover:text-brand-900 dark:hover:text-white'
                      }`}
                    >
                      Pemasukan ({customCategories.filter(c => c.type === 'income').length})
                    </button>
                  </div>
                </div>

                {/* Add Category Form */}
                <form onSubmit={handleAddCategory} className="flex gap-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder={`Tambah kategori ${categoryType === 'expense' ? 'pengeluaran' : 'pemasukan'} baru...`}
                    className="flex-1 px-4 py-3 rounded-xl bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 text-sm focus:border-brand-950 dark:focus:border-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!newCategoryName.trim() || catLoading}
                    className="px-5 py-3 rounded-xl bg-brand-950 dark:bg-white text-white dark:text-brand-950 text-xs font-bold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <IconPlus />
                    <span>Tambah</span>
                  </button>
                </form>

                {/* Category List */}
                <div className="flex flex-col gap-2 min-h-[100px]">
                  {catLoading && customCategories.length === 0 ? (
                    <div className="py-8 flex justify-center"><Spinner size="sm" /></div>
                  ) : customCategories.filter(c => c.type === categoryType).length === 0 ? (
                    <div className="py-8 px-4 text-center rounded-2xl border border-dashed border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-950/30">
                      <p className="text-xs font-bold text-brand-400">Belum ada kategori kustom untuk {categoryType === 'expense' ? 'pengeluaran' : 'pemasukan'}.</p>
                      <p className="text-[11px] text-brand-400/80 mt-1">Kategori bawaan sistem tetap tersedia saat mencatat transaksi.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {customCategories
                        .filter(c => c.type === categoryType)
                        .map((cat) => (
                          <div 
                            key={cat.id} 
                            className="p-3.5 rounded-2xl bg-brand-50/70 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800 flex items-center justify-between gap-3 group"
                          >
                            <div className="flex items-center gap-2.5">
                              <span className="w-8 h-8 rounded-lg bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 flex items-center justify-center text-xs">
                                🏷️
                              </span>
                              <span className="text-sm font-bold text-brand-950 dark:text-white">{cat.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-brand-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                              title="Hapus Kategori"
                            >
                              <IconTrash />
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

              </div>

              {/* App Info Box */}
              <div className="p-5 rounded-3xl bg-brand-50/70 dark:bg-brand-900/40 border border-brand-200/60 dark:border-brand-800/80 flex items-center justify-between text-xs">
                <div>
                  <p className="font-extrabold text-brand-950 dark:text-white">Daily Management Application</p>
                  <p className="text-brand-400 mt-0.5">Versi {import.meta.env.VITE_APP_VERSION || '1.0.0'} • Powered by Supabase & React</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-brand-200/70 dark:bg-brand-800 text-brand-700 dark:text-brand-300 font-bold">
                  Release v{import.meta.env.VITE_APP_VERSION || '1.0.0'}
                </div>
              </div>

            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 4: ZONA BAHAYA */}
          {/* ============================================================ */}
          {activeTab === 'danger' && (
            <div className="flex flex-col gap-4 animate-fade-in">
              
              {/* Danger Box */}
              <div className="bg-red-50/40 dark:bg-red-950/20 rounded-3xl p-6 border border-red-200 dark:border-red-900/60 shadow-sm flex flex-col gap-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-red-200 dark:border-red-900/60">
                  <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-red-600 dark:text-red-400">
                    <IconAlertTriangle />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-red-700 dark:text-red-400">Zona Bahaya (Danger Zone)</h3>
                    <p className="text-xs text-red-600/70 dark:text-red-400/60">Tindakan berikut dapat mengakhiri sesi atau menghapus data Anda</p>
                  </div>
                </div>

                {/* 1. Log Out */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-brand-900/80 border border-red-100 dark:border-red-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                      <IconLogout />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-brand-950 dark:text-white">Keluar dari Akun (Log Out)</p>
                      <p className="text-xs text-brand-500 mt-0.5">Akhiri sesi saat ini. Anda dapat masuk kembali kapan saja dengan email & sandi Anda.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLogoutModal(true)}
                    className="px-5 py-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 text-xs font-bold hover:bg-amber-200 dark:hover:bg-amber-900/80 transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    Keluar Sesi
                  </button>
                </div>

                {/* 2. Permanent Account Deletion */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-brand-900/80 border border-red-200 dark:border-red-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-800 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                      <IconTrash />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-red-700 dark:text-red-400">Hapus Akun Permanen</p>
                      <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-0.5">
                        Menghapus seluruh tugas, jadwal harian, data keuangan, foto profil, dan kredensial secara permanen.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirmation('');
                      setShowDeleteModal(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    Hapus Akun
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* Version Footer */}
          <div className="mt-4 text-center text-xs font-bold text-brand-400 dark:text-brand-600">
            DAILY MANAGER • Versi {import.meta.env.VITE_APP_VERSION || '1.0.0'}
          </div>

        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: UBAH NAMA LENGKAP */}
      {/* ============================================================ */}
      <Modal isOpen={showNameModal} onClose={() => setShowNameModal(false)} title="Ubah Nama Lengkap">
        <form onSubmit={handleUpdateName} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-brand-600 dark:text-brand-400 tracking-wider">NAMA LENGKAP</label>
            <input
              type="text"
              className="input-field"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Masukkan nama lengkap baru"
              autoFocus
              required
            />
            <p className="text-[11px] text-brand-400">Nama ini akan ditampilkan pada sapaan beranda dan profil Anda.</p>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowNameModal(false)}
              className="flex-1 py-3.5 rounded-2xl bg-brand-100 dark:bg-brand-800 text-brand-950 dark:text-white font-bold text-xs hover:bg-brand-200 dark:hover:bg-brand-700 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button 
              type="submit" 
              className="flex-1 py-3.5 rounded-2xl bg-brand-950 dark:bg-white text-white dark:text-brand-950 font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50" 
              disabled={!newName.trim() || savingName}
            >
              {savingName ? 'Menyimpan...' : 'Simpan Nama Baru'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL: UBAH KATA SANDI */}
      {/* ============================================================ */}
      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Ubah Kata Sandi">
        <div className="flex flex-col gap-5">
          {passError && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold flex items-center gap-2">
              <IconAlertTriangle />
              <span>{passError}</span>
            </div>
          )}
          {passSuccess && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
              <IconCheckCircle />
              <span>{passSuccess}</span>
            </div>
          )}

          <form onSubmit={handleDirectPasswordChange} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-brand-700 dark:text-brand-300 tracking-wider">KATA SANDI BARU</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="input-field pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-brand-400 hover:text-brand-700 dark:hover:text-brand-200 cursor-pointer"
                >
                  {showPass ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>

              {/* Password strength indicator */}
              {newPassword && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-brand-100 dark:bg-brand-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${strength.color}`} 
                      style={{ width: `${(strength.score / 3) * 100}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-brand-500">Kekuatan: {strength.text}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-brand-700 dark:text-brand-300 tracking-wider">KONFIRMASI KATA SANDI</label>
              <input
                type={showPass ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ketik ulang kata sandi baru"
                className="input-field"
              />
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-[11px] text-red-500 font-semibold mt-0.5">Konfirmasi kata sandi belum cocok.</p>
              )}
            </div>

            {/* Checklist */}
            <div className="p-3 bg-brand-50 dark:bg-brand-950 rounded-xl border border-brand-200/60 dark:border-brand-800 text-[11px] flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className={newPassword.length >= 6 ? 'text-emerald-500 font-bold' : 'text-brand-400'}>
                  {newPassword.length >= 6 ? '✓' : '○'} Minimal 6 karakter
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className={confirmPassword && newPassword === confirmPassword ? 'text-emerald-500 font-bold' : 'text-brand-400'}>
                  {confirmPassword && newPassword === confirmPassword ? '✓' : '○'} Konfirmasi sandi cocok
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={savingPassword || newPassword.length < 6 || newPassword !== confirmPassword}
              className="btn-primary mt-2"
            >
              {savingPassword ? 'Menyimpan...' : 'Perbarui Kata Sandi Sekarang'}
            </button>
          </form>

          {/* Reset link fallback */}
          <div className="pt-3 border-t border-brand-200 dark:border-brand-800 text-center">
            <p className="text-xs text-brand-500 mb-1">Atau kirimkan tautan pemulihan ke surel:</p>
            <button
              type="button"
              onClick={handleSendResetEmail}
              disabled={sendingResetLink}
              className="text-xs font-bold text-brand-900 dark:text-white hover:underline cursor-pointer"
            >
              {sendingResetLink ? 'Mengirim link...' : 'Kirim Tautan Reset ke Email'}
            </button>
          </div>
        </div>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL: KONFIRMASI LOGOUT */}
      {/* ============================================================ */}
      <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} title="Konfirmasi Keluar">
        <div className="flex flex-col gap-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <IconLogout />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">Keluar dari Akun</h4>
              <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-0.5">
                Apakah Anda yakin ingin mengakhiri sesi aktif pada perangkat ini?
              </p>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowLogoutModal(false)}
              className="flex-1 py-3.5 rounded-2xl bg-brand-100 dark:bg-brand-800 text-brand-950 dark:text-white font-bold text-xs hover:bg-brand-200 dark:hover:bg-brand-700 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={() => logout()}
              className="flex-1 py-3.5 rounded-2xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 transition-colors cursor-pointer shadow-xs"
            >
              Ya, Keluar
            </button>
          </div>
        </div>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL: KONFIRMASI HAPUS AKUN PERMANEN */}
      {/* ============================================================ */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Hapus Akun Permanen">
        <div className="flex flex-col gap-4">
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-2xl flex items-start gap-3">
            <div className="text-red-500 shrink-0 mt-0.5">
              <IconAlertTriangle />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-700 dark:text-red-300">Peringatan: Tindakan ini permanen!</h4>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1 leading-relaxed">
                Seluruh data tugas, jadwal kalender, riwayat keuangan, kategori kustom, serta foto profil akan dihapus permanen dari server dan tidak dapat dikembalikan.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-brand-700 dark:text-brand-300">
              Ketik <span className="text-red-600 font-black">HAPUS</span> untuk mengonfirmasi:
            </label>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Ketik HAPUS"
              className="input-field border-red-200 dark:border-red-900 focus:border-red-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 py-3.5 rounded-2xl bg-brand-100 dark:bg-brand-800 text-brand-950 dark:text-white font-bold text-xs hover:bg-brand-200 dark:hover:bg-brand-700 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== 'HAPUS' || deletingAccount}
              className="flex-1 py-3.5 rounded-2xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {deletingAccount ? 'Menghapus...' : 'Hapus Akun Selamanya'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
