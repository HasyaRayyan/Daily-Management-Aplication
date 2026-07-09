import { useState } from 'react';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content">
        <div className="modal-handle" />
        <h3 className="modal-title">{title}</h3>
        {children}
      </div>
    </div>
  );
}
