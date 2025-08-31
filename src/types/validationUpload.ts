export type FileItem = {
  id: number;
  id_document: number;
  file_name: string;
};

export type ValidationUpload = {
    id: number;
    uraian: string;
    tanggal: Date;
    status_code: string;
    status_doc: string;
    total_files: number;
    files: FileItem[];
};

export type ValidationUploadAdmin = {
    id: number;
    skpd: string;
    validasiPending: number;
};

export type ValidationUploadAdminResponse = {
  responseCode: number;
  responseDesc: string;
  responseData: {
    items: ValidationUploadAdmin[];
  };
  responseMeta: {
    page: number;
    per_page: number;
    total_pages: number;
    total_records: number;
  };
};