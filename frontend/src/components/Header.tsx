'use client';

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button'; // Assuming Button component exists
import { cn } from '@/lib/utils'; // Assuming cn utility exists

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Products', href: '/products' },
  { label: 'About', href: '/about' },
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
        {/* Logo */}
        <a href="/" className="text-2xl font-bold text-navy">
          KLEIS
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-4"> {/* Adjusted gap slightly */}
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-lg font-medium text-foreground hover:text-primary hover:bg-muted/10 px-3 py-1 rounded-md transition-colors" // Added hover:bg-muted/10, padding, and rounded-md
            >
              {item.label}
            </a>
          ))}
        </nav>

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
        <nav className="flex flex-col px-2 pt-2 pb-4 gap-1"> {/* Adjusted padding and gap */}
          {NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="block text-lg font-medium text-foreground hover:text-primary hover:bg-muted/10 px-3 py-2 rounded-md transition-colors" // Added hover:bg-muted/10, padding, and rounded-md
              onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
            >
              {item.label}
            </a>
          ))}
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