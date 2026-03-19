
import { Category, Product } from './types';

export const CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'Vegetables',
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1566385101042-1a000c1268c4?w=400&h=400&fit=crop'
  },
  {
    id: '2',
    name: 'Fruits',
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400&h=400&fit=crop'
  },
  {
    id: '3',
    name: 'Leafy Greens',
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop'
  },
  {
    id: '4',
    name: 'Dairy',
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1550583724-125581cc255b?w=400&h=400&fit=crop'
  },
  {
    id: '5',
    name: 'Organic',
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=400&fit=crop'
  },
  {
    id: '6',
    name: 'Essentials',
    is_active: true,
    image_url: 'https://images.unsplash.com/photo-1584473457406-6240486418e9?w=400&h=400&fit=crop'
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Fresh Red Tomatoes',
    category_id: '1',
    image_url: 'https://images.unsplash.com/photo-1582284540020-8acbe03f4424?w=400&h=400&fit=crop',
    description: 'Fresh and juicy red tomatoes sourced directly from local farms. Perfect for daily cooking, healthy salads, and rich gravies. High in Vitamin C and Lycopene.',
    is_trending: true,
    is_active: true,
    variants: [
      { id: 'v1_1', product_id: 'p1', weight: '500g', selling_price: 25, fake_price: 35, stock: 10 },
      { id: 'v1_2', product_id: 'p1', weight: '1 kg', selling_price: 45, fake_price: 60, stock: 15 },
      { id: 'v1_3', product_id: 'p1', weight: '2 kg', selling_price: 85, fake_price: 120, stock: 5 }
    ]
  },
  {
    id: 'p2',
    name: 'Alphonso Mangoes',
    category_id: '2',
    image_url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=400&fit=crop',
    description: 'The king of fruits - Devgad Alphonso. Known for its rich, sweet flavor and creamy texture. Hand-picked for the best quality and ripeness.',
    is_trending: true,
    is_active: true,
    variants: [
      { id: 'v2_1', product_id: 'p2', weight: '6 pcs', selling_price: 210, fake_price: 300, stock: 10 },
      { id: 'v2_2', product_id: 'p2', weight: '1 doz', selling_price: 399, fake_price: 550, stock: 4 }
    ]
  },
  {
    id: 'p3',
    name: 'Fresh Spinach',
    category_id: '3',
    image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop',
    description: 'Nutrient-rich, farm-fresh spinach bunches. Cleaned and ready for your healthy smoothies or delicious cooked dishes. Best quality greens sourced from Rewa mandi.',
    is_trending: true,
    is_active: true,
    variants: [
      { id: 'v3_1', product_id: 'p3', weight: '250g', selling_price: 20, fake_price: 35, stock: 15 },
      { id: 'v3_2', product_id: 'p3', weight: '500g', selling_price: 38, fake_price: 70, stock: 8 }
    ]
  },
  {
    id: 'p4',
    name: 'Organic Milk',
    category_id: '4',
    image_url: 'https://images.unsplash.com/photo-1563636619-e9107da5a766?w=400&h=400&fit=crop',
    description: 'Pure, organic farm milk with no preservatives. Rich in calcium and essential vitamins. Delivered within hours of milking for maximum freshness.',
    is_trending: false,
    is_active: true,
    variants: [
      { id: 'v4_1', product_id: 'p4', weight: '500 ml', selling_price: 45, fake_price: 50, stock: 20 },
      { id: 'v4_2', product_id: 'p4', weight: '1 L', selling_price: 85, fake_price: 95, stock: 50 }
    ]
  },
  {
    id: 'p5',
    name: 'Baby Carrots',
    category_id: '1',
    image_url: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=400&fit=crop',
    description: 'Sweet and crunchy baby carrots. Ideal for snacks, lunchbox additions, or roasting as a side dish. Freshly sourced and hand-selected for premium quality.',
    is_trending: true,
    is_active: true,
    variants: [
      { id: 'v5_1', product_id: 'p5', weight: '250g', selling_price: 30, fake_price: 45, stock: 10 },
      { id: 'v5_2', product_id: 'p5', weight: '500g', selling_price: 55, fake_price: 80, stock: 12 }
    ]
  },
  {
    id: 'p6',
    name: 'Green Broccoli',
    category_id: '5',
    image_url: 'https://images.unsplash.com/photo-1453365607868-7deed8cc7d26?w=400&h=400&fit=crop',
    description: 'Premium organic broccoli florets. Rich in antioxidants and perfect for stir-fries, steaming, or salad bowls. Sourced from certified organic farms.',
    is_trending: true,
    is_active: true,
    variants: [
      { id: 'v6_1', product_id: 'p6', weight: '250g', selling_price: 65, fake_price: 95, stock: 5 },
      { id: 'v6_2', product_id: 'p6', weight: '500g', selling_price: 120, fake_price: 180, stock: 3 }
    ]
  }
];
