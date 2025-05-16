'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Copy } from 'lucide-react';

interface ProductSequenceInfoProps {
  sequence?: string | null;
  productName: string;
}

const ProductSequenceInfo: React.FC<ProductSequenceInfoProps> = ({ sequence, productName }) => {
  const { toast } = useToast();

  if (!sequence) {
    return null;
  }

  const handleCopySequence = () => {
    if (sequence) {
      navigator.clipboard
        .writeText(sequence)
        .then(() => {
          toast({
            title: 'Copied to Clipboard',
            description: `${productName} sequence has been copied.`,
          });
        })
        .catch((err) => {
          console.error('Failed to copy sequence: ', err);
          toast({
            variant: 'destructive',
            title: 'Copy Failed',
            description: 'Could not copy sequence to clipboard.',
          });
        });
    }
  };

  return (
    <div className="space-y-3">
      {' '}
      {/* Consistent vertical rhythm */}
      <h2 className="text-xl font-semibold text-primary">Sequence</h2>
      <div className="rounded-md border bg-card p-4 shadow-sm">
        {' '}
        {/* Card-like styling */}
        <pre className="mb-4 overflow-x-auto whitespace-pre-wrap break-all rounded-md bg-muted/30 p-3 font-mono text-sm">
          {sequence}
        </pre>
        <Button onClick={handleCopySequence} variant="outline" size="sm">
          <Copy size={16} className="mr-2" />
          Copy Sequence
        </Button>
      </div>
    </div>
  );
};

export default ProductSequenceInfo;
