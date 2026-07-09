import { useState } from 'react';
import { login, register } from '../lib/auth';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let result;
    if (isLogin) {
      result = await login(email, password);
    } else {
      if (!username.trim()) {
        setError(new Error('Username tidak boleh kosong.'));
        setLoading(false);
        return;
      }
      result = await register(email, password, username.trim());
    }

    if (result.error) {
      // Menangani error dari Supabase
      let errorMsg = result.error.message;
      if (errorMsg.includes('Invalid login credentials')) {
        errorMsg = 'Email atau password salah.';
      } else if (errorMsg.includes('User already registered')) {
        errorMsg = 'Email ini sudah terdaftar.';
      }
      setError(new Error(errorMsg));
    } else if (!isLogin && result.user) {
      // Supabase kadang mengharuskan verifikasi email, tapi jika email confirmation dimatikan,
      // user akan langsung login.
      alert('Pendaftaran berhasil! Jika tidak otomatis login, silakan login dengan akun yang baru dibuat.');
      setIsLogin(true);
    }
    
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Daily Manager ✨</h1>
          <p>{isLogin ? 'Selamat datang kembali!' : 'Buat akun barumu.'}</p>
        </div>

        {error && (
          <div className="auth-error">
            <span>⚠️</span> {error.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-input"
                placeholder="Contoh: rayyan123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="nama@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Minimal 6 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !email || !password || (!isLogin && !username)}
          >
            {loading ? 'Memproses...' : (isLogin ? 'Masuk' : 'Daftar')}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isLogin ? 'Belum punya akun? ' : 'Sudah punya akun? '}
            <button
              type="button"
              className="auth-link-btn"
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
    </div>
  );
}
