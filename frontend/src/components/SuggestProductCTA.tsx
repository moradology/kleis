'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

interface SuggestProductCTAProps {
  onOpenModal: () => void;
}

const SuggestProductCTA: React.FC<SuggestProductCTAProps> = ({ onOpenModal }) => {
  return (
    <div className="mt-8 rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center">
      <h3 className="mb-2 text-xl font-semibold text-navy">Don&apos;t see what you need?</h3>
      <p className="mx-auto mb-4 max-w-md text-foreground/80">
        Let us know if there&apos;s a specific research compound you&apos;re looking for. We&apos;re always looking
        to expand our catalog based on researcher needs.
      </p>
      <Button onClick={onOpenModal} className="bg-lime text-navy hover:bg-[#94DD00]" size="lg">
        Suggest a Product
      </Button>
    </div>
  );
};

export default SuggestProductCTA;