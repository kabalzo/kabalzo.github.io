// Configuration - EDIT THESE VALUES
const DEFAULT_DB_PATH = 'movieboys.db';  // Path to your database file (adjusted for pages folder)
const DEFAULT_TABLE = 'nicmovies';          // Your table name

let db = null;
let sqlJs = null;
let currentData = null;
let currentSortMode = 'year'; // 'year' or 'watched'

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
        // Query the table with initial sort by year
        const orderBy = currentSortMode === 'year' ? 'ORDER BY year DESC' : 'ORDER BY watched DESC';
        const results = db.exec(`
            SELECT * FROM ${tableName} ${orderBy}
        `);
        
        if (results.length === 0) {
            document.getElementById('results').innerHTML = 
                `<div class="error">No data found in table: ${tableName}</div>`;
            return;
        }
        
        currentData = results[0];
        displayTable(results[0], tableName);
        
    } catch (error) {
        document.getElementById('results').innerHTML = 
            `<div class="error">Error querying table: ${error.message}</div>`;
    }
}

function toggleSort() {
    if (!currentData) return;
    
    // Switch sort mode
    currentSortMode = currentSortMode === 'year' ? 'watched' : 'year';
    
    // Re-query with new sort order
    const tableName = DEFAULT_TABLE;
    const orderBy = currentSortMode === 'year' ? 'ORDER BY year DESC' : 'ORDER BY watched DESC';
    
    try {
        const results = db.exec(`
            SELECT * FROM ${tableName} ${orderBy}
        `);
        
        if (results.length > 0) {
            currentData = results[0];
            displayTable(results[0], tableName);
        }
    } catch (error) {
        document.getElementById('results').innerHTML = 
            `<div class="error">Error sorting table: ${error.message}</div>`;
    }
}

function pickRandomMovie() {
    if (!db) {
        alert('Database not loaded yet. Please wait and try again.');
        return;
    }
    
    const tableName = DEFAULT_TABLE;
    
    try {
        // Query for movies where watched is 'N'
        const results = db.exec(`
            SELECT * FROM ${tableName} WHERE watched = 'N'
        `);
        
        if (results.length === 0 || results[0].values.length === 0) {
            showMoviePopup({
                title: 'No Unwatched Movies!',
                message: 'All Nicolas Cage movies have been watched! Time to rewatch some classics.',
                isError: true
            });
            return;
        }
        
        const { columns, values } = results[0];
        const randomIndex = Math.floor(Math.random() * values.length);
        const randomMovie = values[randomIndex];
        
        // Create movie object from columns and values
        const movieData = {};
        columns.forEach((col, index) => {
            movieData[col] = randomMovie[index];
        });
        
        showMoviePopup({
            title: 'Random Movie Pick!',
            movieData: movieData,
            columns: columns
        });
        
    } catch (error) {
        showMoviePopup({
            title: 'Error',
            message: `Error picking random movie: ${error.message}`,
            isError: true
        });
    }
}

function showMoviePopup(data) {
    // Remove existing popup if any
    const existingPopup = document.getElementById('movie-popup');
    if (existingPopup) {
        existingPopup.remove();
    }
    
    // Create popup HTML
    let popupContent = '';
    
    if (data.isError) {
        popupContent = `
            <div class="popup-header error">
                <h3><i class="fa fa-exclamation-triangle"></i> ${data.title}</h3>
            </div>
            <div class="popup-body">
                <p>${data.message}</p>
            </div>
        `;
    } else {
        popupContent = `
            <div class="popup-header">
                <h3><i class="fa fa-film"></i> ${data.title}</h3>
            </div>
            <div class="popup-body">
                <div class="movie-info">
        `;
        
        // Display movie data
        data.columns.forEach(col => {
            const value = data.movieData[col] !== null ? data.movieData[col] : 'N/A';
            const displayCol = col.charAt(0).toUpperCase() + col.slice(1);
            popupContent += `
                <div class="movie-field">
                    <strong>${displayCol}:</strong> <span>${value}</span>
                </div>
            `;
        });
        
        popupContent += `
                </div>
                <div class="popup-actions">
                    <button onclick="pickRandomMovie()" class="btn-secondary">
                        <i class="fa fa-refresh"></i> Pick Another
                    </button>
                </div>
            </div>
        `;
    }
    
    // Create popup element
    const popup = document.createElement('div');
    popup.id = 'movie-popup';
    popup.className = 'movie-popup-overlay';
    popup.innerHTML = `
        <div class="movie-popup">
            ${popupContent}
            <button class="popup-close" onclick="closeMoviePopup()">
                <i class="fa fa-times"></i>
            </button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(popup);
    
    // Add click outside to close
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            closeMoviePopup();
        }
    });
    
    // Add escape key to close
    document.addEventListener('keydown', handleEscapeKey);
}

function closeMoviePopup() {
    const popup = document.getElementById('movie-popup');
    if (popup) {
        popup.remove();
    }
    document.removeEventListener('keydown', handleEscapeKey);
}

function handleEscapeKey(e) {
    if (e.key === 'Escape') {
        closeMoviePopup();
    }
}

function displayTable(result, tableName) {
    const { columns, values } = result;

    // Calculate watched movies statistics
    const watchedIndex = columns.indexOf('watched');
    const totalMovies = values.length;
    // Count movies where watched is 'Y' (case-insensitive and trimmed)
    const watchedMovies = values.filter(row => {
        const watchedValue = row[watchedIndex];
        if (watchedValue === null || watchedValue === undefined) return false;
        return String(watchedValue).trim().toUpperCase() === 'Y';
    }).length;
    const percentage = totalMovies > 0 ? ((watchedMovies / totalMovies) * 100).toFixed(1) : 0;

    let html = `<h2>Table: ${tableName} (${values.length} rows)</h2>`;

    // Add progress meter
    html += '<div class="progress-meter">';
    html += `<div class="progress-header">
                <span class="progress-title"><i class="fa fa-film"></i> Nicolas Cage Movie Marathon Progress</span>
                <span class="progress-stats">${watchedMovies} / ${totalMovies} Movies Watched</span>
             </div>`;
    html += `<div class="progress-bar-container">
                <div class="progress-bar" style="width: ${percentage}%"></div>
                <span class="progress-percentage">${percentage}%</span>
             </div>`;
    html += '</div>';

    // Add control buttons
    html += '<div class="sort-controls">';
    html += `<button onclick="toggleSort()" class="sort-toggle-btn">
                Sort by ${currentSortMode === 'year' ? 'Watched Date' : 'Year'}
                <i class="fa fa-sort"></i>
             </button>`;
    html += `<button onclick="pickRandomMovie()" class="random-movie-btn">
                <i class="fa fa-random"></i> Pick Random Movie
             </button>`;
    //html += `<span class="sort-indicator">Currently sorted by: <strong>${currentSortMode === 'year' ? 'Release Year' : 'Watched Date'}</strong></span>`;
    html += '</div>';
    
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