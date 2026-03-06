/**
 * WellBee – Toast notification
 * Pure CSS/React — lightweight replacement for Sweetalert2 success/info toasts.
 * Use Swal only for destructive confirm dialogs (logout, end-chat).
 *
 * type: 'success' | 'error' | 'warning' | 'info'
 */
import React, { useEffect, useState } from 'react';
import './Toast.css';
import { IconCheck, IconAlertCircle, IconX } from '../icons/icons';

const ICONS = {
  success: <IconCheck style={{ width: 14, height: 14 }} />,
  error:   <IconAlertCircle style={{ width: 14, height: 14 }} />,
  warning: <IconAlertCircle style={{ width: 14, height: 14 }} />,
  info:    <IconAlertCircle style={{ width: 14, height: 14 }} />,
};

const Toast = ({ message, type = 'info', duration = 3500, onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`wb-toast wb-toast--${type} ${visible ? 'wb-toast--in' : 'wb-toast--out'}`} role="status">
      <span className="wb-toast-icon">{ICONS[type]}</span>
      <span className="wb-toast-msg">{message}</span>
      <button className="wb-toast-close" onClick={() => { setVisible(false); setTimeout(() => onClose?.(), 300); }} aria-label="Dismiss">
        <IconX style={{ width: 12, height: 12 }} />
      </button>
    </div>
  );
};

/**
 * ToastContainer — renders toasts at the top-right of the screen.
 * Usage: maintain a `toasts` array in state, render <ToastContainer toasts={...} onRemove={...} />
 */
export const ToastContainer = ({ toasts = [], onRemove }) => (
  <div className="wb-toast-container" aria-live="polite">
    {toasts.map((t) => (
      <Toast key={t.id} {...t} onClose={() => onRemove(t.id)} />
    ))}
  </div>
);

export default Toast;
