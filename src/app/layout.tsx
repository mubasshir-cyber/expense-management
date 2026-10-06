import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ExpenseProvider } from '../context/ExpenseContext';
import { Navbar } from '../components/Navbar';
import { BottomNav } from '../components/BottomNav';
import { TransactionModal } from '../components/TransactionModal';
import { SettingsModal } from '../components/SettingsModal';
import { AccountModal } from '../components/AccountModal';

export const metadata: Metadata = {
  title: 'SBI EXPENSE // BRIGHT BENTO FINANCIAL LEDGER',
  description: 'A vibrant, bright bento-styled personal finance and expense dashboard connected directly to Google Sheets.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Space+Grotesk:wght@500;600;700&family=JetBrains+Mono:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#f8fafc] text-slate-900 min-h-screen flex flex-col antialiased selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
        {/* Crisp Ambient Background Gradients */}
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(37,99,235,0.08),rgba(255,255,255,0))] z-0" />
        <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_40%_at_90%_90%,rgba(16,185,129,0.06),rgba(255,255,255,0))] z-0" />
        <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(to_right,#e2e8f040_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f040_1px,transparent_1px)] bg-[size:3rem_3rem] z-0" />

        <ExpenseProvider>
          <div className="relative z-10 flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1 max-w-[1400px] w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-28 md:pb-12">
              {children}
            </main>
            <BottomNav />
          </div>
          <TransactionModal />
          <SettingsModal />
          <AccountModal />
        </ExpenseProvider>
      </body>
    </html>
  );
}
