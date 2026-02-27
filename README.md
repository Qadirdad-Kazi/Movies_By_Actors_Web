# ActorFlix - Movie Discovery by Actors

A modern, cinematic web application for discovering movies through your favorite actors. Built with vanilla HTML, CSS, and JavaScript using The Movie Database (TMDb) API.

## 🔑 Important: API Key Required

**Before you start, you need a FREE API key from TMDb:**

👉 **Get your API key here: [https://www.themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)**

1. Sign up at [https://www.themoviedb.org/signup](https://www.themoviedb.org/signup)
2. Go to your account Settings → API
3. Request an API key (select "Developer")
4. Copy your API key and paste it in `script.js` (line 2)

Without the API key, the website won't be able to load any data!

---

## ✨ Features

- **🎬 Hero Section**: Stunning hero banner with live actor search
- **⭐ Popular & Trending Actors**: Browse curated lists of popular and trending actors
- **🔍 Smart Search**: Real-time search with autocomplete suggestions
- **👤 Actor Details**: Comprehensive actor information including:
  - Biography
  - Birthday & Place of Birth
  - Popularity Score
  - Known For Department
- **🎥 Complete Filmography**: View all movies and TV shows for each actor
- **📊 Filter Options**: Filter by Movies, TV Shows, or view all
- **📱 Fully Responsive**: Optimized for desktop, tablet, and mobile devices
- **🎨 Modern Design**: Netflix-inspired dark theme with smooth animations

## 🚀 Getting Started

### Prerequisites

You'll need a free API key from The Movie Database (TMDb):

1. Go to [https://www.themoviedb.org/signup](https://www.themoviedb.org/signup)
2. Create a free account
3. Navigate to Settings > API
4. Request an API key (choose "Developer" option)
5. Copy your API key

### Installation

1. Clone or download this repository
2. Open `script.js` in a text editor
3. Replace `YOUR_TMDB_API_KEY` on line 2 with your actual TMDb API key:
   ```javascript
   const API_KEY = 'your_actual_api_key_here';
   ```
4. Open `index.html` in a web browser

That's it! No build process or dependencies required.

## 📁 Project Structure

```
movie-detail-web/
├── index.html          # Main HTML structure
├── styles.css          # All styling and animations
├── script.js           # API integration and functionality
└── README.md          # This file
```

## 🎯 How to Use

### Browsing Actors
- Scroll down from the hero section to see "Popular Actors" and "Trending Now" sections
- Click on any actor card to view their detailed profile

### Searching for Actors
- Use the search bar in the hero section
- Start typing an actor's name (minimum 3 characters)
- Select from the autocomplete suggestions
- Or press Enter/click the search button

### Viewing Actor Details
- See comprehensive biography and personal information
- Browse their complete filmography
- Filter movies by type (All, Movies, TV Shows)
- Each movie shows title, year, rating, and character played
- Click "Back to Home" to return to the main page

## 🛠️ Technologies Used

- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS Grid, Flexbox, and animations
- **Vanilla JavaScript**: No frameworks - pure ES6+ JavaScript
- **TMDb API**: Free movie database API
- **Google Fonts**: Poppins font family

## 🎨 Design Features

- Dark theme inspired by popular streaming platforms
- Gradient overlays and backdrop blur effects
- Smooth hover animations and transitions
- Card-based layout with elevation shadows
- Responsive grid system
- Custom scrollable sections
- Loading spinner for async operations

## 📱 Responsive Breakpoints

- **Desktop**: 1024px and above
- **Tablet**: 768px - 1023px
- **Mobile**: Below 768px
- **Small Mobile**: Below 480px

## 🌐 API Endpoints Used

- `/person/popular` - Popular actors
- `/trending/person/week` - Trending actors
- `/search/person` - Search actors
- `/person/{id}` - Actor details
- `/person/{id}/combined_credits` - Actor's movies and TV shows

## 🚀 Deployment (Netlify)

This project is optimized for deployment on **Netlify** using **Serverless Functions** to keep your API keys 100% secure.

### Automatic Deployment

1.  **Push your code** to a GitHub repository.
2.  Login to [Netlify](https://www.netlify.com/).
3.  Click **"Add new site"** > **"Import from existing project"**.
4.  Connect your GitHub repo.
5.  Set the following **Environment Variables** in the Netlify dashboard (Site Settings > Environment Variables):
    -   `TMDB_API_KEY`: Your TMDb API key.
    -   `NEWS_API_KEY`: Your GNews.io API key.

### Local Development with Functions

To test the secure proxy locally, install the Netlify CLI:
```bash
npm install netlify-cli -g
netlify dev
```

---

## 🔑 API Key Security

We use a **Backend Proxy** (Netlify Functions) to protect your keys:
- **Local**: Keys are read from `script.js`.
- **Production**: Keys are read from server-side Environment Variables and are never exposed to the browser.

## 📄 License

This project is open source and available for educational purposes. Please respect TMDb's terms of service when using their API.

## 🙏 Credits

- Movie data provided by [The Movie Database (TMDb)](https://www.themoviedb.org/)
- Hero background image from [Unsplash](https://unsplash.com/)
- Icons: Unicode emoji characters

## 🐛 Troubleshooting

**Problem**: Actors not loading
- **Solution**: Check that you've added your API key correctly in `script.js`

**Problem**: Images not displaying
- **Solution**: Check your internet connection and API key validity

**Problem**: Search not working
- **Solution**: Ensure you're typing at least 3 characters

## 🚀 Future Enhancements

- Movie trailers and videos
- Actor social media links
- Movie ratings and reviews
- Watchlist functionality
- Dark/Light theme toggle
- Advanced filtering options
- Actor comparisons

---

Made with ❤️ for movie enthusiasts
