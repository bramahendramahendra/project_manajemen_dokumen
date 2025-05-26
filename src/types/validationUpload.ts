export type ValidationUpload = {
    id: number;
    uraian: string;
    tanggal: Date;
    status_code: string;
    status_doc: string;
};

export type ValidationUploadAdmin = {
    id: number;
    skpd: string;
    validasiPending: number;
};