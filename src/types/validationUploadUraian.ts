export type ValidationUploadUraian = {
  skpd: string;
  uraian: string;
  tanggal: Date
};

export type FileItem = {
  id: number;
  id_document: number;
  file_name: string;
};

export type ValidationUploadUraianAdmin = {
  id: number;
  jenis: string;
  uraian: string;
  tanggal: Date;
  total_files: number;
  files: FileItem[];
};

export type ValidationUploadUraianAdminResponse = {
  responseCode: number;
  responseDesc: string;
  responseData: {
    items: ValidationUploadUraianAdmin[];
  };
  responseMeta: {
    page: number;
    per_page: number;
    total_pages: number;
    total_records: number;
  };
};