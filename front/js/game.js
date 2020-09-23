const CH_WALL = 'x';
const CH_PLAYER = 'o';
const CH_BOMB = '+';
const CH_EMPTY = ' ';
const CH_EXPLOSION = '·';
const CH_BOX = 'π'
const CH_GIFT = 'e';


class BomberGame {

    constructor() {
        this.gameMap = null;
        this.players = new Map();
        this.bombs = new Map();
        this.explosionGroups = new Map();
        this.boxes = new Map();
        this.gifts = new Map();
        this.defaultBombsAmount = null;
    }

    addMap = (gameMap) => {
        this.gameMap = gameMap;
        this.displayMapWrapper();
    }

    displayMapWrapper = () => {
        if(this.gameMap === null) {
            console.log("Display wrapper: gameMap is null, cannot display the map");
        } else {
            this.gameMap.displayMap(
                this.gameMap.map,
                this.boxes,
                this.gameMap.screen,
                this.players,
                this.bombs,
                this.explosionGroups,
                this.gifts);
        }
    }


    // Player
    addPlayer = (player) => {
        this.players.set(player.nick, player);  // Using nickname instead of UID because of server incompatibility
    }

    addBomb = (bomb) => {
        this.bombs.set(bomb.uid, bomb);
    }

    bombExplode = (bombKey, xRange, yRange, objectsHit, explosionDuration = 500) => {
        const bomb = this.bombs.get(bombKey);
        const explosion = bomb.explode(xRange, yRange, this.gameMap.map);
        this.explosionGroups.set(explosion.uid, explosion);
        this.bombs.delete(bombKey);
        objectsHit.forEach(this.deleteObject);
        setTimeout(() => {
                this.explosionGroups.delete(explosion.uid);
                this.displayMapWrapper();
            },
            explosionDuration);

    }

    addBox = (box) => {
        this.boxes.set(box.uid, box);
    }

    addGift = (gift) => {
        this.gifts.set(gift.uid, gift);
    }

    deleteObject = (key) => {
        this.boxes.delete(key);
        this.gifts.delete(key);
        const player = this.players.get(key);
        if(player !== undefined) player.removeInputHandling();
        this.players.delete(key);
    }

    isStandingOnGift = (position, gifts) => {   // Returns key of the gift that the player is standing on
        let found = null;
        gifts.forEach((gift, key) => {
            const gPos = gift.position;
            if(position.x === gPos.x && position.y === gPos.y) {
                found = key;
            }
        });
        return found;
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

    displayMap = (map, boxes, screen, players, bombs, explosionGroups, gifts) => {
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

        // Add gifts to the map
        gifts.forEach(gift => {
            tmpMap[gift.position.y][gift.position.x] = `<span class="gift">${CH_GIFT}</span>`;
        })

        // Add boxes to the map
        boxes.forEach(box => {
            tmpMap[box.position.y][box.position.x] = `<span class="box">${CH_BOX}</span>`;
        });

        // Add players to the map
        players.forEach(player => {
            tmpMap[player.position.y][player.position.x] =
                `<span style="color: ${player.displayColor}">${CH_PLAYER}</span>`;
        });

        // Add bombs to the map
        bombs.forEach(bomb => {
            tmpMap[bomb.position.y][bomb.position.x] = `<span class="bomb">${CH_BOMB}</span>`;
        });

        // Add explosions to the map
        explosionGroups.forEach(group => {
            group.explosions.forEach(explosion => {
                if(this.explosionAllowed(map, explosion.x, explosion.y)) {
                    tmpMap[explosion.y][explosion.x] = `<span class="bomb">${CH_EXPLOSION}</span>`;
                }
            })
        });

        // Display the map
        tmpMap.forEach(row => {
            let genRow = "";
            row.forEach(cell => {
                genRow += cell;
            })
            mapContent += genRow + "\n";
        });

        screen.innerHTML = mapContent;
    }

    explosionAllowed = (map, x, y) => {
        return (x > 0 && y > 0 && x < map[0].length && y < map.length && map[y][x] !== CH_WALL);
    }

}


class GameObject {

    constructor(uid, position) {
        this.uid = uid;
        this.position = position;
    }

}


class Player extends GameObject {

    constructor(uid, position, nick, playerMovedHandler, plantBombHandler, displayColor = "#ffff00") {
        super(uid, position);
        this.displayColor = displayColor;
        this.nick = nick;
        this.playerMovedHandler = playerMovedHandler;
        this.plantBombHandler = plantBombHandler;
        document.addEventListener('keydown', this.inputHandling);
        console.log(`Player added: uid: ${uid}; nick: ${nick}; position: ${position.x}, ${position.y}`);
    }

    setPosition = (x, y) => {
        this.position.x = x;
        this.position.y = y;
    }

    removeInputHandling = () => {
        document.removeEventListener('keydown', this.inputHandling);
    }

    inputHandling = e => {
        if (e.repeat) return;
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
            case "ArrowRight":
                x = 1;
                break;
            case " ":
                if (this.plantBombHandler !== undefined) this.plantBombHandler(this.uid);
                break;
            default:
                correctKey = false;
        }
        if (correctKey) {
            e.preventDefault();
            if (this.playerMovedHandler !== undefined && e.key !== " ") {
                this.playerMovedHandler(this.position.x + x, this.position.y + y, this.uid);
            }
        }
    }

}


class Bomb extends GameObject {
    constructor(uid, position) {
        super(uid, position);
    }

    explode = (xRange, yRange, map) => {
        return new ExplosionGroup(this.uid, this.position, xRange, yRange, map);
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

class ExplosionGroup extends GameObject {

    constructor(uid, position, xRange, yRange, map) {
        super(uid, position);
        this.explosions = this.generateExplosions(position, xRange, yRange, map);
    }

    generateExplosions = (position, x, y, map) => {
        let expl = [];
        expl.push( {x: position.x, y: position.y} );                // Center
        for(let i = position.x + 1; i <= position.x + x; i++) {     // Right
            expl.push({x: i, y: position.y});
            if(map[position.y][i] === CH_WALL) break;
        }
        for(let i = position.x - 1; i >= position.x - x; i--) {     // Left
            expl.push({x: i, y: position.y});
            if(map[position.y][i] === CH_WALL) break;
        }
        for(let i = position.y + 1; i <= position.y + y; i++) {     // Up
            expl.push({x: position.x, y: i});
            if(map[i][position.x] === CH_WALL) break;
        }
        for(let i = position.y - 1; i >= position.y - y; i--) {     // Down
            expl.push({x: position.x, y: i});
            if(map[i][position.x] === CH_WALL) break;
        }

        return expl;
    }
}