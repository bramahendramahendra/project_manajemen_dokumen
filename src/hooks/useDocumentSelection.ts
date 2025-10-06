// src/hooks/useDocumentSelection.ts
import { useState, useEffect } from 'react';
import { apiRequest } from '@/helpers/apiClient';
import { Document } from '@/types/formPengirimanLangsung';

interface UseDocumentSelectionReturn {
  documents: Document[];
  selectedDocuments: Document[];
  loading: boolean;
  error: string | null;
  searchTerm: string;
  showAll: boolean;
  setSearchTerm: (value: string) => void;
  setShowAll: (value: boolean) => void;
  handleCheckboxChange: (document: Document, isChecked: boolean) => void;
  handleRemoveDocument: (docId: number) => void;
  resetSelection: () => void;
}

export const useDocumentSelection = (endpoint: string): UseDocumentSelectionReturn => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showAll, setShowAll] = useState<boolean>(false);

  useEffect(() => {
    const fetchDocuments = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiRequest(endpoint, "GET");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        
        if (result.responseData && result.responseData.items) {
          setDocuments(result.responseData.items);
        } else {
          setDocuments([]);
        }
      } catch (err: any) {
        setDocuments([]);
        setError(err.message || "Gagal mengambil data dokumen");
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [endpoint]);

  const handleCheckboxChange = (document: Document, isChecked: boolean) => {
    if (isChecked) {
      setSelectedDocuments((prev) => [...prev, document]);
    } else {
      setSelectedDocuments((prev) => prev.filter((doc) => doc.id !== document.id));
    }
  };

  const handleRemoveDocument = (docId: number) => {
    setSelectedDocuments((prev) => prev.filter((doc) => doc.id !== docId));
  };

  const resetSelection = () => {
    setSelectedDocuments([]);
    setSearchTerm("");
    setShowAll(false);
  };

  return {
    documents,
    selectedDocuments,
    loading,
    error,
    searchTerm,
    showAll,
    setSearchTerm,
    setShowAll,
    handleCheckboxChange,
    handleRemoveDocument,
    resetSelection,
  };
};