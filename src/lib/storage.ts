import CryptoJS from "crypto-js";

const tg = (window as any).Telegram?.WebApp;

export async function saveToCloud(key: string, value: string) {
  return new Promise<void>((resolve, reject) => {
    tg?.CloudStorage?.setItem(key, value, (err: any) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

export async function getFromCloud(key: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    tg?.CloudStorage?.getItem(key, (err: any, val: string) => {
      if (err) reject(err);
      else resolve(val || null);
    });
  });
}

export function encrypt(data: string, pass: string) {
  return CryptoJS.AES.encrypt(data, pass).toString();
}

export function decrypt(data: string, pass: string) {
  try {
    const bytes = CryptoJS.AES.decrypt(data, pass);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch {
    return null;
  }
}
