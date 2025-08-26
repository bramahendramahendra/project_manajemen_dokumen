export type DokumenTerupload = {
    typeID: number,
    uraian: string,
    // tanggal: Date,
    jumlahDocument: number
};

export type DokumenTeruploadResponse = {
  responseCode: number;
  responseDesc: string;
  responseData: {
    items: any[];
  };
  responseMeta: {
    page: number;
    per_page: number;
    total_pages: number;
    total_records: number;
  };
}