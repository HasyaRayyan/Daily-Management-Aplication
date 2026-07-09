import { useState, useEffect, useCallback } from 'react';
import TaskList from './components/TaskList';
import FinanceTracker from './components/FinanceTracker';
import Summary from './components/Summary';
import Auth from './components/Auth';
import { getTasks, getTransactions } from './utils/storage';
import { getDateKey, formatDateIndo, isToday } from './utils/helpers';
import { getSession, onAuthStateChange, logout } from './lib/auth';
import './index.css';

function App() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Current date state
  const [currentDate, setCurrentDate] = useState(new Date());
  const dateKey = getDateKey(currentDate);

  // Active tab: 'tasks' | 'finance' | 'summary'
  const [activeTab, setActiveTab] = useState('tasks');

  // Data state
  const [tasks, setTasks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

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

  // Load data from Supabase when date changes or user logs in
  const loadData = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const [tasksData, transactionsData] = await Promise.all([
        getTasks(dateKey),
        getTransactions(dateKey),
      ]);
      setTasks(tasksData);
      setTransactions(transactionsData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, [dateKey, session]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Date navigation
  const goToDay = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offset);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const todayCheck = isToday(dateKey);

  const handleLogout = async () => {
    await logout();
  };

  if (authLoading) {
    return (
      <div className="auth-container">
        <div className="empty-state">
          <div className="empty-icon pulse">⏳</div>
          <p className="empty-text">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <>
      {/* Header */}
      <header className="app-header">
        <h1>Daily Manager ✨</h1>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>

        {/* Date Navigator */}
        <div className="date-navigator">
          <button onClick={() => goToDay(-1)} aria-label="Hari sebelumnya">
            ‹
          </button>
          <button
            className={`date-display ${todayCheck ? 'is-today' : ''}`}
            onClick={goToToday}
            title="Klik untuk ke hari ini"
          >
            {todayCheck ? '📅 Hari ini' : formatDateIndo(currentDate)}
          </button>
          <button onClick={() => goToDay(1)} aria-label="Hari berikutnya">
            ›
          </button>
        </div>

        {/* Show full date below if today */}
        {todayCheck && (
          <p style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--text-muted)',
            marginTop: 'var(--space-2)',
          }}>
            {formatDateIndo(currentDate)}
          </p>
        )}
      </header>

      {/* Loading State for Data */}
      {loading ? (
        <div className="main-content">
          <div className="empty-state">
            <div className="empty-icon pulse">⏳</div>
            <p className="empty-text">Memuat data...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Main Content */}
          {activeTab === 'tasks' && (
            <TaskList tasks={tasks} dateKey={dateKey} onRefresh={loadData} />
          )}
          {activeTab === 'finance' && (
            <FinanceTracker transactions={transactions} dateKey={dateKey} onRefresh={loadData} />
          )}
          {activeTab === 'summary' && (
            <Summary
              tasks={tasks}
              transactions={transactions}
              dateDisplay={formatDateIndo(currentDate)}
            />
          )}
        </>
      )}

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button
          className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <span className="nav-icon">📋</span>
          Tugas
        </button>
        <button
          className={`nav-item ${activeTab === 'finance' ? 'active' : ''}`}
          onClick={() => setActiveTab('finance')}
        >
          <span className="nav-icon">💰</span>
          Keuangan
        </button>
        <button
          className={`nav-item ${activeTab === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveTab('summary')}
        >
          <span className="nav-icon">📊</span>
          Ringkasan
        </button>
      </nav>
    </>
  );
}

export default App;
