import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';

const geistSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "A-Wallet",
  description: "The Next-Gen Ton-based Wallet",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
      <script src="https://telegram.org/js/telegram-web-app.js?59"></script>
      </head>
      <body
        className={`${geistSans.variable} antialiased flex justify-center width-screen min-h-screen bg-black`}
      ><div className="flex w-[100dvw] max-w-[610px]">
        {children}
        <Toaster
            richColors
            position="top-center"
            theme="dark"
            toastOptions={{
              style: {
                background: '#121212',
                color: 'white',
                border: '1px solid #333',
                marginTop: 'calc(var(--tg-content-safe-area-inset-top) + var(--tg-safe-area-inset-top) + 10px)'
              },
            }}
          />
        </div>
      </body>
    </html>
  );
}
