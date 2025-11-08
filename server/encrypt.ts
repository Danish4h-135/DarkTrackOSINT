import CryptoJS from "crypto-js";

// Use environment variable for encryption key with a fallback during development
// In production, ENCRYPTION_KEY should always be set
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || (() => {
  if (process.env.NODE_ENV === "production") {
    throw new Error("ENCRYPTION_KEY environment variable must be set in production");
  }
  // Development fallback - in production this should be a strong random key
  console.warn("⚠️  Using default encryption key for development. Set ENCRYPTION_KEY in production!");
  return "darktrack-dev-key-change-in-production";
})();

/**
 * Encrypts sensitive data using AES encryption
 * @param data - Plain text data to encrypt
 * @returns Encrypted cipher text
 */
export function encrypt(data: string): string {
  if (!data) return "";
  try {
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error("Encryption failed:", error);
    throw new Error("Failed to encrypt data");
  }
}

/**
 * Decrypts AES encrypted data
 * @param cipherText - Encrypted data to decrypt
 * @returns Decrypted plain text
 */
export function decrypt(cipherText: string): string {
  if (!cipherText) return "";
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) {
      throw new Error("Decryption returned empty string - possibly wrong key");
    }
    return decrypted;
  } catch (error) {
    console.error("Decryption failed:", error);
    throw new Error("Failed to decrypt data");
  }
}

/**
 * Encrypts an object by converting it to JSON first
 * @param obj - Object to encrypt
 * @returns Encrypted string
 */
export function encryptObject<T>(obj: T): string {
  return encrypt(JSON.stringify(obj));
}

/**
 * Decrypts and parses a JSON object
 * @param cipherText - Encrypted JSON string
 * @returns Parsed object
 */
export function decryptObject<T>(cipherText: string): T {
  const decrypted = decrypt(cipherText);
  return JSON.parse(decrypted) as T;
}
