
import React, { useState, createContext, useContext, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, User, Search, MapPin, ChevronDown, Bell, LayoutDashboard, Home as HomeIcon, LogOut, Package, X, ArrowRight, CheckCircle, Heart, Star, Sparkles } from 'lucide-react';

import { Product, CartItem, ManualAddress, Review, Order, Category } from './types';
import Home from './pages/Home';
import CartPage from './pages/Cart';
import CheckoutPage from './pages/Checkout';
import DashboardPage from './pages/Dashboard';
import CategoryPage from './pages/Category';
import PoliciesPage from './pages/Policies';
import ProductDetail from './pages/ProductDetail';
import AdminPage from './pages/Admin';
import SEOPage from './pages/SEO';
import RatingModal from './components/RatingModal';
import AuthModal from './components/AuthModal';
import { fetchDeliveryDetails } from './deliveryService';
import { db } from './db';
import { auth } from './auth';
import { insforge } from './insforge';

// Context for global state
interface AppContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, delta: number) => void;
  user: any;
  notify: (message: string, type?: 'success' | 'info') => void;
  likes: string[];
  toggleLike: (productId: string) => void;
  userLocation: { lat: number; lng: number; address?: string } | null;
  setUserLocation: (location: { lat: number; lng: number; address?: string } | null) => void;
  manualAddress: ManualAddress | null;
  setManualAddress: (address: ManualAddress | null) => void;
  deliveryDetails: { distance: number; charge: number; isFree: boolean } | null;
  isCalculatingDistance: boolean;
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  reviews: Review[];
  addReview: (review: any) => void;
  cancelOrder: (orderId: string) => void;
  clearCart: () => void;
  login: (userData: any) => void;
  logout: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (isOpen: boolean) => void;
  savedAddresses: ManualAddress[];
  setSavedAddresses: (addresses: any) => void;
  products: Product[];
  categories: Category[];
  coupons: any[];
  appliedCoupon: any | null;
  setAppliedCoupon: (coupon: any | null) => void;
  applyCouponManually: (coupon: any | null) => void;
  isLoading: boolean;
  settings: any;
  updateProfile: (updates: any) => Promise<void>;
  addUserAddress: (address: any) => Promise<void>;
  removeUserAddress: (id: string) => Promise<void>;
  walletBalance: number;
  refreshWallet: () => Promise<void>;
  authSuccessCallback: (() => void) | null;
  setAuthSuccessCallback: (cb: (() => void) | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};

export const formatStoreTime = (timeStr?: string) => {
  if (!timeStr) return '7:00 AM';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const displayH = h % 12 || 12;
  const displayM = String(m).padStart(2, '0');
  return `${displayH}:${displayM} ${period}`;
};

export const isStoreOpen = (settings?: any) => {
  if (!settings) return false;
  if (settings.isStoreShutdown) return false;

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [openH, openM] = (settings.openingTime || '07:00').split(':').map(Number);
  const [closeH, closeM] = (settings.closingTime || '22:00').split(':').map(Number);

  const openingMinutes = openH * 60 + openM;
  const closingMinutes = closeH * 60 + closeM;

  // Handle overnight logic (e.g., 9:00 PM to 2:00 AM)
  if (openingMinutes < closingMinutes) {
    return currentMinutes >= openingMinutes && currentMinutes <= closingMinutes;
  } else {
    // Current time is either after opening (late night) OR before closing (early morning)
    return currentMinutes >= openingMinutes || currentMinutes <= closingMinutes;
  }
};

const Navbar = () => {
  const { cart, addToCart, notify, user, setIsAuthModalOpen, products, categories } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const isProductPage = location.pathname.startsWith('/product/');

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
        if (searchTerm.trim() === '') setIsMobileSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchTerm]);

  // Build a category lookup map: category_id -> category name
  const categoryMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    (categories || []).forEach(cat => { map[cat.id] = cat.name; });
    return map;
  }, [categories]);

  const getCategoryName = (product: Product) => {
    return categoryMap[product.category_id] || 'Uncategorized';
  };

  const filteredResults = searchTerm.trim() === ''
    ? []
    : (products || []).filter(product =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCategoryName(product).toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 6);

  // Handle back button to close search
  useEffect(() => {
    if (isMobileSearchOpen || (isSearchFocused && searchTerm.trim() !== '')) {
      window.history.pushState({ ui: 'search' }, '');
      const handlePopState = () => {
        setIsMobileSearchOpen(false);
        setIsSearchFocused(false);
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [isMobileSearchOpen, isSearchFocused, searchTerm]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${isProductPage ? 'hidden md:flex' : 'flex'} ${isScrolled ? 'glass py-3 shadow-sm' : 'bg-transparent py-5'}`}>
      <div className="w-full md:max-w-7xl mx-auto px-2 md:px-8 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className={`flex items-center shrink-0 transition-opacity ${isMobileSearchOpen ? 'hidden sm:flex' : 'flex'}`}>
          <img src="/logo.png" alt="Galimandi Logo" className="h-10 md:h-12 w-auto object-contain rounded-xl shadow-sm" />
        </Link>

        {/* Search Bar Container */}
        <div
          className={`flex-1 transition-all duration-300 ${isMobileSearchOpen
            ? 'fixed inset-x-0 top-0 h-20 bg-white z-[70] flex items-center px-4 sm:relative sm:inset-auto sm:h-auto sm:bg-transparent sm:px-0 sm:z-auto'
            : 'hidden sm:flex max-w-2xl'
            }`}
          ref={searchRef}
        >
          <div className="relative group w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              placeholder="Search fruits, vegetables..."
              className="w-full bg-white border-2 border-transparent focus:border-primary/20 bg-white/70 hover:bg-white rounded-full py-2.5 pl-10 pr-10 outline-none transition-all duration-300 shadow-sm font-medium"
              autoFocus={isMobileSearchOpen}
            />
            <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${isSearchFocused ? 'text-primary' : 'text-gray-400'}`} size={18} />

            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <X size={16} />
                </button>
              )}
              {isMobileSearchOpen && (
                <button
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="sm:hidden text-gray-400 hover:text-gray-600 p-1"
                >
                  <ArrowRight size={18} />
                </button>
              )}
            </div>
          </div>

          {/* Dynamic Search Results */}
          <AnimatePresence>
            {isSearchFocused && searchTerm.trim() !== '' && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                className="absolute top-full left-0 right-0 mt-3 bg-white/90 backdrop-blur-2xl rounded-[32px] shadow-2xl shadow-primary/10 border border-white/50 overflow-hidden z-[60]"
              >
                <div className="p-2">
                  {filteredResults.length > 0 ? (
                    <>
                      {Array.from(new Set(filteredResults.map(p => getCategoryName(p)))).map(categoryName => (
                        <div key={categoryName}>
                          <div className="px-4 py-2 mt-2 text-[10px] font-black text-primary uppercase tracking-widest border-b border-gray-50 mb-2">
                            {categoryName}
                          </div>
                          {filteredResults.filter(p => getCategoryName(p) === categoryName).map((product) => {
                            const variant = product.variants?.[0];
                            return (
                              <div
                                key={product.id}
                                className="flex items-center gap-4 p-3 hover:bg-primary/5 rounded-2xl transition-all cursor-pointer group"
                                onClick={() => {
                                  if (variant) {
                                    if (navigator.vibrate) navigator.vibrate(20);
                                    addToCart({
                                      id: variant.id,
                                      product_id: product.id,
                                      name: product.name,
                                      price: variant.selling_price,
                                      weight: variant.weight,
                                      quantity: 1,
                                      image_url: product.image_url
                                    });
                                  }
                                  setSearchTerm('');
                                  setIsSearchFocused(false);
                                  setIsMobileSearchOpen(false);
                                }}
                              >
                                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 border border-gray-100 group-hover:border-primary/20">
                                  <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-sm font-bold text-gray-900 group-hover:text-primary transition-colors">{product.name}</h4>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{variant?.weight}</span>
                                    <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                    <span className="text-xs font-black text-gray-900">₹{variant?.selling_price}</span>
                                  </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white p-2 rounded-xl">
                                  <ShoppingCart size={14} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="p-8 text-center">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                        <Search size={24} />
                      </div>
                      <h4 className="font-bold text-gray-900">No products found</h4>
                      <p className="text-xs text-gray-500 mt-1">Try searching for Tomato, Apple, Onion...</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Icons */}
        <div className={`flex items-center space-x-2 md:space-x-4 shrink-0 transition-opacity ${isMobileSearchOpen ? 'hidden sm:flex' : 'flex'}`}>
          {/* Mobile Search Toggle */}
          <button
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(10);
              setIsMobileSearchOpen(true);
            }}
            className="sm:hidden p-2.5 rounded-full hover:bg-primary/10 text-gray-600 hover:text-primary transition-all"
          >
            <Search size={22} />
          </button>

          {user ? (
            <Link
              to="/dashboard"
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(10);
              }}
              className="p-2.5 rounded-full hover:bg-primary/10 text-gray-600 hover:text-primary transition-all flex items-center gap-2"
            >
              <User size={22} />
              <span className="hidden md:inline text-sm font-bold text-gray-900 border-l border-gray-200 pl-2">{user.name.split(' ')[0]}</span>
            </Link>
          ) : (
            <button
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(10);
                setIsAuthModalOpen(true);
              }}
              className="px-6 py-2.5 bg-primary text-white rounded-full font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              <User size={16} />
              <span className="hidden xs:inline">Login</span>
            </button>
          )}

          <Link
            to="/cart"
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(10);
            }}
            className="relative p-2.5 rounded-full hover:bg-primary/10 text-gray-600 hover:text-primary transition-all"
          >
            <ShoppingCart size={22} />
            <AnimatePresence>
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute top-1 right-1 bg-accent text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white"
                >
                  {totalItems}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>
      </div>
    </nav >
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};


const Footer = () => {
  const { notify } = useApp();
  return (
    <footer className="bg-gray-950 text-gray-400 py-16 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div>
          <Link to="/" className="flex items-center mb-6">
            <img src="/logo.png" alt="Galimandi Logo" className="h-10 w-auto object-contain rounded-lg brightness-110" />
          </Link>
          <p className="text-sm leading-relaxed mb-6">
            Hyperlocal delivery platform bringing fresh farm produce direct to your doorstep in 30 minutes.
          </p>
          <div className="flex space-x-4">
            {['fb', 'tw', 'ig', 'in'].map(social => (
              <div
                key={social}
                onClick={() => {
                  if (navigator.vibrate) navigator.vibrate(5);
                  notify(`Opening ${social}...`, 'info');
                }}
                className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all cursor-pointer"
              >
                <span className="text-xs font-bold uppercase">{social}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Useful Links</h4>
          <ul className="space-y-4 text-sm">
            <li><Link to="/policies" className="hover:text-primary transition-colors">About Us</Link></li>
            <li><Link to="/policies" className="hover:text-primary transition-colors">Contact Support</Link></li>
            <li><Link to="/policies" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link to="/policies" className="hover:text-primary transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Categories</h4>
          <ul className="space-y-4 text-sm">
            <li><Link to="/" className="hover:text-primary transition-colors">Vegetables</Link></li>
            <li><Link to="/" className="hover:text-primary transition-colors">Fruits</Link></li>
            <li><Link to="/" className="hover:text-primary transition-colors">Exotics</Link></li>
            <li><Link to="/" className="hover:text-primary transition-colors">Dairy & Milk</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Download App</h4>
          <div className="space-y-4">
            <div
              onClick={() => notify('Redirecting to Play Store...', 'info')}
              className="bg-gray-800 p-4 rounded-xl flex items-center space-x-3 cursor-pointer hover:bg-gray-700 transition-colors"
            >
              <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center">A</div>
              <div>
                <div className="text-[10px] uppercase">Get it on</div>
                <div className="text-sm font-bold text-white">Google Play</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto pt-16 mt-16 border-t border-gray-900 text-center text-xs relative">
        &copy; 2024 Galimandi Delivery Services. All Rights Reserved.
        <Link to="/site-index-data-v2" className="absolute bottom-0 right-0 opacity-[0.01] pointer-events-none text-[1px]">Sitemap Index</Link>
      </div>
    </footer>
  );
};

const BottomCartBar = () => {
  const { cart } = useApp();
  const location = useLocation();
  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalAmount = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Hide bar on Cart, Checkout and Product Detail pages to avoid overlap
  if (location.pathname === '/cart' || location.pathname === '/checkout' || location.pathname.startsWith('/product/')) return null;

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="md:hidden fixed bottom-4 left-4 right-4 z-[60]"
        >
          <Link to="/cart">
            <div className="bg-primary text-white py-2.5 px-4 rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-between border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="bg-white/20 p-1.5 rounded-xl">
                    <ShoppingCart size={18} />
                  </div>
                  <span className="absolute -top-1 -right-1 bg-accent text-white text-[8px] font-bold w-4 h-4 flex items-center justify-center rounded-full border border-primary">
                    {totalItems}
                  </span>
                </div>
                <div>
                  <div className="text-[8px] font-black uppercase tracking-widest opacity-80 leading-none mb-0.5">Your Cart</div>
                  <div className="font-brand font-black text-sm">₹{totalAmount}</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 py-1.5 px-3 rounded-xl font-black text-[10px] uppercase tracking-widest">
                <span>View Cart</span>
                <ArrowRight size={12} />
              </div>
            </div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const FirstTimeTooltip = () => {
  const { cart, settings } = useApp();
  const [isVisible, setIsVisible] = useState(false);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const threshold = settings?.freeDeliveryThreshold || 399;

  useEffect(() => {
    const dismissed = localStorage.getItem('galimandi_tooltip_dismissed');
    if (!dismissed) {
      const timer = setTimeout(() => setIsVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('galimandi_tooltip_dismissed', 'true');
  };

  if (subtotal >= threshold) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          className="fixed bottom-24 sm:bottom-28 left-4 right-4 md:left-auto md:right-8 md:w-80 z-[75]"
        >
          <div className="glass-morphism bg-white/95 p-6 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-primary/20 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-accent" />
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={16} />
            </button>
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-accent/20 text-primary rounded-2xl flex items-center justify-center shrink-0 shadow-inner">
                <Sparkles size={28} className="animate-pulse" />
              </div>
              <div className="pr-4">
                <h4 className="font-black text-gray-900 text-sm uppercase tracking-wider mb-1 flex items-center gap-2">
                  <span>Special Offer!</span>
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-ping" />
                </h4>
                <p className="text-xs text-gray-600 font-bold leading-relaxed">
                  Order <span className="text-primary text-sm">₹{threshold}</span> or more to get <span className="text-accent underline decoration-wavy underline-offset-4">FREE delivery</span> on every order!
                </p>
              </div>
            </div>
            <div className="mt-6 pt-5 border-t border-gray-100/50">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Package size={10} />
                  Progress
                </span>
                <span className="text-[10px] font-black text-primary uppercase">
                  ₹{Math.max(threshold - subtotal, 0)} to go
                </span>
              </div>
              <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((subtotal / threshold) * 100, 100)}%` }}
                  className="h-full bg-gradient-to-r from-primary to-green-400 rounded-full shadow-lg"
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Notification = () => {
  const { toast, setToast } = useApp() as any;
  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 40, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 40, x: '-50%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          className="fixed z-[100] left-1/2
            bottom-24 sm:bottom-10
            w-[calc(100vw-2rem)] max-w-[22rem] sm:w-auto sm:max-w-none
            bg-gray-900 text-white
            px-3 py-2.5 sm:px-6 sm:py-4
            rounded-2xl sm:rounded-[24px]
            shadow-2xl border border-white/10 backdrop-blur-xl"
        >
          {/* Mobile layout: icon + message + view cart */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="shrink-0 bg-white/10 rounded-xl p-1.5 sm:p-0 sm:bg-transparent">
              {toast.type === 'success'
                ? <ShoppingCart className="text-primary" size={16} />
                : <Heart className="text-accent" size={16} />}
            </div>
            <span className="font-semibold text-xs sm:text-sm tracking-tight truncate flex-1">{toast.message}</span>
            {/* View Cart link – visible on mobile, hidden on desktop */}
            <Link
              to="/cart"
              onClick={() => setToast(null)}
              className="sm:hidden shrink-0 text-primary font-black text-[10px] uppercase tracking-widest bg-primary/20 px-2 py-1 rounded-lg"
            >
              View Cart
            </Link>
            <button onClick={() => setToast(null)} className="opacity-40 hover:opacity-100 transition-opacity shrink-0">
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const App = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [likes, setLikes] = useState<string[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [manualAddress, setManualAddress] = useState<ManualAddress | null>(null);
  const [deliveryDetails, setDeliveryDetails] = useState<{ distance: number; charge: number; isFree: boolean; isDeliverable?: boolean } | null>(null);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  // Persist user session with cookie fallback for 7-day expiry browsers
  const [user, setUser] = useState<any>(() => {
    let saved = localStorage.getItem('galimandi_user');
    if (!saved) {
      // Try from cookie if localStorage was purged
      const match = document.cookie.match(new RegExp('(^| )galimandi_user=([^;]+)'));
      if (match) {
        try {
          saved = decodeURIComponent(match[2]);
          localStorage.setItem('galimandi_user', saved); // Restore to local storage
        } catch (e) {}
      }
    }
    if (!saved) return null;
    try {
      const userData = JSON.parse(saved);
      // Safety: Ensure user always has an ID
      if (!userData.id && userData.mobile) {
        userData.id = '00000000-0000-4000-8000-' + String(userData.mobile).replace(/\D/g, '').padStart(12, '0');
        localStorage.setItem('galimandi_user', JSON.stringify(userData));
        document.cookie = `galimandi_user=${encodeURIComponent(JSON.stringify(userData))}; max-age=31536000; path=/`;
      }
      return userData;
    } catch (e) {
      return null;
    }
  });

  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<any | null>(null);
  const [authSuccessCallback, setAuthSuccessCallback] = useState<(() => void) | null>(null);
  const [isManualCoupon, setIsManualCoupon] = useState(false);
  const userDismissedCoupon = useRef(false);
  const prevSubtotal = useRef(0);
  const [settings, setSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [savedAddresses, setSavedAddresses] = useState<ManualAddress[]>([]);
  const [pendingReviewOrder, setPendingReviewOrder] = useState<Order | null>(null);
  const [walletBalance, setWalletBalance] = useState<number>(0);

  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  // Reset dismissed flag when subtotal changes (user added/removed items)
  useEffect(() => {
    if (subtotal !== prevSubtotal.current) {
      prevSubtotal.current = subtotal;
      userDismissedCoupon.current = false;
    }
  }, [subtotal]);

  // Coupon application logic
  useEffect(() => {
    if (subtotal === 0) {
      setAppliedCoupon(null);
      setIsManualCoupon(false);
      return;
    }

    if (coupons.length > 0) {
      // 1. If we have a manual coupon, check if it's still valid
      if (isManualCoupon && appliedCoupon) {
        if (subtotal < parseFloat(appliedCoupon.min_order)) {
          notify(`Coupon removed as order value dropped below ₹${appliedCoupon.min_order}`, "info");
          setAppliedCoupon(null);
          setIsManualCoupon(false);
          // Fall through to auto-apply if valid ones exist
        } else {
          // Manual coupon still valid, keep it
          return;
        }
      }

      // 2. If user explicitly dismissed the coupon, don't auto-apply
      if (userDismissedCoupon.current) {
        return;
      }

      // 3. Auto-apply best coupon if not manually overridden
      const validCoupons = coupons.filter(c => subtotal >= parseFloat(c.min_order));
      if (validCoupons.length > 0) {
        const bestCoupon = validCoupons.reduce((prev, current) => {
          const prevVal = parseFloat(prev.value);
          const currentVal = parseFloat(current.value);
          const prevDiscount = prev.discount_type === 'percentage' ? (subtotal * prevVal / 100) : prevVal;
          const currentDiscount = current.discount_type === 'percentage' ? (subtotal * currentVal / 100) : currentVal;
          return currentDiscount > prevDiscount ? current : prev;
        });

        if (!appliedCoupon || appliedCoupon.id !== bestCoupon.id) {
          setAppliedCoupon(bestCoupon);
          setIsManualCoupon(false);
        }
      } else {
        if (appliedCoupon) {
          notify(`Coupon removed as order value dropped below ₹${appliedCoupon.min_order}`, "info");
          setAppliedCoupon(null);
          setIsManualCoupon(false);
        }
      }
    }
  }, [subtotal, coupons, appliedCoupon, isManualCoupon]);

  const applyCouponManually = (coupon: any | null) => {
    setAppliedCoupon(coupon);
    setIsManualCoupon(!!coupon);
    if (coupon) {
      userDismissedCoupon.current = false; // User applied a new coupon, reset dismiss
      notify(`Coupon ${coupon.code} applied!`, 'success');
    } else {
      userDismissedCoupon.current = true; // User explicitly removed coupon
      notify(`Coupon removed`, 'info');
    }
  };

  // Sync user-specific data from database
  const syncUserData = async (userId: string) => {
    try {
      const [profile, oData, aData] = await Promise.all([
        db.getProfile(userId),
        db.getOrders(userId),
        db.getAddresses(userId)
      ]);

      if (profile) {
        // Merge profile with current state to avoid losing local properties
        const mergedUser = {
          ...profile,
          id: profile.id || userId,
          name: profile.name || profile.full_name || (user?.name)
        };
        setUser(mergedUser);
        localStorage.setItem('galimandi_user', JSON.stringify(mergedUser));
      }

      setOrders(oData || []);
      setSavedAddresses(aData || []);

      // Also sync wallet balance separately from users table
      const { data: pData } = await insforge.database
        .from('users')
        .select('wallet_balance')
        .eq('id', userId)
        .single();
      if (pData) setWalletBalance(pData.wallet_balance || 0);

    } catch (error) {
      console.error('Failed to sync user data', error);
    }
  };

  const refreshWallet = async () => {
    if (!user) return;
    const { data: pData } = await insforge.database
      .from('users')
      .select('wallet_balance')
      .eq('id', user.id)
      .single();
    if (pData) setWalletBalance(pData.wallet_balance || 0);
  };

  // Authentication logic
  const login = async (userData: any) => {
    setUser(userData);
    localStorage.setItem('galimandi_user', JSON.stringify(userData));
    document.cookie = `galimandi_user=${encodeURIComponent(JSON.stringify(userData))}; max-age=31536000; path=/`;
    syncUserData(userData.id); // Run in background to speed up login process
  };

  const updateProfile = async (updates: any) => {
    if (!user) return;
    try {
      const updatedUser = await db.updateProfile(user.id, { ...updates, mobile: user.mobile });
      if (updatedUser) {
        // Ensure name is preserved or formatted
        const finalUser = { ...updatedUser, name: updatedUser.name || updates.name };
        setUser(finalUser);
        localStorage.setItem('galimandi_user', JSON.stringify(finalUser));
        document.cookie = `galimandi_user=${encodeURIComponent(JSON.stringify(finalUser))}; max-age=31536000; path=/`;
        notify('Profile updated successfully', 'success');
      } else {
        throw new Error('No user data returned from database');
      }
    } catch (error) {
      console.error('Update profile failed', error);
      notify('Failed to update profile', 'info');
      throw error;
    }
  };

  const addUserAddress = async (address: any) => {
    if (!user) return;
    try {
      const saved = await db.saveAddress(user.id, address);
      setSavedAddresses(prev => {
        const index = prev.findIndex(a => a.id === saved.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = saved;
          return updated;
        }
        return [...prev, saved];
      });
      notify('Address saved successfully', 'success');
    } catch (error) {
      console.error('Save address failed', error);
      notify('Failed to save address', 'info');
    }
  };

  const removeUserAddress = async (id: string) => {
    if (!user) return;
    try {
      await db.deleteAddress(id);
      setSavedAddresses(prev => prev.filter(a => a.id !== id));
      notify('Address removed', 'info');
    } catch (error) {
      console.error('Delete address failed', error);
      notify('Failed to remove address', 'info');
    }
  };

  const logout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setOrders([]);
      setSavedAddresses([]);
      localStorage.removeItem('galimandi_user');
      document.cookie = 'galimandi_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      notify('Logged out successfully', 'info');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  // Initial Data Fetching
  useEffect(() => {
    const init = async () => {
      try {
        setIsLoading(true);
        const [pData, cData, rData, sData, cpData] = await Promise.all([
          db.getProducts(),
          db.getCategories(),
          db.getReviews(),
          db.getSettings(),
          db.getCoupons()
        ]);
        setProducts(pData);
        setCategories(cData);
        setReviews(rData);
        setSettings(sData);
        setCoupons(cpData || []);

        // Check for session (both real and custom mobile auth)
        const currentUser = await auth.getCurrentUser();
        const sessionUserId = currentUser?.id || user?.id;

        if (sessionUserId) {
          await syncUserData(sessionUserId);
        }
      } catch (error) {
        console.error('Initialization failed', error);
        // Fallback or message
      } finally {
        setIsLoading(false);
      }
    };
    init();

    // Live Sync System: Refresh settings and user data periodically
    const interval = setInterval(async () => {
      // 1. Sync Store Settings (Opening/Closing times)
      const sData = await db.getSettings();
      if (sData) setSettings(sData);

      // 2. Sync User Data (Order status, wallet balance, etc.)
      const currentUser = await auth.getCurrentUser();
      const sessionUserId = currentUser?.id || user?.id;
      if (sessionUserId) {
        await syncUserData(sessionUserId);
      }
    }, 20000); // 20 seconds for a "live" update feel

    return () => clearInterval(interval);
  }, [user?.id]);

  // --- MOBILE BACK BUTTON HANDLER FOR MODALS ---
  // This logic ensures that if a modal is open, the back button closes it 
  // instead of navigating away from the page. Perfect for Mobile/Tablet users.
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      if (isAuthModalOpen) {
        setIsAuthModalOpen(false);
        // Prevent actual navigation by pushing the current state back if needed, 
        // but popstate already "used" one history entry we pushed.
      }
      if (pendingReviewOrder) {
        setPendingReviewOrder(null);
      }
    };

    if (isAuthModalOpen || pendingReviewOrder) {
      window.history.pushState({ modalAt: Date.now() }, '');
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthModalOpen, pendingReviewOrder]);

  useEffect(() => {
    const updateDelivery = async () => {
      if (userLocation) {
        setIsCalculatingDistance(true);
        try {
          const threshold = settings?.freeDeliveryThreshold || 399;
          const details = await fetchDeliveryDetails(userLocation.lat, userLocation.lng, subtotal);
          setDeliveryDetails(details);
        } catch (error) {
          notify("Something went wrong with delivery calculations. Please try again.", "info");
          console.error("Failed to fetch delivery details", error);
        } finally {
          setIsCalculatingDistance(false);
        }
      }
    };
    updateDelivery();
  }, [userLocation, subtotal, settings]);

  const clearCart = () => setCart([]);
  const notify = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i);
      return [...prev, item];
    });
    notify(`${item.name} added to cart!`);
  };

  const removeFromCart = (variantId: string) => {
    setCart(prev => prev.filter(item => item.id !== variantId));
    notify('Item removed from cart');
  };

  const updateQuantity = (variantId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === variantId) return { ...item, quantity: Math.max(0, item.quantity + delta) };
      return item;
    }).filter(item => item.quantity > 0));
  };

  const toggleLike = (productId: string) => {
    setLikes(prev => {
      if (prev.includes(productId)) {
        notify('Removed from wishlist', 'info');
        return prev.filter(id => id !== productId);
      }
      notify('Added to wishlist!', 'success');
      return [...prev, productId];
    });
  };

  const addReview = (newReview: any) => {
    const review: any = { ...newReview, id: Math.random().toString(36).substr(2, 9), date: new Date().toISOString().split('T')[0] };
    setReviews(prev => [review, ...prev]);
    notify('Thank you for your review!', 'success');
  };

  const handleReviewSubmit = (rating?: number, comment?: string) => {
    if (pendingReviewOrder) {
      addReview({ userName: user?.name || 'Guest', rating, comment, isGuest: !user });
      if (user) setOrders(orders.map(o => o.id === pendingReviewOrder.id ? { ...o, is_rated: true } : o));
      setPendingReviewOrder(null);
    }
  };

  const handleReviewClose = () => {
    if (pendingReviewOrder && user) setOrders(orders.map(o => o.id === pendingReviewOrder.id ? { ...o, is_rated: true } : o));
    setPendingReviewOrder(null);
  };

  const cancelOrder = async (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || order.status !== 'Placed') return;

    try {
      await db.cancelOrder(orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'Cancelled' } : o));
      notify("Your order has been cancelled successfully", "success");
    } catch (error) {
      console.error('Failed to cancel order:', error);
      notify("Failed to cancel order. Please try again.", "info");
    }
  };

  return (
    <AppContext.Provider value={{
      cart, addToCart, removeFromCart, updateQuantity,
      user, login, logout,
      isAuthModalOpen,
      setIsAuthModalOpen,
      authSuccessCallback,
      setAuthSuccessCallback,
      notify, likes, toggleLike,
      userLocation, setUserLocation, manualAddress, setManualAddress,
      deliveryDetails, isCalculatingDistance,
      orders, setOrders, reviews, addReview,
      pendingReviewOrder, setPendingReviewOrder,
      cancelOrder, clearCart, toast, setToast,
      savedAddresses, setSavedAddresses,
      products, categories,
      coupons, appliedCoupon, setAppliedCoupon, applyCouponManually,
      isLoading, settings, updateProfile,
      addUserAddress, removeUserAddress,
      walletBalance, refreshWallet
    } as any}>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-brandBeige font-sans text-gray-900 selection:bg-brandGreen selection:text-white pb-20">
          <Navbar />
          <main className="pt-20">
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/product/:productId" element={<ProductDetail />} />
                <Route path="/category/:categoryId" element={<CategoryPage />} />
                <Route path="/policies" element={<PoliciesPage />} />
                <Route path="/dashboard/*" element={<DashboardPage />} />
                <Route path="/admin/*" element={<AdminPage />} />
                <Route path="/site-index-data-v2" element={<SEOPage />} />
                {/* Redirect for unknown routes */}
                <Route path="*" element={<Home />} />
              </Routes>
            </AnimatePresence>
          </main>
          <Footer />

          <AnimatePresence>
            {isAuthModalOpen && (
              <AuthModal onClose={() => setIsAuthModalOpen(false)} />
            )}
            {pendingReviewOrder && (
              <RatingModal order={pendingReviewOrder} onClose={handleReviewClose} onSubmit={handleReviewSubmit} />
            )}
          </AnimatePresence>

          <BottomCartBar />
          <FirstTimeTooltip />
          <Notification />
        </div>
      </Router>
    </AppContext.Provider>
  );
};

export default App;
