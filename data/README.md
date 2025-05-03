# Peptide Research Catalog Data

This directory contains the database schema, product data, and loading scripts for the peptide research catalog.

## 📁 Directory Structure

```
data/
├── schema.sql         # SQLite database schema
├── products.yaml      # Product catalog data in YAML format
├── load_catalog.py    # Python script to build the database
└── database/          # Contains the generated SQLite database
    ├── catalog.db     # Main database file
    ├── catalog.db-shm # SQLite shared memory file (WAL mode)
    └── catalog.db-wal # SQLite write-ahead log file
```

## 🗄️ Database Schema

The database is designed with a hierarchical structure:

1.  **Substances** - Base molecules/peptides (semaglutide, BPC-157, etc.)
2.  **Variants** - Specific sellable SKUs (different sizes/concentrations)
3.  **Batches** - Manufacturing batches of specific variants
4.  **Inventory** - Stock information for each batch
5.  **Categories** - Taxonomic organization of substances

### Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  SUBSTANCES │       │   VARIANTS  │       │   BATCHES   │       │  INVENTORY  │
├─────────────┤       ├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │       │ id          │       │ id          │       │ batch_id    │
│ slug        │◄──┐   │ substance_id│◄──┐   │ variant_id  │◄──┐   │ quantity    │
│ name        │   └───│ sku         │   └───│ batch_id    │   └───│ in_stock    │
│ description │       │ mg          │       │ manufactured│       │ last_update │
│ sequence    │       │ price_cents │       │ expiration  │       └─────────────┘
│ formula     │       │ coa_path    │       │ coa_path    │
│ cas_number  │       └─────────────┘       └─────────────┘
│ ...         │
└─────────────┘
       ▲
       │
       │       ┌─────────────┐
       └───────┤ CATEGORIES  │
               ├─────────────┤
               │ id          │
               │ slug        │
               │ name        │
               └─────────────┘
```

### Key Design Principles

1.  **DRY Scientific Metadata**: Molecular information (sequence, formula, CAS number, etc.) is stored once per substance
2.  **Separate Pricing & Inventory**: Each sellable SKU has its own price record
3.  **Batch-Based Inventory**: Multiple batches can exist for each variant, each with its own inventory
4.  **Efficient Updates**: Stock changes don't require rewriting large substance records
5.  **Simple & Fast**: Optimized for single-CPU VPS deployment

### Batch-Based Inventory System

The database now supports multiple batches per variant:

- **Purpose:**
  - Track different manufacturing runs of the same product
  - Support FIFO (First-In-First-Out) inventory management
  - Enable batch-specific recalls if needed
  - Track expiration dates per batch

- **Implementation:**
  - Each variant can have multiple batches
  - Each batch has its own inventory record
  - Batches include manufacturing and expiration dates
  - Batch-specific COA (Certificate of Analysis) can be stored

- **Advantages:**
  - More accurate inventory tracking
  - Better quality control
  - Support for regulatory compliance
  - Improved customer information

## 📋 Product Data (products.yaml)

The `products.yaml` file contains all product information in a structured format:

### Categories Section

```yaml
categories:
  - slug: peptides
    name: Peptides
  - slug: metabolic
    name: Metabolic Research Peptides
  # ...
```

### Substances Section

Each substance contains:
- Basic information (slug, name, description)
- Scientific metadata (sequence, molecular_weight, formula, CAS number, etc.)
- Category associations
- Variants (different sizes/concentrations)
- Batch information for each variant

Example:
```yaml
substances:
  - slug: bpc157
    name: BPC-157
    description: "Body Protection Compound-157..."
    sequence: "GEPPPGKPADDAGLV"
    cas_number: "137525-51-0"
    # ... other scientific properties
    categories: [peptides, healing]
    variants:
      - sku: BPC157-5MG
        mg: 5.0
        price_cents: 4999
        batch_id: "LOT2023-BPC-001"
        coa_path: /images/products/bpc157-5mg.jpg
        quantity: 0
      # ... other variants
```

## 🔄 Database Loading Process

The `load_catalog.py` script:

1.  Creates a new SQLite database using the schema in `schema.sql`
2.  Loads categories from `products.yaml`
3.  Loads substances and their scientific metadata
4.  Creates variant records with pricing information
5.  Enables WAL (Write-Ahead Logging) mode for better concurrency

### Initial Data vs. Production Data

The initial product data in `products.yaml` includes `batch_id` values for each variant, but these are only for reference. During the initial database loading process:

- Only substances, categories, and variants are created
- No batch records are created
- No inventory records are created

This approach treats the initial data as product placeholders only. In a production environment, you would:

1. Start with this baseline catalog of substances and variants
2. Add batches as products are manufactured
3. Update inventory as batches are received

### Adding Batches

After the initial database is created, batches can be added through the admin API or direct SQL:

```sql
-- Add a new batch for an existing variant
INSERT INTO batches (variant_id, batch_id, manufactured, expiration)
VALUES (
    (SELECT id FROM variants WHERE sku = 'BPC157-5MG'),
    'LOT2023-BPC-001',
    '2023-10-01',
    '2024-10-01'
);

-- Add inventory for the new batch
INSERT INTO inventory (batch_id, quantity, in_stock)
VALUES (
    last_insert_rowid(),
    100,
    1
);
```

## 🔍 Key Database Features

### 1. Triggers

The schema includes triggers to:
- Automatically update `updated_at` timestamps when records change
- Update `last_update` in inventory when stock changes

### 2. Indexes

Optimized indexes for common query patterns:
- `idx_substances_slug` - Fast lookup by substance slug
- `idx_variants_substance` - Fast retrieval of all variants for a substance
- `idx_batches_variant` - Fast retrieval of all batches for a variant
- `idx_batches_expiration` - Quick filtering of batches by expiration date
- `idx_inventory_instock` - Quick filtering of in-stock items

### 3. Views

The schema includes a view for common queries:
- `variant_inventory` - Aggregates inventory across all batches for each variant

### 4. WAL Mode

The database uses SQLite's Write-Ahead Logging (WAL) mode for:
- Better concurrency (readers don't block writers)
- Improved performance for write operations
- Crash resilience

## 🛠️ Workflow for Updates

### Adding New Products

1.  Edit `products.yaml` to add new substances and/or variants
2.  Run `load_catalog.py` to rebuild the database
3.  Deploy the updated database to the production environment

### Adding New Batches

New batches can be added through:
1.  The admin API (for production use)
2.  Direct SQL insertion (for development/testing)

Example SQL:
```sql
-- Add a new batch for an existing variant
INSERT INTO batches (variant_id, batch_id, manufactured, expiration)
VALUES (
    (SELECT id FROM variants WHERE sku = 'BPC157-5MG'),
    'LOT2023-BPC-004',
    '2023-10-01',
    '2024-10-01'
);

-- Add inventory for the new batch
INSERT INTO inventory (batch_id, quantity, in_stock)
VALUES (
    last_insert_rowid(),
    100,
    1
);
```

### Updating Inventory

Inventory updates are handled through the API:
- `PATCH /api/batch/{id}` endpoints update stock levels
- Changes are written directly to the `inventory` table
- No need to rebuild the entire database for stock changes

### Updating Prices

Price changes can be made by:
1.  Updating `price_cents` in `products.yaml` and rebuilding the database
2.  Using the admin API to update prices directly in the database

## 📊 Data Validation

When adding new products, ensure:
1.  All required fields are present
2.  SKUs follow the naming convention (e.g., `BPC157-5MG`)
3.  Batch IDs follow a consistent format (e.g., `LOT2023-XXX-###`)
4.  Categories referenced in substances exist in the categories section
5.  Scientific values use appropriate units (mg, Daltons, etc.)
6.  CAS numbers are correctly formatted and valid
7.  Expiration dates are in the future
8.  Manufacturing dates are in the past

## 🔮 Future Enhancements

The schema includes comments about potential future additions:
- Order tracking tables
- Price history logging
- Admin change auditing
- JSON field indexing for advanced filtering
- Batch transfer tracking between locations

## 📝 Best Practices

1.  **Version Control**: Keep all schema and data changes in version control
2.  **Backup Strategy**: Use the built-in SQLite backup functionality
3.  **Testing**: Test database changes in development before deploying
4.  **Documentation**: Update this README when making schema changes
5.  **Data Integrity**: Use the provided Python script for all bulk data changes
6.  **CAS Numbers**: Always include valid CAS registry numbers for all substances
7.  **Batch Management**: Follow FIFO principles when fulfilling orders
8.  **Expiration Tracking**: Regularly check for approaching expiration dates