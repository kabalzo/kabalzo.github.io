// movieboys-rating.js

// Function to extract rating from text like "2/5 - Tyler" or "1.05/5 - Alex"
function extractRating(ratingText) {
    const match = ratingText.match(/^([\d.]+)\/5/);
    return match ? parseFloat(match[1]) : null;
}

// Function to calculate standard deviation
function calculateStandardDeviation(values, mean) {
    if (values.length <= 1) return 0;
    const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
    const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / values.length;
    return Math.sqrt(variance);
}

// Function to calculate consensus score (0-100%)
// Lower standard deviation = higher consensus
function calculateConsensusScore(stdDev) {
    // For a 0-5 rating scale, theoretical max std dev is 2.5 (when votes are perfectly split)
    // But in practice, max realistic std dev is around 2.0
    const maxStdDev = 2.0;
    const normalizedStdDev = Math.min(stdDev / maxStdDev, 1.0);
    return Math.round((1 - normalizedStdDev) * 100);
}

// Function to calculate weighted rating based on consensus
// High consensus = rating stays as-is
// Low consensus = rating is slightly moderated toward middle (2.5)
function calculateWeightedRating(rawRating, consensusScore) {
    const consensusFactor = consensusScore / 100;
    // Apply minimal moderation - only affects low consensus ratings
    const moderationWeight = 0.85 + (0.15 * consensusFactor);
    const middleRating = 2.5;
    return (rawRating * moderationWeight + middleRating * (1 - moderationWeight)).toFixed(2);
}

// Function to calculate average rating and consensus metrics from <li> elements
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

    // Calculate raw average
    const sum = validRatings.reduce((acc, rating) => acc + rating, 0);
    const rawRating = sum / validRatings.length;

    // Calculate consensus metrics
    const stdDev = calculateStandardDeviation(validRatings, rawRating);
    const consensusScore = calculateConsensusScore(stdDev);
    const weightedRating = calculateWeightedRating(rawRating, consensusScore);

    return {
        raw: rawRating.toFixed(2),
        consensus: consensusScore,
        weighted: weightedRating,
        stdDev: stdDev.toFixed(2)
    };
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

    // Calculate the rating metrics
    const ratingMetrics = calculateMovieRating(movieElement);

    if (ratingMetrics !== null) {
        // Raw rating score
        const rawScoreDiv = document.createElement('div');
        rawScoreDiv.className = 'score raw-score';
        rawScoreDiv.textContent = `${ratingMetrics.raw}/5`;

        // Consensus meter
        const consensusDiv = document.createElement('div');
        consensusDiv.className = 'consensus-meter';

        const consensusLabel = document.createElement('div');
        consensusLabel.className = 'consensus-label';
        consensusLabel.textContent = 'Consensus:';

        const consensusBarContainer = document.createElement('div');
        consensusBarContainer.className = 'consensus-bar-container';

        const consensusBar = document.createElement('div');
        consensusBar.className = 'consensus-bar';
        consensusBar.style.width = `${ratingMetrics.consensus}%`;

        // Color coding: green for high consensus, yellow for medium, red for low
        if (ratingMetrics.consensus >= 70) {
            consensusBar.style.backgroundColor = '#4CAF50'; // Green
        } else if (ratingMetrics.consensus >= 40) {
            consensusBar.style.backgroundColor = '#FFC107'; // Yellow/Amber
        } else {
            consensusBar.style.backgroundColor = '#F44336'; // Red
        }

        const consensusPercent = document.createElement('div');
        consensusPercent.className = 'consensus-percent';
        consensusPercent.textContent = `${ratingMetrics.consensus}%`;

        consensusBarContainer.appendChild(consensusBar);
        consensusDiv.appendChild(consensusLabel);
        consensusDiv.appendChild(consensusBarContainer);
        consensusDiv.appendChild(consensusPercent);

        // Weighted rating score
        const weightedScoreDiv = document.createElement('div');
        weightedScoreDiv.className = 'score weighted-score';
        weightedScoreDiv.innerHTML = `<span class="weighted-label">Weighted:</span> ${ratingMetrics.weighted}/5`;

        ratingDiv.appendChild(heading);
        ratingDiv.appendChild(rawScoreDiv);
        ratingDiv.appendChild(consensusDiv);
        ratingDiv.appendChild(weightedScoreDiv);
    } else {
        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'score';
        scoreDiv.textContent = 'No ratings';
        scoreDiv.style.fontSize = '16px';
        ratingDiv.appendChild(heading);
        ratingDiv.appendChild(scoreDiv);
    }

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
    const ratingDiv = movieElement.querySelector('.movieboys-rating');
    if (!ratingDiv) return;

    // Remove old content and rebuild
    const heading = ratingDiv.querySelector('h4');
    ratingDiv.innerHTML = '';
    if (heading) {
        ratingDiv.appendChild(heading);
    }

    const ratingMetrics = calculateMovieRating(movieElement);

    if (ratingMetrics !== null) {
        // Raw rating score
        const rawScoreDiv = document.createElement('div');
        rawScoreDiv.className = 'score raw-score';
        rawScoreDiv.textContent = `${ratingMetrics.raw}/5`;

        // Consensus meter
        const consensusDiv = document.createElement('div');
        consensusDiv.className = 'consensus-meter';

        const consensusLabel = document.createElement('div');
        consensusLabel.className = 'consensus-label';
        consensusLabel.textContent = 'Consensus:';

        const consensusBarContainer = document.createElement('div');
        consensusBarContainer.className = 'consensus-bar-container';

        const consensusBar = document.createElement('div');
        consensusBar.className = 'consensus-bar';
        consensusBar.style.width = `${ratingMetrics.consensus}%`;

        // Color coding
        if (ratingMetrics.consensus >= 70) {
            consensusBar.style.backgroundColor = '#4CAF50';
        } else if (ratingMetrics.consensus >= 40) {
            consensusBar.style.backgroundColor = '#FFC107';
        } else {
            consensusBar.style.backgroundColor = '#F44336';
        }

        const consensusPercent = document.createElement('div');
        consensusPercent.className = 'consensus-percent';
        consensusPercent.textContent = `${ratingMetrics.consensus}%`;

        consensusBarContainer.appendChild(consensusBar);
        consensusDiv.appendChild(consensusLabel);
        consensusDiv.appendChild(consensusBarContainer);
        consensusDiv.appendChild(consensusPercent);

        // Weighted rating score
        const weightedScoreDiv = document.createElement('div');
        weightedScoreDiv.className = 'score weighted-score';
        weightedScoreDiv.innerHTML = `<span class="weighted-label">Weighted:</span> ${ratingMetrics.weighted}/5`;

        ratingDiv.appendChild(rawScoreDiv);
        ratingDiv.appendChild(consensusDiv);
        ratingDiv.appendChild(weightedScoreDiv);
    } else {
        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'score';
        scoreDiv.textContent = 'No ratings';
        scoreDiv.style.fontSize = '16px';
        ratingDiv.appendChild(scoreDiv);
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