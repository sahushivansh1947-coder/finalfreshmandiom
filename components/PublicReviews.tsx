
import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Review } from '../types';

interface PublicReviewsProps {
    reviews: Review[];
}

const PublicReviews: React.FC<PublicReviewsProps> = ({ reviews }) => {
    return (
        <section className="py-24 px-4 md:px-8 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-4xl lg:text-5xl font-serif italic text-gray-900 mb-4 tracking-tight">What customers are saying</h2>
                    <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reviews.map((review, idx) => (
                        <motion.div
                            key={review.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1, duration: 0.3, ease: "easeOut" }}
                            className="bg-gray-50 p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all group relative overflow-hidden"
                        >
                            <div className="absolute top-6 right-8 text-primary/10 group-hover:text-primary/20 transition-colors">
                                <Quote size={48} fill="currentColor" />
                            </div>

                            <div className="flex items-center space-x-1 mb-6">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                        key={star}
                                        size={16}
                                        className={`${review.rating && review.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                                    />
                                ))}
                            </div>

                            <p className="text-gray-700 font-medium leading-relaxed mb-8 relative z-10">
                                "{review.comment || 'Rated the service.'}"
                            </p>

                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary font-bold shadow-sm">
                                    {review.userName[0]}
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                        {review.userName}
                                        {review.isGuest && <span className="text-[10px] font-bold bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-tighter">Guest</span>}
                                    </div>
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Verified Purchase</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default PublicReviews;
