// imdb-ratings.js

// GraphQL endpoint
const IMDB_API_URL = "https://graph.imdbapi.dev/v1";

// Function to fetch IMDB rating for a specific movie
async function fetchIMDBRating(movieElement) {
    const imdbId = movieElement.dataset.imdbId;
    const imdbDiv = movieElement.querySelector('.imdb');
    
    if (!imdbId) {
        imdbDiv.innerHTML = '<div class="imdb-loading">N/A</div>';
        return;
    }

    // Show loading state
    imdbDiv.innerHTML = '<div class="imdb-loading">Loading...</div>';

    // GraphQL query with dynamic ID (same as your original)
    const body = `
    query titleById {
      title(id: "${imdbId}") {
        rating {
          aggregate_rating
        }   
      }
    }
    `;

    try {
        const response = await fetch(IMDB_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: body })
        });

        if (response.status === 200) {
            const data = await response.json();

            // Extract just the aggregate rating (same logic as your original)
            if (data.data && data.data.title && data.data.title.rating) {
                const rating = data.data.title.rating.aggregate_rating;
                // Format with CSS classes instead of plain text
                imdbDiv.innerHTML = `<div class="imdb-score">${rating}/10</div>`;
            } else {
                imdbDiv.innerHTML = '<div class="imdb-loading">N/A</div>';
            }
        } else {
            imdbDiv.innerHTML = '<div class="imdb-loading">Error</div>';
            console.error(`Failed to fetch rating for ${imdbId}: ${response.status}`);
        }
    } catch (error) {
        imdbDiv.innerHTML = '<div class="imdb-loading">Error</div>';
        console.error(`Error fetching rating for ${imdbId}:`, error);
    }
}

// Function to load all IMDB ratings on the page
function loadAllIMDBRatings() {
    const movieElements = document.querySelectorAll('.movie[data-imdb-id]');
    
    movieElements.forEach(movieElement => {
        fetchIMDBRating(movieElement);
    });
}

// Load ratings when page loads
document.addEventListener('DOMContentLoaded', loadAllIMDBRatings);