/**
 * useLogin Hook
 * Custom hook untuk handle login functionality
 */

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { loginRequest } from '@/helpers/apiClient';
// import { Toast } from '@/components/alerts/Alert';
import type { 
  LoginPayload, 
  LoginResponse,
  LoginError,
  LoginErrorType 
} from '@/types/login';

interface UseLoginReturn {
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<boolean>;
  clearError: () => void;
}

const DEBUG_MODE = process.env.NODE_ENV === 'development';

export const useLogin = (): UseLoginReturn => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Clear error message
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Parse error dari backend
   */
  const parseError = (responseDesc: string, statusCode: number): LoginError => {
    // Mapping error berdasarkan message dari backend
    if (responseDesc.includes('tidak ditemukan') || responseDesc.includes('not found')) {
      return {
        type: 'USER_NOT_FOUND',
        message: responseDesc,
      };
    }
    
    if (responseDesc.includes('Password') || responseDesc.includes('password')) {
      return {
        type: 'INVALID_CREDENTIALS',
        message: responseDesc,
      };
    }
    
    if (responseDesc.includes('CAPTCHA') || responseDesc.includes('captcha')) {
      return {
        type: 'INVALID_CAPTCHA',
        message: responseDesc,
      };
    }
    
    if (responseDesc.includes('tidak aktif') || responseDesc.includes('inactive')) {
      return {
        type: 'ACCOUNT_INACTIVE',
        message: responseDesc,
      };
    }
    
    if (responseDesc.includes('terkunci') || responseDesc.includes('locked')) {
      return {
        type: 'ACCOUNT_LOCKED',
        message: responseDesc,
      };
    }

    if (statusCode === 400) {
      return {
        type: 'VALIDATION_ERROR',
        message: responseDesc,
      };
    }

    return {
      type: 'UNKNOWN_ERROR',
      message: responseDesc || 'Terjadi kesalahan saat login',
    };
  };

  /**
   * Login function
   */
  const login = useCallback(async (payload: LoginPayload): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await loginRequest('/auths/login', 'POST', payload);
      const data: LoginResponse = await response.json();

      if (response.ok && data.responseCode === 200) {
        // Login berhasil
        const { user, token_config } = data.responseData;

        // Simpan user data ke cookies
        Cookies.set('user', JSON.stringify(user), { path: '/' });
        
        // Simpan login time untuk token refresh
        const loginTime = Date.now();
        localStorage.setItem('lastLoginTime', loginTime.toString());
        localStorage.setItem('hasVisited', 'true');

        // Debug logging
        if (DEBUG_MODE) {
          console.log('✅ LOGIN SUCCESS');
          console.log('User:', user.username);
          console.log('Login Time:', new Date(loginTime).toLocaleString('id-ID'));
          if (token_config) {
            console.log('Token Config:', token_config);
          }
        }

        // Show success toast
        // Toast.show({
        //   type: 'success',
        //   title: 'Login Berhasil',
        //   message: `Selamat datang, ${user.name || user.username}!`,
        //   duration: 2000,
        // });

        // Redirect after short delay
        setTimeout(() => {
          router.push('/dashboard');
        }, 500);

        return true;

      } else {
        // Login gagal - parse error
        const loginError = parseError(data.responseDesc, response.status);
        setError(loginError.message);

        // Toast.show({
        //   type: 'error',
        //   title: 'Login Gagal',
        //   message: loginError.message,
        // });

        if (DEBUG_MODE) {
          console.error('❌ LOGIN FAILED:', loginError);
        }

        return false;
      }

    } catch (err: any) {
      // Network error atau error lainnya
      const errorMessage = err.message || 'Terjadi kesalahan jaringan';
      setError(errorMessage);

    //   Toast.show({
    //     type: 'error',
    //     title: 'Kesalahan Jaringan',
    //     message: errorMessage,
    //   });

      console.error('❌ LOGIN ERROR:', err);
      return false;

    } finally {
      setIsLoading(false);
    }
  }, [router]);

  return {
    isLoading,
    error,
    login,
    clearError,
  };
};