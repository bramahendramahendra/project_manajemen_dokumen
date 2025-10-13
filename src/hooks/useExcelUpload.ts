// src/hooks/useExcelUpload.ts

import { useState, ChangeEvent } from 'react';
import * as XLSX from 'xlsx';

interface UseExcelUploadReturn {
  tableData: any[];
  headers: string[];
  selectedFile: File | null;
  isLoadingFile: boolean;
  handleFileUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  resetExcelState: () => void;
}

export const useExcelUpload = (isMasterDataComplete: boolean): UseExcelUploadReturn => {
  const [tableData, setTableData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState<boolean>(false);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isMasterDataComplete) {
      alert("Lengkapi data master terlebih dahulu sebelum upload file.");
      e.target.value = "";
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsLoadingFile(true);
    setTableData([]);
    setHeaders([]);

    const reader = new FileReader();
    
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

        setTimeout(() => {
          if (data.length > 0) {
            const headers = data[0] as string[];
            setHeaders(headers);
            const rows = data.slice(1);
            setTableData(rows);
          }
          setIsLoadingFile(false);
        }, 800);
      } catch (error) {
        console.error("Error reading file:", error);
        setIsLoadingFile(false);
        alert("Terjadi kesalahan saat membaca file. Pastikan file adalah format Excel yang valid.");
      }
    };

    reader.onerror = () => {
      setIsLoadingFile(false);
      alert("Terjadi kesalahan saat membaca file.");
    };

    reader.readAsBinaryString(file);
  };

  const resetExcelState = () => {
    setTableData([]);
    setHeaders([]);
    setSelectedFile(null);
    setIsLoadingFile(false);
  };

  return {
    tableData,
    headers,
    selectedFile,
    isLoadingFile,
    handleFileUpload,
    resetExcelState,
  };
};