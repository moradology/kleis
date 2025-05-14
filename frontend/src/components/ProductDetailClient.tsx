'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { ProductDetail, ProductLiveStockResponse, ProductVariantDetail } from '@/types/product';
import ProductHero from './ProductHero';
import ProductDetailsSection from './ProductDetailsSection';
import VariantSelector from './VariantSelector';
import RelatedProducts from './RelatedProducts';
import StickyAddToCartBar from './StickyAddToCartBar';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from '@/components/ui/skeleton'; // For loading states
import ProductSequenceInfo from './ProductSequenceInfo'; // Added import
import StockStatusBadge from './StockStatusBadge'; // Added import

interface ProductDetailClientProps {
  initialProductData: ProductDetail;
}

const ProductDetailClient: React.FC<ProductDetailClientProps> = ({ initialProductData }) => {
  const [selectedVariantSku, setSelectedVariantSku] = useState<string | null>(() => {
    let skuFromQueryParam: string | null = null;

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const variantQueryParam = params.get('variant');

      if (variantQueryParam && initialProductData.variants.length > 0) {
        const mgValueFromQuery = parseInt(variantQueryParam.toLowerCase().replace('mg', ''), 10);
        if (!isNaN(mgValueFromQuery)) {
          const variantFromQuery = initialProductData.variants.find(
            (v) => v.mg === mgValueFromQuery
          );
          if (variantFromQuery) {
            skuFromQueryParam = variantFromQuery.sku;
          }
        }
      }
    }

    if (skuFromQueryParam) {
      return skuFromQueryParam;
    }

    const firstInStockVariant = initialProductData.variants.find(v => v.total_stock > 0);
    if (firstInStockVariant) {
      return firstInStockVariant.sku;
    }

    if (initialProductData.variants.length > 0) {
      return initialProductData.variants[0].sku;
    }
    
    return null;
  });

  const [liveStockData, setLiveStockData] = useState<ProductLiveStockResponse | null>(null);
  const [isLoadingStock, setIsLoadingStock] = useState(true);
  const { toast } = useToast();

  const fetchLiveStockData = useCallback(async () => {
    setIsLoadingStock(true);
    try {
      const response = await fetch(`/api/products/${initialProductData.slug}/live-stock`);
      if (!response.ok) {
        throw new Error(`Failed to fetch live stock: ${response.status}`);
      }
      const data: ProductLiveStockResponse = await response.json();
      setLiveStockData(data);
    } catch (error) {
      console.error("Error fetching live stock data:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load live stock information.",
      });
      // Set a default based on initial data if API fails, to avoid breaking UI
      setLiveStockData({
        product_slug: initialProductData.slug,
        overall_stock_status: initialProductData.initialOverallStockStatus,
        variants_stock: initialProductData.variants.map(v => ({
          sku: v.sku,
          total_stock: v.total_stock,
          variant_id: undefined // Or map if available
        }))
      });
    } finally {
      setIsLoadingStock(false);
    }
  }, [initialProductData.slug, initialProductData.variants, initialProductData.initialOverallStockStatus, toast]);

  useEffect(() => {
    fetchLiveStockData();
    const intervalId = setInterval(fetchLiveStockData, 30000); // Refresh every 30 seconds
    return () => clearInterval(intervalId);
  }, [fetchLiveStockData]);

  useEffect(() => {
    if (typeof window !== 'undefined' && selectedVariantSku) {
      const selectedVariant = initialProductData.variants.find(v => v.sku === selectedVariantSku);
      if (selectedVariant) {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set('variant', `${selectedVariant.mg}mg`);
        window.history.pushState({}, '', currentUrl.toString());
      }
    } else if (typeof window !== 'undefined' && !selectedVariantSku) {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete('variant');
        window.history.pushState({}, '', currentUrl.toString());
    }
  }, [selectedVariantSku, initialProductData.variants]);

  const handleSelectVariant = (sku: string) => {
    setSelectedVariantSku(sku);
  };

  const handleAddToCart = (sku: string, quantity: number) => {
    const variant = initialProductData.variants.find(v => v.sku === sku);
    if (variant) {
      toast({
        title: "Added to Cart (Simulated)",
        description: `${quantity} x ${initialProductData.name} (${variant.mg}mg) added.`,
      });
      console.log(`Add to cart: ${quantity} of ${sku}`);
      // Implement actual cart logic here
    }
  };
  
  const currentSelectedVariantDetails = initialProductData.variants.find(v => v.sku === selectedVariantSku);
  
  const getLiveStockForSelectedVariant = () => {
    if (!selectedVariantSku || !liveStockData) {
      // Fallback to initial data if live data isn't ready or SKU isn't selected
      return currentSelectedVariantDetails?.total_stock ?? 0;
    }
    const variantStockInfo = liveStockData.variants_stock.find(vs => vs.sku === selectedVariantSku);
    return variantStockInfo?.total_stock ?? 0;
  };

  const stickyBarVariantInfo = currentSelectedVariantDetails ? {
    productName: initialProductData.name,
    sku: currentSelectedVariantDetails.sku,
    mg: currentSelectedVariantDetails.mg,
    price_cents: currentSelectedVariantDetails.price_cents,
    stock: getLiveStockForSelectedVariant(),
  } : null;

  const liveOverallStockStatus = liveStockData?.overall_stock_status ?? initialProductData.initialOverallStockStatus;

  return (
    <>
      <div className="container mx-auto px-4 py-6 lg:max-w-7xl pb-24 md:pb-8"> {/* Changed max-w-4xl to lg:max-w-7xl */}
        {isLoadingStock && !liveStockData ? (
          <div className="space-y-6"> {/* Skeleton UI remains single column */}
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <> {/* Fragment to wrap grid and RelatedProducts */}
            <div className="lg:grid lg:grid-cols-10 lg:gap-x-8">
              {/* Left Column: Informational Content */}
              <div className="lg:col-span-6 space-y-6 lg:max-w-prose">
                <ProductHero
                  productName={initialProductData.name}
                  shortBlurb={initialProductData.short_description}
                  molecularSpecs={initialProductData.molecular_specs}
                  purityPercent={initialProductData.purity_percent}
                />
                <ProductSequenceInfo
                  sequence={initialProductData.molecular_specs.sequence}
                  productName={initialProductData.name}
                />
                <ProductDetailsSection
                  description={initialProductData.description}
                  storageHandling={initialProductData.storage_handling}
                  variants={initialProductData.variants} // Still needed for Batch/COA tab
                />
              </div>

              {/* Right Column: Actionable Content */}
              <div className="lg:col-span-4 mt-8 lg:mt-0 lg:sticky lg:top-24 self-start">
                <div className="p-4 sm:p-6 bg-card border border-border rounded-lg shadow-md space-y-4">
                  <StockStatusBadge
                    liveOverallStockStatus={liveOverallStockStatus}
                    className="mb-2"
                  />
                  <VariantSelector
                    variants={initialProductData.variants}
                    liveVariantsStock={liveStockData?.variants_stock}
                    selectedVariantSku={selectedVariantSku}
                    onSelectVariant={handleSelectVariant}
                    onAddToCart={handleAddToCart}
                    productSlug={initialProductData.slug}
                  />
                </div>
              </div>
            </div>
            {/* RelatedProducts is now outside the two-column grid, will appear below it */}
            <RelatedProducts currentProductSlug={initialProductData.slug} />
          </>
        )}
      </div>
      <StickyAddToCartBar
        selectedVariantInfo={stickyBarVariantInfo}
        onAddToCart={handleAddToCart}
      />
      <Toaster />
    </>
  );
};

export default ProductDetailClient;