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
    default: 'NX-Design — Design your system. Then watch it come to life.',
    template: '%s | NX-Design',
  },
  description:
    'Drop in servers, databases, and APIs. Connect the dots. Watch data flow through your design in real time. No setup, no jargon — just build.',
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
    title: 'NX-Design — Design your system. Then watch it come to life.',
    description:
      'Drop in components, connect the pieces, watch it come alive. Free to start, no setup required.',
    url: 'https://nxdesign.app',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@nxdesignapp',
    title: 'NX-Design — Design your system. Then watch it come to life.',
    description:
      'Drop in components, connect the pieces, watch it come alive. Free to start, no setup required.',
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
