const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database connection with reconnection handling
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'PASSWORD',
    database: 'pokemon',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test database connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        console.error('Error code:', err.code);
        console.error('Error stack:', err.stack);
        return;
    }
    console.log('Successfully connected to MySQL database');
    connection.release();
});

// Routes
app.get('/api/pokemon', (req, res) => {
    console.log('Fetching all pokemon...');
    db.query('SELECT * FROM pokemons_dataset', (err, results) => {
        if (err) {
            console.error('Error in /api/pokemon:', err.message);
            res.status(500).json({ error: 'Database error', details: err.message });
            return;
        }
        console.log(`Found ${results?.length || 0} pokemon`);
        res.json(results || []);
    });
});

// Search Pokemon by name
app.get('/api/pokemon/search', (req, res) => {
    const { name } = req.query;
    db.query('SELECT * FROM pokemons_dataset WHERE Name LIKE ?', [`%${name}%`], (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).json({ error: 'Internal server error' });
            return;
        }
        res.json(results || []);
    });
});

// Get Pokemon by type
app.get('/api/pokemon/type/:type', (req, res) => {
    const { type } = req.params;
    db.query(
        'SELECT * FROM pokemons_dataset WHERE `Primary Type` = ? OR `Secondary type` = ?',
        [type, type],
        (err, results) => {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).json({ error: 'Internal server error' });
                return;
            }
            res.json(results || []);
        }
    );
});

// Get suggested Pokemon based on type
app.get('/api/pokemon/suggested/:type', (req, res) => {
    console.log('Fetching suggested pokemon...');
    console.log('Type:', req.params.type);
    console.log('Current Pokemon:', req.query.currentPokemon);

    const { type } = req.params;
    const limit = req.query.limit || 15;
    const currentPokemon = req.query.currentPokemon || '';

    // Modified query to avoid subquery with LIMIT
    const query = `
        SELECT * FROM pokemons_dataset 
        WHERE (\`Primary Type\` = ? OR \`Secondary type\` = ?) 
        AND Name != ?
        ORDER BY RAND() 
        LIMIT ?
    `;

    db.query(query, [type, type, currentPokemon, parseInt(limit)], (err, results) => {
        if (err) {
            console.error('Error in /api/pokemon/suggested:', err.message);
            res.status(500).json({ error: 'Database error', details: err.message });
            return;
        }
        console.log(`Found ${results?.length || 0} suggested pokemon`);
        res.json(results || []);
    });
});

// Get random Pokemon
app.get('/api/pokemon/random', (req, res) => {
    console.log('Fetching random pokemon...');
    const limit = req.query.limit || 15;
    const query = `
        SELECT * FROM pokemons_dataset 
        ORDER BY RAND() 
        LIMIT ?
    `;

    db.query(query, [parseInt(limit)], (err, results) => {
        if (err) {
            console.error('Error in /api/pokemon/random:', err.message);
            res.status(500).json({ error: 'Database error', details: err.message });
            return;
        }
        console.log(`Found ${results?.length || 0} random pokemon`);
        res.json(results || []);
    });
});

// Get suggested Pokemon based on search history
app.get('/api/pokemon/smart-suggestions', (req, res) => {
    console.log('Fetching smart suggestions based on history...');
    const searchHistory = req.query.searchHistory ? JSON.parse(req.query.searchHistory) : [];
    const limit = req.query.limit || 15;

    if (!searchHistory.length) {
        // If no history, return random pokemon
        const randomQuery = `
            SELECT * FROM pokemons_dataset 
            ORDER BY RAND() 
            LIMIT ?
        `;
        db.query(randomQuery, [parseInt(limit)], (err, results) => {
            if (err) {
                console.error('Error in random suggestions:', err.message);
                res.status(500).json({ error: 'Database error', details: err.message });
                return;
            }
            res.json(results || []);
        });
        return;
    }

    // Extract all types (both primary and secondary) from history
    const typeFrequency = {};
    const excludeNames = new Set(searchHistory.map(p => p.Name));

    // Count type frequencies from both primary and secondary types
    searchHistory.forEach(pokemon => {
        if (pokemon['Primary Type']) {
            typeFrequency[pokemon['Primary Type']] = (typeFrequency[pokemon['Primary Type']] || 0) + 1;
        }
        if (pokemon['Secondary type']) {
            typeFrequency[pokemon['Secondary type']] = (typeFrequency[pokemon['Secondary type']] || 0) + 1;
        }
    });

    // Get all unique types from history
    const types = Object.keys(typeFrequency);
    if (!types.length) {
        res.json([]);
        return;
    }

    // Create a weighted query that:
    // 1. Considers both primary and secondary types equally
    // 2. Adds more randomization to the results
    // 3. Ensures variety in suggestions
    const query = `
        WITH TypeWeights AS (
            SELECT 
                *,
                (
                    CASE 
                        ${types.map(type => `
                            WHEN \`Primary Type\` = '${type}' THEN ${typeFrequency[type]}
                            WHEN \`Secondary type\` = '${type}' THEN ${typeFrequency[type]}`).join('\n')}
                        ELSE 0 
                    END
                ) as type_match_score,
                RAND() * 3 as random_factor
            FROM pokemons_dataset 
            WHERE Name NOT IN (?)
        )
        SELECT 
            *,
            (type_match_score + random_factor) as relevance_score
        FROM TypeWeights
        WHERE type_match_score > 0
        ORDER BY (
            CASE 
                WHEN RAND() < 0.3 THEN random_factor -- 30% chance of pure randomization
                ELSE relevance_score -- 70% chance of type-based suggestion
            END
        ) DESC
        LIMIT ?
    `;

    db.query(query, [Array.from(excludeNames), parseInt(limit)], (err, results) => {
        if (err) {
            console.error('Error in smart suggestions:', err.message);
            res.status(500).json({ error: 'Database error', details: err.message });
            return;
        }

        // Add an additional randomization step
        const shuffledResults = results.sort(() => Math.random() - 0.5);

        console.log(`Found ${shuffledResults?.length || 0} smart suggestions`);
        res.json(shuffledResults || []);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message,
        path: req.path
    });
});

// Handle process errors
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
}); 
