const crypto = require('crypto');

/**
 * Encryption utility for sensitive data (medical_history)
 * Uses AES-256-GCM for authenticated encryption
 */

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 16 bytes for AES
const SALT_LENGTH = 64; // 64 bytes for salt
const TAG_LENGTH = 16; // 16 bytes for GCM tag
const KEY_LENGTH = 32; // 32 bytes for AES-256

/**
 * Get encryption key from environment variable
 * In production, use a proper key management system (KMS)
 */
function getEncryptionKey() {
  const key = process.env.ENCRYPTION_KEY;
  if (!key) {
    throw new Error('ENCRYPTION_KEY environment variable is not set');
  }
  // Ensure key is 32 bytes (256 bits) for AES-256
  return crypto.scryptSync(key, 'salt', KEY_LENGTH);
}

/**
 * Encrypt data
 * @param {string|Buffer} plaintext - Data to encrypt
 * @returns {Buffer} Encrypted data with IV and tag prepended
 */
function encrypt(plaintext) {
  if (!plaintext) {
    return null;
  }

  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const text = typeof plaintext === 'string' ? Buffer.from(plaintext, 'utf8') : plaintext;
  
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  const tag = cipher.getAuthTag();
  
  // Prepend IV and tag to encrypted data
  return Buffer.concat([iv, tag, encrypted]);
}

/**
 * Decrypt data
 * @param {Buffer} encryptedData - Encrypted data with IV and tag
 * @returns {string} Decrypted plaintext
 */
function decrypt(encryptedData) {
  if (!encryptedData || !Buffer.isBuffer(encryptedData)) {
    return null;
  }

  const key = getEncryptionKey();
  
  // Extract IV, tag, and encrypted content
  const iv = encryptedData.slice(0, IV_LENGTH);
  const tag = encryptedData.slice(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = encryptedData.slice(IV_LENGTH + TAG_LENGTH);
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encrypted);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted.toString('utf8');
}

module.exports = {
  encrypt,
  decrypt,
};

