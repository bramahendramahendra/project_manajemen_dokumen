import React from 'react';
import { SelectedDocumentsDisplayProps } from '@/types/formPengirimanLangsung';

const SelectedDocumentsDisplay: React.FC<SelectedDocumentsDisplayProps> = ({
  selectedDocuments,
  onRemove,
  getDisplayName,
}) => {
  return (
    <div className="mb-5">
      <label className="mb-2 block text-[20px] font-semibold text-dark dark:text-white">
        Dokumen Yang Dipilih
        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">(opsional)</span>
      </label>
      <div className="min-h-[80px] rounded-xl border border-gray-200 bg-gray-50 dark:border-dark-3 dark:bg-dark-2 p-4 transition-all">
        {selectedDocuments.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedDocuments.map((doc) => (
              <div
                key={doc.id}
                className="group flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 border border-blue-200 dark:border-blue-700 px-3 py-2 shadow-sm hover:shadow-md transition-all"
              >
                <svg
                  className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  {getDisplayName(doc)}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(doc.id)}
                  className="ml-1 flex-shrink-0 text-blue-500 hover:text-red-600 dark:text-blue-400 dark:hover:text-red-400 transition-colors p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                  title="Hapus dokumen"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-start gap-3 text-gray-500 dark:text-gray-400">
            <svg
              className="h-5 w-5 mt-0.5 flex-shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-[16px] leading-relaxed">
              Belum ada dokumen yang dipilih. Anda bisa memilih dokumen atau lanjutkan tanpa memilih dokumen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SelectedDocumentsDisplay;