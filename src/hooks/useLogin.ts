// src/hooks/useLogin.ts
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { loginRequest } from '@/helpers/apiClient';
import { useMenu } from '@/contexts/MenuContext';
import { DEBUG_MODE } from '@/utils/config';
import type { 
  LoginFormState, 
  CaptchaState, 
  UIState,
  LoginPayload,
  LoginResponse,
  FormErrors
} from '@/types/login';
import type { UserCookie } from '@/types/userCookie';

interface UseLoginReturn {
  formState: LoginFormState;
  captchaState: CaptchaState;
  uiState: UIState;
  formErrors: FormErrors;
  updateFormField: <K extends keyof LoginFormState>(field: K, value: LoginFormState[K]) => void;
  updateUIState: <K extends keyof UIState>(field: K, value: UIState[K]) => void;
  fetchCaptcha: (clearError?: boolean) => Promise<void>;
  handleSubmitLogin: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  validateForm: () => boolean;
  clearError: (field: keyof FormErrors) => void;
  clearAllErrors: () => void;
}

export const useLogin = (): UseLoginReturn => {
  const router = useRouter();
  const { fetchMenuData } = useMenu();

  // Form State
  const [formState, setFormState] = useState<LoginFormState>({
    username: "",
    password: "",
    captchaInput: "",
  });

  // Form Errors State
  const [formErrors, setFormErrors] = useState<FormErrors>({
    username: null,
    password: null,
    captchaInput: null,
  });

  // Captcha State
  const [captchaState, setCaptchaState] = useState<CaptchaState>({
    id: "",
    url: "",
  });

  // UI State
  const [uiState, setUiState] = useState<UIState>({
    showPassword: false,
    isRefreshing: false,
    isLoggingIn: false,
    showGuidePopup: false,
    isDownloading: false,
    errorMessage: null,
  });

  /**
   * Clear specific error
   */
  const clearError = useCallback((field: keyof FormErrors) => {
    setFormErrors(prev => ({ ...prev, [field]: null }));
  }, []);

  /**
   * Clear all errors
   */
  const clearAllErrors = useCallback(() => {
    setFormErrors({
      username: null,
      password: null,
      captchaInput: null,
    });
    setUiState(prev => ({ ...prev, errorMessage: null }));
  }, []);

  /**
   * Update form field helper - Auto clear error when typing
   */
  const updateFormField = useCallback(<K extends keyof LoginFormState>(
    field: K,
    value: LoginFormState[K]
  ) => {
    setFormState(prev => ({ ...prev, [field]: value }));
    
    // Clear field-specific error when user types
    if (formErrors[field as keyof FormErrors]) {
      clearError(field as keyof FormErrors);
    }
    
    // Clear general error message when user types
    if (uiState.errorMessage) {
      setUiState(prev => ({ ...prev, errorMessage: null }));
    }
  }, [formErrors, uiState.errorMessage, clearError]);

  /**
   * Update UI state helper
   */
  const updateUIState = useCallback(<K extends keyof UIState>(
    field: K,
    value: UIState[K]
  ) => {
    setUiState(prev => ({ ...prev, [field]: value }));
  }, []);

  /**
   * Generate CAPTCHA
   */
  const fetchCaptcha = useCallback(async (clearError: boolean = true) => {
    updateUIState('isRefreshing', true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auths/generate-captcha`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (response.ok) {
        const data = await response.json();

        if (data.responseCode === 200 && data.responseData) {
          setCaptchaState({
            id: data.responseData.captcha_id,
            url: `${process.env.NEXT_PUBLIC_API_URL}${data.responseData.captcha_url}`,
          });
          
          // Reset captcha input
          setFormState(prev => ({ ...prev, captchaInput: '' }));
          
          // Clear captcha error if requested
          if (clearError) {
            setFormErrors(prev => ({ ...prev, captchaInput: null }));
          }
        } else {
          console.error("Invalid captcha response:", data);
          updateUIState('errorMessage', "Gagal memuat CAPTCHA. Silakan refresh halaman.");
        }
      } else {
        console.error("Failed to fetch captcha:", response.status);
        updateUIState('errorMessage', "Gagal memuat CAPTCHA. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Error fetching CAPTCHA:", error);
      updateUIState('errorMessage', "Terjadi kesalahan saat memuat CAPTCHA.");
    } finally {
      setTimeout(() => updateUIState('isRefreshing', false), 800);
    }
  }, [updateUIState]);

  /**
   * Validasi form sebelum submit
   */
  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {
      username: null,
      password: null,
      captchaInput: null,
    };

    let isValid = true;

    // Validate username
    if (!formState.username.trim()) {
      errors.username = "Username tidak boleh kosong";
      isValid = false;
    } else if (formState.username.trim().length < 3) {
      errors.username = "Username minimal 3 karakter";
      isValid = false;
    }

    // Validate password
    if (!formState.password.trim()) {
      errors.password = "Password tidak boleh kosong";
      isValid = false;
    } else if (formState.password.trim().length < 6) {
      errors.password = "Password minimal 6 karakter";
      isValid = false;
    }

    // Validate captcha
    if (!formState.captchaInput.trim()) {
      errors.captchaInput = "Kode CAPTCHA tidak boleh kosong";
      isValid = false;
    }

    setFormErrors(errors);

    // TIDAK set errorMessage untuk validasi form
    // errorMessage hanya untuk response API
    return isValid;
  }, [formState]);

  /**
   * Handle Submit Login
   */
  const handleSubmitLogin = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear all previous errors
    clearAllErrors();

    if (!validateForm()) {
      return;
    }

    updateUIState('isLoggingIn', true);

    try {
      const payload: LoginPayload = {
        username: formState.username.trim(),
        password: formState.password.trim(),
        captcha_id: captchaState.id,
        captcha: formState.captchaInput.trim(),
      };

      const response = await loginRequest("/auths/login", "POST", payload);
      const data: LoginResponse = await response.json();

      if (response.ok && data.responseCode === 200) {
        // Login berhasil
        localStorage.setItem("hasVisited", "true");
        
        const userData: UserCookie = data.responseData.user;
        Cookies.set("user", JSON.stringify(userData), { path: "/" });

        // Simpan waktu login
        const loginTime = Date.now();
        localStorage.setItem('lastLoginTime', loginTime.toString());

        // Debug logging
        if (DEBUG_MODE) {
          console.log('='.repeat(60));
          console.log('✅ LOGIN SUCCESSFUL');
          console.log('='.repeat(60));
          console.log('Login Time:', new Date(loginTime).toLocaleTimeString('id-ID'));
          console.log('User:', userData.name);

          if (data.responseData?.token_config) {
            const tokenConfigFromBackend = data.responseData.token_config;
            const frontendAccessDuration = parseInt(process.env.NEXT_PUBLIC_ACCESS_TOKEN_DURATION || '15');
            const frontendRefreshDuration = parseInt(process.env.NEXT_PUBLIC_REFRESH_TOKEN_DURATION || '10080');

            console.log('Token Configuration from Backend:');
            console.log(`  ├─ Access Token Duration: ${tokenConfigFromBackend.access_token_duration} minutes`);
            console.log(`  └─ Refresh Token Duration: ${tokenConfigFromBackend.refresh_token_duration} minutes`);

            console.log('Frontend Token Configuration:');
            console.log(`  ├─ Access Token Duration: ${frontendAccessDuration} minutes`);
            console.log(`  └─ Refresh Token Duration: ${frontendRefreshDuration} minutes`);

            if (tokenConfigFromBackend.access_token_duration !== frontendAccessDuration ||
                tokenConfigFromBackend.refresh_token_duration !== frontendRefreshDuration) {
              console.warn('⚠️  WARNING: Token duration mismatch between frontend and backend!');
            } else {
              console.log('✅ Token configuration is synchronized');
            }
          }

          console.log('='.repeat(60));
        }

        // Fetch menu data
        try {
          await fetchMenuData();
        } catch (menuError) {
          console.error("Failed to fetch menu after login:", menuError);
        }

        // Navigate to dashboard
        router.push("/dashboard");

      } else {
        // Login gagal - Handle specific error cases
        const errorMsg = data.responseDesc || "Login gagal. Silakan coba lagi.";
        
        // Check if error is related to captcha
        if (errorMsg.toLowerCase().includes('captcha')) {
          setFormErrors(prev => ({ 
            ...prev, 
            captchaInput: "Kode CAPTCHA salah. Silakan coba lagi." 
          }));
        }
        
        // Check if error is related to credentials
        if (errorMsg.toLowerCase().includes('username') || errorMsg.toLowerCase().includes('password')) {
          setFormErrors(prev => ({
            ...prev,
            username: "Username atau password salah",
            password: "Username atau password salah"
          }));
        }
        
        updateUIState('errorMessage', errorMsg);

        // Reset captcha input dan fetch captcha baru
        setFormState(prev => ({ ...prev, captchaInput: '' }));
        await fetchCaptcha(false);
      }

    } catch (error) {
      console.error("Login error:", error);

      const errorMsg = error instanceof Error 
        ? error.message 
        : "Terjadi kesalahan. Silakan coba lagi.";
      updateUIState('errorMessage', errorMsg);

      // Reset captcha input dan fetch captcha baru
      setFormState(prev => ({ ...prev, captchaInput: '' }));
      await fetchCaptcha(false);

    } finally {
      updateUIState('isLoggingIn', false);
    }
  }, [formState, captchaState, validateForm, updateUIState, fetchCaptcha, fetchMenuData, router, clearAllErrors]);

  return {
    formState,
    captchaState,
    uiState,
    formErrors,
    updateFormField,
    updateUIState,
    fetchCaptcha,
    handleSubmitLogin,
    validateForm,
    clearError,
    clearAllErrors,
  };
};