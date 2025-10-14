'use client';

import { useState, useEffect } from 'react';
import { decryptwallet } from '@/lib/api';
import { PlusCircle, SendDiagonal, Scanning, CoinsSwap } from 'iconoir-react';
import Tonlogo from '../assets/ton_symbol.png';

interface TokenPrices {
  rates: {
    [key: string]: {
      prices: {
        [key: string]: number;
      };
      diff_24h: {
        [key: string]: number;
      };
      diff_7d:{
        [key: string]: number;
      };
      diff_30d:{
        [key: string]: number;
      };
    };
  };
}

export default function HomePage() {
  const [Decrypt, setDecrypt] = useState<any>(null);
  const [maintoken, setMaintoken] = useState<TokenPrices>([] as unknown as TokenPrices);
  const [activeTab, setActiveTab] = useState('Balance');

  // Load data from Telegram CloudStorage
  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    const decryptwalletData = async () => {
      try {
        const result = await decryptwallet();
        setDecrypt(result);
      } catch (error) {
        console.error("Error decrypting wallet:", error);
      }
    };
    if(!Decrypt){ decryptwalletData(); }
  });

  const token_prices = async () => {
  try {
    const response = await fetch('https://tonapi.io/v2/rates?tokens=usdt,ton&currencies=ton,usd,rub,btc');
    const data = await response.json();
    // merge new data with previous state to avoid resetting
    setMaintoken(prev => ({ ...prev, ...data }));
  } catch (error) {
    console.error('Error fetching token prices:', error);
  }
};
  // Initial fetch
  useEffect(() => {
    token_prices();
  }, []);
  setInterval(token_prices, 5000); // 5000 ms = 5 seconds

  return (
    <div className="flex flex-col items-center justify-start bg-black text-white px-4 w-full overflow-x-hidden overflow-y-auto" 
      style={{ 
        paddingTop: 'calc(var(--tg-content-safe-area-inset-top) + var(--tg-safe-area-inset-top) + 10px)', 
        paddingBottom: 'calc(var(--tg-content-safe-area-inset-bottom) + var(--tg-safe-area-inset-bottom))' 
      }}>
        <div className="w-full max-w-md" style={{height: '200px', background: 'linear-gradient(125deg, #ff2e00 0%, #FF5726 70%)', borderRadius: '10px'}}></div>
        <div className="grid grid-cols-4 gap-[5px] mt-2 w-full max-w-md px-2 py-2">
          <div className="flex flex-col items-center justify-center bg-[#121212] rounded-[20px] py-2 px-2 text-sm"><PlusCircle style={{color: '#ff7526', width: '25px', height: '25px'}}/> Add</div>
          <div className="flex flex-col items-center justify-center bg-[#121212] rounded-[20px] py-2 px-2 text-sm"><SendDiagonal style={{color: '#ff7526', width: '25px', height: '25px'}}/> Send</div>
          <div className="flex flex-col items-center justify-center bg-[#121212] rounded-[20px] py-2 px-2 text-sm"><Scanning style={{color: '#ff7526', width: '25px', height: '25px'}}/> Scan</div>
          <div className="flex flex-col items-center justify-center bg-[#121212] rounded-[20px] py-2 px-2 text-sm"><CoinsSwap style={{color: '#ff7526', width: '25px', height: '25px'}}/> Swap</div>
        </div>

        <div className="relative w-[90%] max-w-md bg-[#121212] rounded-[20px] mt-2 mb-2 h-[40px] overflow-hidden">
          {/* Orange highlight behind */}
          <div 
            className="absolute h-[40px] rounded-[20px] z-0 transition-all duration-300"
            style={{
              width: '33%', // ✅ keeps it within container
              background: 'linear-gradient(125deg, #ff2e00 0%, #FF5726 70%)',
              left: activeTab === 'Balance' ? '0%' : activeTab === 'Activity' ? '33%' : '66%'
            }}
          ></div>

          {/* Tabs text */}
          <div className="relative flex flex-row items-center justify-evenly h-full z-10 text-white font-semibold">
            <div className="flex items-center justify-center w-[30%] h-full cursor-pointer" style={activeTab === 'Balance' ? {opacity: 1} : {opacity: 0.8}} onClick={() => setActiveTab('Balance')}>Balance</div>
            <div className="flex items-center justify-center w-[30%] h-full cursor-pointer" style={activeTab === 'Activity' ? {opacity: 1} : {opacity: 0.8}} onClick={() => setActiveTab('Activity')}>Activity</div>
            <div className="flex items-center justify-center w-[30%] h-full cursor-pointer" style={activeTab === 'NFTs' ? {opacity: 1} : {opacity: 0.8}} onClick={() => setActiveTab('NFTs')}>NFTs</div>
          </div>
        </div>

      {/*Balance Tab*/}
      <div className="flex w-full flex-col items-center justify-start mb-10" style={activeTab === 'Balance' ? {display: 'flex'} : {display: 'none'}}>
        <div className="w-full max-w-md flex flex-row items-center justify-between mt-2 bg-[#121212] rounded-[20px]">
          <div className="flex flex-row">
            <div>
              <img src={Tonlogo.src} alt="TON" style={{width: '45px', height: '45px', margin: '10px', borderRadius: '50%'}} />
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-lg font-bold">TON</div>
              <div className="text-sm text-gray-400">
                ${maintoken && maintoken.rates && maintoken.rates.TON && maintoken.rates.TON.prices
                  ? (maintoken.rates.TON.prices.USD).toFixed(2)
                  : '0.00'}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center text-right px-2.5">
            <div>{Decrypt ? (Decrypt.balance/1e9).toFixed(2) : '0.00'}{' '}<b>TON</b></div>
            <div className='text-gray-400 text-sm ml-auto'>
              ~${Decrypt && maintoken.rates ? (Decrypt.balance/1e9*maintoken.rates?.TON?.prices.USD).toFixed(2) : '0.00'}
            </div>
          </div>
        </div>
        <div className="w-full max-w-md flex flex-row items-center justify-between mt-2 bg-[#121212] rounded-[20px]">
          <div className="flex flex-row">
            <div>
              <img src="https://cache.tonapi.io/imgproxy/T3PB4s7oprNVaJkwqbGg54nexKE0zzKhcrPv8jcWYzU/rs:fill:200:200:1/g:no/aHR0cHM6Ly90ZXRoZXIudG8vaW1hZ2VzL2xvZ29DaXJjbGUucG5n.webp" alt="TON" style={{width: '45px', height: '45px', margin: '10px', borderRadius: '50%'}} />
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-lg font-bold">USDT</div>
              <div className="text-sm text-gray-400">
                $1
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center text-right px-2.5">
            <div>{Decrypt ? (Decrypt.balance/1e9).toFixed(2) : '0.00'}{' '}<b>USDT</b></div>
            <div className='text-gray-400 text-sm ml-auto'>
              ~${Decrypt ? (Decrypt.balance/1e9).toFixed(2) : '0.00'}
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}
