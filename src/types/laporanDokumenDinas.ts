export type LaporanDokumenDinas = {
    id: number;
    jenis: string;
    subjenis: string;
    tahun: string;
    tanggal_upload: Date;
    files: FileItem[];
};

export type FileItem = {
  id: number;
  id_document: number;
  file_name: string;
};

// Tambahkan response type untuk konsistensi dengan master_dinas
export type LaporanDokumenDinasResponse = {
  responseCode: number;
  responseDesc: string;
  responseData: {
    items: LaporanDokumenDinas[];
  };
  responseMeta: {
    page: number;
    per_page: number;
    total_pages: number;
    total_records: number;
  };
};