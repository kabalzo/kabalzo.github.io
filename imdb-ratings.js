// imdb-ratings.js - OMDB API version with secure key handling

// OMDB API configuration
const OMDB_API_URL = "https://www.omdbapi.com/";

// Cache configuration
const CACHE_KEY_PREFIX = 'imdb_rating_';
const CACHE_EXPIRY_DAYS = 15;
const RATE_LIMIT_DELAY = 1000; // 1 second between API calls (OMDB is more lenient)

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

// Cache utility functions (unchanged from your original)
const CacheUtils = {
    setCachedRating: function(imdbId, rating) {
        const cacheData = {
            rating: rating,
            timestamp: Date.now(),
            expiresAt: Date.now() + (CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000)
        };
        try {
            localStorage.setItem(CACHE_KEY_PREFIX + imdbId, JSON.stringify(cacheData));
        } catch (e) {
            console.warn('Failed to cache rating for', imdbId, e);
        }
    },

    getCachedRating: function(imdbId) {
        try {
            const cached = localStorage.getItem(CACHE_KEY_PREFIX + imdbId);
            if (!cached) return null;

            const cacheData = JSON.parse(cached);
            
            if (Date.now() > cacheData.expiresAt) {
                localStorage.removeItem(CACHE_KEY_PREFIX + imdbId);
                return null;
            }

            return cacheData.rating;
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
            console.log('All IMDB rating cache cleared');
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
        console.log(`Starting to process ${this.queue.length} OMDB ratings...`);

        while (this.queue.length > 0) {
            const movieElement = this.queue.shift();
            await this.fetchOMDBRatingWithDelay(movieElement);
            
            if (this.queue.length > 0) {
                await this.delay(RATE_LIMIT_DELAY);
            }
        }

        this.processing = false;
        console.log('Finished processing all OMDB ratings');
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async fetchOMDBRatingWithDelay(movieElement) {
        const imdbId = movieElement.dataset.imdbId;
        const imdbDiv = movieElement.querySelector('.imdb');
        
        if (!imdbId || !imdbDiv) return;

        console.log(`Fetching OMDB rating for ${imdbId}...`);

        try {
            // OMDB API call
            const url = `${OMDB_API_URL}?i=${imdbId}&apikey=${this.apiKey}`;
            const response = await fetch(url);

            if (response.ok) {
                const data = await response.json();

                if (data.Response === 'True' && data.imdbRating && data.imdbRating !== 'N/A') {
                    const rating = parseFloat(data.imdbRating);
                    
                    // Cache the rating
                    CacheUtils.setCachedRating(imdbId, rating);
                    
                    // Update UI with additional info
                    imdbDiv.innerHTML = `
                        <div class="imdb-score" title="${data.Title} (${data.Year}) - ${data.imdbVotes} votes">
                            ${rating}/10
                        </div>
                    `;
                    console.log(`Successfully fetched rating for ${imdbId}: ${rating}/10`);
                } else {
                    imdbDiv.innerHTML = '<div class="imdb-loading">N/A</div>';
                    console.warn(`No rating data found for ${imdbId}:`, data.Error || 'No rating available');
                }
            } else {
                imdbDiv.innerHTML = '<div class="imdb-loading">Error</div>';
                console.error(`OMDB API error for ${imdbId}: ${response.status}`);
                
                if (response.status === 401) {
                    console.error('Invalid API key. Please check your OMDB API key.');
                    // Clear stored key so user can re-enter
                    localStorage.removeItem('omdb_api_key');
                }
            }
        } catch (error) {
            imdbDiv.innerHTML = '<div class="imdb-loading">Error</div>';
            console.error(`Error fetching OMDB rating for ${imdbId}:`, error);
        }
    }
}

// Create global queue instance
const omdbQueue = new OMDBQueue();

// Function to display cached rating or queue for fetching
function loadIMDBRating(movieElement) {
    const imdbId = movieElement.dataset.imdbId;
    const imdbDiv = movieElement.querySelector('.imdb');
    
    if (!imdbId || !imdbDiv) {
        if (imdbDiv) imdbDiv.innerHTML = '<div class="imdb-loading">N/A</div>';
        return;
    }

    // Check cache first
    const cachedRating = CacheUtils.getCachedRating(imdbId);
    
    if (cachedRating) {
        imdbDiv.innerHTML = `<div class="imdb-score">${cachedRating}/10</div>`;
        console.log(`Using cached rating for ${imdbId}: ${cachedRating}/10`);
    } else {
        imdbDiv.innerHTML = '<div class="imdb-loading">Queued...</div>';
        omdbQueue.add(movieElement);
    }
}

// Function to load all IMDB ratings on the page (newest first)
function loadAllIMDBRatings() {
    const movieElements = Array.from(document.querySelectorAll('.movie[data-imdb-id]'));
    
    // Sort by movie ID (newest first)
    movieElements.sort((a, b) => {
        const aId = parseInt(a.id) || 0;
        const bId = parseInt(b.id) || 0;
        return bId - aId;
    });

    console.log(`Found ${movieElements.length} movies with IMDB IDs`);

    movieElements.forEach(movieElement => {
        loadIMDBRating(movieElement);
    });
}

// Utility functions
function clearIMDBCache() {
    CacheUtils.clearAllCache();
    location.reload();
}

function showCacheStatus() {
    const movieElements = document.querySelectorAll('.movie[data-imdb-id]');
    let cachedCount = 0;
    let totalCount = movieElements.length;

    movieElements.forEach(movieElement => {
        const imdbId = movieElement.dataset.imdbId;
        if (imdbId && CacheUtils.getCachedRating(imdbId)) {
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
    loadAllIMDBRatings();
    
    setTimeout(() => {
        showCacheStatus();
    }, 1000);
});

// Expose utility functions globally
window.IMDBUtils = {
    clearCache: clearIMDBCache,
    showCacheStatus: showCacheStatus,
    clearApiKey: clearStoredApiKey,
    queue: omdbQueue
};