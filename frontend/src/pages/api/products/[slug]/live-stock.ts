import type { APIRoute } from 'astro';
import Database from 'better-sqlite3';
import path from 'path';
import type { ProductLiveStockResponse, VariantStockInfo } from '@/types/product';

// Remove prerender = false as this route will be pre-rendered
// export const prerender = false;

export function getStaticPaths() {
  const dbPath = path.resolve(process.cwd(), '../data/database/catalog.db');
  let db: Database.Database | null = null;
  try {
    db = new Database(dbPath, { readonly: true, fileMustExist: true });
    const substances = db
      .prepare("SELECT slug FROM substances WHERE slug IS NOT NULL AND slug != ''")
      .all() as { slug: string }[];
    return substances.map((substance) => ({
      params: { slug: substance.slug },
    }));
  } catch (error) {
    console.error('[getStaticPaths for live-stock.ts] Database error:', error);
    return [];
  } finally {
    if (db) {
      db.close();
    }
  }
}

export const GET: APIRoute = ({ params }) => {
  const slug = params.slug;
  if (!slug) {
    return new Response(JSON.stringify({ message: 'Product slug is required' }), { status: 400 });
  }

  const dbPath = path.resolve(process.cwd(), '../data/database/catalog.db'); // Corrected path
  let db: Database.Database | null = null;

  try {
    db = new Database(dbPath, { readonly: true, fileMustExist: true });

    const substanceQuery = db.prepare('SELECT id FROM substances WHERE slug = ?');
    const substance = substanceQuery.get(slug) as { id: number } | undefined;

    if (!substance) {
      return new Response(JSON.stringify({ message: 'Product not found' }), { status: 404 });
    }

    const variantsQuery = `
      SELECT v.id as variant_id, v.sku
      FROM variants v
      WHERE v.substance_id = ?;
    `;
    const variantsData = db.prepare(variantsQuery).all(substance.id) as {
      variant_id: number;
      sku: string;
    }[];

    const variantsStock: VariantStockInfo[] = [];
    let totalProductStock = 0;

    for (const variant of variantsData) {
      const batchesStockQuery = `
        SELECT SUM(i.quantity) as total_stock
        FROM batches b
        JOIN inventory i ON b.id = i.batch_id
        WHERE b.variant_id = ? AND i.in_stock = 1;
      `; // Use inventory.quantity and inventory.in_stock
      const stockResult = db.prepare(batchesStockQuery).get(variant.variant_id) as {
        total_stock: number | null;
      };
      const currentVariantStock = stockResult?.total_stock || 0;

      variantsStock.push({
        sku: variant.sku,
        variant_id: variant.variant_id,
        total_stock: currentVariantStock,
      });
      totalProductStock += currentVariantStock;
    }

    let overallStockStatus: 'In Stock' | 'Out of Stock' | 'Low Stock' = 'Out of Stock';
    if (totalProductStock > 10) {
      overallStockStatus = 'In Stock';
    } else if (totalProductStock > 0) {
      overallStockStatus = 'Low Stock';
    }

    const response: ProductLiveStockResponse = {
      product_slug: slug,
      overall_stock_status: overallStockStatus,
      variants_stock: variantsStock,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(`Error fetching live stock for ${slug}:`, error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  } finally {
    if (db) {
      db.close();
    }
  }
};