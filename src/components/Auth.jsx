import { useState, useEffect } from 'react';
import { login, register, sendPasswordResetOtp } from '../lib/auth';

// Clean Minimalist Icons
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

  // Set Light Mode for Login Screen
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

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
      sub: 'Masukkan email dan kata sandi Anda'
    },
    register: {
      title: 'Buat Akun Baru',
      sub: 'Daftar untuk mulai mengelola aktivitas harian'
    },
    forgot_password: {
      title: 'Lupa Kata Sandi',
      sub: 'Masukkan email Anda untuk menerima link reset'
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-4 py-10 bg-[#FAFAFA] text-zinc-900">
      
      {/* Centered Login Card */}
      <div className="w-full max-w-[390px] bg-white border border-zinc-200/90 rounded-3xl p-7 sm:p-9 shadow-[0_4px_25px_rgba(0,0,0,0.04)] animate-fade-in">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">
            {titles[view].title}
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            {titles[view].sub}
          </p>
        </div>

        {/* Back Link for Forgot Password */}
        {view === 'forgot_password' && (
          <button
            type="button"
            onClick={() => { setView('login'); setError(null); setSuccessMsg(null); }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 hover:text-zinc-950 mb-5 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            <span>Kembali ke halaman masuk</span>
          </button>
        )}

        {/* Tab Segment (Masuk / Daftar) */}
        {view !== 'forgot_password' && (
          <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-100 border border-zinc-200/60 mb-6">
            <button
              type="button"
              onClick={() => { setView('login'); setError(null); setSuccessMsg(null); }}
              className={`py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                view === 'login'
                  ? 'bg-white text-zinc-950 shadow-xs font-bold'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Masuk
            </button>
            <button
              type="button"
              onClick={() => { setView('register'); setError(null); setSuccessMsg(null); }}
              className={`py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                view === 'register'
                  ? 'bg-white text-zinc-950 shadow-xs font-bold'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Daftar
            </button>
          </div>
        )}

        {/* Alert Error */}
        {error && (
          <div className="flex items-start gap-2.5 bg-red-50 border border-red-200/80 text-red-700 p-3 rounded-xl text-xs sm:text-sm font-medium mb-5 animate-slide-up">
            <div className="text-red-500 shrink-0 mt-0.5">
              <IconAlertCircle />
            </div>
            <div className="flex-1 leading-snug">{error.message}</div>
            <button
              type="button"
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-700 shrink-0 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Alert Success */}
        {successMsg && (
          <div className="flex items-start gap-2.5 bg-emerald-50 border border-emerald-200/80 text-emerald-800 p-3 rounded-xl text-xs sm:text-sm font-medium mb-5 animate-slide-up">
            <div className="text-emerald-500 shrink-0 mt-0.5">
              <IconCheckCircle />
            </div>
            <div className="flex-1 leading-snug">{successMsg}</div>
            <button
              type="button"
              onClick={() => setSuccessMsg(null)}
              className="text-emerald-400 hover:text-emerald-700 shrink-0 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Full Name (Register Only) */}
          {view === 'register' && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-zinc-700">
                Nama Lengkap
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-zinc-400 pointer-events-none">
                  <IconUser />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Nama Anda"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl bg-zinc-50/70 border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 focus:outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-zinc-700">
              Email
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3.5 text-zinc-400 pointer-events-none">
                <IconMail />
              </div>
              <input
                type="email"
                required
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 sm:py-3 rounded-xl bg-zinc-50/70 border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Password (Login & Register) */}
          {(view === 'login' || view === 'register') && (
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-zinc-700">
                  Kata Sandi
                </label>
                {view === 'login' && (
                  <button
                    type="button"
                    onClick={() => { setView('forgot_password'); setError(null); setSuccessMsg(null); }}
                    className="text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
                  >
                    Lupa kata sandi?
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-zinc-400 pointer-events-none">
                  <IconLock />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  placeholder="Minimal 6 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-11 py-2.5 sm:py-3 rounded-xl bg-zinc-50/70 border border-zinc-200 text-sm text-zinc-900 placeholder:text-zinc-400 focus:bg-white focus:border-zinc-900 focus:ring-4 focus:ring-zinc-900/5 focus:outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                  className="absolute right-3.5 text-zinc-400 hover:text-zinc-700 transition-colors cursor-pointer"
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
            className="w-full mt-2 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-black active:scale-[0.99] text-white font-semibold text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
          >
            {loading && <IconSpinner />}
            <span>
              {loading
                ? 'Memproses...'
                : view === 'login'
                ? 'Masuk'
                : view === 'register'
                ? 'Buat Akun'
                : 'Kirim Link Reset'}
            </span>
          </button>
        </form>

        {/* Footer Toggle Text */}
        <div className="mt-6 pt-5 border-t border-zinc-100 text-center text-xs text-zinc-500">
          {view === 'login' ? (
            <>
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={() => { setView('register'); setError(null); setSuccessMsg(null); }}
                className="font-bold text-zinc-900 hover:underline cursor-pointer"
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
                className="font-bold text-zinc-900 hover:underline cursor-pointer"
              >
                Masuk
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => { setView('login'); setError(null); setSuccessMsg(null); }}
              className="font-bold text-zinc-900 hover:underline cursor-pointer"
            >
              Kembali ke halaman masuk
            </button>
          )}
        </div>

      </div>

      {/* Clean Bottom Label */}
      <div className="mt-6 text-center">
        <p className="text-xs text-zinc-400 font-medium">
          Daily Management
        </p>
      </div>

    </div>
  );
}
