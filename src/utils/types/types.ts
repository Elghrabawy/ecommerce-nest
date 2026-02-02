export type JwtPayload = {
  id: number;
  email: string;
  name: string;
  role: string;
};

// JWT Response Type
export type JwtResponse = {
  status: 'success';
  data: JwtPayload;
  token: string;
};

// Success API response types
export type singleDataResponse<T> = {
  status: 'success';
  data: Partial<T>;
};

export type multiDataResponse<T> = {
  status: 'success';
  count: number;
  data: Partial<T>[];
};
