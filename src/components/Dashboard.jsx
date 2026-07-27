import { useState, useEffect } from 'react';
import { formatRupiah, getDateKey } from '../utils/helpers';
import { getProfile, getRoutines, getRoutineLogs, getSchedules, getTransactions } from '../utils/storage';

const IconRefresh = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 1 0 2.6-6.4L2 9"/></svg>;

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

  const completedCount = routines.filter(r => logs.find(l => l.routine_id === r.id)?.completed).length;
  const totalCount = routines.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const latestTransactions = transactions.slice(0, 3);

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (loading) {
    return <div className="p-6 text-center text-sm font-bold animate-pulse">Memuat dashboard...</div>;
  }

  return (
    <div className="flex flex-col gap-6 px-5 pt-2 pb-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-white dark:bg-brand-900 p-5 rounded-2xl shadow-sm border border-brand-100 dark:border-brand-800">
        <div className="flex items-center gap-4">
          <div 
            onClick={() => setActiveTab('profile')} 
            className="w-14 h-14 rounded-full bg-brand-100 dark:bg-brand-800 flex items-center justify-center font-bold text-xl cursor-pointer overflow-hidden border-2 border-brand-200 dark:border-brand-700 hover:border-brand-950 dark:hover:border-white transition-colors"
          >
            {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-bold text-brand-500 dark:text-brand-400 tracking-wider">SELAMAT DATANG</p>
            <h1 className="text-xl font-extrabold leading-tight">{displayName}</h1>
          </div>
        </div>
        <button onClick={fetchData} className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-950 flex items-center justify-center hover:bg-brand-100 dark:hover:bg-brand-800 transition-colors">
          <IconRefresh />
        </button>
      </div>

      {/* Routine Progress */}
      <div onClick={() => setActiveTab('routine')} className="card group cursor-pointer">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold flex items-center gap-2"><span className="text-xl">✅</span> Rutinitas Harian</h2>
          <span className="text-xs font-bold text-brand-400 group-hover:text-brand-900 dark:group-hover:text-white transition-colors">Lihat ›</span>
        </div>
        <div className="bg-brand-50 dark:bg-brand-950 p-4 rounded-xl">
          <div className="flex justify-between text-sm font-semibold mb-2">
            <span>Progres Hari Ini</span>
            <span>{completedCount}/{totalCount} ({progressPercent}%)</span>
          </div>
          <div className="h-2 w-full bg-brand-200 dark:bg-brand-800 rounded-full overflow-hidden">
            <div className="h-full bg-brand-950 dark:bg-white rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      </div>

      {/* Schedules */}
      <div onClick={() => setActiveTab('schedule')} className="card group cursor-pointer">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold flex items-center gap-2"><span className="text-xl">📅</span> Jadwal Hari Ini</h2>
          <span className="text-xs font-bold text-brand-400 group-hover:text-brand-900 dark:group-hover:text-white transition-colors">Lihat ›</span>
        </div>
        <div className="flex flex-col gap-2">
          {schedules.length === 0 ? (
            <p className="text-sm font-semibold text-brand-400 text-center py-2">Tidak ada jadwal hari ini</p>
          ) : (
            schedules.map((schedule) => {
              const [startH, startM] = schedule.time_start.split(':').map(Number);
              const [endH, endM] = schedule.time_end.split(':').map(Number);
              const startMins = startH * 60 + startM;
              const endMins = endH * 60 + endM;
              const isActive = currentMinutes >= startMins && currentMinutes <= endMins;

              return (
                <div key={schedule.id} className={`p-3 rounded-xl border flex flex-col gap-1 transition-all ${isActive ? 'bg-brand-950 text-white border-brand-950 dark:bg-white dark:text-brand-950 dark:border-white shadow-md scale-[1.02]' : 'bg-brand-50 dark:bg-brand-950 border-transparent hover:border-brand-200 dark:hover:border-brand-800'}`}>
                  <p className="font-bold text-sm">{schedule.title}</p>
                  <p className={`text-xs font-semibold ${isActive ? 'opacity-90' : 'text-brand-500'}`}>
                    {schedule.time_start} - {schedule.time_end} {isActive && '• Sedang Berlangsung'}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Finances */}
      <div onClick={() => setActiveTab('finance')} className="card group cursor-pointer mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold flex items-center gap-2"><span className="text-xl">💰</span> Transaksi Terbaru</h2>
          <span className="text-xs font-bold text-brand-400 group-hover:text-brand-900 dark:group-hover:text-white transition-colors">Lihat ›</span>
        </div>
        <div className="flex flex-col gap-2">
          {latestTransactions.length === 0 ? (
            <p className="text-sm font-semibold text-brand-400 text-center py-2">Belum ada transaksi</p>
          ) : (
            latestTransactions.map((t) => (
              <div key={t.id} className="flex justify-between items-center p-3 bg-brand-50 dark:bg-brand-950 rounded-xl">
                <p className="font-bold text-sm truncate max-w-[60%]">{t.title}</p>
                <p className={`font-bold text-sm ${t.type === 'expense' ? 'text-red-500 dark:text-red-400' : 'text-green-500 dark:text-green-400'}`}>
                  {t.type === 'expense' ? '-' : '+'}{formatRupiah(t.amount)}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
