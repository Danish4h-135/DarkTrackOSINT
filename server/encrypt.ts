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
 * Handles legacy unencrypted data gracefully by returning it as-is
 * @param cipherText - Encrypted data to decrypt (or plaintext for legacy data)
 * @returns Decrypted plain text
 */
export function decrypt(cipherText: string): string {
  if (!cipherText) return "";
  
  // Check if data appears to be encrypted (AES encrypted data starts with "U2FsdGVkX1" in base64)
  // If it doesn't look encrypted, assume it's legacy plaintext data
  if (!cipherText.includes("U2FsdGVkX1") && !cipherText.startsWith("U2F")) {
    // Likely legacy unencrypted data - return as-is
    console.warn("⚠️  Detected unencrypted legacy data - returning plaintext");
    return cipherText;
  }
  
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) {
      // Decryption failed - might be legacy unencrypted data
      console.warn("⚠️  Decryption returned empty - treating as legacy unencrypted data");
      return cipherText;
    }
    return decrypted;
  } catch (error) {
    // Decryption failed - treat as legacy unencrypted data
    console.warn("⚠️  Decryption error - treating as legacy unencrypted data:", error);
    return cipherText;
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
