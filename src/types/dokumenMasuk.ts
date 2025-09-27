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

export type DokumenMasuk = {
  id: number;
  dinas_pengirim: string;
  tanggal_pengirim: Date;
  judul: string;
  senderDinas: string;
  statusMessage: number;
  statusDownload: number;
  statusOpen: number;
};

// Tambahkan response type untuk konsistensi dengan master_dinas
export type DokumenMasukResponse = {
  responseCode: number;
  responseDesc: string;
  responseData: {
    items: DokumenMasuk[];
  };
  responseMeta: {
    page: number;
    per_page: number;
    total_pages: number;
    total_records: number;
  };
};

// Interface untuk response detail message
export type MessageDetailResponse = {
  title: string;
  content: string;
  jenisSubjenis: string[];
};

// Interface untuk response detail download
export type DownloadDetailResponse = {
  documentTitle: string;
  documentFiles: {
    jenis: string;
    subjenis: string;
    total_files: number;
    files: Array<{
      file_doc: string;
    }>;
  }[];
  fileName: string;
};