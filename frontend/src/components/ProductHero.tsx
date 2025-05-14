'use client';

import React from 'react';
import type { MolecularSpecs } from '@/types/product';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast"; // Import useToast
import { Copy } from 'lucide-react';

interface ProductHeroProps {
  productName: string;
  shortBlurb?: string | null;
  molecularSpecs: MolecularSpecs;
  purityPercent?: number | null;
}

const ProductHero: React.FC<ProductHeroProps> = ({
  productName,
  shortBlurb,
  molecularSpecs,
  purityPercent,
}) => {
  const { toast } = useToast();

  const handleCopySequence = () => {
    if (molecularSpecs.sequence) {
      navigator.clipboard.writeText(molecularSpecs.sequence)
        .then(() => {
          toast({
            title: "Copied to Clipboard",
            description: "Product sequence has been copied.",
          });
        })
        .catch(err => {
          console.error('Failed to copy sequence: ', err);
          toast({
            variant: "destructive",
            title: "Copy Failed",
            description: "Could not copy sequence to clipboard.",
          });
        });
    }
  };

  return (
    <section className="pb-6 border-b"> {/* Reduced mb-8 and pb-8 to just pb-6 */}
      <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4"> {/* Adjusted margin */}
        {productName}
      </h1>

      {shortBlurb && (
        <p className="text-lg text-foreground/80 mb-4">{shortBlurb}</p>
      )}

      {/* Molecular Info and Copy Button Wrapper */}
      <div className="md:flex md:justify-between md:items-end mb-4 text-sm leading-tight">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 flex-grow">
          {molecularSpecs.molecular_weight && <div><strong>Molecular Weight:</strong> {molecularSpecs.molecular_weight}</div>}
          {molecularSpecs.molecular_formula && <div><strong>Molecular Formula:</strong> {molecularSpecs.molecular_formula}</div>}
          {molecularSpecs.cas_number && <div><strong>CAS Number:</strong> {molecularSpecs.cas_number}</div>}
          {molecularSpecs.sequence_length != null && <div><strong>Sequence Length:</strong> {molecularSpecs.sequence_length}</div>}
          {molecularSpecs.salt_form && <div><strong>Salt Form:</strong> {molecularSpecs.salt_form}</div>}
          {purityPercent != null && <div><strong>Purity:</strong> {">="} {purityPercent}%</div>}
        </div>
      </div>
    </section>
  );
};

export default ProductHero;