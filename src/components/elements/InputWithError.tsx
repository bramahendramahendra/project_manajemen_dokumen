// src/components/elements/InputWithError.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface InputWithErrorProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string | null;
  icon?: React.ReactNode;
}

export const InputWithError: React.FC<InputWithErrorProps> = ({
  error,
  icon,
  className = '',
  ...props
}) => {
  return (
    <div className="w-full">
      <div className="relative">
        <input
          className={`block w-full rounded-[7px] border-0 px-[30px] py-[17px] font-inter font-normal text-gray-900 shadow-sm ring-2 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset md:text-[15px] lg:text-[16px] disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ${
            error
              ? 'ring-red-500 focus:ring-red-500 bg-red-50'
              : 'ring-[#1D92F9] focus:ring-indigo-600 bg-white'
          } ${className}`}
          {...props}
        />
        {icon && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {icon}
          </div>
        )}
      </div>
      
      {/* Field Error Message with Animation */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -5, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 flex items-start gap-1.5 text-sm text-red-600 font-medium">
              <svg 
                className="w-4 h-4 flex-shrink-0 mt-0.5" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
                  clipRule="evenodd" 
                />
              </svg>
              <span className="flex-1">{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};