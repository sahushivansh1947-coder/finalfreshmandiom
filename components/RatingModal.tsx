
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Send } from 'lucide-react';
import { Order } from '../types';

interface RatingModalProps {
    order: Order;
    onClose: () => void;
    onSubmit: (rating?: number, comment?: string) => void;
}

const RatingModal: React.FC<RatingModalProps> = ({ order, onClose, onSubmit }) => {
    const [rating, setRating] = useState<number | undefined>(undefined);
    const [comment, setComment] = useState('');
    const [hoveredRating, setHoveredRating] = useState<number | undefined>(undefined);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(rating, comment);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden relative"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full bg-gray-50 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all z-10"
                >
                    <X size={20} />
                </button>

                <div className="p-10">
                    <div className="text-center mb-8">
                        <div className="w-20 h-20 bg-primary/10 rounded-[32px] flex items-center justify-center text-primary mx-auto mb-6">
                            <Star size={40} fill={rating ? "currentColor" : "none"} />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Rate Your Order</h2>
                        <p className="text-gray-500 font-medium">Order #{order.id}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Star Rating */}
                        <div className="flex flex-col items-center">
                            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Tap to rate (optional)</span>
                            <div className="flex space-x-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onMouseEnter={() => setHoveredRating(star)}
                                        onMouseLeave={() => setHoveredRating(undefined)}
                                        onClick={() => setRating(star)}
                                        className="transition-transform active:scale-90 p-1"
                                    >
                                        <Star
                                            size={40}
                                            className={`transition-colors duration-200 ${(hoveredRating || rating || 0) >= star
                                                ? 'text-yellow-400 fill-yellow-400'
                                                : 'text-gray-200'
                                                }`}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Comment Area */}
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-900 ml-4">Share your feedback (optional)</label>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="How was the quality and delivery?"
                                className="w-full bg-gray-50 border border-gray-100 focus:border-primary/40 rounded-[32px] p-6 outline-none transition-all min-h-[120px] resize-none text-gray-700 font-medium"
                            />
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            <button
                                type="submit"
                                className="w-full bg-primary hover:bg-green-700 text-white py-5 rounded-[28px] font-bold shadow-xl shadow-primary/20 transition-all active:scale-[0.98] flex items-center justify-center space-x-2 group"
                            >
                                <span>{rating ? 'Submit Review' : 'Submit Feedback'}</span>
                                <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full py-4 text-gray-400 text-sm font-bold hover:text-gray-600 transition-colors"
                            >
                                Skip & Close
                            </button>
                        </div>
                    </form>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default RatingModal;
