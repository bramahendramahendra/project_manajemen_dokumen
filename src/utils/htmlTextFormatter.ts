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
    preserveFormatting?: boolean;
  } = {}
): string => {
  if (!html) return '';
  
  const {
    preserveLineBreaks = true,
    convertLists = true,
    bulletSymbol = '• ',
    preserveFormatting = false
  } = options;
  
  let text = html;
  
  // Decode HTML entities first
  text = decodeHtmlEntities(text);
  
  if (convertLists) {
    // Convert ordered lists dengan numbering
    let olCounter = 1;
    text = text.replace(/<ol[^>]*>/gi, () => {
      olCounter = 1;
      return '\n';
    });
    text = text.replace(/<\/ol>/gi, '\n');
    
    // Convert unordered lists  
    text = text.replace(/<ul[^>]*>/gi, '\n');
    text = text.replace(/<\/ul>/gi, '\n');
    
    // Convert list items
    // Untuk ordered list
    text = text.replace(/<li[^>]*>/gi, () => {
      const result = `${olCounter}. `;
      olCounter++;
      return result;
    });
    
    // Fallback untuk unordered (jika tidak dalam ol)
    text = text.replace(/(?<![\d]\. )<li[^>]*>/gi, bulletSymbol);
    
    text = text.replace(/<\/li>/gi, '\n');
  }
  
  if (preserveFormatting) {
    // Preserve some formatting indicators
    text = text.replace(/<strong[^>]*>/gi, '**');
    text = text.replace(/<\/strong>/gi, '**');
    text = text.replace(/<em[^>]*>/gi, '_');
    text = text.replace(/<\/em>/gi, '_');
    text = text.replace(/<u[^>]*>/gi, '__');
    text = text.replace(/<\/u>/gi, '__');
  }
  
  if (preserveLineBreaks) {
    // Convert headers dengan emphasis
    text = text.replace(/<h1[^>]*>/gi, '\n=== ');
    text = text.replace(/<\/h1>/gi, ' ===\n');
    text = text.replace(/<h2[^>]*>/gi, '\n== ');
    text = text.replace(/<\/h2>/gi, ' ==\n');
    text = text.replace(/<h3[^>]*>/gi, '\n= ');
    text = text.replace(/<\/h3>/gi, ' =\n');
    
    // Convert various line break elements
    text = text.replace(/<br[^>]*\/?>/gi, '\n');
    text = text.replace(/<\/p>/gi, '\n\n');
    text = text.replace(/<p[^>]*>/gi, '');
    text = text.replace(/<\/div>/gi, '\n');
    text = text.replace(/<div[^>]*>/gi, '');
    text = text.replace(/<blockquote[^>]*>/gi, '\n" ');
    text = text.replace(/<\/blockquote>/gi, ' "\n');
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
    // Remove excessive whitespace (tapi keep single space)
    .replace(/[ \t]+/g, ' ')
    // Remove excessive line breaks (max 2 consecutive)
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    // Clean up leading spaces on each line
    .replace(/\n[ \t]+/g, '\n')
    // Clean up trailing spaces on each line
    .replace(/[ \t]+\n/g, '\n')
    // Remove spaces before punctuation
    .replace(/\s+([.,;:!?])/g, '$1')
    // Trim leading and trailing whitespace
    .trim();
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
  const lastNewline = truncated.lastIndexOf('\n');
  const lastBullet = truncated.lastIndexOf('• ');
  const lastPeriod = truncated.lastIndexOf('. ');
  const lastComma = truncated.lastIndexOf(', ');
  const lastSpace = truncated.lastIndexOf(' ');
  
  // Choose the best cutting point
  const cutPoint = Math.max(lastNewline, lastBullet, lastPeriod, lastComma, lastSpace);
  
  // Use natural cutting point if it's reasonable (not too short)
  if (cutPoint > 0 && cutPoint > limit * 0.6) {
    const cutText = text.substring(0, cutPoint);
    // Cek apakah sudah ada punctuation di akhir
    if (cutText.match(/[.!?]$/)) {
      return cutText.trim() + ' ' + suffix;
    }
    return cutText.trim() + suffix;
  }
  
  return truncated.trim() + suffix;
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
    preserveFormatting?: boolean;
  } = {}
): string => {
  if (!html) return '-';
  
  const {
    preserveLineBreaks = true,
    convertLists = true,
    bulletSymbol = '• ',
    truncateSuffix = '...',
    preserveFormatting = false
  } = options;
  
  // Convert HTML to plain text
  const plainText = htmlToPlainText(html, {
    preserveLineBreaks,
    convertLists,
    bulletSymbol,
    preserveFormatting
  });
  
  // Apply smart truncation
  return smartTruncate(plainText, limit, truncateSuffix);
};

/**
 * Fungsi khusus untuk preview di tabel (tanpa formatting markers)
 * @param html - HTML string
 * @param limit - Batas karakter (default: 150)
 * @returns Clean preview text
 */
export const htmlToTablePreview = (html: string, limit: number = 150): string => {
  if (!html) return '-';
  
  // Convert tanpa formatting markers
  const plainText = htmlToPlainText(html, {
    preserveLineBreaks: false,
    convertLists: true,
    bulletSymbol: '• ',
    preserveFormatting: false
  });
  
  // Truncate dengan smart cutting
  return smartTruncate(plainText, limit, '...');
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
    preserveLineBreaks: false,
    preserveFormatting: false
  });
  
  const words = plainText.trim().split(/\s+/).filter(word => word.length > 0);
  
  if (words.length <= wordLimit) {
    return words.join(' ');
  }
  
  return words.slice(0, wordLimit).join(' ') + '...';
};

/**
 * Fungsi untuk mendapatkan full text tanpa truncate (untuk modal/detail view)
 * @param html - HTML string
 * @returns Full readable text
 */
export const htmlToFullText = (html: string): string => {
  if (!html) return 'Tidak ada deskripsi';
  
  return htmlToPlainText(html, {
    preserveLineBreaks: true,
    convertLists: true,
    bulletSymbol: '• ',
    preserveFormatting: false
  });
};