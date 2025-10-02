// src/hooks/useMasterData.ts
import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/helpers/apiClient';

interface MasterDataState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
}

interface UseMasterDataReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
  refetch: () => void;
}

/**
 * Hook for fetching Dinas data
 */
export const useDinasData = (): UseMasterDataReturn<any> => {
  const [state, setState] = useState<MasterDataState<any>>({
    data: [],
    loading: false,
    error: null,
    isEmpty: false,
  });

  const fetchDinas = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null, isEmpty: false }));
    
    try {
      const response = await apiRequest("/master_dinas/opt-dinas?level_id=DNS,ADM", "GET");
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Dinas data not found");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();

      if (!result.responseData?.items || result.responseData.items.length === 0) {
        setState({ data: [], loading: false, error: null, isEmpty: true });
      } else {
        const resDinas = result.responseData.items.map((item: any) => ({
          id: item.dinas,
          dinas: item.nama_dinas,
          level_id: item.level_id,
        }));
        setState({ data: resDinas, loading: false, error: null, isEmpty: false });
      }
    } catch (err: any) {
      const errorMessage = err.message === "Failed to fetch" 
        ? "Gagal mengambil data dinas. Periksa koneksi internet." 
        : err.message;
      setState({ data: [], loading: false, error: errorMessage, isEmpty: true });
    }
  }, []);

  useEffect(() => {
    fetchDinas();
  }, [fetchDinas]);

  return {
    ...state,
    refetch: fetchDinas,
  };
};

/**
 * Hook for fetching Jenis data
 */
export const useJenisData = (levelId: string): UseMasterDataReturn<any> => {
  const [state, setState] = useState<MasterDataState<any>>({
    data: [],
    loading: false,
    error: null,
    isEmpty: false,
  });

  const fetchJenis = useCallback(async () => {
    if (!levelId) {
      setState({ data: [], loading: false, error: null, isEmpty: false });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null, isEmpty: false }));
    
    try {
      const response = await apiRequest(`/master_jenis/all-data/by-role/${levelId}`, "GET");
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Jenis data not found");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();

      if (!result.responseData?.items || result.responseData.items.length === 0) {
        setState({ data: [], loading: false, error: null, isEmpty: true });
      } else {
        const resJenis = result.responseData.items.map((item: any) => ({
          id: item.jenis,
          jenis: item.nama_jenis,
        }));
        setState({ data: resJenis, loading: false, error: null, isEmpty: false });
      }
    } catch (err: any) {
      const errorMessage = err.message === "Failed to fetch" 
        ? "Gagal mengambil data jenis. Periksa koneksi internet." 
        : err.message;
      setState({ data: [], loading: false, error: errorMessage, isEmpty: true });
    }
  }, [levelId]);

  useEffect(() => {
    fetchJenis();
  }, [fetchJenis]);

  return {
    ...state,
    refetch: fetchJenis,
  };
};

/**
 * Hook for fetching Subjenis data
 */
export const useSubjenisData = (jenis: number, levelId: string): UseMasterDataReturn<any> => {
  const [state, setState] = useState<MasterDataState<any>>({
    data: [],
    loading: false,
    error: null,
    isEmpty: false,
  });

  const fetchSubjenis = useCallback(async () => {
    if (!jenis || !levelId) {
      setState({ data: [], loading: false, error: null, isEmpty: false });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null, isEmpty: false }));
    
    try {
      const response = await apiRequest(`/master_subjenis/all-data/by-role/${jenis}/${levelId}`, "GET");
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Subjenis data not found");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();

      if (!result.responseData?.items || result.responseData.items.length === 0) {
        setState({ data: [], loading: false, error: null, isEmpty: true });
      } else {
        const resSubjenis = result.responseData.items.map((item: any) => ({
          id: item.subjenis,
          subjenis: item.nama_subjenis,
        }));
        setState({ data: resSubjenis, loading: false, error: null, isEmpty: false });
      }
    } catch (err: any) {
      const errorMessage = err.message === "Failed to fetch" 
        ? "Gagal mengambil data subjenis. Periksa koneksi internet." 
        : err.message;
      setState({ data: [], loading: false, error: errorMessage, isEmpty: true });
    }
  }, [jenis, levelId]);

  useEffect(() => {
    fetchSubjenis();
  }, [fetchSubjenis]);

  return {
    ...state,
    refetch: fetchSubjenis,
  };
};