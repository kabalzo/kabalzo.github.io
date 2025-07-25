// Configuration - EDIT THESE VALUES
const DEFAULT_DB_PATH = 'movieboys.db';  // Path to your database file (adjusted for pages folder)
const DEFAULT_TABLE = 'movies';          // Your table name

let db = null;
let sqlJs = null;

async function loadSqlJs() {
    return new Promise((resolve, reject) => {
        if (window.initSqlJs) {
            resolve();
            return;
        }
        
        // Try multiple CDNs in order
        const cdnUrls = [
            'https://unpkg.com/sql.js@1.8.0/dist/sql.js',
            'https://cdn.jsdelivr.net/npm/sql.js@1.8.0/dist/sql.js',
            'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql.js'
        ];
        
        let currentCdnIndex = 0;
        
        function tryNextCdn() {
            if (currentCdnIndex >= cdnUrls.length) {
                reject(new Error('All CDNs failed to load SQL.js'));
                return;
            }
            
            const script = document.createElement('script');
            script.src = cdnUrls[currentCdnIndex];
            script.onload = () => resolve();
            script.onerror = () => {
                currentCdnIndex++;
                tryNextCdn();
            };
            document.head.appendChild(script);
        }
        
        tryNextCdn();
    });
}

async function initializeSqlJs() {
    if (!sqlJs) {
        try {
            // Load the SQL.js script first
            await loadSqlJs();
            
            // Now initialize it with corresponding CDN
            const cdnBases = [
                'https://unpkg.com/sql.js@1.8.0/dist/',
                'https://cdn.jsdelivr.net/npm/sql.js@1.8.0/dist/',
                'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/'
            ];
            
            // Try each CDN base for the wasm file
            for (const base of cdnBases) {
                try {
                    sqlJs = await initSqlJs({
                        locateFile: file => base + file
                    });
                    break; // Success, exit loop
                } catch (err) {
                    console.log(`Failed with ${base}, trying next...`);
                    continue;
                }
            }
            
            if (!sqlJs) {
                throw new Error('All CDN bases failed for WASM file');
            }
            
        } catch (error) {
            throw new Error(`Failed to initialize SQL.js: ${error.message}`);
        }
    }
    return sqlJs;
}

async function loadDatabase(dbPath) {
    try {
        // Initialize SQL.js first
        const SQL = await initializeSqlJs();
        
        // Fetch the database file
        const response = await fetch(dbPath);
        if (!response.ok) {
            throw new Error(`Database file not found: ${dbPath}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        
        db = new SQL.Database(uint8Array);
        return true;
        
    } catch (error) {
        document.getElementById('results').innerHTML = 
            `<div class="error">Error loading database: ${error.message}</div>`;
        return false;
    }
}

// Helper function to calculate median
function calculateMedian(numbers) {
    const sorted = numbers.slice().sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
        return ((sorted[middle - 1] + sorted[middle]) / 2).toFixed(2);
    } else {
        return sorted[middle].toFixed(2);
    }
}

async function loadTable() {
    const dbPath = DEFAULT_DB_PATH;
    const tableName = DEFAULT_TABLE;
    
    document.getElementById('results').innerHTML = '<p>Loading...</p>';
    
    // Load database if not already loaded
    if (!db) {
        const loaded = await loadDatabase(dbPath);
        if (!loaded) return;
    }
    
    try {
        // Query the table with calculated average - reordered columns and improved NULL handling
        // Replace this entire db.exec() call:
        const results = db.exec(`
            SELECT 
                id,
                title,
                year,
                rated,
                pick,
                date,
                tyler,
                alexb,
                trevor,
                jordan,
                drew,
                alexd,
                colin,
                other,
                CASE 
                    WHEN (
                        (CASE WHEN tyler IS NOT NULL AND TRIM(tyler) != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN alexb IS NOT NULL AND TRIM(alexb) != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN trevor IS NOT NULL AND TRIM(trevor) != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN jordan IS NOT NULL AND TRIM(jordan) != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN drew IS NOT NULL AND TRIM(drew) != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN alexd IS NOT NULL AND TRIM(alexd) != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN colin IS NOT NULL AND TRIM(colin) != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN other IS NOT NULL AND TRIM(other) != '' THEN 1 ELSE 0 END)
                    ) > 0 
                    THEN ROUND(
                        (
                            (CASE WHEN tyler IS NOT NULL AND TRIM(tyler) != '' THEN CAST(tyler AS REAL) ELSE 0 END) +
                            (CASE WHEN alexb IS NOT NULL AND TRIM(alexb) != '' THEN CAST(alexb AS REAL) ELSE 0 END) +
                            (CASE WHEN trevor IS NOT NULL AND TRIM(trevor) != '' THEN CAST(trevor AS REAL) ELSE 0 END) +
                            (CASE WHEN jordan IS NOT NULL AND TRIM(jordan) != '' THEN CAST(jordan AS REAL) ELSE 0 END) +
                            (CASE WHEN drew IS NOT NULL AND TRIM(drew) != '' THEN CAST(drew AS REAL) ELSE 0 END) +
                            (CASE WHEN alexd IS NOT NULL AND TRIM(alexd) != '' THEN CAST(alexd AS REAL) ELSE 0 END) +
                            (CASE WHEN colin IS NOT NULL AND TRIM(colin) != '' THEN CAST(colin AS REAL) ELSE 0 END) +
                            (CASE WHEN other IS NOT NULL AND TRIM(other) != '' THEN CAST(other AS REAL) ELSE 0 END)
                        ) / (
                            (CASE WHEN tyler IS NOT NULL AND TRIM(tyler) != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN alexb IS NOT NULL AND TRIM(alexb) != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN trevor IS NOT NULL AND TRIM(trevor) != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN jordan IS NOT NULL AND TRIM(jordan) != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN drew IS NOT NULL AND TRIM(drew) != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN alexd IS NOT NULL AND TRIM(alexd) != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN colin IS NOT NULL AND TRIM(colin) != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN other IS NOT NULL AND TRIM(other) != '' THEN 1 ELSE 0 END)
                        ), 2
                    )
                    ELSE NULL
                END as average
            FROM ${tableName}
        `);
        
        if (results.length === 0) {
            document.getElementById('results').innerHTML = 
                `<div class="error">No data found in table: ${tableName}</div>`;
            return;
        }
        
        displayTable(results[0], tableName);
        
    } catch (error) {
        document.getElementById('results').innerHTML = 
            `<div class="error">Error querying table: ${error.message}</div>`;
    }
}

function displayTable(result, tableName) {
    const { columns, values } = result;
    
    let html = `<h2>Table: ${tableName} (${values.length} rows)</h2>`;

    // Add summary statistics
    if (values.length > 0) {
        const averages = values.map(row => row[row.length - 1]).filter(avg => avg !== null);
        if (averages.length > 0) {
            const highestRating = Math.max(...averages);
            const lowestRating = Math.min(...averages);
            const overallAverage = (averages.reduce((sum, avg) => sum + avg, 0) / averages.length).toFixed(2);
            const medianRating = calculateMedian(averages);
            
            html += '<div style="text-align: center; margin: 20px; color: #ccc; background-color: #333; padding: 15px; border-radius: 5px;">';
            html += '<h3 style="margin-top: 0; color: white;">📊 All Movie Statistics</h3>';
            html += `<p><strong>Total Movies:</strong> ${values.length}</p>`;
            html += `<p><strong>Highest Rating:</strong> ${highestRating}</p>`;
            html += `<p><strong>Lowest Rating:</strong> ${lowestRating}</p>`;
            html += `<p><strong>Average Rating:</strong> ${overallAverage}</p>`;
            html += `<p><strong>Median Rating:</strong> ${medianRating}</p>`;
            html += '</div>';
        }
    }

    html += '<div class="table-container">';
    html += '<table>';
    
    // Headers
    html += '<thead><tr>';
    columns.forEach(col => {
        html += `<th>${col}</th>`;
    });
    html += '</tr></thead>';
    
    // Data rows
    html += '<tbody>';
    values.forEach(row => {
        html += '<tr>';
        row.forEach(cell => {
            const displayValue = cell !== null ? cell : '<em>NULL</em>';
            html += `<td>${displayValue}</td>`;
        });
        html += '</tr>';
    });
    html += '</tbody>';
    
    html += '</table>';
    html += '</div>';
    
    document.getElementById('results').innerHTML = html;
}

// Wait for both the page and SQL.js to be ready
window.onload = function() {
    // Add a small delay to ensure SQL.js script is fully loaded
    setTimeout(() => {
        loadTable();
    }, 100);
};