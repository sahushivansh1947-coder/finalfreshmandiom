
import { insforge } from './insforge';
import msg91Service, { MSG91_CHANNELS } from './msg91Service';

export const auth = {
    /**
     * Send OTP using MSG91 service if available, otherwise fallback to backend
     */
    async sendOTP(mobile: string, useMsg91: boolean = true) {
        // Try MSG91 Widget first (DLT-free, real SMS via Widget flow)
        if (useMsg91 && msg91Service.isAvailable()) {
            try {
                console.log('[MSG91] Sending OTP via Widget client-side...');
                const data = await msg91Service.sendOtp(`91${mobile}`);
                console.log('[MSG91] OTP sent successfully:', data);
                return { success: true, data, source: 'msg91-widget' };
            } catch (error) {
                console.warn('[MSG91] Widget sendOtp failed, trying backend fallback:', error);
            }
        } else {
            console.warn('[MSG91] Widget not available yet, using backend fallback...');
        }

        // Backend fallback (generates OTP and shows it on screen)
        const { data, error } = await insforge.functions.invoke('send-otp', {
            body: { mobile }
        });
        if (error) {
            console.error('[Backend] OTP send error:', error);
            throw error;
        }
        return data;
    },

    /**
     * Verify OTP using MSG91 service if available, otherwise fallback to backend
     */
    async verifyOTP(mobile: string, otp: string, useMsg91: boolean = true) {
        // Try MSG91 first if enabled
        if (useMsg91 && msg91Service.isAvailable()) {
            try {
                console.log('Verifying OTP via MSG91...');
                const data = await msg91Service.verifyOtp(otp);
                console.log('MSG91 OTP verified successfully:', data);
                return { success: true, data };
            } catch (error) {
                console.warn('MSG91 OTP verification failed, falling back to backend:', error);
            }
        }

        // Fallback to backend function
        console.log('Verifying OTP via backend...');
        const { data, error } = await insforge.functions.invoke('verify-otp', {
            body: { mobile, otp }
        });
        if (error) throw error;
        return data; // Returns { success, user: { mobile, id } }
    },

    /**
     * Retry OTP delivery via specified channel (MSG91 only)
     */
    async retryOTP(channel: typeof MSG91_CHANNELS[keyof typeof MSG91_CHANNELS] | null = null) {
        if (!msg91Service.isAvailable()) {
            throw new Error('MSG91 OTP service is not available for retry');
        }
        return await msg91Service.retryOtp(channel);
    },

    /**
     * Verify widget JWT access token with server
     * Call this after MSG91 widget returns an access token (on success)
     */
    async verifyWidgetAccessToken(accessToken: string) {
        if (!accessToken) {
            throw new Error('Access token is required');
        }

        try {
            console.log('Verifying widget access token with server...');
            const { data, error } = await insforge.functions.invoke('verify-widget-token', {
                body: { accessToken }
            });

            if (error) {
                console.error('Server widget token verification failed:', error);
                throw error;
            }

            console.log('Widget token verified by server:', data);
            return {
                success: true,
                user: data.data,
                message: data.message
            };
        } catch (error) {
            console.error('Widget token verification error:', error);
            throw new Error(error instanceof Error ? error.message : 'Token verification failed');
        }
    },

    /**
     * Get MSG91 widget data
     */
    getOTPWidgetData() {
        return msg91Service.getWidgetData();
    },

    async signUp(email: string, phone: string, name: string) {
        // Fallback for direct signups if needed
        const { data, error } = await insforge.auth.signUp({
            email,
            password: 'password123',
            name: name
        });
        if (error) throw error;
        return data;
    },

    async signIn(email: string) {
        const { data, error } = await insforge.auth.signInWithPassword({
            email,
            password: 'password123'
        });
        if (error) throw error;
        return data;
    },

    async signOut() {
        const { error } = await insforge.auth.signOut();
        // Since we also use localStorage for mobile session
        localStorage.removeItem('galimandi_user');
        if (error) throw error;
    },

    async getCurrentUser() {
        try {
            const { data, error } = await insforge.auth.getCurrentUser();
            if (error) {
                console.warn('Session check failed or expired:', error);
                return null;
            }
            return data?.user || null;
        } catch (e) {
            console.warn('Session check exception:', e);
            return null;
        }
    }
};
