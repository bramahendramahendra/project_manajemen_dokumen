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
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onRemoveFile: () => Promise<void>;
}

export interface FileUploadMultiSectionProps {
  files: File[];
  uploadProgress: number[];
  isUploading: boolean;
  isUploadComplete: boolean;
  disabled?: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onRemoveFile: () => Promise<void>;
}