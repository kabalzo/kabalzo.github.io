// imdb-ratings.js - Enhanced OMDB API version with all ratings

// OMDB API configuration
const OMDB_API_URL = "https://www.omdbapi.com/";

// Cache configuration
const CACHE_KEY_PREFIX = 'movie_ratings_';
const CACHE_EXPIRY_DAYS = 15;
const RATE_LIMIT_DELAY = 10000; // 10 second between API calls

// API Key Management - Multiple secure options
const APIKeyManager = {
    // Option 1: Environment variable (for build systems like Netlify/Vercel)
    getKeyFromEnv: function() {
        // Check if running in build environment (Netlify/Vercel)
        if (typeof process !== 'undefined' && process.env) {
            return process.env.OMDB_API_KEY;
        }
        // Check for injected environment variables in browser
        if (typeof window !== 'undefined' && window.ENV) {
            return window.ENV.OMDB_API_KEY;
        }
        return null;
    },

    // Option 2: Prompt user for key (stores locally)
    getKeyFromUser: function() {
        const storedKey = localStorage.getItem('omdb_api_key');
        if (storedKey) return storedKey;

        const key = prompt(
            'Please enter your OMDB API key (get free key at omdbapi.com):\n\n' +
            'This will be stored locally in your browser and never shared.'
        );
        
        if (key && key.length === 8) { // OMDB keys are 8 characters
            localStorage.setItem('omdb_api_key', key);
            return key;
        }
        return null;
    },

    // Option 3: Load from external config file (not in git)
    getKeyFromConfig: async function() {
        try {
            const response = await fetch('./config.json');
            const config = await response.json();
            return config.omdbApiKey;
        } catch (e) {
            console.warn('Could not load config.json, falling back to user prompt');
            return null;
        }
    },

    // Option 4: Use your own proxy server
    getProxyEndpoint: function() {
        // If you set up your own proxy server (recommended for production)
        return window.location.hostname.includes('localhost') 
            ? 'http://localhost:3001/api/omdb/' 
            : 'https://your-proxy-server.herokuapp.com/api/omdb/';
    },

    // Main function to get API key using preferred method
    getApiKey: async function() {
        // Try environment variables first (best for production)
        let key = this.getKeyFromEnv();
        if (key) return key;

        // Try config file (good for development)
        key = await this.getKeyFromConfig();
        if (key) return key;

        // Fall back to user input (simplest for personal use)
        return this.getKeyFromUser();
    }
};

// Cache utility functions for all ratings
const CacheUtils = {
    setCachedRatings: function(imdbId, ratingsData) {
        const cacheData = {
            ratings: ratingsData,
            timestamp: Date.now(),
            expiresAt: Date.now() + (CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
        };
        try {
            localStorage.setItem(CACHE_KEY_PREFIX + imdbId, JSON.stringify(cacheData));
        } catch (e) {
            console.warn('Failed to cache ratings for', imdbId, e);
        }
    },

    getCachedRatings: function(imdbId) {
        try {
            const cached = localStorage.getItem(CACHE_KEY_PREFIX + imdbId);
            if (!cached) return null;

            const cacheData = JSON.parse(cached);
            
            if (Date.now() > cacheData.expiresAt) {
                localStorage.removeItem(CACHE_KEY_PREFIX + imdbId);
                return null;
            }

            return cacheData.ratings;
        } catch (e) {
            console.warn('Failed to read cache for', imdbId, e);
            return null;
        }
    },

    clearAllCache: function() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(CACHE_KEY_PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
            console.log('All movie ratings cache cleared');
        } catch (e) {
            console.warn('Failed to clear cache', e);
        }
    }
};

// Enhanced queue system for OMDB API
class OMDBQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
        this.apiKey = null;
    }

    // Initialize with API key
    async init() {
        this.apiKey = await APIKeyManager.getApiKey();
        if (!this.apiKey) {
            console.error('No OMDB API key available. Please get a free key from omdbapi.com');
            return false;
        }
        return true;
    }

    add(movieElement) {
        this.queue.push(movieElement);
        if (!this.processing) {
            this.processQueue();
        }
    }

    async processQueue() {
        if (this.processing || this.queue.length === 0) return;
        
        // Make sure we have an API key
        if (!this.apiKey) {
            const initialized = await this.init();
            if (!initialized) return;
        }
        
        this.processing = true;
        console.log(`Starting to process ${this.queue.length} movie ratings...`);

        while (this.queue.length > 0) {
            const movieElement = this.queue.shift();
            await this.fetchOMDBRatingsWithDelay(movieElement);
            
            if (this.queue.length > 0) {
                await this.delay(RATE_LIMIT_DELAY);
            }
        }

        this.processing = false;
        console.log('Finished processing all movie ratings');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Parse ratings from OMDB response
    parseRatings(omdbData) {
        const ratings = {
            imdb: null,
            rottenTomatoes: null,
            metacritic: null,
            title: omdbData.Title || 'Unknown',
            year: omdbData.Year || 'Unknown',
            votes: omdbData.imdbVotes || null
        };

        // Parse IMDb rating
        if (omdbData.imdbRating && omdbData.imdbRating !== 'N/A') {
            ratings.imdb = parseFloat(omdbData.imdbRating);
        }

        // Parse ratings array
        if (omdbData.Ratings && Array.isArray(omdbData.Ratings)) {
            omdbData.Ratings.forEach(rating => {
                switch (rating.Source) {
                    case 'Rotten Tomatoes':
                        const rtMatch = rating.Value.match(/(\d+)%/);
                        if (rtMatch) {
                            ratings.rottenTomatoes = parseInt(rtMatch[1]);
                        }
                        break;
                    case 'Metacritic':
                        const metaMatch = rating.Value.match(/(\d+)\/100/);
                        if (metaMatch) {
                            ratings.metacritic = parseInt(metaMatch[1]);
                        }
                        break;
                }
            });
        }

        return ratings;
    }

    // Create HTML for ratings display
    createRatingsHTML(ratings) {
        let html = '<div class="ratings-container">';

        // IMDb Rating
        if (ratings.imdb !== null) {
            html += `
                <div class="rating-item imdb-rating">
                    <div class="rating-source">IMDb</div>
                    <div class="rating-score">${ratings.imdb}/10</div>
                    ${ratings.votes ? `<div class="rating-votes">${this.formatVotes(ratings.votes)}</div>` : ''}
                </div>
            `;
        }

        // Rotten Tomatoes Rating
        if (ratings.rottenTomatoes !== null) {
            const rtClass = ratings.rottenTomatoes >= 60 ? 'fresh' : 'rotten';
            html += `
                <div class="rating-item rt-rating ${rtClass}">
                    <div class="rating-source">🍅 RT</div>
                    <div class="rating-score">${ratings.rottenTomatoes}%</div>
                </div>
            `;
        }

        // Metacritic Rating
        if (ratings.metacritic !== null) {
            let metaClass = 'mixed';
            if (ratings.metacritic >= 75) metaClass = 'positive';
            else if (ratings.metacritic < 50) metaClass = 'negative';
            
            html += `
                <div class="rating-item meta-rating ${metaClass}">
                    <div class="rating-source">Metacritic</div>
                    <div class="rating-score">${ratings.metacritic}/100</div>
                </div>
            `;
        }

        // If no ratings available
        if (ratings.imdb === null && ratings.rottenTomatoes === null && ratings.metacritic === null) {
            html += '<div class="no-ratings">No ratings available</div>';
        }

        html += '</div>';
        return html;
    }

    // Format vote count for display
    formatVotes(votes) {
        if (!votes) return '';
        // Remove commas and convert to number
        const numVotes = parseInt(votes.replace(/,/g, ''));
        if (numVotes >= 1000000) {
            return `${(numVotes / 1000000).toFixed(1)}M votes`;
        } else if (numVotes >= 1000) {
            return `${(numVotes / 1000).toFixed(0)}K votes`;
        }
        return `${numVotes} votes`;
    }

    async fetchOMDBRatingsWithDelay(movieElement) {
        const imdbId = movieElement.dataset.imdbId;
        const ratingsDiv = movieElement.querySelector('.imdb');
        
        if (!imdbId || !ratingsDiv) return;

        console.log(`Fetching ratings for ${imdbId}...`);

        try {
            // OMDB API call
            const url = `${OMDB_API_URL}?i=${imdbId}&apikey=${this.apiKey}`;
            const response = await fetch(url);

            if (response.ok) {
                const data = await response.json();

                if (data.Response === 'True') {
                    const ratings = this.parseRatings(data);
                    
                    // Cache the ratings
                    CacheUtils.setCachedRatings(imdbId, ratings);
                    
                    // Update UI
                    ratingsDiv.innerHTML = this.createRatingsHTML(ratings);
                    console.log(`Successfully fetched ratings for ${imdbId}:`, ratings);
                } else {
                    ratingsDiv.innerHTML = '<div class="ratings-loading">N/A</div>';
                    console.warn(`No data found for ${imdbId}:`, data.Error || 'No data available');
                }
            } else {
                ratingsDiv.innerHTML = '<div class="ratings-loading">Error</div>';
                console.error(`OMDB API error for ${imdbId}: ${response.status}`);
                
                if (response.status === 401) {
                    console.error('Invalid API key. Please check your OMDB API key.');
                    // Clear stored key so user can re-enter
                    localStorage.removeItem('omdb_api_key');
                }
            }
        } catch (error) {
            ratingsDiv.innerHTML = '<div class="ratings-loading">Error</div>';
            console.error(`Error fetching ratings for ${imdbId}:`, error);
        }
    }
}

// Create global queue instance
const omdbQueue = new OMDBQueue();

// Function to display cached ratings or queue for fetching
function loadMovieRatings(movieElement) {
    const imdbId = movieElement.dataset.imdbId;
    const ratingsDiv = movieElement.querySelector('.imdb');
    
    if (!imdbId || !ratingsDiv) {
        if (ratingsDiv) ratingsDiv.innerHTML = '<div class="ratings-loading">N/A</div>';
        return;
    }

    // Check cache first
    const cachedRatings = CacheUtils.getCachedRatings(imdbId);
    
    if (cachedRatings) {
        ratingsDiv.innerHTML = omdbQueue.createRatingsHTML(cachedRatings);
        console.log(`Using cached ratings for ${imdbId}:`, cachedRatings);
    } else {
        ratingsDiv.innerHTML = '<div class="ratings-loading">Loading ratings...</div>';
        omdbQueue.add(movieElement);
    }
}

// Function to load all movie ratings on the page (newest first)
function loadAllMovieRatings() {
    const movieElements = Array.from(document.querySelectorAll('.movie[data-imdb-id]'));
    
    // Sort by movie ID (newest first)
    movieElements.sort((a, b) => {
        const aId = parseInt(a.id) || 0;
        const bId = parseInt(b.id) || 0;
        return bId - aId;
    });

    console.log(`Found ${movieElements.length} movies with IMDB IDs`);

    movieElements.forEach(movieElement => {
        loadMovieRatings(movieElement);
    });
}

// Utility functions
function clearRatingsCache() {
    CacheUtils.clearAllCache();
    location.reload();
}

function showCacheStatus() {
    const movieElements = document.querySelectorAll('.movie[data-imdb-id]');
    let cachedCount = 0;
    let totalCount = movieElements.length;

    movieElements.forEach(movieElement => {
        const imdbId = movieElement.dataset.imdbId;
        if (imdbId && CacheUtils.getCachedRatings(imdbId)) {
            cachedCount++;
        }
    });

    console.log(`Cache Status: ${cachedCount}/${totalCount} ratings cached`);
    return { cached: cachedCount, total: totalCount };
}

// Clear stored API key (useful if you need to change it)
function clearStoredApiKey() {
    localStorage.removeItem('omdb_api_key');
    console.log('Stored API key cleared. Reload page to enter new key.');
}

// Load ratings when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadAllMovieRatings();
    
    setTimeout(() => {
        showCacheStatus();
    }, 1000);
});

// Expose utility functions globally
window.RatingsUtils = {
    clearCache: clearRatingsCache,
    showCacheStatus: showCacheStatus,
    clearApiKey: clearStoredApiKey,
    queue: omdbQueue
};