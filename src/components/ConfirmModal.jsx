// src/components/ConfirmModal.jsx
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import '../assets/css/ConfirmModal.css';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Are you sure?", 
  message = "This action cannot be undone.", 
  confirmText = "Confirm", 
  cancelText = "Cancel",
  type = "danger" 
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>
        
        <div className={`modal-icon-wrapper ${type}`}>
          <AlertTriangle size={24} />
        </div>

        <div className="modal-body">
          <h3>{title}</h3>
          <p>{message}</p>
        </div>

        <div className="modal-actions">
          <button className="modal-btn btn-cancel" onClick={onClose}>
            {cancelText}
          </button>
          <button className={`modal-btn btn-confirm ${type}`} onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
