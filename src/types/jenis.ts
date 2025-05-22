export type Jenis = {
  id: number;
  jenis: string;
  roles: {
    levelId: string;
    role: string;
  }[];
  createdDate: string;
  updatedDate: string;
};

export type JenisResponse = {
  responseCode: number;
  responseDesc: string;
  responseData: {
    items: Jenis[];
  };
  responseMeta: {
    page: number;
    per_page: number;
    total_pages: number;
    total_records: number;
  };
}
