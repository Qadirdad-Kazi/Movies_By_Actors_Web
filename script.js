// API Configuration
const isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

const API_KEY = isProd ? '' : 'e0abdc5977cc3356ff6caa06b496e901';
const BASE_URL = isProd ? '/api/tmdb' : 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/300x450/2f2f2f/ffffff?text=No+Image';

const NEWS_API_KEY = isProd ? 'HIDDEN' : 'b4bb2ccb4fabb43ee78ee68c42d59129';
const NEWS_BASE_URL = isProd ? '/api/news' : 'https://gnews.io/api/v4/search';

// ========================================
// FEATURED ACTORS CONFIGURATION
// ========================================
// Add or remove actor names from this array to customize featured actors
// Just add the actor's name as a string to the array
const FEATURED_ACTORS = [
    'Salman Khan',
    'Ali Fazal',
    'Gurmeet Choudhary',
];

// State Management
let currentActorId = null;
let currentMovieFilter = 'all';
let allMovies = [];
let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
let recentViews = JSON.parse(localStorage.getItem('recentViews')) || [];
let currentActorData = null;
let galleryImages = [];
let currentGalleryIndex = 0;
let infiniteScrollPage = 1;
let isLoadingMore = false;
let allActorsForInfiniteScroll = [];
let currentFeaturedIndex = 0;
let featuredInterval;

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupSearchListener();
    setupNavbarScroll();
    loadTheme();
    updateWatchlistCount();
    setupParallaxScroll();
    setupInfiniteScroll();
    setupFadeInAnimations();
    setupCustomCursor();
});

async function initializeApp() {
    showLoading();
    await loadFeaturedActor(); // Load Ali Fazal as featured
    await loadIndianActors();
    hideLoading();
}

// Loading States
function showLoading() {
    document.getElementById('loading-spinner').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading-spinner').style.display = 'none';
}

// Navbar Scroll Effect
function setupNavbarScroll() {
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

// Menu Toggle for Mobile
function toggleMenu() {
    const navLinks = document.getElementById('nav-links');
    const menuToggle = document.getElementById('menu-toggle');
    const icon = menuToggle.querySelector('i');

    navLinks.classList.toggle('active');

    // Switch icon between bars and times
    if (navLinks.classList.contains('active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
}

function closeMenu() {
    const navLinks = document.getElementById('nav-links');
    const menuToggle = document.getElementById('menu-toggle');
    const icon = menuToggle?.querySelector('i');

    if (navLinks?.classList.contains('active')) {
        navLinks.classList.remove('active');
        if (icon) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        }
    }
}

// Load Popular Actors
async function loadPopularActors() {
    try {
        const response = await fetch(`${BASE_URL}/person/popular?api_key=${API_KEY}&language=en-US&page=1`);
        const data = await response.json();
        displayActors(data.results.slice(0, 12), 'popular-actors');
    } catch (error) {
        console.error('Error loading popular actors:', error);
        showError('popular-actors', 'Failed to load popular actors. Please check your API key.');
    }
}

// Load Trending Actors
async function loadTrendingActors() {
    try {
        const response = await fetch(`${BASE_URL}/trending/person/week?api_key=${API_KEY}`);
        const data = await response.json();
        displayActors(data.results.slice(0, 12), 'trending-actors');
    } catch (error) {
        console.error('Error loading trending actors:', error);
        showError('trending-actors', 'Failed to load trending actors.');
    }
}

// Load Indian Actors
async function loadIndianActors() {
    try {
        // List of Indian actor names to search for
        const indianActors = [
            'Salman Khan',
            'Ali Fazal',
            'Shah Rukh Khan',
            'Aamir Khan',
            'Ranveer Singh',
            'Ranbir Kapoor',
            'Alia Bhatt',
            'Priyanka Chopra',
            'Deepika Padukone',
            'Vicky Kaushal',
            'Ayushmann Khurrana',
            'Rajkummar Rao',
            'Katrina Kaif',
            'Vidya Balan',
            'Hrithik Roshan',
            'Akshay Kumar',
            'Anushka Sharma',
            'Amitabh Bachchan',
            'Saif Ali Khan',
            'Kareena Kapoor',
            'Shahid Kapoor',
            'Varun Dhawan',
            'Sidharth Malhotra',
            'Tiger Shroff',
            'Shraddha Kapoor',
            'Kartik Aaryan',
            'Sara Ali Khan',
            'Janhvi Kapoor',
            'Ananya Panday',
            'Taapsee Pannu',
            'Bhumi Pednekar',
            'Kangana Ranaut',
            'Aishwarya Rai',
            'Madhuri Dixit',
            'Sanjay Dutt',
            'Ajay Devgn',
            'John Abraham',
            'Arjun Kapoor',
            'Nawazuddin Siddiqui',
            'Irrfan Khan',
            'Manoj Bajpayee',
            'Pankaj Tripathi',
            'Farhan Akhtar',
            'Siddharth Roy Kapur',
            'Kriti Sanon',
            'Kiara Advani',
            'Disha Patani',
            'Jacqueline Fernandez',
            'Nora Fatehi',
            'Rajinikanth',
            'Vijay',
            'Suriya',
            'Ajith Kumar',
            'Dhanush',
            'Mahesh Babu',
            'Prabhas',
            'Allu Arjun',
            'Ram Charan',
            'Jr NTR',
            'Vijay Deverakonda',
            'Rashmika Mandanna',
            'Samantha Ruth Prabhu',
            'Nayanthara',
            'Trisha Krishnan'
        ];

        const actorPromises = indianActors.map(name =>
            fetch(`${BASE_URL}/search/person?api_key=${API_KEY}&query=${encodeURIComponent(name)}`)
                .then(res => res.json())
                .then(data => data.results && data.results.length > 0 ? data.results[0] : null)
                .catch(err => {
                    console.error(`Error fetching ${name}:`, err);
                    return null;
                })
        );

        const actors = await Promise.all(actorPromises);
        const validActors = actors.filter(actor => actor !== null);

        if (validActors.length > 0) {
            allActorsCache = validActors; // Cache for filtering
            displayActors(validActors, 'indian-actors');
        } else {
            showError('indian-actors', 'Failed to load Indian actors. Please check your API key.');
        }
    } catch (error) {
        console.error('Error loading Indian actors:', error);
        showError('indian-actors', 'Failed to load Indian actors. Please check your API key.');
    }
}

// Display Actors Grid
function displayActors(actors, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    actors.forEach(actor => {
        const actorCard = createActorCard(actor);
        container.appendChild(actorCard);
    });
}

// Create Actor Card Element
function createActorCard(actor) {
    const card = document.createElement('div');
    card.className = 'actor-card';
    card.style.cursor = 'pointer';
    card.onclick = () => showActorDetail(actor.id);

    const imagePath = actor.profile_path
        ? `${IMAGE_BASE_URL}/w500${actor.profile_path}`
        : PLACEHOLDER_IMAGE;

    card.innerHTML = `
        <img src="${imagePath}" alt="${actor.name}" class="actor-card-image" loading="lazy">
        <div class="actor-card-info">
            <div class="actor-card-name">${actor.name}</div>
            <div class="actor-card-known">${actor.known_for_department || 'Acting'}</div>
            <div class="actor-card-popularity">⭐ ${actor.popularity.toFixed(1)}</div>
        </div>
    `;

    return card;
}

// Search Functionality
function setupSearchListener() {
    const searchInput = document.getElementById('actor-search');
    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        const query = e.target.value.trim();

        if (query.length > 2) {
            searchTimeout = setTimeout(() => {
                searchActorsLive(query);
            }, 300);
        } else {
            hideSuggestions();
        }
    });

    // Close suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box')) {
            hideSuggestions();
        }
    });
}

async function searchActorsLive(query) {
    try {
        const response = await fetch(`${BASE_URL}/search/person?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=1`);
        const data = await response.json();
        displaySuggestions(data.results.slice(0, 5));
    } catch (error) {
        console.error('Error searching actors:', error);
    }
}

function displaySuggestions(actors) {
    const suggestionsContainer = document.getElementById('search-suggestions');

    if (actors.length === 0) {
        hideSuggestions();
        return;
    }

    suggestionsContainer.innerHTML = '';

    actors.forEach(actor => {
        const suggestionItem = document.createElement('div');
        suggestionItem.className = 'suggestion-item';
        suggestionItem.onclick = () => {
            showActorDetail(actor.id);
            hideSuggestions();
            document.getElementById('actor-search').value = '';
        };

        const imagePath = actor.profile_path
            ? `${IMAGE_BASE_URL}/w185${actor.profile_path}`
            : PLACEHOLDER_IMAGE;

        suggestionItem.innerHTML = `
            <img src="${imagePath}" alt="${actor.name}">
            <div class="suggestion-info">
                <div class="suggestion-name">${actor.name}</div>
                <div class="suggestion-meta">
                    <span class="suggestion-known">${actor.known_for_department || 'Acting'}</span>
                    <span class="suggestion-popularity">⭐ ${actor.popularity.toFixed(1)}</span>
                </div>
            </div>
        `;

        suggestionsContainer.appendChild(suggestionItem);
    });

    suggestionsContainer.classList.add('show');
}

function hideSuggestions() {
    const suggestionsContainer = document.getElementById('search-suggestions');
    suggestionsContainer.classList.remove('show');
}

function performSearch() {
    const query = document.getElementById('actor-search').value.trim();
    if (query.length > 2) {
        searchActorsLive(query);
    }
}

// Show Actor Detail Page
async function showActorDetail(actorId) {
    currentActorId = actorId;
    showLoading();

    try {
        // Fetch actor details
        const actorResponse = await fetch(`${BASE_URL}/person/${actorId}?api_key=${API_KEY}&language=en-US`);
        const actor = await actorResponse.json();

        // Fetch actor's movie credits
        const creditsResponse = await fetch(`${BASE_URL}/person/${actorId}/combined_credits?api_key=${API_KEY}&language=en-US`);
        const credits = await creditsResponse.json();

        displayActorDetails(actor, credits);

        // Hide home view and show actor detail
        document.getElementById('home-view').style.display = 'none';
        document.getElementById('featured-section').style.display = 'none';
        document.getElementById('actor-detail').style.display = 'block';

        stopFeaturedAutoPlay();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('Error loading actor details:', error);
        alert('Failed to load actor details. Please try again.');
    } finally {
        hideLoading();
    }
}

// Display Actor Details
function displayActorDetails(actor, credits) {
    // Actor Image
    const actorImage = document.getElementById('actor-image');
    actorImage.src = actor.profile_path
        ? `${IMAGE_BASE_URL}/w500${actor.profile_path}`
        : PLACEHOLDER_IMAGE;
    actorImage.alt = actor.name;

    // Actor Name
    document.getElementById('actor-name').textContent = actor.name;

    // Birthday
    const birthday = actor.birthday ? new Date(actor.birthday).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : 'Unknown';
    document.getElementById('actor-birthday').textContent = `🎂 ${birthday}`;

    // Place of Birth
    const birthplace = actor.place_of_birth || 'Unknown';
    document.getElementById('actor-place').textContent = `📍 ${birthplace}`;

    // Known For
    document.getElementById('known-for').textContent = actor.known_for_department || 'Acting';

    // Popularity
    document.getElementById('popularity').textContent = actor.popularity.toFixed(1);

    // Biography
    const biography = actor.biography || 'No biography available.';
    document.getElementById('actor-biography').textContent = biography;

    // Store all movies and display them
    allMovies = credits.cast.sort((a, b) => {
        const dateA = a.release_date || a.first_air_date || '0';
        const dateB = b.release_date || b.first_air_date || '0';
        return dateB.localeCompare(dateA);
    });

    displayMovies(allMovies);
}

// Display Movies
function displayMovies(movies) {
    const moviesContainer = document.getElementById('actor-movies');
    moviesContainer.innerHTML = '';

    if (movies.length === 0) {
        moviesContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 2rem;">No movies found for this filter.</p>';
        return;
    }

    movies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        moviesContainer.appendChild(movieCard);
    });
}

// Create Movie Card Element
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';

    const posterPath = movie.poster_path
        ? `${IMAGE_BASE_URL}/w342${movie.poster_path}`
        : PLACEHOLDER_IMAGE;

    const title = movie.title || movie.name;
    const year = (movie.release_date || movie.first_air_date || '').split('-')[0];
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    const character = movie.character || movie.job || '';

    card.innerHTML = `
        <img src="${posterPath}" alt="${title}" class="movie-poster" loading="lazy">
        <div class="movie-info">
            <div class="movie-title">${title}</div>
            <div class="movie-meta">
                <span class="movie-year">${year || 'TBA'}</span>
                <span class="movie-rating">⭐ ${rating}</span>
            </div>
            ${character ? `<div class="movie-character">as ${character}</div>` : ''}
        </div>
    `;

    return card;
}

// Filter Movies
function filterMovies(type) {
    currentMovieFilter = type;

    const tabs = document.querySelectorAll('.filter-tab');
    tabs.forEach(tab => {
        tab.classList.toggle('active', tab.textContent.toLowerCase() === type.toLowerCase());
    });

    const moviesGrid = document.getElementById('actor-movies');
    const newsSection = document.getElementById('news-section');

    if (type === 'news') {
        moviesGrid.style.display = 'none';
        newsSection.style.display = 'block';
        if (currentActorData) {
            loadActorNews(currentActorData.name);
        }
    } else {
        newsSection.style.display = 'none';
        moviesGrid.style.display = 'grid';

        let filtered;
        if (type === 'all') {
            filtered = allMovies;
        } else if (type === 'movie') {
            filtered = allMovies.filter(m => m.media_type === 'movie' || !m.first_air_date);
        } else { // type === 'tv'
            filtered = allMovies.filter(m => m.media_type === 'tv' || m.first_air_date);
        }
        displayMovies(filtered);
    }
}

// Show Home View
function showHome() {
    closeMenu();
    document.getElementById('home-view').style.display = 'block';
    document.getElementById('featured-section').style.display = 'block';
    document.getElementById('actor-detail').style.display = 'none';
    document.getElementById('watchlist-view').style.display = 'none';
    document.getElementById('actor-search').value = '';

    startFeaturedAutoPlay();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Search Actors (for nav link)
function searchActors() {
    closeMenu();
    document.getElementById('actor-search').focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Error Display
function showError(containerId, message) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
            <p style="color: var(--primary-color); font-size: 1.2rem; margin-bottom: 1rem;">⚠️ ${message}</p>
            <p style="color: var(--text-secondary);">
                Get your free API key from 
                <a href="https://www.themoviedb.org/settings/api" target="_blank" style="color: var(--primary-color);">
                    The Movie Database
                </a>
            </p>
        </div>
    `;
}

// ==================== NEW FEATURES ====================

// Load Featured Actor (Ali Fazal)
async function loadFeaturedActor() {
    try {
        // Load all featured actors from the configuration array
        const featuredPromises = FEATURED_ACTORS.map(async (name) => {
            const searchResponse = await fetch(`${BASE_URL}/search/person?api_key=${API_KEY}&query=${encodeURIComponent(name)}`);
            const searchData = await searchResponse.json();

            if (searchData.results && searchData.results.length > 0) {
                const actor = searchData.results[0];

                // Get full details
                const detailsResponse = await fetch(`${BASE_URL}/person/${actor.id}?api_key=${API_KEY}`);
                const details = await detailsResponse.json();

                // Get credits
                const creditsResponse = await fetch(`${BASE_URL}/person/${actor.id}/combined_credits?api_key=${API_KEY}`);
                const credits = await creditsResponse.json();

                return { details, credits };
            }
            return null;
        });

        const featuredActors = await Promise.all(featuredPromises);
        const validActors = featuredActors.filter(actor => actor !== null);

        if (validActors.length > 0) {
            displayFeaturedActors(validActors);
        }
    } catch (error) {
        console.error('Error loading featured actor:', error);
    }
}

function displayFeaturedActors(actorsData) {
    const container = document.getElementById('featured-actor');
    const indicatorsContainer = document.getElementById('featured-indicators');

    if (!container || !indicatorsContainer) return;

    container.innerHTML = '';
    indicatorsContainer.innerHTML = '';

    actorsData.forEach(({ details: actor, credits }, index) => {
        const imagePath = actor.profile_path
            ? `${IMAGE_BASE_URL}/w500${actor.profile_path}`
            : PLACEHOLDER_IMAGE;

        const movieCount = credits.cast ? credits.cast.length : 0;
        const avgRating = credits.cast && movieCount > 0
            ? (credits.cast.reduce((sum, m) => sum + (m.vote_average || 0), 0) / movieCount).toFixed(1)
            : 'N/A';

        // Create slide
        const slide = document.createElement('div');
        slide.className = `featured-slide ${index === 0 ? 'active' : ''}`;
        slide.innerHTML = `
            <img src="${imagePath}" alt="${actor.name}" class="featured-actor-image">
            <div class="featured-actor-info">
                <h2>${actor.name}</h2>
                <p class="featured-actor-bio">${(actor.biography || 'Acclaimed actor known for versatile performances.').substring(0, 300)}...</p>
                <div class="featured-stats">
                    <div class="featured-stat">
                        <span class="featured-stat-value">${movieCount}</span>
                        <span class="featured-stat-label">Projects</span>
                    </div>
                    <div class="featured-stat">
                        <span class="featured-stat-value">${avgRating}</span>
                        <span class="featured-stat-label">Avg Rating</span>
                    </div>
                    <div class="featured-stat">
                        <span class="featured-stat-value">${actor.popularity.toFixed(0)}</span>
                        <span class="featured-stat-label">Popularity</span>
                    </div>
                </div>
                <button class="featured-btn" onclick="showActorDetail(${actor.id})">Explore Career →</button>
            </div>
        `;
        container.appendChild(slide);

        // Create indicator
        const indicator = document.createElement('div');
        indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
        indicator.onclick = () => setFeatured(index);
        indicatorsContainer.appendChild(indicator);
    });

    currentFeaturedIndex = 0;
    startFeaturedAutoPlay();
}

function moveFeatured(direction) {
    const slides = document.querySelectorAll('.featured-slide');
    if (slides.length <= 1) return;

    currentFeaturedIndex = (currentFeaturedIndex + direction + slides.length) % slides.length;
    updateFeaturedCarousel();
    restartFeaturedAutoPlay();
}

function setFeatured(index) {
    currentFeaturedIndex = index;
    updateFeaturedCarousel();
    restartFeaturedAutoPlay();
}

function updateFeaturedCarousel() {
    const slides = document.querySelectorAll('.featured-slide');
    const indicators = document.querySelectorAll('.indicator');

    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === currentFeaturedIndex);
    });

    indicators.forEach((indicator, i) => {
        indicator.classList.toggle('active', i === currentFeaturedIndex);
    });
}

function startFeaturedAutoPlay() {
    stopFeaturedAutoPlay();
    featuredInterval = setInterval(() => {
        moveFeatured(1);
    }, 5000);
}

function stopFeaturedAutoPlay() {
    if (featuredInterval) {
        clearInterval(featuredInterval);
    }
}

function restartFeaturedAutoPlay() {
    startFeaturedAutoPlay();
}

// Theme Toggle
function toggleTheme() {
    const body = document.body;
    const icon = document.getElementById('theme-icon');

    body.classList.toggle('light-theme');

    if (body.classList.contains('light-theme')) {
        icon.textContent = '☀️';
        localStorage.setItem('theme', 'light');
    } else {
        icon.textContent = '🌙';
        localStorage.setItem('theme', 'dark');
    }
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const body = document.body;
    const icon = document.getElementById('theme-icon');

    if (savedTheme === 'light') {
        body.classList.add('light-theme');
        icon.textContent = '☀️';
    } else {
        icon.textContent = '🌙';
    }
}

// Watchlist Functions
function updateWatchlistCount() {
    document.getElementById('watchlist-count').innerHTML = `❤️ Watchlist (${watchlist.length})`;
}

function toggleWatchlist(actorId) {
    const index = watchlist.findIndex(id => id === actorId);
    const btn = document.getElementById('watchlist-btn');
    const icon = document.getElementById('watchlist-icon');
    const text = document.getElementById('watchlist-text');

    if (index > -1) {
        watchlist.splice(index, 1);
        btn.classList.remove('active');
        icon.textContent = '🤍';
        text.textContent = 'Add to Watchlist';
    } else {
        watchlist.push(actorId);
        btn.classList.add('active');
        icon.textContent = '❤️';
        text.textContent = 'In Watchlist';
    }

    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    updateWatchlistCount();
}

function updateWatchlistButton(actorId) {
    const btn = document.getElementById('watchlist-btn');
    const icon = document.getElementById('watchlist-icon');
    const text = document.getElementById('watchlist-text');

    if (watchlist.includes(actorId)) {
        btn.classList.add('active');
        icon.textContent = '❤️';
        text.textContent = 'In Watchlist';
    } else {
        btn.classList.remove('active');
        icon.textContent = '🤍';
        text.textContent = 'Add to Watchlist';
    }
}

async function showWatchlist() {
    closeMenu();
    if (watchlist.length === 0) {
        document.getElementById('empty-watchlist').style.display = 'block';
        document.getElementById('watchlist-actors').innerHTML = '';
    } else {
        document.getElementById('empty-watchlist').style.display = 'none';
        showLoading();

        const actorPromises = watchlist.map(id =>
            fetch(`${BASE_URL}/person/${id}?api_key=${API_KEY}`)
                .then(res => res.json())
                .catch(() => null)
        );

        const actors = await Promise.all(actorPromises);
        const validActors = actors.filter(actor => actor !== null);
        displayActors(validActors, 'watchlist-actors');
        hideLoading();
    }

    document.getElementById('home-view').style.display = 'none';
    document.getElementById('actor-detail').style.display = 'none';
    document.getElementById('featured-section').style.display = 'none';
    document.getElementById('watchlist-view').style.display = 'block';

    stopFeaturedAutoPlay();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Share Function
function shareActor() {
    if (!currentActorData) return;

    const shareData = {
        title: `${currentActorData.name} - Movie Nest`,
        text: `Check out ${currentActorData.name}'s filmography on Movie Nest!`,
        url: window.location.href
    };

    if (navigator.share) {
        navigator.share(shareData).catch(err => console.log('Error sharing:', err));
    } else {
        // Fallback - copy to clipboard
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    }
}

// Movie Detail Modal
async function showMovieDetail(movieId, mediaType = 'movie') {
    showLoading();

    try {
        // Fetch movie details
        const response = await fetch(`${BASE_URL}/${mediaType}/${movieId}?api_key=${API_KEY}&append_to_response=videos,credits`);
        const movie = await response.json();

        displayMovieDetail(movie, mediaType);
        document.getElementById('movie-modal').style.display = 'flex';
    } catch (error) {
        console.error('Error loading movie details:', error);
        alert('Failed to load movie details');
    } finally {
        hideLoading();
    }
}

function displayMovieDetail(movie, mediaType) {
    const container = document.getElementById('movie-detail-content');

    const title = movie.title || movie.name;
    const backdropPath = movie.backdrop_path
        ? `${IMAGE_BASE_URL}/original${movie.backdrop_path}`
        : PLACEHOLDER_IMAGE;

    const releaseDate = (movie.release_date || movie.first_air_date || '').split('-')[0];
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    const runtime = movie.runtime ? `${movie.runtime} min` : (movie.episode_run_time ? `${movie.episode_run_time[0]} min` : 'N/A');

    // Get trailer
    const trailer = movie.videos && movie.videos.results ?
        movie.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube') : null;

    // Genres
    const genres = movie.genres ? movie.genres.map(g =>
        `<span class="genre-tag">${g.name}</span>`
    ).join('') : '';

    // Cast
    const cast = movie.credits && movie.credits.cast ?
        movie.credits.cast.slice(0, 6).map(c => {
            const photo = c.profile_path ? `${IMAGE_BASE_URL}/w185${c.profile_path}` : PLACEHOLDER_IMAGE;
            return `
                <div class="cast-member">
                    <img src="${photo}" alt="${c.name}" class="cast-photo">
                    <div class="cast-name">${c.name}</div>
                    <div class="cast-character">${c.character}</div>
                </div>
            `;
        }).join('') : '';

    container.innerHTML = `
        <div class="movie-detail-header">
            <img src="${backdropPath}" alt="${title}" class="movie-backdrop">
            <div class="movie-detail-overlay">
                <h2 class="movie-detail-title">${title}</h2>
                <div class="movie-detail-meta">
                    <span>⭐ ${rating}</span>
                    <span>📅 ${releaseDate}</span>
                    <span>⏱️ ${runtime}</span>
                </div>
            </div>
        </div>
        
        <div class="movie-detail-info">
            ${genres ? `<div class="movie-genres">${genres}</div>` : ''}
            
            <h3>Overview</h3>
            <p class="movie-detail-overview">${movie.overview || 'No overview available.'}</p>
            
            ${trailer ? `
                <div class="movie-trailer">
                    <h3>Trailer</h3>
                    <iframe src="https://www.youtube.com/embed/${trailer.key}" allowfullscreen></iframe>
                </div>
            ` : ''}
            
            ${cast ? `
                <h3>Cast</h3>
                <div class="movie-cast">${cast}</div>
            ` : ''}
        </div>
    `;
}

function closeMovieModal() {
    document.getElementById('movie-modal').style.display = 'none';
}

// Update movie card creation to include click handler
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';

    const posterPath = movie.poster_path
        ? `${IMAGE_BASE_URL}/w342${movie.poster_path}`
        : PLACEHOLDER_IMAGE;

    const title = movie.title || movie.name;
    const year = (movie.release_date || movie.first_air_date || '').split('-')[0];
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    const character = movie.character || movie.job || '';
    const mediaType = movie.media_type || (movie.title ? 'movie' : 'tv');

    // Add click handler for movie details
    card.onclick = () => showMovieDetail(movie.id, mediaType);

    card.innerHTML = `
        <img src="${posterPath}" alt="${title}" class="movie-poster" loading="lazy">
        <div class="movie-info">
            <div class="movie-title">${title}</div>
            <div class="movie-meta">
                <span class="movie-year">${year || 'TBA'}</span>
                <span class="movie-rating">⭐ ${rating}</span>
            </div>
            ${character ? `<div class="movie-character">as ${character}</div>` : ''}
        </div>
    `;

    return card;
}

// Filter Functions
let allActorsCache = [];

function applyFilters() {
    const genre = document.getElementById('genre-filter').value;
    const language = document.getElementById('language-filter').value;
    const sort = document.getElementById('sort-filter').value;

    let filteredActors = [...allActorsCache];

    // Language filter (basic implementation - filter by known actors from that industry)
    if (language !== 'all') {
        const languageMap = {
            'hindi': ['Shah Rukh Khan', 'Ranveer Singh', 'Ranbir Kapoor', 'Alia Bhatt', 'Deepika Padukone', 'Katrina Kaif', 'Ayushmann Khurrana', 'Rajkummar Rao', 'Vidya Balan', 'Ali Fazal'],
            'tamil': ['Rajinikanth', 'Vijay', 'Suriya', 'Ajith Kumar'],
            'telugu': ['Mahesh Babu', 'Prabhas', 'Allu Arjun'],
            'english': ['Priyanka Chopra', 'Ali Fazal', 'Anushka Sharma']
        };

        if (languageMap[language]) {
            filteredActors = filteredActors.filter(actor =>
                languageMap[language].some(name => actor.name.includes(name))
            );
        }
    }

    // Sort
    if (sort === 'name') {
        filteredActors.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'popularity') {
        filteredActors.sort((a, b) => b.popularity - a.popularity);
    }

    // Display filtered actors
    displayActors(filteredActors, 'indian-actors');
}

// Enhanced Actor Detail Display
async function showActorDetail(actorId) {
    currentActorId = actorId;
    showLoading();

    try {
        // Fetch actor details
        const actorResponse = await fetch(`${BASE_URL}/person/${actorId}?api_key=${API_KEY}&language=en-US`);
        const actor = await actorResponse.json();
        currentActorData = actor;

        // Fetch actor's movie credits
        const creditsResponse = await fetch(`${BASE_URL}/person/${actorId}/combined_credits?api_key=${API_KEY}&language=en-US`);
        const credits = await creditsResponse.json();

        // Fetch external IDs for social media
        const externalResponse = await fetch(`${BASE_URL}/person/${actorId}/external_ids?api_key=${API_KEY}`);
        const externalIds = await externalResponse.json();

        displayActorDetails(actor, credits, externalIds);
        updateWatchlistButton(actorId);

        // Hide home view and show actor detail
        document.getElementById('home-view').style.display = 'none';
        document.getElementById('watchlist-view').style.display = 'none';
        document.getElementById('featured-section').style.display = 'none';
        document.getElementById('actor-detail').style.display = 'block';

        // Add to recent views
        addToRecentViews(actorId);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
        console.error('Error loading actor details:', error);
        alert('Failed to load actor details. Please try again.');
    } finally {
        hideLoading();
    }
}

function displayActorDetails(actor, credits, externalIds) {
    // Scroll Lock
    document.body.style.overflow = 'hidden';

    // Actor Image
    const actorImage = document.getElementById('actor-image');
    const imageUrl = actor.profile_path
        ? `${IMAGE_BASE_URL}/w500${actor.profile_path}`
        : PLACEHOLDER_IMAGE;
    actorImage.src = imageUrl;
    actorImage.alt = actor.name;

    // Set Parallax Background
    const parallaxBg = document.getElementById('actor-parallax-bg');
    if (parallaxBg) {
        parallaxBg.style.backgroundImage = `url(${imageUrl})`;
        parallaxBg.style.display = 'block';
    }

    // Actor Name
    document.getElementById('actor-name').textContent = actor.name;

    // Social Media Links
    const socialLinksContainer = document.getElementById('social-links');
    let socialHTML = '';

    if (externalIds.instagram_id) {
        socialHTML += `<a href="https://instagram.com/${externalIds.instagram_id}" target="_blank" class="social-link instagram" title="Instagram"><i class="fa-brands fa-instagram"></i></a>`;
    }
    if (externalIds.twitter_id) {
        socialHTML += `<a href="https://twitter.com/${externalIds.twitter_id}" target="_blank" class="social-link twitter" title="Twitter"><i class="fa-brands fa-x-twitter"></i></a>`;
    }
    if (externalIds.facebook_id) {
        socialHTML += `<a href="https://facebook.com/${externalIds.facebook_id}" target="_blank" class="social-link facebook" title="Facebook"><i class="fa-brands fa-facebook"></i></a>`;
    }
    if (externalIds.imdb_id) {
        socialHTML += `<a href="https://www.imdb.com/name/${externalIds.imdb_id}" target="_blank" class="social-link imdb" title="IMDb"><i class="fa-brands fa-imdb"></i></a>`;
    }

    if (socialHTML) {
        socialLinksContainer.innerHTML = socialHTML;
        socialLinksContainer.style.display = 'flex';
    } else {
        socialLinksContainer.style.display = 'none';
    }

    // Birthday
    const birthday = actor.birthday ? new Date(actor.birthday).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : 'Unknown';
    document.getElementById('actor-birthday').textContent = `🎂 ${birthday}`;

    // Place of Birth
    const birthplace = actor.place_of_birth || 'Unknown';
    document.getElementById('actor-place').textContent = `📍 ${birthplace}`;

    // Known For
    document.getElementById('known-for').textContent = actor.known_for_department || 'Acting';

    // Popularity
    document.getElementById('popularity').textContent = actor.popularity.toFixed(1);

    // Total Movies
    document.getElementById('total-movies').textContent = credits.cast ? credits.cast.length : 0;

    // Biography
    const biography = actor.biography || 'No biography available.';
    document.getElementById('actor-biography').textContent = biography;

    // Store all movies and remove duplicates based on ID
    const uniqueMoviesMap = new Map();

    if (credits.cast) {
        credits.cast.forEach(movie => {
            // Use movie/show ID as unique identifier
            if (!uniqueMoviesMap.has(movie.id)) {
                uniqueMoviesMap.set(movie.id, movie);
            }
        });
    }

    // Convert Map back to array and sort by date
    allMovies = Array.from(uniqueMoviesMap.values()).sort((a, b) => {
        const dateA = a.release_date || a.first_air_date || '0';
        const dateB = b.release_date || b.first_air_date || '0';
        return dateB.localeCompare(dateA);
    });

    // Update total movies count with unique count
    document.getElementById('total-movies').textContent = allMovies.length;

    displayMovies(allMovies);

    // News is now fetched manually via the "News" tab
}

function addToRecentViews(actorId) {
    // Remove if already exists
    recentViews = recentViews.filter(id => id !== actorId);
    // Add to beginning
    recentViews.unshift(actorId);
    // Keep only last 10
    recentViews = recentViews.slice(0, 10);
    // Save
    localStorage.setItem('recentViews', JSON.stringify(recentViews));
}

// Update showHome
function showHome() {
    closeActorDetail();
    document.getElementById('home-view').style.display = 'block';
    document.getElementById('watchlist-view').style.display = 'none';
    document.getElementById('featured-section').style.display = 'block';
    document.getElementById('actor-search').value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== NEW VISUAL FEATURES ====================

// Micro-Interactions: Parallax & Cursor
function setupCustomCursor() {
    const cursor = document.querySelector('.custom-cursor');
    if (!cursor) return;

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    document.addEventListener('mousedown', () => cursor.classList.add('active'));
    document.addEventListener('mouseup', () => cursor.classList.remove('active'));

    // Handle interactive elements
    const hoverables = 'button, a, .actor-card, .movie-card, input, select, .indicator';
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(hoverables)) {
            cursor.classList.add('active');
        }
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(hoverables)) {
            cursor.classList.remove('active');
        }
    });
}

function setupParallaxScroll() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;

        // 1. Home parallax
        const homeParallax = document.querySelectorAll('.featured-section, .actors-section');
        homeParallax.forEach((element, index) => {
            const speed = 0.5;
            const yPos = -(scrolled * speed * (index + 1) * 0.1);
            element.style.transform = `translateY(${yPos}px)`;
        });

        // 2. Actor Profile Parallax Background
        const actorDetail = document.getElementById('actor-detail');
        const parallaxBg = document.getElementById('actor-parallax-bg');

        if (actorDetail && actorDetail.style.display !== 'none' && parallaxBg) {
            const speed = 0.3;
            const yPos = scrolled * speed;
            parallaxBg.style.transform = `translateY(${yPos}px)`;
        }
    });
}

// Fade In Animations
function setupFadeInAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    // Observe all actor cards
    setTimeout(() => {
        document.querySelectorAll('.actor-card, .movie-card').forEach(card => {
            card.classList.add('fade-in');
            observer.observe(card);
        });
    }, 100);
}

// Loading Skeletons
function showSkeletons(containerId, count = 12) {
    const container = document.getElementById(containerId);
    const template = document.getElementById('actor-skeleton');

    if (!template) return;

    container.innerHTML = '';

    for (let i = 0; i < count; i++) {
        const clone = template.content.cloneNode(true);
        container.appendChild(clone);
    }
}

// Infinite Scroll
function setupInfiniteScroll() {
    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && allActorsForInfiniteScroll.length > 0) {
            loadMoreActors();
        }
    }, {
        rootMargin: '200px'
    });

    const sentinel = document.createElement('div');
    sentinel.className = 'infinite-scroll-loader';
    sentinel.innerHTML = '<div class="spinner"></div>';
    sentinel.id = 'scroll-sentinel';

    const actorsGrid = document.getElementById('indian-actors');
    if (actorsGrid) {
        actorsGrid.parentElement.appendChild(sentinel);
        observer.observe(sentinel);
    }
}

async function loadMoreActors() {
    if (isLoadingMore || allActorsCache.length === 0) return;

    isLoadingMore = true;
    const sentinel = document.getElementById('scroll-sentinel');
    if (sentinel) sentinel.style.display = 'flex';

    // Simulate loading more actors (in real app, you'd fetch more from API)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo, we'll just shuffle and show same actors
    const moreActors = [...allActorsCache].sort(() => Math.random() - 0.5).slice(0, 12);
    const container = document.getElementById('indian-actors');

    moreActors.forEach(actor => {
        const actorCard = createActorCard(actor);
        container.appendChild(actorCard);
    });

    setupFadeInAnimations();

    if (sentinel) sentinel.style.display = 'none';
    isLoadingMore = false;
}

// Image Gallery
async function loadActorGallery(actorId) {
    try {
        const response = await fetch(`${BASE_URL}/person/${actorId}/images?api_key=${API_KEY}`);
        const data = await response.json();

        galleryImages = data.profiles || [];
        displayGallery(galleryImages);
    } catch (error) {
        console.error('Error loading gallery:', error);
    }
}

function displayGallery(images) {
    const container = document.getElementById('actor-gallery');
    if (!container) return;

    if (images.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); padding: 2rem;">No images available</p>';
        return;
    }

    container.innerHTML = '';

    images.slice(0, 12).forEach((image, index) => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.onclick = () => openGallery(index);

        const imgPath = `${IMAGE_BASE_URL}/w342${image.file_path}`;
        item.innerHTML = `<img src="${imgPath}" alt="Actor Photo ${index + 1}" loading="lazy">`;

        container.appendChild(item);
    });
}

function openGallery(index) {
    currentGalleryIndex = index;
    updateGalleryImage();
    document.getElementById('gallery-modal').style.display = 'flex';
}

function closeGallery() {
    document.getElementById('gallery-modal').style.display = 'none';
}

function changeGalleryImage(direction) {
    currentGalleryIndex += direction;

    if (currentGalleryIndex < 0) {
        currentGalleryIndex = galleryImages.length - 1;
    } else if (currentGalleryIndex >= galleryImages.length) {
        currentGalleryIndex = 0;
    }

    updateGalleryImage();
}

function updateGalleryImage() {
    const image = galleryImages[currentGalleryIndex];
    if (!image) return;

    const imgPath = `${IMAGE_BASE_URL}/original${image.file_path}`;
    document.getElementById('gallery-image').src = imgPath;
    document.getElementById('gallery-counter').textContent = `${currentGalleryIndex + 1} / ${galleryImages.length}`;
}

// Keyboard navigation for gallery
document.addEventListener('keydown', (e) => {
    const galleryModal = document.getElementById('gallery-modal');
    if (galleryModal.style.display === 'flex') {
        if (e.key === 'ArrowLeft') changeGalleryImage(-1);
        if (e.key === 'ArrowRight') changeGalleryImage(1);
        if (e.key === 'Escape') closeGallery();
    }

    const movieModal = document.getElementById('movie-modal');
    if (movieModal.style.display === 'flex' && e.key === 'Escape') {
        closeMovieModal();
    }
});

// Picture-in-Picture Mode
function enablePiP(videoUrl) {
    const pipContainer = document.getElementById('pip-container');
    const pipIframe = document.getElementById('pip-iframe');

    pipIframe.src = videoUrl;
    pipContainer.style.display = 'block';

    // Make PiP draggable
    makeDraggable(pipContainer);
}

function closePiP() {
    const pipContainer = document.getElementById('pip-container');
    const pipIframe = document.getElementById('pip-iframe');

    pipIframe.src = '';
    pipContainer.style.display = 'none';
}

function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        if (e.target.tagName === 'IFRAME' || e.target.classList.contains('pip-close')) return;

        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
        element.style.bottom = 'auto';
        element.style.right = 'auto';
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

// Enhanced Movie Detail with PiP Option
async function showMovieDetail(movieId, mediaType = 'movie') {
    showLoading();

    try {
        const response = await fetch(`${BASE_URL}/${mediaType}/${movieId}?api_key=${API_KEY}&append_to_response=videos,credits`);
        const movie = await response.json();

        displayMovieDetail(movie, mediaType);
        document.getElementById('movie-modal').style.display = 'flex';
    } catch (error) {
        console.error('Error loading movie details:', error);
        alert('Failed to load movie details');
    } finally {
        hideLoading();
    }
}

function displayMovieDetail(movie, mediaType) {
    const container = document.getElementById('movie-detail-content');

    const title = movie.title || movie.name;
    const backdropPath = movie.backdrop_path
        ? `${IMAGE_BASE_URL}/original${movie.backdrop_path}`
        : PLACEHOLDER_IMAGE;

    const releaseDate = (movie.release_date || movie.first_air_date || '').split('-')[0];
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    const runtime = movie.runtime ? `${movie.runtime} min` : (movie.episode_run_time ? `${movie.episode_run_time[0]} min` : 'N/A');

    const trailer = movie.videos && movie.videos.results ?
        movie.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube') : null;

    const genres = movie.genres ? movie.genres.map(g =>
        `<span class="genre-tag">${g.name}</span>`
    ).join('') : '';

    const cast = movie.credits && movie.credits.cast ?
        movie.credits.cast.slice(0, 6).map(c => {
            const photo = c.profile_path ? `${IMAGE_BASE_URL}/w185${c.profile_path}` : PLACEHOLDER_IMAGE;
            return `
                <div class="cast-member">
                    <img src="${photo}" alt="${c.name}" class="cast-photo">
                    <div class="cast-name">${c.name}</div>
                    <div class="cast-character">${c.character}</div>
                </div>
            `;
        }).join('') : '';

    const pipButton = trailer ? `
        <button onclick="enablePiP('https://www.youtube.com/embed/${trailer.key}'); closeMovieModal();" 
                style="padding: 0.8rem 1.5rem; background: var(--primary-color); border: none; 
                       border-radius: 25px; color: white; font-weight: 600; cursor: pointer; 
                       margin-top: 1rem; transition: all 0.3s ease;">
            📺 Watch in Picture-in-Picture
        </button>
    ` : '';

    container.innerHTML = `
        <div class="movie-detail-header">
            <img src="${backdropPath}" alt="${title}" class="movie-backdrop">
            <div class="movie-detail-overlay">
                <h2 class="movie-detail-title">${title}</h2>
                <div class="movie-detail-meta">
                    <span>⭐ ${rating}</span>
                    <span>📅 ${releaseDate}</span>
                    <span>⏱️ ${runtime}</span>
                </div>
            </div>
        </div>
        
        <div class="movie-detail-info">
            ${genres ? `<div class="movie-genres">${genres}</div>` : ''}
            
            <h3>Overview</h3>
            <p class="movie-detail-overview">${movie.overview || 'No overview available.'}</p>
            
            ${trailer ? `
                <div class="movie-trailer">
                    <h3>Trailer</h3>
                    <iframe src="https://www.youtube.com/embed/${trailer.key}" allowfullscreen></iframe>
                    ${pipButton}
                </div>
            ` : ''}
            
            ${cast ? `
                <h3>Cast</h3>
                <div class="movie-cast">${cast}</div>
            ` : ''}
        </div>
    `;
}

// Update actor detail to show as modal
async function showActorDetail(actorId) {
    currentActorId = actorId;
    showLoading();

    try {
        const actorResponse = await fetch(`${BASE_URL}/person/${actorId}?api_key=${API_KEY}&language=en-US`);
        const actor = await actorResponse.json();
        currentActorData = actor;

        const creditsResponse = await fetch(`${BASE_URL}/person/${actorId}/combined_credits?api_key=${API_KEY}&language=en-US`);
        const credits = await creditsResponse.json();

        const externalResponse = await fetch(`${BASE_URL}/person/${actorId}/external_ids?api_key=${API_KEY}`);
        const externalIds = await externalResponse.json();

        displayActorDetails(actor, credits, externalIds);
        updateWatchlistButton(actorId);

        // Load gallery
        await loadActorGallery(actorId);

        const detailModal = document.getElementById('actor-detail');
        detailModal.style.display = 'block';
        detailModal.classList.add('show');

        addToRecentViews(actorId);

        // Reset modal scroll
        const detailContainer = detailModal.querySelector('.container');
        if (detailContainer) detailContainer.scrollTop = 0;

    } catch (error) {
        console.error('Error loading actor details:', error);
        alert('Failed to load actor details. Please try again.');
    } finally {
        hideLoading();
    }
}

function closeActorDetail() {
    const detailModal = document.getElementById('actor-detail');
    detailModal.style.display = 'none';
    detailModal.classList.remove('show');
    document.body.style.overflow = 'auto'; // Re-enable scroll

    // Auto-remove news cache for freshness on next open
    const newsContainer = document.getElementById('actor-news');
    if (newsContainer) {
        newsContainer.removeAttribute('data-loaded-for');
        newsContainer.removeAttribute('data-last-fetch');
        newsContainer.innerHTML = '';
    }

    // Stop any playing trailers
    const trailers = detailModal.querySelectorAll('iframe');
    trailers.forEach(t => t.src = t.src);
}

// Enhanced display actors with skeletons
async function loadIndianActors() {
    try {
        showSkeletons('indian-actors', 12);

        const indianActors = [
            'Salman Khan',
            'Ali Fazal',
            'Shah Rukh Khan',
            'Aamir Khan',
            'Ranveer Singh',
            'Ranbir Kapoor',
            'Alia Bhatt',
            'Priyanka Chopra',
            'Deepika Padukone',
            'Vicky Kaushal',
            'Ayushmann Khurrana',
            'Rajkummar Rao',
            'Katrina Kaif',
            'Vidya Balan',
            'Hrithik Roshan',
            'Akshay Kumar',
            'Anushka Sharma',
            'Amitabh Bachchan',
            'Saif Ali Khan',
            'Kareena Kapoor',
            'Shahid Kapoor',
            'Varun Dhawan',
            'Sidharth Malhotra',
            'Tiger Shroff',
            'Shraddha Kapoor',
            'Kartik Aaryan',
            'Sara Ali Khan',
            'Janhvi Kapoor',
            'Ananya Panday',
            'Taapsee Pannu',
            'Bhumi Pednekar',
            'Kangana Ranaut',
            'Aishwarya Rai',
            'Madhuri Dixit',
            'Sanjay Dutt',
            'Ajay Devgn',
            'John Abraham',
            'Arjun Kapoor',
            'Nawazuddin Siddiqui',
            'Irrfan Khan',
            'Manoj Bajpayee',
            'Pankaj Tripathi',
            'Farhan Akhtar',
            'Siddharth Roy Kapur',
            'Kriti Sanon',
            'Kiara Advani',
            'Disha Patani',
            'Jacqueline Fernandez',
            'Nora Fatehi',
            'Rajinikanth',
            'Vijay',
            'Suriya',
            'Ajith Kumar',
            'Dhanush',
            'Mahesh Babu',
            'Prabhas',
            'Allu Arjun',
            'Ram Charan',
            'Jr NTR',
            'Vijay Deverakonda',
            'Rashmika Mandanna',
            'Samantha Ruth Prabhu',
            'Nayanthara',
            'Trisha Krishnan'
        ];

        const actorPromises = indianActors.map(name =>
            fetch(`${BASE_URL}/search/person?api_key=${API_KEY}&query=${encodeURIComponent(name)}`)
                .then(res => res.json())
                .then(data => {
                    if (data.error) {
                        console.error(`Proxy Error for ${name}:`, data.error, data.details || '');
                        return null;
                    }
                    return data.results && data.results.length > 0 ? data.results[0] : null;
                })
                .catch(err => {
                    console.error(`Network Error fetching ${name}:`, err);
                    return null;
                })
        );

        const actors = await Promise.all(actorPromises);
        const validActors = actors.filter(actor => actor !== null);

        if (validActors.length > 0) {
            allActorsCache = validActors;
            allActorsForInfiniteScroll = validActors;
            displayActors(validActors, 'indian-actors');
            setupFadeInAnimations();
        } else {
            showError('indian-actors', 'Failed to load Indian actors. <b>Please ensure TMDB_API_KEY is set in your Netlify Environment Variables.</b>');
        }
    } catch (error) {
        console.error('Error loading Indian actors:', error);
        showError('indian-actors', 'Failed to load Indian actors. Please check your connection or API configuration.');
    }
}

// ==================== NEWS SECTION LOGIC ====================

let isFetchingNews = false;

async function loadActorNews(actorName) {
    const newsContainer = document.getElementById('actor-news');
    if (!newsContainer) return;

    // Check cache: Must be same actor AND fetched within the last hour
    const lastFetch = newsContainer.getAttribute('data-last-fetch');
    const isSameActor = newsContainer.getAttribute('data-loaded-for') === actorName;
    const isFresh = lastFetch && (Date.now() - parseInt(lastFetch) < 3600000); // 1 hour

    if (isSameActor && isFresh) return;
    if (isFetchingNews) return;

    isFetchingNews = true;
    newsContainer.innerHTML = '';

    if (!NEWS_API_KEY) {
        newsContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 2rem;">Please add your GNews.io API key in script.js to see live headlines for ${actorName}.</p>`;
        isFetchingNews = false;
        return;
    }

    // Show skeletons while loading
    for (let i = 0; i < 3; i++) {
        newsContainer.innerHTML += `<div class="news-card skeleton" style="height: 350px;"></div>`;
    }

    try {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7); // Show news from last 7 days for "Top News"

        const query = encodeURIComponent(`"${actorName}"`);
        const url = `${NEWS_BASE_URL}?q=${query}&lang=en&sortby=publishedAt&max=10&apikey=${NEWS_API_KEY}`;
        const response = await fetch(url);

        if (!response.ok) throw new Error('API request failed');

        const data = await response.json();

        // Deduplication and Filtering
        const seenTitles = new Set();
        const news = (data.articles || [])
            .filter(article => {
                const articleDate = new Date(article.publishedAt);
                const titleKey = article.title.toLowerCase().trim();

                // Remove if older than 7 days OR a duplicate title or exact URL
                if (articleDate < sevenDaysAgo || seenTitles.has(titleKey)) {
                    return false;
                }

                seenTitles.add(titleKey);
                return true;
            })
            .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
            .map(art => ({
                title: art.title,
                source: art.source.name,
                date: new Date(art.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                image: art.image || "https://images.unsplash.com/photo-1485090916723-1bdb7f0980bd?w=400&q=80",
                url: art.url
            }));

        newsContainer.innerHTML = '';
        if (news.length === 0) {
            newsContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 2rem;">No breaking news in the last 7 days for ${actorName}. Check back soon!</p>`;
            newsContainer.setAttribute('data-loaded-for', actorName);
            return;
        }

        news.forEach(item => {
            const card = document.createElement('a');
            card.href = item.url || "#";
            card.target = "_blank";
            card.className = "news-card fade-in";
            card.innerHTML = `
                <img src="${item.image}" class="news-image" alt="news">
                <div class="news-content">
                    <span class="news-source">${item.source}</span>
                    <h3 class="news-title">${item.title}</h3>
                    <div class="news-footer" style="display:flex; justify-content:space-between; align-items:center; margin-top:auto;">
                        <span class="news-date">📅 ${item.date}</span>
                        <span style="font-size:0.75rem; background:rgba(229,9,20,0.1); color:var(--primary-color); padding:4px 12px; border-radius:12px; font-weight:700; border:1px solid rgba(229,9,20,0.2);">LATEST</span>
                    </div>
                </div>
            `;
            newsContainer.appendChild(card);
        });

        newsContainer.setAttribute('data-loaded-for', actorName);
        newsContainer.setAttribute('data-last-fetch', Date.now().toString());

        // Trigger animations
        setTimeout(() => {
            newsContainer.querySelectorAll('.news-card').forEach(c => c.classList.add('visible'));
        }, 100);

    } catch (error) {
        console.error('News Fetch Error:', error);
        newsContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 2rem;">Unable to load live news. Please check your API key and connection.</p>';
    } finally {
        isFetchingNews = false;
    }
}
