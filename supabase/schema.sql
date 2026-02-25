-- =====================================================
-- POMPA TEKNİK MARKET - SUPABASE DATABASE SCHEMA
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CATEGORIES TABLE (Hierarchical)
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  main_type VARCHAR(50) CHECK (main_type IN ('pompa', 'yedek_parca')),
  image_url TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_main_type ON categories(main_type);

-- =====================================================
-- COLLECTIONS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  collection_type VARCHAR(50) NOT NULL CHECK (collection_type IN ('yeni_gelenler', 'cok_satanlar', 'indirimdekiler', 'ozel')),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collections_slug ON collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_type ON collections(collection_type);

-- =====================================================
-- PRODUCTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE NOT NULL,
  short_description VARCHAR(500),
  description TEXT,
  price DECIMAL(12,2) NOT NULL DEFAULT 0,
  original_price DECIMAL(12,2),
  sku VARCHAR(100),
  stock INTEGER DEFAULT 0,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  brand VARCHAR(255),
  model VARCHAR(255),
  unit VARCHAR(50) DEFAULT 'Adet',
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  sale_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_sale_count ON products(sale_count DESC);

-- =====================================================
-- PRODUCT FEATURES (Specs/Özellikler)
-- =====================================================
CREATE TABLE IF NOT EXISTS product_features (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  feature_name VARCHAR(255) NOT NULL,
  feature_value TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_features_product_id ON product_features(product_id);

-- =====================================================
-- PRODUCT IMAGES
-- =====================================================
CREATE TABLE IF NOT EXISTS product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt_text VARCHAR(500),
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);

-- =====================================================
-- PRODUCT COLLECTIONS (Many-to-Many)
-- =====================================================
CREATE TABLE IF NOT EXISTS product_collections (
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (product_id, collection_id)
);

CREATE INDEX IF NOT EXISTS idx_product_collections_product_id ON product_collections(product_id);
CREATE INDEX IF NOT EXISTS idx_product_collections_collection_id ON product_collections(collection_id);

-- =====================================================
-- ADMIN USERS (Simple admin auth)
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- UPDATED_AT TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_collections_updated_at
  BEFORE UPDATE ON collections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- DEFAULT COLLECTIONS
-- =====================================================
INSERT INTO collections (name, slug, collection_type, description, sort_order) VALUES
  ('Yeni Gelenler', 'yeni-gelenler', 'yeni_gelenler', 'En son eklenen ürünler', 1),
  ('Çok Satanlar', 'cok-satanlar', 'cok_satanlar', 'En çok satılan ürünler', 2),
  ('İndirimdekiler', 'indirimdekiler', 'indirimdekiler', 'İndirimli ürünler', 3)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- DEFAULT CATEGORIES
-- =====================================================
INSERT INTO categories (name, slug, main_type, description, sort_order) VALUES
  ('Pompalar', 'pompalar', 'pompa', 'Tüm pompa çeşitleri', 1),
  ('Yedek Parçalar', 'yedek-parcalar', 'yedek_parca', 'Tüm yedek parçalar', 2)
ON CONFLICT (slug) DO NOTHING;

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_collections ENABLE ROW LEVEL SECURITY;

-- Public read policies (storefront)
CREATE POLICY "Public can read active categories" ON categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read active collections" ON collections
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read active products" ON products
  FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read product features" ON product_features
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM products WHERE products.id = product_features.product_id AND products.is_active = true)
  );

CREATE POLICY "Public can read product images" ON product_images
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM products WHERE products.id = product_images.product_id AND products.is_active = true)
  );

CREATE POLICY "Public can read product collections" ON product_collections
  FOR SELECT USING (true);

-- Admin full access (using service role key in server actions)
-- These policies allow anon role to do everything for admin panel
-- In production, replace with proper auth
CREATE POLICY "Admin full access categories" ON categories
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access collections" ON collections
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access products" ON products
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access product_features" ON product_features
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access product_images" ON product_images
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Admin full access product_collections" ON product_collections
  FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- STORAGE BUCKET (Run after creating bucket in dashboard)
-- =====================================================
-- Create bucket named 'product-images' in Supabase Storage Dashboard
-- Then run:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);
