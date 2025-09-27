export type Status = 'complete' | 'uncomplete';

export type DASHBOARD = {
    logo: string;
    name: string;
    nameDocument: string;
    status: Status;
    dateTime: Date;
    link:string;
};

export type Document = {
  id: number;
  dinas?: string;
  jenis: string;
  subjenis: string;
  maker_date: string;
  status_code: string;
  status_doc: string;
}

export type DocumentResponse = {
  responseCode: number;
  responseDesc: string;
  responseData: {
    items: Document[];
  };
  responseMeta: {
    page: number;
    per_page: number;
    total_pages: number;
    total_records: number;
  };
}

export type DocumentItem = {
  id: number;
  dinas?: string;
  jenis: string;
  subjenis: string;
  maker_date: string;
  status_code: string;
  status_doc: string;
  dinas_name?: string;
}

export type DocumentItemResponse = {
  responseCode: number;
  responseDesc: string;
  responseData: {
    items: DocumentItem[];
  };
  responseMeta: {
    page: number;
    per_page: number;
    total_pages: number;
    total_records: number;
  };
}