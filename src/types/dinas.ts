export type Dinas = {
  id: number;
  dinas: string;
  createdDate: string;
  updatedDate: string;
};


export type DinasResponse = {
  responseCode: number;
  responseDesc: string;
  responseData: {
    items: Dinas[];
  };
  responseMeta: {
    page: number;
    per_page: number;
    total_pages: number;
    total_records: number;
  };
}