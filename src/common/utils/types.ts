export type JwtPayload = {
  id: number;
  email: string;
  name: string;
  role: string;
};

export type RefreshTokenPayload = {
  id: number;
  email: string;
  type: 'refresh';
};

// JWT Response Type
export type JwtResponse = {
  status: 'success';
  data: JwtPayload;
  accessToken: string;
  refreshToken: string;
};

// Token Response Type
export type TokenResponse = {
  status: 'success';
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
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
