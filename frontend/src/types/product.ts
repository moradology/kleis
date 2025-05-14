export interface MolecularSpecs {
  molecular_formula?: string | null;
  molecular_weight?: string | null;
  cas_number?: string | null;
  sequence?: string | null;
  sequence_length?: number | null;
  salt_form?: string | null;
}

export interface StorageHandlingInfo {
  temperature?: string | null;
  form?: string | null;
  solvent?: string | null;
}

export interface BatchInfo {
  batch_identifier?: string | null;
  stock_quantity: number;
}

export interface ProductVariantDetail {
  sku: string;
  mg: number;
  price_cents: number;
  batches: BatchInfo[];
  total_stock: number; // Calculated sum of its batches' stock_quantity
}

export interface CategoryInfo {
  name: string;
  slug: string;
}

export interface ProductDetail {
  slug: string;
  name:string;
  description: string;
  short_description?: string | null;
  purity_percent?: number | null;

  molecular_specs: MolecularSpecs;
  storage_handling: StorageHandlingInfo;

  variants: ProductVariantDetail[];
  categories: CategoryInfo[];

  initialOverallStockStatus: 'In Stock' | 'Out of Stock';
}

export interface VariantStockInfo {
  sku: string;
  total_stock: number;
  // variant_id might be useful if SKUs are not globally unique or for easier mapping
  variant_id?: number;
}

export interface ProductLiveStockResponse {
  product_slug: string;
  overall_stock_status: 'In Stock' | 'Out of Stock' | 'Low Stock';
  variants_stock: VariantStockInfo[];
}

export interface RelatedProductSummary {
  slug: string;
  name: string;
  purity_percent?: number | null;
  min_price_cents: number;
  max_price_cents: number;
  overall_stock_status: 'In Stock' | 'Out of Stock' | 'Low Stock';
  // Optionally, a representative image URL if available
  // image_url?: string | null;
}