#!/usr/bin/env python3
"""
load_inventory.py - Populates batch and inventory data for development/testing.

This script:
1. Connects to an existing SQLite database (previously initialized by init_catalog.py).
2. Uses a predefined list of SKUs to stock for development purposes.
3. For each selected SKU:
    a. Finds the variant_id in the database.
    b. Creates one or more new batch records with generated batch IDs (e.g., DEV-SKU-001).
       Manufactured and expiration dates are auto-generated (today and +1 year respectively).
    c. Creates an inventory record for each new batch with a predefined quantity.
       The in_stock status is set based on the quantity.

This script DOES NOT read from products.yaml for inventory data. It's intended
to quickly set up a database with some stock for frontend testing.

Usage:
    python load_inventory.py [path_to_db]

Default database path:
    data/database/catalog.db (relative to this script's parent directory)

Note:
    This script should be run AFTER init_catalog.py.
    It will add new batches and inventory. If run multiple times, it might create
    duplicate-like dev batches if not handled (current version adds new batches each run).
"""

import sqlite3
from datetime import datetime, timedelta, date
from pathlib import Path
import sys

def connect_db(db_path_str):
    """Connects to the SQLite database."""
    db_path = Path(db_path_str)
    if not db_path.exists():
        print(f"Error: Database file {db_path} not found.")
        print("Please run init_catalog.py first to create the database and schema.")
        sys.exit(1)
    
    print(f"Connecting to database: {db_path}")
    conn = sqlite3.connect(db_path)
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def main():
    """Main function to load inventory data."""
    script_dir = Path(__file__).parent
    
    # Determine database path
    if len(sys.argv) > 1:
        db_path_arg = sys.argv[1]
    else:
        db_path_arg = str(script_dir / "database" / "catalog.db")

# Determine YAML path - REMOVED
# if len(sys.argv) > 2:
#     yaml_path_arg = sys.argv[2]
# else:
#     yaml_path_arg = str(script_dir / "products.yaml")

    conn = connect_db(db_path_arg)
# product_data = load_product_data(yaml_path_arg) # REMOVED
    cursor = conn.cursor()

    variants_processed = 0
    batches_created = 0
    inventory_updated = 0

    # Define SKUs to stock for development, with quantity and number of batches
    # Format: (SKU, quantity_per_batch, num_batches_to_create)
    dev_stock_data = [
        ("SEMAGLUTIDE-2MG", 10, 1),
        ("SEMAGLUTIDE-5MG", 5, 1),
        ("RETATRUTIDE-5MG", 8, 1),
        ("TIRZEPATIDE-10MG", 12, 1),
        ("BPC157-5MG", 15, 2),  # This will create 2 batches for BPC157-5MG
        ("TB500-10MG", 7, 1),
        ("CJC1295-2MG", 20, 1),
        ("IPAMORELIN-5MG", 25, 1),
        ("SELANK-10MG", 10, 1),
        ("EPITALON-20MG", 5, 1),
    ]

    print("Starting development inventory population...")

    for sku, quantity_per_batch, num_batches in dev_stock_data:
        # 1. Find variant_id by SKU
        cursor.execute("SELECT id FROM variants WHERE sku = ?", (sku,))
        variant_row = cursor.fetchone()
        if not variant_row:
            print(f"Warning: Variant with SKU '{sku}' not found in database. Skipping.")
            continue
        
        variant_id = variant_row[0]
        variants_processed +=1
        print(f"Processing SKU: {sku} (variant_id: {variant_id})")

        for i in range(num_batches):
            # Generate a unique batch_id for development
            # Check existing dev batches for this variant to avoid collision if script is run multiple times
            # This simple counter might not be robust enough for many re-runs, but ok for dev.
            dev_batch_suffix = 1
            while True:
                dev_batch_id_str = f"DEV-{sku}-{str(dev_batch_suffix).zfill(3)}"
                cursor.execute("SELECT id FROM batches WHERE variant_id = ? AND batch_id = ?", (variant_id, dev_batch_id_str))
                if not cursor.fetchone():
                    break # Found a unique dev batch ID
                dev_batch_suffix += 1
            
            # 2. Create new batch record
            manufactured_date = date.today().isoformat()
            expiration_date = (date.today() + timedelta(days=365)).isoformat()
            batch_pk = None
            try:
                cursor.execute(
                    "INSERT INTO batches (variant_id, batch_id, manufactured, expiration) VALUES (?, ?, ?, ?)",
                    (variant_id, dev_batch_id_str, manufactured_date, expiration_date)
                )
                batch_pk = cursor.lastrowid
                batches_created += 1
                print(f"  Created batch '{dev_batch_id_str}' for SKU '{sku}' with id {batch_pk}.")
            except sqlite3.IntegrityError as e:
                print(f"Error inserting batch for SKU '{sku}', generated batch_id '{dev_batch_id_str}': {e}")
                continue # Skip to next batch or SKU
            
            if batch_pk is None:
                print(f"Error: Could not obtain batch_pk for SKU '{sku}', batch_id '{dev_batch_id_str}'. Skipping inventory.")
                continue

            # 3. Create inventory for this new batch
            in_stock = 1 if quantity_per_batch > 0 else 0
            try:
                cursor.execute(
                    "INSERT INTO inventory (batch_id, quantity, in_stock) VALUES (?, ?, ?)",
                    (batch_pk, quantity_per_batch, in_stock)
                )
                inventory_updated +=1
                print(f"    Set inventory for batch id {batch_pk}: quantity={quantity_per_batch}, in_stock={bool(in_stock)}")
            except sqlite3.IntegrityError as e:
                 print(f"Error inserting inventory for batch_id {batch_pk} (SKU '{sku}'): {e}")

    conn.commit()
    conn.close()

    print("\nDevelopment inventory loading process complete.")
    print(f"SKUs processed from hardcoded list: {variants_processed}")
    print(f"New batches created: {batches_created}")
    print(f"Inventory records created: {inventory_updated}")

if __name__ == "__main__":
    main()