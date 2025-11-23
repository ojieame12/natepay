import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from '@/components/ui/Toast';
import "./globals.css";

const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: '--font-mono' });

export const metadata: Metadata = {
  title: {
    default: 'NatePay | Smart Payments for Africa',
    template: '%s | NatePay',
  },
  description: 'The Operating System for Independent Work.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=satoshi@400,500,700,900&display=swap" rel="stylesheet" />
        </head>
        <body className={`${jetbrains.variable} font-sans bg-alabaster text-ink-black antialiased`}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
