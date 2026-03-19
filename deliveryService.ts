
export const STORE_LOCATION = {
    lat: 24.533252,
    lng: 81.293027
};

/**
 * Calculates the distance between two points on Earth using the Haversine formula.
 * @returns distance in kilometers
 */
export const calculateHaversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance); // Rounded to nearest KM as per requirement
};

/**
 * Calculates delivery charge based on order value and distance.
 * This logic should ideally run on the backend.
 */
export const calculateDeliveryCharge = (orderValue: number, distance: number, threshold: number = 399): number => {
    let charge = 0;
    const distRound = Math.ceil(distance) === 0 ? 1 : Math.ceil(distance);
    
    if (orderValue < threshold) {
        // Mandatory delivery charge of ₹10 + ₹6 per KM for orders below threshold
        charge = (distRound * 6) + 10;
    } else {
        if (distRound <= 8) {
            charge = 0; // Free inside 8km for order >= 399
        } else if (distRound <= 20) {
            // ₹10 mandatory base + ₹5 per KM total outside 8 km radius
            charge = (distRound * 5) + 10;
        } else {
            // Beyond 20km -> Normal calculation applies without 8km free exemption
            charge = (distRound * 6) + 10;
        }
    }

    // Apply minimum mandatory charge rules (only when delivery is not free)
    if (charge > 0 && charge < 20) {
        // Small delivery charge → minimum ₹10 mandatory
        charge = Math.max(charge, 10);
    } else if (charge >= 20) {
        // Larger delivery charge → minimum ₹5 mandatory (always satisfied, but explicit)
        charge = Math.max(charge, 5);
    }
    
    return charge;
};

import { insforge } from './insforge';

/**
 * Calls the backend edge function to calculate delivery details.
 */
export const fetchDeliveryDetails = async (userLat: number, userLng: number, orderValue: number) => {
    try {
        // Run logic entirely client-side to ensure immediate reflection of new rules
        // without waiting for Edge function deployment
        const distance = calculateHaversineDistance(STORE_LOCATION.lat, STORE_LOCATION.lng, userLat, userLng);
        const isDeliverable = distance <= 12;
        const charge = isDeliverable ? calculateDeliveryCharge(orderValue, distance) : 0;

        return { 
            distance, 
            charge, 
            isFree: charge === 0 && isDeliverable, 
            threshold: 399,
            isDeliverable 
        };
    } catch (e: any) {
        console.error('Error fetching delivery details:', e);
        return { distance: 0, charge: 0, isFree: true, isDeliverable: false, error: e.message };
    }
};
