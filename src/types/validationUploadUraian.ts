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
  uraian: string;
  tanggal: Date;
  total_files: number;
  files: FileItem[];
};