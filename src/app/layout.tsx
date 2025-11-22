import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: '葬送のフリーレン | Frieren',
  description: '千年を生きるエルフの魔法使い、フリーレンの物語を3Dで体験',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-[#050508]`}>
        {children}
      </body>
    </html>
  );
}
