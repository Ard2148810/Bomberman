window.onload = () => {
    const screen = document.getElementById('display');
    const connectBtn = document.getElementById("connectBtn");
    const disconnectBtn = document.getElementById("disconnectBtn");
    const urlInput = document.getElementById("urlInput");
    const nickInput = document.getElementById("nickInput");
    const game = new BomberGame();
    let serverConnection;

    connectBtn.onclick = e => {
        serverConnection = new ServerConnection(urlInput.value, nickInput.value);
        if(serverConnection !== null) {
            connectBtn.disabled = true;
            disconnectBtn.disabled = false;
            game.addMap(new GameMap(screen, {x: 11, y: 11}));
        }
    }

    disconnectBtn.onclick = e => {
        serverConnection.disconnect();
        connectBtn.disabled = false;
        disconnectBtn.disabled = true;
    }
}