import React from 'react';
import Image from 'next/image';
import { FileUploadSingleSectionProps } from '@/types/general';
import { getFileIcon, formatFileSize } from '@/utils/uploadUtils';

const FileUploadSection: React.FC<FileUploadSingleSectionProps> = ({
  file,
  uploadProgress,
  isUploading,
  isUploadComplete,
  onFileChange,
  onRemoveFile,
}) => {
  return (
    <div className="mb-5">
      <label className="mb-2 block text-[20px] font-semibold text-dark dark:text-white">
        Upload File
        <span className="ml-2 text-[14px] text-gray-500 dark:text-gray-400">(opsional)</span>
      </label>
      
      {/* Upload Area */}
      <div className="relative block w-full cursor-pointer appearance-none rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-8 transition-all hover:border-blue-500 hover:bg-blue-50 dark:border-dark-3 dark:bg-dark-2 dark:hover:border-primary dark:hover:bg-dark-2/50">
        <input
          type="file"
          name="uploadFile"
          id="uploadFile"
          accept="image/png, image/jpg, image/jpeg, image/gif, .pdf, .doc, .docx, .zip, .rar"
          className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
          onChange={onFileChange}
          disabled={isUploading}
        />
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
            <svg
              className="h-8 w-8 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          
          <div className="text-center">
            <p className="text-[17px] font-medium text-dark dark:text-white">
              <span className="text-blue-600 dark:text-blue-400">Klik untuk upload</span> atau drag & drop
            </p>
            <p className="mt-1 text-[17px] text-gray-500 dark:text-gray-400">
              PNG, JPG, GIF, PDF, DOC, DOCX, ZIP, RAR
            </p>
            <p className="mt-1 text-[17px] text-gray-400">
              Max: 100MB (arsip) • 10MB (file lainnya)
            </p>
          </div>
        </div>
      </div>

      {/* File Preview */}
      {file && (
        <div className="mt-4 p-4 border border-gray-200 dark:border-dark-3 rounded-xl bg-white dark:bg-dark-2 shadow-sm">
          <h5 className="mb-3 text-sm font-semibold text-dark dark:text-white">
            File Terpilih
          </h5>
          <div className="flex items-center gap-4">
            {/* File Icon/Preview */}
            {file.type.startsWith('image/') ? (
              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-gray-200 dark:border-dark-3">
                <Image
                  src={URL.createObjectURL(file)}
                  alt="preview"
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 text-2xl">
                {getFileIcon(file)}
              </div>
            )}

            {/* File Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-dark dark:text-white truncate pr-2">
                  {file.name}
                </p>
                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                  {uploadProgress}%
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {formatFileSize(file.size)}
              </p>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 overflow-hidden">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    uploadProgress === 100 
                      ? 'bg-gradient-to-r from-green-500 to-green-600' 
                      : 'bg-gradient-to-r from-blue-500 to-blue-600'
                  }`}
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>

            {/* Action Button */}
            {isUploadComplete ? (
              <button
                type="button"
                onClick={onRemoveFile}
                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Hapus File"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            ) : (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadSection;