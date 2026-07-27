import { useState, useEffect } from 'react';
import Modal from './Modal';
import { getSchedules, addSchedule, deleteSchedule } from '../utils/storage';
import { getDateKey } from '../utils/helpers';

export default function Schedule() {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [saving, setSaving] = useState(false);

  const todayDateKey = getDateKey(new Date());

  const fetchData = async () => {
    setLoading(true);
    const data = await getSchedules(todayDateKey);
    setSchedules(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !timeStart || !timeEnd || saving) return;
    setSaving(true);
    await addSchedule({
      title: title.trim(),
      time_start: timeStart,
      time_end: timeEnd,
      date_key: todayDateKey
    });
    setTitle('');
    setTimeStart('');
    setTimeEnd('');
    setShowModal(false);
    await fetchData();
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus jadwal ini?")) return;
    await deleteSchedule(id);
    await fetchData();
  };

  // Helper function to check if a schedule is currently active or upcoming
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    <div className="main-content">
      <div className="section-header">
        <h2>
          <span className="section-icon">📅</span>
          Jadwal Hari Ini
        </h2>
        <button className="btn-add" onClick={() => setShowModal(true)}>
          <span className="plus-icon">+</span> Tambah
        </button>
      </div>

      {loading ? (
        <p>Memuat jadwal...</p>
      ) : schedules.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🗓️</div>
          <p className="empty-text">Tidak ada jadwal</p>
          <p className="empty-subtext">Tambahkan jadwal kuliah atau kegiatanmu hari ini</p>
        </div>
      ) : (
        <div className="transaction-list">
          {schedules.map((schedule, index) => {
            const [startH, startM] = schedule.time_start.split(':').map(Number);
            const [endH, endM] = schedule.time_end.split(':').map(Number);
            const startMins = startH * 60 + startM;
            const endMins = endH * 60 + endM;
            
            let status = '';
            if (currentMinutes >= startMins && currentMinutes <= endMins) {
              status = 'Sedang berlangsung';
            } else if (currentMinutes < startMins) {
              status = 'Akan datang';
            } else {
              status = 'Selesai';
            }

            return (
              <div
                key={schedule.id}
                className="transaction-item"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="transaction-icon" style={{ background: 'var(--primary)', color: 'white' }}>
                  ⏰
                </div>
                <div className="transaction-content">
                  <p className="transaction-desc">{schedule.title}</p>
                  <span className="transaction-category">
                    {schedule.time_start} - {schedule.time_end} • {status}
                  </span>
                </div>
                <button
                  className="transaction-delete"
                  onClick={() => handleDelete(schedule.id)}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="✏️ Tambah Jadwal">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Kegiatan / Mata Kuliah</label>
            <input
              type="text"
              className="form-input"
              placeholder="Contoh: Pemrograman Web"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Waktu Mulai</label>
              <input
                type="time"
                className="form-input"
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value)}
                required
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Waktu Selesai</label>
              <input
                type="time"
                className="form-input"
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-primary" disabled={!title.trim() || !timeStart || !timeEnd || saving}>
            {saving ? 'Menyimpan...' : 'Simpan Jadwal'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
