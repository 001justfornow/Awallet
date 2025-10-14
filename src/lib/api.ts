import { TonClient, WalletContractV4 } from "@ton/ton";
import { mnemonicNew, mnemonicToWalletKey } from "@ton/crypto";
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { encryptMnemonic } from "./encrypt";
import CryptoJS from "crypto-js";

export async function createWallet() {
  const endpoint = await getHttpEndpoint();
  const client = new TonClient({ endpoint });

  const mnemonic = await mnemonicNew();
  const keyPair = await mnemonicToWalletKey(mnemonic); // wallet-ready keys

  const tg = window.Telegram?.WebApp;
  const user_hash = tg?.initDataUnsafe?.hash || "default_hash";

  const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });

  const Encrypted_Key = await encryptMnemonic(mnemonic, user_hash);

  // Helper to save to CloudStorage
  const saveToCloud = async (key: string, value: any) =>
    new Promise<void>((resolve, reject) => {
      tg?.CloudStorage.setItem(key, value, (err: any) => {
        if (err) reject(err);
        else resolve();
      });
    });

  try {
    await saveToCloud("Encrypted_Key", Encrypted_Key);
    await saveToCloud("Last_Hash", user_hash);
  } catch (err) {
    console.error("CloudStorage error:", err);
  }

  return { mnemonic };
}

export async function decryptwallet() {
  const tg = window.Telegram?.WebApp;
  if (!tg) throw new Error("Telegram WebApp not found");  
  const Encrypted_Keys = await new Promise<string | null>((resolve) => {
    tg.CloudStorage.getItem("Encrypted_Key", (err: any, data: any) => {
      if (err) return resolve(null);
      resolve(data);
    });
  });
  const Last_Hash = await new Promise<string | null>((resolve) => {
    tg.CloudStorage.getItem("Last_Hash", (err: any, data: any) => {
      if (err) return resolve(null);
      resolve(data);
    });
  });

  if (!Encrypted_Keys) throw new Error("No Encrypted_Key found in CloudStorage");
  if (!Last_Hash) throw new Error("No Last_Hash found in CloudStorage");

  // 🔧 FIX: Remove wrapping quotes if present
  let cleanEnc = Encrypted_Keys.trim();
  if (cleanEnc.startsWith('"') && cleanEnc.endsWith('"')) {
    cleanEnc = cleanEnc.slice(1, -1);
  }
  let cleanOldHash = Last_Hash.trim();
  if (cleanOldHash.startsWith('"') && cleanOldHash.endsWith('"')) {
    cleanOldHash = cleanOldHash.slice(1, -1);
  }

  const decryptedBytes = CryptoJS.AES.decrypt(cleanEnc, cleanOldHash);
  const decryptedText = decryptedBytes.toString(CryptoJS.enc.Utf8);
  
  if (!decryptedText) {
    throw new Error("Decryption failed: empty or malformed result");
  }
  const mnemonicArray = JSON.parse(decryptedText); // now it's an array
  const keyPair = await mnemonicToWalletKey(mnemonicArray); // wallet-ready keys
  const client = new TonClient({endpoint: 'https://toncenter.com/api/v2/jsonRPC',});
  // Create wallet contract
  let workchain = 0; // Usually you need a workchain 0
  let wallet = WalletContractV4.create({ workchain, publicKey: keyPair.publicKey });
  let contract = client.open(wallet);

  // Get balance
  let balance: bigint = await contract.getBalance();
  const address = wallet.address.toString();
  const address_nonbounce = wallet.address.toString({ bounceable: false });

  return { mnemonicArray, address, address_nonbounce, balance: balance.toString() };
}