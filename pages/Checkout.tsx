
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, CreditCard, ShoppingBag, CheckCircle2, ChevronRight, Home, Building2, Landmark, Wallet, Banknote, Smartphone, Globe, Clock, Plus, Ticket, X, Info, ArrowRight, Search, Gift } from 'lucide-react';
import { useApp, isStoreOpen, formatStoreTime } from '../App';
import { useNavigate } from 'react-router-dom';
import { db } from '../db';
import confetti from 'canvas-confetti';
import { walletService } from '../walletService';


// ── Coupon Modal with Search (Consistent with Cart) ──
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

const CheckoutPage = () => {
  const { cart, user, setIsAuthModalOpen, setAuthSuccessCallback, userLocation, manualAddress, setManualAddress, deliveryDetails, isCalculatingDistance, notify, setOrders, clearCart, savedAddresses, settings, addUserAddress, coupons, appliedCoupon, applyCouponManually, walletBalance, refreshWallet } = useApp() as any;
  const navigate = useNavigate();

  const [step, setStep] = useState<'address' | 'payment'>(manualAddress ? 'payment' : 'address');
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);

  // Enforce login BEFORE checkout (Address/Payment)
  React.useEffect(() => {
    if (!user) {
      notify("Please login to proceed with checkout", "info");
      setAuthSuccessCallback(() => () => {
        // This is the success action
        console.log("Login success - staying on checkout");
      });
      setIsAuthModalOpen(true);
      // We no longer navigate away to /cart if possible, 
      // but if the user keeps trying without login, we show the modal.
      // If the component is hard to render without a user, we can navigate to home.
    }
  }, [user, notify, setIsAuthModalOpen, setAuthSuccessCallback]);
  const [payment, setPayment] = useState<string>('cod_upi');
  const [isOrdering, setIsOrdering] = useState(false);
  const [showManualForm, setShowManualForm] = useState(!savedAddresses || savedAddresses.length === 0);
  const [localAddress, setLocalAddress] = useState(manualAddress || {
    house_no: '',
    area: '',
    city: 'Rewa',
    landmark: ''
  });

  // Handle back button for multi-step checkout
  React.useEffect(() => {
    if (step === 'payment') {
      window.history.pushState({ checkoutStep: 'payment' }, '');
      const handlePopState = () => setStep('address');
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [step]);

  const subtotal = cart.reduce((acc: number, item: any) => acc + item.price * item.quantity, 0);

  // Calculate Discount
  const discountAmount = React.useMemo(() => {
    if (!appliedCoupon) return 0;
    const val = parseFloat(appliedCoupon.value);
    if (appliedCoupon.discount_type === 'percentage') {
      return Math.round((subtotal * val) / 100);
    }
    return val;
  }, [appliedCoupon, subtotal]);

  const deliveryFee = deliveryDetails?.charge ?? 0;
  const total = subtotal + deliveryFee - discountAmount;

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localAddress.house_no || !localAddress.area || !localAddress.city) {
      notify("Please fill all required fields", "info");
      return;
    }

    if (user) {
      await addUserAddress(localAddress);
    }

    if (navigator.vibrate) navigator.vibrate(20);
    setManualAddress(localAddress);
    setStep('payment');
  };

  const handleSelectSavedAddress = (addr: any) => {
    if (navigator.vibrate) navigator.vibrate(15);
    setLocalAddress(addr);
    setManualAddress(addr);
    setStep('payment');
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      notify("Please login to place your order", "info");
      setIsAuthModalOpen(true);
      return;
    }

    if (settings && !isStoreOpen(settings)) {
      const msg = settings?.isStoreShutdown
        ? "Store is temporarily shut down. Please check back later."
        : `Store is currently closed. We're open from ${formatStoreTime(settings?.openingTime)} to ${formatStoreTime(settings?.closingTime)}.`;
      notify(msg, "info");
      return;
    }

    if (subtotal < (settings?.minOrderValue || 80)) {
      notify(`Minimum order value is ₹${settings?.minOrderValue || 80}. Please add more items.`, "info");
      return;
    }

    if (!userLocation) {
      notify("Delivery location not found. Please go back to cart and select location.", "info");
      return;
    }

    if (!manualAddress || !localAddress.house_no || !localAddress.area) {
      notify("Please complete your delivery address details.", "info");
      setStep('address');
      return;
    }

    if (!payment) {
      notify("Please select a payment method.", "info");
      setStep('payment');
      return;
    }

    if (deliveryDetails && !deliveryDetails.isDeliverable) {
      notify(`Delivery not available beyond 12 km (Current: ${deliveryDetails.distance} km).`, "info");
      return;
    }

    if (payment === 'wallet' && walletBalance !== null && walletBalance < total) {
      notify("Insufficient wallet balance. Please choose another payment method or add money to wallet.", "info");
      return;
    }

    if (isCalculatingDistance) {
      notify("Wait a moment... calculating delivery fees.", "info");
      return;
    }

    if (navigator.vibrate) navigator.vibrate([30, 50, 30]); // Distinct pattern for order placement
    setIsOrdering(true);

    try {
      // ━━ WALLET PAYMENT PROCESSING ━━
      if (payment === 'wallet') {
        const description = `Order at Galimandi - ₹${total}`;
        await walletService.payWithWallet(user.id, total, description);
      }

      const orderDataPayload = {
        items: cart,
        user_id: user.id,
        customer_name: user.name,
        customer_phone: user.mobile,
        delivery_address: `${manualAddress.house_no}, ${manualAddress.area}, ${manualAddress.city}${manualAddress.landmark ? ` (Ref: ${manualAddress.landmark})` : ''}`,
        address_lat: userLocation.lat,
        address_lng: userLocation.lng,
        payment_method: payment === 'cod_upi' ? 'Cash on Delivery / UPI' : payment,
        total_amount: subtotal,
        discount_amount: discountAmount,
        coupon_code: appliedCoupon?.code
      };

      const newOrder = await db.placeOrder(orderDataPayload, settings);

      if (setOrders) {
        setOrders((prev: any) => [newOrder, ...prev]);
      }

      refreshWallet?.(); // Update balance in context
      clearCart?.();

      // 🎊 CONFETTI EXPLOSION 🎊
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#16A34A', '#FF6B00', '#708238', '#FDFCF7']
      });

      notify("Order placed successfully!", "success");

      // Delay navigation slightly so user can enjoy the confetti
      setTimeout(() => {
        navigate('/dashboard');
      }, 1200);
    } catch (error: any) {
      console.error('Order placement failed:', error);
      notify(error.message || "Failed to place order. Please try again.", "info");
    } finally {
      setIsOrdering(false);
    }
  };

  const paymentMethods: { id: string; name: string; icon: React.ReactNode; subtitle: string; }[] = [
    { 
      id: 'cod_upi', 
      name: 'Cash on Delivery / UPI', 
      icon: <Banknote className="text-green-600" />,
      subtitle: 'Pay at your doorstep'
    },
    ...(walletBalance !== null && walletBalance > 0 ? [{
      id: 'wallet',
      name: 'Wallet',
      icon: <Wallet className="text-amber-500" />,
      subtitle: `Balance: ₹${walletBalance}`
    }] : [])
  ];

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-12">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Main Content (Address/Payment) */}
        <div className="lg:w-2/3">
          <div className="flex items-center space-x-4 mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Checkout</h1>
            <div className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest">
              <span className={`${step === 'address' ? 'text-primary' : 'text-gray-400'}`}>Address</span>
              <ChevronRight size={14} className="text-gray-300" />
              <span className={`${step === 'payment' ? 'text-primary' : 'text-gray-400'}`}>Payment</span>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {step === 'address' ? (
              <motion.div
                key="address-step"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-8"
              >
                {/* Saved Addresses List */}
                {user && savedAddresses && savedAddresses.length > 0 && !showManualForm && (
                  <div className="space-y-6">
                    <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
                      <CheckCircle2 size={24} className="text-primary" />
                      <span>Select From Saved Addresses</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {savedAddresses.map((addr: any, idx: number) => (
                        <div
                          key={idx}
                          onClick={() => handleSelectSavedAddress(addr)}
                          className="bg-white p-6 rounded-[32px] border-2 border-gray-100 hover:border-primary/20 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            {addr.type === 'Home' ? <Home size={18} className="text-primary" /> : addr.type === 'Work' ? <Building2 size={18} className="text-primary" /> : <MapPin size={18} className="text-primary" />}
                            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{addr.type}</span>
                          </div>
                          <div className="font-bold text-gray-900 text-sm">{addr.house_no}</div>
                          <div className="text-xs text-gray-500">{addr.area}, {addr.city}</div>
                        </div>
                      ))}
                      <button
                        onClick={() => setShowManualForm(true)}
                        className="bg-gray-50/50 p-6 rounded-[32px] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-primary hover:border-primary/50 transition-all"
                      >
                        <Plus size={24} />
                        <span className="text-xs font-bold">Add New Address</span>
                      </button>
                    </div>
                  </div>
                )}

                {(showManualForm || !user || !savedAddresses || savedAddresses.length === 0) && (
                  <div className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-lg sm:text-xl font-black text-gray-900 flex items-center space-x-2">
                        <MapPin className="text-primary" />
                        <span>Address Details</span>
                      </h2>
                      {user && savedAddresses && savedAddresses.length > 0 && (
                        <button onClick={() => setShowManualForm(false)} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">
                          Use Saved Address
                        </button>
                      )}
                    </div>
                    <form onSubmit={handleAddressSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">House / Flat / Shop No.*</label>
                          <div className="relative">
                            <Home className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            <input
                              required
                              type="text"
                              placeholder="e.g. 102, Blue Heights"
                              className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/20 transition-all font-bold text-gray-700"
                              value={localAddress.house_no}
                              onChange={(e) => setLocalAddress({ ...localAddress, house_no: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Area / Locality*</label>
                          <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            <input
                              required
                              type="text"
                              placeholder="e.g. Sector 12, Civil Lines"
                              className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/20 transition-all font-bold text-gray-700"
                              value={localAddress.area}
                              onChange={(e) => setLocalAddress({ ...localAddress, area: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">City*</label>
                          <div className="relative">
                            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            <input
                              required
                              type="text"
                              placeholder="e.g. Rewa"
                              className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/20 transition-all font-bold text-gray-700"
                              value={localAddress.city}
                              onChange={(e) => setLocalAddress({ ...localAddress, city: e.target.value })}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Landmark (Optional)</label>
                          <div className="relative">
                            <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                            <input
                              type="text"
                              placeholder="e.g. Near City Mall"
                              className="w-full bg-gray-50 border border-transparent rounded-2xl py-4 pl-12 pr-4 outline-none focus:border-primary/20 transition-all font-bold text-gray-700"
                              value={localAddress.landmark}
                              onChange={(e) => setLocalAddress({ ...localAddress, landmark: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/20 transition-all hover:bg-green-700 flex items-center justify-center space-x-2"
                      >
                        <span>Choose Payment</span>
                        <ChevronRight size={18} />
                      </button>
                    </form>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="payment-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center space-x-2">
                      <CreditCard className="text-primary" />
                      <span>Payment Method</span>
                    </h2>
                    <button
                      onClick={() => setStep('address')}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Change Address
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {paymentMethods.map((method) => (
                      <div
                        key={method.id}
                        onClick={() => {
                          if (navigator.vibrate) navigator.vibrate(10);
                          setPayment(method.id);
                        }}
                        className={`p-5 rounded-3xl border-2 cursor-pointer transition-all flex items-center justify-between ${payment === method.id ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' : 'border-gray-100 hover:border-gray-200 bg-white'}`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={`p-3 rounded-2xl ${payment === method.id ? 'bg-primary/10' : 'bg-gray-50'}`}>
                            {method.icon}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{method.name}</div>
                            {method.subtitle && (
                              <div className={`text-[10px] font-black uppercase tracking-tight ${payment === method.id ? 'text-primary' : 'text-gray-400'}`}>
                                {method.subtitle}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${payment === method.id ? 'border-primary' : 'border-gray-200'}`}>
                          {payment === method.id && <div className="w-3 h-3 bg-primary rounded-full" />}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Summary & Coupons */}
        <div className="lg:w-1/3">
          <div className="sticky top-28 space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/50">
              <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center space-x-2">
                <ShoppingBag size={20} className="text-gray-400" />
                <span>Order Summary</span>
              </h3>

              {/* Cart Items */}
              <div className="max-h-40 overflow-y-auto mb-6 pr-2 custom-scrollbar space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-xs">
                    <div className="text-gray-600">
                      <span className="font-black text-[10px] text-gray-400 mr-1">{item.quantity}x</span> {item.name}
                    </div>
                    <div className="font-bold text-gray-900">₹{item.price * item.quantity}</div>
                  </div>
                ))}
              </div>

              {/* ── ZOMATO-STYLE AVAILABLE COUPONS SECTION ── */}
              <div className="mb-8 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Available Coupons</h4>
                  {appliedCoupon && (
                    <button
                      onClick={() => applyCouponManually(null)}
                      className="text-[10px] font-black text-red-500 uppercase flex items-center gap-1 hover:bg-red-50 py-1 px-2 rounded-lg transition-all"
                    >
                      <X size={12} />
                      Remove
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {(coupons || []).slice(0, 2).map((coupon: any) => {
                    const isApplied = appliedCoupon?.id === coupon.id;
                    const isOtherApplied = appliedCoupon && !isApplied;
                    const isLocked = subtotal < parseFloat(coupon.min_order);
                    const benefitText = coupon.discount_type === 'percentage'
                      ? `${coupon.value}% OFF up to ₹${coupon.max_discount || '90'}`
                      : `Flat ₹${coupon.value} OFF`;

                    return (
                      <motion.div
                        key={coupon.id}
                        layout
                        onClick={() => {
                          if (isLocked) {
                            notify(`Add ₹${(parseFloat(coupon.min_order) - subtotal).toFixed(0)} more to use this coupon`, 'info');
                          } else {
                            applyCouponManually(isApplied ? null : coupon);
                          }
                        }}
                        className={`group relative p-4 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden
                          ${isApplied ? 'border-primary bg-primary/5 shadow-md shadow-primary/5' :
                            isLocked ? 'border-gray-100 bg-gray-50/50 opacity-60' :
                              isOtherApplied ? 'border-gray-50 opacity-40 grayscale cursor-not-allowed pointer-events-none' :
                                'border-gray-100 bg-white hover:border-primary/30'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-black uppercase text-gray-900 tracking-wider bg-gray-100 px-2 py-0.5 rounded-md border border-dashed border-gray-300">
                                {coupon.code}
                              </span>
                              {isApplied ? (
                                <span className="text-[9px] font-black text-white bg-primary px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">APPLIED ✓</span>
                              ) : isLocked ? (
                                <span className="text-[9px] font-black text-red-400 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-widest">NOT APPLICABLE</span>
                              ) : (
                                <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-all">AVAILABLE</span>
                              )}
                            </div>
                            <div className={`text-sm font-black ${isLocked ? 'text-gray-400' : 'text-gray-900'}`}>{benefitText}</div>
                            <div className="text-[10px] font-bold text-gray-400 mt-0.5">Above ₹{coupon.min_order}</div>
                            <div className="text-[9px] font-medium text-gray-400 mt-2 italic flex items-center gap-1">
                              <Info size={10} />
                              Valid for one-time use per user
                            </div>

                            {/* Reason for not applicable (Zomato Style) */}
                            {isLocked && (
                              <div className="mt-3 text-[10px] font-black text-red-500 bg-red-50 p-2 rounded-xl flex items-center gap-2 border border-red-100">
                                <Plus size={10} />
                                Add ₹{(parseFloat(coupon.min_order) - subtotal).toFixed(0)} more to use this coupon
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Background Decoration */}
                        <div className={`absolute -right-2 -bottom-2 opacity-5 pointer-events-none ${isApplied ? 'text-primary' : 'text-gray-300'}`}>
                          <Ticket size={64} />
                        </div>
                      </motion.div>
                    );
                  })}
                  {(coupons || []).length > 2 && (
                    <button
                      onClick={() => setIsCouponModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 text-primary text-[10px] font-black cursor-pointer hover:bg-primary/5 py-2.5 rounded-xl transition-all uppercase tracking-wider border border-dashed border-primary/30 hover:border-primary/50"
                    >
                      <Ticket size={14} />
                      <span>View all coupons & save more ▸</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Bill Details */}
              <div className="border-t border-gray-100 pt-6 space-y-4 mb-8">
                <div className="flex justify-between text-gray-500 font-bold text-xs uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-gray-900">₹{subtotal}</span>
                </div>

                {appliedCoupon && discountAmount > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-primary font-black text-xs uppercase tracking-widest">
                      <div className="flex items-center gap-2">
                        <Ticket size={14} />
                        <span>Coupon ({appliedCoupon.code})</span>
                        <button onClick={() => applyCouponManually(null)} className="text-red-400 hover:text-red-600 transition-colors">
                          <X size={12} />
                        </button>
                      </div>
                      <span>-₹{discountAmount}</span>
                    </div>
                    <p className="text-[9px] text-primary/70 font-bold pl-5">
                      {appliedCoupon.discount_type === 'percentage'
                        ? `${appliedCoupon.value}% off applied on ₹${subtotal}`
                        : `Flat ₹${appliedCoupon.value} off applied`}
                    </p>
                  </div>
                )}

                <div className="flex justify-between text-gray-500 font-bold text-xs uppercase tracking-widest">
                  <span>Delivery Fee</span>
                  <span className={!deliveryDetails?.isDeliverable ? 'text-red-500 font-black' : (deliveryFee === 0 ? 'text-primary font-black' : 'text-gray-900 font-black')}>
                    {!deliveryDetails?.isDeliverable ? 'N/A' : (deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`)}
                  </span>
                </div>

                {userLocation && (
                  <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.1em] p-3 rounded-2xl justify-center border ${deliveryDetails?.distance > 50 ? 'bg-red-50 text-red-600 border-red-100' : 'bg-primary/5 text-primary/60 border-primary/10'}`}>
                    <MapPin size={12} />
                    <span>Deliver to current location ({deliveryDetails?.distance} KM)</span>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-lg font-black text-gray-900 tracking-tight">Total</span>
                    <span className="text-2xl font-black text-primary">₹{total}</span>
                  </div>

                  {/* SAVINGS HIGHLIGHT (Zomato Style) */}
                  <AnimatePresence>
                    {appliedCoupon && discountAmount > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-emerald-50 text-primary text-[10px] font-black uppercase tracking-[0.15em] py-2.5 rounded-xl text-center border border-emerald-100"
                      >
                        You saved ₹{discountAmount} with {appliedCoupon.code} 🎉
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isOrdering || isCalculatingDistance || (deliveryDetails && !deliveryDetails.isDeliverable)}
                className={`w-full bg-primary hover:bg-green-700 text-white py-4 rounded-2xl font-black shadow-xl shadow-primary/20 transition-all flex items-center justify-center space-x-2 relative overflow-hidden
                  ${(isOrdering || isCalculatingDistance || (deliveryDetails && !deliveryDetails.isDeliverable)) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
              >
                {isOrdering ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="text-sm uppercase tracking-widest">Processing...</span>
                  </div>
                ) : (settings && !isStoreOpen(settings)) ? (
                  <div className="flex items-center space-x-2">
                    <Clock size={20} />
                    <span className="text-sm uppercase tracking-widest">Store Closed</span>
                  </div>
                ) : (deliveryDetails && !deliveryDetails.isDeliverable) ? (
                  <span className="text-sm uppercase tracking-widest">Out of Delivery Zone</span> 
                ) : (
                  <>
                    <span className="text-sm uppercase tracking-widest">Place Order</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>

              {/* Footer Notifications */}
              <div className="mt-4 space-y-2">
                {!userLocation && (
                  <p className="text-[9px] text-red-500 text-center font-black uppercase tracking-widest">Select location in cart</p>
                )}
                {userLocation && !manualAddress && (
                  <p className="text-[9px] text-amber-500 text-center font-black uppercase tracking-widest">Complete address to proceed</p>
                )}
                {userLocation && manualAddress && !payment && (
                  <p className="text-[9px] text-amber-500 text-center font-black uppercase tracking-widest">Select payment method</p>
                )}
              </div>
            </div>

            {/* Delivery To (Summary Card) */}
            {manualAddress && (
              <div className="bg-gray-50/50 p-6 rounded-[32px] border border-gray-100 flex items-start gap-4">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  {manualAddress.type === 'Home' ? <Home size={18} className="text-primary" /> : <Building2 size={18} className="text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 flex items-center justify-between">
                    <span>Delivering To</span>
                    <button onClick={() => setStep('address')} className="text-primary hover:underline">Edit</button>
                  </div>
                  <div className="text-xs font-black text-gray-900 mb-0.5 truncate">{manualAddress.house_no}</div>
                  <div className="text-[10px] text-gray-500 font-bold truncate">{manualAddress.area}, {manualAddress.city}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <CouponModal
        isOpen={isCouponModalOpen}
        onClose={() => setIsCouponModalOpen(false)}
        coupons={coupons}
        appliedCoupon={appliedCoupon}
        applyCouponManually={applyCouponManually}
        subtotal={subtotal}
        notify={notify}
      />
    </div>
  );
};

export default CheckoutPage;
