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
    
    let html = `<h2>🎬 Nic's Movie Picks</h2>`;
    html += `<p style="color: #ccc; text-align: center; margin-bottom: 20px;">Nicolas Cage movies (${values.length} movies) - sorted by average rating</p>`;
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
            // Highlight the pick column to show "Y" values
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
    
    // Add summary statistics
    if (values.length > 0) {
        const averages = values.map(row => row[row.length - 1]).filter(avg => avg !== null);
        if (averages.length > 0) {
            const highestRating = Math.max(...averages);
            const lowestRating = Math.min(...averages);
            const overallAverage = (averages.reduce((sum, avg) => sum + avg, 0) / averages.length).toFixed(2);
            
            html += '<div style="text-align: center; margin: 20px; color: #ccc; background-color: #333; padding: 15px; border-radius: 5px;">';
            html += '<h3 style="margin-top: 0; color: white;">📊 Nic\'s Pick Statistics</h3>';
            html += `<p><strong>Total Movies:</strong> ${values.length}</p>`;
            html += `<p><strong>Highest Rating:</strong> ${highestRating}</p>`;
            html += `<p><strong>Lowest Rating:</strong> ${lowestRating}</p>`;
            html += `<p><strong>Average Rating:</strong> ${overallAverage}</p>`;
            html += '</div>';
        }
    }
    
    // Add button to return to full table
    html += '<div style="text-align: center; margin-top: 20px;">';
    html += '<button onclick="loadTable()" style="background-color: #444; color: white; border: 1px solid #666; padding: 10px 20px; cursor: pointer; border-radius: 5px; font-size: 16px;">Show All Movies</button>';
    html += '</div>';
    
    document.getElementById('results').innerHTML = html;
}

// Function to add the "Nic's Picks" button to the page
function addNicPicksButton() {
    // Look for existing button first
    if (document.getElementById('nicPicksBtn')) {
        return; // Button already exists
    }
    
    // Find the bottom movies button to place this one next to it
    const bottomButton = document.getElementById('bottomMoviesBtn');
    if (bottomButton) {
        // Create button element
        const button = document.createElement('button');
        button.id = 'nicPicksBtn';
        button.innerHTML = '🎬 Nic Cage Movies';
        button.style.cssText = `
            background-color: #2d4a2d;
            color: #90ee90;
            border: 1px solid #4a6a4a;
            padding: 12px 24px;
            cursor: pointer;
            border-radius: 5px;
            font-size: 16px;
            margin: 20px 10px;
            display: inline-block;
            transition: background-color 0.3s;
            font-weight: bold;
        `;
        
        // Add hover effect
        button.onmouseover = () => button.style.backgroundColor = '#3d5a3d';
        button.onmouseout = () => button.style.backgroundColor = '#2d4a2d';
        
        // Add click handler
        button.onclick = loadNicPicks;
        
        // Insert button after the bottom movies button
        bottomButton.parentNode.insertBefore(button, bottomButton.nextSibling);
    } else {
        // Fallback: add button to results div area if other buttons don't exist
        const resultsDiv = document.getElementById('results');
        if (resultsDiv) {
            const button = document.createElement('button');
            button.id = 'nicPicksBtn';
            button.innerHTML = '🎬 Nic Cage Movies';
            button.style.cssText = `
                background-color: #2d4a2d;
                color: #90ee90;
                border: 1px solid #4a6a4a;
                padding: 12px 24px;
                cursor: pointer;
                border-radius: 5px;
                font-size: 16px;
                margin: 20px auto;
                display: block;
                transition: background-color 0.3s;
                font-weight: bold;
            `;
            
            button.onmouseover = () => button.style.backgroundColor = '#3d5a3d';
            button.onmouseout = () => button.style.backgroundColor = '#2d4a2d';
            button.onclick = loadNicPicks;
            
            resultsDiv.parentNode.insertBefore(button, resultsDiv);
        }
    }
}

// Enhanced window.onload to include Nic's picks button
const originalOnLoadNic = window.onload;
window.onload = function() {
    // Call the previous onload function
    if (originalOnLoadNic) {
        originalOnLoadNic();
    }
    
    // Add Nic's picks button after a short delay
    setTimeout(() => {
        addNicPicksButton();
    }, 400);
};