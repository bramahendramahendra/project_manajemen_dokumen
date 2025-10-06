// src/components/upload/FileUpload.tsx
import React from 'react';
import Image from 'next/image';
import { FileUploadMultiSectionProps } from '@/types/general';
import { getFileIcon, formatFileSize } from '@/utils/uploadUtils';

export const FileUpload: React.FC<FileUploadMultiSectionProps> = ({
  files,
  uploadProgress,
  isUploading,
  isUploadComplete,
  disabled = false,
  onFileChange,
  onRemoveFile,
}) => {
  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="mb-4.5">
        <label className="mb-3 block text-sm font-semibold text-dark dark:text-white">
          Upload File <span className="text-red-500">*</span>
        </label>
        <div
          className={`relative block w-full appearance-none rounded-xl border-2 border-dashed px-4 py-8 transition-all duration-200 ${
            disabled
              ? 'border-gray-300 bg-gray-50 cursor-not-allowed dark:border-gray-600 dark:bg-gray-800'
              : 'border-gray-300 bg-gray-50 cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:border-dark-3 dark:bg-dark-2 dark:hover:border-primary dark:hover:bg-dark-2/50'
          }`}
        >
          <input
            type="file"
            multiple
            name="documentFile"
            id="documentFile"
            accept="image/png, image/jpg, image/jpeg, image/gif, image/svg+xml, .pdf, .doc, .docx, .zip, .rar, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/zip, application/x-zip-compressed, application/x-rar-compressed, application/vnd.rar"
            className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none disabled:cursor-not-allowed"
            onChange={onFileChange}
            disabled={disabled}
          />
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className={`flex h-16 w-16 items-center justify-center rounded-full ${
              disabled ? 'bg-gray-200 dark:bg-gray-700' : 'bg-blue-100 dark:bg-blue-900/30'
            }`}>
              <svg
                className={`h-8 w-8 ${disabled ? 'text-gray-400' : 'text-blue-600 dark:text-blue-400'}`}
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
              <p className={`text-sm font-medium ${disabled ? 'text-gray-500' : 'text-dark dark:text-white'}`}>
                {disabled ? (
                  'Lengkapi data master terlebih dahulu'
                ) : (
                  <>
                    <span className="text-blue-600 dark:text-blue-400">Klik untuk upload</span> atau drag & drop
                  </>
                )}
              </p>
              {!disabled && (
                <>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG, JPEG, GIF, SVG, PDF, DOC, DOCX, ZIP, RAR
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    Max: 100MB (arsip) • 25MB (dokumen) • 10MB (gambar)
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-sm font-semibold text-dark dark:text-white">
            File Terpilih ({files.length})
          </h5>
          <div className="space-y-2">
            {files.map((file, index) => {
              const isImage = file.type.startsWith('image/');
              const percent = uploadProgress[index];
              const fileIcon = getFileIcon(file);

              return (
                <div
                  key={index}
                  className="relative p-4 border border-gray-200 dark:border-dark-3 rounded-xl bg-white dark:bg-dark-2 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex gap-4 items-center">
                    {/* Preview/Icon */}
                    <div className="flex-shrink-0">
                      {isImage ? (
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
                          {fileIcon}
                        </div>
                      )}
                    </div>

                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-medium text-dark dark:text-white truncate pr-2">
                          {file.name}
                        </p>
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">
                          {percent}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {formatFileSize(file.size)}
                      </p>
                      
                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            percent === 100 
                              ? 'bg-gradient-to-r from-green-500 to-green-600' 
                              : 'bg-gradient-to-r from-blue-500 to-blue-600'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="flex-shrink-0">
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
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};