
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Timer, Zap, Flame, Lock } from 'lucide-react';
import { useApp } from '../App';
import { Offer } from '../types';

interface OfferCardProps extends Offer {
  timeLeft: string;
}

const OfferCard: React.FC<OfferCardProps> = ({
  title, discount, image, color, stockLeft, timeLeft, offerType, targetId, isExpired
}) => {
  const { addToCart, notify } = useApp();
  const navigate = useNavigate();

  const handleClick = () => {
    if (isExpired) {
      notify('This offer has ended!', 'info');
      return;
    }

    if (offerType === 'category' && targetId) {
      navigate(`/category/${targetId}`);
    } else if (offerType === 'product' && targetId) {
      navigate(`/product/${targetId}`);
    } else if (offerType === 'combo' && targetId) {
      handleClaim();
    }
  };

  const handleClaim = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isExpired) return;

    if (offerType === 'category' && targetId) {
      navigate(`/category/${targetId}`);
    } else if (offerType === 'product' && targetId) {
      navigate(`/product/${targetId}`);
    } else if (offerType === 'combo') {
      // Adding a combo pack to cart
      addToCart({
        id: `offer-${title}`,
        name: `${title} Deal`,
        price: 199,
        mrp: 499,
        unit: 'Special Box',
        category: 'Special',
        image: image,
        discount: parseInt(discount)
      });
      if (navigator.vibrate) navigator.vibrate(20);
      notify(`${title} added to cart!`, 'success');
    }
  };

  const isBannerOnly = offerType === 'combo' && !targetId;

  return (
    <motion.div
      onClick={() => {
        if (navigator.vibrate) navigator.vibrate(10);
        handleClick();
      }}
      whileTap={!isExpired ? { scale: 0.98 } : {}}
      className={`relative flex-shrink-0 w-[280px] md:w-full h-72 rounded-[32px] overflow-hidden shadow-xl group border border-white/20 transition-all ${isExpired ? 'grayscale opacity-80 cursor-not-allowed' : 'cursor-pointer hover:shadow-2xl hover:shadow-primary/20'} transition-all`}
    >
      <img
        src={image}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

      {isExpired && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
          <div className="bg-white/10 p-4 rounded-full mb-3 backdrop-blur-xl border border-white/20">
            <Lock size={32} className="text-white" />
          </div>
          <span className="text-white font-black uppercase tracking-widest text-sm">Offer Ended</span>
        </div>
      )}

      <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
        {!isExpired && stockLeft < 20 && (
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute top-4 right-4 bg-accent text-white text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg"
          >
            <Flame size={12} fill="currentColor" />
            <span>FAST SELLING</span>
          </motion.div>
        )}

        <motion.div
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          className={`${color} inline-block self-start px-4 py-1.5 rounded-xl text-xs font-black mb-3 uppercase tracking-tighter shadow-lg`}
        >
          {discount} OFF
        </motion.div>

        <h3 className="text-2xl font-black mb-2 leading-tight tracking-tight">
          {title}
        </h3>

        <div className="mb-4">
          <div className="flex justify-between text-[10px] font-bold mb-1.5 opacity-80 uppercase tracking-widest">
            <span>{isExpired ? 'Sold Out' : 'Limited Stock Left'}</span>
            <span>{stockLeft}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${stockLeft}%` }}
              transition={{ duration: 1, delay: 0.5 }}
              className={`h-full ${isExpired ? 'bg-gray-500' : stockLeft < 30 ? 'bg-accent' : 'bg-primary'} rounded-full`}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-white/70 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md">
            <Timer size={14} className={isExpired ? 'text-gray-400' : 'text-accent'} />
            <span>{isExpired ? 'Expired' : `Ends: ${timeLeft}`}</span>
          </div>
          {!isExpired && (
            <div className="bg-white text-gray-950 p-2.5 rounded-2xl shadow-lg opacity-80">
              <Zap size={18} fill="currentColor" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default OfferCard;
