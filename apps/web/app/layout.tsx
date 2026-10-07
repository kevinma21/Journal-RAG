import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  title: {
    template: '%s | JournalPilot',
    default: 'JournalPilot',
  },
  description: "Your personal memory workspace.",
  icons: {
    icon: [
      { url: '/icon/icon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/icon/icon-64.png', type: 'image/png', sizes: '64x64' },
      { url: '/icon/icon-128.png', type: 'image/png', sizes: '128x128' },
    ],
    shortcut: '/icon/icon-32.png',
    apple: [
      { url: '/icon/icon-256.png', type: 'image/png', sizes: '256x256' },
    ]
  }
};

export default function RootLayout({ 
  children 
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={inter.variable}
    >
      <body className="min-h-screen bg-bg-base text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
