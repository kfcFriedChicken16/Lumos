"use client";

import { usePathname } from 'next/navigation';

interface LayoutContentProps {
  children: React.ReactNode;
}

export default function LayoutContent({ children }: LayoutContentProps) {
  const pathname = usePathname();
  const isDashboardPage = pathname === '/web/dashboard';

  return (
    <div className={isDashboardPage ? 'ml-64' : ''}>
      {children}
    </div>
  );
}
