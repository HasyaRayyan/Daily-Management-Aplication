import { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import Header from './Header';
import { getProfile, updateProfile, uploadFile, getCustomCategories, addCustomCategory, deleteCustomCategory, getTransactionsWithLocation } from '../utils/storage';
import { logout, sendPasswordResetOtp } from '../lib/auth';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

export default function Profile({ session, onBack }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showNameModal, setShowNameModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [saving, setSaving] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);

  // States for Custom Categories
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [customCategories, setCustomCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [categoryType, setCategoryType] = useState('expense');
  const [newCategoryName, setNewCategoryName] = useState('');

  // States for Map
  const [mapTransactions, setMapTransactions] = useState([]);
  const [mapLoading, setMapLoading] = useState(true);

  const fileInputRef = useRef(null);

  const fetchData = async () => {
    setLoading(true);
    const data = await getProfile();
    setProfile(data);
    setLoading(false);
    
    setMapLoading(true);
    const mData = await getTransactionsWithLocation();
    setMapTransactions(mData);
    setMapLoading(false);
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

  // Custom cluster icon creation function
  const createClusterCustomIcon = function (cluster) {
    return L.divIcon({
      html: `<div style="background-color: #10B981; color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
               ${cluster.getChildCount()}
             </div>`,
      className: 'custom-marker-cluster',
      iconSize: L.point(40, 40, true),
    });
  };

  return (
    <div className="flex flex-col gap-6 px-5 pt-6 pb-24 md:pb-8 animate-fade-in">
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

            <button onClick={openCategoryModal} className="flex justify-between items-center w-full p-4 bg-white dark:bg-brand-900 border border-brand-100 dark:border-brand-800 rounded-2xl hover:bg-brand-50 dark:hover:bg-brand-800 transition-colors shadow-sm">
              <span className="font-bold flex items-center gap-3">Kelola Kategori Kustom</span>
            </button>

            <button onClick={handleResetPassword} disabled={resettingPassword} className="flex justify-between items-center w-full p-4 bg-white dark:bg-brand-900 border border-brand-100 dark:border-brand-800 rounded-2xl hover:bg-brand-50 dark:hover:bg-brand-800 transition-colors shadow-sm">
              <span className="font-bold flex items-center gap-3">{resettingPassword ? 'Mengirim Link...' : 'Ubah Kata Sandi'}</span>
            </button>

            <button onClick={() => logout()} className="flex justify-between items-center w-full p-4 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors shadow-sm mt-4">
              <span className="font-bold text-red-600 dark:text-red-400 flex items-center gap-3">Keluar (Logout)</span>
            </button>
          </div>
          <div className="mt-8 text-center text-xs font-bold text-brand-300 dark:text-brand-700 mb-2">
            Aplikasi Versi {import.meta.env.VITE_APP_VERSION || '1.0.0'}
          </div>

          {/* Peta Transaksi */}
          <div className="w-full flex flex-col gap-3 mt-4 mb-4">
            <h4 className="text-xs font-bold text-brand-400 uppercase tracking-widest mb-1 px-2">Peta Bukti Transaksi</h4>
            <div className="w-full h-72 bg-brand-100 dark:bg-brand-900 rounded-2xl overflow-hidden shadow-sm border border-brand-200 dark:border-brand-800 z-10 relative">
              {mapLoading ? (
                <div className="w-full h-full flex items-center justify-center font-bold text-brand-500 animate-pulse">Memuat Peta...</div>
              ) : mapTransactions.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center font-bold text-brand-500 text-sm text-center px-4">Belum ada transaksi dengan lokasi</div>
              ) : (
                <MapContainer center={[mapTransactions[0].latitude, mapTransactions[0].longitude]} zoom={13} style={{ height: '100%', width: '100%', zIndex: 1 }}>
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
                  />
                  <MarkerClusterGroup chunkedLoading iconCreateFunction={createClusterCustomIcon}>
                    {mapTransactions.map((t) => {
                      const photoUrl = t.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(t.title)}&background=10B981&color=fff&size=128&bold=true`;
                      const customIcon = L.divIcon({
                        className: 'custom-photo-marker',
                        html: `<div style="width: 48px; height: 48px; border-radius: 12px; overflow: hidden; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.2); background-color: #eee;">
                                 <img src="${photoUrl}" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'" />
                               </div>`,
                        iconSize: [48, 48],
                        iconAnchor: [24, 48],
                        popupAnchor: [0, -48]
                      });
  
                      return (
                        <Marker key={t.id} position={[t.latitude, t.longitude]} icon={customIcon}>
                          <Popup>
                            <div className="flex flex-col gap-1 items-center min-w-[100px]">
                              <span className="font-bold text-xs text-center">{t.title}</span>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
                  </MarkerClusterGroup>
                </MapContainer>
              )}
            </div>
          </div>

        </div>
      )}

      {/* Modal Ubah Nama */}
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
              <p className="text-center font-bold text-brand-500 py-4 animate-pulse">Memuat...</p>
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
