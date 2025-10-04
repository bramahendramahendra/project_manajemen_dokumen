import { useState, ChangeEvent } from 'react';
import { apiRequest } from '@/helpers/apiClient';
import { apiRequestUpload } from '@/helpers/uploadClient';
import { isValidFileType, validateFileSize, formatFileSize } from '@/utils/uploadUtils';

interface UseFileUploadReturn {
  file: File | null;
  uploadProgress: number;
  tempFilePath: string;
  isUploading: boolean;
  isUploadComplete: boolean;
  error: string | null;
  success: boolean;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleRemoveFile: () => Promise<void>;
  resetFileState: () => void;
}

export const useFileUpload = (uploadEndpoint: string = "/direct-shipping/upload-file"): UseFileUploadReturn => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [tempFilePath, setTempFilePath] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isUploadComplete, setIsUploadComplete] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      if (!isValidFileType(selectedFile)) {
        setError(`File "${selectedFile.name}" tidak didukung. Hanya mendukung PNG, JPG, JPEG, GIF, PDF, DOC, DOCX, ZIP, dan RAR.`);
        return;
      }

      // Validate file size
      const { isValid, maxSize } = validateFileSize(selectedFile);
      if (!isValid) {
        setError(`File "${selectedFile.name}" (${formatFileSize(selectedFile.size)}) melebihi batas maksimal ${maxSize}.`);
        return;
      }

      setFile(selectedFile);
      setUploadProgress(0);
      setIsUploading(true);
      setIsUploadComplete(false);
      setError(null);
      setSuccess(false);

      try {
        const { response, status } = await apiRequestUpload(
          uploadEndpoint,
          selectedFile,
          (progress) => {
            setUploadProgress(progress);
          }
        );

        if (status === 200 && response.responseData?.temp_file_path) {
          setTempFilePath(response.responseData.temp_file_path);
          setIsUploadComplete(true);
          setSuccess(true);
        } else {
          throw new Error(response.responseDesc || "Upload gagal.");
        }
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan saat mengupload file.");
        setUploadProgress(0);
        setIsUploading(false);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleRemoveFile = async () => {
    if (tempFilePath) {
      try {
        await apiRequest("/direct-shipping/delete-file", "POST", {
          file_path: tempFilePath,
        });
      } catch (error) {
        console.warn("Gagal hapus file:", error);
      }
    }
    
    resetFileState();
  };

  const resetFileState = () => {
    setFile(null);
    setUploadProgress(0);
    setTempFilePath("");
    setIsUploading(false);
    setIsUploadComplete(false);
    setSuccess(false);
    setError(null);
  };

  return {
    file,
    uploadProgress,
    tempFilePath,
    isUploading,
    isUploadComplete,
    error,
    success,
    handleFileChange,
    handleRemoveFile,
    resetFileState,
  };
};