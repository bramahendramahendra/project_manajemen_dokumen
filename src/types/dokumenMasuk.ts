export type DokumenMasukDinas = {
  id: number;
  nama_dinas: string;
  jumlah_dokumen_baru: number;
  icon?: string; // Opsional untuk ikon kustom
};

// Tambahkan response type untuk konsistensi dengan master_dinas
export type DokumenMasukDinasResponse = {
  responseCode: number;
  responseDesc: string;
  responseData: {
    items: DokumenMasukDinas[];
  };
  responseMeta: {
    page: number;
    per_page: number;
    total_pages: number;
    total_records: number;
  };
};