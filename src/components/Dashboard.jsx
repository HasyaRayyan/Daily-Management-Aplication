import { useState, useEffect } from 'react';
import { formatRupiah, getDateKey, formatDateIndo } from '../utils/helpers';
import { getProfile, getTasks, getSchedules, getTransactions, toggleTask } from '../utils/storage';
import Spinner from './Spinner';

// Icons
const IconRefresh = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2v6h-6" />
    <path d="M3 12a9 9 0 1 0 2.6-6.4L2 9" />
  </svg>
);

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconPlus = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const IconArrowRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconClock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconTrendingUp = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const IconTrendingDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
);

export default function Dashboard({ session, setActiveTab }) {
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const todayDateKey = getDateKey(new Date());

  const fetchData = async () => {
    try {
      const [profData, taskData, schedData, transData] = await Promise.all([
        getProfile(),
        getTasks(),
        getSchedules(todayDateKey),
        getTransactions(todayDateKey)
      ]);
      setProfile(profData);
      setTasks(taskData || []);
      setSchedules(schedData || []);
      setTransactions(transData || []);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Toggle task completion directly from Dashboard
  const handleToggleTask = async (id, currentStatus, e) => {
    e.stopPropagation();
    // Optimistic update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !currentStatus } : t));
    await toggleTask(id, !currentStatus);
  };

  // Greeting helper
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 4 && hour < 11) return 'Selamat Pagi';
    if (hour >= 11 && hour < 15) return 'Selamat Siang';
    if (hour >= 15 && hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  const displayName = profile?.display_name || session?.user?.user_metadata?.username || 'Pengguna';
  const avatarUrl = profile?.avatar_url;

  // Task Stats
  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const pendingTasks = tasks.filter(t => !t.completed);
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Finances Stats Today
  const todayIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const todayExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, curr) => acc + Number(curr.amount || 0), 0);

  const netBalance = todayIncome - todayExpense;
  const latestTransactions = transactions.slice(0, 4);

  // Schedules
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const sortedSchedules = [...schedules].sort((a, b) => a.time_start.localeCompare(b.time_start));
  
  // Find current active schedule
  const activeSchedule = sortedSchedules.find(schedule => {
    const [startH, startM] = schedule.time_start.split(':').map(Number);
    const [endH, endM] = schedule.time_end.split(':').map(Number);
    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;
    return currentMinutes >= startMins && currentMinutes <= endMins;
  });

  if (loading) {
    return (
      <div className="w-full h-[65vh] flex flex-col items-center justify-center gap-3">
        <Spinner size="md" />
        <p className="text-xs font-semibold text-brand-400 animate-pulse">Memuat ringkasan hari ini...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 sm:px-6 pt-6 pb-28 md:pb-12 animate-fade-in max-w-5xl mx-auto w-full">
      
      {/* ============================================================ */}
      {/* 1. GREETING & PROFILE HERO HEADER */}
      {/* ============================================================ */}
      <div className="bg-white dark:bg-brand-900 rounded-[2rem] p-5 sm:p-6 shadow-sm border border-brand-100 dark:border-brand-800 flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative overflow-hidden">
        
        {/* Left Side: Date & Greeting */}
        <div className="flex flex-col gap-1.5 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 text-xs font-bold text-brand-500 dark:text-brand-400 border border-brand-200/60 dark:border-brand-800 w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>{formatDateIndo(new Date())}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-brand-950 dark:text-white mt-1">
            {getGreeting()}, {displayName}
          </h1>
          <p className="text-xs sm:text-sm text-brand-400 dark:text-brand-500 font-medium">
            Berikut ringkasan tugas, agenda harian, dan keuangan Anda hari ini.
          </p>
        </div>

        {/* Right Side: Avatar & Refresh Action */}
        <div className="flex items-center gap-3 self-end sm:self-center z-10">
          <button 
            type="button"
            onClick={handleRefresh}
            title="Muat Ulang Data"
            className="w-11 h-11 rounded-2xl bg-brand-50 dark:bg-brand-950 border border-brand-200/60 dark:border-brand-800 flex items-center justify-center text-brand-700 dark:text-brand-300 hover:bg-brand-100 dark:hover:bg-brand-800 hover:text-brand-950 dark:hover:text-white transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <div className={refreshing ? 'animate-spin' : ''}>
              <IconRefresh />
            </div>
          </button>

          {/* Avatar button linking to Profile */}
          <div 
            onClick={() => setActiveTab('profile')} 
            title="Buka Profil"
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-brand-100 dark:bg-brand-800 flex items-center justify-center font-black text-xl text-brand-950 dark:text-white cursor-pointer overflow-hidden border-2 border-brand-200 dark:border-brand-700 hover:border-brand-950 dark:hover:border-white transition-all shadow-sm hover:scale-105 active:scale-95"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span>{displayName.charAt(0).toUpperCase()}</span>
            )}
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 2. TOP METRICS HIGHLIGHT CARDS (3-COLUMN BENTO) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
        
        {/* Metric 1: Tugas */}
        <div 
          onClick={() => setActiveTab('task')}
          className="p-5 rounded-3xl bg-white dark:bg-brand-900 border border-brand-100 dark:border-brand-800 shadow-sm hover:border-brand-300 dark:hover:border-brand-700 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-brand-400 dark:text-brand-500 uppercase tracking-wider">
              Tugas Harian
            </span>
            <span className="text-xs font-bold text-brand-400 group-hover:text-brand-950 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all">
              ›
            </span>
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-brand-950 dark:text-white">{completedCount}</span>
              <span className="text-xs font-bold text-brand-400">/{totalCount} Selesai</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {progressPercent}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full bg-brand-100 dark:bg-brand-800 rounded-full overflow-hidden mt-1">
            <div 
              className="h-full bg-brand-950 dark:bg-white rounded-full transition-all duration-700 ease-out" 
              style={{ width: `${progressPercent}%` }} 
            />
          </div>
        </div>

        {/* Metric 2: Jadwal */}
        <div 
          onClick={() => setActiveTab('schedule')}
          className="p-5 rounded-3xl bg-white dark:bg-brand-900 border border-brand-100 dark:border-brand-800 shadow-sm hover:border-brand-300 dark:hover:border-brand-700 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-brand-400 dark:text-brand-500 uppercase tracking-wider">
              Jadwal Hari Ini
            </span>
            <span className="text-xs font-bold text-brand-400 group-hover:text-brand-950 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all">
              ›
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-2xl sm:text-3xl font-black text-brand-950 dark:text-white">{sortedSchedules.length}</span>
            <span className="text-xs font-bold text-brand-400">Agenda</span>
          </div>

          <p className="text-xs text-brand-500 dark:text-brand-400 truncate">
            {activeSchedule ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Sedang: {activeSchedule.title}</span>
            ) : sortedSchedules.length > 0 ? (
              <span>Berikutnya: {sortedSchedules[0].title} ({sortedSchedules[0].time_start})</span>
            ) : (
              'Tidak ada jadwal hari ini'
            )}
          </p>
        </div>

        {/* Metric 3: Keuangan */}
        <div 
          onClick={() => setActiveTab('finance')}
          className="p-5 rounded-3xl bg-white dark:bg-brand-900 border border-brand-100 dark:border-brand-800 shadow-sm hover:border-brand-300 dark:hover:border-brand-700 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-brand-400 dark:text-brand-500 uppercase tracking-wider">
              Arus Kas Hari Ini
            </span>
            <span className="text-xs font-bold text-brand-400 group-hover:text-brand-950 dark:group-hover:text-white group-hover:translate-x-0.5 transition-all">
              ›
            </span>
          </div>

          <div className="flex items-baseline gap-1 mb-1">
            <span className="text-xl sm:text-2xl font-black text-brand-950 dark:text-white truncate">
              {netBalance >= 0 ? '+' : ''}{formatRupiah(netBalance)}
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-semibold text-brand-500">
            <span className="text-emerald-600 dark:text-emerald-400">+{formatRupiah(todayIncome)}</span>
            <span>•</span>
            <span className="text-red-500">-{formatRupiah(todayExpense)}</span>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* 3. QUICK ACTIONS ROW */}
      {/* ============================================================ */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('task')}
          className="px-4 py-2.5 rounded-2xl bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 text-xs font-bold text-brand-950 dark:text-white hover:bg-brand-100 dark:hover:bg-brand-800 transition-colors flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap"
        >
          <IconPlus />
          <span>Tambah Tugas</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('schedule')}
          className="px-4 py-2.5 rounded-2xl bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 text-xs font-bold text-brand-950 dark:text-white hover:bg-brand-100 dark:hover:bg-brand-800 transition-colors flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap"
        >
          <IconPlus />
          <span>Buat Jadwal</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('finance')}
          className="px-4 py-2.5 rounded-2xl bg-white dark:bg-brand-900 border border-brand-200 dark:border-brand-800 text-xs font-bold text-brand-950 dark:text-white hover:bg-brand-100 dark:hover:bg-brand-800 transition-colors flex items-center gap-2 cursor-pointer shadow-xs whitespace-nowrap"
        >
          <IconPlus />
          <span>Catat Transaksi</span>
        </button>
      </div>

      {/* ============================================================ */}
      {/* 4. MAIN BENTO GRID (TASKS, SCHEDULES, & TRANSACTIONS) */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
        
        {/* Left Column: Tasks & Finances */}
        <div className="flex flex-col gap-6">
          
          {/* TUGAS HARI INI */}
          <div className="bg-white dark:bg-brand-900 rounded-[2rem] p-6 border border-brand-100 dark:border-brand-800 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-100 dark:border-brand-800">
              <div>
                <h2 className="text-base font-extrabold text-brand-950 dark:text-white">Daftar Tugas</h2>
                <p className="text-xs text-brand-400">Centang langsung untuk menandai selesai</p>
              </div>
              <button 
                type="button"
                onClick={() => setActiveTab('task')}
                className="text-xs font-bold text-brand-500 hover:text-brand-950 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Lihat Semua</span>
                <IconArrowRight />
              </button>
            </div>

            {/* Tasks List */}
            <div className="flex flex-col gap-2.5">
              {tasks.length === 0 ? (
                <div className="py-8 px-4 text-center rounded-2xl border border-dashed border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-950/30 flex flex-col items-center gap-2">
                  <p className="text-xs font-bold text-brand-400">Belum ada tugas yang ditambahkan.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('task')}
                    className="text-xs font-bold text-brand-950 dark:text-white hover:underline cursor-pointer"
                  >
                    + Buat tugas pertama Anda
                  </button>
                </div>
              ) : pendingTasks.length === 0 ? (
                <div className="py-6 px-4 text-center rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex flex-col items-center gap-1">
                  <span className="text-lg">🎉</span>
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Semua tugas telah selesai!</p>
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400">{completedCount} tugas berhasil diselesaikan.</p>
                </div>
              ) : (
                pendingTasks.slice(0, 4).map(task => (
                  <div 
                    key={task.id}
                    onClick={() => setActiveTab('task')}
                    className="p-3.5 rounded-2xl bg-brand-50/70 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800 flex items-center justify-between gap-3 group cursor-pointer hover:bg-brand-100/60 dark:hover:bg-brand-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <button
                        type="button"
                        onClick={(e) => handleToggleTask(task.id, task.completed, e)}
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                          task.completed
                            ? 'bg-brand-950 dark:bg-white text-white dark:text-brand-950 border-brand-950 dark:border-white'
                            : 'border-brand-300 dark:border-brand-700 bg-white dark:bg-brand-900 hover:border-brand-950 dark:hover:border-white'
                        }`}
                      >
                        {task.completed && <IconCheck />}
                      </button>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-brand-950 dark:text-white truncate">
                          {task.title}
                        </p>
                        {task.deadline && (
                          <p className="text-[11px] text-brand-400 flex items-center gap-1 mt-0.5">
                            <IconClock />
                            <span>Deadline: {task.deadline}</span>
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-brand-400 group-hover:text-brand-950 dark:group-hover:text-white text-xs font-bold transition-colors">
                      ›
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* TRANSAKSI TERBARU */}
          <div className="bg-white dark:bg-brand-900 rounded-[2rem] p-6 border border-brand-100 dark:border-brand-800 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-100 dark:border-brand-800">
              <div>
                <h2 className="text-base font-extrabold text-brand-950 dark:text-white">Transaksi Hari Ini</h2>
                <p className="text-xs text-brand-400">Pemasukan dan pengeluaran tercatat</p>
              </div>
              <button 
                type="button"
                onClick={() => setActiveTab('finance')}
                className="text-xs font-bold text-brand-500 hover:text-brand-950 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Kelola</span>
                <IconArrowRight />
              </button>
            </div>

            <div className="flex flex-col gap-2.5">
              {latestTransactions.length === 0 ? (
                <div className="py-8 px-4 text-center rounded-2xl border border-dashed border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-950/30 flex flex-col items-center gap-2">
                  <p className="text-xs font-bold text-brand-400">Belum ada transaksi hari ini.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('finance')}
                    className="text-xs font-bold text-brand-950 dark:text-white hover:underline cursor-pointer"
                  >
                    + Catat pengeluaran atau pemasukan
                  </button>
                </div>
              ) : (
                latestTransactions.map(t => (
                  <div 
                    key={t.id}
                    onClick={() => setActiveTab('finance')}
                    className="p-3.5 rounded-2xl bg-brand-50/70 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-800 flex items-center justify-between gap-3 cursor-pointer hover:bg-brand-100/60 dark:hover:bg-brand-800/40 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-brand-950 dark:text-white truncate">
                        {t.title}
                      </p>
                      <p className="text-[11px] text-brand-400 mt-0.5">
                        {t.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                      </p>
                    </div>

                    <div className={`text-xs sm:text-sm font-black shrink-0 flex items-center gap-1 ${
                      t.type === 'income' 
                        ? 'text-emerald-600 dark:text-emerald-400' 
                        : 'text-brand-950 dark:text-white'
                    }`}>
                      {t.type === 'income' ? <IconTrendingUp /> : <IconTrendingDown />}
                      <span>{t.type === 'income' ? '+' : '-'}{formatRupiah(t.amount)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Schedules & Daily Routine */}
        <div className="flex flex-col gap-6">
          
          {/* JADWAL HARI INI */}
          <div className="bg-white dark:bg-brand-900 rounded-[2rem] p-6 border border-brand-100 dark:border-brand-800 shadow-sm flex flex-col gap-4">
            <div className="flex items-center justify-between pb-3 border-b border-brand-100 dark:border-brand-800">
              <div>
                <h2 className="text-base font-extrabold text-brand-950 dark:text-white">Agenda & Jadwal</h2>
                <p className="text-xs text-brand-400">Jadwal kegiatan terdaftar hari ini</p>
              </div>
              <button 
                type="button"
                onClick={() => setActiveTab('schedule')}
                className="text-xs font-bold text-brand-500 hover:text-brand-950 dark:hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Kalender</span>
                <IconArrowRight />
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {sortedSchedules.length === 0 ? (
                <div className="py-10 px-4 text-center rounded-2xl border border-dashed border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-950/30 flex flex-col items-center gap-2">
                  <p className="text-xs font-bold text-brand-400">Tidak ada agenda atau jadwal untuk hari ini.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('schedule')}
                    className="text-xs font-bold text-brand-950 dark:text-white hover:underline cursor-pointer"
                  >
                    + Buat jadwal baru
                  </button>
                </div>
              ) : (
                sortedSchedules.map((schedule) => {
                  const [startH, startM] = schedule.time_start.split(':').map(Number);
                  const [endH, endM] = schedule.time_end.split(':').map(Number);
                  const startMins = startH * 60 + startM;
                  const endMins = endH * 60 + endM;
                  const isActive = currentMinutes >= startMins && currentMinutes <= endMins;

                  return (
                    <div 
                      key={schedule.id}
                      onClick={() => setActiveTab('schedule')}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                        isActive 
                          ? 'bg-brand-950 text-white border-brand-950 dark:bg-white dark:text-brand-950 dark:border-white shadow-lg scale-[1.01]' 
                          : 'bg-brand-50/70 dark:bg-brand-950/60 border-brand-100 dark:border-brand-800 hover:bg-brand-100/60 dark:hover:bg-brand-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-extrabold text-sm sm:text-base truncate">
                          {schedule.title}
                        </p>
                        {isActive && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-white shrink-0">
                            Aktif Sekarang
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-semibold opacity-80">
                        <IconClock />
                        <span>{schedule.time_start} - {schedule.time_end}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* PRODUCTIVITY MOTIVATION BANNER */}
          <div className="p-5 rounded-3xl bg-brand-100/60 dark:bg-brand-950/60 border border-brand-200/60 dark:border-brand-800/80 flex flex-col gap-1">
            <span className="text-[10px] font-extrabold tracking-wider uppercase text-brand-400">Tips Produktivitas</span>
            <p className="text-xs sm:text-sm font-semibold text-brand-800 dark:text-brand-200 leading-relaxed">
              "Fokus menyelesaikan satu tugas prioritas utama setiap saat untuk mengurangi distraksi dan meningkatkan konsistensi harian Anda."
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
