'use client';

import React, { useState } from 'react';
import { Menu, X, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
}

// Updated NAV_ITEMS to MAIN_NAV_ITEMS for clarity
const MAIN_NAV_ITEMS: NavItem[] = [
  { label: 'Products', href: '/products' },
  { label: 'About', href: '/about' },
  // "Contact Us" will be added specifically for desktop nav and mobile button
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0); // Example item count

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center text-2xl font-bold text-primary"> {/* text-navy changed to text-primary */}
          <img src="/logo.svg" alt="Kleis Scientific Logo" className="h-8 w-auto rounded-sm" loading="eager"/> {/* w-[25px] changed to w-auto */}
          <span className="ml-2">KLEIS</span> {/* Added ml-2 to match user example */}
        </a>

        {/* Desktop Navigation & Cart */}
        <nav className="hidden md:flex items-center gap-8">
          {MAIN_NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-lg font-medium text-foreground hover:text-primary/70 transition-colors"
            >
              {item.label}
            </a>
          ))}
          <a
            href="/contact"
            className="text-lg font-medium text-foreground hover:text-primary/70 transition-colors pr-1" // pr-1 for visual balance
          >
            Contact&nbsp;Us
          </a>
          {/* Desktop Cart Button */}
          <a
            href="/cart"
            className="relative flex items-center justify-center rounded-md p-2 hover:bg-border/20 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-primary"
            aria-label="View shopping cart"
          >
            {/* Inlined SVG for cart icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] rounded-full bg-lime text-[10px] font-semibold flex items-center justify-center text-navy">
                {cartItemCount}
              </span>
            )}
          </a>
        </nav>

        {/* Mobile Controls: Cart Icon + Menu Button */}
        <div className="md:hidden flex items-center gap-2 sm:gap-4">
          {/* Mobile Cart Button */}
          <a
            href="/cart"
            className="relative flex items-center justify-center rounded-md p-2 hover:bg-border/20 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-primary"
            aria-label="View shopping cart"
          >
            {/* Inlined SVG for cart icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5 sm:h-4 sm:w-4"
              aria-hidden="true"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] rounded-full bg-lime text-[10px] font-semibold flex items-center justify-center text-navy">
                {cartItemCount}
              </span>
            )}
          </a>
          {/* Mobile Menu Button */}
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
          {MAIN_NAV_ITEMS.map((item) => (
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
            <Mail className="ml-2 h-4 w-4 text-lime" /> {/* text-[#A4F600] changed to text-lime */}
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