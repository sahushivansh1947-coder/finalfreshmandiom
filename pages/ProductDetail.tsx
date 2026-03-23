
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ShoppingCart, Star, Clock, ShieldCheck, Plus, Minus, Heart, Share2, RotateCcw, Headset, Truck, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { useApp, SEO } from '../App';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';

const ProductDetail = () => {
    const { productId } = useParams<{ productId: string }>();
    const navigate = useNavigate();
    const { cart, addToCart, updateQuantity, toggleLike, likes, products, isLoading } = useApp();

    const product = (products || []).find(p => p.id === productId);

    const [selectedVariant, setSelectedVariant] = useState<any>(null);

    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isKeyInfoOpen, setIsKeyInfoOpen] = useState(true);
    const [isInfoOpen, setIsInfoOpen] = useState(true);

    useEffect(() => {
        if (product && product.variants && product.variants.length > 0) {
            setSelectedVariant(product.variants[0]);
        }
    }, [product]);

    if (!product) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
                <p className="text-gray-500 mb-8">The product you're looking for doesn't exist or has been removed.</p>
                <button
                    onClick={() => navigate('/')}
                    className="bg-primary text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20"
                >
                    Go Back Home
                </button>
            </div>
        );
    }

    const currentVariant = selectedVariant || (product.variants?.[0]);
    const cartItem = cart.find(item => item.id === currentVariant?.id);
    const quantity = cartItem?.quantity || 0;
    const isLiked = likes.includes(product.id);

    const handleAddToCart = () => {
        if (!currentVariant) return;
        addToCart({
            id: currentVariant.id,
            product_id: product.id,
            name: product.name,
            price: currentVariant.selling_price,
            weight: currentVariant.weight,
            quantity: 1,
            image_url: product.image_url
        });
        if (navigator.vibrate) navigator.vibrate(20);
    };

    return (
        <div className="min-h-screen bg-[#F5F7F9] pb-32 md:pb-0">
            <SEO title={product.name} description={`Buy fresh ${product.name} online at Galimandi. ${product.description || 'Sourced directly from farms in Rewa.'} Best quality and price guaranteed.`} />
            {/* Mobile Header - Ultra Clean Fixed Navigation */}
            <div className="fixed top-0 left-0 right-0 h-16 px-4 flex items-center justify-between z-[110] md:hidden">
                <button
                    onClick={() => navigate(-1)}
                    className="w-10 h-10 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 text-gray-900 active:scale-95 transition-transform"
                >
                    <ChevronLeft size={22} strokeWidth={3} />
                </button>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            if (navigator.vibrate) navigator.vibrate(15);
                            toggleLike(product.id);
                        }}
                        className={`w-10 h-10 flex items-center justify-center rounded-xl shadow-sm border border-gray-100 transition-all ${isLiked ? 'bg-red-500 text-white border-red-500' : 'bg-white/95 text-gray-900'} backdrop-blur-sm active:scale-95`}
                    >
                        <Heart size={18} fill={isLiked ? "currentColor" : "none"} strokeWidth={isLiked ? 0 : 2.5} />
                    </button>
                    <button className="w-10 h-10 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-xl shadow-sm border border-gray-100 text-gray-900 active:scale-95">
                        <Share2 size={18} strokeWidth={2.5} />
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto md:px-8 md:py-12">
                {/* Desktop Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="hidden md:flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors mb-10 group"
                >
                    <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-primary/5 transition-colors">
                        <ChevronLeft size={20} />
                    </div>
                    <span className="font-bold">Back</span>
                </button>

                <div className="flex flex-col md:grid md:grid-cols-2 lg:gap-20 md:gap-10">
                    {/* Product Image Section */}
                    <div className="relative w-full aspect-square md:rounded-[40px] overflow-hidden bg-white">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full h-full flex items-center justify-center p-6 md:p-12 mb-8"
                        >
                            <img
                                src={product.image_url}
                                alt={product.name}
                                className="w-full h-full object-contain relative z-10"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://plus.unsplash.com/premium_photo-1661322640130-f6a1e2c36653?w=800&q=80';
                                }}
                            />
                        </motion.div>
                        {/* Pagination dots removed as requested */}
                    </div>

                    {/* Content Section */}
                    <div className="relative z-20 bg-white md:bg-transparent rounded-t-[32px] md:rounded-none px-6 pt-8 pb-10 md:p-0 shadow-[0_-10px_30px_rgba(0,0,0,0.04)] md:shadow-none -mt-4 md:mt-0">
                        <h1 className="text-xl md:text-4xl font-black text-[#1F1F1F] mb-1 font-brand">
                            {product.name}
                        </h1>

                        <div className="mt-6">
                            <h3 className="text-sm font-black text-[#666] mb-4">Select Unit</h3>
                            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                                {product.variants.map((v) => (
                                    <button
                                        key={v.id}
                                        onClick={() => setSelectedVariant(v)}
                                        className={`relative min-w-[140px] p-4 pt-6 rounded-2xl border-2 transition-all flex flex-col items-start gap-1 ${currentVariant?.id === v.id
                                            ? 'border-primary bg-primary/5'
                                            : 'border-gray-100 bg-white'
                                            }`}
                                    >
                                        {v.fake_price > v.selling_price && (
                                            <div className="absolute top-0 left-0 bg-gradient-to-r from-orange-500 to-orange-400 text-white text-[9px] font-black px-2 py-1 rounded-tl-[14px] rounded-br-[14px] uppercase tracking-tighter">
                                                {Math.round(((v.fake_price - v.selling_price) / v.fake_price) * 100)}% OFF
                                            </div>
                                        )}
                                        <span className="text-sm font-black text-[#1F1F1F] mt-1">{v.weight}</span>
                                        <div className="flex items-center gap-1.5 mt-1">
                                            <span className="text-sm font-black text-[#1F1F1F]">₹{v.selling_price}</span>
                                            {v.fake_price > v.selling_price && (
                                                <span className="text-[11px] text-[#999] line-through">MRP ₹{v.fake_price}</span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setIsDetailsOpen(!isDetailsOpen)}
                            className="mt-8 flex items-center gap-1 text-[#0C831F] font-black text-sm hover:opacity-80"
                        >
                            View product details
                            <ChevronDown size={18} className={`transition-transform duration-300 ${isDetailsOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isDetailsOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.25 }}
                                    className="overflow-hidden"
                                >

                                    {/* Product Highlights Strip - Medium Compact 4-column */}
                                    <div className="mt-4 grid grid-cols-4 gap-2 mb-4 px-1">
                                        <div className="flex flex-col items-center gap-1.5 bg-[#F5F7F9] rounded-xl py-3 px-1 border border-gray-100/50">
                                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                                                <Truck size={16} className="text-[#0C831F]" strokeWidth={2.5} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[9px] font-black text-[#1F1F1F] uppercase tracking-tighter leading-none">Fast</p>
                                                <p className="text-[8px] text-[#999] mt-0.5 font-bold uppercase tracking-tighter leading-none">Delivery</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center gap-1.5 bg-[#F5F7F9] rounded-xl py-3 px-1 border border-gray-100/50">
                                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                                                <Headset size={16} className="text-[#0C831F]" strokeWidth={2.5} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[9px] font-black text-[#1F1F1F] uppercase tracking-tighter leading-none">24/7</p>
                                                <p className="text-[8px] text-[#999] mt-0.5 font-bold uppercase tracking-tighter leading-none">Support</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center gap-1.5 bg-[#F5F7F9] rounded-xl py-3 px-1 border border-gray-100/50">
                                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                                                <Star size={16} className="text-[#0C831F]" strokeWidth={2.5} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[9px] font-black text-[#1F1F1F] uppercase tracking-tighter leading-none">Direct</p>
                                                <p className="text-[8px] text-[#999] mt-0.5 font-bold uppercase tracking-tighter leading-none">Source</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-center gap-1.5 bg-[#F5F7F9] rounded-xl py-3 px-1 border border-gray-100/50">
                                            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-sm">
                                                <RotateCcw size={16} className="text-[#0C831F]" strokeWidth={2.5} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[9px] font-black text-[#1F1F1F] uppercase tracking-tighter leading-none">24h</p>
                                                <p className="text-[8px] text-[#999] mt-0.5 font-bold uppercase tracking-tighter leading-none">Replace</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="rounded-2xl border border-gray-100 overflow-hidden bg-white">
                                        {/* Key Information Sub-Section */}
                                        <div className="border-b border-gray-100">
                                            <button
                                                onClick={() => setIsKeyInfoOpen(!isKeyInfoOpen)}
                                                className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                                            >
                                                <span className="text-sm font-black text-[#1F1F1F]">Key Information</span>
                                                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isKeyInfoOpen ? 'rotate-180' : ''}`} />
                                            </button>
                                            {isKeyInfoOpen && (
                                                <div className="px-4 pb-4 space-y-0">
                                                    <div className="flex items-start py-2.5 border-t border-gray-50">
                                                        <span className="text-xs text-[#999] w-32 shrink-0 pt-0.5">Health Benefits</span>
                                                        <span className="text-xs text-[#333] flex-1 leading-relaxed">{product.health_benefits || 'Natural Source of Vitamins and Minerals'}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Info Sub-Section */}
                                        <div>
                                            <button
                                                onClick={() => setIsInfoOpen(!isInfoOpen)}
                                                className="w-full flex items-center justify-between px-4 py-3.5 text-left"
                                            >
                                                <span className="text-sm font-black text-[#1F1F1F]">Info</span>
                                                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isInfoOpen ? 'rotate-180' : ''}`} />
                                            </button>
                                            {isInfoOpen && (
                                                <div className="px-4 pb-4 space-y-0 text-[11px]">
                                                    <div className="flex items-start py-2.5 border-t border-gray-50">
                                                        <span className="text-xs text-[#999] w-32 shrink-0 pt-0.5">Description</span>
                                                        <span className="text-xs text-[#333] flex-1 leading-relaxed font-medium">{product.description || 'Fresh and hand-picked, sourced daily from local Rewa Mandi.'}</span>
                                                    </div>
                                                    <div className="flex items-center py-2.5 border-t border-gray-50">
                                                        <span className="text-xs text-[#999] w-32 shrink-0">Unit</span>
                                                        <span className="text-xs font-semibold text-[#333]">{currentVariant?.weight} {currentVariant?.unit}</span>
                                                    </div>
                                                    <div className="flex items-center py-2.5 border-t border-gray-50">
                                                        <span className="text-xs text-[#999] w-32 shrink-0">Shelf Life</span>
                                                        <span className="text-xs font-semibold text-[#333]">{product.shelf_life || '2–4 days'}</span>
                                                    </div>
                                                    <div className="flex items-start py-2.5 border-t border-gray-50">
                                                        <span className="text-xs text-[#999] w-32 shrink-0 pt-0.5">Disclaimer</span>
                                                        <span className="text-xs text-[#999] flex-1 leading-relaxed italic">We strive for accuracy, but product packaging may contain additional or different information.</span>
                                                    </div>
                                                    <div className="flex items-center py-2.5 border-t border-gray-50">
                                                        <span className="text-xs text-[#999] w-32 shrink-0">Customer Care</span>
                                                        <span className="text-xs font-semibold text-[#333]">{product.customer_care_details || 'support@galimandi.com'}</span>
                                                    </div>
                                                    <div className="flex items-center py-2.5 border-t border-gray-50">
                                                        <span className="text-xs text-[#999] w-32 shrink-0">Country of Origin</span>
                                                        <span className="text-xs font-semibold text-[#333]">India 🇮🇳</span>
                                                    </div>
                                                    <div className="flex items-start py-2.5 border-t border-gray-50">
                                                        <span className="text-xs text-[#999] w-32 shrink-0 pt-0.5">Manufacturer</span>
                                                        <span className="text-xs text-[#333] flex-1 leading-relaxed">Galimandi Pvt. Ltd.<br />Gali Mandi Complex, Near Civil Lines, Rewa – 486001, MP</span>
                                                    </div>
                                                    <div className="flex items-start py-2.5 border-t border-gray-50">
                                                        <span className="text-xs text-[#999] w-32 shrink-0 pt-0.5">Marketer</span>
                                                        <span className="text-xs text-[#333] flex-1">Galimandi Pvt. Ltd.</span>
                                                    </div>
                                                    <div className="flex items-start py-2.5 border-t border-gray-50">
                                                        <span className="text-xs text-[#999] w-32 shrink-0 pt-0.5">Return Policy</span>
                                                        <span className="text-xs text-[#333] flex-1 leading-relaxed">Item is non-returnable. For a damaged or incorrect item, raise a replacement request within <span className="font-bold text-primary">24 hours</span> of delivery.</span>
                                                    </div>
                                                    <div className="flex items-start py-2.5 border-t border-gray-50">
                                                        <span className="text-xs text-[#999] w-32 shrink-0 pt-0.5">Seller</span>
                                                        <span className="text-xs text-[#333] flex-1 leading-relaxed">Galimandi Pvt. Ltd.<br />Gali Mandi, Rewa, MP – 486001</span>
                                                    </div>

                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="mt-12 md:hidden">
                            <h3 className="text-md font-black text-[#1F1F1F] mb-6">Top products in this category</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pb-6 items-start">
                                {isLoading ? (
                                    Array.from({ length: 6 }).map((_, i) => (
                                        <ProductSkeleton key={`skeleton-${i}`} />
                                    ))
                                ) : (
                                    (products || [])
                                        .filter(p => p.id !== product.id)
                                        .slice(0, 9)
                                        .map((p) => (
                                            <div key={p.id} className="flex flex-col">
                                                <ProductCard product={p} hideAddToCart={true} />
                                            </div>
                                        ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Bottom Bar - Matches Reference Image */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 md:hidden z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
                <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-[#1F1F1F]">{currentVariant?.weight}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="text-lg font-black text-[#1F1F1F]">₹{currentVariant?.selling_price}</span>
                            {currentVariant?.fake_price > currentVariant?.selling_price && (
                                <span className="text-xs text-[#999] line-through">MRP ₹{currentVariant.fake_price}</span>
                            )}
                            {currentVariant?.fake_price > currentVariant?.selling_price && (
                                <span className="bg-orange-50 text-orange-600 text-[9px] font-black px-1.5 py-0.5 rounded-md">
                                    {Math.round(((currentVariant.fake_price - currentVariant.selling_price) / currentVariant.fake_price) * 100)}% OFF
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] text-[#999] font-medium leading-none mt-0.5">Inclusive of all taxes</span>
                    </div>

                    <div className="w-1/2">
                        {quantity === 0 ? (
                            <button
                                onClick={handleAddToCart}
                                className="w-full bg-[#0C831F] text-white py-3.5 rounded-xl font-black text-sm shadow-lg shadow-green-100 active:scale-95 transition-transform"
                            >
                                Add to cart
                            </button>
                        ) : (
                            <div className="w-full flex items-center justify-between bg-[#0C831F] text-white py-3 rounded-xl px-4 shadow-lg">
                                <button onClick={() => {
                                    if (navigator.vibrate) navigator.vibrate(10);
                                    updateQuantity(currentVariant.id, -1);
                                }} className="p-1"><Minus size={18} strokeWidth={3} /></button>
                                <span className="font-black text-sm">{quantity}</span>
                                <button onClick={() => {
                                    if (navigator.vibrate) navigator.vibrate(10);
                                    updateQuantity(currentVariant.id, 1);
                                }} className="p-1"><Plus size={18} strokeWidth={3} /></button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
