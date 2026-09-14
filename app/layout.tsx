import './globals.css';
import type { Metadata } from 'next';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'offset.io — Personal Carbon Intelligence & Reduction Platform',
  description: 'Empirical carbon accounting framework, real-time lifestyle telemetry, dynamic trajectory simulation, and budget-constrained reduction optimization.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Work+Sans:wght@400;500;600;700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex flex-col min-h-screen bg-surface-container-lowest text-on-surface antialiased font-body">
        <Navbar />
        <div className="flex-1 w-full pt-14">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
