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
    // Optimistic UI update
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
    <div className="main-content">
      <div className="section-header">
        <h2>
          <span className="section-icon">🔄</span>
          Rutinitas Harian
        </h2>
        <button className="btn-add" onClick={() => setShowModal(true)}>
          <span className="plus-icon">+</span> Tambah
        </button>
      </div>

      {totalCount > 0 && (
        <div className="progress-container">
          <div className="progress-info">
            <span className="progress-label">Progres hari ini</span>
            <span className="progress-value">{completedCount}/{totalCount} selesai</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
      )}

      {loading ? (
        <p>Memuat rutinitas...</p>
      ) : totalCount === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <p className="empty-text">Belum ada rutinitas</p>
          <p className="empty-subtext">Tambahkan rutinitas harianmu (misal: Mandi, Olahraga)</p>
        </div>
      ) : (
        <div className="task-list">
          {routines.map((routine, index) => {
            const completed = isRoutineCompleted(routine.id);
            return (
              <div
                key={routine.id}
                className={`task-item ${completed ? 'completed' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <button
                  className={`task-checkbox ${completed ? 'checked' : ''}`}
                  onClick={() => handleToggle(routine.id)}
                >
                  {completed && '✓'}
                </button>
                <div className="task-content">
                  <p className="task-text">{routine.title}</p>
                </div>
                <button
                  className="task-delete"
                  onClick={() => handleDeleteRoutine(routine.id)}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="✏️ Tambah Rutinitas">
        <form onSubmit={handleAddRoutine}>
          <div className="form-group">
            <label className="form-label">Nama Rutinitas</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Skincare malam"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={!newTitle.trim() || saving}>
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
