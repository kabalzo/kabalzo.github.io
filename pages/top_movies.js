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
        row.forEach(cell => {
            const displayValue = cell !== null ? cell : '<em>NULL</em>';
            html += `<td>${displayValue}</td>`;
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

// Function to add the "Top 25" button to the page
function addTopMoviesButton() {
    // Look for existing button first
    if (document.getElementById('topMoviesBtn')) {
        return; // Button already exists
    }
    
    // Find a good place to add the button (e.g., after the h2 title or in a designated area)
    const resultsDiv = document.getElementById('results');
    if (resultsDiv) {
        // Create button element
        const button = document.createElement('button');
        button.id = 'topMoviesBtn';
        button.innerHTML = '🏆 Show Top 25 Movies';
        button.style.cssText = `
            background-color: #444;
            color: white;
            border: 1px solid #666;
            padding: 12px 24px;
            cursor: pointer;
            border-radius: 5px;
            font-size: 16px;
            margin: 20px auto;
            display: block;
            transition: background-color 0.3s;
        `;
        
        // Add hover effect
        button.onmouseover = () => button.style.backgroundColor = '#555';
        button.onmouseout = () => button.style.backgroundColor = '#444';
        
        // Add click handler
        button.onclick = loadTopMovies;
        
        // Insert button before the results content
        resultsDiv.parentNode.insertBefore(button, resultsDiv);
    }
}

// Modify the original window.onload to also add the button
const originalOnLoad = window.onload;
window.onload = function() {
    // Call the original onload function
    if (originalOnLoad) {
        originalOnLoad();
    }
    
    // Add the top movies button after a short delay
    setTimeout(() => {
        addTopMoviesButton();
        if (!db) {
            loadTable();
        }
    }, 200);
};