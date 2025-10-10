import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  required?: boolean;
  helpText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  required = false,
  helpText,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <div className="mb-4.5">
      {label && (
        <label className="mb-2 block text-sm font-semibold text-dark dark:text-white">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        className={`w-full rounded-lg bg-transparent px-5 py-3 text-dark outline-none transition border focus:border-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary ${
          disabled
            ? 'border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400'
            : error 
            ? 'border-red-500 focus:border-red-500'
            : 'border-gray-300 dark:border-gray-600'
        } ${className}`}
        disabled={disabled}
        {...props}
      />
      {helpText && !error && (
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          {helpText}
        </p>
      )}
      {error && (
        <p className="mt-1.5 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  required?: boolean;
  helpText?: string;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  required = false,
  helpText,
  className = '',
  disabled,
  rows = 4,
  ...props
}) => {
  return (
    <div className="mb-4.5">
      {label && (
        <label className="mb-2 block text-sm font-semibold text-dark dark:text-white">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        className={`w-full rounded-lg bg-transparent px-5 py-3 text-dark outline-none transition border focus:border-blue-500 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary resize-none ${
          disabled
            ? 'border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400'
            : error 
            ? 'border-red-500 focus:border-red-500'
            : 'border-gray-300 dark:border-gray-600'
        } ${className}`}
        disabled={disabled}
        {...props}
      />
      {helpText && !error && (
        <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
          {helpText}
        </p>
      )}
      {error && (
        <p className="mt-1.5 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
};