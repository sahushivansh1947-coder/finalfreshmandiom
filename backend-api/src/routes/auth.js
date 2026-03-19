
const express = require('express');
const router = express.Router();
const db = require('../db/insforge');
const otpService = require('../services/otp.service');
const msg91WidgetService = require('../services/msg91-widget.service');

// Store OTPs in memory for testing (remove in production)
const testOTPs = {};

/**
 * @route   GET /auth/test-otp/:mobile
 * @desc    Get OTP for testing (development only)
 */
router.get('/test-otp/:mobile', (req, res) => {
    const mobile = req.params.mobile;
    const otp = testOTPs[mobile];

    if (!otp) {
        return res.status(404).json({
            success: false,
            error: 'No OTP found. Send OTP first.'
        });
    }

    res.status(200).json({
        success: true,
        message: 'OTP for testing',
        mobile,
        otp,
        timestamp: new Date().toISOString()
    });
});

/**
 * @route   POST /auth/send-otp
 * @desc    Generate and send OTP to user
 */
router.post('/send-otp', async (req, res) => {
    const { mobile } = req.body;

    // 1. Validate Input
    if (!mobile || !otpService.validateIndianMobile(mobile)) {
        return res.status(400).json({ success: false, error: 'Please enter a valid 10-digit Indian mobile number' });
    }

    try {
        // 3. Generate new 6-digit OTP
        const otp = otpService.generateOTP();

        // ❌ NO LONGER SAVING TO DATABASE as per request
        // We will rely on MSG91 for storage and verification

        // Store OTP in memory for testing (this stays for convenience)
        testOTPs[mobile] = otp;

        // 5. Send via MSG91 (will throw on failure in production)
        await otpService.sendViaMSG91(mobile, otp);

        // Log OTP for development (remove in production)
        console.log(`[DEV] OTP for ${mobile}: ${otp}`);
        console.log(`[TEST] Access it at: http://127.0.0.1:5000/auth/test-otp/${mobile}`);

        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
            testOtpEndpoint: `GET /auth/test-otp/${mobile}` // For testing only
        });
    } catch (error) {
        console.error('Send OTP Error:', error.message || error);
        res.status(500).json({
            success: false,
            error: 'Failed to send OTP. Please try again.',
            details: error.message
        });
    }
});

/**
 * @route   POST /auth/verify-otp
 * @desc    Verify the 6-digit OTP
 */
router.post('/verify-otp', async (req, res) => {
    const { mobile, otp } = req.body;

    if (!mobile || !otp) {
        return res.status(400).json({ success: false, error: 'Mobile number and OTP are required' });
    }

    try {
        // 1. Verify OTP with MSG91
        const isValid = await otpService.verifyViaMSG91(mobile, otp);

        if (!isValid) {
            // Fallback for development memory store
            if (process.env.NODE_ENV === 'development' && testOTPs[mobile] === otp) {
                console.log('[DEV] Verification successful using memory fallback');
            } else {
                return res.status(401).json({ success: false, error: 'Incorrect or expired OTP. Please try again.' });
            }
        }

        // ❌ NO LONGER UPDATING DATABASE as per request

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully'
        });

    } catch (error) {
        console.error('Verify OTP Error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
});

/**
 * @route   POST /auth/verify-widget-token
 * @desc    Verify JWT access token from MSG91 OTP widget
 * @body    { accessToken: "jwt_token_from_widget" }
 */
router.post('/verify-widget-token', async (req, res) => {
    const { accessToken } = req.body;

    if (!accessToken) {
        return res.status(400).json({
            success: false,
            error: 'Access token is required'
        });
    }

    try {
        // 1. Verify token with MSG91 API
        const verification = await msg91WidgetService.verifyWidgetAccessToken(accessToken);

        // 2. Extract user data from token
        const userData = msg91WidgetService.extractTokenData(verification.data);

        // 3. Get or update user in database
        const identifier = userData.mobileNumber || userData.email;
        const identifierType = userData.mobileNumber ? 'mobile' : 'email';

        if (!identifier) {
            return res.status(400).json({
                success: false,
                error: 'No mobile or email found in token'
            });
        }

        // 4. Check if user exists
        const userQuery = identifierType === 'mobile'
            ? 'SELECT * FROM users WHERE mobile = $1 LIMIT 1'
            : 'SELECT * FROM users WHERE email = $1 LIMIT 1';

        const userResult = await db.query(userQuery, [identifier]);
        const existingUser = userResult.rows[0];
        let user;

        if (existingUser) {
            // Update last login
            await db.query(
                'UPDATE users SET updated_at = NOW() WHERE id = $1',
                [existingUser.id]
            );
            user = existingUser;
        } else {
            // New user - mark for profile completion
            const insertQuery = identifierType === 'mobile'
                ? 'INSERT INTO users (mobile, verified, verified_at, created_at) VALUES ($1, true, NOW(), NOW()) RETURNING *'
                : 'INSERT INTO users (email, verified, verified_at, created_at) VALUES ($1, true, NOW(), NOW()) RETURNING *';

            const newUserResult = await db.query(insertQuery, [identifier]);
            user = newUserResult.rows[0];
        }

        // 5. Return success with user info
        res.status(200).json({
            success: true,
            message: 'Access token verified successfully',
            user: {
                id: user.id,
                mobile: user.mobile,
                email: user.email,
                isNewUser: !existingUser,
                verifiedAfter: userData.verifiedAt
            }
        });

    } catch (error) {
        console.error('Widget token verification error:', error.message);
        res.status(401).json({
            success: false,
            error: error.message || 'Token verification failed'
        });
    }
});

module.exports = router;
