import { useState, useEffect } from 'react';
import Modal from './Modal';
import Header from './Header';
import { getTasks, addTask, deleteTask, toggleTask, updateTask } from '../utils/storage';

export default function Task({ onBack }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [newPhotos, setNewPhotos] = useState([]); // array of base64 strings
  const [saving, setSaving] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const fetchedTasks = await getTasks();
    setTasks(fetchedTasks);
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
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + newPhotos.length > 10) {
      alert("Maksimal 10 foto!");
      return;
    }
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setNewPhotos(prev => [...prev, ev.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setNewPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const openAddModal = () => {
    setEditingTaskId(null);
    setNewTitle('');
    setNewDescription('');
    setNewDeadline('');
    setNewPhotos([]);
    setShowModal(true);
  };

  const openEditModal = (task) => {
    setEditingTaskId(task.id);
    setNewTitle(task.title);
    setNewDescription(task.description || '');
    
    // Format deadline to local datetime-local string (YYYY-MM-DDThh:mm)
    if (task.deadline) {
      const d = new Date(task.deadline);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      setNewDeadline(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
    } else {
      setNewDeadline('');
    }
    
    setNewPhotos(task.photos || []);
    setShowModal(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || saving) return;
    setSaving(true);
    
    let result;
    if (editingTaskId) {
      result = await updateTask(editingTaskId, {
        title: newTitle.trim(),
        description: newDescription.trim(),
        deadline: newDeadline ? newDeadline : null,
        photos: newPhotos
      });
    } else {
      result = await addTask(newTitle.trim(), newDescription.trim(), newDeadline, newPhotos);
    }
    
    if (result) {
      setNewTitle('');
      setNewDescription('');
      setNewDeadline('');
      setNewPhotos([]);
      setShowModal(false);
      setEditingTaskId(null);
      await fetchData();
    }
    
    setSaving(false);
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Yakin ingin menghapus tugas ini?")) return;
    await deleteTask(id);
    await fetchData();
  };

  const handleToggle = async (task) => {
    await toggleTask(task.id, !task.completed);
    await fetchData();
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-6 px-5 pt-6 pb-24 md:pb-8 animate-fade-in relative min-h-full">
      <Header title="Tugas" onBack={onBack} />

      {/* Daily Progress Bar */}
      <div className="card !p-4">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h3 className="font-extrabold text-sm uppercase tracking-widest text-brand-400">Target Hari Ini</h3>
            <p className="font-black text-2xl">{completedCount} <span className="text-lg text-brand-500 font-bold">/ {tasks.length}</span></p>
          </div>
          <p className="font-black text-xl text-brand-950 dark:text-white">{progressPercent}%</p>
        </div>
        <div className="h-4 w-full bg-brand-100 dark:bg-brand-900 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-brand-950 dark:bg-white rounded-full transition-all duration-1000 ease-out" 
            style={{ width: `${progressPercent}%` }} 
          />
        </div>
        {progressPercent === 100 && tasks.length > 0 && (
          <p className="text-center font-bold text-xs mt-3 text-brand-600 dark:text-brand-300 bg-brand-50 dark:bg-brand-900 p-2 rounded-lg">Luar biasa! Semua tugas telah selesai.</p>
        )}
      </div>

      {/* Task List */}
      {loading && tasks.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <div className="relative flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-3 border-brand-200 dark:border-brand-800" />
            <div className="w-8 h-8 rounded-full border-3 border-brand-950 dark:border-white border-t-transparent border-r-transparent animate-spin absolute top-0 left-0" />
          </div>
        </div>
      ) : tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <p className="font-extrabold text-lg mb-2">Belum ada tugas</p>
          <p className="text-brand-500 text-sm max-w-[200px] font-medium">Tekan tombol + di bawah untuk mulai menambahkan.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 pb-6">
          {tasks.map((task, index) => {
            const isCompleted = task.completed;
            const isOverdue = task.deadline && new Date(task.deadline) < new Date() && !isCompleted;
            
            return (
              <div
                key={task.id}
                className={`flex flex-col gap-3 p-5 bg-brand-50 dark:bg-brand-900 rounded-2xl border transition-all animate-slide-up ${
                  isCompleted ? 'border-brand-300 dark:border-brand-600 shadow-sm opacity-70' : isOverdue ? 'border-red-400 dark:border-red-600' : 'border-transparent'
                }`}
                style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'both' }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-col gap-1 flex-1">
                    <div className="flex items-center gap-3">
                      <p className={`font-black text-lg transition-all ${isCompleted ? 'line-through text-brand-400 dark:text-brand-500' : 'text-brand-900 dark:text-brand-50'}`}>
                        {task.title}
                      </p>
                      <button onClick={() => openEditModal(task)} className="text-brand-400 hover:text-brand-900 dark:hover:text-white transition-colors" title="Edit Tugas">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                    </div>
                    
                    {task.deadline && (
                      <p className={`text-xs font-bold ${isOverdue ? 'text-red-500' : 'text-brand-500'}`}>
                        Tenggat: {new Date(task.deadline).toLocaleString('id-ID')}
                      </p>
                    )}
                    
                    {task.description && (
                      <p className="text-sm text-brand-700 dark:text-brand-300 mt-1 whitespace-pre-wrap">
                        {task.description}
                      </p>
                    )}

                    {task.photos && task.photos.length > 0 && (
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {task.photos.map((photo, i) => (
                          <div key={i} className="w-16 h-16 rounded-lg overflow-hidden border border-brand-200">
                            <img src={photo} alt={`Task attachment ${i}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3 shrink-0">
                    <button
                      onClick={() => handleToggle(task)}
                      className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
                        isCompleted 
                          ? 'bg-brand-950 border-brand-950 text-white dark:bg-white dark:border-white dark:text-black scale-110' 
                          : 'border-brand-300 dark:border-brand-700 hover:border-brand-500 bg-white dark:bg-brand-950'
                      }`}
                    >
                      {isCompleted && <svg className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="text-brand-300 hover:text-red-500 transition-colors"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      <button 
        onClick={openAddModal}
        className="fixed bottom-24 right-5 md:bottom-10 md:right-10 w-16 h-16 bg-brand-200 dark:bg-brand-800 text-brand-900 dark:text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform z-[150] border-2 border-brand-100 dark:border-brand-900"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>

      {/* Add/Edit Task Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingTaskId ? "Edit Tugas" : "Tambah Tugas"}>
        <form onSubmit={handleSaveTask} className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto px-1">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-brand-600 dark:text-brand-400 tracking-wider">NAMA TUGAS *</label>
            <input
              type="text"
              className="input-field"
              placeholder="Contoh: Beli bahan masakan"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-brand-600 dark:text-brand-400 tracking-wider">DESKRIPSI TUGAS</label>
            <textarea
              className="input-field min-h-[80px]"
              placeholder="Detail tugas..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-brand-600 dark:text-brand-400 tracking-wider">TENGGAT WAKTU (DEADLINE)</label>
            <input
              type="datetime-local"
              className="input-field"
              value={newDeadline}
              onChange={(e) => setNewDeadline(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-brand-600 dark:text-brand-400 tracking-wider flex justify-between">
              <span>FOTO (MAKS 10)</span>
              <span>{newPhotos.length}/10</span>
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-100 file:text-brand-700 hover:file:bg-brand-200 dark:file:bg-brand-800 dark:file:text-brand-300"
              onChange={handleFileChange}
              disabled={newPhotos.length >= 10}
            />
            
            {newPhotos.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-2">
                {newPhotos.map((photo, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-brand-200">
                    <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => removePhoto(i)}
                      className="absolute top-0 right-0 bg-red-500 text-white w-5 h-5 flex items-center justify-center rounded-bl-lg text-xs font-bold"
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary mt-4" disabled={!newTitle.trim() || saving}>
            {saving ? 'Menyimpan...' : (editingTaskId ? 'Perbarui Tugas' : 'Simpan Tugas')}
          </button>
        </form>
      </Modal>
    </div>
  );
}
