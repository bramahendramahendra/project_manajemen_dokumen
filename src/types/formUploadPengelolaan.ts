export interface DinasOption {
  id: number;
  dinas: string;
  level_id: string;
}

export interface JenisOption {
  id: number;
  jenis: string;
}

export interface SubjenisOption {
  id: number;
  subjenis: string;
}

export interface YearOption {
  name: number;
}

export interface UploadFormState {
  dinas: number;
  levelId: string;
  jenis: number;
  subjenis: number;
  tahun: string | number;
  keterangan: string;
  namaDinas?: string;
}

export interface FileUploadState {
  files: File[];
  uploadProgress: number[];
  tempFilePaths: string[];
  isUploading: boolean;
  isUploadComplete: boolean;
}

export interface MasterDataHookReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  refetch: () => void;
}

export interface FormValidationReturn {
  isMasterDataComplete: boolean;
  isFormJenisUsable: boolean;
  isFormSubjenisUsable: boolean;
  isFormUsable: boolean;
  isJenisRequiredAndSelected: boolean;
  isSubjenisRequiredAndSelected: boolean;
  formStatus: {
    type: 'loading' | 'info' | 'success' | 'empty';
    message: string;
  };
}