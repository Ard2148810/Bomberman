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

function preload() {
    this.load.setBaseURL('http://labs.phaser.io');

    this.load.image('sky', 'assets/skies/space3.png');
}

var text;

function create() {
    this.add.image(400, 300, 'sky');
    text = this.add.text(100, 100, 'Connect to the server to start.', { font: '32px Courier', fill: '#00ff00' });
}

function update() {

}

game.state.add("BootState", new Bomberman.BootState());
game.state.add("LoadingState", new Bomberman.LoadingState());
game.state.add("TiledState", new Bomberman.TiledState());
game.state.start("BootState", true, false, "js/assets.json", "TiledState");
