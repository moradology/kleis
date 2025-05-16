import type { APIRoute } from 'astro';
import Database from 'better-sqlite3';
import path from 'path';
import type { RelatedProductSummary } from '@/types/product';

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
    console.error('[getStaticPaths for related.ts] Database error:', error);
    return [];
  } finally {
    if (db) {
      db.close();
    }
  }
}

export const GET: APIRoute = ({ params }) => {
  const currentProductSlug = params.slug;
  if (!currentProductSlug) {
    return new Response(JSON.stringify({ message: 'Product slug is required' }), { status: 400 });
  }

  const dbPath = path.resolve(process.cwd(), '../data/database/catalog.db'); // Corrected path
  let db: Database.Database | null = null;

  try {
    db = new Database(dbPath, { readonly: true, fileMustExist: true });

    // Get current product ID and its categories
    const currentProductInfoQuery = db.prepare(`
      SELECT s.id, c.id as category_id
      FROM substances s
      JOIN substance_categories sc ON s.id = sc.substance_id
      JOIN categories c ON sc.category_id = c.id
      WHERE s.slug = ?
    `);
    const currentProductCategories = currentProductInfoQuery.all(currentProductSlug) as {
      id: number;
      category_id: number;
    }[];

    if (currentProductCategories.length === 0) {
      return new Response(JSON.stringify({ message: 'Product or its categories not found' }), {
        status: 404,
      });
    }

    const currentProductId = currentProductCategories[0].id;
    const categoryIds = currentProductCategories.map((pc) => pc.category_id);

    // Find other products in the same categories, limit to 4, excluding the current product
    // This query is a bit complex to get distinct products and their min/max prices and overall stock.
    const relatedProductsQuery = `
      SELECT
        s.slug,
        s.name,
        s.purity_percent,
        MIN(v.price_cents) as min_price_cents,
        MAX(v.price_cents) as max_price_cents,
        COALESCE(SUM(i.quantity), 0) as total_stock -- Sum quantity from inventory for in_stock items
      FROM substances s
      JOIN substance_categories sc ON s.id = sc.substance_id
      JOIN variants v ON s.id = v.substance_id
      LEFT JOIN batches b ON v.id = b.variant_id
      LEFT JOIN inventory i ON b.id = i.batch_id AND i.in_stock = 1 -- Only count stock from "in_stock" batches
      WHERE sc.category_id IN (${categoryIds.map(() => '?').join(',')})
        AND s.id != ?
      GROUP BY s.id, s.slug, s.name, s.purity_percent
      ORDER BY RANDOM() -- Or some other logic for relevance
      LIMIT 4;
    `;

    const relatedSubstancesData = db
      .prepare(relatedProductsQuery)
      .all(...categoryIds, currentProductId) as {
        slug: string;
        name: string;
        purity_percent: number | null;
        min_price_cents: number;
        max_price_cents: number;
        total_stock: number | null;
      }[];

    const relatedProducts: RelatedProductSummary[] = relatedSubstancesData.map((row: {
      slug: string;
      name: string;
      purity_percent: number | null;
      min_price_cents: number;
      max_price_cents: number;
      total_stock: number | null;
    }) => {
      let stockStatus: 'In Stock' | 'Out of Stock' | 'Low Stock' = 'Out of Stock';
      const totalStock = row.total_stock ?? 0;
      if (totalStock > 10) {
        stockStatus = 'In Stock';
      } else if (totalStock > 0) {
        stockStatus = 'Low Stock';
      }
      return {
        slug: row.slug,
        name: row.name,
        purity_percent: row.purity_percent,
        min_price_cents: row.min_price_cents,
        max_price_cents: row.max_price_cents,
        overall_stock_status: stockStatus,
      };
    });

    return new Response(JSON.stringify(relatedProducts), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error(`Error fetching related products for ${currentProductSlug}:`, error);
    return new Response(JSON.stringify({ message: 'Internal server error' }), { status: 500 });
  } finally {
    if (db) {
      db.close();
    }
  }
};