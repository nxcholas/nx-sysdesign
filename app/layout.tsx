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
  metadataBase: new URL('https://nxdesign.app'),
  applicationName: 'NX-Design',
  title: {
    default: 'NX-Design — Visualize System Architecture in Your Browser',
    template: '%s | NX-Design',
  },
  description:
    'Drag-and-drop system design canvas with 100+ components, ERD tables, and live animated data-flow connections. Free to start, diagrams saved to the cloud.',
  keywords: [
    'system design',
    'architecture diagram',
    'ERD',
    'data flow',
    'drag and drop',
    'software architecture',
    'cloud diagram',
    'browser tool',
    'system design tool',
    'network diagram',
  ],
  authors: [{ name: 'NX-Design' }],
  creator: 'NX-Design',
  publisher: 'NX-Design',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  openGraph: {
    type: 'website',
    siteName: 'NX-Design',
    title: 'NX-Design — Visualize System Architecture in Your Browser',
    description:
      'Drag-and-drop canvas for system design with live animated data flow. 100+ components, ERD tables, no setup required.',
    url: 'https://nxdesign.app',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@nxdesignapp',
    title: 'NX-Design — System Design Visualizer',
    description:
      'Drag-and-drop canvas with 100+ components and live animated data-flow connections.',
  },
  icons: {
    icon: '/icon',
    apple: '/apple-icon',
  },
  manifest: '/manifest.json',
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
