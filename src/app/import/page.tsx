'use client';
import { useState } from 'react';
import { mnemonicToWalletKey, mnemonicValidate } from '@ton/crypto';
import { WalletContractV4, TonClient } from '@ton/ton';
import { useRouter } from 'next/navigation';
import {toast} from 'sonner';
import confetti from 'canvas-confetti';
import { Copy } from 'iconoir-react';
import Restore from '../assets/Restore.json';
import Lottie from 'lottie-react';
import { encryptMnemonic } from "@/lib/encrypt";

export default function ImportWallet() {
  const [mnemonics, setMnemonics] = useState<string[]>(Array(24).fill(''));
  const router = useRouter();

  const handleChange = (index: number, value: string) => {
    const words = value.trim().split(/\s+/);
    if (words.length > 1 && index === 0 && words.length <= 24) {
      const updated = Array(24).fill('').map((_, i) => words[i] || '');
      setMnemonics(updated);
    } else {
      const updated = [...mnemonics];
      updated[index] = value;
      setMnemonics(updated);
    }
  };

  const handleImport = async () => {
    const phrase = mnemonics.map(w => w.trim()).filter(Boolean);

    if (phrase.length !== 24) {
      alert('Please enter all 24 words.');
      return;
    }

    const valid = await mnemonicValidate(phrase);
    if (!valid) {
      alert('Invalid mnemonic phrase!');
      return;
    }

    try {
      const keyPair = await mnemonicToWalletKey(phrase);
      const wallet = WalletContractV4.create({ workchain: 0, publicKey: keyPair.publicKey });

      const client = new TonClient({ endpoint: 'https://toncenter.com/api/v2/jsonRPC' });
      const state = await client.getContractState(wallet.address);

      if (!state?.state) {
        alert('No wallet exists for this seed phrase.');
        return;
      }

      const tg = window.Telegram?.WebApp;
      const Encrypted_Key = await encryptMnemonic(phrase, tg?.initDataUnsafe?.hash || "default_hash");
      // Helper to save to CloudStorage
        const saveToCloud = async (key: string, value: any) =>
        new Promise<void>((resolve, reject) => {
            tg?.CloudStorage.setItem(key, JSON.stringify(value), (err: any) => {
                if (err) reject(err);
                else resolve();
            });
        });

        try {
            await saveToCloud("Encrypted_Key", Encrypted_Key);
            await saveToCloud("Last_Hash", tg?.initDataUnsafe?.hash || "default_hash");
            toast.success("Wallet imported successfully!");
            tg?.HapticFeedback.notificationOccurred('success');
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.7 } });
            router.push('/dashboard');
        } catch (err) {
            console.error("CloudStorage error:", err);
        }
    } catch (err) {
      console.error(err);
      alert('Failed to import wallet. Please check your phrase.');
    }
  };

  return (
    <div className="p-6 text-white bg-black w-full min-h-screen flex flex-col items-center justify-center" style={{ paddingTop: 'calc(var(--tg-content-safe-area-inset-top) + var(--tg-safe-area-inset-top))' }}>
        <Lottie animationData={Restore} loop style={{ width: 180, height: 180 }} />
      <h2 className="text-[#FF7A26] text-2xl font-bold mb-1 text-center">Enter Secret Words</h2>
      <p className="text-sm mt-2 text-center text-[#ffffff70] font-semibold w-[90%] mb-4">You can restore your wallet by entering the <b style={{fontWeight: '750', fontSize: '16px'}}>24 secret words</b> that you wrote down when creating wallet.</p>
      <div className="grid grid-cols-2 gap-4">
        {[0, 1].map(col => (
          <div key={col} className="flex flex-col gap-2">
            {mnemonics.slice(col * 12, col * 12 + 12).map((word, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="text"
                  value={word}
                  onChange={e => handleChange(col * 12 + i, e.target.value)}
                  placeholder={`Word ${col * 12 + i + 1}`}
                 className="bg-[#121212] p-2 rounded-lg w-[150px] border-2 border-transparent focus:border-[#FF5726] focus:outline-none focus:ring-0 transition-colors duration-150 text-center text-white"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
      <button
        onClick={handleImport}
        className="mt-8 mb-8 w-[75%] bg-[#FF7A26] hover:bg-[#e66b22] text-white font-bold py-3 px-6 rounded-full transition-colors duration-300"
      >
        Import Wallet
      </button>
    </div>
  );
}
