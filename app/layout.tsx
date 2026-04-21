import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Script from "next/script";
// IMPORT THE ENGINE
import { Providers } from "./providers";
import Footer from '@/components/Footer';
import { ToastProvider } from '@/components/ToastProvider';
import { OneSignalProvider } from '@/components/OneSignalProvider';
import RecommendationPrompt from '@/components/RecommendationPrompt';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: 'Elite Job | Hire Verified Skilled Workers in Nigeria', 
  description: 'The safest way to hire plumbers, carpenters, and electricians. Elite Job connects you with verified artisans in Lagos and Abuja.',
  keywords: ['Elite Job', 'Elitejob', 'Elite', 'Elite International', 'Artisans Nigeria', 'NaijaSkill'],
  openGraph: {
    title: 'Elite Job | Hire Verified Skilled Workers',
    description: 'Find verified plumbers and electricians near you.',
    url: 'https://elitejobinternational.com',
    siteName: 'Elite Job',
    locale: 'en_NG',
    type: 'website',
  },
}

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
          <ToastProvider>
            <OneSignalProvider />
            <RecommendationPrompt />
            {children}
            <Script
              src="https://korablobstorage.blob.core.windows.net/modal-bucket/korapay-collections.min.js"
              strategy="lazyOnload"
            />
            <Script
              src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
              strategy="lazyOnload"
              defer
            />
            <Footer />
          </ToastProvider>
        </Providers>
      </body>
    </html>
  );
}