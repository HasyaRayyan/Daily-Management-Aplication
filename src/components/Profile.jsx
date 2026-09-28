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
  deleteAccount 
} from '../utils/storage';
import { logout, sendPasswordResetOtp, updatePassword } from '../lib/auth';

// Functional Icons
const IconCamera = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
    <circle cx="12" cy="13" r="4"/>
  </svg>
);

const IconEdit = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
  </svg>
);

const IconCopy = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const IconEye = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const IconAlertTriangle = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export default function Profile({ session, onBack }) {
  const [profile, setProfile] = useState(null);
  const [customCategories, setCustomCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Current Active Section: null (shows Menu Buttons Hub) | 'account' | 'security' | 'preferences' | 'about' | 'danger'
  const [currentSection, setCurrentSection] = useState(null);

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

  // Logout Confirmation Modal State
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Category Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryType, setCategoryType] = useState('expense');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [catLoading, setCatLoading] = useState(false);

  // Copy User ID feedback
  const [copiedId, setCopiedId] = useState(false);

  const fileInputRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profData, catData] = await Promise.all([
        getProfile(),
        getCustomCategories().catch(() => [])
      ]);
      setProfile(profData);
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
  const totalCustomCats = customCategories.length;

  const sectionTitles = {
    account: 'Akun & Identitas',
    security: 'Keamanan & Akses',
    preferences: 'Preferensi & Tampilan',
    about: 'Tentang Aplikasi',
    danger: 'Zona Bahaya',
  };

  return (
    <div className="flex flex-col gap-6 px-4 sm:px-6 pt-6 pb-28 md:pb-12 animate-fade-in max-w-4xl mx-auto w-full">
      
      {/* Toast Alert */}
      {toast && (
        <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[300] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-slide-down border text-sm font-bold backdrop-blur-xl ${
          toast.type === 'error'
            ? 'bg-red-950/90 text-red-100 border-red-800 shadow-red-950/30'
            : 'bg-brand-950/90 dark:bg-white/95 text-white dark:text-brand-950 border-brand-800 dark:border-white/50 shadow-brand-950/20'
        }`}>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Page Header (Supports going back to Menu or to Dashboard) */}
      <Header 
        title={currentSection ? sectionTitles[currentSection] : "Profil Saya"} 
        onBack={currentSection ? () => setCurrentSection(null) : onBack} 
      />

      {loading && !profile ? (
        <div className="flex flex-col items-center justify-center py-28 gap-4">
          <Spinner size="md" />
          <p className="text-sm font-semibold text-brand-400 animate-pulse">Memuat data profil...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">

          {/* ============================================================ */}
          {/* HERO PROFILE CARD */}
          {/* ============================================================ */}
          <div className="w-full relative rounded-[2rem] bg-gradient-to-b from-white via-white to-brand-50/80 dark:from-brand-900 dark:via-brand-900 dark:to-brand-950 border border-brand-200/80 dark:border-brand-800 shadow-sm overflow-hidden">
            
            {/* Top Cover Banner */}
            <div className="h-24 sm:h-28 w-full relative overflow-hidden bg-gradient-to-r from-brand-950 via-brand-800 to-brand-900 dark:from-black dark:via-brand-950 dark:to-brand-900" />

            {/* Avatar & Identity Info */}
            <div className="px-6 sm:px-8 pb-6 pt-0 relative flex flex-col items-center text-center">
              
              {/* Floating Avatar */}
              <div className="relative -mt-12 sm:-mt-14 mb-3 group">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-tr from-brand-200 to-brand-100 dark:from-brand-800 dark:to-brand-700 flex items-center justify-center font-black text-3xl sm:text-4xl text-brand-950 dark:text-white shadow-xl overflow-hidden ring-4 ring-white dark:ring-brand-900 border-2 border-brand-200/60 dark:border-brand-700">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  ) : (
                    <span>{displayName.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                {/* Change Avatar Button */}
                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Ubah Foto Profil"
                  className="absolute bottom-0 right-0 bg-brand-950 dark:bg-white text-white dark:text-brand-950 rounded-full w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all border-2 border-white dark:border-brand-900 cursor-pointer"
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
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-brand-950 dark:text-white">
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

              {/* Email & Join Badge (Clean Text Badges) */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-100/70 dark:bg-brand-800/60 text-xs font-semibold text-brand-700 dark:text-brand-300 border border-brand-200/50 dark:border-brand-700">
                  <span>{userEmail}</span>
                </div>
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-xs font-medium text-brand-500 dark:text-brand-400 border border-brand-200/60 dark:border-brand-800">
                  <span>Bergabung {joinDate}</span>
                </div>
              </div>

            </div>

          </div>

          {/* ============================================================ */}
          {/* VIEW MODE 1: MAIN MENU BUTTONS (Clean Text & Arrow Buttons) */}
          {/* ============================================================ */}
          {currentSection === null && (
            <div className="flex flex-col gap-3 animate-fade-in">
              <div className="px-1 text-xs font-extrabold tracking-wider text-brand-400 dark:text-brand-500 uppercase">
                Menu Pengaturan
              </div>

              <div className="bg-white dark:bg-brand-900 rounded-3xl border border-brand-100 dark:border-brand-800 shadow-sm overflow-hidden divide-y divide-brand-100 dark:divide-brand-800/80">
                
                {/* 1. Tombol: Akun & Identitas */}
                <button
                  type="button"
                  onClick={() => setCurrentSection('account')}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-brand-50/70 dark:hover:bg-brand-800/40 active:bg-brand-100 dark:active:bg-brand-800 transition-colors text-left cursor-pointer group"
                >
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-brand-950 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-200 transition-colors truncate">
                      Akun & Identitas
                    </h3>
                    <p className="text-xs text-brand-400 dark:text-brand-500 mt-0.5 truncate">
                      Nama lengkap, alamat email, User ID, dan avatar
                    </p>
                  </div>
                  <div className="text-brand-400 group-hover:text-brand-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all shrink-0">
                    <IconChevronRight />
                  </div>
                </button>

                {/* 2. Tombol: Keamanan & Akses */}
                <button
                  type="button"
                  onClick={() => setCurrentSection('security')}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-brand-50/70 dark:hover:bg-brand-800/40 active:bg-brand-100 dark:active:bg-brand-800 transition-colors text-left cursor-pointer group"
                >
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-brand-950 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-200 transition-colors truncate">
                      Keamanan & Akses
                    </h3>
                    <p className="text-xs text-brand-400 dark:text-brand-500 mt-0.5 truncate">
                      Ganti kata sandi, tautan reset via email, proteksi sesi
                    </p>
                  </div>
                  <div className="text-brand-400 group-hover:text-brand-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all shrink-0">
                    <IconChevronRight />
                  </div>
                </button>

                {/* 3. Tombol: Preferensi & Kustomisasi */}
                <button
                  type="button"
                  onClick={() => setCurrentSection('preferences')}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-brand-50/70 dark:hover:bg-brand-800/40 active:bg-brand-100 dark:active:bg-brand-800 transition-colors text-left cursor-pointer group"
                >
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-brand-950 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-200 transition-colors truncate">
                      Preferensi & Kustomisasi
                    </h3>
                    <p className="text-xs text-brand-400 dark:text-brand-500 mt-0.5 truncate">
                      Tema antarmuka ({isDarkMode ? 'Gelap' : 'Terang'}) & kategori keuangan ({totalCustomCats} kustom)
                    </p>
                  </div>
                  <div className="text-brand-400 group-hover:text-brand-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all shrink-0">
                    <IconChevronRight />
                  </div>
                </button>

                {/* 4. Tombol: Tentang Aplikasi */}
                <button
                  type="button"
                  onClick={() => setCurrentSection('about')}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-brand-50/70 dark:hover:bg-brand-800/40 active:bg-brand-100 dark:active:bg-brand-800 transition-colors text-left cursor-pointer group"
                >
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-brand-950 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-200 transition-colors truncate">
                      Tentang Aplikasi
                    </h3>
                    <p className="text-xs text-brand-400 dark:text-brand-500 mt-0.5 truncate">
                      Versi rilis v{import.meta.env.VITE_APP_VERSION || '1.0.0'} & informasi sistem
                    </p>
                  </div>
                  <div className="text-brand-400 group-hover:text-brand-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all shrink-0">
                    <IconChevronRight />
                  </div>
                </button>

                {/* 5. Tombol: Zona Bahaya */}
                <button
                  type="button"
                  onClick={() => setCurrentSection('danger')}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-red-50/40 dark:hover:bg-red-950/20 active:bg-red-100 dark:active:bg-red-900/30 transition-colors text-left cursor-pointer group"
                >
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-red-600 dark:text-red-400 truncate">
                      Zona Bahaya
                    </h3>
                    <p className="text-xs text-red-500/70 dark:text-red-400/60 mt-0.5 truncate">
                      Keluar dari sesi akun atau hapus akun permanen
                    </p>
                  </div>
                  <div className="text-red-400 group-hover:text-red-600 dark:group-hover:text-red-300 group-hover:translate-x-1 transition-all shrink-0">
                    <IconChevronRight />
                  </div>
                </button>

              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* VIEW MODE 2: SECTION DRILL-DOWN (Opened when a button is clicked) */}
          {/* ============================================================ */}
          {currentSection !== null && (
            <div className="flex flex-col gap-4 animate-fade-in">
              
              {/* Back to Menu Button */}
              <button
                type="button"
                onClick={() => setCurrentSection(null)}
                className="inline-flex items-center gap-2 text-xs font-bold text-brand-500 hover:text-brand-950 dark:hover:text-white transition-colors cursor-pointer w-fit py-1.5 px-3 -ml-2 rounded-xl hover:bg-brand-100 dark:hover:bg-brand-800"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                <span>Kembali ke Menu Profil</span>
              </button>

              {/* ---------------- SECTION: AKUN & IDENTITAS ---------------- */}
              {currentSection === 'account' && (
                <div className="bg-white dark:bg-brand-900 rounded-3xl border border-brand-100 dark:border-brand-800 shadow-sm overflow-hidden divide-y divide-brand-100 dark:divide-brand-800/80">
                  
                  {/* Nama Lengkap */}
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-brand-400 dark:text-brand-500 uppercase tracking-wide">Nama Lengkap</p>
                      <p className="text-sm sm:text-base font-bold text-brand-950 dark:text-white truncate">{displayName}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setNewName(displayName); setShowNameModal(true); }}
                      className="px-4 py-2 rounded-xl bg-brand-50 dark:bg-brand-800 border border-brand-200 dark:border-brand-700 text-xs font-bold text-brand-950 dark:text-white hover:bg-brand-100 dark:hover:bg-brand-700 transition-colors cursor-pointer shrink-0 shadow-xs"
                    >
                      Ubah
                    </button>
                  </div>

                  {/* Alamat Email */}
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-brand-400 dark:text-brand-500 uppercase tracking-wide">Alamat Email</p>
                      <p className="text-sm sm:text-base font-bold text-brand-950 dark:text-white truncate">{userEmail}</p>
                    </div>
                    <div className="inline-flex items-center px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold shrink-0">
                      <span>Terverifikasi</span>
                    </div>
                  </div>

                  {/* User ID */}
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-brand-400 dark:text-brand-500 uppercase tracking-wide">User ID</p>
                      <p className="text-xs font-mono font-medium text-brand-600 dark:text-brand-400 truncate max-w-[200px] sm:max-w-md">
                        {session?.user?.id}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyId}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white dark:bg-brand-800 border border-brand-200 dark:border-brand-700 text-xs font-bold text-brand-950 dark:text-white hover:bg-brand-100 dark:hover:bg-brand-700 transition-colors cursor-pointer shrink-0 shadow-xs"
                    >
                      {copiedId ? <span className="text-emerald-500"><IconCheck /></span> : <IconCopy />}
                      <span>{copiedId ? 'Tersalin' : 'Salin ID'}</span>
                    </button>
                  </div>

                  {/* Terakhir Masuk */}
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-brand-400 dark:text-brand-500 uppercase tracking-wide">Sesi Terakhir</p>
                      <p className="text-sm sm:text-base font-bold text-brand-950 dark:text-white">{lastLogin}</p>
                    </div>
                    <span className="text-xs font-semibold text-brand-400 dark:text-brand-500">Sesi Aktif</span>
                  </div>

                  {/* Kelola Foto Profil */}
                  <div className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-3 bg-brand-50/50 dark:bg-brand-950/40">
                    <p className="text-xs text-brand-400">Atur foto profil akun Anda</p>
                    <div className="flex gap-2">
                      {avatarUrl && (
                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                        >
                          Hapus Foto
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-brand-950 dark:bg-white text-white dark:text-brand-950 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1.5 shadow-xs"
                      >
                        <IconCamera />
                        <span>Ganti Foto</span>
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* ---------------- SECTION: KEAMANAN & AKSES ---------------- */}
              {currentSection === 'security' && (
                <div className="bg-white dark:bg-brand-900 rounded-3xl border border-brand-100 dark:border-brand-800 shadow-sm overflow-hidden divide-y divide-brand-100 dark:divide-brand-800/80">
                  
                  {/* Ubah Sandi */}
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-bold text-brand-950 dark:text-white">Kata Sandi Akun</p>
                      <p className="text-xs text-brand-400 dark:text-brand-500">••••••••••••••••</p>
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
                      className="px-4 py-2 rounded-xl bg-brand-950 dark:bg-white text-white dark:text-brand-950 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer shrink-0 shadow-xs"
                    >
                      Ganti Sandi
                    </button>
                  </div>

                  {/* Reset Sandi via Email */}
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-bold text-brand-950 dark:text-white">Reset Sandi via Email</p>
                      <p className="text-xs text-brand-400 dark:text-brand-500">Kirim link pemulihan ke surel terdaftar</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleSendResetEmail}
                      disabled={sendingResetLink}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-brand-800 border border-brand-200 dark:border-brand-700 text-xs font-bold text-brand-950 dark:text-white hover:bg-brand-100 dark:hover:bg-brand-700 transition-colors cursor-pointer shrink-0 disabled:opacity-50 shadow-xs"
                    >
                      {sendingResetLink ? 'Mengirim...' : 'Kirim Link'}
                    </button>
                  </div>

                  {/* Proteksi Sesi */}
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-bold text-brand-950 dark:text-white">Enkripsi & Proteksi Sesi</p>
                      <p className="text-xs text-brand-400 dark:text-brand-500">Terenkripsi TLS 1.3 dengan Supabase Auth</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800 shrink-0">
                      Aman
                    </span>
                  </div>

                </div>
              )}

              {/* ---------------- SECTION: PREFERENSI & TAMPILAN ---------------- */}
              {currentSection === 'preferences' && (
                <div className="bg-white dark:bg-brand-900 rounded-3xl border border-brand-100 dark:border-brand-800 shadow-sm overflow-hidden divide-y divide-brand-100 dark:divide-brand-800/80">
                  
                  {/* Tema Visual Antarmuka */}
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-bold text-brand-950 dark:text-white">Tema Antarmuka</p>
                      <p className="text-xs text-brand-400 dark:text-brand-500">
                        {isDarkMode ? 'Saat ini: Mode Gelap (Dark)' : 'Saat ini: Mode Terang (Light)'}
                      </p>
                    </div>

                    {/* Toggle Pill */}
                    <div className="flex p-1 bg-brand-100 dark:bg-brand-950 rounded-2xl self-start sm:self-auto border border-brand-200/60 dark:border-brand-800">
                      <button
                        type="button"
                        onClick={() => setThemeMode(false)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          !isDarkMode
                            ? 'bg-white text-brand-950 shadow-xs'
                            : 'text-brand-500 hover:text-brand-900 dark:hover:text-white'
                        }`}
                      >
                        Terang
                      </button>
                      <button
                        type="button"
                        onClick={() => setThemeMode(true)}
                        className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isDarkMode
                            ? 'bg-brand-800 text-white shadow-xs'
                            : 'text-brand-500 hover:text-brand-900 dark:hover:text-white'
                        }`}
                      >
                        Gelap
                      </button>
                    </div>
                  </div>

                  {/* Kategori Keuangan Kustom */}
                  <div 
                    onClick={() => setShowCategoryModal(true)}
                    className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-brand-50/50 dark:hover:bg-brand-800/30 transition-colors cursor-pointer group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-bold text-brand-950 dark:text-white">Kategori Keuangan Kustom</p>
                      <p className="text-xs text-brand-400 dark:text-brand-500">Kelola kategori pengeluaran & pemasukan Anda</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-800 text-brand-700 dark:text-brand-300 text-xs font-bold">
                        {totalCustomCats} Kategori
                      </span>
                      <span className="text-brand-400 group-hover:translate-x-0.5 transition-transform">
                        <IconChevronRight />
                      </span>
                    </div>
                  </div>

                </div>
              )}

              {/* ---------------- SECTION: TENTANG APLIKASI ---------------- */}
              {currentSection === 'about' && (
                <div className="bg-white dark:bg-brand-900 rounded-3xl border border-brand-100 dark:border-brand-800 shadow-sm overflow-hidden divide-y divide-brand-100 dark:divide-brand-800/80">
                  
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-bold text-brand-950 dark:text-white">Daily Management Application</p>
                      <p className="text-xs text-brand-400 dark:text-brand-500">Aplikasi manajemen tugas, jadwal kalender, dan keuangan</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-800 text-brand-700 dark:text-brand-300 text-xs font-bold shrink-0">
                      v{import.meta.env.VITE_APP_VERSION || '1.0.0'}
                    </span>
                  </div>

                  <div className="p-4 sm:p-5 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-bold text-brand-400 uppercase tracking-wider">Teknologi & Basis Data</p>
                      <p className="text-sm font-semibold text-brand-950 dark:text-white mt-0.5">React + Vite + Supabase</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                      Terhubung
                    </span>
                  </div>

                </div>
              )}

              {/* ---------------- SECTION: ZONA BAHAYA ---------------- */}
              {currentSection === 'danger' && (
                <div className="bg-white dark:bg-brand-900 rounded-3xl border border-red-200 dark:border-red-950 shadow-sm overflow-hidden divide-y divide-brand-100 dark:divide-brand-800/80">
                  
                  {/* Keluar Sesi */}
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-amber-50/40 dark:hover:bg-amber-950/20 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-bold text-brand-950 dark:text-white">Keluar dari Akun (Log Out)</p>
                      <p className="text-xs text-brand-400 dark:text-brand-500">Akhiri sesi aktif Anda pada perangkat ini</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowLogoutModal(true)}
                      className="px-4 py-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-bold hover:bg-amber-200 dark:hover:bg-amber-900/60 transition-colors cursor-pointer shrink-0 shadow-xs"
                    >
                      Keluar
                    </button>
                  </div>

                  {/* Hapus Akun */}
                  <div className="p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-red-50/40 dark:hover:bg-red-950/20 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm sm:text-base font-bold text-red-600 dark:text-red-400">Hapus Akun Permanen</p>
                      <p className="text-xs text-red-500/80 dark:text-red-400/70">Hapus seluruh data tugas, jadwal, dan keuangan selamanya</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteConfirmation('');
                        setShowDeleteModal(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer shrink-0 shadow-xs"
                    >
                      Hapus
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* Footer note */}
          <div className="mt-2 text-center text-xs font-bold text-brand-400 dark:text-brand-600">
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
      {/* MODAL: KELOLA KATEGORI KEUANGAN KUSTOM */}
      {/* ============================================================ */}
      <Modal isOpen={showCategoryModal} onClose={() => setShowCategoryModal(false)} title="Kategori Keuangan Kustom">
        <div className="flex flex-col gap-4">
          <p className="text-xs text-brand-500">
            Tambah atau hapus kategori kustom untuk pencatatan transaksi pemasukan dan pengeluaran Anda.
          </p>

          {/* Type Toggle */}
          <div className="flex p-1 bg-brand-100 dark:bg-brand-900 rounded-xl">
            <button
              type="button"
              onClick={() => setCategoryType('expense')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
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
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                categoryType === 'income'
                  ? 'bg-white dark:bg-brand-950 text-brand-950 dark:text-white shadow-xs'
                  : 'text-brand-500 hover:text-brand-900 dark:hover:text-white'
              }`}
            >
              Pemasukan ({customCategories.filter(c => c.type === 'income').length})
            </button>
          </div>

          {/* Add Form */}
          <form onSubmit={handleAddCategory} className="flex gap-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder={`Tambah kategori ${categoryType === 'expense' ? 'pengeluaran' : 'pemasukan'}...`}
              className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 text-xs focus:border-brand-950 dark:focus:border-white focus:outline-none"
            />
            <button
              type="submit"
              disabled={!newCategoryName.trim() || catLoading}
              className="px-4 py-2.5 rounded-xl bg-brand-950 dark:bg-white text-white dark:text-brand-950 text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer shrink-0 flex items-center gap-1.5"
            >
              <IconPlus />
              <span>Tambah</span>
            </button>
          </form>

          {/* Category List */}
          <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-1">
            {catLoading && customCategories.length === 0 ? (
              <div className="py-6 flex justify-center"><Spinner size="sm" /></div>
            ) : customCategories.filter(c => c.type === categoryType).length === 0 ? (
              <div className="py-8 px-4 text-center rounded-2xl border border-dashed border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-950/30">
                <p className="text-xs font-bold text-brand-400">Belum ada kategori kustom.</p>
                <p className="text-[11px] text-brand-400/80 mt-1">Kategori bawaan sistem tetap tersedia di formulir transaksi.</p>
              </div>
            ) : (
              customCategories
                .filter(c => c.type === categoryType)
                .map((cat) => (
                  <div
                    key={cat.id}
                    className="p-3 rounded-xl bg-white dark:bg-brand-900 border border-brand-100 dark:border-brand-800 flex items-center justify-between gap-2"
                  >
                    <span className="text-xs font-bold text-brand-950 dark:text-white">{cat.name}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-brand-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                      title="Hapus Kategori"
                    >
                      <IconTrash />
                    </button>
                  </div>
                ))
            )}
          </div>

          <div className="pt-2 border-t border-brand-100 dark:border-brand-800 flex justify-end">
            <button
              type="button"
              onClick={() => setShowCategoryModal(false)}
              className="px-5 py-2.5 rounded-xl bg-brand-100 dark:bg-brand-800 text-brand-950 dark:text-white font-bold text-xs hover:bg-brand-200 dark:hover:bg-brand-700 transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </Modal>

      {/* ============================================================ */}
      {/* MODAL: KONFIRMASI LOGOUT */}
      {/* ============================================================ */}
      <Modal isOpen={showLogoutModal} onClose={() => setShowLogoutModal(false)} title="Konfirmasi Keluar">
        <div className="flex flex-col gap-4">
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl">
            <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">Keluar dari Akun</h4>
            <p className="text-xs text-amber-700 dark:text-amber-300/80 mt-1">
              Apakah Anda yakin ingin mengakhiri sesi aktif pada perangkat ini?
            </p>
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
