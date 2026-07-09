import { useState } from 'react';
import Modal from './Modal';
import { generateId, getCurrentTime } from '../utils/helpers';

export default function TaskList({ tasks, onUpdate }) {
  const [showModal, setShowModal] = useState(false);
  const [taskText, setTaskText] = useState('');

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!taskText.trim()) return;

    const newTask = {
      id: generateId(),
      text: taskText.trim(),
      completed: false,
      time: getCurrentTime(),
      createdAt: Date.now(),
    };

    onUpdate([newTask, ...tasks]);
    setTaskText('');
    setShowModal(false);
  };

  const toggleTask = (id) => {
    onUpdate(tasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const deleteTask = (id) => {
    onUpdate(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="main-content">
      {/* Section Header */}
      <div className="section-header">
        <h2>
          <span className="section-icon">📋</span>
          Tugas Hari Ini
        </h2>
        <button className="btn-add" onClick={() => setShowModal(true)}>
          <span className="plus-icon">+</span>
          Tambah
        </button>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="progress-container">
          <div className="progress-info">
            <span className="progress-label">Progres tugas</span>
            <span className="progress-value">{completedCount}/{totalCount} selesai</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {/* Task List */}
      {totalCount === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📝</div>
          <p className="empty-text">Belum ada tugas</p>
          <p className="empty-subtext">Tambahkan tugas untuk hari ini</p>
        </div>
      ) : (
        <div className="task-list">
          {tasks
            .sort((a, b) => {
              // Uncompleted first, then by creation time
              if (a.completed !== b.completed) return a.completed ? 1 : -1;
              return b.createdAt - a.createdAt;
            })
            .map((task, index) => (
              <div
                key={task.id}
                className={`task-item ${task.completed ? 'completed' : ''}`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <button
                  className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                  onClick={() => toggleTask(task.id)}
                  aria-label={task.completed ? 'Tandai belum selesai' : 'Tandai selesai'}
                >
                  {task.completed && '✓'}
                </button>
                <div className="task-content">
                  <p className="task-text">{task.text}</p>
                  <span className="task-time">⏰ {task.time}</span>
                </div>
                <button
                  className="task-delete"
                  onClick={() => deleteTask(task.id)}
                  aria-label="Hapus tugas"
                >
                  ✕
                </button>
              </div>
            ))}
        </div>
      )}

      {/* Add Task Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setTaskText(''); }}
        title="✏️ Tambah Tugas Baru"
      >
        <form onSubmit={handleAddTask}>
          <div className="form-group">
            <label className="form-label">Apa yang harus dilakukan?</label>
            <textarea
              className="form-input"
              placeholder="Contoh: Meeting jam 10 pagi..."
              value={taskText}
              onChange={(e) => setTaskText(e.target.value)}
              autoFocus
              rows={3}
            />
          </div>
          <button
            type="submit"
            className="btn-primary"
            disabled={!taskText.trim()}
          >
            Tambah Tugas
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => { setShowModal(false); setTaskText(''); }}
          >
            Batal
          </button>
        </form>
      </Modal>
    </div>
  );
}
