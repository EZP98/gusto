import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}
