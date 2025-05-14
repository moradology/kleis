'use client';

import React, { useState, useEffect, useCallback } from 'react';
import type { ProductDetail, ProductLiveStockResponse, ProductVariantDetail } from '@/types/product'; // Added ProductVariantDetail
import ProductHero from './ProductHero';
import ProductDetailsSection from './ProductDetailsSection';
import VariantSelector from './VariantSelector';
import RelatedProducts from './RelatedProducts';
import NotifyMeForm from './NotifyMeForm';
import StickyAddToCartBar from './StickyAddToCartBar'; // Import StickyAddToCartBar
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";

interface ProductDetailClientProps {
  initialProductData: ProductDetail;
}

const ProductDetailClient: React.FC<ProductDetailClientProps> = ({ initialProductData }) => {
  const [selectedVariantSku, setSelectedVariantSku] = useState<string | null>(() => {
    const firstInStockVariant = initialProductData.variants.find(v => v.total_stock > 0);
    return firstInStockVariant ? firstInStockVariant.sku : (initialProductData.variants.length > 0 ? initialProductData.variants[0].sku : null);
  });
  const [liveStockData, setLiveStockData] = useState<ProductLiveStockResponse | null>(null);
  const { toast } = useToast();

  const fetchLiveStock = useCallback(async () => {
    try {
      const response = await fetch(`/api/products/${initialProductData.slug}/live-stock`);
      if (!response.ok) {
        throw new Error('Failed to fetch live stock');
      }
      const data: ProductLiveStockResponse = await response.json();
      setLiveStockData(data);
    } catch (error) {
      console.error("Error fetching live stock:", error);
      // Fallback to initial data if API fails, to prevent total stock display failure
      const fallbackStockStatus = initialProductData.variants.reduce((sum, v) => sum + v.total_stock, 0) > 0 ? 'In Stock' : 'Out of Stock';
      setLiveStockData({
        product_slug: initialProductData.slug,
        overall_stock_status: initialProductData.initialOverallStockStatus || fallbackStockStatus,
        variants_stock: initialProductData.variants.map(v => ({ sku: v.sku, total_stock: v.total_stock, variant_id: parseInt(v.sku.split('-').pop() || '0') }))
      });
    }
  }, [initialProductData.slug, initialProductData.initialOverallStockStatus, initialProductData.variants]);

  useEffect(() => {
    fetchLiveStock();
    const intervalId = setInterval(fetchLiveStock, 30000); // Poll every 30 seconds
    return () => clearInterval(intervalId);
  }, [fetchLiveStock]);

  const handleVariantSelect = (sku: string) => {
    setSelectedVariantSku(sku);
  };

  const handleAddToCart = (sku: string, quantity: number) => {
    console.log(`Adding ${quantity} of ${sku} to cart.`);
    const selectedVariant = initialProductData.variants.find(v => v.sku === sku);
    toast({
      title: "Added to Cart (Simulated)",
      description: `${selectedVariant?.mg}mg of ${initialProductData.name} added.`,
    });
  };
  
  const currentOverallStockStatus = liveStockData?.overall_stock_status || initialProductData.initialOverallStockStatus;
  const showNotifyMeForm = currentOverallStockStatus === 'Out of Stock';

  // Prepare data for StickyAddToCartBar
  const selectedVariantObject: ProductVariantDetail | undefined = initialProductData.variants.find(v => v.sku === selectedVariantSku);
  const selectedVariantLiveStock: number = liveStockData?.variants_stock.find(vs => vs.sku === selectedVariantSku)?.total_stock ?? (selectedVariantObject?.total_stock || 0);

  const stickyBarVariantInfo = selectedVariantObject ? {
    productName: initialProductData.name,
    sku: selectedVariantObject.sku,
    mg: selectedVariantObject.mg,
    price_cents: selectedVariantObject.price_cents,
    stock: selectedVariantLiveStock,
  } : null;

  return (
    <div className="container mx-auto px-4 py-8"> {/* Added pb-20 for sticky bar space */}
      <ProductHero
        productName={initialProductData.name}
        shortBlurb={initialProductData.short_description}
        molecularSpecs={initialProductData.molecular_specs}
        liveOverallStockStatus={currentOverallStockStatus}
        purityPercent={initialProductData.purity_percent}
      />

      <VariantSelector
        variants={initialProductData.variants}
        liveVariantsStock={liveStockData?.variants_stock}
        selectedVariantSku={selectedVariantSku}
        onSelectVariant={handleVariantSelect}
        onAddToCart={handleAddToCart}
      />
      
      {showNotifyMeForm && (
        <NotifyMeForm productSlug={initialProductData.slug} variantSku={selectedVariantSku} />
      )}
      
      <ProductDetailsSection
        description={initialProductData.description}
        sequence={initialProductData.molecular_specs.sequence}
        storageHandling={initialProductData.storage_handling}
        variants={initialProductData.variants}
      />

      <RelatedProducts currentProductSlug={initialProductData.slug} />
      
      <Toaster />
      
      {/* Add StickyAddToCartBar */}
      <StickyAddToCartBar
        selectedVariantInfo={stickyBarVariantInfo}
        onAddToCart={handleAddToCart}
      />
      {/* Add padding to the bottom of the main content area to prevent overlap with the sticky bar */}
      <div className="pb-20 md:pb-0"></div>
    </div>
  );
};

export default ProductDetailClient;