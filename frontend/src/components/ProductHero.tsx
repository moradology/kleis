'use client';

import React from 'react';
import type { MolecularSpecs } from '@/types/product';
// import { useToast } from '@/components/ui/use-toast'; // Import useToast

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
  // const { toast } = useToast();

  return (
    <section className="border-b pb-6">
      {' '}
      {/* Reduced mb-8 and pb-8 to just pb-6 */}
      <h1 className="mb-4 text-3xl font-bold text-primary md:text-4xl">
        {' '}
        {/* Adjusted margin */}
        {productName}
      </h1>
      {shortBlurb && <p className="mb-4 text-lg text-foreground/80">{shortBlurb}</p>}
      {/* Molecular Info and Copy Button Wrapper */}
      <div className="mb-4 text-sm leading-tight md:flex md:items-end md:justify-between">
        <div className="grid flex-grow grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
          {molecularSpecs.molecular_weight && (
            <div>
              <strong>Molecular Weight:</strong> {molecularSpecs.molecular_weight}
            </div>
          )}
          {molecularSpecs.molecular_formula && (
            <div>
              <strong>Molecular Formula:</strong> {molecularSpecs.molecular_formula}
            </div>
          )}
          {molecularSpecs.cas_number && (
            <div>
              <strong>CAS Number:</strong> {molecularSpecs.cas_number}
            </div>
          )}
          {molecularSpecs.sequence_length != null && (
            <div>
              <strong>Sequence Length:</strong> {molecularSpecs.sequence_length}
            </div>
          )}
          {molecularSpecs.salt_form && (
            <div>
              <strong>Salt Form:</strong> {molecularSpecs.salt_form}
            </div>
          )}
          {purityPercent != null && (
            <div>
              <strong>Purity:</strong> {'>='} {purityPercent}%
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductHero;