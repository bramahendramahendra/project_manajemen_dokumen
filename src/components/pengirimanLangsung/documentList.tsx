import React from 'react';
import { DocumentListProps } from '@/types/formPengirimanLangsung';

const DocumentList: React.FC<DocumentListProps> = ({
  documents,
  selectedDocuments,
  loading,
  searchTerm,
  showAll,
  onSearchChange,
  onCheckboxChange,
  onShowAllToggle,
  getDisplayName,
}) => {
  const filteredDocuments = documents.filter((doc) =>
    getDisplayName(doc).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayedDocuments = showAll ? filteredDocuments : filteredDocuments.slice(0, 10);

  return (
    <div className="mb-4.5">
      <div className="flex items-center justify-between mb-3">
        <label className="block text-sm font-semibold text-dark dark:text-white">
          Pilih Dokumen
          <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(opsional)</span>
        </label>
        <div className="relative">
          <input
            type="text"
            placeholder="Cari dokumen..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-[200px] rounded-lg bg-transparent pl-10 pr-4 py-2 text-sm text-dark border border-gray-300 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-dark-3 dark:bg-dark-2 dark:text-white transition-all"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
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
        </div>
      </div>
      
      <div className="rounded-xl border border-gray-200 bg-white dark:border-dark-3 dark:bg-dark-2 overflow-hidden shadow-sm">
        <div className="p-4 bg-gray-50 dark:bg-dark-3 border-b border-gray-200 dark:border-dark-3">
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Pilih dokumen untuk disertakan dalam pengiriman, atau langsung kirim tanpa memilih dokumen.
          </p>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="divide-y divide-gray-200 dark:divide-dark-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center justify-between p-4">
                  <div className="flex-1">
                    <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                  </div>
                  <div className="h-5 w-5 animate-pulse rounded bg-gray-200 dark:bg-gray-600"></div>
                </div>
              ))}
            </div>
          ) : displayedDocuments.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-dark-3">
              {displayedDocuments.map((doc) => {
                const isSelected = selectedDocuments.some((d) => d.id === doc.id);
                return (
                  <label
                    key={doc.id}
                    htmlFor={`document-${doc.id}`}
                    className={`flex items-center justify-between p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-dark-3 ${
                      isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <span className="flex-1 text-sm font-medium text-gray-700 dark:text-gray-300 pr-4">
                      {getDisplayName(doc)}
                    </span>
                    <input
                      id={`document-${doc.id}`}
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => onCheckboxChange(doc, e.target.checked)}
                      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer"
                    />
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                <svg
                  className="h-8 w-8 text-gray-400"
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
              </div>
              <p className="text-gray-500 text-sm font-medium mb-1">
                {searchTerm ? "Tidak ada dokumen yang sesuai" : "Belum ada dokumen"}
              </p>
              <p className="text-xs text-gray-400">
                Anda masih bisa melanjutkan pengiriman tanpa dokumen
              </p>
            </div>
          )}
        </div>

        {filteredDocuments.length > 10 && !showAll && (
          <div className="p-4 border-t border-gray-200 dark:border-dark-3 bg-gray-50 dark:bg-dark-3 text-center">
            <button
              type="button"
              onClick={onShowAllToggle}
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium transition-colors"
            >
              Lihat Semua Dokumen ({filteredDocuments.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentList;