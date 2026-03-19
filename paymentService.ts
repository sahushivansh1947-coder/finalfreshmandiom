
import { insforge } from './insforge';

export interface SavedPaymentMethod {
    id: string;
    type: 'UPI' | 'Card';
    details: any;
    is_default: boolean;
}

export const paymentService = {
    getPaymentMethods: async (userId: string): Promise<SavedPaymentMethod[]> => {
        try {
            const { data, error } = await insforge.database
                .from('saved_payment_methods')
                .select('*')
                .eq('user_id', userId);
            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error('Error fetching payment methods:', e);
            return [];
        }
    },

    addPaymentMethod: async (userId: string, type: 'UPI' | 'Card', details: any) => {
        try {
            const { data, error } = await insforge.database
                .from('saved_payment_methods')
                .insert([{ user_id: userId, type, details }])
                .select();
            if (error) throw error;
            return data?.[0];
        } catch (e) {
            console.error('Error adding payment method:', e);
            throw e;
        }
    },

    deletePaymentMethod: async (id: string) => {
        try {
            const { error } = await insforge.database
                .from('saved_payment_methods')
                .delete()
                .eq('id', id);
            if (error) throw error;
            return true;
        } catch (e) {
            console.error('Error deleting payment method:', e);
            return false;
        }
    }
};
