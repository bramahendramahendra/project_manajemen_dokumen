export type LaporanDokumenAdmin = {
    id: number;
    dinas: string;
};

// Tambahkan response type untuk konsistensi dengan master_dinas
export type LaporanDokumenAdminResponse = {
  responseCode: number;
  responseDesc: string;
  responseData: {
    items: LaporanDokumenAdmin[];
  };
  responseMeta: {
    page: number;
    per_page: number;
    total_pages: number;
    total_records: number;
  };
};