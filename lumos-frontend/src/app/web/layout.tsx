// Web Layout
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import WebSidebar from '../../components/WebSidebar';
import LayoutContent from '../../components/LayoutContent';
import { TimebankProvider } from '../../contexts/TimebankContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Lumos - AI Tutoring Platform',
  description: 'Instant, affordable tutoring support for Malaysian students',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563eb',
};

export default function WebLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <TimebankProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {/* Sidebar */}
        <WebSidebar />

        {/* Main Content */}
        <LayoutContent>
          {children}
        </LayoutContent>
      </div>
    </TimebankProvider>
  );
}