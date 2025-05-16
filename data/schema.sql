-- ==================================================================
-- SQLite catalog schema  –  v1
--
-- Designed for:
--   • ONE "substance" (molecule / peptide / reagent)  ➜  MANY "variants"
--     (vial sizes, concentrations, package counts)
--   • Astro static build     → needs rich metadata to render product pages
--   • FastAPI runtime API    → needs fast lookup of live price & stock
--
-- Goals
--   1)  Keep molecular metadata (sequence, formula, etc.) DRY.
--   2)  Let each sellable SKU have its own price & inventory row.
--   3)  Avoid writing big substance rows when stock changes.
--   4)  Stay simple enough for a single‑CPU VPS.
-- ==================================================================

PRAGMA foreign_keys = ON;   -- enforce referential integrity

----------------------------------------------------------------------
-- 1.  SUBSTANCES  (one row per unique molecule / peptide)
--     Immutable scientific metadata + long description lives here.
----------------------------------------------------------------------
CREATE TABLE substances (
    id                   INTEGER  PRIMARY KEY AUTOINCREMENT,

    slug                 TEXT     NOT NULL UNIQUE, -- 'semaglutide', 'bpc157'
    name                 TEXT     NOT NULL,        -- Human‑readable
    description          TEXT     NOT NULL,

    -- Peptide / molecule specifics (all NULLable for non‑peptides)
    sequence             TEXT,     -- One‑letter or FASTA
    sequence_length      INTEGER,
    molecular_weight     REAL,     -- Daltons
    formula              TEXT,     -- C‑H‑N‑O string
    cas_number           TEXT,     -- Chemical Abstracts Service registry number
    purity_percent       REAL,     -- 99.3
    salt_form            TEXT,     -- Acetate, HCl, TFA...
    physical_form        TEXT,     -- Lyophilized powder, Sterile aqueous solution...
    storage_temp_c       INTEGER,  -- -20, 4 °C...
    recommended_solvent  TEXT,     -- '0.9 % NaCl', 'DMSO ≤10 %', ...

    product_type         TEXT NOT NULL DEFAULT 'peptide',
    --  'peptide', 'small_molecule', 'equipment', etc.
    --  Allows front‑end to branch on type if needed.

    priority             INTEGER NOT NULL DEFAULT 9999, -- Manual sort order

    meta_json            TEXT,     -- Free‑form JSON for oddball fields

    created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Keep updated_at current on any change
CREATE TRIGGER trg_substances_touch_updated
AFTER UPDATE ON substances
BEGIN
    UPDATE substances SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;

CREATE INDEX idx_substances_slug ON substances(slug);

----------------------------------------------------------------------
-- 2.  VARIANTS  (one row per sellable package / vial size)
--     Each has its own SKU, mg, price, image, etc.
----------------------------------------------------------------------
CREATE TABLE variants (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,

    substance_id   INTEGER NOT NULL,           -- FK → substances.id
    sku            TEXT    NOT NULL UNIQUE,    -- 'SEMAGLUTIDE‑2MG'
    mg             REAL    NOT NULL,           -- 2, 5, 10 mg...
    price_cents    INTEGER NOT NULL,           -- 7999 = $79.99

    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (substance_id) REFERENCES substances(id) ON DELETE CASCADE
);

-- Auto‑update updated_at
CREATE TRIGGER trg_variants_touch_updated
AFTER UPDATE ON variants
BEGIN
    UPDATE variants SET updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
END;

CREATE INDEX idx_variants_substance  ON variants(substance_id);

----------------------------------------------------------------------
-- 3.  BATCHES  (multiple batches per variant, each with its own inventory)
----------------------------------------------------------------------
CREATE TABLE batches (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    variant_id     INTEGER NOT NULL,           -- FK → variants.id
    batch_id       TEXT    NOT NULL,           -- 'LOT2023A', manufacturing batch identifier
    manufactured   DATE,                       -- When this batch was produced
    expiration     DATE,                       -- When this batch expires

    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (variant_id) REFERENCES variants(id) ON DELETE CASCADE,
    UNIQUE (variant_id, batch_id)              -- Each batch_id must be unique per variant
);

CREATE INDEX idx_batches_variant ON batches(variant_id);
CREATE INDEX idx_batches_expiration ON batches(expiration);

----------------------------------------------------------------------
-- 4.  INVENTORY  (1-to-1 with batches, mutable in live API)
----------------------------------------------------------------------
CREATE TABLE inventory (
    batch_id      INTEGER PRIMARY KEY,          -- FK → batches.id
    quantity      INTEGER  NOT NULL DEFAULT 0,  -- Physical stock
    in_stock      BOOLEAN  NOT NULL DEFAULT 0,  -- Cached bool for quick API
    last_update   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE
);

-- Touch last_update on any stock change
CREATE TRIGGER trg_inventory_touch_ts
AFTER UPDATE ON inventory
BEGIN
    UPDATE inventory
       SET last_update = CURRENT_TIMESTAMP
     WHERE batch_id  = NEW.batch_id;
END;

CREATE INDEX idx_inventory_instock ON inventory(in_stock);

-- View to get total inventory per variant (across all batches)
CREATE VIEW variant_inventory AS
SELECT
    v.id AS variant_id,
    v.sku,
    SUM(i.quantity) AS total_quantity,
    MAX(i.in_stock) AS in_stock,
    MAX(i.last_update) AS last_update
FROM
    variants v
LEFT JOIN
    batches b ON v.id = b.variant_id
LEFT JOIN
    inventory i ON b.id = i.batch_id
GROUP BY
    v.id, v.sku;

----------------------------------------------------------------------
-- 5.  CATEGORIES  (optional taxonomy – attach to substances)
----------------------------------------------------------------------
CREATE TABLE categories (
    id   INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,        -- 'metabolic', 'equipment'
    name TEXT NOT NULL
);

CREATE TABLE substance_categories (
    substance_id  INTEGER NOT NULL,
    category_id   INTEGER NOT NULL,
    PRIMARY KEY (substance_id, category_id),
    FOREIGN KEY (substance_id) REFERENCES substances(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id)  REFERENCES categories(id)  ON DELETE CASCADE
);

CREATE INDEX idx_substance_categories_cat ON substance_categories(category_id);

----------------------------------------------------------------------
-- 6.  Notes for future migrations
--
--   • orders, order_items        – when implementing first‑party checkout
--   • price_history              – keep a log of price changes per variant
--   • admin_change_log           – audit table for back‑office edits
--   • generated columns on meta_json for fast filtering once
--     certain JSON keys become important query predicates.
----------------------------------------------------------------------