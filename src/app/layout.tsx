import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from '@/components/ui/Toast';
import "./globals.css";

const nunito = Nunito({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: 'Quote Cards | Professional Quotes for Freelancers',
    template: '%s | Quote Cards',
  },
  description: 'Create beautiful, interactive quotes that win more clients. The Duolingo for freelancing.',
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
        <body className={nunito.className}>
          {children}
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
