
import React from 'react';
import { motion } from 'framer-motion';

const ProductSkeleton = () => {
    // Array of beautiful loading images to make it look "alive" while loading
    const loadingImages = [
        "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&q=40&blur=10", // Fruits blurred
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&q=40&blur=10", // Veggies blurred
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=40&blur=10", // Leafy blurred
        "https://images.unsplash.com/photo-1620706857370-e1b977f7f13d?w=400&q=40&blur=10"  // Exotic blurred
    ];

    const randomImg = loadingImages[Math.floor(Math.random() * loadingImages.length)];

    return (
        <div className="bg-white rounded-[32px] p-3 md:p-4 border border-gray-100 flex flex-col animate-pulse">
            {/* Image Skeleton */}
            <div className="relative aspect-square rounded-[24px] overflow-hidden mb-5 bg-gray-100">
                <img
                    src={randomImg}
                    alt="Loading..."
                    className="w-full h-full object-cover opacity-50 grayscale-[0.5]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-200/50 to-transparent" />
            </div>

            {/* Content Skeleton */}
            <div className="px-1 space-y-3">
                {/* Category tag */}
                <div className="h-3 w-12 bg-gray-100 rounded-full" />

                {/* Title */}
                <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-100 rounded-lg" />
                    <div className="h-4 w-2/3 bg-gray-100 rounded-lg" />
                </div>

                {/* Variant selector */}
                <div className="flex gap-2">
                    <div className="h-6 w-12 bg-gray-50 rounded-lg border border-gray-100" />
                    <div className="h-6 w-12 bg-gray-50 rounded-lg border border-gray-100" />
                </div>

                {/* Price & Add Button */}
                <div className="flex items-center justify-between mt-4">
                    <div className="space-y-1">
                        <div className="h-6 w-16 bg-gray-200 rounded-lg" />
                        <div className="h-3 w-10 bg-gray-100 rounded-lg" />
                    </div>
                    <div className="h-12 w-12 bg-gray-100 rounded-2xl" />
                </div>
            </div>
        </div>
    );
};

export const CategorySkeleton = () => (
    <div className="animate-pulse flex flex-col items-center">
        <div className="w-full aspect-square bg-gray-100 rounded-full border-[4px] md:border-[6px] border-white shadow-sm mb-3 md:mb-6" />
        <div className="h-3 w-12 bg-gray-100 rounded-full" />
    </div>
);

export default ProductSkeleton;
