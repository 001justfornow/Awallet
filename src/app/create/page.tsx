'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Lottie from "lottie-react";
import SUPERMAN from '../assets/SUPERMAN.json';
import PiggyBank from '../assets/PiggyBank.json';
import { createWallet } from '@/lib/api';
import MnemonicDisplay from '@/components/Mnemonic';
import {Copy, DoubleCheck} from 'iconoir-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

export default function CreatePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [topPadding, setTopPadding] = useState(50);
  const [isCopied, setIsCopied] = useState(false);
  const [wallet, setWallet] = useState<{ mnemonic: string }>({ mnemonic: "" });

  const isMobile = typeof navigator !== 'undefined'
    && /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (!tg) return;

    tg.ready();

    // calculate safe area top padding
    const topInset = tg.SafeAreaInset?.top ?? 0;
    const contentTopInset = tg.ContentSafeAreaInset?.top ?? 0;
    setTopPadding(topInset + contentTopInset + 20);

    const create = async () => {
      try {
        const walletData = await createWallet();
        // ensure mnemonic is space-separated
        const mnemonicStr = Array.isArray(walletData.mnemonic)
          ? walletData.mnemonic.join(' ')
          : walletData.mnemonic;
        setWallet({ mnemonic: mnemonicStr });
        setTimeout(() => {
        setLoading(false);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        toast.success("Wallet created successfully!");
        tg?.HapticFeedback.notificationOccurred('success');
        }, 1500);
      } catch (err) {
        tg.showAlert("Wallet creation error!");
      }
    };

    create();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black w-full">
        <Lottie animationData={PiggyBank} loop style={{ width: isMobile ? 150 : 200, height: isMobile ? 150 : 200 }} />
        <div className='flex flex-col items-center justify-center gap-2 py-2 px-4 bg-[#121212] rounded-[20px]'>
        <p className="text-white text-lg">Creating your wallet<span className="loading-dots ml-1" /></p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col items-center justify-start min-h-screen bg-black w-full"
      style={{ paddingTop: 'calc(var(--tg-content-safe-area-inset-top) + var(--tg-safe-area-inset-top) + 10px)' }}
    >
      <Lottie animationData={SUPERMAN} loop style={{ width: isMobile ? 150 : 200, height: isMobile ? 150 : 200 }} />
      <h1 className="text-[#FF7A26] text-2xl font-bold mt-4 text-center px-4">Wallet Created Successfully!</h1>
      <p className="text-red-500 text-center mt-2 px-2 bg-[#FF000020] rounded-xl p-1 font-semibold text-sm max-w-[90%]">
        Keep this phrase securely to restore your wallet. Don't share this with anyone else.
      </p>
      <p className="text-white text-center mt-2 px-4 max-w-[90%] font-semibold text-sm" onClick={() => {
          navigator.clipboard.writeText(wallet.mnemonic);
          setIsCopied(true);
          setTimeout(() => {
            setIsCopied(false);
          }, 2000);
          window.Telegram?.WebApp?.HapticFeedback.notificationOccurred('success');
        }}>
        {isCopied ? (
          <>Copied 
          <DoubleCheck className="inline-block mb-1 ml-1 cursor-pointer" />
          </>
        ) : (
          <>
            Copy To Clipboard <Copy className="inline-block mb-1 ml-1 cursor-pointer" />
          </>
        )}
      </p>
      <MnemonicDisplay mnemonicString={wallet.mnemonic} />
      <button
        onClick={() => router.push('/dashboard')}
        className="mt-8 mb-8 w-[75%] bg-[#FF7A26] hover:bg-[#e66b22] text-white font-bold py-3 px-6 rounded-full transition-colors duration-300"
      >
        Continue To Home
      </button>
    </div>
  );
}
