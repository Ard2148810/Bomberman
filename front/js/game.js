var config = {
    type: Phaser.AUTO,
    width: 240,
    height: 240,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 0},
            debug: true
        }
    },
    scene: {
        //preload: preload,
        //create: create,
        //update: update
    }
};

var game = new Phaser.Game(config);

function handlePlayerConnected() {
    alert ("Let's play: " + document.connectionForm.inputNickname.value);
}

game.state.add("BootState", new Bomberman.BootState());
game.state.add("LoadingState", new Bomberman.LoadingState());
game.state.add("TiledState", new Bomberman.TiledState());
game.state.start("BootState", true, false, "js/assets.json", "TiledState");
