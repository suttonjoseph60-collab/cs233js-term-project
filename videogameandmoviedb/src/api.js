// Joseph Sutton 
// 6/6/2026
// cs233js term project "Game Database"

import { RAWG_API_KEY, SEARCH_PAGE_SIZE } from './config.js';

const API_BASE_URL = 'https://api.rawg.io/api';

// chat helper to build API URLs with query parameters. automatically includes API key and handles encoding.
function buildUrl(path, params = {}) {
  const query = new URLSearchParams({ key: RAWG_API_KEY, ...params });
  return `${API_BASE_URL}/${path}?${query}`;
}

// main api function to search games and get game info. 
export async function searchGames(query, pageSize = SEARCH_PAGE_SIZE) {
  const url = buildUrl('games', { search: query, page_size: pageSize });
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error('Network error while searching games.');
  }

  return res.json();
}