/**
 * Authenticated user context
 */
export interface JwtPayload {
  id: number;
  email: string;
  name: string;
  role: string;
}

/**
 * Refresh token payload structure
 */
export interface RefreshTokenPayload {
  id: number;
  email: string;
  type: 'refresh';
}

/**
 * JWT Response Type
 */
export interface JwtResponse {
  status: 'success';
  data: JwtPayload;
  accessToken: string;
  refreshToken: string;
}

/**
 * Token Response Type
 */
export interface TokenResponse {
  status: 'success';
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}
