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

// Icons
const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconUserCog = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="7" r="4" />
    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
  </svg>
);

const IconSliders = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

const IconMail = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
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

const IconLogout = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const IconTrash = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const IconSun = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const IconCheckCircle = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const IconAlertTriangle = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
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

const IconChevronDown = ({ className = '' }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function Profile({ session, onBack }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Active Tab: 'security' | 'account' | 'preferences'
  const [activeTab, setActiveTab] = useState('security');

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

  // Categories Modal State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [customCategories, setCustomCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [categoryType, setCategoryType] = useState('expense');
  const [newCategoryName, setNewCategoryName] = useState('');

  const fileInputRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    const data = await getProfile();
    setProfile(data);
    setLoading(false);
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
  };

  // Avatar Upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    const ext = file.name.split('.').pop();
    const filename = `${session.user.id}_avatar_${Date.now()}.${ext}`;
    const url = await uploadFile('uploads', `avatars/${filename}`, file);
    
    if (url) {
      await updateProfile({ avatar_url: url });
      await fetchData();
    }
    setLoading(false);
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
      setPassError(`Gagal mengirim link: ${error.message}`);
    } else {
      setPassSuccess('Link reset kata sandi telah dikirim ke email Anda! Periksa kotak masuk atau spam.');
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

  // Dark Mode Toggle
  const [isDarkMode, setIsDarkMode] = useState(
    typeof window !== 'undefined' ? document.documentElement.classList.contains('dark') : false
  );

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  // Custom Categories
  const loadCategories = async () => {
    setCatLoading(true);
    const cats = await getCustomCategories();
    setCustomCategories(cats);
    setCatLoading(false);
  };

  const openCategoryModal = () => {
    setShowCategoryModal(true);
    loadCategories();
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim() || catLoading) return;
    setCatLoading(true);
    await addCustomCategory(categoryType, newCategoryName.trim());
    setNewCategoryName('');
    await loadCategories();
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm("Yakin hapus kategori ini? Transaksi lama dengan kategori ini tidak akan terhapus, namun kategori ini akan hilang dari pilihan form.")) return;
    setCatLoading(true);
    await deleteCustomCategory(id);
    await loadCategories();
  };

  const displayName = profile?.display_name || session?.user?.user_metadata?.username || 'User';
  const avatarUrl = profile?.avatar_url;

  return (
    <div className="flex flex-col gap-6 px-4 sm:px-6 pt-6 pb-24 md:pb-8 animate-fade-in max-w-4xl mx-auto">
      <Header title="Profil Saya" onBack={onBack} />

      {loading && !profile ? (
        <div className="flex items-center justify-center py-20">
          <Spinner size="md" />
        </div>
      ) : (
        <div className="flex flex-col items-center">
          
          {/* Avatar & Header Card */}
          <div className="w-full bg-white dark:bg-brand-900 rounded-3xl p-6 sm:p-8 border border-brand-100 dark:border-brand-800 shadow-sm flex flex-col items-center text-center relative mb-6">
            <div className="relative mb-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-brand-100 dark:bg-brand-800 flex items-center justify-center font-black text-3xl sm:text-4xl shadow-md overflow-hidden border-4 border-white dark:border-brand-950">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  displayName.charAt(0).toUpperCase()
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                aria-label="Ubah foto profil"
                className="absolute bottom-0 right-0 bg-brand-950 dark:bg-white text-white dark:text-brand-950 rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-transform border-2 border-white dark:border-brand-950 cursor-pointer"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </button>
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleAvatarChange}
              />
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight mb-1">{displayName}</h2>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-xs font-semibold text-brand-500 dark:text-brand-400 border border-brand-200/60 dark:border-brand-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{session?.user?.email}</span>
            </div>
          </div>

          {/* Vertical Stacked Tabs: Keamanan Akun, Atur Akun, Preferensi */}
          <div className="w-full flex flex-col gap-3.5">

            {/* TAB 1: KEAMANAN AKUN */}
            <div className={`w-full rounded-2xl sm:rounded-3xl border transition-all duration-200 overflow-hidden ${
              activeTab === 'security'
                ? 'bg-white dark:bg-brand-900 border-brand-950/20 dark:border-brand-700 shadow-sm'
                : 'bg-white dark:bg-brand-900 border-brand-100 dark:border-brand-800/80 hover:border-brand-200 dark:hover:border-brand-700'
            }`}>
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'security' ? null : 'security')}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer transition-colors hover:bg-brand-50/40 dark:hover:bg-brand-800/40"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${
                    activeTab === 'security'
                      ? 'bg-brand-950 text-white dark:bg-white dark:text-brand-950'
                      : 'bg-brand-100 dark:bg-brand-800 text-brand-700 dark:text-brand-300'
                  }`}>
                    <IconShield />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-brand-950 dark:text-white">Keamanan Akun</h3>
                    <p className="text-xs text-brand-500">Ubah kata sandi, nama lengkap, dan email</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg text-brand-400 transition-transform duration-200 ${
                    activeTab === 'security' ? 'rotate-180 text-brand-950 dark:text-white' : ''
                  }`}>
                    <IconChevronDown />
                  </div>
                </div>
              </button>

              {activeTab === 'security' && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 border-t border-brand-100 dark:border-brand-800/80 flex flex-col gap-3 animate-fade-in">
                  {/* 1. Ubah Kata Sandi */}
                  <div className="p-4 bg-brand-50/60 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800/80 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-brand-900 border border-brand-200/60 dark:border-brand-800 flex items-center justify-center text-brand-700 dark:text-brand-300 shrink-0">
                        <IconKey />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-brand-400 uppercase tracking-wider">Kata Sandi</p>
                        <p className="text-sm sm:text-base font-bold text-brand-950 dark:text-white">••••••••••••</p>
                        <p className="text-[11px] text-brand-500">Amankan akun Anda dengan kata sandi yang kuat</p>
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
                      className="px-4 py-2 rounded-xl bg-brand-950 dark:bg-white text-white dark:text-brand-950 hover:opacity-90 text-xs font-bold transition-opacity cursor-pointer shrink-0 shadow-xs"
                    >
                      Ubah Sandi
                    </button>
                  </div>

                  {/* 2. Ubah Nama */}
                  <div className="p-4 bg-brand-50/60 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800/80 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-brand-900 border border-brand-200/60 dark:border-brand-800 flex items-center justify-center text-brand-700 dark:text-brand-300 shrink-0">
                        <IconUser />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-brand-400 uppercase tracking-wider">Nama Lengkap</p>
                        <p className="text-sm sm:text-base font-bold text-brand-950 dark:text-white">{displayName}</p>
                        <p className="text-[11px] text-brand-500">Tampil di dashboard dan salam aplikasi</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setNewName(displayName); setShowNameModal(true); }}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-brand-800 text-brand-950 dark:text-white border border-brand-200 dark:border-brand-700 hover:bg-brand-100 dark:hover:bg-brand-700 text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-xs"
                    >
                      Ubah Nama
                    </button>
                  </div>

                  {/* 3. Email */}
                  <div className="p-4 bg-brand-50/60 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-brand-900 border border-brand-200/60 dark:border-brand-800 flex items-center justify-center text-brand-700 dark:text-brand-300 shrink-0">
                        <IconMail />
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-brand-400 uppercase tracking-wider">Email Akun</p>
                        <p className="text-sm sm:text-base font-bold text-brand-950 dark:text-white">{session?.user?.email}</p>
                        <p className="text-[11px] text-brand-500">Email ini digunakan untuk masuk dan autentikasi</p>
                      </div>
                    </div>
                    <div className="flex items-center self-start sm:self-auto gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-bold shrink-0">
                      <IconCheckCircle />
                      <span>Terverifikasi</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* TAB 2: ATUR AKUN */}
            <div className={`w-full rounded-2xl sm:rounded-3xl border transition-all duration-200 overflow-hidden ${
              activeTab === 'account'
                ? 'bg-white dark:bg-brand-900 border-brand-950/20 dark:border-brand-700 shadow-sm'
                : 'bg-white dark:bg-brand-900 border-brand-100 dark:border-brand-800/80 hover:border-brand-200 dark:hover:border-brand-700'
            }`}>
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'account' ? null : 'account')}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer transition-colors hover:bg-brand-50/40 dark:hover:bg-brand-800/40"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${
                    activeTab === 'account'
                      ? 'bg-brand-950 text-white dark:bg-white dark:text-brand-950'
                      : 'bg-brand-100 dark:bg-brand-800 text-brand-700 dark:text-brand-300'
                  }`}>
                    <IconUserCog />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-brand-950 dark:text-white">Atur Akun</h3>
                    <p className="text-xs text-brand-500">Keluar dari akun atau hapus akun permanen</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg text-brand-400 transition-transform duration-200 ${
                    activeTab === 'account' ? 'rotate-180 text-brand-950 dark:text-white' : ''
                  }`}>
                    <IconChevronDown />
                  </div>
                </div>
              </button>

              {activeTab === 'account' && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 border-t border-brand-100 dark:border-brand-800/80 flex flex-col gap-3 animate-fade-in">
                  {/* 1. Log Out */}
                  <div className="p-4 bg-brand-50/60 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800/80 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                        <IconLogout />
                      </div>
                      <div>
                        <p className="text-sm sm:text-base font-bold text-brand-950 dark:text-white">Keluar dari Akun (Log Out)</p>
                        <p className="text-xs text-brand-500">Akhiri sesi aktif Anda pada perangkat ini</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm("Apakah Anda yakin ingin keluar dari akun?")) {
                          logout();
                        }
                      }}
                      className="px-4 py-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-xs"
                    >
                      Log Out
                    </button>
                  </div>

                  {/* 2. Hapus Akun */}
                  <div className="p-4 bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/60 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/40 border border-red-200 dark:border-red-800 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                        <IconTrash />
                      </div>
                      <div>
                        <p className="text-sm sm:text-base font-bold text-red-700 dark:text-red-400">Hapus Akun Permanen</p>
                        <p className="text-xs text-red-600/80 dark:text-red-400/70">Hapus seluruh data tugas, jadwal, dan keuangan secara permanen</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteConfirmation('');
                        setShowDeleteModal(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 text-xs font-bold transition-colors cursor-pointer shadow-xs shrink-0"
                    >
                      Hapus Akun
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* TAB 3: PREFERENSI */}
            <div className={`w-full rounded-2xl sm:rounded-3xl border transition-all duration-200 overflow-hidden ${
              activeTab === 'preferences'
                ? 'bg-white dark:bg-brand-900 border-brand-950/20 dark:border-brand-700 shadow-sm'
                : 'bg-white dark:bg-brand-900 border-brand-100 dark:border-brand-800/80 hover:border-brand-200 dark:hover:border-brand-700'
            }`}>
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'preferences' ? null : 'preferences')}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left cursor-pointer transition-colors hover:bg-brand-50/40 dark:hover:bg-brand-800/40"
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-colors shrink-0 ${
                    activeTab === 'preferences'
                      ? 'bg-brand-950 text-white dark:bg-white dark:text-brand-950'
                      : 'bg-brand-100 dark:bg-brand-800 text-brand-700 dark:text-brand-300'
                  }`}>
                    <IconSliders />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-brand-950 dark:text-white">Preferensi</h3>
                    <p className="text-xs text-brand-500">Tampilan tema aplikasi dan kelola kategori kustom</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg text-brand-400 transition-transform duration-200 ${
                    activeTab === 'preferences' ? 'rotate-180 text-brand-950 dark:text-white' : ''
                  }`}>
                    <IconChevronDown />
                  </div>
                </div>
              </button>

              {activeTab === 'preferences' && (
                <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-1 border-t border-brand-100 dark:border-brand-800/80 flex flex-col gap-3 animate-fade-in">
                  {/* 1. Mode Tema */}
                  <div className="p-4 bg-brand-50/60 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800/80 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-brand-900 border border-brand-200/60 dark:border-brand-800 flex items-center justify-center text-brand-700 dark:text-brand-300 shrink-0">
                        {isDarkMode ? <IconMoon /> : <IconSun />}
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-brand-400 uppercase tracking-wider">Tampilan Tema</p>
                        <p className="text-sm sm:text-base font-bold text-brand-950 dark:text-white">
                          {isDarkMode ? 'Mode Gelap (Dark)' : 'Mode Terang (Light)'}
                        </p>
                        <p className="text-[11px] text-brand-500">Sesuaikan tema visual dengan preferensi Anda</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-brand-800 text-brand-950 dark:text-white border border-brand-200 dark:border-brand-700 hover:bg-brand-100 dark:hover:bg-brand-700 text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-xs"
                    >
                      {isDarkMode ? 'Ganti ke Terang' : 'Ganti ke Gelap'}
                    </button>
                  </div>

                  {/* 2. Kategori Kustom */}
                  <div className="p-4 bg-brand-50/60 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800/80 rounded-2xl flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-white dark:bg-brand-900 border border-brand-200/60 dark:border-brand-800 flex items-center justify-center text-brand-700 dark:text-brand-300 shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-brand-400 uppercase tracking-wider">Kategori Keuangan</p>
                        <p className="text-sm sm:text-base font-bold text-brand-950 dark:text-white">Kelola Kategori Kustom</p>
                        <p className="text-[11px] text-brand-500">Atur kategori pemasukan & pengeluaran Anda</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={openCategoryModal}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-brand-800 text-brand-950 dark:text-white border border-brand-200 dark:border-brand-700 hover:bg-brand-100 dark:hover:bg-brand-700 text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-xs"
                    >
                      Kelola
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Version Footer */}
          <div className="mt-8 text-center text-xs font-bold text-brand-400 dark:text-brand-600">
            Aplikasi Versi {import.meta.env.VITE_APP_VERSION || '1.0.0'}
          </div>

        </div>
      )}

      {/* Modal Ubah Nama */}
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
              required
            />
          </div>
          <button type="submit" className="btn-primary mt-2" disabled={!newName.trim() || savingName}>
            {savingName ? 'Menyimpan...' : 'Simpan Nama Baru'}
          </button>
        </form>
      </Modal>

      {/* Modal Ubah Kata Sandi */}
      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Ubah Kata Sandi">
        <div className="flex flex-col gap-5">
          {/* Alerts */}
          {passError && (
            <div className="p-3.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-xs font-semibold">
              {passError}
            </div>
          )}
          {passSuccess && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
              {passSuccess}
            </div>
          )}

          {/* Direct Password Form */}
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
            </div>

            <button
              type="submit"
              disabled={savingPassword || !newPassword || !confirmPassword}
              className="btn-primary mt-2"
            >
              {savingPassword ? 'Menyimpan...' : 'Perbarui Kata Sandi Sekarang'}
            </button>
          </form>

          {/* Or Send Email Link */}
          <div className="pt-4 border-t border-brand-200 dark:border-brand-800 text-center">
            <p className="text-xs text-brand-500 mb-2">Atau reset melalui tautan yang dikirim ke email:</p>
            <button
              type="button"
              onClick={handleSendResetEmail}
              disabled={sendingResetLink}
              className="text-xs font-bold text-brand-900 dark:text-white hover:underline cursor-pointer"
            >
              {sendingResetLink ? 'Mengirim link...' : 'Kirim Link Reset ke Email'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Konfirmasi Hapus Akun */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Hapus Akun Permanen">
        <div className="flex flex-col gap-4">
          <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-2xl flex items-start gap-3">
            <div className="text-red-500 shrink-0 mt-0.5">
              <IconAlertTriangle />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-700 dark:text-red-300">Peringatan: Tindakan ini permanen!</h4>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1 leading-relaxed">
                Seluruh data Anda meliputi daftar tugas, jadwal harian, catatan transaksi keuangan, kategori, dan foto profil akan dihapus selamanya dari server kami.
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

          <div className="flex gap-3 mt-2">
            <button
              type="button"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1 py-3.5 rounded-2xl bg-brand-100 dark:bg-brand-800 text-brand-950 dark:text-white font-bold text-sm hover:bg-brand-200 dark:hover:bg-brand-700 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== 'HAPUS' || deletingAccount}
              className="flex-1 py-3.5 rounded-2xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 disabled:opacity-50 disabled:pointer-events-none transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              {deletingAccount ? 'Menghapus...' : 'Ya, Hapus Akun'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Kategori Kustom */}
      <Modal isOpen={showCategoryModal} onClose={() => setShowCategoryModal(false)} title="Kategori Kustom">
        <div className="flex flex-col gap-5">
          {/* Tabs */}
          <div className="flex p-1 bg-brand-100 dark:bg-brand-900 rounded-xl">
            <button 
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${categoryType === 'expense' ? 'bg-white dark:bg-brand-950 shadow-sm text-brand-900 dark:text-white' : 'text-brand-500 hover:text-brand-700 dark:hover:text-brand-300'}`}
              onClick={() => setCategoryType('expense')}
            >
              Pengeluaran
            </button>
            <button 
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${categoryType === 'income' ? 'bg-white dark:bg-brand-950 shadow-sm text-brand-900 dark:text-white' : 'text-brand-500 hover:text-brand-700 dark:hover:text-brand-300'}`}
              onClick={() => setCategoryType('income')}
            >
              Pemasukan
            </button>
          </div>

          <div className="flex flex-col gap-2 max-h-[40vh] overflow-y-auto pr-1">
            {catLoading && customCategories.length === 0 ? (
              <div className="flex items-center justify-center py-6">
                <Spinner size="sm" />
              </div>
            ) : customCategories.filter(c => c.type === categoryType).length === 0 ? (
              <div className="text-center py-6 bg-brand-50 dark:bg-brand-950 rounded-xl border border-dashed border-brand-200 dark:border-brand-800">
                <p className="font-bold text-brand-400 text-sm">Belum ada kategori kustom.</p>
              </div>
            ) : (
              customCategories.filter(c => c.type === categoryType).map((cat) => (
                <div key={cat.id} className="flex justify-between items-center p-3 bg-white dark:bg-brand-900 border border-brand-100 dark:border-brand-800 rounded-xl">
                  <span className="font-bold text-sm flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path><line x1="7" y1="7" x2="7.01" y2="7"></line></svg>
                    {cat.name}
                  </span>
                  <button 
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-brand-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    disabled={catLoading}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddCategory} className="flex gap-2 pt-4 border-t border-brand-200 dark:border-brand-800">
            <input 
              type="text" 
              className="input-field flex-1 text-sm py-2" 
              placeholder="Ketik kategori baru..." 
              value={newCategoryName} 
              onChange={(e) => setNewCategoryName(e.target.value)} 
              required
            />
            <button type="submit" disabled={!newCategoryName.trim() || catLoading} className="bg-brand-950 dark:bg-white text-white dark:text-brand-950 font-bold px-4 rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity">
              Tambah
            </button>
          </form>

        </div>
      </Modal>

    </div>
  );
}
