const axios = require('axios');

// ✅ Generate 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// ✅ Validate Indian Mobile Number (starts with 6-9, total 10 digits)
function validateIndianMobile(mobile) {
    return /^[6-9]\d{9}$/.test(mobile);
}

// ✅ Send OTP via MSG91
async function sendViaMSG91(mobile, otp) {
    const authKey = process.env.MSG91_AUTH_KEY;
    const templateId = process.env.MSG91_TEMPLATE_ID;

    if (!authKey || !templateId) {
        throw new Error('MSG91 credentials missing in env file');
    }

    const url = 'https://api.msg91.com/api/v5/otp';

    const payload = {
        template_id: templateId,
        mobile: `91${mobile}`,
        otp: otp
    };

    const headers = {
        'Content-Type': 'application/json',
        'authkey': authKey
    };

    try {
        const response = await axios.post(url, payload, { headers });

        // MSG91 error handling
        if (!response.data || response.data.type === 'error') {
            console.error('MSG91 Error Response:', response.data);
            throw new Error('Failed to send OTP via MSG91');
        }

        console.log('MSG91 Success:', response.data);
        return response.data;
    } catch (error) {
        console.error('MSG91 API Error:', error);
        // Only swallow the error in development so the frontend still works
        if (process.env.NODE_ENV === 'development') {
            console.log(`[DEV MODE] OTP not sent via MSG91. OTP for testing: ${otp}`);
            return { success: true, message: 'OTP generated (dev fallback)' };
        }
        // propagate error in production so caller can respond accordingly
        throw error;
    }
}

// ✅ EXPORT EVERYTHING (VERY IMPORTANT)
module.exports = {
    generateOTP,
    validateIndianMobile,
    sendViaMSG91
};  