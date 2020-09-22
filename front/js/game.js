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

    bombExplode = (bombKey, xRange, yRange, objectsHit) => {
        const bomb = this.bombs.get(bombKey);
        const explosion = bomb.explode(xRange, yRange);
        this.explosionGroups.set(explosion.uid, explosion);
        this.bombs.delete(bombKey);
        console.log(objectsHit);
        objectsHit.forEach(this.deleteObject);
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
            tmpMap[player.position.y][player.position.x] = `<span class="player1">${CH_PLAYER}</span>`;
        });

        // Add bombs to the map
        bombs.forEach(bomb => {
            tmpMap[bomb.position.y][bomb.position.x] = `<span class="bomb">${CH_BOMB}</span>`;
        });

        // Add explosions to the map
        explosionGroups.forEach(group => {
            group.explosions.forEach(explosion => {
                if(this.explosionAllowed(map, explosion.x, explosion.y)) {
                    tmpMap[explosion.y][explosion.x] = CH_EXPLOSION;
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

    coloredChar = (ch, cssClass) => {
        return `<span class=${cssClass}>${ch}</span>`;
    }

}


class GameObject {

    constructor(uid, position) {
        this.uid = uid;
        this.position = position;
    }

}


class Player extends GameObject {

    constructor(uid, position, nick, bombsAmount, playerMovedHandler, plantBombHandler) {
        super(uid, position);
        this.nick = nick;
        this.bombsAmount = bombsAmount;
        this.addInputHandling(playerMovedHandler, plantBombHandler);
        console.log(`Player added at: uid: ${uid}; nick: ${nick}; position: ${position.x}, ${position.y}`);
    }

    setPosition = (x, y) => {
        this.position.x = x;
        this.position.y = y;
    }

    addInputHandling = (playerMovedHandler, plantBombHandler) => {
        document.addEventListener('keydown', e => {
            if(e.repeat) return;
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
                    if(plantBombHandler !== undefined) plantBombHandler(this.uid);
                    break;
                default:
                    correctKey = false;
            }
            if(correctKey) {
                e.preventDefault();
                if(playerMovedHandler !== undefined && e.key !== " ") {
                    playerMovedHandler(this.position.x + x, this.position.y + y, this.uid);
                }
            }

        });
    }

}


class Bomb extends GameObject {
    constructor(uid, position) {
        super(uid, position);
    }

    explode = (xRange, yRange) => {
        return new ExplosionGroup(this.uid, this.position, xRange, yRange);
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

    constructor(uid, position, xRange, yRange) {
        super(uid, position);
        this.explosions = this.generateExplosions(position, xRange, yRange);

    }

    generateExplosions = (position, x, y) => {
        let expl = [];

        expl.push( {x: position.x, y: position.y} );
        for(let i = position.x - x; i <= position.x + x; i++) { // Horizontal explosions
            if(i !== position.y) expl.push({x: i, y: position.y});
        }
        for(let i = position.y - y; i <= position.y + y; i++) { // Vertical explosions
            if(i !== position.x) expl.push({x: position.x, y: i});
        }

        return expl;
    }
}