export type Perihal = {
  perihal: number;
  nama_perihal: string;
  createdDate: string;
  updatedDate: string;
};

export type PerihalResponse = {
  responseCode: number;
  responseDesc: string;
  responseData: {
    items: Perihal[];
  };
  responseMeta: {
    page: number;
    per_page: number;
    total_pages: number;
    total_records: number;
  };
}
