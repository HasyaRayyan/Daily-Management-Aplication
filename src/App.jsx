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

// SVG Icons
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
  const [passwordError, setPasswordError] = useState(null);

  // Active tab: 'dashboard' | 'routine' | 'schedule' | 'finance' | 'profile'
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Schedule Alert
  const [alertSchedule, setAlertSchedule] = useState(null);

  useEffect(() => {
    getSession().then(({ session }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryMode(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Schedule Reminder Logic
  useEffect(() => {
    if (!session) return;
    
    let interval;
    const checkSchedules = async () => {
      const todayDateKey = getDateKey(new Date());
      const schedules = await getSchedules(todayDateKey);
      
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      // Find if any schedule starts in exactly 15 minutes
      const upcoming = schedules.find(sch => {
        const [startH, startM] = sch.time_start.split(':').map(Number);
        const startMins = startH * 60 + startM;
        // if start is within 15 minutes from now
        return startMins > currentMinutes && startMins - currentMinutes <= 15;
      });

      if (upcoming) {
        setAlertSchedule(upcoming);
      } else {
        setAlertSchedule(null);
      }
    };

    checkSchedules(); // Check immediately
    interval = setInterval(checkSchedules, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [session]);


  if (authLoading) {
    return <div className="auth-page" style={{ justifyContent: 'center', alignItems: 'center' }}><p>Memuat...</p></div>;
  }

  if (!session) {
    return <Auth />;
  }

  if (recoveryMode) {
    return (
      <div className="auth-page">
        <div className="auth-header-text" style={{marginTop: '2rem'}}>
          <h1 className="auth-title">Buat Kata Sandi Baru</h1>
          <p className="auth-subtitle">Silakan masukkan kata sandi baru Anda.</p>
        </div>
        {passwordError && <div className="auth-error-msg">{passwordError}</div>}
        <form className="auth-form" onSubmit={async (e) => {
          e.preventDefault();
          setUpdatingPassword(true);
          setPasswordError(null);
          const { error } = await updatePassword(newPassword);
          if (error) {
            setPasswordError(error.message);
          } else {
            alert('Kata sandi berhasil diubah! Anda bisa mulai menggunakan aplikasi.');
            setRecoveryMode(false);
          }
          setUpdatingPassword(false);
        }}>
          <div className="form-group">
            <label className="form-label">KATA SANDI BARU</label>
            <input type="password" className="form-input" placeholder="********" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={6} />
          </div>
          <button type="submit" className="btn-primary" disabled={updatingPassword}>
            {updatingPassword ? 'Menyimpan...' : 'Simpan Kata Sandi'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="app-container dashboard-page">
      
      {/* Global Schedule Alert */}
      {alertSchedule && (
        <div style={{
          position: 'fixed', top: '10px', left: '10px', right: '10px', zIndex: 1000,
          background: 'var(--accent-light)', color: 'white', padding: '15px', borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
        }}>
          <div>
            <strong>Peringatan Jadwal!</strong>
            <div style={{fontSize: '0.875rem'}}>"{alertSchedule.title}" akan dimulai pada {alertSchedule.time_start}.</div>
          </div>
          <button onClick={() => setAlertSchedule(null)} style={{background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer'}}>✕</button>
        </div>
      )}

      {/* Pages Content */}
      <div style={{ paddingBottom: '80px', height: '100%', overflowY: 'auto' }}>
        {activeTab === 'dashboard' && <Dashboard session={session} setActiveTab={setActiveTab} />}
        {activeTab === 'routine' && <Routine />}
        {activeTab === 'schedule' && <Schedule />}
        {activeTab === 'finance' && <Finance />}
        {activeTab === 'profile' && <Profile session={session} />}
      </div>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <IconHome />
          <span className="nav-label">BERANDA</span>
        </button>
        <button className={`nav-item ${activeTab === 'routine' ? 'active' : ''}`} onClick={() => setActiveTab('routine')}>
          <IconCheckSquare />
          <span className="nav-label">RUTINITAS</span>
        </button>
        <button className={`nav-item ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>
          <IconCalendar />
          <span className="nav-label">JADWAL</span>
        </button>
        <button className={`nav-item ${activeTab === 'finance' ? 'active' : ''}`} onClick={() => setActiveTab('finance')}>
          <IconWallet />
          <span className="nav-label">KEUANGAN</span>
        </button>
        <button className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')}>
          <IconUser />
          <span className="nav-label">PROFIL</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
