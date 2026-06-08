// Joseph Sutton 
// 6/6/2026
// cs233js term project "Game Database"

// Game model for saved library entries.
export class Game {
  constructor({ id, name, platforms = [], rating = 0, status = 'Want to Play', released = '', coverUrl = '' }) {
    this.id = id;
    this.name = name;
    this.platforms = platforms;
    this.rating = rating;
    this.status = status;
    this.released = released;
    this.coverUrl = coverUrl;
  }

  // get game data from the RAWG API response to make game object.
  static fromRawgApi(gameData) {
    return new Game({
      id: gameData.id,
      name: gameData.name,
      platforms: (gameData.parent_platforms || []).map(platform => platform.platform.name),
      rating: gameData.rating ?? 0,
      released: gameData.released ?? '',
      coverUrl: gameData.background_image ?? '',
      status: 'Want to Play',
    });
  }
}
