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

// Function to add the "Bottom 25" button to the page
function addBottomMoviesButton() {
    // Look for existing button first
    if (document.getElementById('bottomMoviesBtn')) {
        return; // Button already exists
    }
    
    // Find the top movies button to place this one next to it
    const topButton = document.getElementById('topMoviesBtn');
    if (topButton) {
        // Create button element
        const button = document.createElement('button');
        button.id = 'bottomMoviesBtn';
        button.innerHTML = '💩 Show Bottom 25 Movies';
        button.style.cssText = `
            background-color: #444;
            color: white;
            border: 1px solid #666;
            padding: 12px 24px;
            cursor: pointer;
            border-radius: 5px;
            font-size: 16px;
            margin: 20px 10px;
            display: inline-block;
            transition: background-color 0.3s;
        `;
        
        // Add hover effect
        button.onmouseover = () => button.style.backgroundColor = '#555';
        button.onmouseout = () => button.style.backgroundColor = '#444';
        
        // Add click handler
        button.onclick = loadBottomMovies;
        
        // Update top button style to be inline
        topButton.style.display = 'inline-block';
        topButton.style.margin = '20px 10px';
        
        // Insert button after the top movies button
        topButton.parentNode.insertBefore(button, topButton.nextSibling);
    } else {
        // Fallback: add button to results div area if top button doesn't exist
        const resultsDiv = document.getElementById('results');
        if (resultsDiv) {
            const button = document.createElement('button');
            button.id = 'bottomMoviesBtn';
            button.innerHTML = '💩 Show Bottom 25 Movies';
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
            
            button.onmouseover = () => button.style.backgroundColor = '#555';
            button.onmouseout = () => button.style.backgroundColor = '#444';
            button.onclick = loadBottomMovies;
            
            resultsDiv.parentNode.insertBefore(button, resultsDiv);
        }
    }
}

// Enhanced window.onload to include bottom movies button
const originalOnLoadBottom = window.onload;
window.onload = function() {
    // Call the previous onload function
    if (originalOnLoadBottom) {
        originalOnLoadBottom();
    }
    
    // Add both buttons after a short delay
    setTimeout(() => {
        addBottomMoviesButton();
    }, 300);
};