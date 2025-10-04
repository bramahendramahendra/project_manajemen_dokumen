
export interface MasterDataHookReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  refetch: () => void;
}

export interface FileUploadSingleSectionProps {
  file: File | null;
  uploadProgress: number;
  isUploading: boolean;
  isUploadComplete: boolean;
  error: string | null;
  success: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
}

export interface FileUploadMultiSectionProps {
  files: File[];
  uploadProgress: number[];
  isUploading: boolean;
  isUploadComplete: boolean;
  disabled?: boolean;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: () => void;
}