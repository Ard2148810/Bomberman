window.onload = () => {
    const screen = document.getElementById('display');
    const connectBtn = document.getElementById("connectBtn");
    const disconnectBtn = document.getElementById("disconnectBtn");
    const urlInput = document.getElementById("urlInput");
    const nickInput = document.getElementById("nickInput");
    const score = document.getElementById("scoreValue");
    const bombs = document.getElementById("bombsValue");

    const game = new BomberGame();
    let serverConnection;
    let clientUID;
    disconnectBtn.disabled = true;

    connectBtn.onclick = e => {
        serverConnection = new ServerConnection(
            urlInput.value,
            nickInput.value,
            onclose,
            {
                handleWelcomeMsg,
                handlePlayerPos,
                handleBombHasBeenPlanted,
                handleBombExploded,
                handleCurrentScore,
                handleBombAmount
            });   // Create connection
        if(serverConnection !== null) {
            connectBtn.disabled = true;
            disconnectBtn.disabled = false;
            urlInput.disabled = true;
            nickInput.disabled = true;
        }
    }

    disconnectBtn.onclick = e => {
        serverConnection.disconnect();
    }

    let onclose = (e) => {
        connectBtn.disabled = false;
        disconnectBtn.disabled = true;
        urlInput.disabled = false;
        nickInput.disabled = false;
    }

    // Messages to server

    let sendPlayerMove = (x, y, uid) => {
        const msg = {
            msg_code: "player_move",
            x: x,
            y: y,
            uid: uid
        };
        serverConnection.sendMessage(msg);
    }

    let sendPlayerPlantBomb = (uid) => {
        const msg = {
            msg_code: "player_plant_bomb",
            uid: uid
        };
        serverConnection.sendMessage(msg);
    }

    // Messages handling

    let handleWelcomeMsg = msg => {
        game.addMap(new GameMap(screen, {x: msg.map_size_x, y: msg.map_size_y}));
        game.defaultBombsAmount = msg.bombs_amount;
        score.innerText = msg.current_score;
        bombs.innerText = msg.bombs_amount;
        const boxes = msg.box;
        boxes.forEach(box => {
            game.addBox(new Box(box.uid, {x: box.pos[0], y: box.pos[1]}));
        })
        const gifts = msg.gifts;
        gifts.forEach(gift => {
            game.addGift(new Gift(gift.uid, {x: gift.pos[0], y: gift.pos[1]}))
            // Against protocol because of incorrect protocol on the server
        })
        clientUID = msg.client_uid;
    }

    let handlePlayerPos = msg => {
        const player = game.players.get(msg.nick);
        if(player !== undefined) {  // If player already exists in game
            player.setPosition(msg.x, msg.y);
            const giftKey = game.isStandingOnGift(player.position, game.gifts);
            if(giftKey !== null) {
                game.deleteObject(giftKey);
            }
        } else {    // Otherwise add him as a new one
            let newPlayer = null;
            if(msg.nick === nickInput.value) {  // Local player
                newPlayer = new Player(
                    clientUID,
                    {x: msg.x, y: msg.y},
                    msg.nick,
                    sendPlayerMove,
                    sendPlayerPlantBomb,
                    "#00ccff");
            } else {
                newPlayer = new Player(         // Other player
                    msg.nick,
                    {x: msg.x, y: msg.y},
                    msg.nick,
                );
            }
            game.addPlayer(newPlayer);
        }
        game.displayMapWrapper();
    }

    let handleBombHasBeenPlanted = msg => {
        const bomb = new Bomb(msg.bomb_uid, {x: msg.x, y: msg.y});
        game.addBomb(bomb);
        game.displayMapWrapper();
    }

    let handleBombExploded = msg => {
        game.bombExplode(msg.bomb_uid, msg.x_range, msg.y_range, msg.objects_hit);
        game.displayMapWrapper();
        //game.explosionGroups.delete(msg.bomb_uid);
    }

    let handleCurrentScore = msg => {
        score.innerText = msg.score;
    }

    let handleBombAmount = msg => {
        bombs.innerText = msg.amount;
    }
}