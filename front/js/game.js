const CH_WALL = 'x';
const CH_PLAYER = 'o';
const CH_BOMB = '+';
const CH_EMPTY = ' ';

class BomberGame {

    constructor() {
        this.gameMap = null;
        this.players = new Map();
        this.bombs = new Map();

        //this.addPlayer(new Player("wwtwt", {"x": 1, "y": 1}, "Player1"));
        // this.addPlayer(new Player("wgetrhrthrwg", {"x": 11, "y": 11}, "Player2"));
        // this.addBomb(new Bomb("123bmb", {"x": 1, "y": 1}));
        // this.players.get("Player1").setPosition(2, 3);
        // this.displayMap(this.map, screen);
    }

    addMap = (gameMap) => {
        this.gameMap = gameMap;
        this.displayMapWrapper();
        this.addInputHandling();
    }

    displayMapWrapper = () => {
        if(this.gameMap === null) {
            console.log("Display wrapper: gameMap is null, cannot display the map");
        } else {
            this.gameMap.displayMap(this.gameMap.map, this.gameMap.screen, this.players, this.bombs);
        }
    }


    // Player
    addPlayer = (player) => {
        this.players.set(player.nick, player);
        this.displayMapWrapper();
    }

    addBomb = (bomb) => {
        this.bombs.set(bomb.uid, bomb);
        this.displayMapWrapper();
    }

    addInputHandling = () => {
        document.addEventListener('keydown', e => {
            if(e.repeat) {
                return;
            }
            const player = this.players.get("Player1");
            let x = 0, y = 0, correctKey = true;
            switch (e.key) {
                case "ArrowDown":
                    y = 1;
                    break;
                case "ArrowUp":
                    y = -1;
                    break;
                case "ArrowLeft":
                    x = -1;
                    break;
                case  "ArrowRight":
                    x = 1;
                    break;
                case " ":
                    console.log("Space pressed, planting bomb not implemented");
                    break;
                default:
                    correctKey = false;
            }
            if(correctKey) {
                e.preventDefault();
                console.log(`Key ${e.key} pressed`);
            }
            player.setPosition(player.position.x + x, player.position.y + y);
            this.gameMap.displayMap(this.gameMap, this.gameMap.screen, this.players, this.bombs);
        })
    }
}

class GameMap {
    constructor(screen, size) {
        this.screen = screen;
        this.size = size;
        this.map = this.generateMap(this.size.x, this.size.y);
    }

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

    displayMap = (map, screen, players, bombs) => {
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
        players.forEach(player => {
            tmpMap[player.position.y][player.position.x] = CH_PLAYER;
        });

        // Add bombs to the map
        bombs.forEach(bomb => {
            tmpMap[bomb.position.y][bomb.position.x] = CH_BOMB;
        });

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
}

class GameObject {
    constructor(uid, position) {
        this.uid = uid;
        this.position = position;
    }
}


class Player extends GameObject {
    constructor(uid, position, nick) {
        super(uid, position);
        this.nick = nick;
        console.log(`Player added at: ${position.x}, ${position.y}`);
    }

    setPosition = (x, y) => {
        this.position.x = x;
        this.position.y = y;
    }
}

class Bomb extends GameObject {
    constructor(uid, position) {
        super(uid, position);
    }

    explode = () => {
        console.log("Explosion, but not implemented");
    }
}

class Box extends GameObject {
    constructor(uid, position) {
        super(uid, position);
    }
}

class Gift extends GameObject {
    constructor(uid, position) {
        super(uid, position);
    }
}