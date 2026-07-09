import { useState, useEffect, useCallback } from 'react';
import TaskList from './components/TaskList';
import FinanceTracker from './components/FinanceTracker';
import Summary from './components/Summary';
import { getTasks, getTransactions } from './utils/storage';
import { getDateKey, formatDateIndo, isToday } from './utils/helpers';
import './index.css';

function App() {
  // Current date state
  const [currentDate, setCurrentDate] = useState(new Date());
  const dateKey = getDateKey(currentDate);

  // Active tab: 'tasks' | 'finance' | 'summary'
  const [activeTab, setActiveTab] = useState('tasks');

  // Data state
  const [tasks, setTasks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data from Supabase when date changes
  const loadData = useCallback(async () => {
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
  }, [dateKey]);

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

  return (
    <>
      {/* Header */}
      <header className="app-header">
        <h1>Daily Manager ✨</h1>

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

      {/* Loading State */}
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
