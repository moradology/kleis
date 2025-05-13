'use client';

import React, { useState } from 'react';
import { Menu, X, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Products', href: '/products' },
  { label: 'About', href: '/about' },
  { label: 'Contact Us', href: '/contact' },
  // Add more items as needed
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center text-2xl font-bold text-navy">
          <img src="/logo.svg" alt="Kleis Scientific Logo" className="h-8 w-[25px] rounded-sm" loading="eager"/>
          <span>KLEIS</span>
        </a>

        {/* Desktop Navigation & Contact Button Wrapper */}
        {/* Wrap nav and button, keep hidden on mobile */}
        <div className="hidden md:flex items-center gap-6">
          {/* Desktop Navigation Links */}
          <nav className="flex gap-4">
            {NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-lg font-medium text-foreground hover:text-primary hover:bg-muted/10 px-3 py-1 rounded-md transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>


        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileMenu}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu (Collapsible) */}
      <div
        className={cn(
          'md:hidden overflow-hidden transition-all duration-300 ease-in-out',
          isMobileMenuOpen ? 'max-h-screen border-t border-border' : 'max-h-0'
        )}
      >
        <nav className="flex flex-col px-2 pt-2 pb-4 gap-1">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="block text-lg font-medium text-foreground hover:text-primary hover:bg-muted/10 px-3 py-2 rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <a
            href="/contact"
            className="mt-2 flex items-center justify-center bg-background text-foreground font-bold border border-border rounded-md px-4 py-1 text-lg hover:bg-muted/10 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Contact Us
            <Mail className="ml-2 h-4 w-4 text-[#A4F600]" />
          </a>
          {/* Optional: Add mobile Sign In/Sign Up */}
          {/* <div className="flex flex-col gap-3 pt-4 border-t border-border">
             <Button variant="outline" asChild>
               <a href="/signin">Sign In</a>
             </Button>
             <Button asChild>
               <a href="/signup">Sign Up</a>
             </Button>
           </div> */}
        </nav>
      </div>
    </header>
  );
}