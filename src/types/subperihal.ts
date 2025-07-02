export type Subperihal = {
  subperihal: number;
  perihal: number;
  nama_perihal: string;
  nama_subperihal: string;
  deskripsi: string;
  createdDate: string;
  updatedDate: string;
};

export type SubperihalResponse = {
  responseCode: number;
  responseDesc: string;
  responseData: {
    items: Subperihal[];
  };
  responseMeta: {
    page: number;
    per_page: number;
    total_pages: number;
    total_records: number;
  };
}
