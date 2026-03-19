-- MASTER SCHEMA FOR GALIMANDI (Consolidated for Customer App & Admin Panel)
-- This schema unifies both applications on a normalized structure.

-- 1. USERS TABLE (Linked to Auth Profiles)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    mobile TEXT UNIQUE NOT NULL,
    name TEXT,
    role TEXT CHECK (role IN ('customer', 'admin', 'staff')) DEFAULT 'customer',
    wallet_balance DECIMAL(10, 2) DEFAULT 0,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ DEFAULT NOW()
);

-- 1.1 OTP LOGS TABLE
CREATE TABLE IF NOT EXISTS otp_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mobile TEXT NOT NULL,
    otp TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_otp_logs_mobile ON otp_logs(mobile);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    is_trending BOOLEAN DEFAULT FALSE,
    is_fast_selling BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCT VARIANTS TABLE
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    weight TEXT NOT NULL, -- e.g., "250g", "500g", "1kg"
    base_price_per_kg DECIMAL(10, 2),
    fake_price DECIMAL(10, 2), -- MRP
    selling_price DECIMAL(10, 2) NOT NULL,
    discount_percent INTEGER,
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    address_text TEXT NOT NULL,
    house_no TEXT,
    area TEXT,
    landmark TEXT,
    lat DECIMAL(10, 8),
    lng DECIMAL(11, 8),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ORDERS TABLE
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    readable_id TEXT UNIQUE, -- e.g., ORD-1234
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    address_id UUID REFERENCES addresses(id),
    customer_name TEXT, -- Denormalized for quick access in admin panel
    customer_phone TEXT, -- Denormalized for quick access in admin panel
    total_amount DECIMAL(10, 2) NOT NULL,
    delivery_charge DECIMAL(10, 2) DEFAULT 0,
    distance_km DECIMAL(10, 2),
    payment_method TEXT CHECK (payment_method IN ('UPI', 'Card', 'Net Banking', 'Wallet', 'COD')),
    status TEXT CHECK (status IN ('Placed', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled')) DEFAULT 'Placed',
    slot TEXT,
    timeline JSONB, -- Array of events: [{"status": "Placed", "date": "..."}]
    is_rated BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id),
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    weight TEXT
);

-- 8. PAYMENTS & REFUNDS
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    method TEXT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    status TEXT CHECK (status IN ('Pending', 'Processed', 'Failed')) DEFAULT 'Pending',
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. COUPONS TABLE
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'flat')),
    value DECIMAL(10, 2) NOT NULL,
    min_order DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    expiry_date TIMESTAMPTZ,
    is_once_per_user BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupon_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users ON DELETE CASCADE,
    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, coupon_id)
);

-- 10. BANNERS TABLE
CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    subtitle TEXT,
    image_url TEXT NOT NULL,
    cta_text TEXT DEFAULT 'Shop Now',
    cta_action TEXT CHECK (cta_action IN ('category', 'product', 'external', 'offers', 'url')),
    cta_value TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users ON DELETE SET NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    message TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. ISSUES TABLE
CREATE TABLE IF NOT EXISTS issues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    customer_name TEXT,
    customer_phone TEXT,
    type TEXT, -- 'Wrong Item', 'Damaged Item', etc.
    description TEXT,
    image_url TEXT,
    status TEXT CHECK (status IN ('Open', 'Review', 'Resolved', 'Closed')) DEFAULT 'Open',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. ADMINS TABLE (For secondary admin check or non-auth access if needed)
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT CHECK (role IN ('MASTER', 'STAFF')),
    password TEXT NOT NULL, -- Specifically for admin panel login
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ
);

-- 14. SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    opening_time TEXT DEFAULT '07:00',
    closing_time TEXT DEFAULT '22:00',
    is_store_shutdown BOOLEAN DEFAULT FALSE,
    min_order_value DECIMAL(10, 2) DEFAULT 80,
    free_delivery_threshold DECIMAL(10, 2) DEFAULT 499,
    support_number TEXT DEFAULT '+91 98765 43210',
    support_email TEXT DEFAULT 'care@galimandi.com',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. ADMIN LOGS
CREATE TABLE IF NOT EXISTS admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_name TEXT,
    action TEXT NOT NULL,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial Data
INSERT INTO system_settings (id) VALUES (1) ON CONFLICT DO NOTHING;

INSERT INTO admins (name, email, phone, role, password) 
VALUES 
    ('Rahul Sharma', 'rahul@galimandi.com', '9876543210', 'MASTER', 'password123'),
    ('Shivansh Sahu', 'shivanshsahu1947@gmail.com', '9876543210', 'MASTER', 'shivansh1234')
ON CONFLICT (email) DO NOTHING;

-- SECURITY: RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

-- Basic Policies
CREATE POLICY "Public read categories" ON categories FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Public read products" ON products FOR SELECT TO public USING (is_active = true);
CREATE POLICY "Public read variants" ON product_variants FOR SELECT TO public USING (true);
CREATE POLICY "Users view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users view own addresses" ON addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users manage own addresses" ON addresses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users view own order items" ON order_items FOR SELECT USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));
