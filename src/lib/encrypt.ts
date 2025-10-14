import CryptoJS from "crypto-js";

/**
 * Encrypts a JSON object (like your 24-word array) using a string password
 * Returns a Base64 string compatible with CryptoJS default AES encryption
 */
export function encryptMnemonic(obj: any, password: string): string {
  const jsonStr = JSON.stringify(obj);
  const encrypted = CryptoJS.AES.encrypt(jsonStr, password);
  return encrypted.toString();
}

/**
 * Decrypts a Base64 string back to the original object/array
 * Returns the object/array or throws an error if decryption fails
 */
export function decryptMnemonic(encryptedData1 : any, password : string) {
  let encryptedData: string;
  if (encryptedData1.startsWith('\"') && encryptedData1.endsWith('\"')) {
  encryptedData = encryptedData1.slice(1, -1); // remove \"
} else {
  encryptedData = encryptedData1;
}

  try {
    // Sanitize inputs
    const cleanCipher = decodeURIComponent(String(encryptedData).trim());
    const cleanPassword = String(password).trim();

    const decrypted = CryptoJS.AES.decrypt(cleanCipher, cleanPassword);
    const str = decrypted.toString(CryptoJS.enc.Utf8);

    if (!str) throw new Error("Empty decryption result");
    return str;

  } catch (err) {
    console.error("Decryption failed:", err);
    return err;
  }
}

export async function update_hash() {
  const tg = window.Telegram?.WebApp;
  if (!tg) throw new Error("Telegram WebApp not found");

  const new_hash = tg.initDataUnsafe?.hash || "";
  const old_hash = await new Promise<string | null>((resolve) => {
    tg.CloudStorage.getItem("Last_Hash", (err: any, data: any) => {
      if (err) return resolve(null);
      resolve(data);
    });
  });

  const Encrypted_Keys = await new Promise<string | null>((resolve) => {
    tg.CloudStorage.getItem("Encrypted_Key", (err: any, data: any) => {
      if (err) return resolve(null);
      resolve(data);
    });
  });

  if (!Encrypted_Keys) throw new Error("No Encrypted_Key found in CloudStorage");
  if (!old_hash) throw new Error("No Last_Hash found in CloudStorage");
  if (new_hash === old_hash) return "success";

  // 🔧 FIX: Remove wrapping quotes if present
  let cleanEnc = Encrypted_Keys.trim();
  if (cleanEnc.startsWith('"') && cleanEnc.endsWith('"')) {
    cleanEnc = cleanEnc.slice(1, -1);
  }
  let cleanOldHash = old_hash.trim();
  if (cleanOldHash.startsWith('"') && cleanOldHash.endsWith('"')) {
    cleanOldHash = cleanOldHash.slice(1, -1);
  }

  console.log("Decrypting using key:", old_hash);
  console.log("Cleaned encrypted data:", cleanEnc.substring(0, 30) + "...");

  const decryptedBytes = CryptoJS.AES.decrypt(cleanEnc, cleanOldHash);
  const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);

  if (!decryptedText) {
    throw new Error("Decryption failed: empty or malformed result");
  }
  const mnemonicArray = JSON.parse(decryptedText); // now it's an array
  const new_Encryption = encryptMnemonic(mnemonicArray, new_hash);
  await new Promise<void>((resolve, reject) => {
    tg.CloudStorage.setItem("Encrypted_Key", new_Encryption, (err: any) => {
      if (err) return reject(err);
      resolve();
    });
  });
  await new Promise<void>((resolve, reject) => {
    tg.CloudStorage.setItem("Last_Hash", new_hash, (err: any) => {
      if (err) return reject(err);
      resolve();
    });
  });
  console.log("✅ Decrypted successfully:", decryptedText);
  return "success";
}
