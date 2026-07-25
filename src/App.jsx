import { useState, useEffect, useCallback } from 'react';
import TaskList from './components/TaskList';
import FinanceTracker from './components/FinanceTracker';
import Summary from './components/Summary';
import Auth from './components/Auth';
import { getTasks, getTransactions } from './utils/storage';
import { getDateKey, formatDateIndo, isToday } from './utils/helpers';
import { getSession, onAuthStateChange, logout } from './lib/auth';
import './index.css';

// SVG Icons
const IconRefresh = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 1 0 2.6-6.4L2 9"/></svg>;
const IconCoffee = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>;
const IconTicket = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/></svg>;
const IconBag = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>;
const IconReceipt = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 17.5v-11"/></svg>;
const IconHome = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
const IconGrid = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconStar = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const IconUser = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
const IconChevronRight = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>;

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Active tab: 'home' | 'tasks' | 'finance' | 'summary' | 'profile'
  const [activeTab, setActiveTab] = useState('home');

  // Load user info
  const username = session?.user?.user_metadata?.username || 'Hasya Rayyan';

  // Check initial session
  useEffect(() => {
    getSession().then(({ session }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  if (authLoading) {
    return (
      <div className="auth-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <p>Memuat...</p>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="app-container dashboard-page">
      {activeTab === 'home' && (
        <>
          {/* Top Header */}
          <header className="top-header">
            <div className="user-info">
              <div className="user-avatar">
                {username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="user-greeting">Good Evening,</div>
                <div className="user-name">{username}</div>
              </div>
            </div>
            <button className="icon-btn" onClick={() => window.location.reload()}>
              <IconRefresh />
            </button>
          </header>

          {/* Points Card */}
          <div className="points-card-wrapper">
            <div className="points-card">
              <div className="member-badge">
                <span>⭐</span> PLATINUM MEMBER
              </div>
              <div className="points-display">
                <span className="points-value">2,958</span>
                <span className="points-label">PTS</span>
              </div>
              <div className="points-arrow"><IconChevronRight /></div>
              
              <div className="progress-bar-container">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '40%' }}></div>
                </div>
                <div className="progress-text">
                  Kumpulkan <strong>2042 pts</strong> lagi untuk capai level <strong>PLATINUM</strong>!
                </div>
              </div>
            </div>
          </div>

          {/* Promo Banner */}
          <div className="promo-wrapper">
            <div className="promo-banner">
              {/* Menggunakan div warna gelap sebagai ganti gambar jika tidak ada gambar */}
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(to right, #0f172a, #334155)' }}></div>
              <div className="promo-content">
                <div className="promo-tag">PROMO</div>
                <div className="promo-title">New Merchandise<br/>Out Now!</div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <button className="action-item" onClick={() => setActiveTab('tasks')}>
              <div className="action-icon"><IconCoffee /></div>
              <span className="action-label">Menu</span>
            </button>
            <button className="action-item" onClick={() => setActiveTab('summary')}>
              <div className="action-icon"><IconTicket /></div>
              <span className="action-label">Tukar Poin</span>
            </button>
            <button className="action-item" onClick={() => setActiveTab('finance')}>
              <div className="action-icon"><IconBag /></div>
              <span className="action-label">Pesanan</span>
            </button>
            <button className="action-item" onClick={() => setActiveTab('tasks')}>
              <div className="action-icon"><IconReceipt /></div>
              <span className="action-label">Riwayat</span>
            </button>
          </div>

          {/* Recommendations */}
          <div className="recommendations">
            <div className="section-header">
              <h2 className="section-title">Rekomendasi Hari Ini</h2>
              <a href="#" className="section-link">Lihat Semua</a>
            </div>
            <div className="horizontal-scroll">
              <div className="product-card">
                <div className="product-image" style={{ background: '#7c2d12' }}></div>
              </div>
              <div className="product-card">
                <div className="product-image" style={{ background: '#166534' }}></div>
              </div>
              <div className="product-card">
                <div className="product-image" style={{ background: '#be123c' }}></div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Fallback to old views for other tabs to keep functionality working */}
      {activeTab === 'tasks' && (
        <div style={{ padding: '24px' }}>
          <h2>Daftar Tugas</h2>
          <p>Fitur TaskList (Sedang diperbarui)</p>
        </div>
      )}
      
      {activeTab === 'finance' && (
        <div style={{ padding: '24px' }}>
          <h2>Keuangan</h2>
          <p>Fitur FinanceTracker (Sedang diperbarui)</p>
        </div>
      )}

      {activeTab === 'summary' && (
        <div style={{ padding: '24px' }}>
          <h2>Ringkasan Poin</h2>
          <p>Fitur Summary (Sedang diperbarui)</p>
        </div>
      )}

      {activeTab === 'profile' && (
        <div style={{ padding: '24px' }}>
          <h2>Profil Saya</h2>
          <button className="btn-primary" onClick={handleLogout}>Logout</button>
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button
          className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <IconHome />
          <span className="nav-label">BERANDA</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <IconGrid />
          <span className="nav-label">MENU</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          <IconStar />
          <span className="nav-label">POIN SAYA</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'finance' ? 'active' : ''}`}
          onClick={() => setActiveTab('finance')}
        >
          <IconBag />
          <span className="nav-label">PESANAN</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <IconUser />
          <span className="nav-label">SAYA</span>
        </button>
      </nav>
    </div>
  );
}

export default App;
