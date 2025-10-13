// src/hooks/useMasterDataPergeseran.ts

import { useState, useEffect, useCallback } from 'react';
import { apiRequest } from '@/helpers/apiClient';
import type { PerihalOption, SubperihalOption } from '@/types/formPergeseran';
import type { MasterDataHookReturn } from '@/types/general';

/**
 * Hook for fetching Perihal data
 */
export const usePerihalData = (): MasterDataHookReturn<PerihalOption> => {
  const [state, setState] = useState<{
    data: PerihalOption[];
    loading: boolean;
    error: string | null;
    isEmpty: boolean;
  }>({
    data: [],
    loading: false,
    error: null,
    isEmpty: false,
  });

  const fetchPerihal = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null, isEmpty: false }));
    
    try {
      const response = await apiRequest("/master_perihal/opt", "GET");
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Perihal data not found");
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();

      if (result.responseCode === 200) {
        if (!result.responseData?.items || result.responseData.items.length === 0) {
          setState({ data: [], loading: false, error: null, isEmpty: true });
        } else {
          setState({ 
            data: result.responseData.items, 
            loading: false, 
            error: null, 
            isEmpty: false 
          });
        }
      } else {
        throw new Error(result.responseDesc || "Gagal mengambil data perihal");
      }
    } catch (err: any) {
      const errorMessage = err.message === "Failed to fetch" 
        ? "Gagal mengambil data perihal. Periksa koneksi internet." 
        : err.message === "Perihal data not found"
        ? "Data perihal belum tersedia"
        : err.message;
      
      setState({ data: [], loading: false, error: errorMessage, isEmpty: true });
    }
  }, []);

  useEffect(() => {
    fetchPerihal();
  }, [fetchPerihal]);

  return {
    ...state,
    refetch: fetchPerihal,
  };
};

/**
 * Hook for fetching Subperihal data based on Perihal ID
 */
export const useSubperihalData = (perihalId: number | null): MasterDataHookReturn<SubperihalOption> => {
  const [state, setState] = useState<{
    data: SubperihalOption[];
    loading: boolean;
    error: string | null;
    isEmpty: boolean;
  }>({
    data: [],
    loading: false,
    error: null,
    isEmpty: false,
  });

  const fetchSubperihal = useCallback(async () => {
    if (!perihalId) {
      setState({ data: [], loading: false, error: null, isEmpty: false });
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null, isEmpty: false }));
    
    try {
      const response = await apiRequest(`/master_subperihal/opt/${perihalId}`, "GET");
      
      if (!response.ok) {
        if (response.status === 404) {
          setState({ data: [], loading: false, error: null, isEmpty: true });
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();

      if (result.responseCode === 200) {
        if (!result.responseData?.items || result.responseData.items.length === 0) {
          setState({ data: [], loading: false, error: null, isEmpty: true });
        } else {
          setState({ 
            data: result.responseData.items, 
            loading: false, 
            error: null, 
            isEmpty: false 
          });
        }
      } else {
        throw new Error(result.responseDesc || "Gagal mengambil data subperihal");
      }
    } catch (err: any) {
      const errorMessage = err.message === "Failed to fetch" 
        ? "Gagal mengambil data subperihal. Periksa koneksi internet." 
        : err.message;
      
      setState({ data: [], loading: false, error: errorMessage, isEmpty: true });
    }
  }, [perihalId]);

  useEffect(() => {
    fetchSubperihal();
  }, [fetchSubperihal]);

  return {
    ...state,
    refetch: fetchSubperihal,
  };
};