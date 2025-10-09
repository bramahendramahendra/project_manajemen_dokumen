// src/types/login.ts
export interface LoginFormState {
  username: string;
  password: string;
  captchaInput: string;
}

export interface CaptchaState {
  id: string;
  url: string;
}

export interface UIState {
  showPassword: boolean;
  isRefreshing: boolean;
  isLoggingIn: boolean;
  showGuidePopup: boolean;
  isDownloading: boolean;
  errorMessage: string | null;
}

export interface LoginPayload {
  username: string;
  password: string;
  captcha_id: string;
  captcha: string;
}

export interface LoginResponse {
  responseCode: number;
  responseDesc: string;
  responseData: {
    user: {
      userid: string;
      username: string;
      name: string;
      dinas: number;
      nama_dinas: string;
      level_id: string;
    };
    token_config?: {
      access_token_duration: number;
      refresh_token_duration: number;
    };
  };
}

export interface CaptchaResponse {
  responseCode: number;
  responseDesc: string;
  responseData: {
    captcha_id: string;
    captcha_url: string;
  };
}