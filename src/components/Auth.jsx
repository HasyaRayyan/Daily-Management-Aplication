import { useState } from 'react';
import { login, register, sendPasswordResetOtp, verifyOtpAndResetPassword } from '../lib/auth';

export default function Auth() {
  const [view, setView] = useState('login'); // 'login', 'register', 'forgot_password', 'reset_password'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [otp, setOtp] = useState('');
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
      if (result.error) {
        let errorMsg = result.error.message;
        if (errorMsg.includes('Invalid login credentials')) {
          errorMsg = 'Email atau password salah.';
        }
        setError(new Error(errorMsg));
      }
    } else if (view === 'register') {
      if (!displayName.trim()) {
        setError(new Error('Nama tidak boleh kosong.'));
        setLoading(false);
        return;
      }
      result = await register(email, password, displayName.trim());
      if (result.error) {
        let errorMsg = result.error.message;
        if (errorMsg.includes('User already registered')) {
          errorMsg = 'Email ini sudah terdaftar.';
        } else if (errorMsg.includes('Password should be at least')) {
          errorMsg = 'Password minimal 6 karakter.';
        }
        setError(new Error(errorMsg));
      } else if (result.user) {
        alert('Pendaftaran berhasil! Silakan masuk dengan akun baru Anda.');
        setView('login');
      }
    } else if (view === 'forgot_password') {
      result = await sendPasswordResetOtp(email);
      if (result.error) {
        setError(new Error(result.error.message));
      } else {
        setSuccessMsg('OTP telah dikirim ke email Anda. Silakan cek kotak masuk atau spam.');
        setView('reset_password');
      }
    } else if (view === 'reset_password') {
      result = await verifyOtpAndResetPassword(email, otp, password);
      if (result.error) {
        let errorMsg = result.error.message;
        if (errorMsg.includes('Token has expired or is invalid')) {
           errorMsg = 'OTP salah atau sudah kedaluwarsa.';
        }
        setError(new Error(errorMsg));
      } else {
        alert('Kata sandi berhasil direset! Silakan login dengan kata sandi baru.');
        setView('login');
      }
    }
    
    setLoading(false);
  };

  const renderHeader = () => {
    switch (view) {
      case 'login': return { title: 'Selamat Datang Kembali', subtitle: 'Silakan masuk menggunakan email akun Anda.' };
      case 'register': return { title: 'Buat Akun Baru', subtitle: 'Daftarkan email Anda untuk mulai mengelola hari.' };
      case 'forgot_password': return { title: 'Lupa Kata Sandi', subtitle: 'Masukkan email Anda untuk menerima kode OTP reset password.' };
      case 'reset_password': return { title: 'Reset Kata Sandi', subtitle: 'Masukkan kode OTP yang dikirim ke email dan kata sandi baru Anda.' };
      default: return { title: '', subtitle: '' };
    }
  };

  const { title, subtitle } = renderHeader();

  return (
    <div className="auth-page">
      {view !== 'login' && view !== 'register' && (
        <div className="auth-back-btn" onClick={() => { setView('login'); setError(null); setSuccessMsg(null); }} style={{cursor: 'pointer'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </div>
      )}
      {(view === 'login' || view === 'register') && (
        <div className="auth-back-btn">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </div>
      )}

      <div className="auth-logo-container">
        <div className="auth-logo">
          <div style={{ textAlign: 'center', fontSize: '10px', fontWeight: '800', lineHeight: '1' }}>
            <div style={{transform: 'rotate(-20deg)'}}>DAILY</div>
            <div style={{transform: 'rotate(10deg)'}}>MANAGER</div>
            <div style={{transform: 'rotate(-5deg)'}}>APP</div>
          </div>
        </div>
      </div>

      <div className="auth-header-text">
        <h1 className="auth-title">{title}</h1>
        <p className="auth-subtitle">{subtitle}</p>
      </div>

      {error && <div className="auth-error-msg">{error.message}</div>}
      {successMsg && <div className="auth-success-msg" style={{color: '#10b981', fontSize: '0.875rem', marginBottom: '1rem', textAlign: 'center', backgroundColor: '#ecfdf5', padding: '10px', borderRadius: '8px'}}>{successMsg}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        {view === 'register' && (
          <div className="form-group">
            <label className="form-label">NAMA LENGKAP</label>
            <input type="text" className="form-input" placeholder="Contoh: Hasya Rayyan" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          </div>
        )}

        {view !== 'reset_password' && (
          <div className="form-group">
            <label className="form-label">ALAMAT EMAIL</label>
            <input type="email" className="form-input" placeholder="email@contoh.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
          </div>
        )}

        {view === 'reset_password' && (
          <>
            <div className="form-group">
              <label className="form-label">KODE OTP</label>
              <input type="text" className="form-input" placeholder="Masukkan 6 digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">KATA SANDI BARU</label>
              <input type="password" className="form-input" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
          </>
        )}

        {(view === 'login' || view === 'register') && (
          <div className="form-group">
            <label className="form-label">KATA SANDI</label>
            <input type="password" className="form-input" placeholder="********" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} autoComplete={view === 'login' ? "current-password" : "new-password"} />
            {view === 'login' && (
              <button type="button" className="auth-forgot-link" onClick={() => { setView('forgot_password'); setError(null); }}>
                Lupa kata sandi?
              </button>
            )}
          </div>
        )}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Memproses...' : 
           view === 'login' ? 'Masuk Sekarang' : 
           view === 'register' ? 'Daftar Sekarang' : 
           view === 'forgot_password' ? 'Kirim OTP' : 'Reset Kata Sandi'}
        </button>
      </form>

      {(view === 'login' || view === 'register') && (
        <div className="auth-footer">
          <p>
            {view === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}
            <button type="button" className="auth-link" onClick={() => { setView(view === 'login' ? 'register' : 'login'); setError(null); }}>
              {view === 'login' ? 'Daftar di sini' : 'Masuk di sini'}
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
