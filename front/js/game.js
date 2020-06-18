var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {y: 0},
            debug: true
        }
    },
    scene: {
        preload: preload,
        create: create
    }
};


var game = new Phaser.Game(config);

function preload() {
    this.load.setBaseURL('http://labs.phaser.io');

    this.load.image('sky', 'assets/skies/space3.png');
}

function create() {
    this.add.image(400, 300, 'sky');
    var text = this.add.text(100, 100, 'Connect to the server to start.', { font: '32px Courier', fill: '#00ff00' });

}