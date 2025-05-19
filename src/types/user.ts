export type User = {
  userid: string;
  username: string;
  name: string;
  // level_id: string;
  role: string;
  dinas: string;
  isActive: number;
};

export type UserResponse = {
  responseCode: number;
  responseDesc: string;
  responseData: {
    items: User[];
  };
  responseMeta: {
    page: number;
    per_page: number;
    total_pages: number;
    total_records: number;
  };
}