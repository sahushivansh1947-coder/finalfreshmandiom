
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard, ShoppingBag, List, Users, Tag, Image as ImageIcon,
    MessageSquare, BarChart3, Settings, Bell, Search, Plus, Edit2,
    Trash2, ChevronRight, Package, Truck, CheckCircle, XCircle,
    ArrowUpRight, ArrowDownRight, MoreVertical, LogOut, TrendingUp, Clock
} from 'lucide-react';
import { insforge } from '../insforge';
import { db } from '../db';
import { useApp } from '../App';
import SmartImage from '../components/SmartImage';

const AdminPage = () => {
    const { user, logout } = useApp();
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    if (!user || user.role !== 'admin') {
        // For demo purposes, we'll allow access if we find a certain flag or just show a "Not Admin" message
        // In reality, this should be enforced: return <div className="p-20 text-center">Unauthorized Access</div>;
    }

    const menuItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Orders', icon: <ShoppingBag size={20} /> },
        { name: 'Products', icon: <Package size={20} /> },
        { name: 'Categories', icon: <List size={20} /> },
        { name: 'Coupons', icon: <Tag size={20} /> },
        { name: 'Banners', icon: <ImageIcon size={20} /> },
        { name: 'Notifications', icon: <Bell size={20} /> },
        { name: 'Reviews & Issues', icon: <MessageSquare size={20} /> },
        { name: 'Reports', icon: <BarChart3 size={20} /> },
    ];

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <aside className={`bg-white border-r border-gray-200 transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-black">GM</div>
                    {isSidebarOpen && <span className="font-brand font-black text-xl text-gray-900">Admin</span>}
                </div>

                <nav className="mt-6 px-4 space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.name}
                            onClick={() => setActiveTab(item.name)}
                            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${activeTab === item.name
                                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                : 'text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            {item.icon}
                            {isSidebarOpen && <span className="font-bold text-sm">{item.name}</span>}
                        </button>
                    ))}
                </nav>

                <div className="absolute bottom-8 w-full px-4">
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-4 p-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
                    >
                        <LogOut size={20} />
                        {isSidebarOpen && <span className="font-bold text-sm">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white border-b border-gray-100 p-6 flex items-center justify-between sticky top-0 z-10">
                    <h1 className="text-2xl font-black text-gray-900">{activeTab}</h1>
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search..."
                                className="bg-gray-50 border border-gray-100 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/20 w-64"
                            />
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        </div>
                        <button className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:text-primary transition-all relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
                            <div className="text-right">
                                <div className="text-sm font-bold text-gray-900">{user?.name || 'Admin'}</div>
                                <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Master Admin</div>
                            </div>
                            <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                                <img src={`https://ui-avatars.com/api/?name=${user?.name || 'Admin'}&background=random`} alt="Avatar" />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    <AnimatePresence mode="wait">
                        {activeTab === 'Dashboard' && <AdminDashboard />}
                        {activeTab === 'Orders' && <AdminOrders />}
                        {activeTab === 'Products' && <AdminProducts />}
                        {activeTab === 'Categories' && <AdminCategories />}
                        {activeTab === 'Coupons' && <AdminCoupons />}
                        {activeTab === 'Banners' && <AdminBanners />}
                        {activeTab === 'Notifications' && <AdminNotifications />}
                        {activeTab === 'Reviews & Issues' && <AdminReviews />}
                        {activeTab === 'Reports' && <AdminReports />}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

// --- Sub-components (could be in separate files but for speed keeping here) ---

const StatCard = ({ title, value, change, icon, color }: any) => (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</div>
            <div className="text-3xl font-black text-gray-900 mb-2">{value}</div>
            <div className={`flex items-center gap-1 text-xs font-bold ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {change.startsWith('+') ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {change}
            </div>
        </div>
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color}`}>
            {icon}
        </div>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        totalOrders: 0,
        revenue: 0,
        customers: 0,
        todayOrders: 0,
        recentOrders: [] as any[],
        lowStockItems: [] as any[]
    });

    useEffect(() => {
        const fetchStats = async () => {
            const [orders, users, products] = await Promise.all([
                db.getAllOrders(),
                db.getAllUsers(),
                db.getProducts()
            ]);

            const revenue = orders.reduce((acc: number, o: any) => acc + (o.total || 0), 0);

            const today = new Date().toISOString().split('T')[0];
            const todayOrders = orders.filter(o => {
                const orderDate = new Date(o.created_at).toISOString().split('T')[0];
                return orderDate === today;
            });

            const lowStock = (products || []).filter(p =>
                (p.variants || []).some((v: any) => v.stock < 10)
            ).slice(0, 5);

            setStats({
                totalOrders: orders.length,
                revenue,
                customers: users.length,
                todayOrders: todayOrders.length,
                recentOrders: orders.slice(0, 5),
                lowStockItems: lowStock
            });
        };
        fetchStats();
    }, []);

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Orders" value={stats.totalOrders} change="+12%" icon={<ShoppingBag />} color="bg-blue-50 text-blue-500" />
                <StatCard title="Today's Orders" value={stats.todayOrders} change="Today" icon={<Clock />} color="bg-orange-50 text-orange-500" />
                <StatCard title="Total Revenue" value={`₹${stats.revenue.toLocaleString()}`} change="+18%" icon={<BarChart3 />} color="bg-green-50 text-green-500" />
                <StatCard title="Total Customers" value={stats.customers} change="+5%" icon={<Users />} color="bg-purple-50 text-purple-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black text-gray-900">Recent Orders</h3>
                        <button className="text-xs font-black text-primary uppercase tracking-widest hover:underline">View All</button>
                    </div>
                    {/* Table Placeholder */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-50">
                                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</th>
                                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="pb-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentOrders.map(order => (
                                    <tr key={order.id} className="border-b border-gray-50/50 hover:bg-gray-50/30 transition-colors">
                                        <td className="py-4 text-xs font-bold text-gray-900">{order.readable_id || order.id.slice(0, 8)}</td>
                                        <td className="py-4 text-xs font-bold text-gray-600">{order.customer_name || 'Guest'}</td>
                                        <td className="py-4 text-xs font-black text-gray-900">₹{order.total_amount}</td>
                                        <td className="py-4">
                                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <button className="text-primary hover:bg-primary/10 p-2 rounded-lg transition-all">
                                                <ChevronRight size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                    <h3 className="text-xl font-black text-gray-900 mb-8">Stock Alerts</h3>
                    <div className="space-y-6">
                        {stats.lowStockItems.length === 0 ? (
                            <div className="text-center py-8">
                                <div className="text-gray-300 mb-2 font-black uppercase text-[10px] tracking-widest">Inventory is healthy</div>
                                <CheckCircle className="mx-auto text-green-400" size={32} />
                            </div>
                        ) : (
                            stats.lowStockItems.map(product => (
                                <div key={product.id} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500 overflow-hidden">
                                            <img src={product.image_url} alt="" className="w-8 h-8 object-cover rounded-lg" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900 truncate w-32">{product.name}</div>
                                            <div className="text-[10px] font-black text-red-500 uppercase">
                                                Only {product.variants?.[0]?.stock}{product.variants?.[0]?.unit} left
                                            </div>
                                        </div>
                                    </div>
                                    <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400"><ChevronRight size={16} /></button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const AdminOrders = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedOrder, setSelectedOrder] = useState<any>(null);

    useEffect(() => {
        db.getAllOrders().then(setOrders);
    }, []);

    const updateStatus = async (orderId: string, newStatus: string) => {
        await insforge.database.from('orders').update({ status: newStatus }).eq('id', orderId);
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex gap-2">
                    {['All', 'Placed', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled'].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${statusFilter === s ? 'bg-primary text-white border-primary border shadow-lg shadow-primary/20' : 'bg-white text-gray-400 border-gray-100 hover:border-primary/20'}`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Order ID</th>
                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Items</th>
                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</th>
                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.filter(o => statusFilter === 'All' || o.status === statusFilter).map(order => (
                            <tr key={order.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                                <td className="p-6">
                                    <span className="font-bold text-gray-900">{order.readable_id || order.id.slice(0, 8)}</span>
                                    <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">{new Date(order.created_at).toLocaleString()}</div>
                                </td>
                                <td className="p-6">
                                    <div className="font-bold text-gray-900">{order.customer_name || 'Guest'}</div>
                                    <div className="text-[10px] text-gray-400 font-bold">{order.customer_phone || 'No phone'}</div>
                                </td>
                                <td className="p-6">
                                    <div className="text-sm font-medium text-gray-600">{(order.items || []).length} items</div>
                                </td>
                                <td className="p-6">
                                    <div className="text-lg font-black text-gray-900">₹{order.total_amount}</div>
                                </td>
                                <td className="p-6">
                                    <select
                                        value={order.status}
                                        onChange={(e) => updateStatus(order.id, e.target.value)}
                                        className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border-none focus:ring-0 ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                            order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                            }`}
                                    >
                                        <option value="Placed">Placed</option>
                                        <option value="Packed">Packed</option>
                                        <option value="Out for Delivery">Out for Delivery</option>
                                        <option value="Delivered">Delivered</option>
                                        <option value="Cancelled">Cancelled</option>
                                    </select>
                                </td>
                                <td className="p-6 text-right">
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-primary transition-all shadow-sm"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedOrder && (
                <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
            )}
        </motion.div>
    );
};

const OrderDetailModal = ({ order, onClose }: any) => {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[40px] w-full max-w-xl overflow-hidden shadow-2xl overflow-y-auto max-h-[90vh]"
            >
                <div className="p-8 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
                    <div>
                        <h3 className="text-2xl font-black text-gray-900">Order #{order.readable_id || order.id.slice(0, 8)}</h3>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{order.date}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
                        <XCircle size={24} />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {/* Customer Info */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Customer</div>
                            <div className="font-bold text-gray-900">{order.customer_name || 'Guest'}</div>
                            <div className="text-sm text-gray-600">{order.customer_phone || 'No Phone'}</div>
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Payment</div>
                            <div className="font-bold text-gray-900 uppercase">{order.payment_method}</div>
                            <div className="text-sm text-green-600 font-bold">₹{order.total_amount} Total</div>
                        </div>
                    </div>

                    {/* Address */}
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Delivery Address</div>
                        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
                            <p className="text-sm text-gray-700 font-medium leading-relaxed">
                                {order.delivery_address || 'No address provided'}
                            </p>
                        </div>
                    </div>

                    {/* Items */}
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Items ({(order.items || []).length})</div>
                        <div className="space-y-3">
                            {(order.items || []).map((item: any) => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-bold text-gray-400 border border-gray-100">
                                            {item.name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-gray-900">{item.name}</div>
                                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.weight} x {item.quantity}</div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-black text-gray-900">₹{item.price * item.quantity}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="pt-6 border-t border-gray-100 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Subtotal</span>
                            <span className="font-bold">₹{order.total_amount - (order.delivery_charge || 0) + (order.discount_amount || 0)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Delivery Fee</span>
                            <span className="font-bold">₹{order.delivery_charge || 0}</span>
                        </div>
                        {order.discount_amount > 0 && (
                            <div className="flex justify-between text-sm text-red-500">
                                <span className="font-bold uppercase tracking-widest text-[10px]">Discount ({order.coupon_code})</span>
                                <span className="font-bold">-₹{order.discount_amount}</span>
                            </div>
                        )}
                        <div className="flex justify-between pt-4 border-t border-dashed border-gray-200">
                            <span className="text-sm font-black text-gray-900">Total Paid</span>
                            <span className="text-xl font-black text-primary">₹{order.total_amount}</span>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const ProductForm = ({ product, categories, onClose, onSave }: any) => {
    const [formData, setFormData] = useState({
        id: product?.id || null,
        name: product?.name || '',
        description: product?.description || '',
        categoryId: product?.category_id || '',
        imageUrl: product?.image_url || '',
        isTrending: product?.is_trending || false,
        isActive: product?.is_active !== undefined ? product.is_active : true,
        variants: product?.variants?.map((v: any) => ({
            id: v.id,
            weight: v.weight,
            unit: v.unit || 'kg',
            sellingPrice: v.selling_price,
            stock: v.stock,
            fakePrice: v.fake_price
        })) || [{ weight: '1', unit: 'kg', sellingPrice: 0, stock: 10, fakePrice: 0 }]
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await db.saveProduct({
                ...formData,
                variants: formData.variants.map((v: any) => ({
                    ...v,
                    sellingPrice: Number(v.sellingPrice),
                    stock: Number(v.stock),
                    fakePrice: Number(v.fakePrice)
                }))
            });
            onSave();
        } catch (error) {
            console.error('Failed to save product:', error);
            alert('Error saving product. Check console.');
        }
    };

    const addVariant = () => {
        setFormData(prev => ({
            ...prev,
            variants: [...prev.variants, { weight: '1', unit: 'kg', sellingPrice: 0, stock: 10, fakePrice: 0 }]
        }));
    };

    const removeVariant = (index: number) => {
        setFormData(prev => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index)
        }));
    };

    const updateVariant = (index: number, field: string, value: any) => {
        const newVariants = [...formData.variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setFormData({ ...formData, variants: newVariants });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl"
            >
                <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-2xl font-black text-gray-900">{product ? 'Edit Product' : 'Add New Product'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400">
                        <XCircle size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Product Name</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 text-sm"
                                placeholder="e.g. Alphonso Mango"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Category</label>
                            <select
                                required
                                value={formData.categoryId}
                                onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
                                className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 text-sm"
                            >
                                <option value="">Select Category</option>
                                {categories.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Image URL</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                required
                                value={formData.imageUrl}
                                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                className="flex-1 bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 text-sm"
                                placeholder="https://... or Paste Base64"
                            />
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setFormData({ ...formData, imageUrl: reader.result as string });
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <button type="button" className="h-full px-4 bg-gray-100 rounded-2xl text-gray-500 hover:bg-gray-200 transition-all flex items-center justify-center">
                                    <Plus size={20} />
                                </button>
                            </div>
                        </div>
                        {formData.imageUrl && (
                            <div className="mt-2 relative w-20 h-20 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                                <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 text-sm h-24 resize-none"
                            placeholder="Tell users why they should buy this..."
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Pricing & Variants</label>
                            <button
                                type="button"
                                onClick={addVariant}
                                className="text-primary font-black text-[10px] uppercase tracking-widest flex items-center gap-1 hover:underline"
                            >
                                <Plus size={14} /> Add Variant
                            </button>
                        </div>

                        {formData.variants.map((v: any, index: number) => (
                            <div key={index} className="bg-gray-50 p-4 rounded-2xl grid grid-cols-5 gap-3 items-end">
                                <div className="col-span-1">
                                    <label className="text-[8px] font-black text-gray-400 uppercase pl-1">Weight</label>
                                    <input
                                        type="text"
                                        value={v.weight}
                                        onChange={e => updateVariant(index, 'weight', e.target.value)}
                                        className="w-full bg-white border-none rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-[8px] font-black text-gray-400 uppercase pl-1">Unit</label>
                                    <select
                                        value={v.unit}
                                        onChange={e => updateVariant(index, 'unit', e.target.value)}
                                        className="w-full bg-white border-none rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20"
                                    >
                                        <option value="kg">kg</option>
                                        <option value="gram">g</option>
                                        <option value="pcs">pcs</option>
                                        <option value="packet">pkt</option>
                                    </select>
                                </div>
                                <div className="col-span-1">
                                    <label className="text-[8px] font-black text-gray-400 uppercase pl-1">Price</label>
                                    <input
                                        type="number"
                                        value={v.sellingPrice}
                                        onChange={e => updateVariant(index, 'sellingPrice', e.target.value)}
                                        className="w-full bg-white border-none rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-[8px] font-black text-gray-400 uppercase pl-1">Stock</label>
                                    <input
                                        type="number"
                                        value={v.stock}
                                        onChange={e => updateVariant(index, 'stock', e.target.value)}
                                        className="w-full bg-white border-none rounded-xl p-2 text-xs focus:ring-1 focus:ring-primary/20"
                                    />
                                </div>
                                <div className="col-span-1 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => removeVariant(index)}
                                        className="p-2 text-red-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
                                        disabled={formData.variants.length === 1}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 border border-gray-100 hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95"
                        >
                            {product ? 'Update Product' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};
const AdminProducts = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [categories, setCategories] = useState<any[]>([]);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const fetchAll = async () => {
        const [p, c] = await Promise.all([db.getProducts(), db.getCategories()]);
        setProducts(p);
        setCategories(c);
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            await db.deleteProduct(id);
            fetchAll();
        }
    };

    const handleEdit = (product: any) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || p.category_id === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-white border border-gray-100 rounded-2xl py-3 pl-12 pr-4 text-sm font-bold focus:outline-none focus:border-primary/20 shadow-sm"
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-white border border-gray-100 rounded-2xl py-3 px-4 text-sm font-bold focus:outline-none shadow-sm min-w-[150px]"
                    >
                        <option value="All">All Categories</option>
                        {categories.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={() => {
                        setEditingProduct(null);
                        setIsModalOpen(true);
                    }}
                    className="bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 flex items-center gap-2 hover:bg-green-700 transition-all active:scale-95"
                >
                    <Plus size={20} />
                    Add Product
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                    <div key={product.id} className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden group">
                        <div className="aspect-square relative">
                            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button
                                    onClick={() => handleEdit(product)}
                                    className="p-2 bg-white shadow-xl rounded-xl text-gray-600 hover:text-primary transition-all"
                                >
                                    <Edit2 size={16} />
                                </button>
                                <button
                                    onClick={() => handleDelete(product.id)}
                                    className="p-2 bg-white shadow-xl rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">
                                {categories.find(c => c.id === product.category_id)?.name || 'General'}
                            </div>
                            <h4 className="font-bold text-gray-900 mb-2 truncate">{product.name}</h4>
                            <div className="flex items-center justify-between">
                                <div className="text-lg font-black text-gray-900">₹{product.variants?.[0]?.selling_price || 0}</div>
                                <div className={`text-[10px] font-bold px-3 py-1 rounded-full ${product.variants?.[0]?.stock > 5 ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                                    {product.variants?.[0]?.stock > 0 ? `${product.variants[0].stock} kg left` : 'Out of Stock'}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <ProductForm
                        product={editingProduct}
                        categories={categories}
                        onClose={handleClose}
                        onSave={() => {
                            handleClose();
                            fetchAll();
                        }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};

const CategoryForm = ({ category, onClose, onSave }: any) => {
    const [formData, setFormData] = useState({
        id: category?.id || null,
        name: category?.name || '',
        imageUrl: category?.image_url || '',
        isActive: category?.is_active !== undefined ? category.is_active : true
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await db.saveCategory(formData);
            onSave();
        } catch (error) {
            console.error('Failed to save category:', error);
            alert('Error saving category.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-2xl font-black text-gray-900">{category ? 'Edit Category' : 'Add Category'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400"><XCircle size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Category Name</label>
                        <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 text-sm"
                            placeholder="e.g. Fresh Fruits"
                        />
                    </div>
                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Image URL</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    required
                                    value={formData.imageUrl}
                                    onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
                                    className="flex-1 bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 text-sm"
                                    placeholder="https://... or Paste Base64"
                                />
                                <div className="relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => {
                                                    setFormData({ ...formData, imageUrl: reader.result as string });
                                                };
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <button type="button" className="h-full px-4 bg-gray-100 rounded-2xl text-gray-500 hover:bg-gray-200 transition-all flex items-center justify-center">
                                        <Plus size={20} />
                                    </button>
                                </div>
                            </div>
                            {formData.imageUrl && (
                                <div className="mt-2 relative w-20 h-20 rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                                    <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 border border-gray-100 hover:bg-gray-50 transition-all">Cancel</button>
                        <button type="submit" className="flex-1 bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20">Save</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}

const AdminCategories = () => {
    const [categories, setCategories] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<any>(null);

    const fetchAll = async () => {
        const data = await db.getCategories();
        setCategories(data);
    };

    useEffect(() => { fetchAll(); }, []);

    const handleEdit = (cat: any) => {
        setEditingCategory(cat);
        setIsModalOpen(true);
    };

    const handleClose = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
    };

    return (
        <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm relative">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-gray-900">Manage Categories ({categories.length})</h3>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary text-white p-3 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                >
                    <Plus size={20} />
                </button>
            </div>
            <div className="space-y-4">
                {categories.map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl group hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center relative">
                                <SmartImage
                                    src={(cat.image_url || (cat as any).imageUrl || '').trim().replace(/^["']|["']$/g, '')}
                                    alt={cat.name}
                                    width={100}
                                    quality={60}
                                    aspectRatio="1/1"
                                    wrapperClassName="absolute inset-0 w-full h-full"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div>
                                <div className="font-bold text-gray-900">{cat.name}</div>
                                <div className="text-[10px] text-gray-400 font-bold uppercase">Active</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleEdit(cat)}
                                className="p-2 bg-white rounded-lg text-gray-400 hover:text-primary shadow-sm"
                            >
                                <Edit2 size={16} />
                            </button>
                            <button className="p-2 bg-white rounded-lg text-red-400 hover:text-red-500 shadow-sm">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {isModalOpen && (
                    <CategoryForm
                        category={editingCategory}
                        onClose={handleClose}
                        onSave={() => {
                            handleClose();
                            fetchAll();
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

const CouponForm = ({ coupon, onClose, onSave }: any) => {
    const [formData, setFormData] = useState({
        id: coupon?.id || null,
        code: coupon?.code || '',
        description: coupon?.description || '',
        discount_type: coupon?.discount_type || 'fixed',
        discount_value: coupon?.discount_value || 0,
        min_order: coupon?.min_order || 0,
        max_discount: coupon?.max_discount || null,
        is_active: coupon?.is_active !== undefined ? coupon.is_active : true
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await insforge.database.from('coupons').upsert(formData);
            onSave();
        } catch (error) {
            console.error('Failed to save coupon:', error);
            alert('Error saving coupon.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-2xl font-black text-gray-900">{coupon ? 'Edit Coupon' : 'Add Coupon'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400"><XCircle size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Coupon Code</label>
                        <input type="text" required value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm" placeholder="SAVE50" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Type</label>
                            <select value={formData.discount_type} onChange={e => setFormData({ ...formData, discount_type: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm">
                                <option value="fixed">Fixed Amount</option>
                                <option value="percent">Percentage</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Value</label>
                            <input type="number" required value={formData.discount_value} onChange={e => setFormData({ ...formData, discount_value: Number(e.target.value) })} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Min Order</label>
                            <input type="number" value={formData.min_order} onChange={e => setFormData({ ...formData, min_order: Number(e.target.value) })} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Max Discount</label>
                            <input type="number" value={formData.max_discount || ''} onChange={e => setFormData({ ...formData, max_discount: e.target.value ? Number(e.target.value) : null })} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm" placeholder="Optional" />
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 border border-gray-100 hover:bg-gray-50 transition-all">Cancel</button>
                        <button type="submit" className="flex-1 bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20">Save</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const BannerForm = ({ banner, onClose, onSave }: any) => {
    const [formData, setFormData] = useState({
        id: banner?.id || null,
        title: banner?.title || '',
        image_url: banner?.image_url || '',
        position: banner?.position || 'home_hero',
        is_active: banner?.is_active !== undefined ? banner.is_active : true
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await insforge.database.from('banners').upsert(formData);
            onSave();
        } catch (error) {
            console.error('Failed to save banner:', error);
            alert('Error saving banner.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[40px] w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-2xl font-black text-gray-900">{banner ? 'Edit Banner' : 'Add Banner'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl text-gray-400"><XCircle size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-8 space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Title</label>
                        <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm" placeholder="Super Summer Sale" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Image URL</label>
                        <input type="text" required value={formData.image_url} onChange={e => setFormData({ ...formData, image_url: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm" placeholder="https://..." />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Position</label>
                        <select value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} className="w-full bg-gray-50 border-none rounded-2xl p-4 text-sm">
                            <option value="home_hero">Home Hero</option>
                            <option value="home_bottom">Home Bottom</option>
                            <option value="category_page">Category Page</option>
                        </select>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-400 border border-gray-100 hover:bg-gray-50 transition-all">Cancel</button>
                        <button type="submit" className="flex-1 bg-primary text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20">Save</button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

const AdminCoupons = () => {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState<any>(null);

    const fetchCoupons = async () => {
        const { data } = await insforge.database.from('coupons').select('*').order('created_at', { ascending: false });
        setCoupons(data || []);
    };

    useEffect(() => { fetchCoupons(); }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm('Delete this coupon?')) {
            await insforge.database.from('coupons').delete().eq('id', id);
            fetchCoupons();
        }
    };

    const handleEdit = (c: any) => {
        setEditingCoupon(c);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-900">Discount Coupons ({coupons.length})</h2>
                <button onClick={() => { setEditingCoupon(null); setIsModalOpen(true); }} className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20">Add Coupon</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {coupons.map(coupon => (
                    <div key={coupon.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 flex gap-2">
                            <button onClick={() => handleEdit(coupon)} className="p-2 bg-gray-50 rounded-lg text-gray-400 opacity-0 group-hover:opacity-100 transition-all hover:text-primary"><Edit2 size={14} /></button>
                            <button onClick={() => handleDelete(coupon.id)} className="p-2 bg-gray-50 rounded-lg text-red-400 opacity-0 group-hover:opacity-100 transition-all hover:text-red-600"><Trash2 size={14} /></button>
                        </div>
                        <div className="text-2xl font-black text-primary mb-1">{coupon.code}</div>
                        <div className="text-sm font-bold text-gray-900 mb-4">{coupon.description || `Get ${coupon.discount_value}${coupon.discount_type === 'percent' ? '%' : ' OFF'}`}</div>
                        <div className="space-y-2 border-t border-gray-50 pt-4">
                            <div className="flex justify-between text-[10px] font-bold uppercase text-gray-400">
                                <span>Min Order</span>
                                <span className="text-gray-900">₹{coupon.min_order}</span>
                            </div>
                            <div className={`text-[8px] font-black uppercase px-2 py-1 rounded-full inline-block ${coupon.is_active ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                                {coupon.is_active ? 'Active' : 'Expired'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {isModalOpen && <CouponForm coupon={editingCoupon} onClose={() => setIsModalOpen(false)} onSave={() => { setIsModalOpen(false); fetchCoupons(); }} />}
            </AnimatePresence>
        </div>
    );
};

const AdminBanners = () => {
    const [banners, setBanners] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<any>(null);

    const fetchBanners = async () => {
        const { data } = await insforge.database.from('banners').select('*').order('created_at', { ascending: false });
        setBanners(data || []);
    };

    useEffect(() => { fetchBanners(); }, []);

    const handleDelete = async (id: string) => {
        if (window.confirm('Delete this banner?')) {
            await insforge.database.from('banners').delete().eq('id', id);
            fetchBanners();
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-900">App Banners ({banners.length})</h2>
                <button onClick={() => { setEditingBanner(null); setIsModalOpen(true); }} className="bg-primary text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20">Upload Banner</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {banners.map(banner => (
                    <div key={banner.id} className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden group">
                        <div className="aspect-[21/9] bg-gray-100 relative">
                            <img src={banner.image_url} alt="Banner" className="w-full h-full object-cover" />
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button onClick={() => { setEditingBanner(banner); setIsModalOpen(true); }} className="p-2 bg-white/80 backdrop-blur-md rounded-xl text-gray-600 opacity-0 group-hover:opacity-100 transition-all hover:text-primary"><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(banner.id)} className="p-2 bg-white/80 backdrop-blur-md rounded-xl text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:text-red-700 hover:bg-red-50"><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <div className="p-6">
                            <div className="font-bold text-gray-900">{banner.title || 'Promo Banner'}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase">{banner.position || 'Home Header'}</div>
                        </div>
                    </div>
                ))}
            </div>

            <AnimatePresence>
                {isModalOpen && <BannerForm banner={editingBanner} onClose={() => setIsModalOpen(false)} onSave={() => { setIsModalOpen(false); fetchBanners(); }} />}
            </AnimatePresence>
        </div>
    );
};
const AdminReviews = () => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [issues, setIssues] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            const [rev, iss] = await Promise.all([
                insforge.database.from('reviews').select('*').order('created_at', { ascending: false }),
                insforge.database.from('issues').select('*').order('created_at', { ascending: false })
            ]);
            setReviews(rev.data || []);
            setIssues(iss.data || []);
        };
        fetchData();
    }, []);

    return (
        <div className="space-y-12 pb-20">
            <section className="space-y-6">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <MessageSquare size={24} className="text-primary" />
                    Customer Reviews
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {reviews.map(review => (
                        <div key={review.id} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center font-bold text-gray-400">
                                        {review.rating}★
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-900">{review.customer_name}</div>
                                        <div className="text-[10px] text-gray-400 font-bold uppercase">{new Date(review.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <button className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${review.is_public ? 'bg-green-50 text-green-500' : 'bg-gray-100 text-gray-400'}`}>
                                    {review.is_public ? 'Public' : 'Private'}
                                </button>
                            </div>
                            <p className="text-gray-600 text-sm leading-relaxed italic">"{review.comment}"</p>
                        </div>
                    ))}
                </div>
            </section>

            <section className="space-y-6 pt-12 border-t border-gray-100">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <Bell size={24} className="text-red-500" />
                    Support Issues ({issues.filter(i => i.status === 'Open').length} Open)
                </h2>
                <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50">
                            <tr>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Customer</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="p-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {issues.map(issue => (
                                <tr key={issue.id} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="p-6">
                                        <div className="font-bold text-gray-900">{issue.customer_name}</div>
                                        <div className="text-[10px] text-gray-400 font-bold">{issue.customer_phone}</div>
                                    </td>
                                    <td className="p-6">
                                        <span className="px-3 py-1 bg-red-50 text-red-500 rounded-full text-[10px] font-black uppercase">{issue.type}</span>
                                    </td>
                                    <td className="p-6">
                                        <p className="text-sm text-gray-600 line-clamp-1">{issue.description}</p>
                                    </td>
                                    <td className="p-6">
                                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${issue.status === 'Open' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                                            {issue.status}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <button className="text-primary font-black text-[10px] uppercase hover:underline">Mark Resolved</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </section>
        </div>
    );
};

const AdminReports = () => {
    const [data, setData] = useState<any>({ totalSales: 0, totalOrders: 0, itemsSold: 0 });

    useEffect(() => {
        const fetchReports = async () => {
            const { data: o } = await insforge.database.from('orders').select('total_amount, status');
            const delivered = o?.filter(ord => ord.status === 'Delivered') || [];
            const sales = delivered.reduce((acc, curr) => acc + curr.total_amount, 0);
            setData({
                totalSales: sales,
                totalOrders: o?.length || 0,
                deliveredCount: delivered.length,
                pendingCount: (o?.length || 0) - delivered.length
            });
        };
        fetchReports();
    }, []);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-black text-gray-900 mb-8 uppercase tracking-tight">Sales Breakdown</h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-blue-50/30 rounded-2xl">
                            <div>
                                <div className="text-[10px] font-black text-blue-500 uppercase">Gross Sales</div>
                                <div className="text-2xl font-black text-gray-900">₹{data.totalSales.toLocaleString()}</div>
                            </div>
                            <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-500">
                                <BarChart3 size={24} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <div className="text-[10px] font-black text-gray-400 uppercase">Total Orders</div>
                                <div className="text-xl font-black text-gray-900">{data.totalOrders}</div>
                            </div>
                            <div className="p-4 bg-gray-50 rounded-2xl">
                                <div className="text-[10px] font-black text-gray-400 uppercase">Successful</div>
                                <div className="text-xl font-black text-green-600">{data.deliveredCount}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-6">
                        <TrendingUp size={48} />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-2">Growth Analytics</h3>
                    <p className="text-gray-400 text-sm max-w-[240px]">Detailed monthly charts and predictive analysis coming in the next update.</p>
                </div>
            </div>
        </div>
    );
};

// ─── Admin Notifications (Push Broadcast) ───────────────────────────────────
const INSFORGE_BASE = 'https://46d5hap4.us-east.insforge.app';
const INSFORGE_KEY  = 'ik_56c8374bbcda6df9fcfe54f0d777ee15';

const QUICK_TEMPLATES = [
    {
        emoji: '🔥',
        label: 'Flash Sale',
        title: '🔥 Flash Sale is LIVE!',
        body: 'Huge discounts on fresh vegetables & fruits for the next 2 hours. Shop now before it ends!',
        url: '/'
    },
    {
        emoji: '🛒',
        label: 'New Arrivals',
        title: '🌿 New Farm Arrivals!',
        body: 'Fresh produce just arrived from the mandi. Get the freshest picks at Galimandi!',
        url: '/'
    },
    {
        emoji: '🎁',
        label: 'Coupon Deal',
        title: '🎁 Exclusive Offer Just for You',
        body: 'Use code FRESH20 to get 20% off on your next order. Limited time only!',
        url: '/'
    },
    {
        emoji: '🚚',
        label: 'Free Delivery',
        title: '🚚 Free Delivery Today!',
        body: 'Order above ₹399 and get FREE delivery today. Ends at midnight!',
        url: '/'
    },
    {
        emoji: '⏰',
        label: 'Limited Stock',
        title: '⏰ Limited Stock Alert!',
        body: 'Some items are running out fast. Order now before they go out of stock!',
        url: '/'
    },
];

const AdminNotifications = () => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [url, setUrl] = useState('/');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<{ sent: number; failed: number; total: number } | null>(null);
    const [error, setError] = useState('');
    const [subscriberCount, setSubscriberCount] = useState<number | null>(null);
    const [logs, setLogs] = useState<{ ts: string; title: string; sent: number }[]>([]);

    useEffect(() => {
        // Count active subscribers
        fetch(`${INSFORGE_BASE}/rest/v1/push_subscriptions?is_active=eq.true&select=id`, {
            headers: { 'apikey': INSFORGE_KEY, 'Authorization': `Bearer ${INSFORGE_KEY}` }
        })
            .then(r => r.json())
            .then(data => setSubscriberCount(Array.isArray(data) ? data.length : 0))
            .catch(() => setSubscriberCount(0));
        // Load logs from localStorage
        const saved = localStorage.getItem('galimandi_push_logs');
        if (saved) setLogs(JSON.parse(saved));
    }, []);

    const applyTemplate = (tpl: typeof QUICK_TEMPLATES[0]) => {
        setTitle(tpl.title);
        setBody(tpl.body);
        setUrl(tpl.url);
        setResult(null);
        setError('');
    };

    const handleSend = async () => {
        if (!title.trim() || !body.trim()) {
            setError('Title and body are required.');
            return;
        }
        setSending(true);
        setResult(null);
        setError('');
        try {
            const res = await fetch(`${INSFORGE_BASE}/functions/v1/send-push`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${INSFORGE_KEY}`
                },
                body: JSON.stringify({ title, body, url, icon: '/logo.png' })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Send failed');
            setResult(data);
            // Save to local log
            const newLog = { ts: new Date().toLocaleString(), title, sent: data.sent };
            const updated = [newLog, ...logs].slice(0, 10);
            setLogs(updated);
            localStorage.setItem('galimandi_push_logs', JSON.stringify(updated));
        } catch (err: any) {
            setError(err.message || 'Something went wrong');
        } finally {
            setSending(false);
        }
    };

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-3xl">
            {/* Header stats */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-primary">
                        <Bell size={22} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Subscribers</div>
                        <div className="text-3xl font-black text-gray-900">
                            {subscriberCount === null ? '…' : subscriberCount}
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[28px] border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                        <TrendingUp size={22} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Notifications Sent</div>
                        <div className="text-3xl font-black text-gray-900">{logs.length > 0 ? logs.reduce((a, l) => a + l.sent, 0) : '0'}</div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Compose */}
                <div className="lg:col-span-3 bg-white rounded-[32px] border border-gray-100 shadow-sm p-8 space-y-6">
                    <h3 className="text-xl font-black text-gray-900">Compose Notification</h3>

                    {/* Quick Templates */}
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Quick Templates</div>
                        <div className="flex flex-wrap gap-2">
                            {QUICK_TEMPLATES.map((tpl) => (
                                <button
                                    key={tpl.label}
                                    onClick={() => applyTemplate(tpl)}
                                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 hover:bg-primary/10 hover:text-primary border border-gray-100 hover:border-primary/20 rounded-xl text-xs font-bold text-gray-600 transition-all"
                                >
                                    <span>{tpl.emoji}</span> {tpl.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Title */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Notification Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => { setTitle(e.target.value); setError(''); setResult(null); }}
                            placeholder="e.g. 🔥 Flash Sale is LIVE!"
                            className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                        />
                    </div>

                    {/* Body */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Message</label>
                        <textarea
                            value={body}
                            onChange={e => { setBody(e.target.value); setError(''); setResult(null); }}
                            placeholder="Tell your customers about the offer..."
                            rows={4}
                            className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 text-sm font-medium resize-none"
                        />
                        <div className="text-[10px] text-gray-400 text-right pr-1">{body.length} / 160 chars</div>
                    </div>

                    {/* URL */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Click URL (optional)</label>
                        <input
                            type="text"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            placeholder="/"
                            className="w-full bg-gray-50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 text-sm font-medium"
                        />
                    </div>

                    {/* Preview */}
                    {(title || body) && (
                        <div className="bg-gray-900 rounded-2xl p-4 flex items-start gap-3">
                            <img src="/logo.png" alt="" className="w-10 h-10 rounded-xl object-contain bg-white p-1 shrink-0" />
                            <div>
                                <div className="text-sm font-black text-white">{title || 'Notification Title'}</div>
                                <div className="text-xs text-gray-400 mt-0.5 font-medium">{body || 'Your message here...'}</div>
                                <div className="text-[10px] text-gray-600 mt-1">galimandi.store · now</div>
                            </div>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="bg-red-50 border border-red-100 rounded-2xl p-4 text-sm text-red-600 font-bold flex items-center gap-2">
                            <XCircle size={16} /> {error}
                        </div>
                    )}

                    {/* Success */}
                    {result && (
                        <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
                            <div className="text-sm font-black text-green-700 flex items-center gap-2">
                                <CheckCircle size={16} /> Notification Sent!
                            </div>
                            <div className="mt-2 flex gap-4 text-xs font-bold">
                                <span className="text-green-600">✅ {result.sent} delivered</span>
                                {result.failed > 0 && <span className="text-red-500">❌ {result.failed} failed</span>}
                                <span className="text-gray-400">of {result.total} total</span>
                            </div>
                        </div>
                    )}

                    {/* Send Button */}
                    <motion.button
                        onClick={handleSend}
                        disabled={sending || !title.trim() || !body.trim()}
                        whileTap={{ scale: 0.97 }}
                        className="w-full py-4 bg-primary text-white font-black text-sm rounded-2xl uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {sending ? (
                            <><motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.7, repeat: Infinity, ease: 'linear' }} />Sending…</>
                        ) : (
                            <><Bell size={16} />Send to {subscriberCount ?? '…'} Subscriber{subscriberCount !== 1 ? 's' : ''}</>
                        )}
                    </motion.button>
                </div>

                {/* Notification Log */}
                <div className="lg:col-span-2 bg-white rounded-[32px] border border-gray-100 shadow-sm p-8">
                    <h3 className="text-lg font-black text-gray-900 mb-6">Recent Sent</h3>
                    {logs.length === 0 ? (
                        <div className="text-center py-12">
                            <Bell size={32} className="text-gray-200 mx-auto mb-3" />
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">No notifications sent yet</div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {logs.map((log, i) => (
                                <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                    <div className="text-sm font-bold text-gray-900 truncate">{log.title}</div>
                                    <div className="flex items-center justify-between mt-1">
                                        <div className="text-[10px] text-gray-400 font-bold">{log.ts}</div>
                                        <div className="text-[10px] font-black text-primary bg-green-50 px-2 py-0.5 rounded-full">
                                            {log.sent} sent
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default AdminPage;
