// src/hooks/useFormValidation.ts
import { useMemo } from 'react';

interface FormValidationProps {
  dinas: number;
  levelId: string;
  jenis: number;
  subjenis: number;
  loadingDinas: boolean;
  loadingJenis: boolean;
  loadingSubjenis: boolean;
  isDinasEmpty: boolean;
  isJenisEmpty: boolean;
  isSubjenisEmpty: boolean;
  optionJenis: any[];
  optionSubjenis: any[];
}

export const useFormValidation = ({
  dinas,
  levelId,
  jenis,
  subjenis,
  loadingDinas,
  loadingJenis,
  loadingSubjenis,
  isDinasEmpty,
  isJenisEmpty,
  isSubjenisEmpty,
  optionJenis,
  optionSubjenis,
}: FormValidationProps) => {
  
  const isFormJenisUsable = useMemo(() => {
    const basicDataAvailable = !loadingDinas && !isDinasEmpty;
    const basicSelectionMade = dinas !== 0 && levelId !== "";
    return basicDataAvailable && basicSelectionMade;
  }, [loadingDinas, isDinasEmpty, dinas, levelId]);

  const isFormSubjenisUsable = useMemo(() => {
    const basicDataAvailable = !loadingJenis && !isJenisEmpty;
    const basicSelectionMade = jenis !== 0;
    return basicDataAvailable && basicSelectionMade;
  }, [loadingJenis, isJenisEmpty, jenis]);

  const isFormUsable = useMemo(() => {
    const basicDataAvailable = !loadingSubjenis && !isSubjenisEmpty;
    const basicSelectionMade = subjenis !== 0;
    return basicDataAvailable && basicSelectionMade;
  }, [loadingSubjenis, isSubjenisEmpty, subjenis]);

  const isJenisRequiredAndSelected = useMemo(() => {
    if (dinas !== 0 && levelId !== "" && !loadingJenis && !isJenisEmpty && optionJenis.length > 0) {
      return jenis !== 0;
    }
    return true;
  }, [dinas, levelId, loadingJenis, isJenisEmpty, optionJenis, jenis]);

  const isSubjenisRequiredAndSelected = useMemo(() => {
    if (jenis !== 0 && !loadingSubjenis && !isSubjenisEmpty && optionSubjenis.length > 0) {
      return subjenis !== 0;
    }
    return true;
  }, [jenis, loadingSubjenis, isSubjenisEmpty, optionSubjenis, subjenis]);

  const isMasterDataComplete = useMemo(() => {
    return (
      isFormJenisUsable &&
      isFormSubjenisUsable &&
      isFormUsable &&
      isJenisRequiredAndSelected &&
      isSubjenisRequiredAndSelected
    );
  }, [
    isFormJenisUsable,
    isFormSubjenisUsable,
    isFormUsable,
    isJenisRequiredAndSelected,
    isSubjenisRequiredAndSelected,
  ]);

  const getFormStatus = useMemo(() => {
    if (loadingDinas || loadingJenis) {
      return { type: 'loading' as const, message: 'Memuat data master...' };
    }

    if (isDinasEmpty || isJenisEmpty) {
      return { type: 'empty' as const, message: '' };
    }

    if (!isFormJenisUsable) {
      return { 
        type: 'info' as const, 
        message: 'Pilih Dinas terlebih dahulu untuk melanjutkan.' 
      };
    }

    if (!isFormSubjenisUsable) {
      return { 
        type: 'info' as const, 
        message: 'Pilih Jenis terlebih dahulu untuk melanjutkan.' 
      };
    }

    if (!isFormUsable) {
      return { 
        type: 'info' as const, 
        message: 'Pilih Sub Jenis untuk melanjutkan.' 
      };
    }

    return { 
      type: 'success' as const, 
      message: 'Form siap digunakan. Silakan lengkapi data dan upload dokumen.' 
    };
  }, [
    loadingDinas,
    loadingJenis,
    isDinasEmpty,
    isJenisEmpty,
    isFormJenisUsable,
    isFormSubjenisUsable,
    isFormUsable,
  ]);

  return {
    isFormJenisUsable,
    isFormSubjenisUsable,
    isFormUsable,
    isJenisRequiredAndSelected,
    isSubjenisRequiredAndSelected,
    isMasterDataComplete,
    formStatus: getFormStatus,
  };
};