export interface CartItemType {
  id: string; // Unique identifier for the cart item instance (e.g., SKU + timestamp or UUID)
  productId: string; // Slug of the product
  name: string; // Product name
  variant: string; // Variant description (e.g., "2 mg", "10ml bottle")
  sku: string; // Product SKU
  unitPrice: number; // Price per unit in cents
  quantity: number;
  thumbnailUrl: string; // URL or path to product image
  href: string; // Link to the product detail page
  stock: number; // Available stock for this variant, for quantity selector limits
}
