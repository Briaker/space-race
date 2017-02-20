$(document).ready(function() {
    console.log("YAY!")

    // ==========================
    // =      Game Config       =
    // ==========================
    var gameConfig = {
        tiles: [
            'A',
            'B',
            'C',
            'D',
            'E',
            'F',
            'G',
            'H'
        ]
    }

    // ==========================
    // =      Game Object       =
    // ==========================
    var game = {
        tilesFaceUp: [],
        flipTile: function(tile) {
            // Check to see if the tile has already been matched or is already face up
            if(!tile.data("tileData").isMatched && !tile.data("tileData").isFaceUp) {

                // Check to see if there are two tiles face up
                if(this.tilesFaceUp.length < 2) {
                    tile.data("tileData").flipTile();
                    this.tilesFaceUp.push($(tile));
                } 

                // Check if there two tiles faceUp
                if(this.tilesFaceUp.length >= 2) {
                    var tileA = this.tilesFaceUp[0].data("tileData").tileValue;
                    var tileB = this.tilesFaceUp[1].data("tileData").tileValue;

                    // Compare tile values
                    if(tileA === tileB) {
                        console.info("Its a match!");
                        // Add the matched class to both tiles
                        for(var i = 0; i < this.tilesFaceUp.length; i++) {
                            this.tilesFaceUp[i].data("tileData").tileDOMElement.addClass("matched");
                        }
                        // TODO: increment score/tries
                    } 
                    else {
                        console.info("Sorry, try again!");
                        for(var i = 0; i < this.tilesFaceUp.length; i++) {
                            this.tilesFaceUp[i].data("tileData").flipTile();
                        }
                        // TODO: subtract from score/tries
                    }

                    // Clear the array for the next round
                    this.tilesFaceUp = [];
                }
            }
        }
    }
    
    // ==========================
    // =    Setup Game Board    =
    // ==========================
    function initializeGameBoard() {
        console.info("Initializing Game Board...");

        // --------------------------
        // -   Create Tile Pairs    -
        // --------------------------
        var gameTiles = $.merge(gameConfig.tiles, gameConfig.tiles);
        var numberOfRows = (gameTiles.length / 4);
        var numberOfColumns = (gameTiles.length / 4);

        // --------------------------
        // -      Shuffle Tiles     -
        // --------------------------
        var currentIndex = gameTiles.length;
        var randomIndex;
        var temporaryTile;

        while(currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            
            temporaryTile = gameTiles[currentIndex];
            gameTiles[currentIndex] = gameTiles[randomIndex];
            gameTiles[randomIndex] = temporaryTile;
        }

        // --------------------------
        // -    Build Tile Grid     -
        // --------------------------
        for(var row = 0; row < numberOfRows; row ++) {
            for(var column = 0; column < numberOfColumns; column ++) {
                // Define the tile element
                var tile = $("<div>", {"class": "gameTile"});

                // Define the tileData object
                var tileData = { 
                    tileValue: gameTiles.pop(), 
                    tileDOMElement: tile,
                    isFaceUp: false,
                    isMatched: false,
                    flipTile: function() {
                        this.isFaceUp = !this.isFaceUp;
                        this.tileDOMElement.toggleClass("faceUp");
                    }
                };

                // Attach the tileData object to the tile element
                tile.data("tileData", tileData)

                // Add the tile to the grid
                $(".gameGrid").append(tile);

                // DEBUG: show the tile value on the tile REMOVE BEFORE PUBLISHING
                tile.append(tile.data("tileData").tileValue);

            }
        }
        console.info("Initializing Complete!");
    }

    initializeGameBoard();

    // // Event Handlers
    $(".gameTile").click(function() {
        tile = $(this);
        game.flipTile(tile);
    });
    
});
