'use client';

import React from 'react';

const Logo = (_props: React.SVGProps<SVGSVGElement>) => {
  return (
    <a href="/" className="flex items-center text-2xl font-bold text-navy">
      <img src="/logo.svg" alt="Kleis Scientific Logo" className="h-8 w-auto" />
      <span>KLEIS</span>
    </a>
  );
};

export default function Footer() {
  return (
    <footer className="bg-muted text-muted-foreground">
      <div className="container mx-auto max-w-6xl px-4 py-4">
        <div className="flex flex-col items-center gap-2">
          <Logo />
          <p className="text-center text-sm text-white">
            &copy; {new Date().getFullYear()} Kleis Scientific. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}