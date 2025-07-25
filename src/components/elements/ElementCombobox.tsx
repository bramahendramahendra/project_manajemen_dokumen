"use client";
import React, { useState, useEffect } from "react";

interface ElementComboboxProps {
  label: string;
  placeholder: string;
  // options: { name: string | number }[];
  options: { name: string | number; id?: string | number }[];
  onChange?: (value: string | number) => void;
  resetKey?: number;
}

const ElementCombobox: React.FC<ElementComboboxProps> = ({ 
  label, 
  placeholder, 
  options,
  onChange,
  resetKey,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | number>("");
  const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);

  useEffect(() => {
    // Reset dropdown saat resetKey berubah
    setSelectedOption("");
    setIsOptionSelected(false);
  }, [resetKey]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const rawValue = e.target.value;

    // Try to convert to number if it's a number, else keep string
    const parsedValue = isNaN(Number(rawValue)) ? rawValue : Number(rawValue);

    setSelectedOption(parsedValue);
    setIsOptionSelected(true);

    if (onChange) {
      onChange(parsedValue);
    }
  };

  const changeTextColor = () => {
    setIsOptionSelected(true);
  };

  return (
    <div className="mb-4.5">
      <label className="mb-3 block text-body-sm text-dark dark:text-white font-medium">
        {label}
      </label>

      <div className="relative z-20 bg-transparent dark:bg-dark-2">
        <select
          value={selectedOption}
          // onChange={(e) => {
          //   setSelectedOption(e.target.value);
          //   changeTextColor();
          // }}
          onChange={handleChange}
          className={`relative z-20 appearance-none w-full rounded-[7px] bg-transparent px-5 py-3 transition ring-1 ring-inset ring-[#1D92F9] placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary ${
            isOptionSelected ? "text-dark dark:text-white" : "text-[#9ca3af]"
          }`}
        >
          <option value="" disabled className="text-dark-6">
            {placeholder}
          </option>
          {options.map((option, index) => (
            <option key={index} value={option.id ?? option.name} className="text-dark-6">
              {option.name}
            </option>
          ))}
        </select>

        <span className="absolute right-4 top-1/2 z-30 -translate-y-1/2">
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M8.99922 12.8249C8.83047 12.8249 8.68984 12.7687 8.54922 12.6562L2.08047 6.2999C1.82734 6.04678 1.82734 5.65303 2.08047 5.3999C2.33359 5.14678 2.72734 5.14678 2.98047 5.3999L8.99922 11.278L15.018 5.34365C15.2711 5.09053 15.6648 5.09053 15.918 5.34365C16.1711 5.59678 16.1711 5.99053 15.918 6.24365L9.44922 12.5999C9.30859 12.7405 9.16797 12.8249 8.99922 12.8249Z"
              fill=""
            />
          </svg>
        </span>
      </div>
    </div>
  );
};

export default ElementCombobox;
