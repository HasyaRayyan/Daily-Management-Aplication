import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Routine from './components/Routine';
import Schedule from './components/Schedule';
import Finance from './components/Finance';
import Profile from './components/Profile';
import Auth from './components/Auth';
import Modal from './components/Modal';
import { getSession, onAuthStateChange, updatePassword } from './lib/auth';
import { getSchedules, getAppVersion } from './utils/storage';
import { getDateKey } from './utils/helpers';
import { supabase } from './lib/supabase';
import { Geolocation } from '@capacitor/geolocation';
import './index.css';

// Icons
const IconHome = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconCheckSquare = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>;
const IconCalendar = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
const IconWallet = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>;
const IconUser = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [alertSchedule, setAlertSchedule] = useState(null);
  const [needsUpdate, setNeedsUpdate] = useState(false);

  useEffect(() => {
    // Initialize Theme
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    getSession().then(({ session }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'PASSWORD_RECOVERY') setRecoveryMode(true);
    });

    // Check App Version
    const checkVersion = async () => {
      const latestVersion = await getAppVersion();
      const currentVersion = import.meta.env.VITE_APP_VERSION;
      if (latestVersion && currentVersion && latestVersion !== currentVersion) {
        setNeedsUpdate(true);
      }
    };
    checkVersion();

    return () => subscription.unsubscribe();
  }, []);

  // Schedule Reminder Logic
  useEffect(() => {
    if (session) {
      // Request notification permission
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }

      // Request location permission early
      const requestLoc = async () => {
        try {
          // Capacitor akan otomatis meminta izin jika belum ada
          await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: 10000 });
          console.log('Location permission granted (Capacitor)');
        } catch (err) {
          console.log('Capacitor Geolocation error:', err);
          if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
              () => console.log('Location permission granted (Web)'),
              (e) => console.log('Location permission skipped or denied (Web)', e),
              { enableHighAccuracy: true, timeout: 10000 }
            );
          }
        }
      };
      requestLoc();

      const checkSchedules = async () => {
        const todayKey = getDateKey(new Date());
        const { data } = await supabase.from('schedules').select('*').eq('date_key', todayKey);
        if (!data) return;

        const now = new Date();
        const currentH = now.getHours();
        const currentM = now.getMinutes();

        data.forEach(schedule => {
          const [h, m] = schedule.time_start.split(':').map(Number);
          if (h === currentH && m === currentM && !alertSchedule) {
            setAlertSchedule(schedule);
            
            // Show browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Jadwal Dimulai!', {
                body: `"${schedule.title}" dimulai sekarang (${schedule.time_start} - ${schedule.time_end})`,
                icon: '/favicon.ico'
              });
            }
          }
        });
      };

      const interval = setInterval(checkSchedules, 60000);
      checkSchedules();
      return () => clearInterval(interval);
    }
  }, [session, alertSchedule]);

  const goHome = () => setActiveTab('dashboard');

  if (authLoading) {
    return <div className="app-wrapper flex items-center justify-center font-semibold animate-pulse">Memuat...</div>;
  }

  if (!session) {
    return <div className="app-wrapper animate-fade-in"><Auth /></div>;
  }

  if (recoveryMode) {
    return (
      <div className="app-wrapper p-6 flex flex-col justify-center">
        <h1 className="text-2xl font-extrabold mb-2 text-center">Buat Kata Sandi Baru</h1>
        <p className="text-brand-500 text-center text-sm mb-8">Silakan masukkan kata sandi baru Anda.</p>
        <form className="flex flex-col gap-4" onSubmit={async (e) => {
          e.preventDefault();
          setUpdatingPassword(true);
          const { error } = await updatePassword(newPassword);
          if (error) alert(error.message);
          else {
            alert('Berhasil diubah!');
            setRecoveryMode(false);
          }
          setUpdatingPassword(false);
        }}>
          <input type="password" placeholder="********" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} className="input-field" />
          <button type="submit" className="btn-primary" disabled={updatingPassword}>
            {updatingPassword ? 'Menyimpan...' : 'Simpan Kata Sandi'}
          </button>
        </form>
      </div>
    );
  }

  const navItems = [
    { id: 'dashboard', icon: <IconHome />, label: 'Beranda' },
    { id: 'routine', icon: <IconCheckSquare />, label: 'Rutinitas' },
    { id: 'schedule', icon: <IconCalendar />, label: 'Jadwal' },
    { id: 'finance', icon: <IconWallet />, label: 'Keuangan' },
    { id: 'profile', icon: <IconUser />, label: 'Profil' },
  ];

  return (
    <div className="w-full min-h-screen bg-brand-50 dark:bg-brand-950 flex flex-col md:flex-row animate-fade-in">
      
      {/* Sidebar (Desktop & Tablet) */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white dark:bg-brand-900 border-r border-brand-200 dark:border-brand-800 p-5 shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] relative z-20 transition-colors">
        <div className="flex items-center justify-start px-2 h-16 mb-8 border-b border-brand-100 dark:border-brand-800">
           <span className="font-black text-3xl tracking-tighter text-brand-950 dark:text-white">DAILY.</span>
        </div>
        <nav className="flex flex-col gap-2">
          {navItems.map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                activeTab === item.id 
                  ? 'bg-brand-950 text-white dark:bg-white dark:text-brand-950 shadow-md font-bold' 
                  : 'text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-800 hover:text-brand-950 dark:hover:text-white font-semibold'
              }`}
            >
              <div className="[&>svg]:w-5 [&>svg]:h-5 shrink-0">
                {item.icon}
              </div>
              <span className="text-[15px] tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>
        
        {/* Support Section at Bottom of Sidebar */}
        <div className="mt-auto pt-8 flex flex-col items-center">
          <p className="text-xs font-bold text-brand-400">Versi {import.meta.env.VITE_APP_VERSION || '1.0.0'}</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 w-full relative flex flex-col h-screen overflow-hidden bg-brand-50/30 dark:bg-brand-950/30">
        
        {/* Global Alert */}
        {alertSchedule && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] z-[100] bg-brand-950 dark:bg-white text-white dark:text-black p-4 rounded-2xl shadow-xl flex justify-between items-center animate-slide-up">
            <div>
              <strong className="block text-sm">Peringatan Jadwal!</strong>
              <span className="text-xs opacity-80">"{alertSchedule.title}" akan dimulai pada {alertSchedule.time_start}</span>
            </div>
            <button onClick={() => setAlertSchedule(null)} className="text-xl opacity-60 hover:opacity-100">✕</button>
          </div>
        )}

        {/* Pages Content */}
        <div className="flex-1 overflow-y-auto pb-24 md:pb-8 relative">
          <div className="max-w-5xl mx-auto w-full">
            {activeTab === 'dashboard' && <Dashboard session={session} setActiveTab={setActiveTab} />}
            {activeTab === 'routine' && <Routine onBack={goHome} />}
            {activeTab === 'schedule' && <Schedule onBack={goHome} />}
            {activeTab === 'finance' && <Finance onBack={goHome} />}
            {activeTab === 'profile' && <Profile session={session} onBack={goHome} />}
          </div>
        </div>

        {/* Glass Bottom Nav (Mobile Only) */}
        <nav className="md:hidden absolute bottom-0 left-0 w-full bg-white/90 dark:bg-brand-900/90 backdrop-blur-xl border-t border-brand-200/50 dark:border-brand-800/50 flex justify-around items-center pt-3 pb-6 z-50 transition-colors duration-300 shadow-[0_-4px_24px_rgba(0,0,0,0.05)]">
          {navItems.map(item => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1.5 transition-all duration-300 ${
                activeTab === item.id 
                  ? 'text-brand-950 dark:text-white scale-110' 
                  : 'text-brand-400 dark:text-brand-600 hover:text-brand-600 dark:hover:text-brand-300'
              }`}
            >
              <div className="[&>svg]:w-[22px] [&>svg]:h-[22px]">
                {item.icon}
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Force Update Modal */}
        <Modal isOpen={needsUpdate} onClose={() => {}} title="Update Aplikasi">
          <div className="flex flex-col items-center gap-4 text-center pb-4">
            <div className="w-16 h-16 bg-brand-100 dark:bg-brand-800 text-brand-900 dark:text-white rounded-full flex items-center justify-center mb-2">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
            </div>
            <p className="font-bold text-lg">Versi Baru Tersedia!</p>
            <p className="text-sm text-brand-500 dark:text-brand-400">
              Aplikasi versi baru telah dirilis. Silakan muat ulang (Refresh / Clear Cache) halaman web Anda untuk menggunakan versi terbaru.
            </p>
            <button onClick={() => window.location.reload(true)} className="btn-primary mt-4">
              Muat Ulang Aplikasi
            </button>
          </div>
        </Modal>
      </div>
    </div>
  );
}

export default App;
