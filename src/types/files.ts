export type Files = {
  id: number;
  files: string;
  deskripsi?: string;
  createdDate: string;
  updatedDate: string;
}

// Interface untuk API Response
export type FilesResponse = {
  responseCode: number;
  responseDesc: string;
  responseData: {
    items: Files[];
  };
  responseMeta: {
    page: number;
    per_page: number;
    total_pages: number;
    total_records: number;
  };
}