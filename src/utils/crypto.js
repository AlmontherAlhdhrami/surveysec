const CRYPTO_ALGORITHM = 'AES-GCM';
const KEY_DERIVATION_ALGORITHM = 'PBKDF2';

// Generate unique user-specific key
export async function generateUserKey(userId, password) {
  const encoder = new TextEncoder();
  const salt = encoder.encode(userId + '-salt'); // User-specific salt
  
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: KEY_DERIVATION_ALGORITHM,
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: CRYPTO_ALGORITHM, length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

// Encrypt data
export async function encryptData(data, key) {
  const encoder = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const encryptedContent = await window.crypto.subtle.encrypt(
    {
      name: CRYPTO_ALGORITHM,
      iv: iv
    },
    key,
    encoder.encode(data)
  );

  return {
    iv: Array.from(iv),
    content: Array.from(new Uint8Array(encryptedContent))
  };
}

// Decrypt data
export async function decryptData(encryptedData, key) {
  const decoder = new TextDecoder();
  const iv = new Uint8Array(encryptedData.iv);
  
  const decryptedContent = await window.crypto.subtle.decrypt(
    {
      name: CRYPTO_ALGORITHM,
      iv: iv
    },
    key,
    new Uint8Array(encryptedData.content)
  );

  return decoder.decode(decryptedContent);
}

// Generate initialization vector
export function generateIV() {
  return window.crypto.getRandomValues(new Uint8Array(12));
}