"use client";
import React from "react";
import Image from "next/image";

interface DinasDisplayProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode; // Opsional: Menerima icon komponen
}

const ElementDinasDisplay: React.FC<DinasDisplayProps> = ({ 
  label, 
  value,
  icon
}) => {
  return (
    <div className="mb-4.5">
      <div className="relative w-full overflow-hidden">
        <div className="flex items-center rounded-lg border border-gray-200 bg-white px-4 py-3.5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          {icon ? (
            <div className="mr-3">{icon}</div>
          ) : (
            <div className="mr-3 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-[#0C479F] to-[#1D92F9] text-white">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
          )}
          <div>
            <p className="text-[14px] font-medium text-gray-500 dark:text-gray-400">
              {label}
            </p>
            <p className="text-lg font-bold text-gray-800 dark:text-white">
              {value}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElementDinasDisplay;