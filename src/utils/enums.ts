export enum Status {
    TidakAktif = "0",
    Aktif = "1",
}

export enum Jenis {
    Free = "0",
    Pro = "1",
}

/**
 * Generate year options dynamically (current year going back 16 years)
 */
export const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  
  for (let i = 0; i < 17; i++) {
    years.push({ name: currentYear - i });
  }
  
  return years;
};