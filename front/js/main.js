window.onload = () => {
    const screen = document.getElementById('display');
    const connectBtn = document.getElementById("connectBtn");
    const disconnectBtn = document.getElementById("disconnectBtn");
    disconnectBtn.disabled = true;
    const urlInput = document.getElementById("urlInput");
    const nickInput = document.getElementById("nickInput");
    const score = document.getElementById("scoreValue");

    const game = new BomberGame();
    let serverConnection;

    connectBtn.onclick = e => {
        serverConnection = new ServerConnection(
            urlInput.value,
            nickInput.value,
            onclose,
            {
            handleWelcomeMsg,
            handlePlayerPos
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

    // Messages handling

    let handleWelcomeMsg = msg => {
        game.addMap(new GameMap(screen, {x: msg.map_size_x, y: msg.map_size_y}));
        game.defaultBombsAmount = msg.bombs_amount;
        game.addPlayer(new Player(
            msg.client_uid,
            {x: 3, y: 3},
            msg.client_uid,
            game.defaultBombsAmount,
            sendPlayerMove)
        );
        score.innerText = msg.current_score;
    }

    let handlePlayerPos = msg => {
        const player = game.players.get(msg.nick);
        if(player !== undefined) {  // If player already exists in game
            player.setPosition(msg.x, msg.y);
            console.log(`Set position of ${player.nick} to ${msg.x}, ${msg.y}`);
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


}