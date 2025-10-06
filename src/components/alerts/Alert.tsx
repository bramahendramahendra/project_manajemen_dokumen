// src/components/alerts/Alert.tsx
import React from 'react';

interface AlertProps {
  type: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

const alertStyles = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-200 dark:border-blue-800',
    text: 'text-blue-800 dark:text-blue-200',
    icon: 'text-blue-600',
  },
  warning: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    text: 'text-yellow-800 dark:text-yellow-200',
    icon: 'text-yellow-600',
  },
  error: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-200 dark:border-red-800',
    text: 'text-red-800 dark:text-red-200',
    icon: 'text-red-600',
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    border: 'border-green-200 dark:border-green-800',
    text: 'text-green-800 dark:text-green-200',
    icon: 'text-green-600',
  },
};

const AlertIcon = ({ type }: { type: AlertProps['type'] }) => {
  const icons = {
    info: (
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
    ),
    warning: (
      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
    ),
    error: (
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    ),
    success: (
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    ),
  };

  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
      {icons[type]}
    </svg>
  );
};

export const Alert: React.FC<AlertProps> = ({
  type,
  title,
  message,
  onRetry,
  className = '',
}) => {
  const styles = alertStyles[type];

  return (
    <div className={`mb-4 p-4 ${styles.bg} border ${styles.border} rounded-lg ${className}`}>
      <div className="flex items-start">
        <div className={`${styles.icon} mt-0.5`}>
          <AlertIcon type={type} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <p className={`text-sm font-semibold ${styles.text} mb-1`}>
              {title}
            </p>
          )}
          <p className={`text-sm ${styles.text}`}>
            {message}
          </p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className={`ml-3 text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
              type === 'warning' 
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            Coba Lagi
          </button>
        )}
      </div>
    </div>
  );
};

// Loading Alert Component
interface LoadingAlertProps {
  message?: string;
}

export const LoadingAlert: React.FC<LoadingAlertProps> = ({ 
  message = 'Memuat data...' 
}) => (
  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
    <div className="flex items-center">
      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
      <p className="ml-3 text-sm font-medium text-blue-800 dark:text-blue-200">
        {message}
      </p>
    </div>
  </div>
);