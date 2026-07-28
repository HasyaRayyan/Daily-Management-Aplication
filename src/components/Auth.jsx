import { useState } from 'react';
import { login, register, sendPasswordResetOtp } from '../lib/auth';

export default function Auth() {
  const [view, setView] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    let result;
    if (view === 'login') {
      result = await login(email, password);
      if (result.error) setError(new Error('Email atau password salah.'));
    } else if (view === 'register') {
      if (!displayName.trim()) {
        setError(new Error('Nama tidak boleh kosong.'));
        setLoading(false);
        return;
      }
      result = await register(email, password, displayName.trim());
      if (result.error) setError(new Error(result.error.message));
      else if (result.user) {
        alert('Pendaftaran berhasil! Silakan masuk dengan akun baru Anda.');
        setView('login');
      }
    } else if (view === 'forgot_password') {
      result = await sendPasswordResetOtp(email);
      if (result.error) setError(new Error(result.error.message));
      else setSuccessMsg('Link reset password telah dikirim ke email Anda.');
    }
    setLoading(false);
  };

  const titles = {
    login: { title: 'Selamat Datang', sub: 'Silakan masuk menggunakan email Anda.' },
    register: { title: 'Buat Akun Baru', sub: 'Daftarkan email Anda untuk mulai mengelola hari.' },
    forgot_password: { title: 'Lupa Kata Sandi', sub: 'Masukkan email Anda untuk menerima link reset.' }
  };

  return (
    <div className="flex flex-col min-h-screen bg-brand-50 dark:bg-brand-950 p-6 md:p-12 items-center justify-center animate-fade-in">
      <div className="w-full max-w-sm">
        
        {/* Back Button */}
        {view !== 'login' && (
          <button 
            onClick={() => { setView('login'); setError(null); }} 
            className="w-10 h-10 flex items-center justify-center rounded-full border border-brand-200 dark:border-brand-800 bg-white dark:bg-brand-900 mb-8 hover:bg-brand-100 dark:hover:bg-brand-800 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
        )}

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-white dark:bg-brand-900 shadow-xl flex items-center justify-center overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-2" />
          </div>
        </div>

        {/* Text Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">{titles[view].title}</h1>
          <p className="text-brand-500 dark:text-brand-400 text-sm">{titles[view].sub}</p>
        </div>

        {/* Messages */}
        {error && <div className="bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-semibold text-center mb-6">{error.message}</div>}
        {successMsg && <div className="bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400 p-3 rounded-xl text-sm font-semibold text-center mb-6">{successMsg}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {view === 'register' && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-brand-700 dark:text-brand-300 tracking-wider">NAMA LENGKAP</label>
              <input type="text" className="input-field" placeholder="Hasya Rayyan" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
            </div>
          )}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-brand-700 dark:text-brand-300 tracking-wider">ALAMAT EMAIL</label>
            <input type="email" className="input-field" placeholder="email@contoh.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          {(view === 'login' || view === 'register') && (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-end">
                <label className="text-xs font-bold text-brand-700 dark:text-brand-300 tracking-wider">KATA SANDI</label>
                {view === 'login' && (
                  <button type="button" className="text-xs font-bold text-brand-500 hover:text-brand-900 dark:hover:text-white" onClick={() => setView('forgot_password')}>Lupa kata sandi?</button>
                )}
              </div>
              <input type="password" className="input-field" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
          )}
          
          <button type="submit" className="btn-primary mt-4" disabled={loading}>
            {loading ? 'Memproses...' : view === 'login' ? 'Masuk' : view === 'register' ? 'Daftar' : 'Kirim Link Reset'}
          </button>
        </form>

        {/* Footer */}
        {(view === 'login' || view === 'register') && (
          <div className="text-center mt-8 text-sm text-brand-500">
            {view === 'login' ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            <button onClick={() => setView(view === 'login' ? 'register' : 'login')} className="font-bold text-brand-900 dark:text-white hover:underline">
              {view === 'login' ? 'Daftar di sini' : 'Masuk di sini'}
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
