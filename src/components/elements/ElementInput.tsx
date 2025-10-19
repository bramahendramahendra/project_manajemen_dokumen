import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
  type = 'text',
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(!!props.value || !!props.defaultValue);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHasValue(e.target.value.length > 0);
    if (props.onChange) {
      props.onChange(e);
    }
  };

  return (
    <div className="mb-4.5">
      {label && (
        <motion.label 
          className="mb-2 block text-[20px] font-semibold text-dark dark:text-white"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {label}
          {required && (
            <motion.span 
              className="text-red-500 ml-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 500,
                damping: 15,
                delay: 0.1
              }}
            >
              *
            </motion.span>
          )}
        </motion.label>
      )}
      
      <motion.div 
        className="relative"
        whileHover={!disabled ? { scale: 1.01 } : {}}
        whileTap={!disabled ? { scale: 0.99 } : {}}
      >
        {/* Animated Border Glow */}
        {isFocused && !disabled && !error && (
          <motion.div
            className="absolute inset-0 rounded-lg"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5), rgba(59, 130, 246, 0.5))',
              backgroundSize: '200% 200%',
              filter: 'blur(12px)',
              zIndex: -1,
            }}
          />
        )}

        {/* Error Glow */}
        {error && !disabled && (
          <motion.div
            className="absolute inset-0 rounded-lg"
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              background: 'rgba(239, 68, 68, 0.4)',
              filter: 'blur(10px)',
              zIndex: -1,
            }}
          />
        )}

        <input
          className={`w-full text-[18px] rounded-lg bg-transparent px-5 py-3 text-dark outline-none transition-all duration-300 border-2 ${
            disabled
              ? 'border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400'
              : error 
              ? 'border-red-500 focus:border-red-500 bg-white dark:bg-dark-2 dark:text-white shadow-lg shadow-red-500/20'
              : isFocused
              ? 'border-blue-500 dark:border-blue-400 bg-white dark:bg-dark-2 dark:text-white shadow-lg shadow-blue-500/20'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-2 dark:text-white hover:border-blue-400 dark:hover:border-blue-500'
          } ${className}`}
          style={{
            boxShadow: isFocused && !disabled && !error
              ? '0 10px 40px -10px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
              : error
              ? '0 10px 40px -10px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              : 'none'
          }}
          disabled={disabled}
          type={type}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleChange}
          {...props}
        />

        {/* Floating Particles */}
        {isFocused && !disabled && !error && (
          <>
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-1 w-1 rounded-full bg-blue-400 pointer-events-none"
                style={{
                  left: `${20 + i * 30}%`,
                  top: '50%',
                }}
                animate={{
                  y: [0, -15, 0],
                  opacity: [0, 0.8, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}

        {/* Character Counter for maxLength */}
        {props.maxLength && hasValue && isFocused && !disabled && (
          <motion.div
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <span className={`${
              (props.value?.toString().length || 0) > props.maxLength * 0.9
                ? 'text-orange-500 dark:text-orange-400'
                : 'text-gray-400 dark:text-gray-500'
            }`}>
              {props.value?.toString().length || 0}/{props.maxLength}
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Help Text */}
      <AnimatePresence mode="wait">
        {helpText && !error && (
          <motion.p 
            className="mt-1.5 text-xs text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {helpText}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Error Message with Animation */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
            className="mt-1.5 flex items-center gap-1.5"
          >
            <motion.svg
              className="h-4 w-4 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 15,
              }}
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </motion.svg>
            <motion.span 
              className="text-xs text-red-500"
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {error}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
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
  const [isFocused, setIsFocused] = useState(false);
  const [charCount, setCharCount] = useState(props.value?.toString().length || 0);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharCount(e.target.value.length);
    if (props.onChange) {
      props.onChange(e);
    }
  };

  return (
    <div className="mb-4.5">
      {label && (
        <motion.label 
          className="mb-2 block text-[20px] font-semibold text-dark dark:text-white"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {label}
          {required && (
            <motion.span 
              className="text-red-500 ml-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                type: "spring",
                stiffness: 500,
                damping: 15,
                delay: 0.1
              }}
            >
              *
            </motion.span>
          )}
        </motion.label>
      )}
      
      <motion.div 
        className="relative"
        whileHover={!disabled ? { scale: 1.005 } : {}}
        whileTap={!disabled ? { scale: 0.995 } : {}}
      >
        {/* Animated Border Glow */}
        {isFocused && !disabled && !error && (
          <motion.div
            className="absolute inset-0 rounded-lg"
            animate={{
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.5), rgba(147, 51, 234, 0.5), rgba(59, 130, 246, 0.5))',
              backgroundSize: '200% 200%',
              filter: 'blur(12px)',
              zIndex: -1,
            }}
          />
        )}

        {/* Error Glow */}
        {error && !disabled && (
          <motion.div
            className="absolute inset-0 rounded-lg"
            animate={{
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              background: 'rgba(239, 68, 68, 0.4)',
              filter: 'blur(10px)',
              zIndex: -1,
            }}
          />
        )}

        <textarea
          rows={rows}
          className={`w-full text-[18px] rounded-lg bg-transparent px-5 py-3 text-dark outline-none transition-all duration-300 border-2 resize-none ${
            disabled
              ? 'border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400'
              : error 
              ? 'border-red-500 focus:border-red-500 bg-white dark:bg-dark-2 dark:text-white shadow-lg shadow-red-500/20'
              : isFocused
              ? 'border-blue-500 dark:border-blue-400 bg-white dark:bg-dark-2 dark:text-white shadow-lg shadow-blue-500/20'
              : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-2 dark:text-white hover:border-blue-400 dark:hover:border-blue-500'
          } ${className}`}
          style={{
            boxShadow: isFocused && !disabled && !error
              ? '0 10px 40px -10px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
              : error
              ? '0 10px 40px -10px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              : 'none'
          }}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleChange}
          {...props}
        />

        {/* Floating Particles */}
        {isFocused && !disabled && !error && (
          <>
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-1 w-1 rounded-full bg-blue-400 pointer-events-none"
                style={{
                  left: `${15 + i * 25}%`,
                  top: '20%',
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0, 0.8, 0],
                  scale: [0, 1.5, 0],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeOut",
                }}
              />
            ))}
          </>
        )}

        {/* Character Counter */}
        {props.maxLength && isFocused && !disabled && (
          <motion.div
            className="absolute right-3 bottom-3 text-xs font-medium pointer-events-none"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <span className={`px-2 py-1 rounded-md ${
              charCount > props.maxLength * 0.9
                ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}>
              {charCount}/{props.maxLength}
            </span>
          </motion.div>
        )}
      </motion.div>

      {/* Help Text */}
      <AnimatePresence mode="wait">
        {helpText && !error && (
          <motion.p 
            className="mt-1.5 text-[17px] text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {helpText}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Error Message with Animation */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
            className="mt-1.5 flex items-center gap-1.5"
          >
            <motion.svg
              className="h-4 w-4 text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              initial={{ rotate: -180, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 15,
              }}
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </motion.svg>
            <motion.span 
              className="text-[17px] text-red-500"
              initial={{ opacity: 0, x: -5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              {error}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};