console.log("Game will be here!");
const CH_WALL = 'x';
const CH_PLAYER = 'o';
const CH_BOMB = '+';
const CH_EMPTY = ' ';

class BomberGame {

    constructor(screen, size) {
        this.screen = screen;
        this.map = this.generateMap(size.x, size.y);
        this.players = new Map();

        this.addPlayer(new Player("Player1", {"x": 1, "y": 1}));
        this.addPlayer(new Player("Player2", {"x": 11, "y": 11}));
        this.players.get("Player1").setPosition(2, 3);
        this.displayMap(this.map, screen);
    }

    // Map
    generateMap = (x, y) => {
        let map = [];
        for(let i = 0; i < y; i++) {
            let row = [];
            for(let j = 0; j < x; j++) {
                row.push((j === 0 || i === 0 || j === x - 1 || i === y - 1) ?
                    CH_WALL : (j % 2 === 0 && i % 2 === 0) ?
                        CH_WALL : CH_EMPTY);
            }
            map.push(row);
        }
        return map;
    }

    displayMap = (map, screen) => {
        // Copy the map
        let tmpMap = [];
        map.map(row => {
            let tmpRow = [];
            row.map(cell => {
                tmpRow.push(cell);
            });
            tmpMap.push(tmpRow);
        });

        let mapContent = "";

        // Add players to the map
        this.players.forEach(player => {
            tmpMap[player.position.x][player.position.y] = CH_PLAYER;
        });

        // Add bombs to the map

        // Display the map
        tmpMap.forEach(row => {
            let genRow = "";
            row.forEach(cell => {
                genRow += cell;
            })
            mapContent += genRow + "\n";
        });

        screen.innerText = mapContent;
    }

    // Player
    addPlayer = (player) => {
        this.players.set(player.nick, player);
        this.displayMap(this.map, this.screen);
    }

}

window.onload = () => {
    const screen = document.getElementById('display');
    const game = new BomberGame(screen, {"x": 13, "y": 13});
}

class Player {
    constructor(nick, position) {
        this.nick = nick;
        this.position = position;   // {x, y}
        console.log(`Player added at: ${position.x}, ${position.y}`);
    }

    setPosition = (x, y) => {
        this.position.x = x;
        this.position.y = y;
    }
}
