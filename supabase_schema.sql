-- ==============================================================================
-- StockSense - Production Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor to deploy the database tables & triggers
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Warehouses Table
CREATE TABLE IF NOT EXISTS warehouses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    address TEXT,
    is_primary BOOLEAN DEFAULT FALSE,
    locations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    unit TEXT NOT NULL,
    unit_price NUMERIC(12, 2) DEFAULT 0.00,
    reorder_level INTEGER DEFAULT 10,
    description TEXT,
    supplier TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Product Stock by Warehouse
CREATE TABLE IF NOT EXISTS product_stock (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    warehouse_id TEXT NOT NULL REFERENCES warehouses(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 0,
    location TEXT DEFAULT 'Rack A-01',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_product_warehouse UNIQUE (product_id, warehouse_id)
);

-- 5. Inbound Receipts Table
CREATE TABLE IF NOT EXISTS receipts (
    id TEXT PRIMARY KEY,
    supplier TEXT NOT NULL,
    product_id TEXT NOT NULL REFERENCES products(id),
    product_name TEXT NOT NULL,
    sku TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit TEXT NOT NULL,
    warehouse_id TEXT NOT NULL REFERENCES warehouses(id),
    warehouse_name TEXT NOT NULL,
    location TEXT,
    status TEXT NOT NULL DEFAULT 'READY', -- READY, DONE, DRAFT, CANCELLED
    scheduled_date DATE,
    completed_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Outbound Deliveries Table
CREATE TABLE IF NOT EXISTS deliveries (
    id TEXT PRIMARY KEY,
    customer TEXT NOT NULL,
    product_id TEXT NOT NULL REFERENCES products(id),
    product_name TEXT NOT NULL,
    sku TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit TEXT NOT NULL,
    warehouse_id TEXT NOT NULL REFERENCES warehouses(id),
    warehouse_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'WAITING', -- WAITING, DONE, DRAFT, CANCELLED
    scheduled_date DATE,
    completed_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Internal Transfers Table
CREATE TABLE IF NOT EXISTS transfers (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id),
    product_name TEXT NOT NULL,
    sku TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit TEXT NOT NULL,
    source_warehouse_id TEXT NOT NULL REFERENCES warehouses(id),
    source_warehouse_name TEXT NOT NULL,
    dest_warehouse_id TEXT NOT NULL REFERENCES warehouses(id),
    dest_warehouse_name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'DONE', -- DONE, IN_TRANSIT, DRAFT
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT
);

-- 8. Adjustments Table
CREATE TABLE IF NOT EXISTS adjustments (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id),
    product_name TEXT NOT NULL,
    sku TEXT NOT NULL,
    warehouse_id TEXT NOT NULL REFERENCES warehouses(id),
    warehouse_name TEXT NOT NULL,
    system_quantity INTEGER NOT NULL,
    counted_quantity INTEGER NOT NULL,
    difference INTEGER NOT NULL,
    unit TEXT NOT NULL,
    reason TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    operator TEXT NOT NULL
);

-- 9. Move History (Ledger) Table
CREATE TABLE IF NOT EXISTS move_history (
    id TEXT PRIMARY KEY,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    type TEXT NOT NULL, -- RECEIPT, DELIVERY, TRANSFER, ADJUSTMENT, INITIAL
    product_id TEXT NOT NULL REFERENCES products(id),
    product_name TEXT NOT NULL,
    sku TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit TEXT NOT NULL,
    source TEXT NOT NULL,
    destination TEXT NOT NULL,
    operator TEXT NOT NULL,
    reference_id TEXT NOT NULL,
    notes TEXT
);

-- 10. Enable Row Level Security (RLS) - Defaults to Public Access for Hackathon Demo
ALTER TABLE warehouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE move_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read-write for demo" ON warehouses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for demo" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for demo" ON product_stock FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for demo" ON receipts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for demo" ON deliveries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for demo" ON transfers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for demo" ON adjustments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public read-write for demo" ON move_history FOR ALL USING (true) WITH CHECK (true);
