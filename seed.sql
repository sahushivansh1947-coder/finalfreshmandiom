-- =============================================
-- SEED DATA for Galimandi
-- Run this in InsForge SQL Editor after schema.sql
-- =============================================

-- 1. INSERT CATEGORIES
INSERT INTO categories (id, name, icon, color, image) VALUES
('1', 'Vegetables', 'Carrot', 'bg-green-500', 'https://images.unsplash.com/photo-1566385101042-1a000c1268c4?w=400&h=400&fit=crop'),
('2', 'Fruits', 'Apple', 'bg-red-500', 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=400&fit=crop'),
('3', 'Leafy Greens', 'Leaf', 'bg-emerald-500', 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop'),
('4', 'Dairy', 'Milk', 'bg-blue-500', 'https://images.unsplash.com/photo-1550583724-125581cc255b?w=400&h=400&fit=crop'),
('5', 'Organic', 'Sparkles', 'bg-amber-500', 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop'),
('6', 'Essentials', 'Coffee', 'bg-purple-500', 'https://images.unsplash.com/photo-1584473457406-6240486418e9?w=400&h=400&fit=crop');

-- 2. INSERT PRODUCTS
INSERT INTO products (name, price, mrp, unit, category, image, discount, description, is_trending, stock, variants) VALUES
(
  'Fresh Red Tomatoes',
  45.00, 60.00, '1 kg', 'Vegetables',
  'https://images.unsplash.com/photo-1582284540020-8acbe03f4424?w=400&h=400&fit=crop',
  25,
  'Fresh and juicy red tomatoes sourced directly from local farms. Perfect for daily cooking, healthy salads, and rich gravies. High in Vitamin C and Lycopene.',
  TRUE, 15,
  '[{"unit": "500g", "price": 25, "mrp": 35}, {"unit": "1 kg", "price": 45, "mrp": 60}, {"unit": "2 kg", "price": 85, "mrp": 120}]'
),
(
  'Alphonso Mangoes',
  399.00, 550.00, '1 doz', 'Fruits',
  'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=400&fit=crop',
  27,
  'The king of fruits - Devgad Alphonso. Known for its rich, sweet flavor and creamy texture. Hand-picked for the best quality and ripeness.',
  TRUE, 4,
  '[{"unit": "6 pcs", "price": 210, "mrp": 300}, {"unit": "1 doz", "price": 399, "mrp": 550}]'
),
(
  'Fresh Spinach',
  20.00, 35.00, '250g', 'Leafy Greens',
  'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop',
  42,
  'Nutrient-rich, farm-fresh spinach bunches. Cleaned and ready for your healthy smoothies or delicious cooked dishes. Best quality greens sourced from Rewa mandi.',
  TRUE, 8,
  '[{"unit": "250g", "price": 20, "mrp": 35}, {"unit": "500g", "price": 38, "mrp": 70}]'
),
(
  'Organic Milk',
  85.00, 95.00, '1 L', 'Dairy',
  'https://images.unsplash.com/photo-1563636619-e9107da5a766?w=400&h=400&fit=crop',
  10,
  'Pure, organic farm milk with no preservatives. Rich in calcium and essential vitamins. Delivered within hours of milking for maximum freshness.',
  FALSE, 50,
  '[{"unit": "500 ml", "price": 45, "mrp": 50}, {"unit": "1 L", "price": 85, "mrp": 95}]'
),
(
  'Baby Carrots',
  55.00, 80.00, '500g', 'Vegetables',
  'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop',
  31,
  'Sweet and crunchy baby carrots. Ideal for snacks, lunchbox additions, or roasting as a side dish. Freshly sourced and hand-selected for premium quality.',
  TRUE, 12,
  '[{"unit": "250g", "price": 30, "mrp": 45}, {"unit": "500g", "price": 55, "mrp": 80}]'
),
(
  'Green Broccoli',
  120.00, 180.00, '500g', 'Organic',
  'https://images.unsplash.com/photo-1453365607868-7deed8cc7d26?w=400&h=400&fit=crop',
  33,
  'Premium organic broccoli florets. Rich in antioxidants and perfect for stir-fries, steaming, or salad bowls. Sourced from certified organic farms.',
  TRUE, 3,
  '[{"unit": "250g", "price": 65, "mrp": 95}, {"unit": "500g", "price": 120, "mrp": 180}]'
);

-- 3. INSERT ADMINS (Requires admins table from db_extension.sql)
INSERT INTO admins (name, email, phone, role, password)
VALUES 
    ('Shivansh Sahu', 'shivanshsahu1947@gmail.com', '9876543210', 'MASTER', 'shivansh1234')
ON CONFLICT (email) DO NOTHING;
