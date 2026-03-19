
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Loader2 } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ProductSkeleton, { CategorySkeleton } from '../components/ProductSkeleton';
import { useApp } from '../App';

const CategoryPage = () => {
    const { categoryId } = useParams<{ categoryId: string }>();
    const { products, categories, isLoading } = useApp();

    // Convert slug back to display name (e.g., 'leafy-greens' -> 'Leafy Greens')
    const categoryName = categoryId
        ?.split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    // Find the matching category from the database
    const matchedCategory = (categories || []).find(
        cat => cat.name.toLowerCase() === categoryName?.toLowerCase()
    );

    // Filter products by category_id (from the database) instead of hardcoded category name
    const filteredProducts = (products || []).filter(
        product => {
            if (matchedCategory) {
                return product.category_id === matchedCategory.id;
            }
            // Fallback: try matching by category name in case products have a category field
            return false;
        }
    );

    // Remove full screen loader

    return (
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
                <div className="flex items-center space-x-4">
                    <Link
                        to="/"
                        className="p-3 rounded-2xl bg-white border border-gray-100 text-gray-400 hover:text-primary hover:border-primary/20 transition-all shadow-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 font-display capitalize">{categoryName}</h1>
                        <p className="text-sm text-gray-500 font-medium">
                            {filteredProducts.length > 0 ? `Found ${filteredProducts.length} items` : 'Checking our fields...'}
                        </p>
                    </div>
                </div>

                {/* Category Switcher - uses dynamic categories from database */}
                <div className="flex overflow-x-auto pb-2 gap-3 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                    {isLoading ? (
                        Array.from({ length: 5 }).map((_, i) => (
                            <div key={`cat-skel-${i}`} className="w-24 shrink-0">
                                <CategorySkeleton />
                            </div>
                        ))
                    ) : (
                        (categories || []).filter(c => c.is_active).map((cat) => {
                            const slug = cat.name.toLowerCase().replace(/\s+/g, '-');
                            const isActive = categoryId === slug;
                            return (
                                <Link
                                    key={cat.id}
                                    to={`/category/${slug}`}
                                    onClick={() => {
                                        if (navigator.vibrate) navigator.vibrate(10);
                                    }}
                                    className={`whitespace-nowrap px-4 py-2 rounded-xl font-bold text-sm transition-all border ${isActive
                                        ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20'
                                        : 'bg-white border-gray-100 text-gray-500 hover:border-primary/20 hover:text-primary shadow-sm'
                                        }`}
                                >
                                    {cat.name}
                                </Link>
                            );
                        })
                    )}
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <ProductSkeleton key={`skeleton-${i}`} />
                    ))}
                </div>
            ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                    {filteredProducts.map((product, idx) => (
                        <ProductCard key={product.id} product={product} delay={idx * 0.05} />
                    ))}
                </div>
            ) : (
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-[40px] p-20 text-center border border-gray-100 shadow-xl shadow-gray-200/50 max-w-2xl mx-auto"
                >
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mx-auto mb-8">
                        <ShoppingBag size={48} />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">No items here yet</h2>
                    <p className="text-gray-500 mb-10 leading-relaxed font-medium">
                        Fresh items are waiting for you 🍎<br />
                        We're adding new harvest to <span className="font-bold text-primary">{categoryName}</span> shortly.
                    </p>
                    <Link
                        to="/"
                        className="inline-flex items-center space-x-2 bg-primary text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                    >
                        <span>Back to Shopping</span>
                    </Link>
                </motion.div>
            )}
        </div>
    );
};

export default CategoryPage;
