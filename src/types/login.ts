/**
 * Login Types
 * Definisi tipe data untuk login system
 */

export interface LoginFormState {
  username: string;
  password: string;
  captchaInput: string;
}

export interface LoginPayload {
  username: string;
  password: string;
  captcha_id: string;
  captcha: string;
}

export interface CaptchaData {
  captcha_id: string;
  captcha_url: string;
}

export interface TokenConfig {
  access_token_duration: number;
  refresh_token_duration: number;
}

export interface LoginResponseData {
  user: {
    userid: string;
    username: string;
    name: string;
    level_id: string;
    role: string;
    dinas?: number;
    nama_dinas?: string;
  };
  token_config?: TokenConfig;
}

export interface LoginResponse {
  responseCode: number;
  responseDesc: string;
  responseData: LoginResponseData;
}

export interface CaptchaResponse {
  responseCode: number;
  responseDesc: string;
  responseData: CaptchaData;
}

// Error types
export type LoginErrorType = 
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'INVALID_CAPTCHA'
  | 'ACCOUNT_INACTIVE'
  | 'ACCOUNT_LOCKED'
  | 'NETWORK_ERROR'
  | 'VALIDATION_ERROR'
  | 'UNKNOWN_ERROR';

export interface LoginError {
  type: LoginErrorType;
  message: string;
  details?: string;
}