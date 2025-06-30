/**
 * Utility functions untuk formatting HTML text menjadi readable format
 * Dapat digunakan secara global di seluruh aplikasi
 */

/**
 * Mengkonversi HTML entities ke karakter yang sesuai
 * @param text - Text yang mengandung HTML entities
 * @returns Text yang sudah di-decode
 */
export const decodeHtmlEntities = (text: string): string => {
  const htmlEntities: { [key: string]: string } = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
    '&apos;': "'",
    '&cent;': '¢',
    '&pound;': '£',
    '&yen;': '¥',
    '&euro;': '€',
    '&copy;': '©',
    '&reg;': '®',
  };
  
  Object.keys(htmlEntities).forEach(entity => {
    text = text.replace(new RegExp(entity, 'g'), htmlEntities[entity]);
  });
  
  return text;
};

/**
 * Mengkonversi HTML menjadi plain text dengan formatting yang rapi
 * @param html - HTML string yang akan dikonversi
 * @param options - Opsi untuk customization
 * @returns Plain text dengan formatting yang rapi
 */
export const htmlToPlainText = (
  html: string, 
  options: {
    preserveLineBreaks?: boolean;
    convertLists?: boolean;
    bulletSymbol?: string;
  } = {}
): string => {
  if (!html) return '';
  
  const {
    preserveLineBreaks = true,
    convertLists = true,
    bulletSymbol = '• '
  } = options;
  
  let text = html;
  
  // Decode HTML entities first
  text = decodeHtmlEntities(text);
  
  if (convertLists) {
    // Convert ordered lists
    text = text.replace(/<ol[^>]*>/gi, '');
    text = text.replace(/<\/ol>/gi, '\n');
    
    // Convert unordered lists  
    text = text.replace(/<ul[^>]*>/gi, '');
    text = text.replace(/<\/ul>/gi, '\n');
    
    // Convert list items to bullet points
    text = text.replace(/<li[^>]*>/gi, bulletSymbol);
    text = text.replace(/<\/li>/gi, ',\n');
  }
  
  if (preserveLineBreaks) {
    // Convert various line break elements
    text = text.replace(/<br[^>]*\/?>/gi, '\n');
    text = text.replace(/<\/p>/gi, '\n');
    text = text.replace(/<p[^>]*>/gi, '');
    text = text.replace(/<\/div>/gi, '\n');
    text = text.replace(/<div[^>]*>/gi, '');
  }
  
  // Remove remaining HTML tags
  text = text.replace(/<[^>]*>/g, '');
  
  // Clean up formatting
  text = cleanupTextFormatting(text);
  
  return text;
};

/**
 * Membersihkan formatting text (whitespace, line breaks, dll)
 * @param text - Text yang akan dibersihkan
 * @returns Text yang sudah dibersihkan
 */
export const cleanupTextFormatting = (text: string): string => {
  return text
    // Remove excessive whitespace
    .replace(/[ \t]+/g, ' ')
    // Remove excessive line breaks
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    // Clean up trailing commas and spaces
    .replace(/,\s*$/gm, '')
    .replace(/,\s*\n/g, ',\n')
    // Trim leading and trailing whitespace
    .replace(/^\s+|\s+$/g, '');
};

/**
 * Truncate text dengan smart cutting (memotong di titik yang natural)
 * @param text - Text yang akan dipotong
 * @param limit - Batas maksimal karakter
 * @param suffix - Suffix yang ditambahkan jika text dipotong (default: '...')
 * @returns Text yang sudah dipotong
 */
export const smartTruncate = (
  text: string, 
  limit: number, 
  suffix: string = '...'
): string => {
  if (!text || text.length <= limit) return text;
  
  const truncated = text.substring(0, limit);
  
  // Find natural cutting points
  const lastBullet = truncated.lastIndexOf('• ');
  const lastPeriod = truncated.lastIndexOf('.');
  const lastComma = truncated.lastIndexOf(',');
  const lastSpace = truncated.lastIndexOf(' ');
  
  // Choose the best cutting point
  const cutPoint = Math.max(lastBullet, lastPeriod, lastComma, lastSpace);
  
  // Use natural cutting point if it's reasonable (not too short)
  if (cutPoint > 0 && cutPoint > limit * 0.7) {
    const cutText = text.substring(0, cutPoint + 1);
    return cutText.endsWith('.') || cutText.endsWith(',') 
      ? cutText + '\n' + suffix 
      : cutText + suffix;
  }
  
  return truncated + suffix;
};

/**
 * Fungsi utama untuk mengkonversi HTML ke readable text dengan limiting
 * @param html - HTML string yang akan dikonversi
 * @param limit - Batas maksimal karakter (default: 200)
 * @param options - Opsi untuk customization
 * @returns Readable text dengan formatting yang rapi
 */
export const htmlToReadableText = (
  html: string, 
  limit: number = 200,
  options: {
    preserveLineBreaks?: boolean;
    convertLists?: boolean;
    bulletSymbol?: string;
    truncateSuffix?: string;
  } = {}
): string => {
  if (!html) return '-';
  
  const {
    preserveLineBreaks = true,
    convertLists = true,
    bulletSymbol = '• ',
    truncateSuffix = '...'
  } = options;
  
  // Convert HTML to plain text
  const plainText = htmlToPlainText(html, {
    preserveLineBreaks,
    convertLists,
    bulletSymbol
  });
  
  // Apply smart truncation
  return smartTruncate(plainText, limit, truncateSuffix);
};

/**
 * Fungsi untuk menghitung jumlah kata dalam HTML
 * @param html - HTML string
 * @returns Jumlah kata
 */
export const countWordsInHtml = (html: string): number => {
  if (!html) return 0;
  
  const plainText = htmlToPlainText(html, { convertLists: false });
  const words = plainText.trim().split(/\s+/).filter(word => word.length > 0);
  
  return words.length;
};

/**
 * Fungsi untuk mengecek apakah HTML mengandung list
 * @param html - HTML string
 * @returns Boolean apakah mengandung list
 */
export const hasHtmlList = (html: string): boolean => {
  if (!html) return false;
  
  return /<(ul|ol|li)[^>]*>/i.test(html);
};

/**
 * Fungsi untuk extract text preview tanpa formatting
 * @param html - HTML string
 * @param wordLimit - Batas jumlah kata (default: 20)
 * @returns Preview text
 */
export const getTextPreview = (html: string, wordLimit: number = 20): string => {
  if (!html) return '';
  
  const plainText = htmlToPlainText(html, { 
    convertLists: false, 
    preserveLineBreaks: false 
  });
  
  const words = plainText.trim().split(/\s+/).filter(word => word.length > 0);
  
  if (words.length <= wordLimit) {
    return words.join(' ');
  }
  
  return words.slice(0, wordLimit).join(' ') + '...';
};