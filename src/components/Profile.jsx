import { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { getProfile, updateProfile, uploadFile } from '../utils/storage';
import { logout, sendPasswordResetOtp } from '../lib/auth';

export default function Profile({ session }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNameModal, setShowNameModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

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

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!newName.trim() || saving) return;
    setSaving(true);
    await updateProfile({ display_name: newName.trim() });
    setShowNameModal(false);
    await fetchData();
    setSaving(false);
  };

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

  const handleResetPassword = async () => {
    if (!window.confirm("Kirim link reset kata sandi ke email Anda?")) return;
    setResettingPassword(true);
    const { error } = await sendPasswordResetOtp(session.user.email);
    if (error) {
      alert(`Gagal mengirim link: ${error.message}`);
    } else {
      alert("Link reset kata sandi telah dikirim ke email Anda! Silakan cek kotak masuk.");
    }
    setResettingPassword(false);
  };

  const displayName = profile?.display_name || session?.user?.user_metadata?.username || 'User';
  const avatarUrl = profile?.avatar_url;

  return (
    <div className="main-content profile-page">
      <div className="section-header">
        <h2>
          <span className="section-icon">👤</span>
          Profil Saya
        </h2>
      </div>

      {loading && !profile ? (
        <p>Memuat profil...</p>
      ) : (
        <div className="profile-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '2rem' }}>
          
          <div className="avatar-wrapper" style={{ position: 'relative', marginBottom: '1rem' }}>
            <div className="user-avatar" style={{ width: '100px', height: '100px', fontSize: '3rem', margin: '0' }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              style={{
                position: 'absolute', bottom: '0', right: '0',
                background: 'var(--primary)', color: 'white',
                border: 'none', borderRadius: '50%',
                width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              📷
            </button>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleAvatarChange}
            />
          </div>

          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{displayName}</h3>
          <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>{session?.user?.email}</p>

          <div className="settings-list" style={{ width: '100%', maxWidth: '400px' }}>
            <h4 style={{ fontSize: '0.875rem', color: 'var(--text-light)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Pengaturan</h4>
            
            <button className="settings-item" onClick={() => { setNewName(displayName); setShowNameModal(true); }}>
              <span>✏️ Ubah Nama</span>
              <span>›</span>
            </button>

            <button className="settings-item" onClick={handleResetPassword} disabled={resettingPassword}>
              <span>🔑 {resettingPassword ? 'Mengirim Link...' : 'Ubah Kata Sandi'}</span>
              <span>›</span>
            </button>

            <button className="settings-item" onClick={() => logout()} style={{ color: '#ef4444', marginTop: '1rem' }}>
              <span>🚪 Keluar (Logout)</span>
            </button>
          </div>
        </div>
      )}

      <Modal isOpen={showNameModal} onClose={() => setShowNameModal(false)} title="✏️ Ubah Nama">
        <form onSubmit={handleUpdateName}>
          <div className="form-group">
            <label className="form-label">Nama Lengkap</label>
            <input
              type="text"
              className="form-input"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={!newName.trim() || saving}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </Modal>

      <style>{`
        .settings-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          padding: 1rem;
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          border-radius: 12px;
          margin-bottom: 0.5rem;
          cursor: pointer;
          font-size: 1rem;
          color: var(--text-dark);
          transition: all 0.2s;
        }
        .settings-item:hover {
          background: var(--bg-main);
        }
      `}</style>
    </div>
  );
}
