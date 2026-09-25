import { useState } from 'react';
import { login, register, sendPasswordResetOtp } from '../lib/auth';

// Icons
const IconSun = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

const IconCheckCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const IconAlertCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const IconSpinner = () => (
  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24">
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
        setError(new Error('Email atau kata sandi tidak sesuai. Silakan periksa kembali.'));
      }
    } else if (view === 'register') {
      if (!displayName.trim()) {
        setError(new Error('Nama lengkap tidak boleh kosong.'));
        setLoading(false);
        return;
      }
      if (password.length < 6) {
        setError(new Error('Kata sandi harus minimal 6 karakter.'));
        setLoading(false);
        return;
      }
      result = await register(email, password, displayName.trim());
      if (result.error) {
        setError(new Error(result.error.message));
      } else if (result.user) {
        setSuccessMsg('Pendaftaran berhasil! Akun Anda siap digunakan. Silakan masuk.');
        setView('login');
      }
    } else if (view === 'forgot_password') {
      result = await sendPasswordResetOtp(email);
      if (result.error) {
        setError(new Error(result.error.message));
      } else {
        setSuccessMsg('Link pemulihan kata sandi telah dikirim ke email Anda. Periksa kotak masuk atau spam.');
      }
    }
    setLoading(false);
  };

  const titles = {
    login: {
      title: 'Selamat Datang',
      sub: 'Masuk dengan kredensial akun Anda untuk mengelola aktivitas harian.'
    },
    register: {
      title: 'Buat Akun Baru',
      sub: 'Daftarkan diri Anda untuk menikmati seluruh fitur produktivitas.'
    },
    forgot_password: {
      title: 'Pemulihan Kata Sandi',
      sub: 'Masukkan alamat email yang terdaftar untuk menerima link reset.'
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6 lg:p-10 relative overflow-x-hidden">
      {/* Ambient Decorative Background Glows */}
      <div className="absolute -top-32 -left-32 w-80 sm:w-96 h-80 sm:h-96 bg-brand-300/30 dark:bg-brand-700/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 sm:w-96 h-80 sm:h-96 bg-brand-400/20 dark:bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-200/20 dark:bg-brand-800/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphism Card */}
      <div className="w-full max-w-5xl bg-white/80 dark:bg-brand-900/80 backdrop-blur-2xl border border-brand-200/80 dark:border-brand-800/80 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.06)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10 transition-colors duration-300">
        
        {/* Left Column: Brand Showcase (Visible on Large Screens) */}
        <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-10 xl:p-12 bg-gradient-to-br from-brand-950 via-brand-900 to-black text-white relative rounded-[2rem] m-3 overflow-hidden shadow-2xl border border-brand-800/40">
          {/* Subtle Graphic Orbs */}
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          {/* Top Brand Pill */}
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold tracking-wider text-brand-200 mb-6">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              DAILY MANAGEMENT APP
            </div>

            <h2 className="text-3xl xl:text-4xl font-black tracking-tight leading-tight mb-4">
              Kelola Hari & Finansial Lebih Terstruktur.
            </h2>
            <p className="text-brand-300 text-sm leading-relaxed">
              Platform all-in-one untuk mengatur tugas harian, jadwal agenda cerdas, dan pencatatan keuangan modern dalam satu genggaman.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="relative z-10 space-y-4 my-8">
            <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Tugas & Prioritas</h4>
                <p className="text-xs text-brand-300">Pantau progres to-do list harian dengan mudah</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Jadwal & Pengingat</h4>
                <p className="text-xs text-brand-300">Notifikasi otomatis tepat waktu sebelum agenda dimulai</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Pencatatan & Scan QRIS</h4>
                <p className="text-xs text-brand-300">Deteksi nominal otomatis & analisis cashflow</p>
              </div>
            </div>
          </div>

          {/* Bottom Security Badge */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-brand-400">
            <span>🔒 Terenkripsi & Aman</span>
            <span>Didukung Supabase Cloud</span>
          </div>
        </div>

        {/* Right Column: Authentication Form (Responsive for all screens) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col justify-center p-6 sm:p-10 lg:p-12 relative">
          
          {/* Top Bar: Theme Switcher */}
          <div className="flex justify-end items-center mb-6">
            <div>
              <button
                type="button"
                onClick={toggleDarkMode}
                aria-label="Ganti Tema Tampilan"
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-white dark:bg-brand-800 text-brand-700 dark:text-brand-200 border border-brand-200 dark:border-brand-700 shadow-sm hover:bg-brand-50 dark:hover:bg-brand-700/80 transition-all cursor-pointer"
              >
                {isDark ? (
                  <>
                    <span className="text-amber-400"><IconSun /></span>
                    <span className="hidden sm:inline">Mode Terang</span>
                  </>
                ) : (
                  <>
                    <span className="text-brand-600"><IconMoon /></span>
                    <span className="hidden sm:inline">Mode Gelap</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Back button for Forgot Password */}
          {view === 'forgot_password' && (
            <button
              type="button"
              onClick={() => { setView('login'); setError(null); setSuccessMsg(null); }}
              className="inline-flex items-center gap-2 text-xs font-bold text-brand-500 hover:text-brand-950 dark:hover:text-white mb-6 group transition-colors self-start cursor-pointer"
            >
              <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15 18l-6-6 6-6" />
              </svg>
              <span>Kembali ke Halaman Masuk</span>
            </button>
          )}

          {/* Segmented Switcher for Login / Register */}
          {view !== 'forgot_password' && (
            <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-brand-100/80 dark:bg-brand-950/60 border border-brand-200 dark:border-brand-800/80 mb-6">
              <button
                type="button"
                onClick={() => { setView('login'); setError(null); setSuccessMsg(null); }}
                className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  view === 'login'
                    ? 'bg-white dark:bg-brand-800 text-brand-950 dark:text-white shadow-sm scale-[1.01]'
                    : 'text-brand-500 hover:text-brand-950 dark:hover:text-brand-200'
                }`}
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => { setView('register'); setError(null); setSuccessMsg(null); }}
                className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 cursor-pointer ${
                  view === 'register'
                    ? 'bg-white dark:bg-brand-800 text-brand-950 dark:text-white shadow-sm scale-[1.01]'
                    : 'text-brand-500 hover:text-brand-950 dark:hover:text-brand-200'
                }`}
              >
                Buat Akun
              </button>
            </div>
          )}

          {/* Form Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-950 dark:text-white mb-2">
              {titles[view].title}
            </h1>
            <p className="text-brand-500 dark:text-brand-400 text-xs sm:text-sm leading-relaxed">
              {titles[view].sub}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 p-4 rounded-2xl text-xs sm:text-sm font-medium mb-6 animate-slide-up">
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

          {/* Success Message */}
          {successMsg && (
            <div className="flex items-start gap-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-300 p-4 rounded-2xl text-xs sm:text-sm font-medium mb-6 animate-slide-up">
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
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 sm:gap-5">
            {/* Display Name (Only in Register) */}
            {view === 'register' && (
              <div className="flex flex-col gap-1.5 animate-slide-up">
                <label className="text-xs font-bold text-brand-700 dark:text-brand-300 tracking-wider">
                  NAMA LENGKAP
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-400 dark:text-brand-500">
                    <IconUser />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap Anda"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 sm:py-4 rounded-2xl bg-white/70 dark:bg-brand-950/60 backdrop-blur-md border border-brand-200 dark:border-brand-800 focus:border-brand-950 dark:focus:border-brand-200 focus:ring-4 focus:ring-brand-950/10 dark:focus:ring-white/10 outline-none transition-all text-sm font-medium text-brand-950 dark:text-white placeholder:text-brand-400"
                  />
                </div>
              </div>
            )}

            {/* Email Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-brand-700 dark:text-brand-300 tracking-wider">
                ALAMAT EMAIL
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-400 dark:text-brand-500">
                  <IconMail />
                </div>
                <input
                  type="email"
                  required
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 sm:py-4 rounded-2xl bg-white/70 dark:bg-brand-950/60 backdrop-blur-md border border-brand-200 dark:border-brand-800 focus:border-brand-950 dark:focus:border-brand-200 focus:ring-4 focus:ring-brand-950/10 dark:focus:ring-white/10 outline-none transition-all text-sm font-medium text-brand-950 dark:text-white placeholder:text-brand-400"
                />
              </div>
            </div>

            {/* Password Field (Login & Register) */}
            {(view === 'login' || view === 'register') && (
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-brand-700 dark:text-brand-300 tracking-wider">
                    KATA SANDI
                  </label>
                  {view === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setView('forgot_password'); setError(null); setSuccessMsg(null); }}
                      className="text-xs font-bold text-brand-500 hover:text-brand-950 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      Lupa kata sandi?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-brand-400 dark:text-brand-500">
                    <IconLock />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    placeholder="Minimal 6 karakter"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3.5 sm:py-4 rounded-2xl bg-white/70 dark:bg-brand-950/60 backdrop-blur-md border border-brand-200 dark:border-brand-800 focus:border-brand-950 dark:focus:border-brand-200 focus:ring-4 focus:ring-brand-950/10 dark:focus:ring-white/10 outline-none transition-all text-sm font-medium text-brand-950 dark:text-white placeholder:text-brand-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Lihat kata sandi'}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-brand-400 hover:text-brand-700 dark:hover:text-brand-200 transition-colors cursor-pointer focus:outline-none"
                  >
                    {showPassword ? <IconEyeOff /> : <IconEye />}
                  </button>
                </div>

                {/* Password helper in Register */}
                {view === 'register' && (
                  <div className="flex items-center gap-1.5 mt-1 text-[11px] text-brand-500 dark:text-brand-400">
                    <span className={`w-2 h-2 rounded-full ${password.length >= 6 ? 'bg-emerald-500' : 'bg-brand-300 dark:bg-brand-700'}`} />
                    <span>{password.length >= 6 ? 'Panjang kata sandi memenuhi syarat' : 'Gunakan minimal 6 karakter'}</span>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-4 px-6 rounded-2xl bg-brand-950 dark:bg-white text-white dark:text-brand-950 font-bold text-sm sm:text-base flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
            >
              {loading && <IconSpinner />}
              <span>
                {loading
                  ? 'Memproses...'
                  : view === 'login'
                  ? 'Masuk ke Akun'
                  : view === 'register'
                  ? 'Daftar Sekarang'
                  : 'Kirim Link Reset'}
              </span>
            </button>
          </form>

          {/* Footer toggle text */}
          <div className="mt-8 pt-6 border-t border-brand-200/60 dark:border-brand-800/60 text-center text-xs sm:text-sm text-brand-500 dark:text-brand-400">
            {view === 'login' ? (
              <>
                Belum memiliki akun?{' '}
                <button
                  type="button"
                  onClick={() => { setView('register'); setError(null); setSuccessMsg(null); }}
                  className="font-bold text-brand-950 dark:text-white hover:underline cursor-pointer"
                >
                  Daftar di sini
                </button>
              </>
            ) : view === 'register' ? (
              <>
                Sudah memiliki akun?{' '}
                <button
                  type="button"
                  onClick={() => { setView('login'); setError(null); setSuccessMsg(null); }}
                  className="font-bold text-brand-950 dark:text-white hover:underline cursor-pointer"
                >
                  Masuk di sini
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

          {/* Micro Footer Note */}
          <div className="mt-4 text-center">
            <p className="text-[11px] text-brand-400 dark:text-brand-600">
              © {new Date().getFullYear()} DAILY Application. All rights reserved.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
