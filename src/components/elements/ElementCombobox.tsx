"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ElementComboboxProps {
  label?: string;
  placeholder: string;
  options: { name: string | number; id?: string | number }[];
  onChange?: (value: string | number) => void;
  resetKey?: number;
  disabled?: boolean;
  defaultValue?: string | number;
}

const ElementCombobox: React.FC<ElementComboboxProps> = ({ 
  label, 
  placeholder, 
  options,
  onChange,
  resetKey,
  disabled = false,
  defaultValue = "",
}) => {
  const [selectedOption, setSelectedOption] = useState<string | number>(defaultValue);
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(!!defaultValue);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);

  useEffect(() => {
    if (resetKey !== undefined) {
      setSelectedOption("");
      setIsOptionSelected(false);
      setIsOpen(false);
    }
  }, [resetKey]);

  useEffect(() => {
    if (defaultValue !== undefined && defaultValue !== "") {
      setSelectedOption(defaultValue);
      setIsOptionSelected(true);
    }
  }, [defaultValue]);

  const handleChange = (option: { name: string | number; id?: string | number }) => {
    if (disabled) return;
    
    const value = option.id ?? option.name;
    const parsedValue = typeof value === 'string' && !isNaN(Number(value)) ? Number(value) : value;

    setSelectedOption(parsedValue);
    setIsOptionSelected(true);
    setIsOpen(false);

    if (onChange) {
      onChange(parsedValue);
    }
  };

  const getSelectedName = () => {
    const option = options.find(opt => (opt.id ?? opt.name) === selectedOption);
    return option ? option.name : "";
  };

  const dropdownVariants = {
    hidden: { 
      opacity: 0,
      scale: 0.95,
      y: -10,
    },
    visible: { 
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25,
      }
    },
    exit: { 
      opacity: 0,
      scale: 0.95,
      y: -10,
      transition: {
        duration: 0.2,
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.03,
        type: "spring",
        stiffness: 300,
        damping: 25,
      }
    })
  };

  return (
    <div className="relative">
      {label && (
        <motion.label 
          className="mb-2 block text-sm font-semibold text-dark dark:text-white"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {label}
        </motion.label>
      )}

      <div className="relative">
        {/* Main Select Button */}
        <motion.button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          disabled={disabled}
          className={`relative w-full appearance-none rounded-xl px-5 py-3.5 outline-none transition-all duration-300 border-2 text-left ${
            disabled
              ? 'border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400'
              : isFocused || isOpen
              ? 'border-blue-500 bg-white dark:border-blue-400 dark:bg-dark-2 shadow-lg shadow-blue-500/20'
              : isOptionSelected 
              ? 'text-dark dark:text-white border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-2 hover:border-blue-400 dark:hover:border-blue-500' 
              : 'text-gray-400 border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-2 hover:border-blue-400 dark:hover:border-blue-500'
          }`}
          style={{
            boxShadow: (isFocused || isOpen) && !disabled 
              ? '0 10px 40px -10px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
              : 'none'
          }}
          whileHover={!disabled ? { scale: 1.01 } : {}}
          whileTap={!disabled ? { scale: 0.99 } : {}}
        >
          {/* Gradient Border Effect */}
          {(isFocused || isOpen) && !disabled && (
            <motion.div
              className="absolute inset-0 rounded-xl"
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
                filter: 'blur(8px)',
                zIndex: -1,
              }}
            />
          )}

          {/* Selected Value or Placeholder */}
          <span className="block pr-8">
            {isOptionSelected ? getSelectedName() : placeholder}
          </span>

          {/* Animated Arrow Icon */}
          <motion.span 
            className={`absolute right-4 top-5 -translate-y-1/2 pointer-events-none ${
              disabled ? 'opacity-50' : ''
            }`}
            animate={{ 
              rotate: isOpen ? 180 : 0,
            }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 20,
            }}
          >
            <svg
              className={`fill-current transition-colors ${
                disabled ? 'text-gray-400' : 
                (isFocused || isOpen) ? 'text-blue-600 dark:text-blue-400' :
                'text-gray-600 dark:text-gray-400'
              }`}
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 12.9L4.7 7.6C4.3 7.2 4.3 6.6 4.7 6.2C5.1 5.8 5.7 5.8 6.1 6.2L10 10.1L13.9 6.2C14.3 5.8 14.9 5.8 15.3 6.2C15.7 6.6 15.7 7.2 15.3 7.6L10 12.9Z"
                fill="currentColor"
              />
            </svg>
          </motion.span>

          {/* Floating Particles Effect */}
          {(isFocused || isOpen) && !disabled && (
            <>
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute h-1 w-1 rounded-full bg-blue-400"
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
        </motion.button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isOpen && !disabled && options.length > 0 && (
            <motion.div
              className="absolute z-50 mt-2 w-full origin-top rounded-xl bg-white dark:bg-dark-2 shadow-2xl ring-1 ring-black/10 dark:ring-white/10 overflow-hidden backdrop-blur-xl"
              style={{
                boxShadow: '0 20px 60px -10px rgba(0, 0, 0, 0.3), 0 10px 20px -5px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              }}
              variants={dropdownVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Glow Effect at Top */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  backgroundSize: '200% 200%',
                }}
              />

              {/* Options List */}
              <div className="max-h-64 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-transparent">
                {options.map((option, index) => {
                  const value = option.id ?? option.name;
                  const isSelected = selectedOption === value;
                  
                  return (
                    <motion.button
                      key={index}
                      type="button"
                      custom={index}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      onClick={() => handleChange(option)}
                      className={`w-full px-4 py-3 text-left text-sm transition-all duration-200 relative group ${
                        isSelected
                          ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-700 dark:text-blue-300 font-semibold"
                          : "text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800/50 dark:hover:to-gray-700/50"
                      }`}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Selection Indicator */}
                      {isSelected && (
                        <motion.div
                          className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500"
                          layoutId="activeIndicator"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}

                      {/* Hover Glow Effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-400/10 to-blue-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          backgroundSize: '200% 100%',
                        }}
                        animate={{
                          backgroundPosition: ['0% 0%', '200% 0%'],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />

                      {/* Option Text */}
                      <span className="relative z-10 flex items-center gap-2">
                        {isSelected && (
                          <motion.svg
                            className="h-4 w-4 text-blue-600 dark:text-blue-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 20,
                            }}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M5 13l4 4L19 7"
                            />
                          </motion.svg>
                        )}
                        {option.name}
                      </span>

                      {/* Shimmer Effect on Hover */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100"
                        style={{
                          backgroundSize: '200% 100%',
                        }}
                        animate={{
                          backgroundPosition: ['-200% 0%', '200% 0%'],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #2563eb, #7c3aed);
        }
      `}</style>
    </div>
  );
};

export default ElementCombobox;