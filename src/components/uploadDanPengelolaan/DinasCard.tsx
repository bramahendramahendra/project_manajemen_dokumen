import React from 'react';

interface DinasCardProps {
  namaDinas: string;
}

export const DinasCard: React.FC<DinasCardProps> = ({ namaDinas }) => {
  return (
    <div className="mb-5">
      <label className="mb-2 block text-sm font-semibold text-dark dark:text-white">
        Dinas <span className="text-red-500">*</span>
      </label>
      <div className="relative w-full overflow-hidden">
        <div className="flex items-center rounded-xl border border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-gray-700 px-5 py-4 shadow-sm transition-all hover:shadow-md">
          <div className="mr-4 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
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
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
              Instansi Dinas
            </p>
            <p className="text-base font-bold text-dark dark:text-white truncate">
              {namaDinas || "Nama Instansi Dinas"}
            </p>
          </div>
          <div className="ml-3 flex-shrink-0">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
              <svg 
                className="h-5 w-5 text-green-600 dark:text-green-400" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};