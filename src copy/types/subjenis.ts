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
