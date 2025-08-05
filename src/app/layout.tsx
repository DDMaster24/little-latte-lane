import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClientWrapper } from './ClientWrapper';
import Header from './Header'; // Correct import for Header component
import FooterSection from './FooterSection'; // Correct import for FooterSection component

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Little Latte Lane',
  description: 'Food ordering and booking for estate residents',
  manifest: '/manifest.json',
  themeColor: '#0f0f0f',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  icons: {
    icon: '/icons/icon-192.png',
    apple: '/icons/icon-192.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gradient-to-br from-gray-900 to-black text-white min-h-screen flex flex-col`}>
        <ClientWrapper>
          <Header />
          <main className="flex-grow">
            {children}
          </main>
          <FooterSection />
        </ClientWrapper>
      </body>
    </html>
  );
}