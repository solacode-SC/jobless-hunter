import type { Metadata } from 'next';
import './globals.css';
import { SketchProvider } from '@/components/providers/sketch-provider';

export const metadata: Metadata = {
  title: 'Jobless Hunter — 24/7 Autonomous AI Job Agent',
  description: 'Digital sketchbook dashboard for Solayman El Mouden: 24/7 autonomous job discovery, intelligent CV tailoring, and recruiter pipeline agent.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full flex flex-col bg-[#FAFAF5] text-[#111111]">
        <SketchProvider>{children}</SketchProvider>
      </body>
    </html>
  );
}
