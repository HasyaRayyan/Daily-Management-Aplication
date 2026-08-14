import { useState, useEffect } from 'react';
import Modal from './Modal';
import Header from './Header';
import { getRoutines, addRoutine, deleteRoutine, getRoutineLogs, toggleRoutineLog, getRoutineHistory } from '../utils/storage';
import { getDateKey } from '../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Routine({ onBack }) {
  const [routines, setRoutines] = useState([]);
  const [logs, setLogs] = useState([]);
  const [historyLogsRaw, setHistoryLogsRaw] = useState([]);
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTimeOfDay, setNewTimeOfDay] = useState('kapan_saja');
  const [saving, setSaving] = useState(false);

  const [notesModal, setNotesModal] = useState({ isOpen: false, routineId: null, currentNote: '' });
  
  const [chartPeriod, setChartPeriod] = useState('weekly');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const todayDateKey = getDateKey(new Date());

  const fetchData = async () => {
    setLoading(true);
    const fetchedRoutines = await getRoutines();
    const fetchedLogs = await getRoutineLogs(todayDateKey);
    
    const daysCount = chartPeriod === 'weekly' ? 7 : 30;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - daysCount + 1);
    
    const startKey = getDateKey(startDate);
    const endKey = getDateKey(endDate);
    
    const historyLogs = await getRoutineHistory(startKey, endKey);
    setHistoryLogsRaw(historyLogs);
    
    const chartData = [];
    for (let i = 0; i < daysCount; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dKey = getDateKey(d);
      
      const dayLogs = historyLogs.filter(l => l.date_key === dKey && l.completed);
      
      const label = chartPeriod === 'weekly' 
        ? d.toLocaleDateString('id-ID', { weekday: 'short' })
        : d.getDate().toString();
        
      chartData.push({
        date: label,
        fullDate: dKey,
        completed: dayLogs.length
      });
    }

    setHistoryData(chartData);
    setRoutines(fetchedRoutines);
    setLogs(fetchedLogs);
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, [chartPeriod]);

  const handleAddRoutine = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || saving) return;
    setSaving(true);
    await addRoutine(newTitle.trim(), newTimeOfDay);
    setNewTitle('');
    setNewTimeOfDay('kapan_saja');
    setShowModal(false);
    await fetchData();
    setSaving(false);
  };

  const handleDeleteRoutine = async (id) => {
    if (!window.confirm("Yakin ingin menghapus rutinitas ini?")) return;
    await deleteRoutine(id);
    await fetchData();
  };

  const handleToggle = async (routineId) => {
    const isCompleted = isRoutineCompleted(routineId);
    const existingLog = getRoutineLog(routineId);
    
    setLogs(prev => {
      if (existingLog) {
        return prev.map(l => l.routine_id === routineId ? { ...l, completed: !isCompleted, completed_at: !isCompleted ? new Date().toISOString() : null } : l);
      } else {
        return [...prev, { routine_id: routineId, completed: !isCompleted, completed_at: !isCompleted ? new Date().toISOString() : null }];
      }
    });

    await toggleRoutineLog(routineId, todayDateKey, !isCompleted, existingLog?.notes);
    setTimeout(fetchData, 500); 
  };

  const handleSaveNotes = async (e) => {
    e.preventDefault();
    setSaving(true);
    await toggleRoutineLog(notesModal.routineId, todayDateKey, true, notesModal.currentNote);
    
    setLogs(prev => prev.map(l => l.routine_id === notesModal.routineId ? { ...l, notes: notesModal.currentNote } : l));
    setSaving(false);
    setNotesModal({ isOpen: false, routineId: null, currentNote: '' });
  };

  const getRoutineLog = (routineId) => logs.find(l => l.routine_id === routineId);
  const isRoutineCompleted = (routineId) => getRoutineLog(routineId)?.completed || false;
  
  const getCompletionTime = (routineId) => {
    const log = getRoutineLog(routineId);
    if (log && log.completed && log.completed_at) {
      const d = new Date(log.completed_at);
      return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    }
    return null;
  };

  // Calculate Streak
  const getStreak = (routineId) => {
    let streak = 0;
    const now = new Date();
    
    // Check if completed today
    const completedToday = isRoutineCompleted(routineId);
    if (completedToday) streak += 1;
    
    // Check backwards from yesterday
    for (let i = 1; i < 30; i++) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const key = getDateKey(d);
      
      const log = historyLogsRaw.find(l => l.routine_id === routineId && l.date_key === key);
      if (log && log.completed) {
        streak++;
      } else {
        break; // Streak broken
      }
    }
    return streak;
  };

  // Grouping
  const routinesByTime = {
    pagi: routines.filter(r => r.time_of_day === 'pagi'),
    siang: routines.filter(r => r.time_of_day === 'siang'),
    malam: routines.filter(r => r.time_of_day === 'malam'),
    kapan_saja: routines.filter(r => r.time_of_day === 'kapan_saja' || !r.time_of_day)
  };
  
  const completedCount = routines.filter(r => isRoutineCompleted(r.id)).length;
  const progressPercent = routines.length > 0 ? Math.round((completedCount / routines.length) * 100) : 0;
  
  const textColor = isDarkMode ? '#a1a1aa' : '#71717a';

  return (
    <div className="flex flex-col gap-6 px-5 pt-6 pb-24 animate-fade-in relative min-h-full">
      <Header title="Routine" onBack={onBack} />

      {/* Daily Progress Bar */}
      <div className="card !p-4">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h3 className="font-extrabold text-sm uppercase tracking-widest text-brand-400">Target Hari Ini</h3>
            <p className="font-black text-2xl">{completedCount} <span className="text-lg text-brand-500 font-bold">/ {routines.length}</span></p>
          </div>
          <p className="font-black text-xl text-brand-950 dark:text-white">{progressPercent}%</p>
        </div>
        <div className="h-4 w-full bg-brand-100 dark:bg-brand-900 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-brand-950 dark:bg-white rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${progressPercent}%` }} 
          />
        </div>
        {progressPercent === 100 && routines.length > 0 && (
          <p className="text-center font-bold text-xs mt-3 text-brand-600 dark:text-brand-300 bg-brand-50 dark:bg-brand-900 p-2 rounded-lg">Luar biasa! Semua rutinitas hari ini telah selesai.</p>
        )}
      </div>

      {/* Chart Section */}
      <div className="card w-full !p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-sm tracking-wide text-brand-900 dark:text-white uppercase">Progres Rutinitas</h3>
          <div className="flex bg-brand-100 dark:bg-brand-900 rounded-lg p-1">
            <button 
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${chartPeriod === 'weekly' ? 'bg-white dark:bg-brand-950 shadow-sm text-brand-900 dark:text-white' : 'text-brand-500 hover:text-brand-900 dark:hover:text-white'}`}
              onClick={() => setChartPeriod('weekly')}
            >
              Mingguan
            </button>
            <button 
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${chartPeriod === 'monthly' ? 'bg-white dark:bg-brand-950 shadow-sm text-brand-900 dark:text-white' : 'text-brand-500 hover:text-brand-900 dark:hover:text-white'}`}
              onClick={() => setChartPeriod('monthly')}
            >
              Bulanan
            </button>
          </div>
        </div>
        
        <div className="w-full h-[180px]">
          {loading && historyData.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center animate-pulse text-xs font-bold text-brand-400">Memuat grafik...</div>
          ) : (
            <ResponsiveContainer>
              <BarChart data={historyData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="date" tick={{fontSize: 10, fill: textColor, fontWeight: 700}} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{fontSize: 10, fill: textColor, fontWeight: 700}} axisLine={false} tickLine={false} />
                <RechartsTooltip 
                  cursor={{fill: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}}
                  contentStyle={{ backgroundColor: isDarkMode ? '#18181b' : '#ffffff', border: 'none', borderRadius: '16px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', color: isDarkMode ? '#fff' : '#000', fontWeight: 'bold' }} 
                  labelFormatter={(label, payload) => payload?.[0]?.payload?.fullDate || label}
                  formatter={(value) => [`${value} Rutinitas`, 'Selesai']}
                />
                <Bar dataKey="completed" radius={[6, 6, 0, 0]} maxBarSize={40}>
                  {historyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fullDate === todayDateKey ? (isDarkMode ? '#ffffff' : '#000000') : (isDarkMode ? '#3f3f46' : '#a1a1aa')} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Routine List */}
      {loading && routines.length === 0 ? (
        <div className="text-center font-bold animate-pulse text-brand-500 py-10">Memuat rutinitas...</div>
      ) : routines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="font-extrabold text-lg mb-2">Belum ada rutinitas</p>
          <p className="text-brand-500 text-sm max-w-[200px] font-medium">Tekan tombol + di bawah untuk mulai menambahkan.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6 pb-6">
          {Object.entries(routinesByTime).map(([timeGroup, groupRoutines]) => {
            if (groupRoutines.length === 0) return null;
            
            const groupTitles = {
              pagi: 'Pagi',
              siang: 'Siang',
              malam: 'Malam',
              kapan_saja: 'Kapan Saja'
            };

            return (
              <div key={timeGroup} className="flex flex-col gap-3">
                <h3 className="font-extrabold text-xs tracking-widest text-brand-400 uppercase ml-2 border-b border-brand-200 dark:border-brand-800 pb-2">
                  {groupTitles[timeGroup]}
                </h3>
                {groupRoutines.map((routine, index) => {
                  const completed = isRoutineCompleted(routine.id);
                  const time = getCompletionTime(routine.id);
                  const streak = getStreak(routine.id);
                  const note = getRoutineLog(routine.id)?.notes;

                  return (
                    <div
                      key={routine.id}
                      className={`flex flex-col gap-3 p-5 bg-brand-50 dark:bg-brand-900 rounded-2xl border transition-all animate-slide-up ${
                        completed ? 'border-brand-300 dark:border-brand-600 shadow-sm' : 'border-transparent'
                      }`}
                      style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1 flex-1 pr-4">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className={`font-black text-lg transition-all ${completed ? 'line-through text-brand-400 dark:text-brand-500' : 'text-brand-900 dark:text-brand-50'}`}>
                              {routine.title}
                            </p>
                            {streak > 1 && (
                              <span className="bg-brand-100 dark:bg-brand-900/40 text-brand-900 dark:text-brand-100 text-[10px] font-black px-2 py-0.5 rounded-full border border-brand-200 dark:border-brand-800/50 flex items-center gap-1">
                                Streak {streak} Hari
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <p className={`text-xs font-bold ${completed ? 'text-brand-600 dark:text-brand-400' : 'text-brand-400 dark:text-brand-600'}`}>
                              {completed ? `(${time}) check` : 'none'}
                            </p>
                            {completed && (
                              <button 
                                onClick={() => setNotesModal({ isOpen: true, routineId: routine.id, currentNote: note || '' })}
                                className="text-xs font-bold text-brand-500 hover:text-brand-900 dark:hover:text-white transition-colors underline decoration-brand-300 underline-offset-2"
                              >
                                {note ? 'Edit Catatan' : '+ Tambah Catatan'}
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => handleToggle(routine.id)}
                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                              completed 
                                ? 'bg-brand-950 border-brand-950 text-white dark:bg-white dark:border-white dark:text-black scale-110' 
                                : 'border-brand-300 dark:border-brand-700 hover:border-brand-500 bg-white dark:bg-brand-950'
                            }`}
                          >
                            {completed && <svg className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                          </button>
                          <button
                            onClick={() => handleDeleteRoutine(routine.id)}
                            className="text-brand-300 hover:text-red-500 transition-colors"
                          >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                          </button>
                        </div>
                      </div>
                      
                      {/* Notes Display */}
                      {completed && note && (
                        <div className="mt-2 p-3 bg-brand-100 dark:bg-brand-950/50 rounded-xl border border-brand-200 dark:border-brand-800 text-sm font-medium text-brand-700 dark:text-brand-300">
                          <span className="font-bold text-xs text-brand-400 block mb-1 uppercase tracking-widest">Catatan Hari Ini:</span>
                          {note}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button 
        onClick={() => setShowModal(true)} 
        className="fixed bottom-24 right-5 md:bottom-10 md:right-10 w-16 h-16 bg-brand-200 dark:bg-brand-800 text-brand-900 dark:text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform z-[150] border-2 border-brand-100 dark:border-brand-900"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>

      {/* Add Routine Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Tambah Rutinitas">
        <form onSubmit={handleAddRoutine} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-brand-600 dark:text-brand-400 tracking-wider">NAMA RUTINITAS</label>
            <input
              type="text"
              className="input-field"
              placeholder="Contoh: Skincare malam"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
              required
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-brand-600 dark:text-brand-400 tracking-wider">KATEGORI WAKTU</label>
            <select 
              className="input-field appearance-none cursor-pointer"
              value={newTimeOfDay}
              onChange={(e) => setNewTimeOfDay(e.target.value)}
            >
              <option value="kapan_saja">Kapan Saja</option>
              <option value="pagi">Pagi</option>
              <option value="siang">Siang</option>
              <option value="malam">Malam</option>
            </select>
          </div>
          <button type="submit" className="btn-primary mt-4" disabled={!newTitle.trim() || saving}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </Modal>

      {/* Notes Modal */}
      <Modal isOpen={notesModal.isOpen} onClose={() => setNotesModal({ isOpen: false, routineId: null, currentNote: '' })} title="Catatan Jurnal">
        <form onSubmit={handleSaveNotes} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-brand-600 dark:text-brand-400 tracking-wider">TULIS PENCAPAIAN/CATATAN (OPSIONAL)</label>
            <textarea
              className="input-field min-h-[100px] resize-y"
              placeholder="Misal: Berhasil lari 5 km hari ini, lelah tapi seru!"
              value={notesModal.currentNote}
              onChange={(e) => setNotesModal({ ...notesModal, currentNote: e.target.value })}
              autoFocus
            />
          </div>
          <button type="submit" className="btn-primary mt-2" disabled={saving}>
            {saving ? 'Menyimpan...' : 'Simpan Catatan'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
