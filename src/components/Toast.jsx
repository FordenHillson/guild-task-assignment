import React from 'react';
import { Toaster } from 'react-hot-toast';

const Toast = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Default options for all toasts
        className: '',
        duration: 3000,
        style: {
          background: '#333',
          color: '#fff',
          fontSize: '14px',
        },
        // Custom success style
        success: {
          style: {
            background: '#10b981', // green-500
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#10b981',
          },
        },
        // Custom error style
        error: {
          style: {
            background: '#ef4444', // red-500
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#ef4444',
          },
        },
        // Custom loading style
        loading: {
          style: {
            background: '#3b82f6', // blue-500
          },
        },
      }}
    />
  );
};

export default Toast;
