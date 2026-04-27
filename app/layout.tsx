import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NX-Design — System Design Visualizer',
  description:
    'A drag-and-drop canvas for visualizing system design components, HTTP flows, and architecture diagrams.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-canvas-bg text-gray-100 font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
