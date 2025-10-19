// src/components/pergeseran/PergeseranActionButtons.tsx

import React, { ChangeEvent } from 'react';
import { motion } from 'framer-motion';

interface PergeseranActionButtonsProps {
  isDownloadingTemplate: boolean;
  isLoadingFile: boolean;
  isMasterDataComplete: boolean;
  isCetakDisabled: boolean;
  isSimpanDisabled: boolean;
  loading: boolean;
  deskripsi: string;
  selectedFile: File | null;
  onDownloadTemplate: () => void;
  onFileUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  onCetak: () => void;
  onSimpan: () => void;
}

export const PergeseranActionButtons: React.FC<PergeseranActionButtonsProps> = ({
  isDownloadingTemplate,
  isLoadingFile,
  isMasterDataComplete,
  isCetakDisabled,
  isSimpanDisabled,
  loading,
  deskripsi,
  selectedFile,
  onDownloadTemplate,
  onFileUpload,
  onCetak,
  onSimpan,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Download Template Button */}
      <motion.button
        onClick={onDownloadTemplate}
        disabled={isDownloadingTemplate}
        whileHover={!isDownloadingTemplate ? { scale: 1.05, y: -2 } : {}}
        whileTap={!isDownloadingTemplate ? { scale: 0.95 } : {}}
        className={`group relative flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 px-5 py-3.5 font-semibold text-white shadow-lg shadow-emerald-500/30 transition-all hover:shadow-xl hover:shadow-emerald-500/40 ${
          isDownloadingTemplate ? "cursor-not-allowed opacity-60" : ""
        }`}
        style={{
          boxShadow: !isDownloadingTemplate 
            ? '0 10px 30px -5px rgba(16, 185, 129, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
            : 'none'
        }}
      >
        {/* Animated Background Glow */}
        {!isDownloadingTemplate && (
          <motion.div
            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.3) 0%, transparent 50%)',
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        )}

        {isDownloadingTemplate ? (
          <>
            <motion.div 
              className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span>Downloading...</span>
          </>
        ) : (
          <>
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              animate={{ y: [0, 3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </motion.svg>
            <span className="relative z-10">Download Template</span>
          </>
        )}
      </motion.button>

      {/* Upload Excel Button */}
      <motion.label
        whileHover={!isLoadingFile && isMasterDataComplete ? { scale: 1.05, y: -2 } : {}}
        whileTap={!isLoadingFile && isMasterDataComplete ? { scale: 0.95 } : {}}
        className={`group relative flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-blue-500 bg-white dark:bg-gray-dark px-5 py-3.5 font-semibold text-blue-600 dark:text-blue-400 shadow-lg transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20 ${
          isLoadingFile || !isMasterDataComplete ? "cursor-not-allowed opacity-60" : ""
        }`}
        style={{
          boxShadow: isMasterDataComplete && !isLoadingFile
            ? '0 10px 30px -5px rgba(59, 130, 246, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            : 'none'
        }}
      >
        {isLoadingFile ? (
          <>
            <motion.div 
              className="h-5 w-5 rounded-full border-2 border-blue-500 border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <span>Memproses...</span>
          </>
        ) : (
          <>
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              animate={isMasterDataComplete ? { y: [0, -3, 0] } : {}}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </motion.svg>
            <span className="relative z-10">
              {!isMasterDataComplete ? "Lengkapi Master Data" : "Upload Excel"}
            </span>
          </>
        )}
        <input
          type="file"
          id="file-upload"
          accept=".xlsx, .xls"
          onChange={onFileUpload}
          className="hidden"
          disabled={isLoadingFile || !isMasterDataComplete}
        />
      </motion.label>

      {/* Cetak Button */}
      <motion.button
        onClick={onCetak}
        disabled={isCetakDisabled}
        whileHover={!isCetakDisabled ? { scale: 1.05, y: -2 } : {}}
        whileTap={!isCetakDisabled ? { scale: 0.95 } : {}}
        className={`group relative flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-semibold shadow-lg transition-all ${
          isCetakDisabled
            ? "cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-500"
            : "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
        }`}
        style={{
          boxShadow: !isCetakDisabled
            ? '0 10px 30px -5px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            : 'none'
        }}
      >
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          animate={!isCetakDisabled ? { rotate: [0, 5, -5, 0] } : {}}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
          />
        </motion.svg>
        <span className="relative z-10">Cetak</span>
      </motion.button>

      {/* Simpan Button */}
      <motion.button
        onClick={onSimpan}
        disabled={isSimpanDisabled}
        whileHover={!isSimpanDisabled ? { scale: 1.05, y: -2 } : {}}
        whileTap={!isSimpanDisabled ? { scale: 0.95 } : {}}
        className={`group relative flex items-center justify-center gap-2 rounded-xl px-5 py-3.5 font-semibold shadow-lg transition-all ${
          isSimpanDisabled
            ? "cursor-not-allowed bg-gray-300 text-gray-500 dark:bg-gray-700 dark:text-gray-500"
            : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40"
        }`}
        style={{
          boxShadow: !isSimpanDisabled
            ? '0 10px 30px -5px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
            : 'none'
        }}
        title={
          !isMasterDataComplete
            ? "Lengkapi data master terlebih dahulu"
            : !deskripsi.trim()
            ? "Isi deskripsi terlebih dahulu"
            : !selectedFile
            ? "Upload file terlebih dahulu"
            : "Kirim data pergeseran"
        }
      >
        {/* Animated Background */}
        {!isSimpanDisabled && (
          <motion.div
            className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
            animate={{
              background: [
                'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 80% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)',
                'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.3) 0%, transparent 50%)',
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        )}

        <div className="relative z-10 flex items-center gap-2">
          {loading ? (
            <motion.div 
              className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          ) : (
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              animate={!isSimpanDisabled ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
              />
            </motion.svg>
          )}
          <span>{loading ? "Mengirim..." : "Kirim"}</span>
        </div>
      </motion.button>
    </div>
  );
};