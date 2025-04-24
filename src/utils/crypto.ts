import CryptoJS from "crypto-js";

/**
 * Dekripsi objek asli menjadi string terenkripsi
 * Lapisan: JSON stringify → AES encrypt → Base64 encode → URI encode
 */
export const encryptObject = (obj: Record<string, any>, secretKey: string): string => {
  const jsonString = JSON.stringify(obj);
  const aesEncrypted = CryptoJS.AES.encrypt(jsonString, secretKey).toString();
  const base64Encoded = btoa(aesEncrypted);
  return encodeURIComponent(base64Encoded);
};

/**
 * Dekripsi string terenkripsi menjadi objek asli
 * Lapisan: URI decode → Base64 decode → AES decrypt → JSON parse
 */
export const decryptObject = (encrypted: string, secretKey: string): Record<string, any> | null => {
  try {
    const base64Decoded = atob(decodeURIComponent(encrypted));
    const bytes = CryptoJS.AES.decrypt(base64Decoded, secretKey);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) return null;
    return JSON.parse(decrypted);
  } catch (error) {
    console.error("Decryption failed:", error);
    return null;
  }
};