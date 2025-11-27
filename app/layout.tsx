import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// IMPORT THE ENGINE
import { Providers } from "./providers"; 
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NaijaSkill",
  description: "Hire expert artisans in Nigeria",
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
          <Footer />
        </Providers>
      </body>
    </html>
  );
}