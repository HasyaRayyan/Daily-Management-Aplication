import { useState } from 'react';
import { login, register } from '../lib/auth';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let result;
    if (isLogin) {
      result = await login(identifier, password);
    } else {
      if (!displayName.trim()) {
        setError(new Error('Nama tidak boleh kosong.'));
        setLoading(false);
        return;
      }
      result = await register(identifier, password, displayName.trim());
    }

    if (result.error) {
      // Menangani error dari Supabase
      let errorMsg = result.error.message;
      if (errorMsg.includes('Invalid login credentials')) {
        errorMsg = 'Username/No HP atau password salah.';
      } else if (errorMsg.includes('User already registered')) {
        errorMsg = 'Username/No HP ini sudah terdaftar.';
      } else if (errorMsg.includes('Password should be at least')) {
        errorMsg = 'Password minimal 6 karakter.';
      }
      setError(new Error(errorMsg));
    } else if (!isLogin && result.user) {
      alert('Pendaftaran berhasil! Silakan masuk dengan akun baru Anda.');
      setIsLogin(true);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-page">
      {/* Tombol Back Opsional */}
      <div className="auth-back-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </div>

      <div className="auth-logo-container">
        <div className="auth-logo">
          {/* Menggunakan placeholder teks tebal seperti di referensi jika tidak ada gambar */}
          <div style={{ textAlign: 'center', fontSize: '10px', fontWeight: '800', lineHeight: '1' }}>
            <div style={{transform: 'rotate(-20deg)'}}>DAILY</div>
            <div style={{transform: 'rotate(10deg)'}}>MANAGER</div>
            <div style={{transform: 'rotate(-5deg)'}}>APP</div>
          </div>
        </div>
      </div>

      <div className="auth-header-text">
        <h1 className="auth-title">
          {isLogin ? 'Selamat Datang Kembali' : 'Buat Akun Baru'}
        </h1>
        <p className="auth-subtitle">
          {isLogin 
            ? 'Silakan masuk menggunakan nomor HP atau username akun Anda.'
            : 'Daftarkan nomor HP atau username Anda untuk mulai mengelola hari.'}
        </p>
      </div>

      {error && (
        <div className="auth-error-msg">
          {error.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form">
        {!isLogin && (
          <div className="form-group">
            <label className="form-label">NAMA LENGKAP</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Hasya Rayyan"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required={!isLogin}
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">NOMOR HP / USERNAME</label>
          <input
            type="text"
            className="form-input"
            placeholder="08xxxxxxxxxx"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
            autoComplete="username"
          />
        </div>

        <div className="form-group">
          <label className="form-label">KATA SANDI</label>
          <input
            type="password"
            className="form-input"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={isLogin ? "current-password" : "new-password"}
          />
          {isLogin && (
            <button type="button" className="auth-forgot-link">
              Lupa kata sandi?
            </button>
          )}
        </div>

        <button
          type="submit"
          className="btn-primary"
          disabled={loading || !identifier || !password || (!isLogin && !displayName)}
        >
          {loading ? 'Memproses...' : 'Masuk Sekarang'}
        </button>
      </form>

      <div className="auth-footer">
        <p>
          {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}
          <button
            type="button"
            className="auth-link"
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
          >
            {isLogin ? 'Daftar di sini' : 'Masuk di sini'}
          </button>
        </p>
      </div>
    </div>
  );
}
