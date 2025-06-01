import React, { useState, useEffect } from 'react';
import '../styles/CustomToast.css';

/**
 * Custom Toast Context for handling notifications without external dependencies.
 * This is a fallback solution when react-hot-toast isn't available.
 */
const CustomToastContext = React.createContext(null);

export const useCustomToast = () => {
  const context = React.useContext(CustomToastContext);
  if (!context) {
    throw new Error('useCustomToast must be used within a CustomToastProvider');
  }
  return context;
};

export const CustomToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'default', duration = 3000) => {
    const id = Date.now().toString();
    const newToast = { id, message, type, duration };
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const success = (message, duration) => {
    return addToast(message, 'success', duration);
  };

  const error = (message, duration) => {
    return addToast(message, 'error', duration);
  };

  const info = (message, duration) => {
    return addToast(message, 'info', duration);
  };

  const loading = (message) => {
    return addToast(message, 'loading', 10000);
  };

  // Function to update an existing toast (e.g., change loading to success)
  const updateToast = (id, { message, type }) => {
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, message, type } : toast
    ));
  };

  // Value to be provided by the context
  const value = {
    success,
    error,
    info,
    loading,
    updateToast,
    removeToast
  };

  return (
    <CustomToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </CustomToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-xs">
      {toasts.map(toast => (
        <Toast 
          key={toast.id} 
          toast={toast}
          onClose={() => removeToast(toast.id)} 
        />
      ))}
    </div>
  );
};

const Toast = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast.type !== 'loading') {
      const timer = setTimeout(() => {
        onClose();
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  const getIconByType = (type) => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M5 13l4 4L19 7"></path>
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        );
      case 'loading':
        return (
          <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        );
      case 'info':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        );
      default:
        return null;
    }
  };

  const getBackgroundColor = (type) => {
    switch (type) {
      case 'success': return 'bg-green-50 dark:bg-green-800/20';
      case 'error': return 'bg-red-50 dark:bg-red-800/20';
      case 'loading': return 'bg-blue-50 dark:bg-blue-800/20';
      case 'info': return 'bg-blue-50 dark:bg-blue-800/20';
      default: return 'bg-gray-50 dark:bg-gray-800/20';
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'success': return 'border-green-500';
      case 'error': return 'border-red-500';
      case 'loading': return 'border-blue-500';
      case 'info': return 'border-blue-500';
      default: return 'border-gray-500';
    }
  };

  return (
    <div 
      className={`flex items-center p-3 bg-white dark:bg-gray-800 border-l-4 rounded shadow-md animate-fade-in ${getBackgroundColor(toast.type)} ${getBorderColor(toast.type)}`}
      role="alert"
    >
      <div className="flex items-center justify-center mr-3">
        {getIconByType(toast.type)}
      </div>
      <div className="text-sm font-medium text-gray-800 dark:text-white">
        {toast.message}
      </div>
      {toast.type !== 'loading' && (
        <button 
          onClick={onClose}
          className="ml-auto -mx-1.5 -my-1.5 p-1.5 text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 inline-flex h-8 w-8"
        >
          <span className="sr-only">Close</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </button>
      )}
    </div>
  );
};

// Helper component that can be imported directly
export const CustomToast = () => null; // Just a placeholder

// Mock for react-hot-toast API for compatibility
const mockToast = {
  success: (message) => console.log('Toast success:', message),
  error: (message) => console.log('Toast error:', message),
  loading: (message) => console.log('Toast loading:', message),
  custom: () => {},
};

export default mockToast;
