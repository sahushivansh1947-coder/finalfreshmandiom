
import React from 'react';
import { motion } from 'framer-motion';

const ProductSkeleton = () => {
    return (
        <div className="bg-white rounded-[32px] p-3 md:p-4 border border-gray-100 flex flex-col animate-pulse">
            <style>{`
                @keyframes skeleton-shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>
            
            {/* Image Skeleton with Shimmer */}
            <div className="relative aspect-square rounded-[24px] overflow-hidden mb-5 bg-gray-100">
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100"
                  style={{
                    backgroundSize: '200% 100%',
                    animation: 'skeleton-shimmer 1.5s infinite'
                  }}
                />
            </div>

            {/* Content Skeleton */}
            <div className="px-1 space-y-3">
                <div className="h-3 w-12 bg-gray-100 rounded-full" />
                <div className="space-y-2">
                    <div className="h-4 w-full bg-gray-100 rounded-lg" />
                    <div className="h-4 w-2/3 bg-gray-100 rounded-lg" />
                </div>
                <div className="flex gap-2">
                    <div className="h-6 w-12 bg-gray-50 rounded-lg border border-gray-100" />
                    <div className="h-6 w-12 bg-gray-50 rounded-lg border border-gray-100" />
                </div>
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
        <div className="w-full aspect-square bg-gray-100 rounded-full border-[4px] md:border-[6px] border-white shadow-sm mb-3 md:mb-6 relative overflow-hidden">
            <div 
              className="absolute inset-0 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100"
              style={{
                backgroundSize: '200% 100%',
                animation: 'skeleton-shimmer 1.5s infinite'
              }}
            />
        </div>
        <div className="h-3 w-12 bg-gray-100 rounded-full" />
    </div>
);

export default ProductSkeleton;
