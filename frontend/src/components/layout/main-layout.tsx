'use client';

import React from 'react';
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function MainLayout({
  children,
  title,
  description,
  onRefresh,
  isRefreshing,
}: MainLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-indigo-500 selection:text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={title}
          description={description}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
        />
        <main className="flex-1 p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}

