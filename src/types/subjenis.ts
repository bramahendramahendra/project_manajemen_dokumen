export type Subjenis = {
  id: number;
  idJenis: number;
  jenis: string;
  subjenis: string;
  roles: {
    levelId: string;
    role: string;
  }[];
  createdDate: string;
  updatedDate: string;
};

export type SubjenisResponse = {
  responseCode: number;
  responseDesc: string;
  responseData: {
    items: Subjenis[];
  };
  responseMeta: {
    page: number;
    per_page: number;
    total_pages: number;
    total_records: number;
  };
}
