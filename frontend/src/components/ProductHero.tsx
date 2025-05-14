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
  liveOverallStockStatus: 'In Stock' | 'Out of Stock' | 'Low Stock'; // Changed from initialStockStatus
  purityPercent?: number | null;
}

const ProductHero: React.FC<ProductHeroProps> = ({
  productName,
  shortBlurb,
  molecularSpecs,
  // sequence prop is available via molecularSpecs.sequence
  liveOverallStockStatus,
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
  
  const stockStatusText = liveOverallStockStatus === 'Low Stock' ? 'Low Stock' : liveOverallStockStatus;
  const stockStatusColor = liveOverallStockStatus === 'In Stock'
    ? 'bg-lime text-navy'
    : liveOverallStockStatus === 'Low Stock'
    ? 'bg-yellow-400 text-yellow-900' // Example for Low Stock
    : 'bg-destructive text-destructive-foreground';


  return (
    <section className="mb-8 pb-8 border-b">
      <div className="flex flex-col md:flex-row justify-between items-start mb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-2 md:mb-0">
          {productName}
        </h1>
        <span
          className={`px-3 py-1 text-sm font-semibold rounded-full ${stockStatusColor}`}
        >
          {stockStatusText}
        </span>
      </div>

      {shortBlurb && (
        <p className="text-lg text-foreground/80 mb-6">{shortBlurb}</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-6 text-sm">
        <div><strong>Molecular Weight:</strong> {molecularSpecs.molecular_weight || 'N/A'}</div>
        <div><strong>Molecular Formula:</strong> {molecularSpecs.molecular_formula || 'N/A'}</div>
        <div><strong>CAS Number:</strong> {molecularSpecs.cas_number || 'N/A'}</div>
        {molecularSpecs.sequence_length != null && <div><strong>Sequence Length:</strong> {molecularSpecs.sequence_length}</div>}
        {molecularSpecs.salt_form && <div><strong>Salt Form:</strong> {molecularSpecs.salt_form}</div>}
        {purityPercent != null && <div><strong>Purity:</strong> ≥{purityPercent}%</div>}
      </div>

      {molecularSpecs.sequence && (
        <Button onClick={handleCopySequence} variant="outline" size="sm">
          <Copy size={16} className="mr-2" />
          Copy Sequence
        </Button>
      )}
    </section>
  );
};

export default ProductHero;