// Joseph Sutton 
// 6/6/2026
// cs233js term project "Game Database"

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './styles.css';

import { searchGames } from './api.js';
import { Game } from './game.js';

const STORAGE_KEY = 'myGameLibrary';
const DEFAULT_STATUS = 'Want to Play';

const dom = {
  searchInput: document.getElementById('global-search-input'),
  searchButton: document.getElementById('global-search-button'),
  resultsContainer: document.getElementById('search-results'),
  libraryGrid: document.querySelector('.grid'),
};

const activeSearchGames = new Map();

// get selected status filter value. defaults to "all" if none selected.
function getSelectedStatusFilter() {
  const selected = document.querySelector('input[name="status-filter"]:checked');
  return selected ? selected.value : 'all';
}

// format platforms array into a readable string. e.g. ["PC", "PlayStation"] -> "PC, PlayStation". handles empty/null case.
function formatPlatforms(platforms) {
  if (!platforms || platforms.length === 0) {
    return 'Unknown platform';
  }
  return platforms.join(', ');
}

// search result card template. 
function createSearchCard(game) {
  const card = document.createElement('div');
  card.className = 'col';

  const imageUrl = game.background_image || 'https://via.placeholder.com/640x360?text=No+Image';

  card.innerHTML = `
    <div class="card h-100 shadow-sm bg-dark text-white border-secondary">
      <img src="${imageUrl}" class="card-img-top" alt="${game.name}" loading="lazy">
      <div class="card-body d-flex flex-column">
        <div class="d-flex justify-content-between align-items-start mb-3">
          <h5 class="card-title mb-0">${game.name}</h5>
          <span class="badge bg-primary">${game.rating ?? 'N/A'}</span>
        </div>
        <p class="card-text text-muted mb-1">${game.released || 'Release date unknown'}</p>
        <p class="card-text text-muted small mb-3">${formatPlatforms((game.parent_platforms || []).map(p => p.platform.name))}</p>
        <button class="btn btn-outline-primary mt-auto" type="button" data-action="add" data-game-id="${game.id}">
          Add to Library
        </button>
      </div>
    </div>
  `;

  return card;
}

// render search results grid. also store the active search results in a map for easy lookup when adding to library.
function renderSearchResults(games) {
  dom.resultsContainer.innerHTML = '';
  activeSearchGames.clear();

  if (!games || games.length === 0) {
    dom.resultsContainer.textContent = 'No results found. Try another search term.';
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4 results-grid';

  games.forEach(game => {
    activeSearchGames.set(String(game.id), game);
    grid.appendChild(createSearchCard(game));
  });

  dom.resultsContainer.appendChild(grid);
}

// perform search and handle results/errors. also validate input to prevent empty searches.
async function performSearch(query) {
  if (!query || !query.trim()) {
    dom.resultsContainer.textContent = 'Please enter a search term.';
    return;
  }

  dom.resultsContainer.textContent = 'Searching...';

  try {
    const data = await searchGames(query.trim());
    renderSearchResults(data.results || []);
  } catch (error) {
    console.error('Search failed:', error);
    dom.resultsContainer.textContent = 'Search failed. Please try again later.';
  }
}

// load games from local storage. if no library exists yet, return an empty array.
function loadLibrary() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
}

function saveLibrary(library) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(library));
}

// save game to local. Also checks if game is already in libary to prevent duplicate. 
function addGameToLibrary(gameId) {
  const gameData = activeSearchGames.get(String(gameId));
  if (!gameData) {
    return;
  }

  const library = loadLibrary();
  if (library.some(item => String(item.id) === String(gameId))) {
    window.alert(`${gameData.name} is already in your library.`);
    return;
  }

  const savedGame = Game.fromRawgApi(gameData);
  library.push(savedGame);
  saveLibrary(library);
  renderLibrary();
  dom.searchInput.value = '';
  dom.resultsContainer.innerHTML = '';
}

// Game library card template. 
function createLibraryCard(game) {
  const card = document.createElement('div');
  card.className = 'col';

  const imageUrl = game.coverUrl || 'https://via.placeholder.com/640x360?text=No+Image';

  card.innerHTML = `
    <div class="card h-100 shadow-sm bg-dark text-white border-secondary">
      <img src="${imageUrl}" class="card-img-top" alt="${game.name} cover" loading="lazy">
      <div class="card-body d-flex flex-column">
        <div class="d-flex justify-content-between align-items-start mb-3">
          <h5 class="card-title mb-0">${game.name}</h5>
          <span class="mb-2">${game.rating || 'N/A'}</span>
        </div>
        <p class="mb-2">${game.released || 'Unknown release'}</p>
        <div class="mb-3">
          ${(game.platforms || []).slice(0, 3).map(platform => `<span class="badge bg-secondary me-1">${platform}</span>`).join('')}
        </div>
        <label class="form-label mb-2">Status</label>
        <select class="form-select status-select" data-id="${game.id}">
          ${['Want to Play', 'Playing', 'Completed']
            .map(status => `<option value="${status}"${status === game.status ? ' selected' : ''}>${status}</option>`)
            .join('')}
        </select>
      </div>
    </div>
  `;

  return card;
}

// normalize status value for consistent filtering. e.g. "Want to Play" -> "want-to-play"
function normalizeStatusValue(status) {
  return String(status).toLowerCase().replace(/\s+/g, '-');
}

// render library grid with optional filtering. also handles empty states for no games and no matches.
function renderLibrary() {
  const library = loadLibrary();
  const filter = getSelectedStatusFilter();
  dom.libraryGrid.innerHTML = '';

  if (!library.length) {
    dom.libraryGrid.innerHTML = `
      <div class="empty-state">
        <p>Your library is empty. Add a game from search to begin tracking your collection.</p>
      </div>
    `;
    return;
  }

  const filteredGames = library.filter(game => filter === 'all' || normalizeStatusValue(game.status) === filter);

  if (!filteredGames.length) {
    dom.libraryGrid.innerHTML = `
      <div class="empty-state">
        <p>No saved games match the selected filter.</p>
      </div>
    `;
    return;
  }

  filteredGames.forEach(game => dom.libraryGrid.appendChild(createLibraryCard(game)));
}

// update game status in library and re-render. also handles case where game is not found (shouldn't happen but good to check).
function updateGameStatus(gameId, status) {
  const library = loadLibrary();
  const savedGame = library.find(item => String(item.id) === String(gameId));
  if (!savedGame) return;

  savedGame.status = status;
  saveLibrary(library);
  renderLibrary();
}

function handleDocumentClick(event) {
  const addButton = event.target.closest('[data-action="add"]');
  if (addButton) {
    addGameToLibrary(addButton.dataset.gameId);
  }
}

// handle status filter changes and status select changes.
function handleDocumentChange(event) {
  const statusSelect = event.target.closest('.status-select');
  if (statusSelect) {
    updateGameStatus(statusSelect.dataset.id, statusSelect.value);
    return;
  }

  if (event.target.matches('input[name="status-filter"]')) {
    renderLibrary();
  }
}


function setupEventListeners() {
  dom.searchButton.addEventListener('click', () => performSearch(dom.searchInput.value));
  dom.searchInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      performSearch(dom.searchInput.value);
    }
  });

  document.addEventListener('click', handleDocumentClick);
  document.addEventListener('change', handleDocumentChange);
}

// initialize app by setting up event listeners and rendering library on page load.
function initializeApp() {
  setupEventListeners();
  renderLibrary();
}

window.addEventListener('DOMContentLoaded', initializeApp);



