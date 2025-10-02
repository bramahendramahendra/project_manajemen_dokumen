/**
 * Validate file type
 */
export const isValidFileType = (file: File): boolean => {
  const allowedTypes = [
    'image/png',
    'image/jpg', 
    'image/jpeg',
    'image/gif',
    'image/svg+xml',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed',
    'application/vnd.rar',
    'application/octet-stream'
  ];
  
  const allowedExtensions = ['.zip', '.rar', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.pdf', '.doc', '.docx'];
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  
  return allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);
};

/**
 * Get maximum file size based on file type
 */
export const getMaxFileSize = (file: File): number => {
  const fileName = file.name.toLowerCase();
  
  if (fileName.match(/\.(zip|rar)$/)) {
    return 100 * 1024 * 1024; // 100MB for ZIP/RAR
  } else if (fileName.match(/\.(pdf|doc|docx)$/)) {
    return 25 * 1024 * 1024; // 25MB for PDF/DOC
  } else {
    return 10 * 1024 * 1024; // 10MB for images and other files
  }
};

/**
 * Validate file size
 */
export const validateFileSize = (file: File): { isValid: boolean; maxSize: string } => {
  const maxSize = getMaxFileSize(file);
  const fileName = file.name.toLowerCase();
  
  let maxSizeText;
  if (fileName.match(/\.(zip|rar)$/)) {
    maxSizeText = "100MB";
  } else if (fileName.match(/\.(pdf|doc|docx)$/)) {
    maxSizeText = "25MB";
  } else {
    maxSizeText = "10MB";
  }
  
  return {
    isValid: file.size <= maxSize,
    maxSize: maxSizeText
  };
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file icon/emoji based on file type
 */
export const getFileIcon = (file: File): string => {
  const fileName = file.name.toLowerCase();
  const fileType = file.type;

  if (fileType.startsWith('image/')) return '🖼️';
  if (fileName.endsWith('.zip')) return '📦';
  if (fileName.endsWith('.rar')) return '🗜️';
  if (fileName.endsWith('.pdf') || fileType === 'application/pdf') return '📄';
  if (fileName.endsWith('.doc') || fileName.endsWith('.docx') || 
      fileType === 'application/msword' || 
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return '📝';
  if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) return '📊';
  return '📎';
};