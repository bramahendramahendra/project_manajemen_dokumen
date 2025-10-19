// src/hooks/useManualBook.ts
import { useState, useCallback } from 'react';
import { downloadFileRequest } from '@/helpers/apiClient';

interface UseManualBookReturn {
  isDownloading: boolean;
  downloadManualBook: () => Promise<void>;
}

export const useManualBook = (): UseManualBookReturn => {
  const [isDownloading, setIsDownloading] = useState(false);

  /**
   * Download manual book
   */
  const downloadManualBook = useCallback(async () => {
    setIsDownloading(true);

    try {
      const response = await downloadFileRequest("/auths/manual-book");

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Manual book tidak ditemukan di server');
        } else if (response.status === 400) {
          try {
            const errorData = await response.json();
            throw new Error(errorData.ResponseDesc || 'Format permintaan tidak valid');
          } catch {
            throw new Error('Format permintaan tidak valid');
          }
        } else {
          throw new Error(`Error ${response.status}: Gagal mengunduh manual book`);
        }
      }

      const blob = await response.blob();

      if (blob.size === 0) {
        throw new Error('File manual book kosong atau tidak dapat dibaca');
      }

      const blobUrl = window.URL.createObjectURL(blob);

      // Dapatkan nama file dari header
      let downloadFileName = 'Manual_Book.pdf';
      const contentDisposition = response.headers.get('Content-Disposition');
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (fileNameMatch) {
          downloadFileName = fileNameMatch[1].replace(/['"]/g, '');
        }
      }

      // Download file
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = downloadFileName;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

    } catch (error) {
      console.error('Error downloading manual book:', error);
      const errorMessage = error instanceof Error
        ? error.message
        : 'Terjadi kesalahan saat mengunduh manual book';
      alert(`Gagal mengunduh manual book: ${errorMessage}`);
    } finally {
      setIsDownloading(false);
    }
  }, []);

  return {
    isDownloading,
    downloadManualBook,
  };
};