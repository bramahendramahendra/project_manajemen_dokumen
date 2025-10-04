export interface UploadFormState {
  dinas: number;
  levelId: string;
  jenis: number;
  subjenis: number;
  tahun: string | number;
  keterangan: string;
  namaDinas?: string;
}

export interface YearOption {
  name: number;
}

// Type ini sudah tidak digunakan di component, sudah dipindah ke hook
// Tapi tetap dipertahankan untuk backward compatibility
export interface FileUploadState {
  files: File[];
  uploadProgress: number[];
  tempFilePaths: string[];
  isUploading: boolean;
  isUploadComplete: boolean;
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