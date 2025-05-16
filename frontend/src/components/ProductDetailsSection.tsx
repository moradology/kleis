'use client';

import React from 'react';
import type { StorageHandlingInfo, ProductVariantDetail } from '@/types/product';
// import { Button } from '@/components/ui/button'; // Unused
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Import Tabs
// Remove useToast and Copy imports as they are no longer used
// import { useToast } from "@/components/ui/use-toast";
// import { Copy, Info } from 'lucide-react';

interface ProductDetailsSectionProps {
  description: string;
  // sequence?: string | null; // Removed sequence prop
  storageHandling: StorageHandlingInfo;
  variants: ProductVariantDetail[];
}

const ProductDetailsSection: React.FC<ProductDetailsSectionProps> = ({
  description,
  // sequence, // Removed sequence prop
  storageHandling,
  variants,
}) => {
  // const { toast } = useToast(); // Removed toast

  // Removed handleCopySequence function
  // const handleCopySequence = () => { ... };

  const allBatches = variants.flatMap((variant) =>
    variant.batches.map((batch) => ({ ...batch, variantMg: variant.mg, variantSku: variant.sku }))
  );

  return (
    <div className="my-8">
      <Tabs defaultValue="description" className="w-full">
        {/* Updated TabsList className */}
        <TabsList className="mb-4 grid w-full grid-cols-1 sm:grid-cols-3">
          <TabsTrigger value="description">Description</TabsTrigger>
          {/* {sequence && <TabsTrigger value="sequence">Sequence</TabsTrigger>} Removed Sequence TabTrigger */}
          <TabsTrigger value="storage">Storage & Handling</TabsTrigger>
          <TabsTrigger value="batch_coa">Batch & COA</TabsTrigger>
        </TabsList>

        <TabsContent value="description">
          <div
            className="prose max-w-none rounded-md border bg-card p-4 text-foreground/90"
            dangerouslySetInnerHTML={{ __html: description }}
          ></div>
        </TabsContent>

        {/* Removed Sequence TabsContent block */}
        {/* {sequence && (
          <TabsContent value="sequence">
            ...
          </TabsContent>
        )} */}

        <TabsContent value="storage">
          <div className="rounded-md border bg-card p-4">
            <ul className="list-inside list-disc space-y-1 text-foreground/90">
              {storageHandling.temperature && (
                <li>
                  <strong>Recommended Storage:</strong> {storageHandling.temperature}
                </li>
              )}
              {storageHandling.form && (
                <li>
                  <strong>Form:</strong> {storageHandling.form}
                </li>
              )}
              {storageHandling.solvent && (
                <li>
                  <strong>Preferred Solvent:</strong> {storageHandling.solvent}
                </li>
              )}
            </ul>
            {!storageHandling.temperature && !storageHandling.form && !storageHandling.solvent && (
              <p>No specific storage or handling information available.</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="batch_coa">
          <div className="rounded-md border bg-card p-4">
            {allBatches.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                      >
                        Variant (SKU)
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                      >
                        Batch ID
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                      >
                        Stock
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-background">
                    {allBatches.map((batch, index) => (
                      <tr key={`${batch.variantSku}-${batch.batch_identifier}-${index}`}>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                          {batch.variantMg}mg ({batch.variantSku})
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                          {batch.batch_identifier}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-foreground">
                          {batch.stock_quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-foreground/90">No batch information available for this product.</p>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductDetailsSection;