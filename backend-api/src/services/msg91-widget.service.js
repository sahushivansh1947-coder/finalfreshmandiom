const axios = require('axios');

/**
 * MSG91 Widget Service
 * Handles verification of JWT tokens from MSG91 OTP widget
 */

/**
 * Verify JWT access token from MSG91 widget
 * @param {string} accessToken - JWT token from MSG91 widget
 * @returns {Promise<Object>} - Verification response with token details
 */
async function verifyWidgetAccessToken(accessToken) {
    const authKey = process.env.MSG91_AUTH_KEY;

    if (!authKey) {
        throw new Error('MSG91_AUTH_KEY not configured in environment');
    }

    if (!accessToken) {
        throw new Error('Access token is required');
    }

    const url = 'https://control.msg91.com/api/v5/widget/verifyAccessToken';

    const payload = {
        authkey: authKey,
        'access-token': accessToken
    };

    const headers = {
        'Content-Type': 'application/json'
    };

    try {
        console.log('[MSG91] Verifying widget access token...');

        const response = await axios.post(url, payload, { headers });

        // Check for API errors
        if (!response.data || response.data.type === 'error') {
            console.error('[MSG91] Token verification failed:', response.data);
            throw new Error(response.data?.message || 'Token verification failed');
        }

        console.log('[MSG91] Token verified successfully');
        return {
            success: true,
            data: response.data,
            message: 'Access token verified successfully'
        };
    } catch (error) {
        console.error('[MSG91] Widget verification error:', error.message);

        // Return meaningful error messages
        if (error.response?.status === 401) {
            throw new Error('Invalid or expired access token');
        }
        if (error.response?.status === 400) {
            throw new Error('Bad request - invalid auth key or token format');
        }

        throw new Error(`Token verification failed: ${error.message}`);
    }
}

/**
 * Extract user data from verified token
 * @param {Object} tokenData - Verified token data from MSG91
 * @returns {Object} - Extracted user data
 */
function extractTokenData(tokenData) {
    return {
        identifier: tokenData.identifier || null,
        identifierType: tokenData.identifier_type || null, // 'mobile' or 'email'
        mobileNumber: tokenData.mobile || null,
        email: tokenData.email || null,
        verified: tokenData.verified || false,
        verifiedAt: tokenData.verified_at || null,
        returnUrl: tokenData.returnurl || null
    };
}

module.exports = {
    verifyWidgetAccessToken,
    extractTokenData
};
