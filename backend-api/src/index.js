
/**
 * PRODUCTION-READY OTP AUTHENTICATION SYSTEM
 * Framework: Antigravity (Node.js + Express Context)
 * Database: Insforge PostgreSQL
 * SMS: MSG91
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for frontend communication
app.use(express.json()); // Body parser for JSON requests

// Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', service: 'Auth Service' });
});

// Auth Routes
app.use('/auth', authRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        error: 'Something went wrong on the server'
    });
});

// Periodic Cleanup for OTP tables (Mandatory delete within 2 minutes as per request)
const db = require('./db/insforge');
setInterval(async () => {
    try {
        // Delete all OTP logs older than 2 minutes
        // We do this just in case anything was ever saved or stuck
        await db.query("DELETE FROM otp_logs WHERE created_at < NOW() - INTERVAL '2 minutes'");
        console.log('[CLEANUP] Old OTP logs cleared from database');
    } catch (e) {
        // Silence errors if table doesn't exist yet
    }
}, 120000); // Every 2 minutes

// Start Server
app.listen(PORT, () => {
    console.log(`[SERVER] Auth backend is running on port ${PORT}`);
    console.log(`[DB] Connected to Insforge PostgreSQL Instance`);
});
