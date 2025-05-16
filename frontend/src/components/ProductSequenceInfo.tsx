'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
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
      navigator.clipboard.writeText(sequence)
        .then(() => {
          toast({
            title: "Copied to Clipboard",
            description: `${productName} sequence has been copied.`,
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
    <div className="space-y-3"> {/* Consistent vertical rhythm */}
      <h2 className="text-xl font-semibold text-primary">Sequence</h2>
      <div className="p-4 border rounded-md bg-card shadow-sm"> {/* Card-like styling */}
        <pre className="bg-muted/30 p-3 rounded-md overflow-x-auto text-sm font-mono mb-4 whitespace-pre-wrap break-all">
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