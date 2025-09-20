export const formatIndonesianDateTime = (dateInput: string | Date | undefined | null): string => {
  if (!dateInput) return "-";
  
  // Jika input adalah string, convert ke Date
  // Jika sudah Date, langsung gunakan
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  
  // Validasi apakah date valid
  if (isNaN(date.getTime())) return "-";
  
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC" // Tampilkan sebagai UTC
  }).format(date) + " WIB";
};

export const formatIndonesianDateOnly = (dateInput: string | Date | undefined | null): string => {
  if (!dateInput) return "-";
  
  // Jika input adalah string, convert ke Date
  // Jika sudah Date, langsung gunakan
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  
  // Validasi apakah date valid
  if (isNaN(date.getTime())) return "-";
  
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(date);
};

export const formatIndonesianTimeOnly = (dateInput: string | Date | undefined | null): string => {
  if (!dateInput) return "-";
  
  // Jika input adalah string, convert ke Date
  // Jika sudah Date, langsung gunakan
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  
  // Validasi apakah date valid
  if (isNaN(date.getTime())) return "-";
  
  return new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC"
  }).format(date) + " WIB";
};