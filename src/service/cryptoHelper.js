import CryptoJS from "crypto-js";

const key = CryptoJS.enc.Hex.parse(import.meta.env.VITE_AES_KEY);
const iv = CryptoJS.enc.Hex.parse(import.meta.env.VITE_AES_IV);


export function encrypt(text) {
  const encrypted = CryptoJS.AES.encrypt(text, key, { iv: iv });
  return encrypted.toString();
}

export function decrypt(encryptedText) {
  const decrypted = CryptoJS.AES.decrypt(encryptedText, key, { iv: iv });
  return decrypted.toString(CryptoJS.enc.Utf8);
}
