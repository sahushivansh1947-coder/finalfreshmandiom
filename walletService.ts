
import { insforge } from './insforge';

export interface WalletTransaction {
    id: string;
    amount: number;
    type: 'Credit' | 'Debit';
    description: string;
    created_at: string;
}

export const walletService = {
    getBalance: async (userId: string): Promise<number> => {
        try {
            const { data, error } = await insforge.database
                .from('users')
                .select('wallet_balance')
                .eq('id', userId)
                .single();
            if (error) throw error;
            return data?.wallet_balance || 0;
        } catch (e) {
            console.error('Error fetching balance:', e);
            return 0;
        }
    },

    getTransactions: async (userId: string): Promise<WalletTransaction[]> => {
        try {
            const { data, error } = await insforge.database
                .from('wallet_transactions')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        } catch (e) {
            console.error('Error fetching transactions:', e);
            return [];
        }
    },

    payWithWallet: async (userId: string, amount: number, description: string): Promise<boolean> => {
        try {
            // 1. Get current balance
            const balance = await walletService.getBalance(userId);
            if (balance < amount) {
                throw new Error('Insufficient wallet balance');
            }

            // 2. Deduct balance
            const { error: updateError } = await insforge.database
                .from('users')
                .update({ wallet_balance: balance - amount })
                .eq('id', userId);

            if (updateError) throw updateError;

            // 3. Add transaction record
            const { error: transError } = await insforge.database
                .from('wallet_transactions')
                .insert([{
                    user_id: userId,
                    amount: amount,
                    type: 'Debit',
                    description: description,
                    created_at: new Date().toISOString()
                }]);

            if (transError) throw transError;

            return true;
        } catch (e) {
            console.error('Wallet payment failed:', e);
            throw e;
        }
    },

    addMoney: async (userId: string, amount: number): Promise<boolean> => {
        try {
            const balance = await walletService.getBalance(userId);
            const { error: updateError } = await insforge.database
                .from('users')
                .update({ wallet_balance: balance + amount })
                .eq('id', userId);

            if (updateError) throw updateError;

            await insforge.database
                .from('wallet_transactions')
                .insert([{
                    user_id: userId,
                    amount: amount,
                    type: 'Credit',
                    description: 'Wallet Top-up',
                    created_at: new Date().toISOString()
                }]);

            return true;
        } catch (e) {
            console.error('Add money failed:', e);
            throw e;
        }
    }
};
