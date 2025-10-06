"use client";
import React, { useState, useEffect, useRef, ChangeEvent } from "react";

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
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset state when resetKey changes
  useEffect(() => {
    setSelectedOption(null);
    setSearchTerm("");
    setFilteredOptions([]);
    setIsDropdownOpen(false);
    setIsFocused(false);
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
    }, 150);
  };

  return (
    <div className="relative" ref={containerRef}>
      {label && (
        <label className="mb-2 block text-sm font-semibold text-dark dark:text-white">
          {label}
        </label>
      )}
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className={`w-full rounded-lg bg-transparent px-5 py-3 pr-10 text-dark outline-none transition border focus:border-blue-500 dark:bg-dark-2 dark:text-white dark:focus:border-primary ${
            disabled
              ? 'border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400'
              : 'border-gray-300 dark:border-gray-600'
          }`}
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          readOnly={disabled}
        />

        {/* Search Icon */}
        <span className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${
          disabled ? 'opacity-50' : ''
        }`}>
          <svg
            className={`h-5 w-5 ${disabled ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}
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
        </span>

        {/* Minimum character indicator */}
        {!disabled && isFocused && searchTerm.length > 0 && searchTerm.length < 3 && (
          <div className="absolute left-0 -bottom-6 text-xs text-blue-600 dark:text-blue-400">
            Ketik minimal 3 karakter untuk mencari
          </div>
        )}

        {/* Dropdown */}
        {!disabled && isDropdownOpen && isFocused && (
          <div 
            className="absolute z-50 mt-2 w-full origin-top rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-dark-2 max-h-60 overflow-y-auto"
          >
            {filteredOptions.length > 0 ? (
              <div className="py-1">
                {filteredOptions.map((option, index) => (
                  <div
                    key={index}
                    className={`px-4 py-3 text-sm cursor-pointer transition-colors ${
                      selectedOption?.name === option.name
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                    }`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectOption(option);
                    }}
                  >
                    {option.name}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                Tidak ada hasil yang cocok
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ElementComboboxAutocomplete;