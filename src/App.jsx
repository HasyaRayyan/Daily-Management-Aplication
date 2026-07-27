import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Routine from './components/Routine';
import Schedule from './components/Schedule';
import Finance from './components/Finance';
import Profile from './components/Profile';
import Auth from './components/Auth';
import { getSession, onAuthStateChange, updatePassword } from './lib/auth';
import { getSchedules } from './utils/storage';
import { getDateKey } from './utils/helpers';
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

    return () => subscription.unsubscribe();
  }, []);

  // Schedule Reminder Logic
  useEffect(() => {
    if (!session) return;
    const checkSchedules = async () => {
      const todayDateKey = getDateKey(new Date());
      const schedules = await getSchedules(todayDateKey);
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const upcoming = schedules.find(sch => {
        const [startH, startM] = sch.time_start.split(':').map(Number);
        const startMins = startH * 60 + startM;
        return startMins > currentMinutes && startMins - currentMinutes <= 15;
      });
      setAlertSchedule(upcoming || null);
    };

    checkSchedules();
    const interval = setInterval(checkSchedules, 60000);
    return () => clearInterval(interval);
  }, [session]);

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

  return (
    <div className="app-wrapper animate-fade-in">
      {/* Global Alert */}
      {alertSchedule && (
        <div className="fixed top-4 left-4 right-4 z-[100] max-w-md mx-auto bg-brand-950 dark:bg-white text-white dark:text-black p-4 rounded-2xl shadow-xl flex justify-between items-center animate-slide-up">
          <div>
            <strong className="block text-sm">Peringatan Jadwal!</strong>
            <span className="text-xs opacity-80">"{alertSchedule.title}" akan dimulai pada {alertSchedule.time_start}</span>
          </div>
          <button onClick={() => setAlertSchedule(null)} className="text-xl opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Pages Content */}
      <div className="pb-24 pt-4 h-full overflow-y-auto">
        {activeTab === 'dashboard' && <Dashboard session={session} setActiveTab={setActiveTab} />}
        {activeTab === 'routine' && <Routine />}
        {activeTab === 'schedule' && <Schedule />}
        {activeTab === 'finance' && <Finance />}
        {activeTab === 'profile' && <Profile session={session} />}
      </div>

      {/* Glass Bottom Nav */}
      <nav className="glass-nav">
        {[
          { id: 'dashboard', icon: <IconHome />, label: 'Beranda' },
          { id: 'routine', icon: <IconCheckSquare />, label: 'Rutinitas' },
          { id: 'schedule', icon: <IconCalendar />, label: 'Jadwal' },
          { id: 'finance', icon: <IconWallet />, label: 'Keuangan' },
          { id: 'profile', icon: <IconUser />, label: 'Profil' },
        ].map(item => (
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
    </div>
  );
}

export default App;
