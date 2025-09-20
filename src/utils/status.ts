export const statusColor = (status: string | undefined | null) => {
  switch (status) {
    case '001':
      return 'bg-yellow-100 text-yellow-800'; // Warna kuning untuk Proses
    case '002':
      return 'bg-red-100 text-red-800'; // Warna merah untuk Tolak
    case '003':
      return 'bg-green-100 text-green-800'; // Warna hijau untuk Diterima
    default:
      return 'bg-gray-100 text-gray-800';
  }
};