"use client";
import React, { useState, useEffect } from "react";

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

  useEffect(() => {
    if (resetKey !== undefined) {
      setSelectedOption("");
      setIsOptionSelected(false);
    }
  }, [resetKey]);

  useEffect(() => {
    if (defaultValue !== undefined && defaultValue !== "") {
      setSelectedOption(defaultValue);
      setIsOptionSelected(true);
    }
  }, [defaultValue]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (disabled) return;
    
    const rawValue = e.target.value;
    const parsedValue = isNaN(Number(rawValue)) ? rawValue : Number(rawValue);

    setSelectedOption(parsedValue);
    setIsOptionSelected(true);

    if (onChange) {
      onChange(parsedValue);
    }
  };

  return (
    <div className="relative">
      {label && (
        <label className="mb-2 block text-sm font-semibold text-dark dark:text-white">
          {label}
        </label>
      )}

      <div className="relative">
        <select
          value={selectedOption}
          onChange={handleChange}
          disabled={disabled}
          className={`relative w-full appearance-none rounded-lg bg-transparent px-5 py-3 outline-none transition border focus:border-blue-500 dark:bg-dark-2 dark:text-white dark:focus:border-primary ${
            disabled
              ? 'border-gray-300 bg-gray-50 text-gray-500 cursor-not-allowed dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400'
              : isOptionSelected 
                ? 'text-dark dark:text-white border-gray-300 dark:border-gray-600' 
                : 'text-gray-400 border-gray-300 dark:border-gray-600'
          }`}
        >
          <option value="" disabled className="text-gray-500 dark:text-gray-400">
            {placeholder}
          </option>
          {options.map((option, index) => (
            <option 
              key={index} 
              value={option.id ?? option.name} 
              className="text-dark dark:text-white bg-white dark:bg-dark-2"
            >
              {option.name}
            </option>
          ))}
        </select>

        {/* Arrow icon */}
        <span className={`absolute right-4 top-1/2 z-10 -translate-y-1/2 pointer-events-none ${
          disabled ? 'opacity-50' : ''
        }`}>
          <svg
            className={`fill-current transition-transform ${
              disabled ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'
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
        </span>
      </div>
    </div>
  );
};

export default ElementCombobox;