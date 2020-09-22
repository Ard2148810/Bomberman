window.onload = () => {
    const screen = document.getElementById('display');
    const connectBtn = document.getElementById("connectBtn");
    const disconnectBtn = document.getElementById("disconnectBtn");
    const urlInput = document.getElementById("urlInput");
    const nickInput = document.getElementById("nickInput");
    const score = document.getElementById("scoreValue");

    const game = new BomberGame();
    let serverConnection;
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
                handleCurrentScore
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
        game.addPlayer(new Player(
            msg.client_uid,
            {x: 3, y: 3},
            msg.client_uid,
            game.defaultBombsAmount,
            sendPlayerMove,
            sendPlayerPlantBomb)
        );
        score.innerText = msg.current_score;
    }

    let handlePlayerPos = msg => {
        const player = game.players.get(msg.nick);
        if(player !== undefined) {  // If player already exists in game
            player.setPosition(msg.x, msg.y);
        } else {    // Otherwise add him as a new one
            const newPlayer = new Player(
                msg.nick,
                {x: msg.x, y: msg.y},
                msg.nick,
                game.defaultBombsAmount
            );
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
        game.explosionGroups.delete(msg.bomb_uid);
    }

    let handleCurrentScore = msg => {
        score.innerText = msg.score;
    }
}