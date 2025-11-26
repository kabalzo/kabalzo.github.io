# Movie Boys Website 🎬

A personal movie rating and review website for tracking and rating movies watched with friends. Features Nicolas Cage movie tracking, rating calculations, statistics, and integration with OMDB API for movie data.

## 🌟 Features

- **Movie Ratings System**: Track individual and group ratings for watched movies
- **OMDB API Integration**: Automatically fetch IMDb, Rotten Tomatoes, and Metacritic ratings
- **NickHub**: Dedicated tracker for Nicolas Cage movies with progress meter and random picker
- **Tier List Calculator**: Calculate consensus ratings using a letter-grade system (S-F)
- **Statistics Dashboard**: View top/bottom movies, filter by picker, analyze trends
- **SQLite Database**: Efficient local data storage with SQL.js for browser-based queries

## 🌐 Live Site

Visit: [movieboys.us](https://movieboys.us)

## 📋 Project Structure

```
├── index.html              # Main page with movie cards
├── styles.css             # Main stylesheet
├── pages/
│   ├── stats.html         # Statistics dashboard
│   ├── calculator.html    # Tier list calculator
│   ├── nick.html          # Nicolas Cage movie tracker
│   └── about.html         # About page
├── get-ratings.js         # OMDB API integration
├── movieboys-rating.js    # Rating calculation logic
├── api-usage-tracker.js   # API usage monitoring
└── build.js               # Netlify build script
```

## 🎯 Key Technologies

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Database**: SQLite with SQL.js (browser-based)
- **API**: OMDB API for movie ratings
- **Hosting**: Netlify
- **Caching**: LocalStorage for API responses (15-day expiry)

## 📊 Features Breakdown

### Rating System
- Individual member ratings (out of 5)
- Automatic average calculation
- Support for multiple rating formats

### OMDB Integration
- Fetches IMDb, Rotten Tomatoes, Metacritic scores
- Rate limiting (10s between calls)
- Smart caching system
- API usage tracking with email alerts

### Tier Calculator
- Consensus-based grading (S, A, B, C, D, F)
- Handles unanimous/majority votes
- Falls back to weighted averages

### Statistics
- Filter by top/bottom 25
- Filter by individual picker
- Nicolas Cage movie filtering
- Visual rating charts

## 🎨 Responsive Design

Fully responsive with breakpoints for:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

## 👤 Author

Drew Kabala  
[GitHub](https://github.com/kabalzo) | dkabala.2011@gmail.com

---

*Built for fun by movie enthusiasts!* 🍿
