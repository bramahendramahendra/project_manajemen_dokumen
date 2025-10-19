// src/hooks/useFormValidationPergeseran.ts

import { useMemo } from 'react';
import type { FormValidationPergeseranReturn } from '@/types/formPergeseran';

interface FormValidationPergeseranProps {
  kategoriUtamaId: number | null;
  subKategoriId: number | null;
  loadingPerihal: boolean;
  loadingSubperihal: boolean;
  isPerihalEmpty: boolean;
  isSubperihalEmpty: boolean;
  subperihalOptions: any[];
}

export const useFormValidationPergeseran = ({
  kategoriUtamaId,
  subKategoriId,
  loadingPerihal,
  loadingSubperihal,
  isPerihalEmpty,
  isSubperihalEmpty,
  subperihalOptions,
}: FormValidationPergeseranProps): FormValidationPergeseranReturn => {
  
  const isFormPerihalUsable = useMemo(() => {
    return !loadingPerihal && !isPerihalEmpty;
  }, [loadingPerihal, isPerihalEmpty]);

  const isFormSubperihalUsable = useMemo(() => {
    const perihalSelected = kategoriUtamaId !== null;
    const subperihalDataAvailable = !loadingSubperihal && !isSubperihalEmpty;
    return perihalSelected && subperihalDataAvailable;
  }, [kategoriUtamaId, loadingSubperihal, isSubperihalEmpty]);

  const isSubperihalRequiredAndSelected = useMemo(() => {
    if (kategoriUtamaId !== null && !loadingSubperihal && !isSubperihalEmpty && subperihalOptions.length > 0) {
      return subKategoriId !== null;
    }
    return true;
  }, [kategoriUtamaId, loadingSubperihal, isSubperihalEmpty, subperihalOptions, subKategoriId]);

  const isMasterDataComplete = useMemo(() => {
    return isFormPerihalUsable && kategoriUtamaId !== null && isSubperihalRequiredAndSelected;
  }, [isFormPerihalUsable, kategoriUtamaId, isSubperihalRequiredAndSelected]);

  const getFormStatus = useMemo((): FormValidationPergeseranReturn['formStatus'] => {
    if (loadingPerihal || loadingSubperihal) {
      return { type: 'loading', message: 'Memuat data master...' };
    }

    if (isPerihalEmpty) {
      return { type: 'empty', message: '' };
    }

    if (!isFormPerihalUsable) {
      return { 
        type: 'info', 
        message: 'Data master sedang dimuat atau belum tersedia.' 
      };
    }

    if (kategoriUtamaId === null) {
      return { 
        type: 'info', 
        message: 'Pilih Perihal terlebih dahulu untuk melanjutkan.' 
      };
    }

    if (!isSubperihalRequiredAndSelected) {
      return { 
        type: 'info', 
        message: 'Pilih Sub Perihal untuk melanjutkan.' 
      };
    }

    return { 
      type: 'success', 
      message: 'Form siap digunakan. Silakan lengkapi data dan upload dokumen.' 
    };
  }, [
    loadingPerihal,
    loadingSubperihal,
    isPerihalEmpty,
    isFormPerihalUsable,
    kategoriUtamaId,
    isSubperihalRequiredAndSelected,
  ]);

  return {
    isFormPerihalUsable,
    isFormSubperihalUsable,
    isSubperihalRequiredAndSelected,
    isMasterDataComplete,
    formStatus: getFormStatus,
  };
};