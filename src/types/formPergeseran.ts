// src/types/formPergeseran.ts

export interface PerihalOption {
  perihal: number;
  nama_perihal: string;
}

export interface SubperihalOption {
  subperihal: number;
  nama_subperihal: string;
  deskripsi: string;
}

export interface PergeseranFormState {
  kategoriUtamaId: number | null;
  kategoriUtama: string;
  subKategoriId: number | null;
  subKategori: string;
  selectedDeskripsiDetail: string;
  deskripsi: string;
}

export interface ExcelTableState {
  tableData: any[];
  headers: string[];
  selectedFile: File | null;
  isLoadingFile: boolean;
}

export interface FormValidationPergeseranReturn {
  isFormPerihalUsable: boolean;
  isFormSubperihalUsable: boolean;
  isSubperihalRequiredAndSelected: boolean;
  isMasterDataComplete: boolean;
  formStatus: {
    type: 'loading' | 'info' | 'success' | 'empty';
    message: string;
  };
}