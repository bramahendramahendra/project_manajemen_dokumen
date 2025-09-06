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