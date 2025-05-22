// DocumentModal.tsx dengan ikon yang dikoreksi
import React from "react";
import { HiX } from "react-icons/hi";
import { 
  HiDocument, 
  HiClock, 
  HiCheck, 
  HiXMark 
} from "react-icons/hi2";

// Definisikan tipe dokumen
interface DocumentItem {
  nameDocument: string;
  status: "Proses" | "Diterima" | "Tolak";
  dateTime: Date;
  link: string;
}

interface DocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: DocumentItem[];
  title: string;
}

// Fungsi untuk mendapatkan warna status
const getStatusColor = (status: "Proses" | "Diterima" | "Tolak") => {
  switch (status) {
    case 'Proses':
      return 'bg-yellow-100 text-yellow-800'; // Warna kuning untuk Proses
    case 'Tolak':
      return 'bg-red-100 text-red-800'; // Warna merah untuk Tolak
    case 'Diterima':
      return 'bg-green-100 text-green-800'; // Warna hijau untuk Diterima
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Fungsi untuk mendapatkan ikon status
const getStatusIcon = (status: "Proses" | "Diterima" | "Tolak") => {
  switch (status) {
    case 'Proses':
      return <HiClock className="inline-block mr-1.5 h-4 w-4" />; // Ikon jam untuk Proses
    case 'Tolak':
      return <HiXMark className="inline-block mr-1.5 h-4 w-4" />; // Ikon X untuk Tolak
    case 'Diterima':
      return <HiCheck className="inline-block mr-1.5 h-4 w-4" />; // Ikon centang untuk Diterima
    default:
      return null;
  }
};

// Fungsi untuk mendapatkan ikon dokumen dengan warna sesuai status
const getDocumentIcon = (status: "Proses" | "Diterima" | "Tolak") => {
  switch (status) {
    case 'Proses':
      return <HiDocument className="h-5 w-5 text-yellow-500" />; // Dokumen dengan warna kuning untuk proses
    case 'Tolak':
      return <HiDocument className="h-5 w-5 text-red-500" />; // Dokumen dengan warna merah untuk tolak
    case 'Diterima':
      return <HiDocument className="h-5 w-5 text-green-500" />; // Dokumen dengan warna hijau untuk diterima
    default:
      return <HiDocument className="h-5 w-5 text-gray-400" />;
  }
};

// Format tanggal dalam bahasa Indonesia
const formatDate = (date: Date): string => {
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const DocumentModal: React.FC<DocumentModalProps> = ({ isOpen, onClose, documents, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden">
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose}></div>
      
      <div className="relative w-full max-w-3xl max-h-full mx-auto rounded-[10px] bg-white shadow-2xl dark:bg-gray-dark p-6 z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 border-b pb-3">
          <h3 className="text-xl font-bold text-dark dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            <HiX className="h-5 w-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>
        
        {/* Content - Table */}
        <div className="max-h-[70vh] overflow-y-auto">
          <table className="w-full min-w-full table-auto">
            <thead className="sticky top-0 bg-white dark:bg-gray-dark">
              <tr className="bg-[#F7F9FC] dark:bg-gray-800">
                <th className="px-4 py-3 text-left font-medium text-dark dark:text-gray-300">
                  Dokumen
                </th>
                <th className="px-4 py-3 text-center font-medium text-dark dark:text-gray-300">
                  Tanggal
                </th>
                <th className="px-4 py-3 text-center font-medium text-dark dark:text-gray-300">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {documents.length > 0 ? (
                documents.map((document, index) => (
                  <tr 
                    key={index}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700 ${
                      index === documents.length - 1 
                        ? "" 
                        : "border-b border-stroke dark:border-dark-3"
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-dark dark:text-white">
                      <div className="flex items-center">
                        <div className="mr-3">
                          {getDocumentIcon(document.status)}
                        </div>
                        <span>{document.nameDocument.replace(/_/g, " ")}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-dark dark:text-white">
                      {formatDate(document.dateTime)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center">
                        <div className={`${getStatusColor(document.status)} flex items-center px-3 py-1 rounded-full text-xs`}>
                          {getStatusIcon(document.status)}
                          <span>{document.status}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <HiDocument className="h-10 w-10 text-gray-400" />
                      <p className="mt-2">Tidak ada dokumen</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentModal;