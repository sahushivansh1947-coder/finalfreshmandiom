const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

const STORE_LAT = 24.533252;
const STORE_LNG = 81.293027;

function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// NOTE: Using window.insforge or a fetch to the DB would be the real way.
// For this environment, we simulate the DB fetch for settings.
module.exports = async function (req) {
    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
        const { lat, lng, subtotal } = await req.json();
        if (lat === undefined || lng === undefined || subtotal === undefined) {
            return new Response(JSON.stringify({ error: 'lat, lng, and subtotal are required' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Fallback to PRD defaults if DB fetch fails
        const minOrderValue = 80;
        const freeDeliveryThreshold = 399;

        const distance = haversine(STORE_LAT, STORE_LNG, lat, lng);
        let charge = 0;

        if (subtotal < minOrderValue) {
            return new Response(JSON.stringify({
                error: `Minimum order value is ₹${minOrderValue}`,
                minOrderRequired: minOrderValue
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Round distance up implicitly
        const distRound = Math.ceil(distance) === 0 ? 1 : Math.ceil(distance);

        if (subtotal < freeDeliveryThreshold) {
            // Standard small order: ₹10 base + ₹6 per KM total
            charge = (distRound * 6) + 10;
        } else {
            // Free threshold met
            if (distRound <= 8) {
                charge = 0;
            } else if (distRound <= 20) {
                // Beyond 8 KM => ₹10 mandatory + ₹5 per KM total
                charge = (distRound * 5) + 10;
            } else {
                // Beyond 20 KM => Normal logic applies
                charge = (distRound * 6) + 10;
            }
        }

        // Apply minimum mandatory charge rules (only when delivery is not free)
        if (charge > 0 && charge < 20) {
            charge = Math.max(charge, 10); // Minimum ₹10 for small charges
        } else if (charge >= 20) {
            charge = Math.max(charge, 5); // Minimum ₹5 for larger charges
        }

        const isDeliverable = distRound <= 12;

        return new Response(JSON.stringify({
            distance: parseFloat(distance.toFixed(2)),
            charge: isDeliverable ? parseFloat(charge.toFixed(2)) : 0,
            isFree: charge === 0 && isDeliverable,
            threshold: freeDeliveryThreshold,
            isDeliverable
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
