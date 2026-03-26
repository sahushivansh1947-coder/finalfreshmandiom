import { insforge } from './insforge';
import { Product, Category, Order, Review, CartItem, ProductVariant } from './types';

const STORE_LOCATION = {
    lat: 24.533252,
    lng: 81.293027
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
};

export const calculateDeliveryFee = (amount: number, distance: number, threshold: number = 399): number => {
    if (amount >= threshold) return 0;
    const distRound = Math.ceil(distance) === 0 ? 1 : Math.ceil(distance);
    return (distRound * 6) + 10;
};

// Simple In-Memory Cache for reduced TTFB
const _dbCache: any = {
    settings: null,
    categories: null,
    products: {}, // categoryId as key
    lastFetch: {}
};
const CACHE_TTL = 60000; // 60 seconds

const isCacheValid = (key: string) => {
    return _dbCache[key] && (Date.now() - (_dbCache.lastFetch[key] || 0) < CACHE_TTL);
};

export const db = {
    // 0. SETTINGS
    async getSettings() {
        if (isCacheValid('settings')) return _dbCache.settings;

        const { data, error } = await insforge.database
            .from('system_settings')
            .select('*')
            .limit(1)
            .single();
        if (error) return null;
        
        const settings = {
            openingTime: data.opening_time,
            closingTime: data.closing_time,
            isStoreShutdown: data.is_store_shutdown,
            minOrderValue: Number(data.min_order_value),
            freeDeliveryThreshold: Number(data.free_delivery_threshold),
            supportNumber: data.support_number,
            supportEmail: data.support_email,
            privacyPolicy: data.privacy_policy,
            termsOfService: data.terms_of_service,
            refundPolicy: data.refund_policy,
            faqSupport: data.faq_support
        };

        _dbCache.settings = settings;
        _dbCache.lastFetch.settings = Date.now();
        return settings;
    },

    // 1. AUTH & USERS
    async getProfile(userId: string) {
        const { data, error } = await insforge.database
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    async getAllUsers() {
        const { data, error } = await insforge.database
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data;
    },

    async getUserByPhone(phone: string) {
        const { data, error } = await insforge.database
            .from('users')
            .select('*')
            .eq('mobile', phone)
            .single();
        if (error && error.code !== 'PGRST116') throw error;
        return data;
    },

    async updateProfile(userId: string, profile: any) {
        // Step 1: Look up existing user by mobile number
        const { data: existingUser } = await insforge.database
            .from('users')
            .select('id, mobile')
            .eq('mobile', profile.mobile)
            .single();

        if (existingUser) {
            // Step 2a: User exists — UPDATE only name/preferences, NEVER touch the id
            // This prevents foreign key violations on addresses, orders etc.
            const { data, error } = await insforge.database
                .from('users')
                .update({
                    name: profile.name,
                    preferences: profile.preferences,
                    last_login: new Date().toISOString()
                })
                .eq('mobile', profile.mobile)
                .select();

            if (error) {
                console.error('DB UPDATE ERROR:', error);
                throw error;
            }
            return data?.[0] || existingUser;
        } else {
            // Step 2b: New user — INSERT with provided userId
            const { data, error } = await insforge.database
                .from('users')
                .insert([{
                    id: userId,
                    name: profile.name,
                    mobile: profile.mobile,
                    role: profile.role || 'customer',
                    preferences: profile.preferences,
                    last_login: new Date().toISOString()
                }])
                .select();

            if (error) {
                console.error('DB INSERT ERROR:', error);
                throw error;
            }
            return data?.[0] || { id: userId, ...profile };
        }
    },

    // 2. PRODUCTS & CATEGORIES
    async getCategories() {
        if (isCacheValid('categories')) return _dbCache.categories;

        const { data, error } = await insforge.database
            .from('categories')
            .select('*')
            .eq('is_active', true);
        if (error) throw error;

        _dbCache.categories = data;
        _dbCache.lastFetch.categories = Date.now();
        return data as Category[];
    },

    async getProducts(categoryId?: string) {
        const cacheKey = `products_${categoryId || 'all'}`;
        if (isCacheValid(cacheKey)) return _dbCache.products[cacheKey];

        let query = insforge.database
            .from('products')
            .select('*, variants:product_variants(*)');

        if (categoryId) {
            query = query.eq('category_id', categoryId);
        }

        const { data, error } = await query.eq('is_active', true);
        if (error) throw error;

        _dbCache.products[cacheKey] = data;
        _dbCache.lastFetch[cacheKey] = Date.now();
        return data as Product[];
    },

    async saveProduct(productData: any) {
        // 1. Save Product Basic Info
        const payload = {
            category_id: productData.categoryId,
            name: productData.name,
            description: productData.description,
            image_url: productData.imageUrl,
            is_trending: productData.isTrending || false,
            is_fast_selling: productData.isFastSelling || false,
            is_active: productData.isActive !== undefined ? productData.isActive : true,
            shelf_life: productData.shelfLife || '',
            health_benefits: productData.healthBenefits || '',
            customer_care_details: productData.customerCareDetails || ''
        };

        const { data: product, error } = await insforge.database
            .from('products')
            .upsert(productData.id ? { id: productData.id, ...payload } : payload)
            .select()
            .single();

        if (error) throw error;

        // 2. Save Variants if provided
        if (productData.variants && productData.variants.length > 0) {
            const variantsPayload = productData.variants.map((v: any) => ({
                id: v.id || undefined,
                product_id: product.id,
                weight: v.weight,
                unit: v.unit || 'kg',
                base_price_per_kg: v.basePricePerKg,
                fake_price: v.fakePrice,
                selling_price: v.sellingPrice,
                discount_percent: v.discountPercent,
                stock: v.stock
            }));

            const { error: vError } = await insforge.database
                .from('product_variants')
                .upsert(variantsPayload);

            if (vError) throw vError;
        }

        return product;
    },

    async deleteProduct(productId: string) {
        const { error } = await insforge.database
            .from('products')
            .update({ is_active: false })
            .eq('id', productId);
        if (error) throw error;
        return true;
    },

    async saveCategory(categoryData: any) {
        const payload = {
            name: categoryData.name,
            image_url: categoryData.imageUrl,
            is_active: categoryData.isActive !== undefined ? categoryData.isActive : true
        };

        const { data, error } = await insforge.database
            .from('categories')
            .upsert(categoryData.id ? { id: categoryData.id, ...payload } : payload)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    // 3. ORDERS
    async placeOrder(orderData: {
        items: CartItem[];
        user_id: string;
        customer_name?: string;
        customer_phone?: string;
        delivery_address?: string;
        address_id?: string;
        address_lat?: number;
        address_lng?: number;
        payment_method: string;
        total_amount: number;
        discount_amount?: number;
        coupon_code?: string;
    }, preFetchedSettings?: any) {
        // Fetch current threshold from DB to ensure accurate calculation
        const settings = preFetchedSettings || await this.getSettings();
        const threshold = settings?.freeDeliveryThreshold || 399;

        // Calculate distance and delivery charge strictly from backend rules
        const distance = (orderData.address_lat && orderData.address_lng)
            ? calculateDistance(STORE_LOCATION.lat, STORE_LOCATION.lng, orderData.address_lat, orderData.address_lng)
            : 0;

        const deliveryCharge = calculateDeliveryFee(orderData.total_amount, distance, threshold);
        const readableId = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

        // A. Insert Order
        const { data: order, error: orderError } = await insforge.database
            .from('orders')
            .insert([{
                readable_id: readableId,
                user_id: orderData.user_id,
                customer_name: orderData.customer_name,
                customer_phone: orderData.customer_phone,
                delivery_address: orderData.delivery_address,
                address_id: orderData.address_id,
                total_amount: (orderData.total_amount - (orderData.discount_amount || 0)) + deliveryCharge,
                delivery_charge: deliveryCharge,
                discount_amount: orderData.discount_amount || 0,
                coupon_code: orderData.coupon_code || null,
                distance_km: distance,
                lat: orderData.address_lat,
                lng: orderData.address_lng,
                payment_method: orderData.payment_method,
                status: 'Placed',
                timeline: [{ status: 'Placed', date: new Date().toISOString() }]
            }])
            .select()
            .single();

        if (orderError) throw orderError;

        // B. Insert Order Items
        const orderItems = orderData.items.map(item => ({
            order_id: order.id,
            variant_id: item.id, // Current item ID is variant ID
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            weight: item.weight
        }));

        const { error: itemsError } = await insforge.database
            .from('order_items')
            .insert(orderItems);

        if (itemsError) throw itemsError;

        return {
            ...order,
            total: order.total_amount,
            date: new Date(order.created_at).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }),
            items: orderItems
        };
    },

    async cancelOrder(orderId: string) {
        // 1. Fetch current order to get details and timeline
        const { data: order, error: fetchError } = await insforge.database
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .single();

        if (fetchError || !order) throw new Error('Order not found');
        if (order.status === 'Cancelled') return true;

        const timeline = order.timeline || [];
        const updatedTimeline = [...timeline, { status: 'Cancelled', date: new Date().toISOString() }];

        // 2. Update order status
        const { error: updateError } = await insforge.database
            .from('orders')
            .update({
                status: 'Cancelled',
                timeline: updatedTimeline
            })
            .eq('id', orderId);

        if (updateError) throw updateError;

        // 3. Handle Wallet Refund if not COD
        if (order.payment_method !== 'cod') {
            const refundAmount = order.total_amount;
            const userId = order.user_id;

            // Get current wallet balance from users
            const { data: profile } = await insforge.database
                .from('users')
                .select('wallet_balance')
                .eq('id', userId)
                .single();

            const currentBalance = profile?.wallet_balance || 0;

            // Update balance
            await insforge.database
                .from('users')
                .update({ wallet_balance: currentBalance + refundAmount })
                .eq('id', userId);

            // Record transaction
            await insforge.database
                .from('wallet_transactions')
                .insert([{
                    user_id: userId,
                    amount: refundAmount,
                    type: 'Credit',
                    description: `Refund for Order ${order.readable_id || order.id}`,
                    created_at: new Date().toISOString()
                }]);
        }

        return true;
    },

    async updateOrderStatus(orderId: string, newStatus: string) {
        // 1. Fetch current order to get timeline
        const { data: order, error: fetchError } = await insforge.database
            .from('orders')
            .select('timeline')
            .eq('id', orderId)
            .single();

        if (fetchError || !order) throw new Error('Order not found');

        const timeline = order.timeline || [];
        const updatedTimeline = [...timeline, { status: newStatus, date: new Date().toISOString() }];

        // 2. Update order status and timeline
        const { error: updateError } = await insforge.database
            .from('orders')
            .update({
                status: newStatus,
                timeline: updatedTimeline
            })
            .eq('id', orderId);

        if (updateError) throw updateError;
        return true;
    },

    async getOrders(userId: string) {
        const { data, error } = await insforge.database
            .from('orders')
            .select('*, items:order_items(*)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Map database fields to application fields
        return (data || []).map((ord: any) => ({
            ...ord,
            total: ord.total_amount,
            deliveryCharge: ord.delivery_charge || 0,
            discountAmount: ord.discount_amount || 0,
            couponCode: ord.coupon_code || null,
            paymentMethod: ord.payment_method,
            date: new Date(ord.created_at).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }),
            items: ord.items || []
        }));
    },

    async getAllOrders() {
        const { data, error } = await insforge.database
            .from('orders')
            .select('*, items:order_items(*)')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return (data || []).map((ord: any) => ({
            ...ord,
            total: ord.total_amount,
            deliveryCharge: ord.delivery_charge || 0,
            discountAmount: ord.discount_amount || 0,
            couponCode: ord.coupon_code || null,
            paymentMethod: ord.payment_method,
            date: new Date(ord.created_at).toLocaleDateString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            }),
            items: ord.items || []
        }));
    },

    // 4. REVIEWS
    async getReviews() {
        try {
            const { data, error } = await insforge.database
                .from('reviews')
                .select('*')
                .eq('is_public', true)
                .order('created_at', { ascending: false });
            if (error) {
                console.warn('Reviews table may not exist yet:', error.message);
                return [];
            }
            const reviews = (data || []).map((r: any) => ({
                ...r,
                userName: r.user_name || 'Guest',
                comment: r.message,
                message: r.message,
                date: new Date(r.created_at).toISOString().split('T')[0]
            }));
            return reviews;
        } catch (e) {
            console.warn('Could not fetch reviews:', e);
            return [];
        }
    },

    async saveReview(review: {
        order_id?: string | null;
        user_id?: string | null;
        user_name?: string | null;
        rating: number;
        message: string;
        is_public?: boolean;
    }) {
        const payload = {
            order_id: review.order_id && review.order_id !== 'GUEST-REVIEW' ? review.order_id : null,
            user_id: review.user_id || null,
            user_name: review.user_name || 'Guest',
            rating: review.rating,
            message: review.message,
            is_public: review.is_public !== undefined ? review.is_public : true,
            created_at: new Date().toISOString()
        };

        const { data, error } = await insforge.database
            .from('reviews')
            .insert([payload])
            .select()
            .single();

        if (error) {
            console.error('DB SAVE REVIEW ERROR:', error);
            throw error;
        }
        return data;
    },

    // 5. ADDRESSES
    async getAddresses(userId: string) {
        const { data, error } = await insforge.database
            .from('addresses')
            .select('*')
            .eq('user_id', userId);
        if (error) throw error;
        // Map database fields to application fields
        return data.map((addr: any) => ({
            id: addr.id,
            type: addr.type,
            house_no: addr.house_no,
            area: addr.area,
            city: addr.city,
            landmark: addr.landmark,
            lat: addr.lat,
            lng: addr.lng
        }));
    },

    async saveAddress(userId: string, address: any) {
        const payload = {
            user_id: userId,
            type: address.type,
            house_no: address.house_no,
            area: address.area,
            city: address.city || 'Rewa',
            landmark: address.landmark,
            lat: address.lat,
            lng: address.lng
        };

        const { data, error } = await insforge.database
            .from('addresses')
            .upsert(address.id ? { id: address.id, ...payload } : payload)
            .select();

        if (error) {
            console.error('DB SAVE ADDRESS ERROR:', error);
            throw error;
        }
        const saved = data?.[0];
        if (!saved) throw new Error('Failed to save address - no data returned');
        return {
            id: saved.id,
            type: saved.type,
            house_no: saved.house_no,
            area: saved.area,
            city: saved.city,
            landmark: saved.landmark,
            lat: saved.lat,
            lng: saved.lng
        };
    },

    async deleteAddress(addressId: string) {
        const { error } = await insforge.database
            .from('addresses')
            .delete()
            .eq('id', addressId);
        if (error) throw error;
        return true;
    },

    // 6. ISSUES
    async saveIssue(issueData: any) {
        const { error } = await insforge.database
            .from('issues')
            .insert([{
                user_id: issueData.userId,
                order_id: issueData.orderId,
                customer_name: issueData.customerName,
                customer_phone: issueData.customerPhone,
                type: issueData.type,
                description: issueData.description,
                status: 'Open',
                images: issueData.images || [],
                created_at: new Date().toISOString()
            }]);
        if (error) throw error;
        return true;
    },

    async getIssues(userId: string) {
        const { data, error } = await insforge.database
            .from('issues')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    },

    // 7. COUPONS
    async getCoupons() {
        const { data, error } = await insforge.database
            .from('coupons')
            .select('*')
            .eq('is_active', true)
            .order('min_order', { ascending: true });
        if (error) throw error;
        return data;
    }
};
