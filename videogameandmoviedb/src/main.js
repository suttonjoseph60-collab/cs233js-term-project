// need to update gamecard with .json object data
// need to implement add/remove games via local storage for game library objects. 
// need to update DOM to display library objects as opposed to hard coded example cards. 



import { searchGames, fetchAverageRating } from './api.js';

const input = document.getElementById('global-search-input');
const button = document.getElementById('global-search-button');
const resultsEl = document.getElementById('search-results');

function createGameCard(game) {
    const div = document.createElement('div');
    div.className = 'result-card';
    const gameString = encodeURIComponent(JSON.stringify(game));
    div.innerHTML = `
        <img src="${game.background_image || ''}" alt="${game.name}" class="result-img">
        <div class="result-body">
            <h3 class="result-title">${game.name}</h3>
            <p class="result-meta">${game.released || ''} • Rating: ${game.rating}</p>
            <p class="result-platforms">${(game.parent_platforms || []).map(p => p.platform.name).join(', ')}</p>
            <button class="details-btn" data-id="${game.id}">Details</button>
            <button class="add-to-lib-btn" data-id="${game.id}" data-game="${gameString}">Add to Library</button>
        </div>
    `;
    return div;
}

function renderResults(games) {
    resultsEl.innerHTML = '';
    if (!games || games.length === 0) {
        resultsEl.textContent = 'No results found';
        return;
    }
    const grid = document.createElement('div');
    grid.className = 'results-grid';
    games.forEach(g => grid.appendChild(createGameCard(g)));
    resultsEl.appendChild(grid);
}

async function doSearch(query) {
    if (!query || !query.trim()) {
        resultsEl.textContent = 'Please enter a search term';
        return;
    }
    resultsEl.textContent = 'Searching...';
    try {
        const data = await searchGames(query);
        renderResults(data.results || []);
    } catch (err) {
        console.error(err);
        resultsEl.textContent = 'An error occurred while searching';
    }
}

function saveGameToLibrary(gameString) {
    const game = JSON.parse(decodeURIComponent(gameString));
    let library = JSON.parse(localStorage.getItem('myGameLibrary')) || [];
    
    // Check for duplicates
    if (library.some(savedGame => savedGame.id === game.id)) {
        alert(`${game.name} is already in your library!`);
        return;
    }

    library.push(game);
    localStorage.setItem('myGameLibrary', JSON.stringify(library));
    console.log(`Added ${game.name} to your library!`);
    console.log(game);
    renderLibrary();
}

function createLibraryCard(game) {
    const div = document.createElement('div');
    div.className = 'card';
    const platforms = (game.parent_platforms || []).map(p => p.platform.name).slice(0, 3);
    div.innerHTML = `
        <div class="card-img-placeholder">
            ${game.background_image ? `<img src="${game.background_image}" alt="${game.name}" style="width: 100%; height: 100%; object-fit: cover;">` : '[Poster Image]'}
            <span class="badge">${game.rating || 'N/A'}</span>
        </div>
        <div class="card-content">
            <div class="card-title">${game.name}</div>
            <div class="card-meta">
                <span>${game.released || 'TBA'}</span>
            </div>
            <div class="tag-list">
                ${platforms.map(p => `<span class="tag">${p}</span>`).join('')}
            </div>
        </div>
    `;
    return div;
}

function renderLibrary() {
    const grid = document.querySelector('.grid');
    const library = JSON.parse(localStorage.getItem('myGameLibrary')) || [];
    grid.innerHTML = '';
    if (library.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Your library is empty. Search and add games!</p>';
        return;
    }
    library.forEach(game => grid.appendChild(createLibraryCard(game)));
}

button.addEventListener('click', () => doSearch(input.value));
input.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(input.value); });

resultsEl.addEventListener('click', (e) => {
    const addBtn = e.target.closest('.add-to-lib-btn');
    if (addBtn) {
        const gameString = addBtn.dataset.game;
        saveGameToLibrary(gameString);
    }
});

document.addEventListener('DOMContentLoaded', renderLibrary);



