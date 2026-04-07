/**
 * Galimandi - Send Push Notification Serverless Function
 *
 * POST body: { title, body, url, icon }
 *
 * This function reads all active push subscriptions from the DB and
 * sends a push notification to each subscriber using the web-push protocol.
 *
 * VAPID keys (generate once via: npx web-push generate-vapid-keys)
 * These keys are embedded here for simplicity. In production, store in env vars.
 */

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

// ─── VAPID Configuration ───────────────────────────────────────────────────
// Generated VAPID key pair - keep PRIVATE key secret!
const VAPID_PUBLIC_KEY  = 'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U';
const VAPID_PRIVATE_KEY = 'UUxI4O8-FbRouAevSmBQ6o_QjJ2FcWkHk3UdJeJwHXs';
const VAPID_SUBJECT     = 'mailto:admin@galimandi.store';

// ─── InsForge DB Config ────────────────────────────────────────────────────
const API_BASE_URL = 'https://46d5hap4.us-east.insforge.app';
const API_KEY = 'ik_56c8374bbcda6df9fcfe54f0d777ee15';

// ─── Minimal web-push implementation using Web Crypto API ─────────────────
// (No npm dependencies needed in the serverless runtime)

async function base64ToBuffer(base64) {
    const base64Url = base64.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64Url);
    const buf = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) buf[i] = binary.charCodeAt(i);
    return buf.buffer;
}

async function bufferToBase64Url(buffer) {
    const bytes = new Uint8Array(buffer);
    let str = '';
    for (const byte of bytes) str += String.fromCharCode(byte);
    return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

async function sign(data, privateKeyBuffer) {
    const key = await crypto.subtle.importKey(
        'pkcs8', privateKeyBuffer,
        { name: 'ECDSA', namedCurve: 'P-256' },
        false, ['sign']
    );
    const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, data);
    return bufferToBase64Url(sig);
}

async function makeVapidJWT(audience) {
    const header = { typ: 'JWT', alg: 'ES256' };
    const payload = {
        aud: audience,
        exp: Math.floor(Date.now() / 1000) + 12 * 3600,
        sub: VAPID_SUBJECT
    };
    const enc = (obj) => btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    const unsigned = `${enc(header)}.${enc(payload)}`;
    const data = new TextEncoder().encode(unsigned);
    
    // Import private key
    const pkBuf = await base64ToBuffer(VAPID_PRIVATE_KEY);
    const privateKey = await crypto.subtle.importKey(
        'raw', pkBuf, // Try raw first
        { name: 'ECDH', namedCurve: 'P-256' },
        true, []
    ).catch(() => null);

    // Fallback: use PKCS8 format assumed
    const sigBase64 = await sign(data, pkBuf).catch(() => null);
    if (!sigBase64) return null;
    return `${unsigned}.${sigBase64}`;
}

async function sendWebPush(subscription, payload) {
    try {
        const endpoint = subscription.endpoint;
        const audience = new URL(endpoint).origin;
        const jwt = await makeVapidJWT(audience);
        if (!jwt) throw new Error('JWT generation failed');

        const vapidAuth = `vapid t=${jwt},k=${VAPID_PUBLIC_KEY}`;
        const body = JSON.stringify(payload);

        const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': vapidAuth,
                'Content-Type': 'application/json',
                'TTL': '86400',
            },
            body
        });

        return { ok: res.ok, status: res.status };
    } catch (e) {
        return { ok: false, error: e.message };
    }
}

module.exports = async function (req) {
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (req.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    try {
        const { title, body, url = '/', icon = '/logo.png' } = await req.json();
        if (!title || !body) {
            return new Response(JSON.stringify({ error: 'title and body are required' }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Fetch all subscriptions from DB
        const dbRes = await fetch(`${API_BASE_URL}/rest/v1/push_subscriptions?is_active=eq.true&select=*`, {
            headers: {
                'apikey': API_KEY,
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const subscriptions = await dbRes.json();
        if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
            return new Response(JSON.stringify({ sent: 0, message: 'No subscribers found' }), {
                status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const payload = { title, body, icon, data: { url } };
        const results = await Promise.allSettled(
            subscriptions.map(sub => sendWebPush(sub.subscription_object, payload))
        );

        const sent = results.filter(r => r.status === 'fulfilled' && r.value?.ok).length;
        const failed = results.length - sent;

        return new Response(JSON.stringify({ sent, failed, total: results.length }), {
            status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
};
