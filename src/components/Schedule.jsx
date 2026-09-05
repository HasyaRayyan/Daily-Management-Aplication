import { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import Header from './Header';
import { getSchedules, addSchedule, deleteSchedule } from '../utils/storage';
import { getDateKey } from '../utils/helpers';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import Tesseract from 'tesseract.js';

const TAG_COLORS = {
  umum: 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300 border-brand-200 dark:border-brand-800',
  pekerjaan: 'bg-brand-200 text-brand-800 dark:bg-brand-800 dark:text-brand-200 border-brand-300 dark:border-brand-700',
  pribadi: 'bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-400 border-brand-200 dark:border-brand-800',
  belajar: 'bg-white text-brand-900 dark:bg-black dark:text-brand-100 border-brand-300 dark:border-brand-700',
  hiburan: 'bg-brand-300 text-brand-900 dark:bg-brand-700 dark:text-brand-100 border-brand-400 dark:border-brand-600',
};

const TAG_LABELS = {
  umum: 'Umum',
  pekerjaan: 'Pekerjaan',
  pribadi: 'Pribadi',
  belajar: 'Belajar',
  hiburan: 'Hiburan',
};

export default function Schedule({ onBack }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());

  const [form, setForm] = useState({ title: '', time_start: '', time_end: '', tag: 'umum' });
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef(null);

  const processImageOCR = async (imageUrl) => {
    try {
      setIsScanning(true);
      const result = await Tesseract.recognize(imageUrl, 'ind+eng');
      const text = result.data.text.toLowerCase();
      
      const timeRegex = /([01]?\d|2[0-3])[:.]([0-5]\d)/g;
      let match;
      const times = [];
      while ((match = timeRegex.exec(text)) !== null) {
        times.push(`${match[1].padStart(2, '0')}:${match[2]}`);
      }

      let time_start = '';
      let time_end = '';
      if (times.length >= 2) {
        time_start = times[0];
        time_end = times[1];
      } else if (times.length === 1) {
        time_start = times[0];
        const [h, m] = time_start.split(':').map(Number);
        time_end = `${String((h + 1) % 24).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      }

      const lines = result.data.text.split('\n').map(l => l.trim()).filter(l => l.length > 3 && !/^\d{1,2}[:.]\d{2}/.test(l));
      let extractedTitle = "Jadwal dari Foto";
      if (lines.length > 0) {
         extractedTitle = lines[0];
      }

      setForm(prev => ({
        ...prev,
        title: extractedTitle,
        time_start: time_start || prev.time_start,
        time_end: time_end || prev.time_end
      }));

    } catch (error) {
      console.error("OCR Error:", error);
      alert("Gagal membaca teks dari foto.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleNativePhotoPicker = async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 60,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt
      });
      await processImageOCR(image.dataUrl);
    } catch (err) {
      if (err.message && (err.message.includes('User cancelled') || err.message.includes('canceled'))) {
        return;
      }
      alert(`Peringatan Kamera: ${err.message || err}`);
    }
  };

  // Generate date array for mini calendar (3 days ago to 14 days ahead)
  const calendarDates = Array.from({ length: 18 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 3 + i);
    return d;
  });

  const scrollContainerRef = useRef(null);

  useEffect(() => {
    // Scroll to today on mount
    if (scrollContainerRef.current) {
      const todayIndex = 3; // Because we start 3 days ago
      const itemWidth = 70; // Approx width of a date item
      scrollContainerRef.current.scrollLeft = (todayIndex * itemWidth) - (window.innerWidth / 2) + (itemWidth / 2);
    }
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const dateKey = getDateKey(selectedDate);
    const data = await getSchedules(dateKey);
    setSchedules(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [selectedDate]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.time_start || !form.time_end || saving) return;
    
    if (form.time_start >= form.time_end) {
      alert("Waktu selesai harus lebih besar dari waktu mulai!");
      return;
    }

    setSaving(true);
    const dateKey = getDateKey(selectedDate);
    await addSchedule({ ...form, date_key: dateKey });
    setForm({ title: '', time_start: '', time_end: '', tag: 'umum' });
    setShowModal(false);
    await fetchData();
    setSaving(false);
  };

  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const isToday = getDateKey(selectedDate) === getDateKey(new Date());

  return (
    <div className="flex flex-col gap-6 px-5 pt-6 pb-24 md:pb-8 animate-fade-in relative min-h-full">
      <Header title="Jadwal" onBack={onBack} />

      {/* Mini Calendar */}
      <div className="-mx-5 px-5 py-2">
        <div 
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x"
        >
          {calendarDates.map((d, i) => {
            const isSelected = getDateKey(d) === getDateKey(selectedDate);
            const isTodayDate = getDateKey(d) === getDateKey(new Date());
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(d)}
                className={`snap-center flex flex-col items-center justify-center min-w-[4.5rem] h-[5.5rem] rounded-2xl border transition-all ${
                  isSelected 
                    ? 'bg-brand-950 border-brand-950 text-white dark:bg-white dark:border-white dark:text-brand-950 shadow-md scale-105' 
                    : 'bg-brand-50 dark:bg-brand-900 border-brand-100 dark:border-brand-800 hover:border-brand-300 dark:hover:border-brand-600'
                }`}
              >
                <span className={`text-[10px] font-black uppercase tracking-widest ${isSelected ? 'opacity-90' : 'text-brand-400'}`}>
                  {d.toLocaleDateString('id-ID', { weekday: 'short' })}
                </span>
                <span className="text-2xl font-black mt-1">{d.getDate()}</span>
                {isTodayDate && (
                  <div className={`w-1.5 h-1.5 rounded-full mt-1 ${isSelected ? 'bg-white dark:bg-brand-950' : 'bg-brand-500'}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between items-end mb-2 -mt-4">
        <div>
          <h2 className="font-extrabold text-lg">
            {isToday ? 'Hari Ini' : selectedDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
          </h2>
          <p className="text-xs font-bold text-brand-400">{schedules.length} Kegiatan Terjadwal</p>
        </div>
      </div>

      {/* Vertical Timeline */}
      {loading ? (
        <div className="text-center font-bold animate-pulse text-brand-500 py-10">Memuat jadwal...</div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-12 flex flex-col items-center">
          <p className="font-bold text-brand-400">Tidak ada jadwal untuk hari ini.</p>
          <button onClick={() => setShowModal(true)} className="text-xs font-bold text-brand-600 mt-2 underline decoration-brand-300 underline-offset-2">Klik untuk menambahkan jadwal</button>
        </div>
      ) : (
        <div className="relative pl-4 mt-2 pb-10">
          {/* Vertical Line */}
          <div className="absolute left-[22px] top-4 bottom-0 w-[2px] bg-brand-100 dark:bg-brand-800 rounded-full" />
          
          <div className="flex flex-col gap-6">
            {schedules.map((schedule, index) => {
              const [startH, startM] = schedule.time_start.split(':').map(Number);
              const [endH, endM] = schedule.time_end.split(':').map(Number);
              const startMins = startH * 60 + startM;
              const endMins = endH * 60 + endM;
              
              const isPast = isToday && currentMinutes > endMins;
              const isActive = isToday && currentMinutes >= startMins && currentMinutes <= endMins;
              
              const tagColor = TAG_COLORS[schedule.tag] || TAG_COLORS['umum'];
              const tagLabel = TAG_LABELS[schedule.tag] || 'Umum';

              let timeRemaining = '';
              if (isActive) {
                const diff = endMins - currentMinutes;
                timeRemaining = diff >= 60 ? `${Math.floor(diff/60)}j ${diff%60}m lagi` : `${diff} mnt lagi`;
              }

              return (
                <div key={schedule.id} className="relative flex items-start gap-4 animate-slide-up" style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}>
                  {/* Timeline Dot */}
                  <div className="relative z-10 mt-1.5 flex items-center justify-center">
                    {isActive ? (
                      <div className="relative flex h-5 w-5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-5 w-5 bg-red-500 border-4 border-white dark:border-brand-950 shadow-sm"></span>
                      </div>
                    ) : (
                      <div className={`h-4 w-4 rounded-full border-4 border-white dark:border-brand-950 shadow-sm ${isPast ? 'bg-brand-200 dark:bg-brand-700' : 'bg-brand-400 dark:bg-brand-600'}`} />
                    )}
                  </div>

                  {/* Schedule Card */}
                  <div className={`flex-1 rounded-2xl p-4 border transition-all ${
                    isActive 
                      ? 'bg-brand-950 border-brand-950 text-white dark:bg-white dark:border-white dark:text-brand-950 shadow-lg scale-[1.02]' 
                      : isPast
                        ? 'bg-brand-50/50 dark:bg-brand-950/50 border-brand-100 dark:border-brand-800 opacity-60'
                        : 'bg-brand-50 dark:bg-brand-900 border-brand-100 dark:border-brand-800'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex flex-col">
                        <p className={`font-black text-lg leading-tight ${isActive ? '' : 'text-brand-900 dark:text-white'}`}>
                          {schedule.title}
                        </p>
                        <p className={`text-xs font-bold mt-1 ${isActive ? 'opacity-90' : 'text-brand-500'}`}>
                          {schedule.time_start} - {schedule.time_end}
                        </p>
                      </div>
                      
                      <button 
                        onClick={() => deleteSchedule(schedule.id).then(fetchData)}
                        className={`p-1.5 rounded-lg transition-colors ${isActive ? 'text-white/50 hover:bg-white/10 dark:text-black/50 dark:hover:bg-black/10' : 'text-brand-300 hover:text-red-500'}`}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md border uppercase tracking-wider ${isActive ? 'bg-white/20 border-white/20 text-white dark:bg-black/10 dark:border-black/10 dark:text-black' : tagColor}`}>
                        {tagLabel}
                      </span>
                      
                      {isActive && (
                        <span className="text-[10px] font-black uppercase tracking-wider text-red-300 dark:text-red-500 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                          Selesai {timeRemaining}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button 
        onClick={() => setShowModal(true)} 
        className="fixed bottom-24 right-5 md:bottom-10 md:right-10 w-16 h-16 bg-brand-200 dark:bg-brand-800 text-brand-900 dark:text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform z-[150] border-2 border-brand-100 dark:border-brand-900"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>

      {/* Add Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Tambah Jadwal">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-brand-600 dark:text-brand-400 tracking-wider">NAMA KEGIATAN</label>
            <input
              type="text"
              className="input-field"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Contoh: Meeting Proyek"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-brand-600 dark:text-brand-400 tracking-wider">WAKTU MULAI</label>
              <input
                type="time"
                className="input-field"
                value={form.time_start}
                onChange={(e) => setForm({ ...form, time_start: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-brand-600 dark:text-brand-400 tracking-wider">WAKTU SELESAI</label>
              <input
                type="time"
                className="input-field"
                value={form.time_end}
                onChange={(e) => setForm({ ...form, time_end: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-brand-600 dark:text-brand-400 tracking-wider">KATEGORI</label>
            <select 
              className="input-field appearance-none cursor-pointer"
              value={form.tag}
              onChange={(e) => setForm({ ...form, tag: e.target.value })}
            >
              {Object.entries(TAG_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn-primary mt-4" disabled={!form.title || !form.time_start || !form.time_end || saving}>
            {saving ? 'Menyimpan...' : 'Simpan Jadwal'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
