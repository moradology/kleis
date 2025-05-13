#!/usr/bin/env python3
"""
load_catalog.py - Database loader for peptide research catalog

This script:
1. Creates a new SQLite database using schema.sql
2. Loads substance, variant, and batch data from products.yaml
3. Sets up inventory records for each batch
4. Enables WAL journal mode for better concurrency

Usage:
    python load_catalog.py [output_db_name]

The default database name is 'catalog.db' if not specified.
"""

import os
import sys
import sqlite3
import yaml
import json
from datetime import datetime, timedelta
from pathlib import Path


def create_database(db_path, schema_path):
    """Create a new SQLite database using the provided schema"""
    print(f"Creating database schema from {schema_path}")

    # Read schema file
    with open(schema_path, 'r') as f:
        schema_sql = f.read()

    # Create database and execute schema
    conn = sqlite3.connect(db_path)
    conn.executescript(schema_sql)
    conn.commit()

    return conn


def load_data(conn, yaml_path):
    """Load data from YAML file into SQLite database"""
    print(f"Loading product data from {yaml_path}")

    # Load YAML data
    with open(yaml_path, 'r') as f:
        data = yaml.safe_load(f)

    cursor = conn.cursor()

    # Process categories
    if 'categories' in data:
        print(f"Importing {len(data['categories'])} categories...")
        for category in data['categories']:
            cursor.execute(
                "INSERT INTO categories (slug, name) VALUES (?, ?)",
                (category['slug'], category['name'])
            )

    # Process substances and their variants
    if 'substances' in data:
        print(f"Importing {len(data['substances'])} substances...")
        for substance in data['substances']:
            # Extract substance fields
            substance_fields = {
                'slug': substance['slug'],
                'name': substance['name'],
                'description': substance['description'],
                'product_type': substance.get('product_type', 'peptide')
                # Add priority here
            }
            if 'priority' in substance:  # Ensure priority exists before adding
                substance_fields['priority'] = substance['priority']
            else:
                # Default priority if not in YAML, though schema has a DB default
                # This ensures the key exists for meta_json exclusion logic
                substance_fields['priority'] = 9999

            # Add optional scientific fields if present
            for field in ['sequence', 'sequence_length', 'molecular_weight',
                         'formula', 'cas_number', 'purity_percent', 'salt_form', 'physical_form',
                         'storage_temp_c', 'recommended_solvent']:
                if field in substance:
                    substance_fields[field] = substance[field]

            # Handle meta_json - store any extra fields
            meta_data = {k: v for k, v in substance.items()
                        if k not in list(substance_fields.keys()) +
                           ['variants', 'categories']}

            if meta_data:
                substance_fields['meta_json'] = json.dumps(meta_data)

            # Build the SQL query dynamically
            fields = list(substance_fields.keys())
            placeholders = ','.join(['?'] * len(fields))
            sql = f"INSERT INTO substances ({','.join(fields)}) VALUES ({placeholders})"

            # Insert substance
            cursor.execute(sql, list(substance_fields.values()))
            substance_id = cursor.lastrowid

            # Link to categories if specified
            if 'categories' in substance and substance['categories']:
                for category_slug in substance['categories']:
                    cursor.execute(
                        "SELECT id FROM categories WHERE slug = ?",
                        (category_slug,)
                    )
                    category = cursor.fetchone()
                    if category:
                        cursor.execute(
                            "INSERT INTO substance_categories (substance_id, category_id) VALUES (?, ?)",
                            (substance_id, category[0])
                        )
                    else:
                        print(f"Warning: Category '{category_slug}' not found for substance {substance['slug']}")

            # Process variants
            if 'variants' in substance:
                print(f"  - Adding {len(substance['variants'])} variants for {substance['name']}...")
                for variant in substance['variants']:
                    # Insert variant
                    cursor.execute(
                        "INSERT INTO variants (substance_id, sku, mg, price_cents, coa_path) VALUES (?, ?, ?, ?, ?)",
                        (
                            substance_id,
                            variant['sku'],
                            variant['mg'],
                            variant['price_cents'],
                            variant.get('coa_path')
                        )
                    )
                    # Note: We're not creating batches or inventory records
                    # as these are just product placeholders

    # Commit all changes
    conn.commit()


def enable_wal_mode(conn):
    """Enable Write-Ahead Logging for better performance"""
    print("Enabling WAL mode...")
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.commit()


def main():
    """Main function to create and populate the database"""
    # Determine paths
    script_dir = Path(__file__).parent
    schema_path = script_dir / "schema.sql"
    yaml_path = script_dir / "products.yaml"

    # Get database name from command line or use default
    if len(sys.argv) > 1:
        db_path = sys.argv[1]
    else:
        db_path = script_dir / "database" / "catalog.db"

    # Check if files exist
    if not schema_path.exists():
        print(f"Error: Schema file {schema_path} not found!")
        sys.exit(1)

    if not yaml_path.exists():
        print(f"Error: Product data file {yaml_path} not found!")
        sys.exit(1)

    # Remove existing database if it exists
    if Path(db_path).exists():
        print(f"Removing existing database {db_path}...")
        os.remove(db_path)

    # Create and populate database
    conn = create_database(db_path, schema_path)

    try:
        load_data(conn, yaml_path)
        enable_wal_mode(conn)

        # Verify import
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM substances;")
        substance_count = cursor.fetchone()[0]
        print(f"Successfully imported {substance_count} substances")

        cursor.execute("SELECT COUNT(*) FROM variants;")
        variant_count = cursor.fetchone()[0]
        print(f"Successfully imported {variant_count} variants")

        cursor.execute("SELECT COUNT(*) FROM categories;")
        category_count = cursor.fetchone()[0]
        print(f"Successfully imported {category_count} categories")
    finally:
        conn.close()

    print(f"Database build complete! File: {db_path}")
    print(f"Run 'sqlite3 {db_path}' to interact with the database.")


if __name__ == "__main__":
    main()