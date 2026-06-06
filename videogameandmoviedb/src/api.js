import { API_KEY } from './config.js';

export async function searchGames(query, pageSize = 6) {
    const url = `https://api.rawg.io/api/games?key=${API_KEY}&search=${encodeURIComponent(query)}&page_size=${pageSize}`; // Add page_size to limit results for better performance
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network error while searching games');
    const data = await res.json();
    console.log('Search results:', data);
    return data; // contains results, next, etc.
}

// TODO: integrate this function into the details button click handler in main.js to fetch 
// and display average rating when user clicks search. Also we can just plug this into the gamecard
// template to show the average rating right away without needing to click details. 
export async function fetchAverageRating(gameId) {
    const url = `https://api.rawg.io/api/games/${gameId}?key=${API_KEY}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Network error while fetching game details');
    const data = await res.json();
    console.log('Fetched game details:', data);
    return data.rating;
}