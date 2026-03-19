
const { Pool } = require('pg');

// Create a connection pool using the Insforge DB URL
// This automatically handles connection pooling for better performance
const pool = new Pool({
    connectionString: process.env.INSFORGE_DB_URL,
    ssl: {
        rejectUnauthorized: false // Required for most cloud databases like Insforge
    }
});

// Helper for executing queries
const query = (text, params) => pool.query(text, params);

module.exports = {
    query,
    pool
};
