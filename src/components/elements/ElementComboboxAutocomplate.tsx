"use client";
import React, { useState, useEffect, useRef, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Option {
  id?: number | string;
  name: string | number;
}

interface ElementComboboxAutocompleteProps {
  label: string;
  placeholder: string;
  options: Option[];
  onChange: (value: string | number) => void;
  resetKey?: number;
  disabled?: boolean;
}

const ElementComboboxAutocomplete: React.FC<ElementComboboxAutocompleteProps> = ({
  label,
  placeholder,
  options,
  onChange,
  resetKey = 0,
  disabled = false,
}) => {
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredOptions, setFilteredOptions] = useState<Option[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset state when resetKey changes
  useEffect(() => {
    setSelectedOption(null);
    setSearchTerm("");
    setFilteredOptions([]);
    setIsDropdownOpen(false);
    setIsFocused(false);
    setHighlightedIndex(-1);
  }, [resetKey]);

  // Filter options based on search term
  useEffect(() => {
    if (disabled) {
      setFilteredOptions([]);
      setIsDropdownOpen(false);
      return;
    }

    if (searchTerm.length >= 3) {
      const filtered = options.filter((option) =>
        String(option.name).toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
      
      if (isFocused) {
        setIsDropdownOpen(true);
      }
    } else {
      setFilteredOptions([]);
      setIsDropdownOpen(false);
    }
  }, [searchTerm, options, isFocused, disabled]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isDropdownOpen || filteredOptions.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setHighlightedIndex((prev) => 
            prev < filteredOptions.length - 1 ? prev + 1 : prev
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        case "Enter":
          e.preventDefault();
          if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
            handleSelectOption(filteredOptions[highlightedIndex]);
          }
          break;
        case "Escape":
          setIsDropdownOpen(false);
          setIsFocused(false);
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDropdownOpen, filteredOptions, highlightedIndex]);

  const handleSelectOption = (option: Option) => {
    if (disabled) return;
    
    setSelectedOption(option);
    setSearchTerm(String(option.name));
    setIsDropdownOpen(false);
    setIsFocused(false);
    onChange(option.id !== undefined ? option.id : option.name);
    
    if (inputRef.current) {
      inputRef.current.blur();
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const value = e.target.value;
    setSearchTerm(value);
    setHighlightedIndex(-1);
    
    if (value === "") {
      setSelectedOption(null);
      onChange("");
    }
  };

  const handleFocus = () => {
    if (disabled) return;
    
    setIsFocused(true);
    if (searchTerm.length >= 3) {
      const filtered = options.filter((option) =>
        String(option.name).toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
      setIsDropdownOpen(true);
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsFocused(false);
      setIsDropdownOpen(false);
    }, 200);
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
    <div className="relative text-[18px]" ref={containerRef}>
      {label && (
        <motion.label 
          className="mb-2 block text-[18px] font-semibold text-dark dark:text-white"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {label}
        </motion.label>
      )}
      
      <div className="relative">
        {/* Input Field with 3D Effects */}
        <motion.div
          className="relative"
          whileHover={!disabled ? { scale: 1.01 } : {}}
          whileTap={!disabled ? { scale: 0.99 } : {}}
        >
          {/* Animated Border Glow */}
          {isFocused && !disabled && (
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
                filter: 'blur(12px)',
                zIndex: -1,
              }}
            />
          )}

          <input
            ref={inputRef}
            type="text"
            className={`w-full rounded-xl bg-transparent px-5 py-3.5 pr-12 text-dark outline-none transition-all duration-300 border-2 ${
              disabled
                ? 'border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400'
                : isFocused
                ? 'border-blue-500 dark:border-blue-400 bg-white dark:bg-dark-2 text-dark dark:text-white shadow-lg shadow-blue-500/20'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-2 text-dark dark:text-white hover:border-blue-400 dark:hover:border-blue-500'
            }`}
            style={{
              boxShadow: isFocused && !disabled 
                ? '0 10px 40px -10px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)' 
                : 'none'
            }}
            placeholder={placeholder}
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            readOnly={disabled}
          />

          {/* Animated Search Icon */}
          <motion.span 
            className={`absolute right-4 top-5 pointer-events-none flex items-center justify-center ${
              disabled ? 'opacity-50' : ''
            }`}
            animate={isFocused && searchTerm.length > 0 ? {
              scale: [1, 1.2, 1],
              rotate: [0, 360],
            } : {}}
            transition={{
              duration: 0.6,
              ease: "easeInOut",
            }}
          >
            <svg
              className={`h-5 w-5 transition-colors duration-300 ${
                disabled ? 'text-gray-400' :
                isFocused ? 'text-blue-600 dark:text-blue-400' :
                'text-gray-500 dark:text-gray-400'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </motion.span>

          {/* Floating Particles Effect */}
          {isFocused && !disabled && (
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
        </motion.div>

        {/* Character Counter Hint */}
        {!disabled && isFocused && searchTerm.length > 0 && searchTerm.length < 3 && (
          <motion.div 
            className="absolute left-0 -bottom-6 text-xs font-medium"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
          >
            <span className="text-blue-600 dark:text-blue-400">
              Ketik {3 - searchTerm.length} karakter lagi untuk mencari
            </span>
          </motion.div>
        )}

        {/* Dropdown Results */}
        <AnimatePresence>
          {!disabled && isDropdownOpen && isFocused && (
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
              {/* Animated Top Glow Bar */}
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

              {/* Results List */}
              <div className="max-h-60 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-transparent">
                {filteredOptions.length > 0 ? (
                  <div>
                    {filteredOptions.map((option, index) => {
                      const isHighlighted = index === highlightedIndex;
                      const isSelected = selectedOption?.name === option.name;

                      return (
                        <motion.div
                          key={index}
                          custom={index}
                          variants={itemVariants}
                          initial="hidden"
                          animate="visible"
                          className={`px-4 py-3 text-sm cursor-pointer transition-all duration-200 relative group ${
                            isHighlighted || isSelected
                              ? "bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-700 dark:text-blue-300 font-semibold"
                              : "text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800/50 dark:hover:to-gray-700/50"
                          }`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            handleSelectOption(option);
                          }}
                          onMouseEnter={() => setHighlightedIndex(index)}
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {/* Selection Indicator Bar */}
                          {(isHighlighted || isSelected) && (
                            <motion.div
                              className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-purple-500"
                              layoutId={isSelected ? "selected" : `highlight-${index}`}
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

                          {/* Option Content */}
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

                          {/* Shimmer Effect */}
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
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <motion.div 
                    className="py-8 px-4 text-center"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 mb-3">
                      <svg
                        className="h-6 w-6 text-gray-400 dark:text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                      Tidak ada hasil yang cocok
                    </p>
                  </motion.div>
                )}
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

export default ElementComboboxAutocomplete;