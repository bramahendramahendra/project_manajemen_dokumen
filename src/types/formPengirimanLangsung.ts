export interface PengirimanLangsungFormState {
  judul: string;
  dinas: number;
  lampiran: string;
}







export interface Document {
  id: number;
  dinas: string;
  jenis: string;
  subjenis: string;
  tahun: string | number;
}

// export interface Dinas {
//   id: number;
//   dinas: string;
// }

// export interface FormState {
//   judul: string;
//   dinas: number;
//   lampiran: string;
//   selectedDocuments: Document[];
//   file: File | null;
//   tempFilePath: string;
// }

// export interface FileUploadState {
//   file: File | null;
//   uploadProgress: number;
//   tempFilePath: string;
//   isUploading: boolean;
//   isUploadComplete: boolean;
// }

export interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
}

export interface DocumentListProps {
  documents: Document[];
  selectedDocuments: Document[];
  loading: boolean;
  searchTerm: string;
  showAll: boolean;
  onSearchChange: (value: string) => void;
  onCheckboxChange: (document: Document, isChecked: boolean) => void;
  onShowAllToggle: () => void;
  getDisplayName: (doc: Document) => string;
}

export interface SelectedDocumentsDisplayProps {
  selectedDocuments: Document[];
  onRemove: (docId: number) => void;
  getDisplayName: (doc: Document) => string;
}


