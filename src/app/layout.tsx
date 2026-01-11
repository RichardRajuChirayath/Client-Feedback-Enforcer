// app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',           // honest name
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
  preload: true,
});

export const metadata: Metadata = {
  title: 'Client Feedback Enforcer',
  description: 'Never miss client feedback again. AI-powered enforcement for design agencies.',
  keywords: ['client feedback', 'design agency', 'feedback management', 'AI compliance'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body
        className={`
          bg-[#02040a]
          text-slate-50
          antialiased
          selection:bg-indigo-500/30
          selection:text-white
          min-h-screen
        `}
      >
        {children}
      </body>
    </html>
  );
}