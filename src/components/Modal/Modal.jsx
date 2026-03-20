import React from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, message, type = 'success' }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">
          {type === 'success' ? (
            <i className="fa-solid fa-circle-check text-success"></i>
          ) : (
            <i className="fa-solid fa-circle-xmark text-error"></i>
          )}
        </div>
        <h3>{title}</h3>
        <p>{message}</p>
        <button className="btn-modal-close" onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
};

export default Modal;
