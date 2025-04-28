export type DetailDokumenTerupload = {
    uraian: string;
    namaDokumen: string;
    tahunDokumen: number;
};

export interface DokumenPerTahun {
    id?: number;
    uraian: string;
    tahun: number;
    data: string;
}

export interface FilterDokumenPerTahun {
    typeID: number;
    uraian: string;
}