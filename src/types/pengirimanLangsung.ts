export type Document = {
  id: number;
  type_id: number;
  jenis: string;
  subtype_id: number;
  subjenis: string;
  dinas_id: number;
  dinas: string;
  tahun: string;
};

export type Dinas = {
  id: number;
  dinas: string;
};

export type ErrorModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
};