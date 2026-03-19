import { createClient } from '@insforge/sdk';

const API_BASE_URL = 'https://46d5hap4.us-east.insforge.app';
const API_KEY = 'ik_56c8374bbcda6df9fcfe54f0d777ee15'; // In production, this should be in .env

export const insforge = createClient({
    baseUrl: API_BASE_URL,
    anonKey: API_KEY
});
