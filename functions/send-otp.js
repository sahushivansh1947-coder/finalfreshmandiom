import { createClient } from 'npm:@insforge/sdk';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

export default async function (req) {
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
        const { mobile } = await req.json();

        if (!mobile || !/^[6-9]\d{9}$/.test(mobile)) {
            return new Response(JSON.stringify({ error: 'Valid 10-digit Indian mobile number is required' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 1. Initialize InsForge Client
        const client = createClient({
            baseUrl: Deno.env.get('INSFORGE_BASE_URL'),
            anonKey: Deno.env.get('ANON_KEY')
        });

        // 2. Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + 2); // 2 minutes expiry

        // 3. Send via SMS (No longer saving to DB as per request)
        const authKey = '497026A7mSNanglna69a22832P1';
        const templateId = '69a1f9c569be8f8f840dfc32';
        const fullMobile = `91${mobile}`;
        const url = `https://control.msg91.com/api/v5/otp?template_id=${templateId}&mobile=${fullMobile}&authkey=${authKey}&otp=${otp}&otp_expiry=2&realTimeResponse=0`;

        console.log(`[MSG91] Sending OTP ${otp} to ${fullMobile}...`);

        const smsRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        // dbResult not needed separately since upsert won't fail on duplicate

        const smsResult = await smsRes.json();
        console.log('[MSG91] Response:', JSON.stringify(smsResult));

        if (smsResult.type === 'success') {
            console.log(`[MSG91] OTP sent successfully to ${fullMobile}`);
            return new Response(JSON.stringify({
                success: true,
                message: 'OTP aapke phone par bhej diya gaya hai!'
            }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // If MSG91 fails, show screen OTP as fallback
        console.warn('[MSG91] SMS delivery issue:', smsResult.message || JSON.stringify(smsResult));
        return new Response(JSON.stringify({
            success: true,
            message: smsResult.message || 'OTP generated',
            otp: otp, // Show on screen as fallback
            msg91_error: smsResult.message
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('[Function Error]', error.message);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}
