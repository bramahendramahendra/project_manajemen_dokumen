export type Jenis = {
  id: number;
  jenis: string;
  roles: {
    levelId: string;
    role: string;
  }[];
  createdDate: string;
  updatedDate: string;
};
