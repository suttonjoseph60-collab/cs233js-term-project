// create a game class to represent a game object with properties like name, 
// platforms, rating, a field for status (e.g., "Playing, Completed, Want to Play")

class Game {
    constructor(name, platforms, rating, status = "Not Started") {
        this.name = name;
        this.platforms = platforms;
        this.rating = rating;
        this.status = status;
    }
}

