import { useState, useEffect } from 'react';
import Modal from './Modal';
import Header from './Header';
import { getSchedules, addSchedule, deleteSchedule } from '../utils/storage';
import { getDateKey } from '../utils/helpers';

export default function Schedule({ onBack }) {
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

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    <div className="flex flex-col gap-6 px-5 pt-6 pb-24 animate-fade-in">
      <Header title="Schedule" onBack={onBack} />
      
      <div className="flex justify-end -mt-16 mb-4 relative z-10">
        <button onClick={() => setShowModal(true)} className="bg-brand-950 dark:bg-white text-white dark:text-brand-950 font-bold px-4 py-2 rounded-xl shadow-sm hover:scale-105 transition-transform text-sm">
          + Tambah
        </button>
      </div>

      {loading ? (
        <div className="text-center font-bold animate-pulse text-brand-500 py-10">Memuat jadwal...</div>
      ) : schedules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-6xl mb-4 grayscale opacity-50">🗓️</div>
          <p className="font-extrabold text-xl mb-2">Tidak ada jadwal</p>
          <p className="text-brand-500 text-sm max-w-[200px]">Tambahkan kegiatan atau mata kuliahmu hari ini.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {schedules.map((schedule, index) => {
            const [startH, startM] = schedule.time_start.split(':').map(Number);
            const [endH, endM] = schedule.time_end.split(':').map(Number);
            const startMins = startH * 60 + startM;
            const endMins = endH * 60 + endM;
            
            let status = '';
            let isActive = false;
            let isPast = false;
            if (currentMinutes >= startMins && currentMinutes <= endMins) {
              status = 'Sedang berlangsung';
              isActive = true;
            } else if (currentMinutes < startMins) {
              status = 'Akan datang';
            } else {
              status = 'Selesai';
              isPast = true;
            }

            return (
              <div
                key={schedule.id}
                className={`relative overflow-hidden flex items-center justify-between p-4 rounded-2xl shadow-sm border transition-all animate-slide-up ${
                  isActive 
                    ? 'bg-brand-950 dark:bg-white text-white dark:text-brand-950 border-brand-950 dark:border-white scale-[1.02] shadow-lg' 
                    : isPast 
                      ? 'bg-brand-50/50 dark:bg-brand-900/30 border-transparent opacity-60' 
                      : 'bg-white dark:bg-brand-900 border-brand-100 dark:border-brand-800'
                }`}
                style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}
              >
                <div className="flex-1">
                  <p className="font-bold text-lg mb-1">{schedule.title}</p>
                  <div className={`flex items-center gap-2 text-xs font-semibold ${isActive ? 'opacity-90' : 'text-brand-500 dark:text-brand-400'}`}>
                    <span className={`px-2 py-1 rounded-md ${isActive ? 'bg-white/20 dark:bg-black/10' : 'bg-brand-100 dark:bg-brand-800'}`}>
                      {schedule.time_start} - {schedule.time_end}
                    </span>
                    <span>• {status}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(schedule.id)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    isActive 
                      ? 'text-white/60 hover:text-white dark:text-black/60 dark:hover:text-black hover:bg-white/20 dark:hover:bg-black/10' 
                      : 'text-brand-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
                  }`}
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Tambah Jadwal">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-brand-600 dark:text-brand-400 tracking-wider">NAMA KEGIATAN</label>
            <input type="text" className="input-field" placeholder="Contoh: Pemrograman Web" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className="flex gap-4">
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-xs font-bold text-brand-600 dark:text-brand-400 tracking-wider">WAKTU MULAI</label>
              <input type="time" className="input-field" value={timeStart} onChange={(e) => setTimeStart(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-xs font-bold text-brand-600 dark:text-brand-400 tracking-wider">WAKTU SELESAI</label>
              <input type="time" className="input-field" value={timeEnd} onChange={(e) => setTimeEnd(e.target.value)} required />
            </div>
          </div>
          <button type="submit" className="btn-primary mt-2" disabled={!title.trim() || !timeStart || !timeEnd || saving}>
            {saving ? 'Menyimpan...' : 'Simpan Jadwal'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
