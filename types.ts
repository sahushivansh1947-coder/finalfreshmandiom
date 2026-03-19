export interface ProductVariant {
  id: string;
  product_id: string;
  weight: string;
  base_price_per_kg?: number;
  fake_price?: number;
  selling_price: number;
  discount_percent?: number;
  stock: number;
  unit?: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description?: string;
  image_url: string;
  is_trending?: boolean;
  is_fast_selling?: boolean;
  is_active?: boolean;
  variants?: ProductVariant[];
}

export interface CartItem {
  id: string; // This will be the variant ID
  product_id: string;
  name: string;
  price: number;
  weight: string;
  quantity: number;
  image_url: string;
}

export interface Category {
  id: string;
  name: string;
  is_active: boolean;
  image_url?: string;
  icon?: string;
}

export interface ManualAddress {
  house_no: string;
  area: string;
  city: string;
  landmark?: string;
  lat?: number;
  lng?: number;
  type?: 'Home' | 'Work' | 'Other';
}

export interface Order {
  id: string;
  readable_id?: string;
  user_id: string;
  address_id?: string;
  total_amount: number;
  delivery_charge: number;
  distance_km: number;
  payment_method: string;
  status: 'Placed' | 'Packed' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  slot?: string;
  timeline?: { status: string; date: string }[];
  items?: any[];
  is_rated?: boolean;
  created_at?: string;
}

export interface Review {
  id: string;
  order_id: string;
  user_id?: string;
  rating: number;
  message?: string;
  is_public: boolean;
  created_at: string;
}

export interface Offer {
  title: string;
  discount: string;
  image: string;
  color: string;
  stockLeft: number;
  offerType: 'category' | 'product' | 'combo';
  targetId?: string;
  isExpired?: boolean;
}
