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
        const { mobile, otp } = await req.json();

        if (!mobile || !otp) {
            return new Response(JSON.stringify({ error: 'Mobile and OTP are required' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 1. Initialize InsForge Client
        const client = createClient({
            baseUrl: Deno.env.get('INSFORGE_BASE_URL'),
            anonKey: Deno.env.get('ANON_KEY')
        });

        // 2. Verify OTP via MSG91
        const authKey = '497026A7mSNanglna69a22832P1';
        const fullMobile = `91${mobile}`;
        const verifyUrl = `https://api.msg91.com/api/v5/otp/verify?otp=${otp}&authkey=${authKey}&mobile=${fullMobile}`;

        console.log(`[MSG91] Verifying OTP for ${fullMobile}...`);
        const verifyRes = await fetch(verifyUrl);
        const verifyResult = await verifyRes.json();

        // 3. Check if verification was successful
        if (verifyResult.type !== 'success') {
            return new Response(JSON.stringify({
                success: false,
                error: verifyResult.message || 'Invalid or expired OTP'
            }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 4. Check if user exists in DB
        const { data: userProfile, error: profileError } = await client.database
            .from('users')
            .select('*')
            .eq('mobile', mobile)
            .single();

        if (profileError && profileError.code !== 'PGRST116') {
            console.error('[Profile Fetch Error]', profileError);
        }

        // 5. Cleanup - No longer needed as OTP is not saved in DB

        return new Response(JSON.stringify({
            success: true,
            user: userProfile || { mobile: mobile, id: null }
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
};
