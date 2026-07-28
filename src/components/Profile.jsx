import { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import Header from './Header';
import { getProfile, updateProfile, uploadFile } from '../utils/storage';
import { logout, sendPasswordResetOtp } from '../lib/auth';

export default function Profile({ session, onBack }) {
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

  const displayName = profile?.display_name || session?.user?.user_metadata?.username || 'User';
  const avatarUrl = profile?.avatar_url;

  return (
    <div className="flex flex-col gap-6 px-5 pt-6 pb-24 animate-fade-in">
      <Header title="Profile" onBack={onBack} />

      {loading && !profile ? (
        <div className="text-center font-bold animate-pulse text-brand-500 py-10">Memuat profil...</div>
      ) : (
        <div className="flex flex-col items-center mt-4">
          
          <div className="relative mb-6">
            <div className="w-28 h-28 rounded-full bg-brand-100 dark:bg-brand-800 flex items-center justify-center font-bold text-4xl shadow-xl overflow-hidden border-4 border-white dark:border-brand-900">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 bg-brand-950 dark:bg-white text-white dark:text-brand-950 rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:scale-110 transition-transform border-2 border-white dark:border-brand-900"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </button>
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleAvatarChange}
            />
          </div>

          <h3 className="text-2xl font-extrabold mb-1">{displayName}</h3>
          <p className="text-brand-500 dark:text-brand-400 font-semibold mb-8">{session?.user?.email}</p>

          <div className="w-full flex flex-col gap-3">
            <h4 className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-1 px-2">Pengaturan</h4>
            
            <button onClick={toggleTheme} className="flex justify-between items-center w-full p-4 bg-white dark:bg-brand-900 border border-brand-100 dark:border-brand-800 rounded-2xl hover:bg-brand-50 dark:hover:bg-brand-800 transition-colors shadow-sm">
              <span className="font-bold flex items-center gap-3">
                {isDarkMode ? 'Mode Terang' : 'Mode Gelap'}
              </span>
            </button>

            <button onClick={() => { setNewName(displayName); setShowNameModal(true); }} className="flex justify-between items-center w-full p-4 bg-white dark:bg-brand-900 border border-brand-100 dark:border-brand-800 rounded-2xl hover:bg-brand-50 dark:hover:bg-brand-800 transition-colors shadow-sm">
              <span className="font-bold flex items-center gap-3">Ubah Nama</span>
            </button>

            <button onClick={handleResetPassword} disabled={resettingPassword} className="flex justify-between items-center w-full p-4 bg-white dark:bg-brand-900 border border-brand-100 dark:border-brand-800 rounded-2xl hover:bg-brand-50 dark:hover:bg-brand-800 transition-colors shadow-sm">
              <span className="font-bold flex items-center gap-3">{resettingPassword ? 'Mengirim Link...' : 'Ubah Kata Sandi'}</span>
            </button>

            <button onClick={() => logout()} className="flex justify-between items-center w-full p-4 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors shadow-sm mt-4">
              <span className="font-bold text-red-600 dark:text-red-400 flex items-center gap-3">Keluar (Logout)</span>
            </button>
          </div>
          <div className="mt-8 text-center text-xs font-bold text-brand-300 dark:text-brand-700">
            Aplikasi Versi {import.meta.env.VITE_APP_VERSION || '1.0.0'}
          </div>
        </div>
      )}

      <Modal isOpen={showNameModal} onClose={() => setShowNameModal(false)} title="Ubah Nama">
        <form onSubmit={handleUpdateName} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-brand-600 dark:text-brand-400 tracking-wider">NAMA LENGKAP</label>
            <input
              type="text"
              className="input-field"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary mt-2" disabled={!newName.trim() || saving}>
            {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
