export type FileItem = {
  id: number;
  id_document: number;
  file_name: string;
};

export type DaftarUploadAdmin = {
    id: number;
    skpd: string;
    validasiPending: number;
};

export type DaftarUpload = {
    id: number;
    jenis: string;
    uraian: string;
    tanggal: Date;
    status_code: string;
    status_doc: string;
    total_files: number;
    files: FileItem[];
    catatan?: string; // Tambahkan field catatan sebagai optional
};

// Tambahkan response type untuk konsistensi dengan master_dinas
export type DaftarUploadResponse = {
  responseCode: number;
  responseDesc: string;
  responseData: {
    items: DaftarUpload[];
  };
  responseMeta: {
    page: number;
    per_page: number;
    total_pages: number;
    total_records: number;
  };
};