import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ChevronLeft, ShoppingBag, Plus, Minus, ArrowRight, Ticket, Clock, MapPin, Navigation, CheckCircle, Info, Sparkles, X, Search, Gift } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp, isStoreOpen, formatStoreTime } from '../App';


// ── Coupon Modal with Search ──
const CouponModal = ({ isOpen, onClose, coupons, appliedCoupon, applyCouponManually, subtotal, notify }: any) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredCoupons = (coupons || []).filter((coupon: any) =>
    coupon.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (coupon.discount_type === 'percentage' ? `${coupon.value}% off` : `₹${coupon.value} off`).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleApply = (coupon: any) => {
    const isLocked = subtotal < parseFloat(coupon.min_order);
    if (isLocked) {
      notify(`Add ₹${(parseFloat(coupon.min_order) - subtotal).toFixed(0)} more to unlock this coupon`, 'info');
      return;
    }
    const isApplied = appliedCoupon?.id === coupon.id;
    if (navigator.vibrate) navigator.vibrate(15);
    applyCouponManually(isApplied ? null : coupon);
    if (!isApplied) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-h-[85vh] sm:max-h-[80vh] bg-white rounded-t-[28px] sm:rounded-[28px] flex flex-col overflow-hidden
              sm:max-w-md sm:mx-4
              md:max-w-lg
              lg:max-w-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Ticket size={18} className="text-primary" />
                </div>
                <h2 className="text-base sm:text-lg font-black text-gray-900 tracking-tight">All Coupons</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Bar */}
            <div className="px-5 sm:px-6 py-3 border-b border-gray-50 flex-shrink-0">
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-2.5 sm:py-3 border border-gray-100 focus-within:border-primary/30 transition-colors">
                <Search size={16} className="text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search coupon code..."
                  className="flex-1 bg-transparent text-gray-900 placeholder-gray-400 text-sm font-medium outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-gray-600">
                    <X size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Coupon List */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4">
              {filteredCoupons.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Ticket size={28} className="text-gray-300" />
                  </div>
                  <p className="text-sm font-bold text-gray-400">No coupons found</p>
                  <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredCoupons.map((coupon: any) => {
                    const isApplied = appliedCoupon?.id === coupon.id;
                    const isLocked = subtotal < parseFloat(coupon.min_order);
                    const discountText = coupon.discount_type === 'percentage'
                      ? `${coupon.value}% OFF`
                      : `Flat ₹${coupon.value} OFF`;
                    const savingAmount = coupon.discount_type === 'percentage'
                      ? ((subtotal * parseFloat(coupon.value)) / 100).toFixed(0)
                      : parseFloat(coupon.value).toFixed(0);

                    return (
                      <div
                        key={coupon.id}
                        className={`p-4 sm:p-5 rounded-2xl border-2 transition-all relative overflow-hidden ${isApplied ? 'border-primary bg-primary/5' : isLocked ? 'border-gray-100 bg-gray-50/50' : 'border-gray-100 bg-white hover:border-primary/30'}`}
                      >
                        <div className="flex items-start gap-3 sm:gap-4">
                          {/* Icon */}
                          <div className={`p-2 sm:p-2.5 rounded-xl flex-shrink-0 ${isApplied ? 'bg-primary text-white' : isLocked ? 'bg-gray-100 text-gray-400' : 'bg-primary/10 text-primary'}`}>
                            <Ticket size={18} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <h4 className="text-sm sm:text-base font-black text-gray-900">{discountText}</h4>
                              {isApplied && (
                                <span className="text-[9px] font-black text-white bg-primary px-2 py-0.5 rounded-full uppercase">Applied</span>
                              )}
                            </div>
                            <p className={`text-xs font-medium mb-1.5 ${isLocked ? 'text-gray-400' : 'text-gray-500'}`}>
                              {!isLocked ? `Save ₹${savingAmount} with this code` : `Add ₹${(parseFloat(coupon.min_order) - subtotal).toFixed(0)} more to unlock`}
                            </p>

                            {/* Coupon Code + Min Order */}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="inline-block bg-gray-100 px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold text-gray-700 tracking-wider border border-dashed border-gray-200">
                                {coupon.code}
                              </span>
                              <span className="text-[10px] sm:text-[11px] font-bold text-gray-400">
                                Min order: ₹{coupon.min_order}
                              </span>
                            </div>
                          </div>

                          {/* Apply / Remove Button */}
                          <div className="flex-shrink-0 pt-1">
                            {isApplied ? (
                              <button
                                onClick={() => handleApply(coupon)}
                                className="text-[10px] sm:text-xs font-black text-red-500 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-50 transition-all uppercase tracking-wider"
                              >
                                Remove
                              </button>
                            ) : (
                              <button
                                onClick={() => handleApply(coupon)}
                                disabled={isLocked}
                                className={`text-[10px] sm:text-xs font-black border rounded-lg px-3 py-1.5 uppercase tracking-wider transition-all ${isLocked
                                  ? 'text-gray-300 border-gray-200 cursor-not-allowed'
                                  : 'text-primary border-primary/30 hover:bg-primary/5 hover:border-primary'
                                  }`}
                              >
                                Apply
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-5 sm:px-6 py-4 border-t border-gray-100 flex-shrink-0 bg-gray-50/50">
              <p className="text-center text-[10px] sm:text-xs text-gray-400 font-medium">
                {(coupons || []).length} coupon{(coupons || []).length !== 1 ? 's' : ''} available • Best coupon auto-applied
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


// ── Congratulations Banner ──
const CouponSuccessBanner = ({ discountAmount, couponCode, onClose }: { discountAmount: number, couponCode: string, onClose: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="mb-4 relative overflow-hidden"
    >
      <div className="bg-gradient-to-r from-primary/10 via-green-50 to-emerald-50 border border-primary/20 rounded-2xl p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <div className="p-1.5 sm:p-2 bg-primary/20 rounded-xl flex-shrink-0">
            <Gift size={18} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-black text-primary leading-tight">
              🎉 Congratulations! You save ₹{discountAmount}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-500 font-medium mt-0.5">
              with coupon '{couponCode}'
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 flex-shrink-0"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};


const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, deliveryDetails, userLocation, setUserLocation, isCalculatingDistance, notify, addToCart, products, settings, coupons, appliedCoupon, setAppliedCoupon, applyCouponManually, user, setIsAuthModalOpen } = useApp();
  const navigate = useNavigate();
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = deliveryDetails?.charge ?? 0;
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [showCouponSuccess, setShowCouponSuccess] = useState(false);
  const [lastAppliedCode, setLastAppliedCode] = useState('');

  // Handle back button to close Coupon Modal
  React.useEffect(() => {
    if (isCouponModalOpen) {
      window.history.pushState({ modal: 'coupon' }, '');
      const handlePopState = () => setIsCouponModalOpen(false);
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [isCouponModalOpen]);

  // Wrapper around applyCouponManually to show success banner
  const handleApplyCoupon = (coupon: any) => {
    if (navigator.vibrate) navigator.vibrate(15);
    applyCouponManually(coupon);
    if (coupon) {
      setShowCouponSuccess(true);
      setLastAppliedCode(coupon.code);
    } else {
      setShowCouponSuccess(false);
    }
  };

  // Calculate Discount
  const discountAmount = React.useMemo(() => {
    if (!appliedCoupon) return 0;
    const val = parseFloat(appliedCoupon.value);
    if (appliedCoupon.discount_type === 'percentage') {
      return Math.round((subtotal * val) / 100);
    }
    return val;
  }, [appliedCoupon, subtotal]);

  const total = subtotal + deliveryFee - discountAmount;

  const minOrderValue = settings?.minOrderValue || 80;
  const freeDeliveryThreshold = settings?.freeDeliveryThreshold || 399;

  // Suggestions logic: Items not in cart, prioritized by trending or price
  const suggestions = (products || [])
    .filter(p => !cart.find(c => c.product_id === p.id))
    .slice(0, 4);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      notify("Geolocation is not supported by your browser", "info");
      return;
    }

    notify("Identifying your Current Location...", "info");
    if (navigator.vibrate) navigator.vibrate(10);

    // First try with high accuracy (GPS chip, most accurate)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: "Current Location"
        });
        notify("Current Location captured successfully!", "success");
      },
      (error) => {
        console.error("High accuracy location failed, trying network location:", error);
        // Fallback: try with low accuracy (Wi-Fi/cell tower based)
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              address: "Current Location"
            });
            notify("Current Location captured (network-based)!", "success");
          },
          (fallbackError) => {
            console.error("Location error:", fallbackError);
            if (fallbackError.code === fallbackError.PERMISSION_DENIED) {
              notify("Permission denied. Click the 🔒 lock icon in your browser's address bar, set Location to 'Allow', then try again.", "info");
            } else {
              notify("Could not get location. Please enter your address manually.", "info");
            }
          },
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
        );
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-[40px] p-12 shadow-2xl shadow-primary/5 max-w-md mx-auto"
        >
          <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-8">
            <ShoppingBag size={48} />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-500 mb-10">Fresh items are waiting for you 🍎</p>
          <Link to="/" className="inline-flex items-center space-x-2 bg-primary text-white px-8 py-4 rounded-2xl font-bold shadow-xl shadow-primary/20 hover:scale-105 transition-all">
            <ChevronLeft size={20} />
            <span>Go Back Shopping</span>
          </Link>
        </motion.div>
      </div>
    );
  }

  const progress = Math.min((subtotal / freeDeliveryThreshold) * 100, 100);
  const remainingForFree = freeDeliveryThreshold - subtotal;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12">

      {/* ── Mobile Back Button ── */}
      <button
        onClick={() => navigate(-1)}
        className="sm:hidden flex items-center space-x-1.5 text-gray-600 hover:text-primary transition-colors mb-4 -ml-1 py-2 pr-3"
        aria-label="Go back"
      >
        <ChevronLeft size={20} />
        <span className="text-sm font-semibold">Back</span>
      </button>

      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Cart Items & Suggestions */}
        <div className="lg:w-2/3">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 font-display">
            My Cart ({cart.length})
          </h1>

          {/* Free Delivery progress bar (Mobile/Top) */}
          <div className="lg:hidden mb-6">
            <div className="bg-white p-4 sm:p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-bold text-gray-700">
                  {subtotal >= freeDeliveryThreshold ? (
                    <span className="text-primary flex items-center gap-1">You got FREE Delivery! 🎉</span>
                  ) : (
                    <span>ADD ₹<span className="text-primary">{remainingForFree}</span> MORE FOR FREE DELIVERY</span>
                  )}
                </span>
                <span className="text-xs font-bold text-gray-400">{Math.round(progress)}%</span>
              </div>
              <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-primary"
                />
              </div>
            </div>
          </div>

          {/* ── Cart Items ── */}
          <div className="space-y-2 sm:space-y-6 mb-8 sm:mb-12">
            <AnimatePresence initial={false}>
              {cart.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="bg-white p-2.5 sm:p-6 rounded-2xl sm:rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="flex items-center gap-2.5 sm:gap-6">
                    <div className="w-14 h-14 sm:w-24 sm:h-24 rounded-lg sm:rounded-2xl overflow-hidden flex-shrink-0">
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="text-xs sm:text-lg font-bold text-gray-900 mb-0 sm:mb-1 line-clamp-2 leading-tight">
                        {item.name}
                      </h3>
                      <p className="text-[10px] sm:text-sm text-gray-500 mb-0.5 sm:mb-2 truncate">{item.weight}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-primary font-bold text-xs sm:text-base">₹{item.price}</div>
                        <div className="flex items-center bg-gray-100/50 rounded-xl p-1 border border-primary/10 sm:hidden">
                          <button
                            onClick={() => {
                              if (navigator.vibrate) navigator.vibrate(10);
                              updateQuantity(item.id, -1);
                            }}
                            className="p-2 hover:bg-white rounded-lg text-primary transition-all shadow-sm flex items-center justify-center"
                          >
                            <Minus size={14} strokeWidth={3} />
                          </button>
                          <span className="w-7 text-center font-black text-xs text-gray-900">{item.quantity}</span>
                          <button
                            onClick={() => {
                              if (navigator.vibrate) navigator.vibrate(10);
                              updateQuantity(item.id, 1);
                            }}
                            className="p-2 hover:bg-white rounded-lg text-primary transition-all shadow-sm flex items-center justify-center"
                          >
                            <Plus size={14} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (navigator.vibrate) navigator.vibrate(25);
                        removeFromCart(item.id);
                      }}
                      className="hidden sm:block p-3 rounded-2xl text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  <div className="hidden sm:flex items-center justify-between mt-4">
                    <div className="flex items-center bg-gray-50 rounded-2xl p-1 border border-gray-100">
                      <button
                        onClick={() => {
                          if (navigator.vibrate) navigator.vibrate(10);
                          updateQuantity(item.id, -1);
                        }}
                        className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-primary transition-all shadow-sm"
                      >
                        <Minus size={18} />
                      </button>
                      <span className="w-10 text-center font-bold">{item.quantity}</span>
                      <button
                        onClick={() => {
                          if (navigator.vibrate) navigator.vibrate(10);
                          updateQuantity(item.id, 1);
                        }}
                        className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-primary transition-all shadow-sm"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="sm:hidden flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
                    <button
                      onClick={() => {
                        if (navigator.vibrate) navigator.vibrate(25);
                        removeFromCart(item.id);
                      }}
                      className="text-[10px] font-bold text-red-500 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md"
                    >
                      <Trash2 size={12} />
                      <span>Remove</span>
                    </button>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      Subtotal: <span className="text-gray-900 text-xs">₹{(item.price * item.quantity)}</span>
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4 sm:mb-6">
              <Sparkles className="text-accent" size={20} />
              <h2 className="text-base sm:text-2xl font-bold text-gray-900 font-display">You may also like</h2>
            </div>
            <div className="sm:hidden flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide">
              {suggestions.map(product => {
                const variant = product.variants?.[0];
                return (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="snap-start shrink-0 w-32 bg-white p-2.5 rounded-2xl border border-gray-100 shadow-sm cursor-pointer hover:border-primary/20 transition-all"
                  >
                    <div className="w-full aspect-square rounded-xl overflow-hidden mb-2 relative">
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <h4 className="text-[10px] font-bold text-gray-900 mb-1.5 line-clamp-2 leading-tight">{product.name}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-black text-primary">₹{variant?.selling_price}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (variant) {
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
                        }}
                        className="p-1 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg transition-all"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="hidden sm:grid sm:grid-cols-4 gap-4">
              {suggestions.map(product => {
                const variant = product.variants?.[0];
                return (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group cursor-pointer hover:border-primary/20"
                  >
                    <div className="aspect-square rounded-2xl overflow-hidden mb-3 relative">
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">{product.name}</h4>
                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        <span className="text-sm font-black text-primary">₹{variant?.selling_price}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (variant) {
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
                        }}
                        className="p-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl transition-all"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:w-1/3">
          <div className="sticky top-28 space-y-6">
            <div className="hidden lg:block bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm overflow-hidden relative">
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-gray-700">Delivery Status</h3>
                  <span className="text-xs font-bold text-gray-400">{Math.round(progress)}%</span>
                </div>
                <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden mb-4 border border-gray-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-primary/80 to-primary"
                  />
                </div>
                <div className="text-xs font-bold">
                  {subtotal >= freeDeliveryThreshold ? (
                    <div className="text-primary flex items-center gap-2 bg-primary/5 p-3 rounded-2xl">
                      <CheckCircle size={14} />
                      <span>You got FREE Delivery! 🎉</span>
                    </div>
                  ) : (
                    <div className="text-gray-500 bg-gray-50 p-3 rounded-2xl">
                      ADD <span className="text-primary font-black">₹{remainingForFree}</span> MORE FOR <span className="text-primary">FREE DELIVERY</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-gray-100 shadow-sm mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center space-x-2">
                  <MapPin size={20} className="text-primary" />
                  <span>Delivery Location</span>
                </h3>
                <button
                  onClick={handleUseCurrentLocation}
                  disabled={isCalculatingDistance}
                  className="flex items-center space-x-1.5 bg-gray-50 hover:bg-primary/10 text-gray-700 hover:text-primary px-3 sm:px-4 py-2 rounded-xl text-xs font-black transition-all border border-gray-100 uppercase tracking-wider"
                >
                  <Navigation size={14} />
                  <span>Current Location</span>
                </button>
              </div>
              {userLocation ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center space-x-3"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white flex-shrink-0">
                    <CheckCircle size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">Delivering to current location ✓</span>
                    {deliveryDetails && (
                      <span className={`text-xs font-medium mt-0.5 ${deliveryDetails.distance > 50 ? 'text-red-500' : 'text-gray-500'}`}>
                        Distance from store: {deliveryDetails.distance} km
                        {deliveryDetails.distance > 50 && " (GPS inaccurate or too far)"}
                      </span>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="text-xs text-gray-500 bg-gray-50 p-4 rounded-2xl border border-dashed border-gray-200 text-center">
                  Select your current location to proceed
                </div>
              )}
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/50">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 font-display">Order Summary</h3>

              {/* ── Coupon Success Banner ── */}
              <AnimatePresence>
                {showCouponSuccess && appliedCoupon && discountAmount > 0 && (
                  <CouponSuccessBanner
                    discountAmount={discountAmount}
                    couponCode={lastAppliedCode || appliedCoupon.code}
                    onClose={() => setShowCouponSuccess(false)}
                  />
                )}
              </AnimatePresence>

              {/* ── Coupon Section ── */}
              <div className="mb-8 space-y-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available Coupons</div>
                  {appliedCoupon && (
                    <button
                      onClick={() => handleApplyCoupon(null)}
                      className="text-[10px] font-black text-red-500 uppercase tracking-widest hover:text-red-600 transition-colors"
                    >
                      Remove Coupon
                    </button>
                  )}
                </div>
                <div className="space-y-3">
                  {(coupons || []).slice(0, 2).map((coupon) => {
                    const isApplied = appliedCoupon?.id === coupon.id;
                    const isLocked = subtotal < parseFloat(coupon.min_order);
                    return (
                      <div
                        key={coupon.id}
                        onClick={() => {
                          if (!isLocked) {
                            handleApplyCoupon(isApplied ? null : coupon);
                          } else {
                            notify(`Add ₹${parseFloat(coupon.min_order) - subtotal} more to unlock this coupon`, "info");
                          }
                        }}
                        className={`p-3 sm:p-4 rounded-2xl border-2 transition-all relative overflow-hidden group cursor-pointer ${isApplied ? 'border-primary bg-primary/5' : isLocked ? 'border-gray-100 bg-gray-50/50 grayscale opacity-60' : 'border-gray-100 bg-white hover:border-primary/30'}`}
                      >
                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className={`p-2 sm:p-2.5 rounded-xl ${isApplied ? 'bg-primary text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-primary group-hover:text-white'}`}>
                              <Ticket size={18} className="sm:w-5 sm:h-5" />
                            </div>
                            <div>
                              <div className="text-xs sm:text-sm font-black uppercase tracking-wider text-gray-900">{coupon.code}</div>
                              <div className="text-[9px] sm:text-[10px] text-gray-500 font-bold">
                                {coupon.discount_type === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                                <span className="text-gray-300 mx-1">•</span>
                                <span className="text-gray-400">Min ₹{coupon.min_order}</span>
                              </div>
                            </div>
                          </div>
                          {!isLocked ? (
                            isApplied ? (
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <span className="text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-widest">Applied ✓</span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleApplyCoupon(null);
                                  }}
                                  className="p-1 rounded-lg bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-all"
                                  title="Remove coupon"
                                >
                                  <X size={12} className="sm:w-3.5 sm:h-3.5" />
                                </button>
                              </div>
                            ) : (
                              <div className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover:text-primary">
                                Tap to Apply
                              </div>
                            )
                          ) : (
                            <div className="text-[8px] sm:text-[9px] font-bold text-red-400 bg-red-50 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md">
                              Min ₹{coupon.min_order}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                {/* View All Coupons Button — opens modal */}
                {(coupons || []).length > 2 && (
                  <button
                    onClick={() => setIsCouponModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 text-primary text-[10px] sm:text-xs font-black cursor-pointer hover:bg-primary/5 py-2.5 sm:py-3 rounded-xl transition-all uppercase tracking-wider border border-dashed border-primary/30 hover:border-primary/50"
                  >
                    <Ticket size={14} />
                    <span>View all coupons & save more ▸</span>
                  </button>
                )}
              </div>

              <div className="space-y-4 mb-6 sm:mb-8 bg-gray-50/50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-gray-100">
                <div className="flex justify-between text-gray-600 font-bold text-xs sm:text-sm">
                  <span>Subtotal</span>
                  <span className="text-gray-900">₹{subtotal}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-primary font-bold text-xs sm:text-sm">
                    <span className="flex items-center gap-2">
                      <Ticket size={14} />
                      Discount ({appliedCoupon?.code})
                    </span>
                    <span>- ₹{discountAmount}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600 font-bold text-xs sm:text-sm">
                  <span>Delivery Fee</span>
                  <span className={deliveryDetails && !deliveryDetails.isDeliverable ? 'text-red-500' : (deliveryFee === 0 ? 'text-primary' : 'text-gray-900')}>
                    {deliveryDetails ? (!deliveryDetails.isDeliverable ? 'N/A' : (deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`)) : '--'}
                  </span>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-base sm:text-lg font-black text-gray-900">Total</span>
                  <span className="text-xl sm:text-2xl font-black text-primary">₹{total}</span>
                </div>
              </div>

              {subtotal < minOrderValue && (
                <div className="mb-6 flex items-center gap-3 bg-red-50 text-red-600 p-3 sm:p-4 rounded-2xl border border-red-100">
                  <Info size={16} />
                  <p className="text-[10px] sm:text-xs font-bold">Min order ₹{minOrderValue}. Add ₹{minOrderValue - subtotal} more.</p>
                </div>
              )}

              <button
                onClick={() => {
                  if (settings && !isStoreOpen(settings)) {
                    notify(settings?.isStoreShutdown ? "Store is temporarily shut down." : `Store is currently closed. We open at ${formatStoreTime(settings?.openingTime)}.`, "info");
                    return;
                  }
                  if (subtotal < minOrderValue) return;
                  if (!user) {
                    notify("Please login to proceed with your order", "info");
                    setIsAuthModalOpen(true);
                    return;
                  }
                  if (!userLocation) {
                    notify("Select delivery location!", "info");
                    return;
                  }
                  if (deliveryDetails && !deliveryDetails.isDeliverable) {
                    notify(`Sorry, we do not deliver beyond 12 km (Current: ${deliveryDetails.distance} km)`, "info");
                    return;
                  }
                  navigate('/checkout');
                }}
                disabled={isCalculatingDistance || subtotal < minOrderValue || (deliveryDetails && !deliveryDetails.isDeliverable)}
                className="w-full bg-primary hover:bg-green-700 text-white py-3.5 sm:py-4 rounded-2xl font-black shadow-xl shadow-primary/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 text-sm sm:text-base"
              >
                <span>{(settings && !isStoreOpen(settings)) ? 'Store Closed' : (deliveryDetails && !deliveryDetails.isDeliverable) ? 'Out of Delivery Zone' : 'Place Order'}</span>
                <ArrowRight size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Coupon Modal ── */}
      <CouponModal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        coupons={coupons}
        appliedCoupon={appliedCoupon}
        applyCouponManually={handleApplyCoupon}
        subtotal={subtotal}
        notify={notify}
      />
    </div>
  );
};

export default CartPage;
