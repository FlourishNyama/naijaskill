import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
// IMPORT THE ENGINE
import { Providers } from "./providers"; 
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: 'Elitejob | Hire Verified Artisans in Nigeria',
  description: 'The safest way to hire plumbers, carpenters, and electricians in Lagos and Abuja. Verified by guarantors and secured with escrow.',
  openGraph: {
    title: 'Elitejob | Hire Verified Artisans in Nigeria',
    description: 'The safest way to hire plumbers, carpenters, and electricians. Verified by guarantors and secured with escrow.',
    url: 'https://elitejobinternational.com',
    siteName: 'EliteJob International',
    locale: 'en_NG',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* TURN THE ENGINE ON */}

        <Providers>
          {children}
          <Script 
          src="https://korablobstorage.blob.core.windows.net/modal-bucket/korapay-collections.min.js" 
          strategy="lazyOnload" 
        />
          <Footer />
        </Providers>
      </body>
    </html>
  );
}