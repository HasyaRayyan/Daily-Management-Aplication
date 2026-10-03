import { useState } from 'react';
import { login, register, sendPasswordResetOtp } from '../lib/auth';

// Icons
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

const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconMail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="16" x="2" y="4" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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

const IconAlertCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IconCheckCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const IconSpinner = () => (
  <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="0 12 12"
        to="360 12 12"
        dur="0.75s"
        repeatCount="indefinite"
      />
    </path>
  </svg>
);

export default function Auth() {
  const [view, setView] = useState('login'); // 'login' | 'register' | 'forgot_password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    let result;
    if (view === 'login') {
      result = await login(email, password);
      if (result.error) {
        setError(new Error('Email atau kata sandi tidak cocok. Silakan coba lagi.'));
      }
    } else if (view === 'register') {
      if (!displayName.trim()) {
        setError(new Error('Nama lengkap tidak boleh kosong.'));
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError(new Error('Kata sandi minimal 6 karakter.'));
        setLoading(false);
        return;
      }
      result = await register(email, password, displayName.trim());
      if (result.error) {
        setError(new Error(result.error.message));
      } else if (result.user) {
        setSuccessMsg('Akun berhasil dibuat. Silakan masuk.');
        setView('login');
      }
    } else if (view === 'forgot_password') {
      result = await sendPasswordResetOtp(email);
      if (result.error) {
        setError(new Error(result.error.message));
      } else {
        setSuccessMsg('Tautan pemulihan kata sandi telah dikirim ke email Anda.');
      }
    }
    setLoading(false);
  };

  const titles = {
    login: {
      title: 'Masuk ke Akun',
      sub: 'Masukkan email dan kata sandi untuk melanjutkan.'
    },
    register: {
      title: 'Daftar Akun',
      sub: 'Lengkapi data berikut untuk membuat akun baru.'
    },
    forgot_password: {
      title: 'Lupa Kata Sandi',
      sub: 'Masukkan email terdaftar untuk menerima tautan reset.'
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-4 py-8 bg-brand-50 dark:bg-brand-950 transition-colors">
      
      {/* Theme Switcher Button */}
      <div className="fixed top-5 right-5 z-20">
        <button
          type="button"
          onClick={toggleDarkMode}
          aria-label={isDark ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
          className="p-2.5 rounded-xl bg-white dark:bg-brand-900 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800 shadow-xs hover:bg-brand-100 dark:hover:bg-brand-800 transition-all cursor-pointer"
        >
          {isDark ? <IconSun /> : <IconMoon />}
        </button>
      </div>

      {/* Main Form Container */}
      <div className="w-full max-w-[420px] bg-white dark:bg-brand-900 border border-brand-200/90 dark:border-brand-800 rounded-3xl p-6 sm:p-8 shadow-xs animate-fade-in">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-brand-950 dark:bg-white text-white dark:text-brand-950 font-black text-xl mb-3 shadow-xs">
            D
          </div>
          <h1 className="text-2xl font-black tracking-tight text-brand-950 dark:text-white">
            {titles[view].title}
          </h1>
          <p className="text-xs sm:text-sm text-brand-500 dark:text-brand-400 mt-1.5 leading-relaxed">
            {titles[view].sub}
          </p>
        </div>

        {/* Back Link for Forgot Password */}
        {view === 'forgot_password' && (
          <button
            type="button"
            onClick={() => { setView('login'); setError(null); setSuccessMsg(null); }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-500 hover:text-brand-950 dark:hover:text-white mb-5 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span>Kembali ke halaman masuk</span>
          </button>
        )}

        {/* Tab Switcher (Masuk / Daftar) */}
        {view !== 'forgot_password' && (
          <div className="grid grid-cols-2 p-1 rounded-xl bg-brand-100 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 mb-6">
            <button
              type="button"
              onClick={() => { setView('login'); setError(null); setSuccessMsg(null); }}
              className={`py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                view === 'login'
                  ? 'bg-white dark:bg-brand-800 text-brand-950 dark:text-white shadow-xs'
                  : 'text-brand-500 hover:text-brand-950 dark:hover:text-brand-200'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => { setView('register'); setError(null); setSuccessMsg(null); }}
              className={`py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                view === 'register'
                  ? 'bg-white dark:bg-brand-800 text-brand-950 dark:text-white shadow-xs'
                  : 'text-brand-500 hover:text-brand-950 dark:hover:text-brand-200'
              }`}
            >
              Daftar
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="flex items-start gap-2.5 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 p-3.5 rounded-xl text-xs sm:text-sm font-medium mb-5 animate-slide-up">
            <div className="text-red-500 shrink-0 mt-0.5">
              <IconAlertCircle />
            </div>
            <div className="flex-1">{error.message}</div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-700 dark:hover:text-red-200 shrink-0 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="flex items-start gap-2.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 p-3.5 rounded-xl text-xs sm:text-sm font-medium mb-5 animate-slide-up">
            <div className="text-emerald-500 shrink-0 mt-0.5">
              <IconCheckCircle />
            </div>
            <div className="flex-1">{successMsg}</div>
            <button
              type="button"
              onClick={() => setSuccessMsg(null)}
              className="text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-200 shrink-0 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Full Name (Register Only) */}
          {view === 'register' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-brand-700 dark:text-brand-300">
                Nama Lengkap
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-400 dark:text-brand-500">
                  <IconUser />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Nama Anda"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-brand-50/50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 focus:border-brand-950 dark:focus:border-white focus:bg-white dark:focus:bg-brand-900 focus:outline-none transition-all text-sm text-brand-950 dark:text-white placeholder:text-brand-400"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-brand-700 dark:text-brand-300">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-400 dark:text-brand-500">
                <IconMail />
              </div>
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-brand-50/50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 focus:border-brand-950 dark:focus:border-white focus:bg-white dark:focus:bg-brand-900 focus:outline-none transition-all text-sm text-brand-950 dark:text-white placeholder:text-brand-400"
              />
            </div>
          </div>

          {/* Password (Login & Register) */}
          {(view === 'login' || view === 'register') && (
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-brand-700 dark:text-brand-300">
                  Kata Sandi
                </label>
                {view === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setView('forgot_password'); setError(null); setSuccessMsg(null); }}
                    className="text-xs font-semibold text-brand-500 hover:text-brand-950 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Lupa kata sandi?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-400 dark:text-brand-500">
                  <IconLock />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-brand-50/50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 focus:border-brand-950 dark:focus:border-white focus:bg-white dark:focus:bg-brand-900 focus:outline-none transition-all text-sm text-brand-950 dark:text-white placeholder:text-brand-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-brand-400 hover:text-brand-700 dark:hover:text-brand-200 transition-colors cursor-pointer"
                >
                  {showPassword ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-5 rounded-xl bg-brand-950 dark:bg-white text-white dark:text-brand-950 font-bold text-sm flex items-center justify-center gap-2 hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-60 disabled:pointer-events-none cursor-pointer shadow-xs"
          >
            {loading && <IconSpinner />}
            <span>
              {loading
                ? 'Memproses...'
                : view === 'login'
                ? 'Masuk'
                : view === 'register'
                ? 'Daftar'
                : 'Kirim Tautan'}
            </span>
          </button>
        </form>

        {/* Footer Switcher */}
        <div className="mt-6 pt-5 border-t border-brand-100 dark:border-brand-800 text-center text-xs text-brand-500 dark:text-brand-400">
          {view === 'login' ? (
            <>
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={() => { setView('register'); setError(null); setSuccessMsg(null); }}
                className="font-bold text-brand-950 dark:text-white hover:underline cursor-pointer"
              >
                Daftar sekarang
              </button>
            </>
          ) : view === 'register' ? (
            <>
              Sudah punya akun?{' '}
              <button
                type="button"
                onClick={() => { setView('login'); setError(null); setSuccessMsg(null); }}
                className="font-bold text-brand-950 dark:text-white hover:underline cursor-pointer"
              >
                Masuk
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => { setView('login'); setError(null); setSuccessMsg(null); }}
              className="font-bold text-brand-950 dark:text-white hover:underline cursor-pointer"
            >
              Kembali ke halaman masuk
            </button>
          )}
        </div>

      </div>

      {/* Subtle Micro Footer */}
      <div className="mt-6 text-center">
        <p className="text-xs text-brand-400 dark:text-brand-600">
          Daily Management
        </p>
      </div>

    </div>
  );
}
