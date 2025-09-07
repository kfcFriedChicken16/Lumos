import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '@excalidraw/excalidraw/index.css';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { CreditProvider } from '@/contexts/CreditContext';
import { PreferencesProvider } from '@/contexts/PreferencesContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lumos - AI Tutoring Platform',
  description: 'Instant, affordable tutoring support for Malaysian students',
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.svg',
    apple: '/icons/apple-touch-icon-180.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563eb',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <CreditProvider>
            <PreferencesProvider>
              {children}
            </PreferencesProvider>
          </CreditProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
