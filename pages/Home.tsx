
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ChevronRight, Zap, Star, ShieldCheck, Clock, Tag, Sparkles, MapPin,
  Carrot, Apple, Leaf, Milk, Coffee, ShoppingBag, RotateCcw, Headset, Truck
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductSkeleton, { CategorySkeleton } from '../components/ProductSkeleton';
import OfferCard from '../components/OfferCard';
import PublicReviews from '../components/PublicReviews';
import { useApp, isStoreOpen, formatStoreTime } from '../App';
import { Offer } from '../types';

// Helper to render the correct category icon based on string name
const CategoryIcon = ({ name, className }: { name: string, className?: string }) => {
  switch (name) {
    case 'Carrot': return <Carrot className={className} />;
    case 'Apple': return <Apple className={className} />;
    case 'Leaf': return <Leaf className={className} />;
    case 'Milk': return <Milk className={className} />;
    case 'Coffee': return <Coffee className={className} />;
    case 'Sparkles': return <Sparkles className={className} />;
    default: return <ShoppingBag className={className} />;
  }
};

// Auto-assign icon and color based on category name (for categories from DB that don't have these fields)
const getCategoryMeta = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes('vegetable')) return { icon: 'Carrot', color: 'bg-green-500' };
  if (name.includes('fruit')) return { icon: 'Apple', color: 'bg-red-500' };
  if (name.includes('leafy') || name.includes('green')) return { icon: 'Leaf', color: 'bg-emerald-500' };
  if (name.includes('dairy') || name.includes('milk')) return { icon: 'Milk', color: 'bg-blue-500' };
  if (name.includes('organic')) return { icon: 'Sparkles', color: 'bg-purple-500' };
  if (name.includes('essential') || name.includes('staple')) return { icon: 'Coffee', color: 'bg-amber-500' };
  if (name.includes('spice') || name.includes('masala')) return { icon: 'Sparkles', color: 'bg-orange-500' };
  return { icon: 'ShoppingBag', color: 'bg-primary' };
};

const Hero = ({ settings }: { settings: any }) => {
  const storeOpen = isStoreOpen(settings);

  const scrollToCategories = () => {
    document.getElementById('categories-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative overflow-hidden bg-brandBeige min-h-[90vh] flex items-center pt-10">
      <div className="absolute top-0 right-0 w-full md:w-2/3 h-full bg-brandGreen/10 organic-blob -translate-y-1/4 translate-x-1/4 pointer-events-none" />

      {settings && !storeOpen && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 w-full max-w-xl px-4">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-red-600 text-white p-4 rounded-3xl shadow-2xl flex items-center justify-center gap-4 border border-red-500/50 backdrop-blur-md"
          >
            <Clock size={24} className="animate-pulse" />
            <div className="text-center">
              <div className="text-sm font-black uppercase tracking-widest">Store is currently closed</div>
              <div className="text-[10px] opacity-80 font-bold">We open at {formatStoreTime(settings?.openingTime)}. See you then!</div>
            </div>
          </motion.div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center lg:text-left"
        >
          <div className="inline-flex items-center space-x-2 bg-brandGreen/10 text-brandGreen px-5 py-2 rounded-full mb-8 font-bold text-xs uppercase tracking-widest border border-brandGreen/20">
            <Sparkles size={14} />
            <span>Premium Fresh Quality</span>
          </div>

          <h1 className="text-6xl lg:text-8xl font-serif text-gray-900 leading-[0.9] mb-8 italic">
            Truly <br />
            <span className="text-brandGreen not-italic font-brand">FRESH</span> <br />
            <span className="text-4xl lg:text-6xl font-sans font-light tracking-tight text-gray-500 lowercase">from our fields</span>
          </h1>

          <p className="text-lg text-gray-600 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
            Discover the vibrant world of hyperlocal delivery. Direct from mandi to your doorstep in 30 minutes.
            We source fresh, you enjoy healthy.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center lg:justify-start">
            <div className="relative flex-grow max-w-md">
              <input
                type="text"
                placeholder="Enter your Pincode"
                className="w-full bg-white border border-gray-100 focus:border-brandGreen/40 rounded-full py-5 pl-14 pr-6 outline-none transition-all shadow-xl shadow-gray-200/50 text-lg font-medium"
              />
              <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-brandGreen" size={24} />
            </div>
            <motion.button
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(10);
                scrollToCategories();
              }}
              disabled={!storeOpen}
              whileTap={{ scale: 0.95 }}
              className={`px-10 py-5 rounded-full font-black shadow-2xl transition-all duration-200 flex items-center justify-center space-x-2 group active:scale-95 text-lg uppercase tracking-tighter ${storeOpen ? 'bg-brandGreen hover:bg-green-800 text-white shadow-brandGreen/30' : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'}`}
            >
              <span>{storeOpen ? 'Order Now' : 'Store Closed'}</span>
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </div>

          <div className="flex items-center justify-center lg:justify-start space-x-8 opacity-70">
            <div className="text-center">
              <div className="text-2xl font-brand text-gray-900">100%</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Natural</div>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <div className="text-2xl font-brand text-gray-900">30m</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Delivery</div>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
              <div className="text-2xl font-brand text-gray-900">4.9/5</div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Rating</div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1.2, ease: "circOut" }}
          className="relative lg:h-[700px] flex items-center justify-center"
        >
          <div className="relative w-full aspect-square max-w-[550px] group">
            <div className="absolute inset-0 bg-brandGreen/5 rounded-full animate-spin-slow blur-xl" />
            <div className="relative w-full h-full rounded-full overflow-hidden border-[12px] border-white shadow-3xl z-10 transition-transform duration-700 group-hover:scale-105">
              <img
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200"
                alt="Fresh Market Vegetables"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>

            <motion.div
              animate={{ y: [0, -30, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full border-[6px] border-white shadow-2xl z-20 overflow-hidden hidden md:block"
            >
              <img src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400" className="w-full h-full object-cover" alt="mini fruit" />
            </motion.div>

            <div className="absolute top-10 -right-12 glass p-6 rounded-3xl shadow-2xl z-30 border border-white/50 backdrop-blur-xl animate-float">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent rounded-2xl flex items-center justify-center text-white font-black text-xs">
                  -50%
                </div>
                <div>
                  <div className="text-sm font-black text-gray-900 leading-none">Flash Sale</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Ends in 2h</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const OffersZone = () => {
  const { notify } = useApp();
  const [timeLeft, setTimeLeft] = useState({ h: 2, m: 45, s: 12 });
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.s > 0) return { ...prev, s: prev.s - 1 };
        if (prev.m > 0) return { ...prev, m: prev.m - 1, s: 59 };
        if (prev.h > 0) return { ...prev, h: prev.h - 1, m: 59, s: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const offerData: (Offer & { id: number })[] = [
    { id: 1, title: 'Organic Veggie Box', discount: '50%', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800', color: 'bg-green-600', stockLeft: 22, offerType: 'combo' },
    { id: 2, title: 'Fresh Summer Fruits', discount: '30%', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=800', color: 'bg-orange-600', stockLeft: 45, offerType: 'category', targetId: 'fruits' },
    { id: 3, title: 'Exotic Greens Pack', discount: '40%', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800', color: 'bg-emerald-600', stockLeft: 12, offerType: 'category', targetId: 'leafy-greens' },
    { id: 4, title: 'Local Mandi Special', discount: '25%', image: 'https://images.unsplash.com/photo-1488459711635-de72f15234ef?w=800', color: 'bg-blue-600', stockLeft: 0, offerType: 'combo', isExpired: true },
  ];

  return (
    <section className="py-16 px-4 md:px-8 bg-brandBeige overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-10 gap-4">
          <div className="flex items-center space-x-4">
            <div className="bg-accent/10 p-4 rounded-[24px] text-accent animate-pulse">
              <Sparkles size={32} fill="currentColor" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                <h2 className="text-3xl font-black text-gray-900 font-brand uppercase tracking-tighter">Live Offers Zone</h2>
              </div>
              <div className="flex items-center space-x-3 text-sm font-bold">
                <span className="text-gray-400">Hurry! Deals ending in</span>
                <span className="text-white bg-gray-900 px-3 py-1 rounded-lg tabular-nums font-mono">
                  {String(timeLeft.h).padStart(2, '0')}:{String(timeLeft.m).padStart(2, '0')}:{String(timeLeft.s).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => notify('Loading specialized deals...', 'info')}
            className="hidden md:flex items-center gap-2 bg-white text-gray-900 px-6 py-3 rounded-2xl font-bold text-sm shadow-sm border border-gray-100 hover:border-brandGreen transition-all"
          >
            <span>View All Offers</span>
            <ChevronRight size={18} />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="flex overflow-x-auto pb-8 gap-6 no-scrollbar snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {offerData.map((offer) => (
            <div key={offer.id} className="snap-center">
              <OfferCard
                {...offer}
                timeLeft={`${timeLeft.h}h ${timeLeft.m}m`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  const { notify, reviews, setPendingReviewOrder, products, categories, settings, isLoading } = useApp();
  const [selectedBadge, setSelectedBadge] = useState<null | { title: string, desc: string, icon: React.ReactNode }>(null);
  const [activeFilter, setActiveFilter] = useState<'trending' | 'all'>('trending');
  const [shuffledProducts, setShuffledProducts] = useState<any[]>([]);

  // Handle back button to close Badge Info Modal
  useEffect(() => {
    if (selectedBadge) {
      window.history.pushState({ modal: 'badge' }, '');
      const handlePopState = () => setSelectedBadge(null);
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [selectedBadge]);

  useEffect(() => {
    if (activeFilter === 'all' && products) {
      const shuffled = [...products].sort(() => Math.random() - 0.5);
      setShuffledProducts(shuffled);
    }
  }, [activeFilter, products]);

  const displayedProducts = activeFilter === 'trending'
    ? (products || []).filter(p => p.is_trending)
    : shuffledProducts;

  const badges = [
    { icon: <Truck size={32} />, title: 'Fast Delivery', desc: 'Direct from mandi to your doorstep in 30 minutes. We ensure lightning fast delivery for all your grocery needs.' },
    { icon: <Headset size={32} />, title: '24/7 Support', desc: 'Our dedicated support team is available around the clock to assist you with any questions or order issues.' },
    { icon: <Star size={32} />, title: 'Direct Sourcing', desc: 'By sourcing directly from Rewa Mandi, we eliminate middlemen, ensuring better prices and fresher produce.' },
    { icon: <RotateCcw size={32} />, title: '24h Replacement', desc: 'Not happy with the quality? We offer instant, no-questions-asked 24-hour replacements for any fresh produce.' },
  ];

  return (
    <div className="pb-20">
      <Hero settings={settings} />

      {/* Categories Grid */}
      <section id="categories-section" className="py-16 md:py-24 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-3xl md:text-5xl font-serif italic text-gray-900 mb-3 md:mb-4 tracking-tight">Shop by Category</h2>
            <div className="w-16 md:w-20 h-1 bg-brandGreen mx-auto rounded-full" />
          </div>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-8">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <CategorySkeleton key={`cat-skeleton-${i}`} />
              ))
            ) : (
              (categories || []).filter(cat => cat.is_active).map((cat, idx) => {
                const meta = getCategoryMeta(cat.name);
                const catIcon = (cat as any).icon || meta.icon;
                const catColor = (cat as any).color || meta.color;
                return (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => {
                      if (navigator.vibrate) navigator.vibrate(10);
                    }}
                    className="group cursor-pointer text-center block transition-transform hover:-translate-y-1 active:scale-95 duration-200"
                  >
                    <div className="relative w-full aspect-square mb-3 md:mb-6">
                      {/* Category Circle with fallback icon */}
                      <div className={`w-full h-full rounded-full overflow-hidden border-[4px] md:border-[6px] border-white shadow-lg transition-all duration-700 group-hover:shadow-3xl group-hover:shadow-primary/20 relative bg-gray-50 flex items-center justify-center`}>

                        {/* Background Icon (Visible if image fails or loading) */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-20 transition-opacity group-hover:opacity-40">
                          <CategoryIcon name={catIcon} className={`w-1/2 h-1/2 ${catColor.replace('bg-', 'text-')}`} />
                        </div>

                        {/* Main Category Image */}
                        <img
                          src={cat.image_url}
                          alt={cat.name}
                          onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0'; }}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-125 z-10"
                        />

                        {/* Floating Icon Overlay */}
                        <div className={`absolute bottom-1 right-1 md:bottom-2 md:right-2 ${catColor} p-1.5 md:p-3 rounded-xl md:rounded-2xl text-white shadow-lg z-20 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500`}>
                          <CategoryIcon name={catIcon} className="w-3 md:w-5 h-3 md:h-5" />
                        </div>
                      </div>
                    </div>
                    <h3 className="font-brand font-bold text-gray-900 group-hover:text-primary transition-colors text-[9px] md:text-xs uppercase tracking-wider md:tracking-widest">{cat.name}</h3>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </section>

      <OffersZone />

      {/* Dynamic Products Selection */}
      <section className="py-24 px-4 md:px-8 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between mb-16 text-center md:text-left gap-6">
            <div>
              <h2 className="text-4xl lg:text-5xl font-serif italic text-gray-900 tracking-tight">
                {activeFilter === 'trending' ? 'Trending Now' : 'Fresh Catalog'}
              </h2>
              <p className="text-gray-500 mt-2 font-medium">Curated fresh harvest for your kitchen</p>
            </div>
            <div className="flex items-center gap-3 bg-white p-2 rounded-full shadow-xl shadow-gray-200/50 border border-gray-100">
              <button
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(10);
                  setActiveFilter('trending');
                }}
                className={`px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${activeFilter === 'trending' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-gray-900'}`}
              >
                Trending
              </button>
              <button
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(10);
                  setActiveFilter('all');
                }}
                className={`px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${activeFilter === 'all' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-gray-400 hover:text-gray-900'}`}
              >
                Explore All
              </button>
            </div>
          </div>

          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8"
          >
            {isLoading ? (
              // Show 8 skeletons while loading
              Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={`skeleton-${i}`} />
              ))
            ) : (
              displayedProducts.map((product) => (
                <ProductCard key={`${activeFilter}-${product.id}`} product={product} />
              ))
            )}
          </div>
        </div>
      </section>

      {/* Features - Modern Minimalist Style - Compact for Mobile */}
      <section className="py-8 md:py-24 px-4 md:px-8 bg-white border-y border-gray-50/50 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-4 gap-2 md:gap-16">
          {badges.map((item, idx) => (
            <motion.div
              key={idx}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(5);
                setSelectedBadge(item);
              }}
              className="flex flex-col items-center text-center group cursor-pointer"
            >
              <div className="w-14 h-14 md:w-20 md:h-20 bg-brandGreen/5 text-brandGreen rounded-2xl md:rounded-[32px] flex items-center justify-center mb-3 md:mb-8 group-hover:bg-brandGreen group-hover:text-white transition-all duration-300">
                {React.cloneElement(item.icon as React.ReactElement, { size: window.innerWidth < 768 ? 24 : 32 })}
              </div>
              <h4 className="text-[10px] md:text-xl font-brand font-black text-gray-900 uppercase tracking-tighter leading-tight">{item.title}</h4>
              <p className="hidden md:block text-gray-500 text-sm leading-relaxed max-w-[200px] mt-3">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Badge Info Modal */}
      <AnimatePresence>
        {selectedBadge && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedBadge(null)}
              className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-[40px] shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="p-10 text-center">
                <div className="w-20 h-20 bg-brandGreen/10 text-brandGreen rounded-[32px] flex items-center justify-center mx-auto mb-8 rotate-6">
                  {selectedBadge.icon}
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4 uppercase tracking-tighter">{selectedBadge.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-10 font-medium">
                  {selectedBadge.desc}
                </p>
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="w-full bg-gray-900 text-white py-5 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-900/20"
                >
                  Got It, Thanks
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Public Reviews Section - Exact Placement */}
      <PublicReviews reviews={reviews} />

      {/* Manual Rating Call to Action */}
      <section className="py-12 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500 font-medium mb-6">Enjoyed your experience with Galimandi?</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(15);
              // Trigger a guest rating modal
              const dummyOrder: any = { id: 'GUEST-REVIEW', status: 'Delivered' };
              setPendingReviewOrder(dummyOrder);
            }}
            className="inline-flex items-center space-x-2 bg-gray-900 text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-gray-900/10 hover:bg-black transition-all uppercase tracking-widest text-xs"
          >
            <Star size={16} fill="currentColor" />
            <span>Write a Review</span>
          </motion.button>
        </div>
      </section>
    </div>
  );
};

export default Home;
