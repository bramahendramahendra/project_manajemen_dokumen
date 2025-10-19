// src/components/pergeseran/ExcelTableDisplay.tsx

import React from 'react';
import { motion } from 'framer-motion';

interface ExcelTableDisplayProps {
  isLoadingFile: boolean;
  tableData: any[];
  headers: string[];
}

export const ExcelTableDisplay: React.FC<ExcelTableDisplayProps> = ({
  isLoadingFile,
  tableData,
  headers,
}) => {
  if (isLoadingFile) {
    return (
      <motion.div 
        className="flex flex-col items-center justify-center bg-white px-6 py-16 rounded-xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-4">
          <div className="relative">
            <motion.div 
              className="h-16 w-16 rounded-full border-4 border-blue-200"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
            <motion.div 
              className="absolute top-0 h-16 w-16 rounded-full border-4 border-blue-500 border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </div>
        </div>
        <motion.h3 
          className="mb-2 text-lg font-semibold text-gray-900 dark:text-white"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Memproses File Excel...
        </motion.h3>
        <p className="max-w-sm text-center text-sm text-gray-500 dark:text-gray-400">
          Sedang membaca dan memvalidasi data dari file yang Anda upload. Mohon tunggu sebentar.
        </p>
      </motion.div>
    );
  }

  if (tableData.length > 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="overflow-x-auto"
      >
        <table className="min-w-full table-fixed divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
            <tr>
              {headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-4 text-left font-semibold text-white text-sm"
                  style={{
                    minWidth: index === 0 ? "60px" : index === 1 ? "100px" : "200px",
                  }}
                >
                  {header || `Title ${index + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-dark">
            {tableData.map((row, rowIndex) => (
              <motion.tr
                key={rowIndex}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: rowIndex * 0.05 }}
                className={
                  rowIndex % 2 === 0 
                    ? "bg-white dark:bg-gray-dark hover:bg-blue-50 dark:hover:bg-blue-900/20" 
                    : "bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                }
              >
                {headers.map((_, cellIndex) => (
                  <td
                    key={cellIndex}
                    className="px-6 py-4 text-sm text-gray-900 dark:text-gray-300"
                  >
                    {row[cellIndex] || ""}
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 px-6 py-16 rounded-xl"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center">
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg
            className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="1.5"
              d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
            />
          </svg>
        </motion.div>
        <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">
          Belum ada data
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-sm">
          Silakan upload file Excel untuk menampilkan data tabel di sini
        </p>
      </div>
    </motion.div>
  );
};