export type LaporanPergeseran = {
  id: number;
  nama: string;
};

// Tambahkan response type untuk konsistensi dengan master_dinas
export type LaporanPergeseranResponse = {
  responseCode: number;
  responseDesc: string;
  responseData: {
    items: LaporanPergeseran[];
  };
  responseMeta: {
    page: number;
    per_page: number;
    total_pages: number;
    total_records: number;
  };
};

export type LaporanPergeseranDocument = {
  id: number;
  deskripsi: string;
  tanggal: Date;
  file_unduh: string;
  // dateObject: Date; // Untuk sorting dan display
};

// Tambahkan response type untuk konsistensi dengan master_dinas
export type LaporanPergeseranDocumentResponse = {
  responseCode: number;
  responseDesc: string;
  responseData: {
    items: LaporanPergeseranDocument[];
  };
  responseMeta: {
    page: number;
    per_page: number;
    total_pages: number;
    total_records: number;
  };
};