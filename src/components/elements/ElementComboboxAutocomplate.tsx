import React, { useState, useEffect, useRef, ChangeEvent } from "react";

// Definisikan types di TypeScript
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
}

const ElementComboboxAutocomplete: React.FC<ElementComboboxAutocompleteProps> = ({
  label,
  placeholder,
  options,
  onChange,
  resetKey = 0,
}) => {
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredOptions, setFilteredOptions] = useState<Option[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset state when resetKey changes
  useEffect(() => {
    setSelectedOption(null);
    setSearchTerm("");
    setFilteredOptions([]);
    setIsDropdownOpen(false);
  }, [resetKey]);

  // Filter options based on search term
  useEffect(() => {
    if (searchTerm.length >= 3) {
      const filtered = options.filter((option) =>
        String(option.name).toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
      
      // Only open dropdown if we have results or need to show "no results"
      setIsDropdownOpen(true);
    } else {
      setFilteredOptions([]);
      setIsDropdownOpen(false);
    }
  }, [searchTerm, options]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current !== event.target
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /**
   * Handle selecting an option from dropdown
   */
  const handleSelectOption = (option: Option) => {
    setSelectedOption(option);
    setSearchTerm(String(option.name));
    setIsDropdownOpen(false); // Close dropdown after selection
    onChange(option.id !== undefined ? option.id : option.name);
  };

  /**
   * Handle input change
   */
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear selected option if input is cleared
    if (value === "") {
      setSelectedOption(null);
      onChange("");
    }
  };

  /**
   * Handle input focus to show dropdown if search term is already 3+ chars
   */
  const handleFocus = () => {
    if (searchTerm.length >= 3) {
      const filtered = options.filter((option) =>
        String(option.name).toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOptions(filtered);
      setIsDropdownOpen(true);
    }
  };

  return (
    <div className="mb-4.5">
      <label className="mb-2 block text-body-sm font-medium text-dark dark:text-white">
        {label}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="w-full rounded-[7px] bg-transparent px-5 py-3 text-dark ring-1 ring-inset ring-[#1D92F9] transition placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-indigo-600 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
        />

        {/* Status indicator for min 3 chars */}
        {searchTerm.length > 0 && searchTerm.length < 3 && (
          <div className="text-xs text-[#1D92F9] mt-1">
            Ketik minimal 3 karakter untuk mencari
          </div>
        )}

        {/* Dropdown with z-index to ensure it's on top */}
        {isDropdownOpen && (
          <div 
            ref={dropdownRef}
            className="absolute z-50 mt-1 w-full origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-dark-2"
            style={{ maxHeight: '250px', overflowY: 'auto' }}
          >
            {filteredOptions.length > 0 ? (
              <div className="py-1">
                {filteredOptions.map((option, index) => (
                  <div
                    key={index}
                    className={`block px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      selectedOption?.name === option.name
                        ? "bg-[#1D92F9]/10 text-[#1D92F9]"
                        : "text-gray-700 dark:text-gray-200"
                    }`}
                    onClick={() => handleSelectOption(option)}
                  >
                    {option.name}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-2 px-4 text-sm text-gray-500 dark:text-gray-400">
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