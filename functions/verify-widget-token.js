import { createClient } from 'npm:@insforge/sdk';

/**
 * MSG91 Widget Token Verification - InsForge Serverless Function
 * Endpoint: /verify-widget-token
 * 
 * Verifies JWT access token from MSG91 OTP widget and creates/updates user
 */

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// Fetch from MSG91 control API
async function verifyTokenWithMSG91(accessToken) {
    const authKey = Deno.env.get('MSG91_AUTH_KEY');

    if (!authKey) {
        throw new Error('MSG91_AUTH_KEY not configured');
    }

    const response = await fetch('https://control.msg91.com/api/v5/widget/verifyAccessToken', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            authkey: authKey,
            'access-token': accessToken
        })
    });

    const data = await response.json();

    if (!response.ok || data.type === 'error') {
        throw new Error(data.message || 'Token verification failed');
    }

    return data;
}

// Extract user data from verified token
function extractTokenData(tokenData) {
    return {
        identifier: tokenData.identifier || null,
        identifierType: tokenData.identifier_type || null, // 'mobile' or 'email'
        mobileNumber: tokenData.mobile || null,
        email: tokenData.email || null,
        verified: tokenData.verified || false,
        verifiedAt: tokenData.verified_at || null
    };
}

export default async function (req) {
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
        const { accessToken } = await req.json();

        // 1. Validate input
        if (!accessToken) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Access token is required'
                }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            );
        }

        // 2. Verify with MSG91 API
        console.log('[InsForge] Verifying widget access token with MSG91...');
        const tokenData = await verifyTokenWithMSG91(accessToken);

        // 3. Extract user data
        const userData = extractTokenData(tokenData);
        let identifier = userData.mobileNumber || userData.email;
        const identifierType = userData.mobileNumber ? 'mobile' : 'email';

        if (!identifier) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'No mobile or email found in verified token'
                }),
                {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                }
            );
        }

        // Clean identifier (strip 91 if it's mobile)
        if (identifierType === 'mobile') {
            identifier = identifier.replace(/^91/, '');
        }

        console.log(`[InsForge] Token verified for ${identifierType}: ${identifier}`);

        // 4. Initialize InsForge Client
        const client = createClient({
            baseUrl: Deno.env.get('INSFORGE_BASE_URL'),
            anonKey: Deno.env.get('ANON_KEY')
        });

        // 5. Check if user exists in DB
        let userProfile = null;
        const { data: existingUser, error: profileError } = await client.database
            .from('users')
            .select('*')
            .eq(identifierType === 'mobile' ? 'mobile' : 'email', identifier)
            .single();

        if (existingUser) {
            console.log(`[InsForge] Existing user found for ${identifier}`);
            userProfile = existingUser;

            // Update last login
            await client.database
                .from('users')
                .update({ last_login: new Date().toISOString() })
                .eq('id', userProfile.id);
        } else {
            console.log(`[InsForge] User NOT found for ${identifier}, creating new profile...`);

            // Create a custom UUID if not using auth.users yet, or let it fail if strict
            // Following the App.tsx pattern for custom UUIDs
            const customId = '00000000-0000-4000-8000-' + String(identifier).replace(/\D/g, '').padStart(12, '0');

            const { data: newUser, error: insertError } = await client.database
                .from('users')
                .insert([{
                    id: customId,
                    mobile: identifierType === 'mobile' ? identifier : null,
                    name: `User ${identifier.slice(-4)}`,
                    role: 'customer',
                    last_login: new Date().toISOString()
                }])
                .select()
                .single();

            if (insertError) {
                console.error('[InsForge] User creation failed:', insertError);
                // If it fails (likely due to FK constraint on auth.users), return minimal info
                // so frontend can decide how to handle (e.g., set local user)
                userProfile = {
                    id: customId,
                    mobile: identifierType === 'mobile' ? identifier : null,
                    name: `User ${identifier.slice(-4)}`
                };
            } else {
                userProfile = newUser;
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                message: 'Access token verified successfully',
                data: {
                    ...userProfile,
                    verified: userData.verified,
                    verifiedAt: userData.verifiedAt,
                    timestamp: new Date().toISOString()
                }
            }),
            {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );

    } catch (error) {
        console.error('[InsForge] Token verification error:', error.message);

        let statusCode = 401;
        let errorMessage = error.message || 'Token verification failed';

        if (error.message.includes('not configured')) {
            statusCode = 500;
        }

        return new Response(
            JSON.stringify({
                success: false,
                error: errorMessage,
                timestamp: new Date().toISOString()
            }),
            {
                status: statusCode,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            }
        );
    }
};

