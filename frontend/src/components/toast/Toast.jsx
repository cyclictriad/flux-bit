import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

const Toast = ({ id, type = 'info', message, duration = 5000, onClose }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  const getToastStyles = () => {
    const baseClasses = 'flex items-center justify-between p-4 rounded-lg shadow-lg max-w-md w-full transform transition-all duration-300 ease-in-out';
    
    switch (type) {
      case 'success':
        return `${baseClasses} bg-green-600 text-white`;
      case 'error':
        return `${baseClasses} bg-red-600 text-white`;
      case 'warning':
        return `${baseClasses} bg-yellow-500 text-white`;
      case 'info':
      default:
        return `${baseClasses} bg-blue-600 text-white`;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-white text-xl flex-shrink-0" />;
      case 'error':
        return <FaExclamationCircle className="text-white text-xl flex-shrink-0" />;
      case 'warning':
        return <FaExclamationCircle className="text-white text-xl flex-shrink-0" />;
      case 'info':
      default:
        return <FaInfoCircle className="text-white text-xl flex-shrink-0" />;
    }
  };

  return (
    <div 
      className={getToastStyles()}
      style={{
        animation: 'slideIn 0.3s ease-out forwards',
      }}
    >
      <div className="flex items-center gap-3">
        {getIcon()}
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={() => onClose(id)}
        className="ml-4 p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
        aria-label="Close"
      >
        <FaTimes className="text-white text-sm" />
      </button>
    </div>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          type={toast.type}
          message={toast.message}
          duration={toast.duration}
          onClose={removeToast}
        />
      ))}
    </div>
  );
};

export default ToastContainer;