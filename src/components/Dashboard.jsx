import { useState, useEffect } from 'react';
import { formatRupiah, getDateKey, getCategoryInfo } from '../utils/helpers';
import { getProfile, getRoutines, getRoutineLogs, getSchedules, getTransactions } from '../utils/storage';

const IconRefresh = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 1 0 2.6-6.4L2 9"/></svg>;

export default function Dashboard({ session, setActiveTab }) {
  const [profile, setProfile] = useState(null);
  const [routines, setRoutines] = useState([]);
  const [logs, setLogs] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const todayDateKey = getDateKey(new Date());

  const fetchData = async () => {
    setLoading(true);
    const [profData, routData, logData, schedData, transData] = await Promise.all([
      getProfile(),
      getRoutines(),
      getRoutineLogs(todayDateKey),
      getSchedules(todayDateKey),
      getTransactions(todayDateKey)
    ]);
    setProfile(profData);
    setRoutines(routData);
    setLogs(logData);
    setSchedules(schedData);
    setTransactions(transData);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const displayName = profile?.display_name || session?.user?.user_metadata?.username || 'Mahasiswa';
  const avatarUrl = profile?.avatar_url;

  // Routines summary
  const completedCount = routines.filter(r => logs.find(l => l.routine_id === r.id)?.completed).length;
  const totalCount = routines.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Transactions summary (3 latest)
  const latestTransactions = transactions.slice(0, 3);

  // Schedule status helper
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    <div className="main-content" style={{ padding: '0', background: 'transparent' }}>
      
      {/* Top Header */}
      <header className="top-header">
        <div className="user-info">
          <div className="user-avatar" onClick={() => setActiveTab('profile')} style={{ cursor: 'pointer' }}>
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              displayName.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <div className="user-greeting">Selamat datang,</div>
            <div className="user-name">{displayName}</div>
          </div>
        </div>
        <button className="icon-btn" onClick={fetchData}>
          <IconRefresh />
        </button>
      </header>

      <div style={{ padding: '0 24px 100px 24px' }}>
        
        {/* Routines Summary */}
        <div className="card" onClick={() => setActiveTab('routine')} style={{ cursor: 'pointer', marginBottom: '1.5rem' }}>
          <div className="section-header" style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem' }}>✅ Ringkasan Rutinitas</h2>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>Lihat Detail ›</span>
          </div>
          <div className="progress-container" style={{ margin: 0 }}>
            <div className="progress-info">
              <span className="progress-label">{completedCount}/{totalCount} Rutinitas Selesai</span>
              <span className="progress-value">{progressPercent}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>

        {/* Schedule Summary */}
        <div className="card" onClick={() => setActiveTab('schedule')} style={{ cursor: 'pointer', marginBottom: '1.5rem' }}>
          <div className="section-header" style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem' }}>📅 Jadwal Hari Ini</h2>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>Lihat Detail ›</span>
          </div>
          {schedules.length === 0 ? (
            <p style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>Tidak ada jadwal hari ini.</p>
          ) : (
            <div className="transaction-list">
              {schedules.map((schedule) => {
                const [startH, startM] = schedule.time_start.split(':').map(Number);
                const [endH, endM] = schedule.time_end.split(':').map(Number);
                const startMins = startH * 60 + startM;
                const endMins = endH * 60 + endM;
                let isActive = currentMinutes >= startMins && currentMinutes <= endMins;
                
                return (
                  <div key={schedule.id} className="transaction-item" style={{ padding: '12px', border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-light)', background: isActive ? 'rgba(79, 70, 229, 0.05)' : 'white' }}>
                    <div className="transaction-content">
                      <p className="transaction-desc" style={{ color: isActive ? 'var(--primary)' : 'var(--text-dark)' }}>{schedule.title}</p>
                      <span className="transaction-category">{schedule.time_start} - {schedule.time_end} {isActive && '• Sedang Berlangsung'}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Finance Summary */}
        <div className="card" onClick={() => setActiveTab('finance')} style={{ cursor: 'pointer', marginBottom: '1.5rem' }}>
          <div className="section-header" style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem' }}>💰 Transaksi Terbaru</h2>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-light)' }}>Lihat Detail ›</span>
          </div>
          {latestTransactions.length === 0 ? (
            <p style={{ color: 'var(--text-light)', fontSize: '0.875rem' }}>Belum ada transaksi hari ini.</p>
          ) : (
            <div className="transaction-list">
              {latestTransactions.map((t) => (
                <div key={t.id} className="transaction-item" style={{ padding: '12px' }}>
                  <div className="transaction-content">
                    <p className="transaction-desc">{t.title}</p>
                  </div>
                  <span className={`transaction-amount ${t.type}`}>
                    {t.type === 'expense' ? '-' : '+'}{formatRupiah(t.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
