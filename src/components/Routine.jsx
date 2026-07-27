import { useState, useEffect } from 'react';
import Modal from './Modal';
import { getRoutines, addRoutine, deleteRoutine, getRoutineLogs, toggleRoutineLog } from '../utils/storage';
import { getDateKey } from '../utils/helpers';

export default function Routine() {
  const [routines, setRoutines] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [saving, setSaving] = useState(false);
  
  const todayDateKey = getDateKey(new Date());

  const fetchData = async () => {
    setLoading(true);
    const fetchedRoutines = await getRoutines();
    const fetchedLogs = await getRoutineLogs(todayDateKey);
    setRoutines(fetchedRoutines);
    setLogs(fetchedLogs);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddRoutine = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || saving) return;
    setSaving(true);
    await addRoutine(newTitle.trim());
    setNewTitle('');
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
    setLogs(prev => {
      const existing = prev.find(l => l.routine_id === routineId);
      if (existing) {
        return prev.map(l => l.routine_id === routineId ? { ...l, completed: !isCompleted } : l);
      } else {
        return [...prev, { routine_id: routineId, completed: !isCompleted }];
      }
    });
    await toggleRoutineLog(routineId, todayDateKey, !isCompleted);
  };

  const isRoutineCompleted = (routineId) => {
    const log = logs.find(l => l.routine_id === routineId);
    return log ? log.completed : false;
  };

  const completedCount = routines.filter(r => isRoutineCompleted(r.id)).length;
  const totalCount = routines.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 px-5 pt-2 pb-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-extrabold tracking-tight flex items-center gap-3">
          <span>🔄</span> Rutinitas
        </h2>
        <button onClick={() => setShowModal(true)} className="bg-brand-950 dark:bg-white text-white dark:text-brand-950 font-bold px-4 py-2 rounded-xl shadow-sm hover:scale-105 transition-transform text-sm">
          + Tambah
        </button>
      </div>

      {totalCount > 0 && (
        <div className="card">
          <div className="flex justify-between text-sm font-semibold mb-3">
            <span className="text-brand-500 dark:text-brand-400">Progres hari ini</span>
            <span>{completedCount}/{totalCount} selesai</span>
          </div>
          <div className="h-3 w-full bg-brand-100 dark:bg-brand-800 rounded-full overflow-hidden shadow-inner">
            <div className="h-full bg-brand-950 dark:bg-white rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center font-bold animate-pulse text-brand-500 py-10">Memuat rutinitas...</div>
      ) : totalCount === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-6xl mb-4 grayscale opacity-50">📝</div>
          <p className="font-extrabold text-xl mb-2">Belum ada rutinitas</p>
          <p className="text-brand-500 text-sm max-w-[200px]">Tambahkan rutinitas harianmu seperti mandi atau olahraga.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {routines.map((routine, index) => {
            const completed = isRoutineCompleted(routine.id);
            return (
              <div
                key={routine.id}
                className="flex items-center justify-between p-4 bg-white dark:bg-brand-900 rounded-2xl shadow-sm border border-brand-100 dark:border-brand-800 animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}
              >
                <div className="flex items-center gap-4 flex-1">
                  <button
                    onClick={() => handleToggle(routine.id)}
                    className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all ${
                      completed 
                        ? 'bg-brand-950 border-brand-950 text-white dark:bg-white dark:border-white dark:text-black scale-110' 
                        : 'border-brand-300 dark:border-brand-700 hover:border-brand-500'
                    }`}
                  >
                    {completed && <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                  </button>
                  <p className={`font-bold text-lg transition-all ${completed ? 'line-through text-brand-400 dark:text-brand-600' : 'text-brand-900 dark:text-brand-50'}`}>
                    {routine.title}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteRoutine(routine.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-brand-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="✏️ Tambah Rutinitas">
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
          <button type="submit" className="btn-primary mt-2" disabled={!newTitle.trim() || saving}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
