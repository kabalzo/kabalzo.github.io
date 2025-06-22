// movieboys-rating.js

// Function to extract rating from text like "2/5 - Tyler" or "1.05/5 - Alex"
function extractRating(ratingText) {
    const match = ratingText.match(/^([\d.]+)\/5/);
    return match ? parseFloat(match[1]) : null;
}

// Function to calculate average rating from <li> elements
function calculateMovieRating(movieElement) {
    // Updated selector to match the new HTML structure
    const ratingsList = movieElement.querySelector('.member-ratings ul');
    if (!ratingsList) {
        console.log('No member-ratings ul found for movie:', movieElement.id);
        return null;
    }
    
    const listItems = ratingsList.querySelectorAll('li');
    let validRatings = [];
    
    listItems.forEach(li => {
        const ratingText = li.textContent.trim();
        const rating = extractRating(ratingText);
        if (rating !== null && !isNaN(rating)) {
            validRatings.push(rating);
        }
    });
    
    if (validRatings.length === 0) {
        console.log('No valid ratings found for movie:', movieElement.id);
        return null;
    }
    
    const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
    return (sum / validRatings.length).toFixed(2);
}

// Function to create and insert the Movie Boys Rating element
function addMovieBoysRating(movieElement) {
    // Check if rating element already exists
    if (movieElement.querySelector('.movieboys-rating')) {
        return;
    }
    
    // Create the rating element
    const ratingDiv = document.createElement('div');
    ratingDiv.className = 'movieboys-rating';
    
    const heading = document.createElement('h4');
    heading.textContent = 'Movie Boys Rating:';
    
    const scoreDiv = document.createElement('div');
    scoreDiv.className = 'score';
    
    // Calculate the rating
    const averageRating = calculateMovieRating(movieElement);
    
    if (averageRating !== null) {
        scoreDiv.textContent = `${averageRating}/5`;
    } else {
        scoreDiv.textContent = 'No ratings';
        scoreDiv.style.fontSize = '16px'; // Make "No ratings" text smaller
    }
    
    ratingDiv.appendChild(heading);
    ratingDiv.appendChild(scoreDiv);
    
    // Insert the rating element after the rating-box (first child)
    const ratingBox = movieElement.querySelector('.rating-box');
    if (ratingBox && ratingBox.nextSibling) {
        movieElement.insertBefore(ratingDiv, ratingBox.nextSibling);
    } else {
        // Fallback: append to the movie element
        movieElement.appendChild(ratingDiv);
    }
}

// Function to update an existing Movie Boys Rating element
function updateMovieBoysRating(movieElement) {
    const ratingElement = movieElement.querySelector('.movieboys-rating .score');
    if (!ratingElement) return;
    
    const averageRating = calculateMovieRating(movieElement);
    
    if (averageRating !== null) {
        ratingElement.textContent = `${averageRating}/5`;
        ratingElement.style.fontSize = '48px'; // Reset to normal size
    } else {
        ratingElement.textContent = 'No ratings';
        ratingElement.style.fontSize = '16px'; // Make "No ratings" text smaller
    }
}

// Main function to be called for each movie
function initMovieBoysRating(movieElementOrId) {
    let movieElement;
    
    if (typeof movieElementOrId === 'string') {
        movieElement = document.getElementById(movieElementOrId);
    } else {
        movieElement = movieElementOrId;
    }
    
    if (!movieElement) {
        console.error('Movie element not found:', movieElementOrId);
        return;
    }
    
    addMovieBoysRating(movieElement);
}

// Function to initialize all movies at once (optional convenience function)
function initAllMovieBoysRatings() {
    document.querySelectorAll('.movie').forEach(movieElement => {
        // Skip empty movie elements (like the one with id="0")
        if (movieElement.querySelector('.member-ratings')) {
            addMovieBoysRating(movieElement);
        }
    });
}