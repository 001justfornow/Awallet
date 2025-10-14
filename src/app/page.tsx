'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import logo from './assets/logo.png'; // your logo image
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Lottie from 'lottie-react';
import YOGA from './assets/YOGA.json';
import { update_hash } from '@/lib/encrypt';

// Extend Window interface for Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        requestFullscreen: () => void;
        disableVerticalSwipes: () => void;
        showAlert: (message: string) => void;
        HapticFeedback: {
          impactOccurred: () => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        }
        SafeAreaInset?: { top: number; bottom: number; left: number; right: number; };
        ContentSafeAreaInset?: { top: number; bottom: number; left: number; right: number; };
        isExpanded?: boolean;
        expand?: () => void;
        close?: () => void;
        CloudStorage: {
          setItem: (key: string, value: string, callback: (err: any) => void) => void;
          getItem: (key: string, callback: (err: any, value: string) => void) => void;
          removeItem: (key: string, callback: (err: any) => void) => void;
          clear: (callback: (err: any) => void) => void;
          getKeys: (callback: (err: any, keys: string[]) => void) => void;
        };
        initDataUnsafe?: {
          query_id?: string;
          user?: { id?: number; first_name?: string; last_name?: string; username?: string; language_code?: string; hash?: string; };
          auth_date?: number;
          chat?: { id?: number; type?: string; title?: string; username?: string; first_name?: string; last_name?: string; };
          start_param?: string;
          can_send_after?: number;
          receiver?: string;
          hash?: string;
        };
      };
    };
  }
}

export default function HomePage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(true);
  const isMobile = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

useEffect(() => {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
    setTimeout(() => {
      tg.disableVerticalSwipes();
      if (isMobile) tg.requestFullscreen();
    }, 100);
  }

  tg?.CloudStorage.getItem("Encrypted_Key", async (err: any, val: string) => {
    if (err) {
      console.error("Error accessing CloudStorage:", err);
      return;
    }

    if (val) {
      try {
        const result = await update_hash();
        if(result === "success"){
          router.push('/dashboard');
          setLoading(false);
        } else {
          alert("Hash update failed: " + result);
          setLoading(false);
        }
      } catch (e) {
        console.error("Error updating hash:", e);
        alert("Error updating hash: " + e);
      }
    } else {
      alert("No Encrypted_Key found in CloudStorage");
      setLoading(false);
    }
  });
}, []);


  const handleCreate = () => {
    if (!agreed) return;
    const interstitial_loader = document.getElementById('interstitial-loader');
    if (interstitial_loader) {
      interstitial_loader.style.display = 'flex';
    }
    router.push('/create');
  };

  const handleImport = () => {
    if (!agreed) return;
    const interstitial_loader = document.getElementById('interstitial-loader');
    if (interstitial_loader) {
      interstitial_loader.style.display = 'flex';
    }
    router.push('/import');
  };

  if(loading){
    return(
      <div className="flex flex-col items-center justify-center min-h-screen bg-black w-full">
        <Lottie animationData={YOGA} loop style={{ width: isMobile ? 150 : 200, height: isMobile ? 150 : 200 }} />
        <div className="text-white text-lg mt-4 flex flex-row items-center h-150px">Loading...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-black text-white px-6 py-10 w-[100%]">
      <div className="flex flex-col items-center gap-3 mt-16 text-center">
        <Image
          src={logo}
          alt="A-Wallet Logo"
          width={120}
          height={120}
          className="rounded-2xl"
          style={{border: '4px solid #FF7A2650'}}
        />
        <h1 className="text-3xl font-bold mt-4">A Wallet</h1>
        <p className="text-gray-400 text-md font-semibold mt-0 max-w-xs">
          Pay with a tap, anywhere, anytime.
        </p>
      </div>

      <div className="flex flex-col items-center w-full mt-auto mb-10">
        <label className="flex items-center gap-2 text-sm text-gray-300 mb-6">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="accent-orange-500 w-4 h-4"
          />
          I agree to{' '}
          <Link href="#" className="text-[#FF7A26] hover:underline">
            use the wallet responsibly
          </Link>
        </label>

        <button
          onClick={handleCreate}
          disabled={!agreed}
          className={`w-80 py-3 rounded-xl font-semibold transition-all ${
            agreed
              ? 'bg-orange-600 hover:bg-orange-700'
              : 'bg-[#FF7A2650] text-gray-400 cursor-not-allowed'
          }`}
        >
          Create New Wallet
        </button>

        <button
          onClick={handleImport}
          disabled={!agreed}
          className="mt-3 text-orange-400 text-sm hover:underline disabled:text-gray-600"
        >
          Import Existing Wallet
        </button>
      </div>
      <div id='interstitial-loader' style={{width: '100%', display: 'none', justifyContent: 'center', alignItems: 'center', height: '100%', zIndex: 5, position: 'absolute', top: 0, left: 0, background: '#00000050', backdropFilter: 'blur(3px)'}}>
        <div style={{width: '65px', height: '65px', background: '#2c2c2c', borderRadius: '25%', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <div className="loader"></div>
        </div>
      </div>
    </div>
  );
}
