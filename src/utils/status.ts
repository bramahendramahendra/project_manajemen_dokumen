import React from "react";
import { HiClock, HiCheck, HiXMark , HiDocument} from "react-icons/hi2";

export const statusColor = (status: string | undefined | null) => {
  switch (status) {
    case '001':
      // return 'bg-yellow-100 text-yellow-800'; // Warna kuning untuk Proses
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';

    case '002':
      return 'bg-red-100 text-red-800'; // Warna merah untuk Tolak
    case '003':
      return 'bg-green-100 text-green-800'; // Warna hijau untuk Diterima
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// export const  statusIcon = (status: string | undefined | null) => {
//   switch (status) {
//     case '001': // Pending/Proses
//       return <HiClock className="inline-block mr-1.5 h-4 w-4" />;
//     case '002': // Ditolak
//       return <HiXMark className="inline-block mr-1.5 h-4 w-4" />;
//     case '003': // Diterima
//       return <HiCheck className="inline-block mr-1.5 h-4 w-4" />;
//     default:
//       return null;
//   }
// };

export const statusIcon = (status: string | undefined | null) => {
  switch (status) {
    case '001':
      return React.createElement(HiClock, { className: "inline-block mr-1.5 h-4 w-4" });
    case '002':
      return React.createElement(HiXMark, { className: "inline-block mr-1.5 h-4 w-4" });
    case '003':
      return React.createElement(HiCheck, { className: "inline-block mr-1.5 h-4 w-4" });
    default:
      return null;
  }
};

export const documentIcon = (status: string | undefined | null) => {
  switch (status) {
    case '001': // Pending/Proses
      return React.createElement(HiDocument, { className: "h-5 w-5 text-yellow-500" });
    case '002': // Ditolak
      return React.createElement(HiDocument, { className: "h-5 w-5 text-red-500" });
    case '003': // Diterima
      return React.createElement(HiDocument, { className: "h-5 w-5 text-green-500" });
    default:
      return React.createElement(HiDocument, { className: "h-5 w-5 text-gray-400" });
  }
};