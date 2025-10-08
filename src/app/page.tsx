'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import logo from './assets/logo.png'; // your logo image
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);

  const handleCreate = () => {
    if (!agreed) return;
    router.push('/dashboard');
  };

  const handleImport = () => {
    if (!agreed) return;
    router.push('/import');
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-screen bg-black text-white px-6 py-10">
      <div className="flex flex-col items-center gap-3 mt-16 text-center">
        <Image
          src={logo}
          alt="MyTonWallet Logo"
          width={120}
          height={120}
          className="rounded-2xl"
          style={{border: '4px solid #FF7A2650'}}
        />
        <h1 className="text-3xl font-semibold mt-4">A Wallet</h1>
        <p className="text-gray-400 text-sm mt-2 max-w-xs">
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
    </div>
  );
}
