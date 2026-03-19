
/**
 * Backend-simulated Coupon Service
 * Manages coupon validation and usage tracking.
 */

export interface CouponUsage {
    userId: string;
    couponCode: string;
    orderId: string;
    usedAt: string;
}

export interface Coupon {
    code: string;
    discountType: 'percentage' | 'fixed';
    value: number;
    minOrderValue?: number;
    description: string;
}

const VALID_COUPONS: Coupon[] = [
    { code: 'FRESH10', discountType: 'percentage', value: 10, minOrderValue: 200, description: '10% OFF on orders above ₹200' },
    { code: 'SAVE50', discountType: 'fixed', value: 50, minOrderValue: 500, description: '₹50 OFF on orders above ₹500' },
    { code: 'WELCOME', discountType: 'percentage', value: 20, minOrderValue: 100, description: '20% OFF Welcome Bonus' },
];

const STORAGE_KEY = 'galimandi_coupon_usage';

const getUsageHistory = (): CouponUsage[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

const saveUsage = (usage: CouponUsage) => {
    const history = getUsageHistory();
    history.push(usage);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
};

/**
 * Validates a coupon for a specific user.
 */
export const validateCoupon = async (userId: string, code: string, subtotal: number) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const coupon = VALID_COUPONS.find(c => c.code.toUpperCase() === code.toUpperCase());

    if (!coupon) {
        throw new Error("Invalid coupon code");
    }

    if (coupon.minOrderValue && subtotal < coupon.minOrderValue) {
        throw new Error(`Minimum order value for this coupon is ₹${coupon.minOrderValue}`);
    }

    // Check if user has already used this specific coupon
    const history = getUsageHistory();
    const alreadyUsed = history.some(u => u.userId === userId && u.couponCode.toUpperCase() === code.toUpperCase());

    if (alreadyUsed) {
        throw new Error("You have already used this coupon");
    }

    return coupon;
};

/**
 * Records coupon usage after a successful order.
 */
export const recordCouponUsage = (userId: string, code: string, orderId: string) => {
    saveUsage({
        userId,
        couponCode: code.toUpperCase(),
        orderId,
        usedAt: new Date().toISOString(),
    });
};
