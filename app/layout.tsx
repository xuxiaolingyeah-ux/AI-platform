import type { Metadata } from 'next';
import './globals.css';
import AppProviders from './providers';

export const metadata: Metadata = {
  title: 'Oceanus',
  description: '从想法到 PRD，一站式 AI 协作',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="h-full flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
