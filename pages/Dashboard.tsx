
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package, MapPin, CreditCard, Wallet, Settings, LogOut,
  ChevronRight, CheckCircle2, Clock, ShoppingBag, Filter,
  ArrowLeft, Info, HelpCircle, AlertCircle, Trash2, RotateCcw,
  X, Banknote, Plus, Home as HomeIcon, Building2, Landmark,
  Bell, Check, Edit2, AlertTriangle, Smartphone, Loader2, ArrowRight, Truck
} from 'lucide-react';
import { useApp } from '../App';
import { useNavigate, Navigate } from 'react-router-dom';
import { walletService, WalletTransaction } from '../walletService';
import { paymentService, SavedPaymentMethod } from '../paymentService';
import { db } from '../db';

const DashboardPage = () => {
  const { user, logout, notify, orders, setOrders, setPendingReviewOrder, cancelOrder, addToCart, savedAddresses, setSavedAddresses, products, updateProfile, addUserAddress, removeUserAddress, walletBalance, refreshWallet } = useApp() as any;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Orders');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const selectedOrder = orders?.find((o: any) => o.id === selectedOrderId);
  const [orderFilter, setOrderFilter] = useState('All');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [issues, setIssues] = useState<any[]>([]);

  // New state for Payments and local Transactions
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<SavedPaymentMethod[]>([]);
  const [isLoadingWallet, setIsLoadingWallet] = useState(false);
  useEffect(() => {
    if (user) {
      const fetchDashboardData = async () => {
        setIsLoadingWallet(true);
        try {
          const fetchers: Promise<any>[] = [];

          if (activeTab === 'Galimandi Wallet' || activeTab === 'Payment Methods') {
            fetchers.push(walletService.getTransactions(user.id));
            fetchers.push(paymentService.getPaymentMethods(user.id));
          }

          if (activeTab === 'Support & Help') {
            fetchers.push(db.getIssues(user.id));
          }

          const results = await Promise.all(fetchers);

          let resultIdx = 0;
          if (activeTab === 'Galimandi Wallet' || activeTab === 'Payment Methods' && results.length >= 2) {
            setTransactions(results[resultIdx++]);
            setPaymentMethods(results[resultIdx++]);
            refreshWallet();
          }

          if (activeTab === 'Support & Help' && results.length >= 1) {
            setIssues(results[resultIdx++]);
          }
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
        } finally {
          setIsLoadingWallet(false);
        }
      };
      fetchDashboardData();
    }
  }, [user, activeTab]);

  // --- MOBILE BACK BUTTON HANDLER ---
  useEffect(() => {
    if (selectedOrderId || isReportModalOpen) {
      window.history.pushState({ dashboardState: 'overlay' }, '');
      const handlePopState = () => {
        if (isReportModalOpen) {
          setIsReportModalOpen(false);
        } else if (selectedOrderId) {
          setSelectedOrderId(null);
        }
      };
      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, [selectedOrderId, isReportModalOpen]);

  // Protected Route Logic
  if (!user) {
    return <Navigate to="/" replace />;
  }

  const handleTabClick = (tab: string) => {
    if (tab === 'Logout') {
      if (window.confirm("Are you sure you want to logout?")) {
        if (navigator.vibrate) navigator.vibrate(20);
        logout();
        navigate('/', { replace: true });
      }
      return;
    }
    if (navigator.vibrate) navigator.vibrate(10);
    setActiveTab(tab);
    setSelectedOrderId(null);
  };

  const handleReorder = (order: any) => {
    const itemsWithUpdatedStock = order.items.map((item: any) => {
      // Find the product that contains this variant
      const product = (products || []).find((p: any) =>
        (p.variants || []).some((v: any) => v.id === item.id || v.id === item.product_id)
      );
      // Now find the specific variant for stock check
      const variant = (product?.variants || []).find((v: any) => v.id === item.id || v.id === item.product_id);
      return { ...item, stock: variant?.stock ?? 0 };
    });

    const outOfStockItems = itemsWithUpdatedStock.filter((item: any) => item.stock <= 0);
    const availableItems = itemsWithUpdatedStock.filter((item: any) => item.stock > 0);

    const confirmMessage = outOfStockItems.length > 0
      ? `Out of stock: ${outOfStockItems.map((i: any) => i.name).join(', ')}. Add remaining ${availableItems.length} items to cart?`
      : `Add all ${availableItems.length} items from this order to your cart?`;

    if (availableItems.length === 0) {
      notify("Sorry, all items in this order are currently out of stock.", "info");
      return;
    }

    if (window.confirm(confirmMessage)) {
      if (navigator.vibrate) navigator.vibrate(15);
      availableItems.forEach((item: any) => {
        addToCart(item);
      });

      if (outOfStockItems.length > 0) {
        notify(`${outOfStockItems.length} items were out of stock and skipped.`, 'info');
      }
      notify(`${availableItems.length} items added to cart!`, "success");
    }
  };

  const filteredOrders = [...(orders || [])]
    .filter((o: any) => {
      if (!orderFilter || orderFilter === 'All') return true;
      if (orderFilter === 'Active') return o.status !== 'Delivered' && o.status !== 'Cancelled';
      return o.status === orderFilter;
    })
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        {/* Sidebar */}
        <div className="lg:w-1/4">
          <div className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-gray-100 shadow-sm sticky top-28">
            <div className="flex flex-col items-center mb-10 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-[28px] flex items-center justify-center text-primary text-2xl font-bold mb-4 shadow-inner">
                {user.name ? user.name[0] : 'U'}
              </div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">
                {new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening'}, <br /> {user.name ? user.name.split(' ')[0] : 'User'} 👋
              </h2>
              <p className="text-xs text-gray-400 mt-2 font-black uppercase tracking-widest">+91 {user.mobile}</p>
            </div>

            <nav className="space-y-1.5">
              {[
                { label: 'Orders', icon: <Package size={18} /> },
                { label: 'Saved Addresses', icon: <MapPin size={18} /> },
                { label: 'Payment Methods', icon: <CreditCard size={18} /> },
                { label: 'Galimandi Wallet', icon: <Wallet size={18} /> },
                { label: 'Settings', icon: <Settings size={18} /> },
                { label: 'Support & Help', icon: <HelpCircle size={18} /> },
                { label: 'Logout', icon: <LogOut size={18} />, danger: true },
              ].map((item, idx) => (
                <button
                  key={item.label}
                  onClick={() => handleTabClick(item.label)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl transition-all ${activeTab === item.label ? 'bg-primary text-white shadow-lg shadow-primary/20' : item.danger ? 'text-red-500 hover:bg-red-50' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center space-x-3">
                    {item.icon}
                    <span className="font-bold text-sm tracking-tight">{item.label}</span>
                  </div>
                  <ChevronRight size={14} className={activeTab === item.label ? 'opacity-100' : 'opacity-40'} />
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="lg:w-3/4">
          <AnimatePresence mode="wait">
            {activeTab === 'Orders' ? (
              <motion.div
                key="orders"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {selectedOrder ? (
                  <OrderDetailsView
                    order={selectedOrder}
                    onBack={() => setSelectedOrderId(null)}
                    onCancel={() => {
                      if (window.confirm("Confirm cancellation? Your order will be stopped immediately.")) {
                        cancelOrder(selectedOrder.id);
                      }
                    }}
                    onRate={() => setPendingReviewOrder(selectedOrder)}
                    onReorder={() => handleReorder(selectedOrder)}
                    onReport={() => setIsReportModalOpen(true)}
                  />
                ) : (
                  <>
                    <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <h1 className="text-3xl font-black text-gray-900 tracking-tight">Orders History</h1>
                      <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar scrollbar-hide">
                        {['All', 'Active', 'Delivered', 'Cancelled'].map((filter) => (
                          <button
                            key={filter}
                            onClick={() => {
                              if (navigator.vibrate) navigator.vibrate(10);
                              setOrderFilter(filter);
                            }}
                            className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${orderFilter === filter ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-gray-400 hover:text-gray-900'}`}
                          >
                            {filter}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {filteredOrders.map((ord: any) => (
                        <div
                          key={ord.id}
                          onClick={() => {
                            if (navigator.vibrate) navigator.vibrate(10);
                            setSelectedOrderId(ord.id);
                          }}
                          className="bg-white rounded-[32px] border border-gray-100 p-5 sm:p-6 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                        >
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-center space-x-4">
                              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${ord.status === 'Delivered' ? 'bg-primary/10 text-primary' : ord.status === 'Cancelled' ? 'bg-red-50 text-red-500' : 'bg-accent/10 text-accent'}`}>
                                <ShoppingBag size={20} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-0.5">
                                  <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors">{ord.readable_id || ord.id}</h4>
                                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${ord.status === 'Delivered' ? 'bg-primary/10 text-primary' : ord.status === 'Cancelled' ? 'bg-red-50 text-red-500' : 'bg-accent/10 text-accent'}`}>
                                    {ord.status}
                                  </span>
                                </div>
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{ord.date} • {ord.items.length} items</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between w-full md:w-auto md:space-x-8">
                              <div className="text-right">
                                <div className="text-lg font-black text-gray-900">₹{ord.total}</div>
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                                  {ord.paymentMethod === 'cod' ? 'COD' : ord.paymentMethod?.toUpperCase() || 'ONLINE'}
                                </div>
                              </div>
                              <ChevronRight size={18} className="text-gray-300 group-hover:text-primary transition-colors group-hover:translate-x-1" />
                            </div>
                          </div>
                        </div>
                      ))}

                      {filteredOrders.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
                          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <Filter size={32} />
                          </div>
                          <h3 className="font-bold text-gray-900">No orders found</h3>
                          <p className="text-sm text-gray-500 mt-1">Try switching to another filter</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            ) : activeTab === 'Saved Addresses' ? (
              <motion.div
                key="addresses"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <SavedAddressesSection
                  addresses={savedAddresses}
                  addUserAddress={addUserAddress}
                  removeUserAddress={removeUserAddress}
                  notify={notify}
                />
              </motion.div>
            ) : activeTab === 'Payment Methods' ? (
              <motion.div
                key="payments"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <PaymentMethodsSection
                  user={user}
                  paymentMethods={paymentMethods}
                  onUpdate={async () => {
                    const methods = await paymentService.getPaymentMethods(user.id);
                    setPaymentMethods(methods);
                  }}
                  notify={notify}
                  transactions={transactions}
                />
              </motion.div>
            ) : activeTab === 'Galimandi Wallet' ? (
              <motion.div
                key="wallet"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <WalletSection
                  balance={walletBalance}
                  transactions={transactions}
                  loading={isLoadingWallet}
                  onRefresh={async () => {
                    const trans = await walletService.getTransactions(user.id);
                    setTransactions(trans);
                  }}
                />
              </motion.div>
            ) : activeTab === 'Settings' ? (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <SettingsSection user={user} notify={notify} updateProfile={updateProfile} />
              </motion.div>
            ) : activeTab === 'Support & Help' ? (
              <motion.div
                key="support"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <IssuesSection issues={issues} notify={notify} orders={orders} onReportNew={() => setIsReportModalOpen(true)} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {isReportModalOpen && (
          <ReportModal
            onClose={() => setIsReportModalOpen(false)}
            onSubmit={async (report: any) => {
              try {
                await db.saveIssue({
                  userId: user.id,
                  orderId: selectedOrderId,
                  customerName: user.name,
                  customerPhone: user.mobile,
                  type: report.type,
                  description: report.description || report.otherMessage || 'No description provided',
                  images: report.images
                });
                // Refresh issues list if on reports tab
                if (activeTab === 'Support & Help') {
                  const updatedIssues = await db.getIssues(user.id);
                  setIssues(updatedIssues);
                }
                notify(`Your issue has been reported. Ref: ${Math.floor(Math.random() * 1000000)}`, 'success');
              } catch (error) {
                console.error('Failed to report issue:', error);
                notify('Failed to report issue. Please try again.', 'info');
              }
              setIsReportModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const SavedAddressesSection = ({ addresses, addUserAddress, removeUserAddress, notify }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({ type: 'Home', house_no: '', area: '', city: 'Rewa', landmark: '' });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.house_no || !formData.area) {
      notify("Please fill House No and Area", "info");
      return;
    }

    if (navigator.vibrate) navigator.vibrate(15);
    await addUserAddress(formData);
    setEditingId(null);
    setIsAdding(false);
    setFormData({ type: 'Home', house_no: '', area: '', city: 'Rewa', landmark: '' });
  };

  const deleteAddress = (id: string) => {
    if (window.confirm("Delete this address?")) {
      if (navigator.vibrate) navigator.vibrate(20);
      removeUserAddress(id);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Saved Addresses</h1>
        <button
          onClick={() => {
            setIsAdding(true);
            setEditingId(null);
            setFormData({ type: 'Home', house_no: '', area: '', city: 'Rewa', landmark: '' });
          }}
          className="bg-primary text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Add New</span>
        </button>
      </div>

      <AnimatePresence>
        {(isAdding || editingId !== null) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white p-8 rounded-[40px] border-2 border-primary/10 shadow-xl"
          >
            <form onSubmit={handleSave} className="space-y-6">
              <div className="flex gap-4">
                {['Home', 'Work', 'Other'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type })}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border-2 ${formData.type === type ? 'bg-primary/5 border-primary text-primary' : 'bg-gray-50 border-transparent text-gray-400'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  type="text"
                  placeholder="House / Flat / Shop No."
                  value={formData.houseNo}
                  onChange={e => setFormData({ ...formData, houseNo: e.target.value })}
                  className="bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:border-primary/20"
                />
                <input
                  type="text"
                  placeholder="Area / Locality"
                  value={formData.area}
                  onChange={e => setFormData({ ...formData, area: e.target.value })}
                  className="bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:border-primary/20"
                />
                <input
                  type="text"
                  placeholder="Landmark (Optional)"
                  value={formData.landmark}
                  onChange={e => setFormData({ ...formData, landmark: e.target.value })}
                  className="bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:border-primary/20"
                />
                <input
                  type="text"
                  value="Rewa"
                  disabled
                  className="bg-gray-100 border border-gray-200 rounded-2xl p-4 font-bold text-gray-400 cursor-not-allowed"
                />
              </div>
              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-primary/20 shadow-lg">
                  {editingId !== null ? 'Update Address' : 'Save Address'}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsAdding(false); setEditingId(null); }}
                  className="px-8 py-4 bg-gray-100 text-gray-400 rounded-2xl font-black text-xs uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addresses.map((addr: any, idx: number) => (
          <div key={idx} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative group overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                {addr.type === 'Home' ? <HomeIcon size={20} /> : addr.type === 'Work' ? <Building2 size={20} /> : <MapPin size={20} />}
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{addr.type}</span>
            </div>
            <div className="font-bold text-gray-900 mb-1">{addr.houseNo}</div>
            <div className="text-sm text-gray-500 mb-2">{addr.area}, {addr.city}</div>
            {addr.landmark && (
              <div className="text-[10px] font-bold text-primary flex items-center gap-1 bg-primary/5 px-2 py-1 rounded-md w-fit">
                <Landmark size={10} />
                <span>REF: {addr.landmark}</span>
              </div>
            )}
            <div className="absolute top-6 right-6 flex items-center gap-2">
              <button
                onClick={() => {
                  setEditingId(addr.id);
                  setFormData(addr);
                }}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-primary transition-all"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => deleteAddress(addr.id)}
                className="p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-50 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}

        {addresses.length === 0 && !isAdding && (
          <div className="md:col-span-2 text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
            <MapPin size={40} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-500 font-bold">No saved addresses yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

const WalletSection = ({ balance, transactions, loading, onRefresh }: any) => {
  const { user, notify, refreshWallet } = useApp() as any;
  if (loading) return (
    <div className="flex flex-col items-center justify-center h-80 gap-4">
      <Loader2 className="animate-spin text-primary" size={48} />
      <p className="text-gray-500 font-bold">Loading Wallet...</p>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Wallet Card */}
      <div className="bg-gray-900 rounded-[48px] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-primary/20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/20 rounded-full blur-[100px] -ml-32 -mb-32" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
                <Wallet className="text-primary" size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Total Balance</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-brand font-black">₹{balance.toFixed(2)}</span>
              <span className="text-xs text-primary font-bold uppercase tracking-widest">Available</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={async () => {
                const amount = window.prompt("Enter amount to add (₹):", "500");
                if (amount && !isNaN(Number(amount))) {
                  try {
                    if (navigator.vibrate) navigator.vibrate(20);
                    await walletService.addMoney(user.id, Number(amount));
                    notify(`₹${amount} added to your wallet!`, "success");
                    refreshWallet();
                    if (onRefresh) onRefresh();
                  } catch (e) {
                    notify("Failed to add money", "info");
                  }
                }
              }}
              className="px-8 py-3 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
            >
              Add Money
            </button>
            <div className="px-6 py-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl flex flex-col justify-center items-center text-center">
              <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">Active</span>
              <span className="text-xs font-bold text-white">Wallet ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div>
        <h3 className="text-xl font-black text-gray-900 mb-6 tracking-tight flex items-center gap-2">
          Recent Activity
          <span className="text-[10px] font-black bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full uppercase tracking-tighter">History</span>
        </h3>

        <div className="space-y-4">
          {transactions.map((t: WalletTransaction) => (
            <div key={t.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex justify-between items-center group hover:border-primary/20 transition-all">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${t.type === 'Credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                  {t.type === 'Credit' ? <RotateCcw size={20} /> : <ArrowRight size={20} className="rotate-45" />}
                </div>
                <div>
                  <div className="font-bold text-gray-900 group-hover:text-primary transition-colors">{t.description}</div>
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(t.created_at).toLocaleString()}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-lg font-black ${t.type === 'Credit' ? 'text-green-600' : 'text-gray-900'}`}>
                  {t.type === 'Credit' ? '+' : '-'}₹{t.amount}
                </div>
                <div className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">{t.type}</div>
              </div>
            </div>
          ))}

          {transactions.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-[40px] border border-gray-100">
              <p className="text-gray-400 font-bold">No transactions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const PaymentMethodsSection = ({ user, paymentMethods, onUpdate, notify, transactions }: any) => {
  const [isAdding, setIsAdding] = useState(false);
  const [addType, setAddType] = useState<'UPI' | 'Card'>('UPI');
  const [formData, setFormData] = useState<any>({});

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await paymentService.addPaymentMethod(user.id, addType, formData);
      notify(`${addType} added successfully!`, 'success');
      setIsAdding(false);
      setFormData({});
      onUpdate();
    } catch (error) {
      notify('Failed to add payment method', 'info');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Delete this payment method?")) {
      const success = await paymentService.deletePaymentMethod(id);
      if (success) {
        notify('Payment method removed', 'info');
        onUpdate();
      }
    }
  };

  const upiMethods = paymentMethods.filter((m: any) => m.type === 'UPI');
  const cardMethods = paymentMethods.filter((m: any) => m.type === 'Card');

  // Real refunds from transactions
  const refunds = transactions.filter((t: any) => t.description.toLowerCase().includes('refund'));

  return (
    <div className="space-y-12">
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Payment Methods</h2>
          <button
            onClick={() => setIsAdding(true)}
            className="bg-primary text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center gap-2"
          >
            <Plus size={16} />
            Add New
          </button>
        </div>

        {isAdding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-[40px] border border-primary/20 shadow-xl mb-8"
          >
            <form onSubmit={handleAdd} className="space-y-6">
              <div className="flex gap-4">
                {['UPI', 'Card'].map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => { setAddType(type as any); setFormData({}); }}
                    className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all border-2 ${addType === type ? 'bg-primary/5 border-primary text-primary' : 'bg-gray-50 border-transparent text-gray-400'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              {addType === 'UPI' ? (
                <input
                  required
                  type="text"
                  placeholder="name@upi"
                  value={formData.vpa || ''}
                  onChange={e => setFormData({ vpa: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:border-primary/20"
                />
              ) : (
                <div className="space-y-4">
                  <input
                    required
                    type="text"
                    placeholder="Card Number"
                    value={formData.number || ''}
                    onChange={e => setFormData({ ...formData, number: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:border-primary/20"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      required
                      type="text"
                      placeholder="MM/YY"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:border-primary/20"
                    />
                    <input
                      required
                      type="password"
                      placeholder="CVV"
                      className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:border-primary/20"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button type="submit" className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest">
                  Save Payment Method
                </button>
                <button type="button" onClick={() => setIsAdding(false)} className="px-8 bg-gray-100 text-gray-500 rounded-2xl font-black text-xs uppercase tracking-widest">
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
                <Smartphone size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Saved UPI IDs</h4>
                <p className="text-xs text-gray-500 font-medium">Fast 1-tap checkouts with UPI</p>
              </div>
            </div>

            <div className="space-y-3">
              {upiMethods.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group">
                  <span className="text-sm font-bold text-slate-700">{m.details.vpa}</span>
                  <button onClick={() => handleDelete(m.id)} className="opacity-0 group-hover:opacity-100 text-red-500 transition-opacity">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {upiMethods.length === 0 && (
                <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No UPI IDs Saved</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                <CreditCard size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900">Saved Cards</h4>
                <p className="text-xs text-gray-500 font-medium">Secured by SSL Encryption</p>
              </div>
            </div>

            <div className="space-y-3">
              {cardMethods.map((m: any) => (
                <div key={m.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-5 bg-slate-200 rounded text-[8px] flex items-center justify-center font-bold">CARD</div>
                    <span className="text-sm font-bold text-slate-700">•••• {m.details.number.slice(-4)}</span>
                  </div>
                  <button onClick={() => handleDelete(m.id)} className="opacity-0 group-hover:opacity-100 text-red-500 transition-opacity">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {cardMethods.length === 0 && (
                <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-center">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No Cards Saved</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Your Refunds</h2>
          <div className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-2">
            <CheckCircle2 size={12} />
            Direct Wallet Credits
          </div>
        </div>

        <div className="space-y-4">
          {refunds.map((r: any) => (
            <div key={r.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                  <RotateCcw size={20} />
                </div>
                <div>
                  <div className="text-sm font-black text-gray-900">{r.description}</div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(r.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center justify-between w-full sm:w-auto sm:gap-12">
                <div>
                  <div className="text-lg font-black text-primary">₹{r.amount}</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Credited to Wallet</div>
                </div>
                <div className="flex items-center gap-2 bg-green-50 text-green-600 px-4 py-1.5 rounded-full">
                  <Check size={14} strokeWidth={3} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Success</span>
                </div>
              </div>
            </div>
          ))}

          {refunds.length === 0 && (
            <div className="text-center py-16 bg-gray-50 rounded-[40px] border border-gray-100">
              <p className="text-gray-400 font-bold">No active refunds</p>
            </div>
          )}
        </div>
        <p className="text-[10px] text-gray-400 mt-6 italic font-medium px-4">
          Note: Refunds for cancelled orders are now credited instantly to your Galimandi Wallet.
        </p>
      </section>
    </div>
  );
};

const SettingsSection = ({ user, notify, updateProfile }: any) => {
  const [name, setName] = useState(user.name);
  const [isSaving, setIsSaving] = useState(false);
  const [notifications, setNotifications] = useState(user.preferences || { promo: true, orders: true, updates: false });

  const handleSave = async () => {
    if (!name.trim()) {
      notify("Name cannot be empty", "info");
      return;
    }
    setIsSaving(true);
    try {
      await updateProfile({
        name: name.trim(),
        preferences: notifications
      });
    } catch (error) {
      // notification handled in App.tsx
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-12">
      <section>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Account Settings</h1>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={`bg-primary text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center gap-2 ${isSaving ? 'opacity-70 cursor-wait' : ''}`}
          >
            {isSaving && <Loader2 className="animate-spin" size={14} />}
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Personal Info</h4>
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl p-4 font-bold outline-none focus:border-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mobile Number</label>
                <div className="w-full bg-gray-100 border border-gray-200 rounded-2xl p-4 font-bold text-gray-400 cursor-not-allowed flex items-center justify-between">
                  <span>+91 {user.mobile}</span>
                  <CheckCircle2 size={16} className="text-primary" />
                </div>
                <p className="text-[10px] text-gray-400 font-medium ml-1">Primary number cannot be changed for security</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] ml-2">Notifications</h4>
            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm space-y-6">
              {[
                { key: 'promo', label: 'Promotionals', desc: 'Updates about sales, discounts and offers' },
                { key: 'orders', label: 'Order Updates', desc: 'Real-time tracking and delivery status' },
                { key: 'updates', label: 'App Updates', desc: 'New features and service improvements' }
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-gray-900">{item.label}</div>
                    <div className="text-[10px] font-medium text-gray-400">{item.desc}</div>
                  </div>
                  <button
                    onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key as keyof typeof notifications] })}
                    className={`w-12 h-6 rounded-full transition-all relative ${notifications[item.key as keyof typeof notifications] ? 'bg-primary' : 'bg-gray-200'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notifications[item.key as keyof typeof notifications] ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-red-50 p-8 rounded-[40px] border border-red-100 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <AlertCircle size={20} />
            <h4 className="font-black text-sm uppercase tracking-widest">Sign Out</h4>
          </div>
          <p className="text-xs text-red-500 font-medium">Clear your current session from this device. Your cart remains safe.</p>
        </div>
        <button
          onClick={() => {
            if (window.confirm("Logout now?")) {
              // logout logic handled by parent
              const logoutBtn = document.querySelector('[data-logout-btn]');
              if (logoutBtn) (logoutBtn as HTMLElement).click();
            }
          }}
          className="bg-red-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-red-200"
        >
          Logout Session
        </button>
      </section>
    </div>
  );
};

function OrderDetailsView({ order, onBack, onCancel, onRate, onReorder, onReport }: any) {
  const deliveredAtNode = (order.timeline || []).find((t: any) => t.status === 'Delivered');
  const deliveredAt = deliveredAtNode ? new Date(deliveredAtNode.date) : null;
  const canReport = order.status === 'Delivered' && deliveredAt && (new Date().getTime() - deliveredAt.getTime() < 24 * 60 * 60 * 1000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <button onClick={onBack} className="flex items-center space-x-2 text-primary font-bold hover:underline mb-4 group">
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-black uppercase tracking-widest">Back to Orders</span>
      </button>

      <div className="bg-white rounded-[40px] border border-gray-100 p-6 sm:p-10 shadow-sm relative overflow-hidden">
        {/* Header Decoration */}
        <div className={`absolute top-0 left-0 w-full h-2 ${order.status === 'Delivered' ? 'bg-primary' : order.status === 'Cancelled' ? 'bg-red-500' : 'bg-accent'}`} />

        {/* Live Tracking Progress Bar for active orders */}
        {(['Placed', 'Confirmed', 'Packed', 'Out for Delivery'].includes(order.status)) && (
          <div className="mb-12 bg-gray-50 p-8 rounded-[32px] border border-gray-100 relative overflow-hidden">
            <div className="flex justify-between mb-8 relative z-10">
              {[
                { s: 'Placed', icon: <ShoppingBag size={18} />, label: 'Ordered' },
                { s: 'Packed', icon: <Package size={18} />, label: 'Packed' },
                { s: 'Out for Delivery', icon: <Truck size={18} />, label: 'On Way' },
                { s: 'Delivered', icon: <CheckCircle2 size={18} />, label: 'Arrived' }
              ].map((step, idx, arr) => {
                const statusOrder = ['Placed', 'Confirmed', 'Packed', 'Out for Delivery', 'Delivered'];
                const currentIdx = statusOrder.indexOf(order.status === 'Confirmed' ? 'Placed' : order.status);
                const stepIdx = statusOrder.indexOf(step.s);
                const isCompleted = stepIdx <= currentIdx;
                const isActive = step.s === order.status || (order.status === 'Confirmed' && step.s === 'Placed');

                return (
                  <div key={step.s} className="flex flex-col items-center gap-3 flex-1 relative">
                    {/* Connection Line */}
                    {idx < arr.length - 1 && (
                      <div className="absolute top-6 left-1/2 w-full h-[3px] bg-gray-200 -z-10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: isCompleted ? '100%' : '0%' }}
                          className="h-full bg-primary"
                        />
                      </div>
                    )}

                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isCompleted ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white text-gray-300 border border-gray-100'
                      } ${isActive ? 'ring-4 ring-primary/10 scale-110' : ''}`}>
                      {isActive && !isCompleted ? <Loader2 className="animate-spin" size={18} /> : step.icon}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>{step.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-gray-50">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Truck size={20} className="animate-bounce" />
              </div>
              <div>
                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Live Status</div>
                <div className="text-sm font-bold text-gray-900">
                  {order.status === 'Placed' && "Mandi is confirming your fresh picks..."}
                  {order.status === 'Confirmed' && "Order confirmed! Getting things ready."}
                  {order.status === 'Packed' && "Freshness packed! Waiting for delivery partner."}
                  {order.status === 'Out for Delivery' && "Your order is on the way to your doorstep!"}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start mb-12 gap-8">
          <div>
            <div className="flex items-center gap-4 mb-3">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">{order.readable_id || order.id}</h2>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${order.status === 'Delivered' ? 'bg-primary/10 text-primary' : order.status === 'Cancelled' ? 'bg-red-50 text-red-500' : 'bg-accent/10 text-accent'}`}>
                {order.status}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
              <span>{order.date}</span>
              <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
              <span className="uppercase tracking-widest">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            {order.status === 'Placed' && (
              <button
                onClick={onCancel}
                className="bg-red-50 text-red-500 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-100 shadow-sm shadow-red-100"
              >
                Cancel Order
              </button>
            )}
            {order.status === 'Delivered' && !order.isRated && (
              <button
                onClick={onRate}
                className="bg-primary text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:shadow-xl shadow-primary/20 transition-all flex items-center gap-2"
              >
                <Star size={16} />
                <span>Rate Order</span>
              </button>
            )}
            {canReport && (
              <button
                onClick={onReport}
                className="bg-red-50 text-red-600 px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-100 flex items-center gap-2"
              >
                <AlertTriangle size={16} />
                <span>Report Issue</span>
              </button>
            )}
            <button
              onClick={onReorder}
              className="bg-gray-900 text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200"
            >
              Reorder All
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Timeline & Address */}
          <div className="lg:col-span-2 space-y-12">
            <div>
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Order Status Trail</h3>
              <div className="space-y-8 ml-2">
                {(order.timeline || [{ status: 'Placed', date: order.date }]).map((t: any, i: number) => (
                  <div key={i} className="flex items-start gap-6 group">
                    <div className="flex flex-col items-center">
                      <div className={`w-3.5 h-3.5 rounded-full mt-1.5 z-10 ${i === (order.timeline || []).length - 1 && !['Delivered', 'Cancelled'].includes(order.status) ? 'bg-primary ring-4 ring-primary/20 animate-pulse' : 'bg-gray-200'}`} />
                      {i < (order.timeline || []).length - 1 && <div className="w-0.5 h-12 -mt-1 bg-gray-100 group-hover:bg-primary/20 transition-colors" />}
                    </div>
                    <div>
                      <div className={`font-bold text-sm leading-none mb-1.5 ${i === (order.timeline || []).length - 1 ? 'text-primary' : 'text-gray-900'}`}>{t.status}</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                        {new Date(t.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(t.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
                {order.status === 'Cancelled' && (
                  <div className="flex items-start gap-6">
                    <div className="w-3.5 h-3.5 rounded-full bg-red-500 mt-1.5 z-10 ring-4 ring-red-100 shadow-lg shadow-red-100" />
                    <div>
                      <div className="font-bold text-red-500 text-sm leading-none mb-1.5">Cancelled</div>
                      <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Self-cancelled by user</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-gray-50">
              <div>
                <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Delivery To</h4>
                <div className="bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={16} className="text-primary" />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Manual Address</span>
                  </div>
                  <div className="font-black text-gray-900 mb-1">{order.deliveryAddress?.houseNo}</div>
                  <p className="text-xs text-gray-500 font-medium leading-relaxed">
                    {order.deliveryAddress?.area}, <br />
                    {order.deliveryAddress?.city}
                  </p>
                  {order.deliveryAddress?.landmark && (
                    <div className="mt-4 pt-4 border-t border-gray-200/50 flex items-center gap-2 text-[10px] font-black text-primary uppercase">
                      <Landmark size={12} />
                      <span>REF: {order.deliveryAddress.landmark}</span>
                    </div>
                  )}
                </div>
              </div>
              {canReport && (
                <div>
                  <h4 className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-4">Need Help?</h4>
                  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-center h-[calc(100%-2rem)]">
                    <p className="text-xs text-gray-500 mb-4 font-medium">Something wrong with this order? Report it to our support team.</p>
                    <button
                      onClick={onReport}
                      className="flex items-center justify-center gap-2 w-full py-3 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                    >
                      <AlertTriangle size={14} />
                      Report Issue
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Items & Bill */}
          <div className="space-y-12">
            <div>
              <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em] mb-8">Bill Summary</h3>
              <div className="bg-white rounded-[32px] border border-gray-100 shadow-lg shadow-gray-200/30 overflow-hidden font-medium">
                <div className="p-6 space-y-4">
                  {order.items.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 flex items-center justify-center bg-gray-100 rounded-md text-[9px] font-black">{item.quantity}×</span>
                        <span className="text-gray-600 truncate max-w-[120px]">{item.name}</span>
                      </div>
                      <span className="font-black text-gray-900">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50/50 p-6 space-y-3 border-t border-gray-100">
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <span>Item Total</span>
                    <span>₹{order.items.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0)}</span>
                  </div>
                  {order.discountAmount > 0 && (
                    <div className="flex justify-between text-[10px] font-bold text-primary uppercase tracking-wider">
                      <span>Coupon Discount ({order.couponCode})</span>
                      <span>-₹{order.discountAmount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    <span>Delivery Fee</span>
                    <span className={order.deliveryCharge === 0 ? 'text-primary' : ''}>
                      {order.deliveryCharge === 0 ? 'FREE' : `₹${order.deliveryCharge}`}
                    </span>
                  </div>
                  <div className="pt-3 border-t border-gray-200 flex justify-between items-center font-black">
                    <span className="text-sm text-gray-900 uppercase tracking-widest">Total Bill</span>
                    <span className="text-2xl text-primary font-brand">₹{order.total}</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-center gap-2 bg-gray-50 py-3 rounded-2xl border border-gray-100">
                <ShieldCheck size={14} className="text-primary" />
                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Secured Payment via {order.paymentMethod?.toUpperCase() || 'ONLINE'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Reused Lucide icon for Star (not imported at top originally)
const Star = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const ShieldCheck = ({ size = 20, className = "" }: { size?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

function ReportModal({ onClose, onSubmit }: any) {
  const issues = ["Wrong item received", "Damaged / Spoiled item", "Missing items", "Quality not as expected", "Other"];
  const [selected, setSelected] = useState('');
  const [description, setDescription] = useState('');
  const [otherMessage, setOtherMessage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      if (images.length + files.length > 3) {
        alert("You can only upload up to 3 photos.");
        return;
      }
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const isSubmitDisabled = !selected ||
    (selected === 'Other' && !otherMessage.trim()) ||
    images.length === 0;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="p-8 pb-4 shrink-0">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Report an Issue</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="p-8 pt-0 overflow-y-auto custom-scrollbar space-y-8 no-scrollbar scrollbar-hide">
          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">What's the problem?</label>
            <div className="grid grid-cols-1 gap-3">
              {issues.map(issue => (
                <div
                  key={issue}
                  onClick={() => setSelected(issue)}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${selected === issue ? 'border-primary bg-primary/5' : 'border-gray-50 border-transparent hover:border-gray-100'}`}
                >
                  <span className="font-bold text-gray-700 text-sm">{issue}</span>
                  <div className={`w-5 h-5 rounded-full border-2 ${selected === issue ? 'border-primary flex items-center justify-center' : 'border-gray-300'}`}>
                    {selected === issue && <div className="w-2.5 h-2.5 bg-primary rounded-full" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence>
            {selected === 'Other' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2 overflow-hidden"
              >
                <label className="text-[10px] font-black text-red-500 uppercase tracking-widest px-1">Please specify (Mandatory)</label>
                <textarea
                  value={otherMessage}
                  onChange={(e) => setOtherMessage(e.target.value)}
                  placeholder="Tell us what's wrong..."
                  className="w-full bg-red-50/30 border border-red-100 focus:border-red-200 rounded-2xl p-4 outline-none transition-all min-h-[100px] resize-none text-gray-700 font-medium text-sm"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Describe the issue (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any additional details..."
              className="w-full bg-gray-50 border border-gray-100 focus:border-primary/20 rounded-2xl p-4 outline-none transition-all min-h-[100px] resize-none text-gray-700 font-medium text-sm"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Add Photos (Mandatory, Max 3)</label>
            <div className="flex flex-wrap gap-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden group">
                  <img src={img} alt="Preview" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                disabled={images.length >= 3}
                onClick={() => fileInputRef.current?.click()}
                className={`w-20 h-20 rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-all gap-1 bg-gray-50/50 ${images.length >= 3 ? 'opacity-50 cursor-not-allowed border-gray-100 text-gray-300' : 'border-gray-100 hover:border-primary/50 text-gray-400 hover:text-primary'}`}
              >
                <Plus size={20} />
                <span className="text-[10px] font-black uppercase">Photos</span>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                multiple
                accept="image/*"
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div className="p-8 shrink-0 bg-white border-t border-gray-100">
          <button
            disabled={isSubmitDisabled}
            onClick={() => onSubmit({
              type: selected,
              description,
              otherMessage,
              images
            })}
            className="w-full bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit Report
          </button>
        </div>
      </motion.div>
    </div>
  );
}

const IssuesSection = ({ issues, notify, orders, onReportNew }: any) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Support Requests</h1>
          <p className="text-sm text-gray-400 font-medium mt-1">Track and manage your reported issues</p>
        </div>
        <button
          onClick={onReportNew}
          className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <Plus size={14} />
          New Report
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {issues.map((issue: any) => {
          const order = orders?.find((o: any) => o.id === issue.order_id);
          return (
            <div key={issue.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-start gap-4">
                  <div className={`mt-1 p-3 rounded-2xl ${issue.status === 'Open' ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'}`}>
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-gray-900">{issue.type}</h3>
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${issue.status === 'Open' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                        {issue.status}
                      </span>
                    </div>
                    {order && (
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">
                        Order: {order.readable_id || order.id}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 leading-relaxed max-w-xl">{issue.description}</p>
                    {issue.images && issue.images.length > 0 && (
                      <div className="flex gap-2 mt-4">
                        {issue.images.map((img: string, idx: number) => (
                          <img key={idx} src={img} className="w-12 h-12 rounded-lg object-cover border border-gray-100" alt="evidence" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Reported on</div>
                  <div className="text-xs font-bold text-gray-900">{new Date(issue.created_at).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          );
        })}

        {(issues || []).length === 0 && (
          <div className="text-center py-20 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-gray-200">
              <HelpCircle size={32} />
            </div>
            <h3 className="font-bold text-gray-900">No issues reported</h3>
            <p className="text-sm text-gray-400 mt-1 max-w-xs mx-auto">If you have any problems with your orders, you can report them here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;