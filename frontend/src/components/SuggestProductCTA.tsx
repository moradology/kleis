'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface SuggestProductCTAProps {
  onOpenModal: () => void;
}

const SuggestProductCTA: React.FC<SuggestProductCTAProps> = ({ onOpenModal }) => {
  return (
    <div className="mt-8 text-center p-6 border border-dashed border-border rounded-lg bg-muted/30">
      <h3 className="text-xl font-semibold text-navy mb-2">
        Don’t see what you need?
      </h3>
      <p className="text-foreground/80 mb-4 max-w-md mx-auto">
        Let us know if there's a specific research compound you're looking for. We're always looking to expand our catalog based on researcher needs.
      </p>
      <Button
        onClick={onOpenModal}
        className="bg-lime text-navy hover:bg-[#94DD00]"
        size="lg"
      >
        Suggest a Product
      </Button>
    </div>
  );
};

export default SuggestProductCTA;