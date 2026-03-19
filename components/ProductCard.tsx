
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Product, CartItem } from '../types';
import { useApp } from '../App';

interface ProductCardProps {
  product: Product;
  delay?: number;
  hideAddToCart?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, delay = 0, hideAddToCart = false }) => {
  const { addToCart, updateQuantity, cart, likes, toggleLike, categories } = useApp();
  const navigate = useNavigate();

  const [selectedVariant, setSelectedVariant] = React.useState<any>(null);
  const variant = selectedVariant || product.variants?.[0] || { id: product.id, selling_price: 0, fake_price: 0, weight: 'N/A' } as any;
  const cartItem = cart.find(item => item.id === variant.id);
  const quantity = cartItem?.quantity || 0;
  const isLiked = likes.includes(product.id);

  // Build priority-ordered badge list
  type Badge = { key: string; label: string; color: string };
  const allBadges: Badge[] = [];

  const discount = variant.fake_price > variant.selling_price
    ? Math.round(((variant.fake_price - variant.selling_price) / variant.fake_price) * 100)
    : 0;

  if (discount > 0) {
    allBadges.push({ key: 'discount', label: `${discount}% OFF`, color: 'bg-accent' });
  }
  if (product.is_trending) {
    allBadges.push({ key: 'trending', label: 'TRENDING', color: 'bg-primary' });
  }
  if (product.is_fast_selling) {
    allBadges.push({ key: 'selling', label: 'SELLING FAST', color: 'bg-amber-500' });
  }

  // On mobile show max 2 badges; on desktop show all (handled via CSS classes)
  const mobileBadges = allBadges.slice(0, 2);
  const desktopOnlyBadges = allBadges.slice(2);

  const handleCardClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!variant.id) return;
    const item: CartItem = {
      id: variant.id,
      product_id: product.id,
      name: product.name,
      price: variant.selling_price,
      weight: variant.weight,
      quantity: 1,
      image_url: product.image_url
    };
    if (navigator.vibrate) navigator.vibrate(20);
    addToCart(item);
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white rounded-2xl p-2 md:p-3 border border-gray-100 hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 group flex flex-col cursor-pointer h-fit"
    >
      {/* Image + Badges */}
      <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-gray-50">
        <img
          src={product.image_url}
          alt={product.name}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400';
            (e.target as HTMLImageElement).alt = ''; // Clear alt text to prevent overlapping if image failed but fallback works
          }}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Badge container */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-col gap-1 sm:gap-2 max-w-[calc(100%-3rem)]">
          {mobileBadges.map(badge => (
            <div key={badge.key} className={`${badge.color} text-white font-bold rounded-full shadow-lg text-[8px] px-1.5 py-0.5 sm:text-[10px] sm:px-2.5 sm:py-1 truncate`}>
              {badge.label}
            </div>
          ))}
          {desktopOnlyBadges.map(badge => (
            <div key={badge.key} className={`${badge.color} text-white font-bold rounded-full shadow-lg hidden sm:block text-[10px] px-2.5 py-1 truncate`}>
              {badge.label}
            </div>
          ))}
        </div>

        {/* Like button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (navigator.vibrate) navigator.vibrate(15);
            toggleLike(product.id);
          }}
          className={`absolute top-2 right-2 sm:top-3 sm:right-3 p-2 sm:p-2.5 rounded-full transition-all duration-300 ${isLiked ? 'bg-red-500 text-white shadow-red-200' : 'bg-white/80 text-gray-400 hover:text-red-500 shadow-sm'} backdrop-blur-md shadow-lg`}
        >
          <Heart size={14} className="sm:hidden" fill={isLiked ? 'currentColor' : 'none'} />
          <Heart size={16} className="hidden sm:block" fill={isLiked ? 'currentColor' : 'none'} />
        </button>

        {/* Floating Quantity Controls (Only visible if in cart) */}
        {quantity > 0 && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 flex items-center bg-primary text-white p-1 rounded-xl shadow-xl shadow-primary/30 z-20 border border-white/20"
          >
            <button
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(10);
                updateQuantity(variant.id, -1);
              }}
              className="p-1 px-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Minus size={14} strokeWidth={3} />
            </button>
            <span className="w-6 text-center text-xs font-black">{quantity}</span>
            <button
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(10);
                updateQuantity(variant.id, 1);
              }}
              className="p-1 px-1.5 hover:bg-white/10 rounded-lg transition-colors"
            >
              <Plus size={14} strokeWidth={3} />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="px-1 flex flex-col gap-1">
        <div className="text-[10px] font-black text-primary uppercase tracking-widest opacity-60">
          {categories.find((c: any) => c.id === product.category_id)?.name || 'Produce'}
        </div>
        <h3 className="text-sm font-bold text-gray-900 leading-tight line-clamp-1">
          {product.name}
        </h3>
        <div className="text-[10px] font-bold text-gray-400">{variant.weight}</div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-base font-black text-gray-900">₹{variant.selling_price}</span>
          {variant.fake_price > variant.selling_price && (
            <span className="text-[10px] text-gray-400 line-through">₹{variant.fake_price}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
