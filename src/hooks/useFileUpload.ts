import { useState, ChangeEvent } from 'react';
import { apiRequest } from '@/helpers/apiClient';
import { apiRequestUpload } from '@/helpers/uploadClient';
import { isValidFileType, validateFileSize, formatFileSize } from '@/utils/uploadUtils';
import { Toast } from '@/components/Toast';

interface UsePengirimanLangsungFileUploadReturn {
  file: File | null;
  uploadProgress: number;
  tempFilePath: string;
  isUploading: boolean;
  isUploadComplete: boolean;
  handleFileChange: (e: ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleRemoveFile: () => Promise<void>;
  resetFileState: () => void;
}

interface UseUploadPengelolaanFileUploadReturn {
  files: File[];
  uploadProgress: number[];
  tempFilePaths: string[];
  isUploading: boolean;
  isUploadComplete: boolean;
  handleFileChange: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleRemoveFile: () => Promise<void>;
  resetFileState: () => void;
}

export const usePengirimanLangsungFileUpload = (uploadEndpoint: string = "/direct-shipping/upload-file"): UsePengirimanLangsungFileUploadReturn => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [tempFilePath, setTempFilePath] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isUploadComplete, setIsUploadComplete] = useState<boolean>(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Validate file type
      if (!isValidFileType(selectedFile)) {
        Toast.show({
          type: 'error',
          title: 'File Tidak Didukung',
          message: `File "${selectedFile.name}" tidak didukung. Hanya mendukung PNG, JPG, JPEG, GIF, PDF, DOC, DOCX, ZIP, dan RAR.`,
        });
        return;
      }

      // Validate file size
      const { isValid, maxSize } = validateFileSize(selectedFile);
      if (!isValid) {
        Toast.show({
          type: 'error',
          title: 'Ukuran File Terlalu Besar',
          message: `File "${selectedFile.name}" (${formatFileSize(selectedFile.size)}) melebihi batas maksimal ${maxSize}.`,
        });
        return;
      }

      setFile(selectedFile);
      setUploadProgress(0);
      setIsUploading(true);
      setIsUploadComplete(false);

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
          Toast.show({
            type: 'success',
            title: 'Upload Berhasil',
            message: `File "${selectedFile.name}" berhasil diupload.`,
            duration: 3000,
          });
        } else {
          throw new Error(response.responseDesc || "Upload gagal.");
        }
      } catch (err: any) {
        Toast.show({
          type: 'error',
          title: 'Upload Gagal',
          message: err.message || "Terjadi kesalahan saat mengupload file.",
        });
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
        Toast.show({
          type: 'info',
          title: 'File Dihapus',
          message: 'File berhasil dihapus.',
          duration: 2000,
        });
      } catch (error) {
        console.warn("Gagal hapus file:", error);
        Toast.show({
          type: 'warning',
          title: 'Peringatan',
          message: 'Gagal menghapus file dari server.',
          duration: 3000,
        });
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
  };

  return {
    file,
    uploadProgress,
    tempFilePath,
    isUploading,
    isUploadComplete,
    handleFileChange,
    handleRemoveFile,
    resetFileState,
  };
};

export const useUploadPengelolaanFileUpload = (uploadEndpoint: string = "/document_managements/upload-file"): UseUploadPengelolaanFileUploadReturn => {
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number[]>([]);
  const [tempFilePaths, setTempFilePaths] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isUploadComplete, setIsUploadComplete] = useState<boolean>(false);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const selectedFiles = Array.from(event.target.files);
      
      // Validate file types
      const invalidFiles = selectedFiles.filter(file => !isValidFileType(file));
      if (invalidFiles.length > 0) {
        Toast.show({
          type: 'error',
          title: 'File Tidak Didukung',
          message: `File tidak didukung: ${invalidFiles.map(f => f.name).join(', ')}. Hanya mendukung PNG, JPG, JPEG, GIF, SVG, PDF, DOC, DOCX, ZIP, dan RAR.`,
        });
        return;
      }

      // Validate file sizes
      const oversizedFiles = selectedFiles.filter(file => !validateFileSize(file).isValid);
      if (oversizedFiles.length > 0) {
        const oversizedFileInfo = oversizedFiles.map(f => {
          const { maxSize } = validateFileSize(f);
          return `${f.name} (${formatFileSize(f.size)}, maks: ${maxSize})`;
        }).join(', ');
        
        Toast.show({
          type: 'error',
          title: 'Ukuran File Terlalu Besar',
          message: `File terlalu besar: ${oversizedFileInfo}.`,
        });
        return;
      }

      setFiles(selectedFiles);
      setUploadProgress(new Array(selectedFiles.length).fill(0));
      setTempFilePaths([]);
      setIsUploading(true);
      setIsUploadComplete(false);

      const uploadedPaths: string[] = [];
      const progresses: number[] = new Array(selectedFiles.length).fill(0);

      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        try {
          const { response, status } = await apiRequestUpload(
            uploadEndpoint,
            file,
            (progress) => {
              progresses[i] = progress;
              setUploadProgress([...progresses]);
            }
          );

          if (status === 200 && response.responseData?.temp_file_path) {
            uploadedPaths.push(response.responseData.temp_file_path);
          } else {
            throw new Error(response.responseDesc || "Upload gagal.");
          }
        } catch (error: any) {
          Toast.show({
            type: 'error',
            title: 'Upload Gagal',
            message: `Gagal upload ${file.name}: ${error.message}`,
          });
          setFiles([]);
          setUploadProgress([]);
          setTempFilePaths([]);
          setIsUploading(false);
          setIsUploadComplete(false);
          return;
        }
      }

      setTempFilePaths(uploadedPaths);
      setIsUploadComplete(true);
      setIsUploading(false);
      
      Toast.show({
        type: 'success',
        title: 'Upload Berhasil',
        message: `${selectedFiles.length} file berhasil diupload.`,
        duration: 3000,
      });
    }
  };

  const handleRemoveFile = async () => {
    if (tempFilePaths.length > 0) {
      for (const path of tempFilePaths) {
        try {
          await apiRequest("/document_managements/delete-file", "POST", { file_path: path });
        } catch (error) {
          console.warn("Gagal hapus file:", error);
        }
      }
      Toast.show({
        type: 'info',
        title: 'File Dihapus',
        message: 'Semua file berhasil dihapus.',
        duration: 2000,
      });
    }
    
    resetFileState();
  };

  const resetFileState = () => {
    setFiles([]);
    setUploadProgress([]);
    setTempFilePaths([]);
    setIsUploading(false);
    setIsUploadComplete(false);
  };

  return {
    files,
    uploadProgress,
    tempFilePaths,
    isUploading,
    isUploadComplete,
    handleFileChange,
    handleRemoveFile,
    resetFileState,
  };
};