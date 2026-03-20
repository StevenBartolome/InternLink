import React from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, message, type = 'success', isConfirm = false, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">
          {type === 'success' ? (
            <i className="fa-solid fa-circle-check text-success"></i>
          ) : type === 'error' ? (
            <i className="fa-solid fa-circle-xmark text-error"></i>
          ) : (
            <i className="fa-solid fa-circle-question text-warning"></i>
          )}
        </div>
        <h3>{title}</h3>
        <p>{message}</p>
        
        {isConfirm ? (
          <div className="modal-actions">
            <button className="btn-modal-cancel" onClick={onClose}>
              Cancel
            </button>
            <button className="btn-modal-confirm" onClick={onConfirm}>
              Confirm
            </button>
          </div>
        ) : (
          <button className="btn-modal-close" onClick={onClose}>
            Got it
          </button>
        )}
      </div>
    </div>
  );
};

export default Modal;
