// Movie Buttons Manager - Handles all movie filter buttons
// This replaces the individual button files (drew_picks.js, tyler_picks.js, top_movies.js, worst_movies.js, nic_picks.js)

// Button configuration
const BUTTON_CONFIG = [
    // Row 1: Main buttons
    {
        row: 1,
        id: 'topMoviesBtn',
        text: '🏆 Show Top 25 Movies',
        color: '#b8860b', // Dark goldenrod
        hoverColor: '#daa520',
        onClick: 'loadTopMovies'
    },
    {
        row: 1,
        id: 'bottomMoviesBtn',
        text: '💩 Show Bottom 25 Movies',
        color: '#8b4513', // Saddle brown
        hoverColor: '#a0522d',
        onClick: 'loadBottomMovies'
    },
    {
        row: 1,
        id: 'nicPicksBtn',
        text: '✨ Nick Cage Movies',
        color: '#2d3a4a',        
        hoverColor: '#3d4a5a',  
        onClick: 'loadNicPicks'
    },
    // Row 2: Individual picker buttons
    {
        row: 2,
        id: 'drewPicksBtn',
        text: '🎬 Drew\'s Picks',
        color: '#2d4a2d',
        hoverColor: '#3d5a3d',
        onClick: 'loadDrewPicks'
    },
    {
        row: 2,
        id: 'tylerPicksBtn',
        text: '🎬 Tyler\'s Picks',
        color: '#2d4a2d',
        hoverColor: '#3d5a3d',
        onClick: 'loadTylerPicks'
    },
    {
        row: 2,
        id: 'trevorPicksBtn',
        text: '🎬 Trevor\'s Picks',
        color: '#2d4a2d',
        hoverColor: '#3d5a3d',
        onClick: 'loadTrevorPicks'
    },
    {
        row: 2,
        id: 'jordanPicksBtn',
        text: '🎬 Jordan\'s Picks',
        color: '#2d4a2d',
        hoverColor: '#3d5a3d',
        onClick: 'loadJordanPicks'
    },
    {
        row: 2,
        id: 'alexbPicksBtn',
        text: '🎬 AlexB\'s Picks',
        color: '#2d4a2d',
        hoverColor: '#3d5a3d',
        onClick: 'loadAlexBPicks'
    }
];

// Function to create and add all buttons
function createMovieButtons() {
    // Remove any existing button containers
    const existingContainer = document.getElementById('movieButtonsContainer');
    if (existingContainer) {
        existingContainer.remove();
    }

    // Create main container
    const container = document.createElement('div');
    container.id = 'movieButtonsContainer';
    container.style.cssText = `
        text-align: center;
        margin: 30px 0;
        padding: 20px;
    `;

    // Create row containers
    const row1 = document.createElement('div');
    row1.id = 'buttonRow1';
    row1.style.cssText = `
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 20px;
        margin-bottom: 20px;
        flex-wrap: wrap;
    `;

    const row2 = document.createElement('div');
    row2.id = 'buttonRow2';
    row2.style.cssText = `
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 15px;
        flex-wrap: wrap;
    `;

    // Create buttons for each row
    BUTTON_CONFIG.forEach(config => {
        const button = createButton(config);
        if (config.row === 1) {
            row1.appendChild(button);
        } else {
            row2.appendChild(button);
        }
    });

    // Add rows to container
    container.appendChild(row1);
    container.appendChild(row2);

    // Insert container before the results div
    const resultsDiv = document.getElementById('results');
    if (resultsDiv) {
        resultsDiv.parentNode.insertBefore(container, resultsDiv);
    } else {
        // Fallback: add to container div
        const containerDiv = document.querySelector('.container');
        if (containerDiv) {
            containerDiv.insertBefore(container, containerDiv.firstChild);
        }
    }
}

// Function to create individual button
function createButton(config) {
    const button = document.createElement('button');
    button.id = config.id;
    button.innerHTML = config.text;
    
    // Base styles
    button.style.cssText = `
        background-color: ${config.color};
        color: white;
        border: 1px solid ${config.hoverColor};
        padding: 12px 20px;
        cursor: pointer;
        border-radius: 8px;
        font-size: 14px;
        font-weight: bold;
        transition: all 0.3s ease;
        white-space: nowrap;
        min-width: 140px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    `;
    
    // Hover effects
    button.onmouseover = () => {
        button.style.backgroundColor = config.hoverColor;
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = '0 4px 8px rgba(0,0,0,0.4)';
    };
    
    button.onmouseout = () => {
        button.style.backgroundColor = config.color;
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
    };
    
    // Click handler
    button.onclick = () => {
        // Call the appropriate function based on onClick property
        if (window[config.onClick]) {
            window[config.onClick]();
        } else {
            console.warn(`Function ${config.onClick} not found`);
        }
    };
    
    return button;
}

// =====================================
// TOP MOVIES FUNCTIONALITY
// =====================================

// Function to load top 25 movies by average rating
async function loadTopMovies() {
    const tableName = DEFAULT_TABLE;
    
    document.getElementById('results').innerHTML = '<p>Loading top movies...</p>';
    
    // Load database if not already loaded
    if (!db) {
        const loaded = await loadDatabase(DEFAULT_DB_PATH);
        if (!loaded) return;
    }
    
    try {
        // Query the table for top 25 movies sorted by average (high to low)
        const results = db.exec(`
            SELECT 
                title,
                year,
                rated,
                pick,
                date,
                CASE 
                    WHEN (
                        (CASE WHEN tyler IS NOT NULL AND tyler != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN alexb IS NOT NULL AND alexb != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN trevor IS NOT NULL AND trevor != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN jordan IS NOT NULL AND jordan != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN drew IS NOT NULL AND drew != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN alexd IS NOT NULL AND alexd != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN colin IS NOT NULL AND colin != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN other IS NOT NULL AND other != '' THEN 1 ELSE 0 END)
                    ) > 0 
                    THEN ROUND(
                        (
                            (CASE WHEN tyler IS NOT NULL AND tyler != '' THEN tyler ELSE 0 END) +
                            (CASE WHEN alexb IS NOT NULL AND alexb != '' THEN alexb ELSE 0 END) +
                            (CASE WHEN trevor IS NOT NULL AND trevor != '' THEN trevor ELSE 0 END) +
                            (CASE WHEN jordan IS NOT NULL AND jordan != '' THEN jordan ELSE 0 END) +
                            (CASE WHEN drew IS NOT NULL AND drew != '' THEN drew ELSE 0 END) +
                            (CASE WHEN alexd IS NOT NULL AND alexd != '' THEN alexd ELSE 0 END) +
                            (CASE WHEN colin IS NOT NULL AND colin != '' THEN colin ELSE 0 END) +
                            (CASE WHEN other IS NOT NULL AND other != '' THEN other ELSE 0 END)
                        ) * 1.0 / (
                            (CASE WHEN tyler IS NOT NULL AND tyler != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN alexb IS NOT NULL AND alexb != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN trevor IS NOT NULL AND trevor != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN jordan IS NOT NULL AND jordan != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN drew IS NOT NULL AND drew != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN alexd IS NOT NULL AND alexd != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN colin IS NOT NULL AND colin != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN other IS NOT NULL AND other != '' THEN 1 ELSE 0 END)
                        ), 2
                    )
                    ELSE NULL
                END as average
            FROM ${tableName}
            WHERE (
                (CASE WHEN tyler IS NOT NULL AND tyler != '' THEN 1 ELSE 0 END) +
                (CASE WHEN alexb IS NOT NULL AND alexb != '' THEN 1 ELSE 0 END) +
                (CASE WHEN trevor IS NOT NULL AND trevor != '' THEN 1 ELSE 0 END) +
                (CASE WHEN jordan IS NOT NULL AND jordan != '' THEN 1 ELSE 0 END) +
                (CASE WHEN drew IS NOT NULL AND drew != '' THEN 1 ELSE 0 END) +
                (CASE WHEN alexd IS NOT NULL AND alexd != '' THEN 1 ELSE 0 END) +
                (CASE WHEN colin IS NOT NULL AND colin != '' THEN 1 ELSE 0 END) +
                (CASE WHEN other IS NOT NULL AND other != '' THEN 1 ELSE 0 END)
            ) > 0
            ORDER BY average DESC
            LIMIT 25
        `);
        
        if (results.length === 0) {
            document.getElementById('results').innerHTML = 
                `<div class="error">No rated movies found in table: ${tableName}</div>`;
            return;
        }
        
        displayTopMoviesTable(results[0], tableName);
        
    } catch (error) {
        document.getElementById('results').innerHTML = 
            `<div class="error">Error querying top movies: ${error.message}</div>`;
    }
}

function displayTopMoviesTable(result, tableName) {
    const { columns, values } = result;
    
    let html = `<h2>🏆 Top 25 Movies by Average Rating</h2>`;
    html += `<p style="color: #ccc; text-align: center; margin-bottom: 20px;">Showing highest rated movies from ${tableName}</p>`;

    // Add summary statistics
    if (values.length > 0) {
        const averages = values.map(row => row[row.length - 1]).filter(avg => avg !== null);
        if (averages.length > 0) {
            const highestRating = Math.max(...averages);
            const lowestRating = Math.min(...averages);
            const overallAverage = (averages.reduce((sum, avg) => sum + avg, 0) / averages.length).toFixed(2);
            
            html += '<div style="text-align: center; margin: 20px; color: #ccc; background-color: #333; padding: 15px; border-radius: 5px;">';
            html += '<h3 style="margin-top: 0; color: white;">📊 Top 25 Movie Statistics</h3>';
            html += `<p><strong>Total Movies:</strong> ${values.length}</p>`;
            html += `<p><strong>Highest Rating:</strong> ${highestRating}</p>`;
            html += `<p><strong>Lowest Rating:</strong> ${lowestRating}</p>`;
            html += `<p><strong>Average Rating:</strong> ${overallAverage}</p>`;
            html += '</div>';
        }
    }

    html += '<div class="table-container">';
    html += '<table>';
    
    // Headers with rank column
    html += '<thead><tr>';
    html += '<th>Rank</th>'; // Add rank column
    columns.forEach(col => {
        html += `<th>${col}</th>`;
    });
    html += '</tr></thead>';
    
    // Data rows with ranking
    html += '<tbody>';
    values.forEach((row, index) => {
        html += '<tr>';
        
        // Add rank column (1-25)
        const rank = index + 1;
        let rankClass = '';
        if (rank === 1) rankClass = 'style="color: #ffd700; font-weight: bold;"'; // Gold
        else if (rank === 2) rankClass = 'style="color: #c0c0c0; font-weight: bold;"'; // Silver
        else if (rank === 3) rankClass = 'style="color: #cd7f32; font-weight: bold;"'; // Bronze
        
        html += `<td ${rankClass}>${rank}</td>`;
        
        // Add regular columns
        row.forEach((cell, cellIndex) => {
            const displayValue = cell !== null ? cell : '<em>NULL</em>';
            // Highlight the pick column to show values
            if (columns[cellIndex] === 'pick') {
                html += `<td style="background-color: #2d4a2d; color: #90ee90; font-weight: bold;">${displayValue}</td>`;
            } else {
                html += `<td>${displayValue}</td>`;
            }
        });
        html += '</tr>';
    });
    html += '</tbody>';
    
    html += '</table>';
    html += '</div>';
    
    // Add button to return to full table
    html += '<div style="text-align: center; margin-top: 20px;">';
    html += '<button onclick="loadTable()" style="background-color: #444; color: white; border: 1px solid #666; padding: 10px 20px; cursor: pointer; border-radius: 5px; font-size: 16px;">Show All Movies</button>';
    html += '</div>';
    
    document.getElementById('results').innerHTML = html;
}

// =====================================
// BOTTOM MOVIES FUNCTIONALITY
// =====================================

// Function to load bottom 25 movies by average rating
async function loadBottomMovies() {
    const tableName = DEFAULT_TABLE;
    
    document.getElementById('results').innerHTML = '<p>Loading bottom movies...</p>';
    
    // Load database if not already loaded
    if (!db) {
        const loaded = await loadDatabase(DEFAULT_DB_PATH);
        if (!loaded) return;
    }
    
    try {
        // Query the table for bottom 25 movies sorted by average (low to high)
        const results = db.exec(`
            SELECT 
                title,
                year,
                rated,
                pick,
                date,
                CASE 
                    WHEN (
                        (CASE WHEN tyler IS NOT NULL AND tyler != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN alexb IS NOT NULL AND alexb != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN trevor IS NOT NULL AND trevor != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN jordan IS NOT NULL AND jordan != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN drew IS NOT NULL AND drew != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN alexd IS NOT NULL AND alexd != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN colin IS NOT NULL AND colin != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN other IS NOT NULL AND other != '' THEN 1 ELSE 0 END)
                    ) > 0 
                    THEN ROUND(
                        (
                            (CASE WHEN tyler IS NOT NULL AND tyler != '' THEN tyler ELSE 0 END) +
                            (CASE WHEN alexb IS NOT NULL AND alexb != '' THEN alexb ELSE 0 END) +
                            (CASE WHEN trevor IS NOT NULL AND trevor != '' THEN trevor ELSE 0 END) +
                            (CASE WHEN jordan IS NOT NULL AND jordan != '' THEN jordan ELSE 0 END) +
                            (CASE WHEN drew IS NOT NULL AND drew != '' THEN drew ELSE 0 END) +
                            (CASE WHEN alexd IS NOT NULL AND alexd != '' THEN alexd ELSE 0 END) +
                            (CASE WHEN colin IS NOT NULL AND colin != '' THEN colin ELSE 0 END) +
                            (CASE WHEN other IS NOT NULL AND other != '' THEN other ELSE 0 END)
                        ) * 1.0 / (
                            (CASE WHEN tyler IS NOT NULL AND tyler != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN alexb IS NOT NULL AND alexb != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN trevor IS NOT NULL AND trevor != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN jordan IS NOT NULL AND jordan != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN drew IS NOT NULL AND drew != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN alexd IS NOT NULL AND alexd != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN colin IS NOT NULL AND colin != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN other IS NOT NULL AND other != '' THEN 1 ELSE 0 END)
                        ), 2
                    )
                    ELSE NULL
                END as average
            FROM ${tableName}
            WHERE (
                (CASE WHEN tyler IS NOT NULL AND tyler != '' THEN 1 ELSE 0 END) +
                (CASE WHEN alexb IS NOT NULL AND alexb != '' THEN 1 ELSE 0 END) +
                (CASE WHEN trevor IS NOT NULL AND trevor != '' THEN 1 ELSE 0 END) +
                (CASE WHEN jordan IS NOT NULL AND jordan != '' THEN 1 ELSE 0 END) +
                (CASE WHEN drew IS NOT NULL AND drew != '' THEN 1 ELSE 0 END) +
                (CASE WHEN alexd IS NOT NULL AND alexd != '' THEN 1 ELSE 0 END) +
                (CASE WHEN colin IS NOT NULL AND colin != '' THEN 1 ELSE 0 END) +
                (CASE WHEN other IS NOT NULL AND other != '' THEN 1 ELSE 0 END)
            ) > 0
            ORDER BY average ASC
            LIMIT 25
        `);
        
        if (results.length === 0) {
            document.getElementById('results').innerHTML = 
                `<div class="error">No rated movies found in table: ${tableName}</div>`;
            return;
        }
        
        displayBottomMoviesTable(results[0], tableName);
        
    } catch (error) {
        document.getElementById('results').innerHTML = 
            `<div class="error">Error querying bottom movies: ${error.message}</div>`;
    }
}

function displayBottomMoviesTable(result, tableName) {
    const { columns, values } = result;
    
    let html = `<h2>💩 Bottom 25 Movies by Average Rating</h2>`;
    html += `<p style="color: #ccc; text-align: center; margin-bottom: 20px;">Showing lowest rated movies from ${tableName}</p>`;

    // Add summary statistics
    if (values.length > 0) {
        const averages = values.map(row => row[row.length - 1]).filter(avg => avg !== null);
        if (averages.length > 0) {
            const highestRating = Math.max(...averages);
            const lowestRating = Math.min(...averages);
            const overallAverage = (averages.reduce((sum, avg) => sum + avg, 0) / averages.length).toFixed(2);
            
            html += '<div style="text-align: center; margin: 20px; color: #ccc; background-color: #333; padding: 15px; border-radius: 5px;">';
            html += '<h3 style="margin-top: 0; color: white;">📊 Bottom 25 Movie Statistics</h3>';
            html += `<p><strong>Total Movies:</strong> ${values.length}</p>`;
            html += `<p><strong>Highest Rating:</strong> ${highestRating}</p>`;
            html += `<p><strong>Lowest Rating:</strong> ${lowestRating}</p>`;
            html += `<p><strong>Average Rating:</strong> ${overallAverage}</p>`;
            html += '</div>';
        }
    }

    html += '<div class="table-container">';
    html += '<table>';
    
    // Headers with rank column
    html += '<thead><tr>';
    html += '<th>Rank</th>'; // Add rank column
    columns.forEach(col => {
        html += `<th>${col}</th>`;
    });
    html += '</tr></thead>';
    
    // Data rows with ranking (1 = worst, 25 = 25th worst)
    html += '<tbody>';
    values.forEach((row, index) => {
        html += '<tr>';
        
        // Add rank column (1-25, where 1 is the worst)
        const rank = index + 1;
        let rankClass = '';
        if (rank === 1) rankClass = 'style="color: #ff4444; font-weight: bold;"'; // Red for worst
        else if (rank === 2) rankClass = 'style="color: #ff6666; font-weight: bold;"'; // Lighter red
        else if (rank === 3) rankClass = 'style="color: #ff8888; font-weight: bold;"'; // Even lighter red
        
        html += `<td ${rankClass}>${rank}</td>`;
        
        // Add regular columns
        row.forEach((cell, cellIndex) => {
            const displayValue = cell !== null ? cell : '<em>NULL</em>';
            // Highlight the pick column to show values
            if (columns[cellIndex] === 'pick') {
                html += `<td style="background-color: #2d4a2d; color: #90ee90; font-weight: bold;">${displayValue}</td>`;
            } else {
                html += `<td>${displayValue}</td>`;
            }
        });
        html += '</tr>';
    });
    html += '</tbody>';
    
    html += '</table>';
    html += '</div>';
    
    // Add button to return to full table
    html += '<div style="text-align: center; margin-top: 20px;">';
    html += '<button onclick="loadTable()" style="background-color: #444; color: white; border: 1px solid #666; padding: 10px 20px; cursor: pointer; border-radius: 5px; font-size: 16px;">Show All Movies</button>';
    html += '</div>';
    
    document.getElementById('results').innerHTML = html;
}

// =====================================
// NIC CAGE MOVIES FUNCTIONALITY
// =====================================

// Function to load movies where Nic's pick is "Y"
async function loadNicPicks() {
    const tableName = DEFAULT_TABLE;
    
    document.getElementById('results').innerHTML = '<p>Loading Nic Cage Movies...</p>';
    
    // Load database if not already loaded
    if (!db) {
        const loaded = await loadDatabase(DEFAULT_DB_PATH);
        if (!loaded) return;
    }
    
    try {
        // Query the table for movies where "nic" column is "Y", sorted by average (high to low)
        const results = db.exec(`
            SELECT 
                title,
                year,
                rated,
                pick,
                date,
                CASE 
                    WHEN (
                        (CASE WHEN tyler IS NOT NULL AND tyler != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN alexb IS NOT NULL AND alexb != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN trevor IS NOT NULL AND trevor != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN jordan IS NOT NULL AND jordan != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN drew IS NOT NULL AND drew != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN alexd IS NOT NULL AND alexd != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN colin IS NOT NULL AND colin != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN other IS NOT NULL AND other != '' THEN 1 ELSE 0 END)
                    ) > 0 
                    THEN ROUND(
                        (
                            (CASE WHEN tyler IS NOT NULL AND tyler != '' THEN tyler ELSE 0 END) +
                            (CASE WHEN alexb IS NOT NULL AND alexb != '' THEN alexb ELSE 0 END) +
                            (CASE WHEN trevor IS NOT NULL AND trevor != '' THEN trevor ELSE 0 END) +
                            (CASE WHEN jordan IS NOT NULL AND jordan != '' THEN jordan ELSE 0 END) +
                            (CASE WHEN drew IS NOT NULL AND drew != '' THEN drew ELSE 0 END) +
                            (CASE WHEN alexd IS NOT NULL AND alexd != '' THEN alexd ELSE 0 END) +
                            (CASE WHEN colin IS NOT NULL AND colin != '' THEN colin ELSE 0 END) +
                            (CASE WHEN other IS NOT NULL AND other != '' THEN other ELSE 0 END)
                        ) * 1.0 / (
                            (CASE WHEN tyler IS NOT NULL AND tyler != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN alexb IS NOT NULL AND alexb != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN trevor IS NOT NULL AND trevor != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN jordan IS NOT NULL AND jordan != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN drew IS NOT NULL AND drew != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN alexd IS NOT NULL AND alexd != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN colin IS NOT NULL AND colin != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN other IS NOT NULL AND other != '' THEN 1 ELSE 0 END)
                        ), 2
                    )
                    ELSE NULL
                END as average
            FROM ${tableName}
            WHERE UPPER(nic) = 'Y'
            ORDER BY average DESC
        `);
        
        if (results.length === 0) {
            document.getElementById('results').innerHTML = 
                `<div class="error">No movies found where Nic's pick is "Y" in table: ${tableName}</div>`;
            return;
        }
        
        displayNicPicksTable(results[0], tableName);
        
    } catch (error) {
        document.getElementById('results').innerHTML = 
            `<div class="error">Error querying Nic's picks: ${error.message}</div>`;
    }
}

function displayNicPicksTable(result, tableName) {
    const { columns, values } = result;
    
    let html = `<h2>✨ Nick's Movie Picks</h2>`;
    html += `<p style="color: #ccc; text-align: center; margin-bottom: 20px;">Nicolas Cage movies (${values.length} movies) - sorted by average rating</p>`;

    // Add summary statistics
    if (values.length > 0) {
        const averages = values.map(row => row[row.length - 1]).filter(avg => avg !== null);
        if (averages.length > 0) {
            const highestRating = Math.max(...averages);
            const lowestRating = Math.min(...averages);
            const overallAverage = (averages.reduce((sum, avg) => sum + avg, 0) / averages.length).toFixed(2);
            
            html += '<div style="text-align: center; margin: 20px; color: #ccc; background-color: #333; padding: 15px; border-radius: 5px;">';
            html += '<h3 style="margin-top: 0; color: white;">📊 Nicolas Cage Movie Statistics</h3>';
            html += `<p><strong>Total Movies:</strong> ${values.length}</p>`;
            html += `<p><strong>Highest Rating:</strong> ${highestRating}</p>`;
            html += `<p><strong>Lowest Rating:</strong> ${lowestRating}</p>`;
            html += `<p><strong>Average Rating:</strong> ${overallAverage}</p>`;
            html += '</div>';
        }
    }

    html += '<div class="table-container">';
    html += '<table>';
    
    // Headers with rank column
    html += '<thead><tr>';
    html += '<th>Rank</th>'; // Add rank column
    columns.forEach(col => {
        html += `<th>${col}</th>`;
    });
    html += '</tr></thead>';
    
    // Data rows with ranking
    html += '<tbody>';
    values.forEach((row, index) => {
        html += '<tr>';
        
        // Add rank column
        const rank = index + 1;
        let rankClass = '';
        if (rank === 1) rankClass = 'style="color: #ffd700; font-weight: bold;"'; // Gold for best Nic pick
        else if (rank === 2) rankClass = 'style="color: #c0c0c0; font-weight: bold;"'; // Silver
        else if (rank === 3) rankClass = 'style="color: #cd7f32; font-weight: bold;"'; // Bronze
        
        html += `<td ${rankClass}>${rank}</td>`;
        
        // Add regular columns
        row.forEach((cell, cellIndex) => {
            const displayValue = cell !== null ? cell : '<em>NULL</em>';
            // Highlight the pick column to show values
            if (columns[cellIndex] === 'pick') {
                html += `<td style="background-color: #2d4a2d; color: #90ee90; font-weight: bold;">${displayValue}</td>`;
            } else {
                html += `<td>${displayValue}</td>`;
            }
        });
        html += '</tr>';
    });
    html += '</tbody>';
    
    html += '</table>';
    html += '</div>';
    
    // Add button to return to full table
    html += '<div style="text-align: center; margin-top: 20px;">';
    html += '<button onclick="loadTable()" style="background-color: #444; color: white; border: 1px solid #666; padding: 10px 20px; cursor: pointer; border-radius: 5px; font-size: 16px;">Show All Movies</button>';
    html += '</div>';
    
    document.getElementById('results').innerHTML = html;
}

// Individual picker functions (you'll need to implement these based on your existing code)

async function loadDrewPicks() {
    await loadPersonPicks('Drew', 'Drew\'s Movie Picks', 'Drewolas Cage movies');
}

async function loadTylerPicks() {
    await loadPersonPicks('Tyler', 'Tyler\'s Movie Picks', 'Tylerolas Cage movies');
}

async function loadTrevorPicks() {
    await loadPersonPicks('Trevor', 'Trevor\'s Movie Picks', 'Trevorolas Cage movies');
}

async function loadJordanPicks() {
    await loadPersonPicks('Jordan', 'Jordan\'s Movie Picks', 'Jordanolas Cage movies');
}

async function loadAlexBPicks() {
    await loadPersonPicks('Alex', 'AlexB\'s Movie Picks', 'AlexBolas Cage movies');
}

// Generic function to load picks for any person
async function loadPersonPicks(personName, title, subtitle) {
    const tableName = DEFAULT_TABLE;
    
    document.getElementById('results').innerHTML = `<p>Loading ${personName} Cage Movies...</p>`;
    
    // Load database if not already loaded
    if (!db) {
        const loaded = await loadDatabase(DEFAULT_DB_PATH);
        if (!loaded) return;
    }
    
    try {
        // Query the table for movies where pick column matches the person
        const results = db.exec(`
            SELECT 
                id,
                title,
                year,
                rated,
                date,
                CASE 
                    WHEN (
                        (CASE WHEN tyler IS NOT NULL AND tyler != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN alexb IS NOT NULL AND alexb != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN trevor IS NOT NULL AND trevor != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN jordan IS NOT NULL AND jordan != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN drew IS NOT NULL AND drew != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN alexd IS NOT NULL AND alexd != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN colin IS NOT NULL AND colin != '' THEN 1 ELSE 0 END) +
                        (CASE WHEN other IS NOT NULL AND other != '' THEN 1 ELSE 0 END)
                    ) > 0 
                    THEN ROUND(
                        (
                            (CASE WHEN tyler IS NOT NULL AND tyler != '' THEN tyler ELSE 0 END) +
                            (CASE WHEN alexb IS NOT NULL AND alexb != '' THEN alexb ELSE 0 END) +
                            (CASE WHEN trevor IS NOT NULL AND trevor != '' THEN trevor ELSE 0 END) +
                            (CASE WHEN jordan IS NOT NULL AND jordan != '' THEN jordan ELSE 0 END) +
                            (CASE WHEN drew IS NOT NULL AND drew != '' THEN drew ELSE 0 END) +
                            (CASE WHEN alexd IS NOT NULL AND alexd != '' THEN alexd ELSE 0 END) +
                            (CASE WHEN colin IS NOT NULL AND colin != '' THEN colin ELSE 0 END) +
                            (CASE WHEN other IS NOT NULL AND other != '' THEN other ELSE 0 END)
                        ) * 1.0 / (
                            (CASE WHEN tyler IS NOT NULL AND tyler != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN alexb IS NOT NULL AND alexb != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN trevor IS NOT NULL AND trevor != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN jordan IS NOT NULL AND jordan != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN drew IS NOT NULL AND drew != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN alexd IS NOT NULL AND alexd != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN colin IS NOT NULL AND colin != '' THEN 1 ELSE 0 END) +
                            (CASE WHEN other IS NOT NULL AND other != '' THEN 1 ELSE 0 END)
                        ), 2
                    )
                    ELSE NULL
                END as average
            FROM ${tableName}
            WHERE pick = '${personName}'
            ORDER BY average DESC
        `);
        
        if (results.length === 0) {
            document.getElementById('results').innerHTML = 
                `<div class="error">No movies found where ${personName}'s pick is selected in table: ${tableName}</div>`;
            return;
        }
        
        displayPersonPicksTable(personName, results[0], title, subtitle);
        
    } catch (error) {
        document.getElementById('results').innerHTML = 
            `<div class="error">Error querying ${personName}'s picks: ${error.message}</div>`;
    }
}

// Fixed displayPersonPicksTable function with stats on left and bar graph on right
// Fixed displayPersonPicksTable function with smaller stats container
function displayPersonPicksTable(personName, result, title, subtitle) {
    const { columns, values } = result;
    
    let html = `<h2>${title}</h2>`;
    html += `<p style="color: #ccc; text-align: center; margin-bottom: 20px;">${subtitle} (${values.length} movies) - sorted by average rating</p>`;
    
    // Add summary statistics and bar graph side by side
    if (values.length > 0) {
        const averages = values.map(row => row[row.length - 1]).filter(avg => avg !== null);
        if (averages.length > 0) {
            const highestRating = Math.max(...averages);
            const lowestRating = Math.min(...averages);
            const overallAverage = (averages.reduce((sum, avg) => sum + avg, 0) / averages.length).toFixed(2);
            
            // Create container for stats and chart side by side
            html += '<div style="display: flex; margin: 20px 0; gap: 20px; align-items: stretch;">';
            
            // Left side - Statistics (MADE SMALLER)
            html += '<div style="flex: 0 0 200px; color: #ccc; background-color: #333; padding: 15px; border-radius: 5px;">';
            html += `<h3 style="margin-top: 0; color: white; font-size: 16px;">📊 ${personName}\'s Stats</h3>`;
            html += `<p style="margin: 8px 0; font-size: 14px;"><strong>Movies:</strong> ${values.length}</p>`;
            html += `<p style="margin: 8px 0; font-size: 14px;"><strong>Highest:</strong> ${highestRating}</p>`;
            html += `<p style="margin: 8px 0; font-size: 14px;"><strong>Lowest:</strong> ${lowestRating}</p>`;
            html += `<p style="margin: 8px 0; font-size: 14px;"><strong>Average:</strong> ${overallAverage}</p>`;
            html += '</div>';
            
            // Right side - Bar Chart (TAKES UP REMAINING SPACE)
            html += '<div style="flex: 1; background-color: #333; padding: 15px; border-radius: 5px; min-height: 200px;">';
            html += `<h3 style="margin-top: 0; color: white; text-align: center;">📈 ${personName}\'s Movie Picks (Chronological Order)</h3>`;
            
            // Process data for chart - movies in chronological order (by id)
            const movieData = [];
            values.forEach((row, index) => {
                const idIndex = columns.indexOf('id');
                const titleIndex = columns.indexOf('title');
                const averageIndex = row.length - 1; // average is last column
                const id = idIndex !== -1 ? row[idIndex] : index + 1;
                const title = titleIndex !== -1 ? row[titleIndex] : `Movie ${index + 1}`;
                const average = row[averageIndex];
                
                if (average !== null) {
                    movieData.push({
                        id: id,
                        title: title,
                        average: parseFloat(average).toFixed(2),
                        tableRank: index + 1 // Keep track of table ranking
                    });
                }
            });

            // Sort by id for chronological order in chart
            movieData.sort((a, b) => a.id - b.id);

            // Create bar chart
            if (movieData.length > 0) {
                const maxRating = 5; // Fixed max rating of 5
                const chartHeight = 120;
                
                html += '<div style="display: flex; align-items: end; justify-content: center; height: ' + chartHeight + 'px; margin: 20px 0; border-bottom: 2px solid #666; position: relative; overflow-x: auto; padding: 0 10px;">';
                
                movieData.forEach((data, index) => {
                    const barHeight = (parseFloat(data.average) / maxRating) * chartHeight * 0.8;
                    const barColor = parseFloat(data.average) >= 3.34 ? '#4CAF50' : 
                                parseFloat(data.average) >= 1.67 ? '#FFC107' : '#F44336';
                    
                    html += '<div style="display: flex; flex-direction: column; align-items: center; margin: 0 2px; min-width: 25px;">';
                    
                    // Rating label on top of bar
                    html += `<div style="color: white; font-size: 10px; margin-bottom: 3px; font-weight: bold;">${data.average}</div>`;
                    
                    // Bar
                    html += `<div style="
                        width: 20px; 
                        height: ${barHeight}px; 
                        background-color: ${barColor}; 
                        border-radius: 2px 2px 0 0;
                        position: relative;
                        transition: opacity 0.3s ease;
                        cursor: pointer;
                    " title="${data.title} - Rating: ${data.average}/5"></div>`;
                    
                    // Rank label
                    html += `<div style="color: #ccc; font-size: 9px; margin-top: 3px;">#${data.tableRank}</div>`;
                    
                    html += '</div>';
                });
                
                html += '</div>';
                
                // Legend
                html += '<div style="display: flex; justify-content: center; gap: 15px; margin-top: 10px; font-size: 11px;">';
                html += '<div style="display: flex; align-items: center; gap: 5px;"><div style="width: 12px; height: 12px; background-color: #4CAF50; border-radius: 2px;"></div><span style="color: #ccc;">Good (3.35+)</span></div>';
                html += '<div style="display: flex; align-items: center; gap: 5px;"><div style="width: 12px; height: 12px; background-color: #FFC107; border-radius: 2px;"></div><span style="color: #ccc;">OK (1.68-3.34)</span></div>';
                html += '<div style="display: flex; align-items: center; gap: 5px;"><div style="width: 12px; height: 12px; background-color: #F44336; border-radius: 2px;"></div><span style="color: #ccc;">Poor (<1.67)</span></div>';
                html += '</div>';
            } else {
                html += '<div style="color: #999; text-align: center; margin: 40px 0;">No date data available for chart</div>';
            }
            
            html += '</div>'; // Close chart container
            html += '</div>'; // Close flex container
        }
    }

    // NOW add the table container
    html += '<div class="table-container">';
    html += '<table>';
    
    // Headers with rank column
    html += '<thead><tr>';
    html += '<th>Rank</th>';
    columns.forEach(col => {
        if (col !== 'id') {
            html += `<th>${col}</th>`;
        }
    });
    html += '</tr></thead>';
    
    // Data rows with ranking
    html += '<tbody>';
    values.forEach((row, index) => {
        html += '<tr>';
        
        // Add rank column
        const rank = index + 1;
        let rankClass = '';
        if (rank === 1) rankClass = 'style="color: #ffd700; font-weight: bold;"';
        else if (rank === 2) rankClass = 'style="color: #c0c0c0; font-weight: bold;"';
        else if (rank === 3) rankClass = 'style="color: #cd7f32; font-weight: bold;"';
        
        html += `<td ${rankClass}>${rank}</td>`;
        
        // Add regular columns
        row.forEach((cell, cellIndex) => {
            if (columns[cellIndex] !== 'id') {
                const displayValue = cell !== null ? cell : '<em>NULL</em>';
                if (columns[cellIndex] === 'pick') {
                    html += `<td style="background-color: #2d4a2d; color: #90ee90; font-weight: bold;">${displayValue}</td>`;
                } else {
                 html += `<td>${displayValue}</td>`;
                }
            }
        });
        html += '</tr>';
    });
    html += '</tbody>';
    html += '</table>';
    html += '</div>'; // Close table-container
    
    // Add button to return to full table
    html += '<div style="text-align: center; margin-top: 20px;">';
    html += '<button onclick="loadTable()" style="background-color: #444; color: white; border: 1px solid #666; padding: 10px 20px; cursor: pointer; border-radius: 5px; font-size: 16px;">Show All Movies</button>';
    html += '</div>';
    
    document.getElementById('results').innerHTML = html;
}

// Initialize buttons when page loads
window.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for other scripts to load
    setTimeout(() => {
        createMovieButtons();
    }, 500);
});

// Also handle the old window.onload approach for compatibility
const originalWindowOnLoad = window.onload;
window.onload = function() {
    if (originalWindowOnLoad) {
        originalWindowOnLoad();
    }
    
    setTimeout(() => {
        createMovieButtons();
    }, 600);
};