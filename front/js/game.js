var scoreBoard = document.querySelectorAll(".score");
var SIZE = 15;
var nickName;

var mainState = {
    preload: function(){
        game.load.image('grass', 'assets/images/grass.png');
        game.load.image('wall', 'assets/images/wall.png');

        game.load.image('bomb', 'assets/images/bomb.png');
        game.load.image('explosion', 'assets/images/explosion.png');

        game.load.image('bomber', 'assets/images/bomber.png');
        game.load.image('bomber-front', 'assets/images/bomber-front.png');
        game.load.image('bomber-left', 'assets/images/bomber-left.png');
        game.load.image('bomber-right', 'assets/images/bomber-right.png');
        game.load.image('bomber-back', 'assets/images/bomber-back.png');

        game.load.image('start-game', 'assets/images/start-game.png');
    },

    create: function(){
        this.BLOCK_COUNT = 15;
        this.PIXEL_SIZE = GAME_SIZE / this.BLOCK_COUNT;

        game.physics.startSystem(Phaser.Physics.ARCADE);
        game.world.enableBody = true;

        for (var x = 0; x < SIZE; x++) {
            for (var y = 0; y < SIZE; y++) {
                this.addGround(x, y);
            }
        }

        this.grassList = game.add.group();
        this.wallList = game.add.group();
        this.bootList = game.add.group();
        this.starList = game.add.group();
        this.bombList = game.add.group();
        this.bombList_2 = game.add.group();
        this.flagList = game.add.group();
        this.addPlayers();
        this.explosionList = game.add.group();
        this.explosionList2 = game.add.group();


        this.createMap();

        this.playerSpeed = 150;
        this.playerPower = false;
        this.playerDrop = true;

        this.player2Speed = 150;
        this.player2Power = false;
        this.player2Drop = true;

        this.cursor = game.input.keyboard.createCursorKeys();
        this.enterKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        this.gameMessage = "";
        this.messageStyle = { fill: "#FFFFFF", boundsAlignV: "middle", boundsAlignH: "center", align: "center", wordWrapWidth: 600};
        this.infoStyle = { fill: "#FFFFFF", boundsAlignV: "middle", boundsAlignH: "center", align: "center", wordWrapWidth: 600};

        if(!gameInPlay){
            this.showGameWinner(null);
        }

        // Pass this object to the connection
        target = this;
    },

    update: function(){

        if (this.cursor.down.isDown || this.cursor.up.isDown || this.cursor.right.isDown || this.cursor.left.isDown){
            if (this.cursor.left.isDown){
                this.player.body.velocity.x = -(this.playerSpeed);
                this.player.loadTexture('bomber-left', 0);
            }
            if (this.cursor.right.isDown){
                this.player.body.velocity.x = (this.playerSpeed);
                this.player.loadTexture('bomber-right', 0);
            }
            if (this.cursor.up.isDown){
                this.player.body.velocity.y = -(this.playerSpeed);
                this.player.loadTexture('bomber-back', 0);
            }
            if (this.cursor.down.isDown){
                this.player.body.velocity.y = (this.playerSpeed);
                this.player.loadTexture('bomber-front', 0);
            }
            // console.log(`${this.player.x}, ${this.player.y}`); // TODO: Position changed, send it to the server
            this.messagePlayerMove(this.player.x, this.player.y, 0);
        } else{
            this.player.body.velocity.x = 0;
            this.player.body.velocity.y = 0;
        }

        if (this.enterKey.justUp){
            if(gameInPlay)
                this.dropBomb(1);
        }

        game.physics.arcade.collide(this.player, this.wallList);
        game.physics.arcade.collide(this.player2, this.wallList);
        game.physics.arcade.overlap(this.player, this.explosionList, function(){this.burn(1);}, null, this);
        game.physics.arcade.overlap(this.player, this.explosionList2, function(){this.burn(1);}, null, this);
        game.physics.arcade.overlap(this.player2, this.explosionList2, function(){this.burn(2);}, null, this);
        game.physics.arcade.overlap(this.player2, this.explosionList, function(){this.burn(1);}, null, this);

    },

    createMap: function(){
        for (var x = 0; x < SIZE; x++) {
            for (var y = 0; y < SIZE; y++) {
                if (x === 0 || y === 0 || x == 14 || y == 14){
                    this.addWall(x, y);
                }
                else if(x % 2 === 0 && y % 2 === 0){
                    this.addWall(x, y);
                } else if(x < 4 && y < 4 || x > 10 && y > 10){
                    this.addGrass(x, y);
                } else {
                    if(Math.floor(Math.random() * 3)){
                        this.addGrass(x, y);
                    } 
                }
            }
        }
    },

    burn: function(player){
        if(player == 1){
            this.player.kill();
        } else {
            this.player2.kill();
        }

        if(gameInPlay){
                this.showGameWinner(player);
        }
        gameInPlay = false;
    },

    addPlayers: function(){
        this.player = game.add.sprite(GAME_SIZE - 2 * this.PIXEL_SIZE, GAME_SIZE - 2 * this.PIXEL_SIZE, 'bomber');
        game.physics.arcade.enable(this.player);


        this.player2 = game.add.sprite(this.PIXEL_SIZE, this.PIXEL_SIZE, 'bomber');
        game.physics.arcade.enable(this.player2);
    },

    addWall: function(x, y){
        var wall = game.add.sprite(x * this.PIXEL_SIZE, y * this.PIXEL_SIZE, 'wall');
        game.physics.arcade.enable(wall);
        wall.body.immovable = true;
        this.wallList.add(wall);

    },

    detonateBomb: function(player, x, y, explosionList, wallList){
        var fire = [
            game.add.sprite(x, y, 'explosion'),
            game.add.sprite(x, y + 40, 'explosion'),
            game.add.sprite(x, y - 40, 'explosion'),
            game.add.sprite(x + 40, y, 'explosion'),
            game.add.sprite(x - 40, y, 'explosion')
        ];

        if(player == 1 && mainState.playerPower){
            fire.push(game.add.sprite(x, y + 80, 'explosion'));
            fire.push(game.add.sprite(x, y - 80, 'explosion'));
            fire.push(game.add.sprite(x + 80, y, 'explosion'));
            fire.push(game.add.sprite(x - 80, y, 'explosion'));
        } else if(player == 2 && mainState.playerPower2) {
            fire.push(game.add.sprite(x, y + 80, 'explosion'));
            fire.push(game.add.sprite(x, y - 80, 'explosion'));
            fire.push(game.add.sprite(x + 80, y, 'explosion'));
            fire.push(game.add.sprite(x - 80, y, 'explosion'));
        }

        for (var i = 0; i < fire.length; i++) {
            fire[i].body.immovable = true;
            explosionList.add(fire[i]);
        }

        for (i = 0; i < fire.length; i++) {
            if(game.physics.arcade.overlap(fire[i], wallList)){
                fire[i].kill();
                if(i > 0 && fire[i + 4] !== undefined){
                    fire[i + 4].kill();
                }
            }
        }

        setTimeout(function(){
            explosionList.forEach(function(element){
                element.kill();
            });

        }, 1000);
    },

    dropBomb: function(player){
        var gridX;
        var gridY;
        var bomb;
        var detonateBomb;
        var explosionList;
        var wallList;

        if(player == 1  && this.playerDrop){
            this.playerDrop = false;
            gridX = this.player.x - this.player.x % 40;
            gridY = this.player.y - this.player.y % 40;

            bomb = game.add.sprite(gridX, gridY, 'bomb');
            game.physics.arcade.enable(bomb);
            bomb.body.immovable = true;
            this.bombList.add(bomb);

            detonateBomb = this.detonateBomb;
            explosionList = this.explosionList;
            wallList = this.wallList;

            setTimeout(function(){
                bomb.kill();
                detonateBomb(player, bomb.x, bomb.y, explosionList, wallList);
                mainState.enablePlayerBomb(1);
            }, 2000);

            setTimeout(this.thisEnableBomb, 2000);
        } else if(player == 2 && this.player2Drop) {
            this.player2Drop = false;
            gridX = this.player2.x - this.player2.x % 40;
            gridY = this.player2.y - this.player2.y % 40;

            bomb = game.add.sprite(gridX, gridY, 'bomb');
            game.physics.arcade.enable(bomb);
            bomb.body.immovable = true;
            this.bombList2.add(bomb);

            detonateBomb = this.detonateBomb;
            explosionList2 = this.explosionList;
            wallList = this.wallList;

            setTimeout(function(){
                bomb.kill();
                detonateBomb(player, bomb.x, bomb.y, explosionList, wallList);
                mainState.enablePlayerBomb(1);
            }, 2000);
        }
    },

    enablePlayerBomb: function(player){
        if(player == 1){
            this.playerDrop = true;
        } else {
            this.player2Drop = true;
        }
    },

    addGround: function(x, y){
        var wall = game.add.sprite(x * this.PIXEL_SIZE, y * this.PIXEL_SIZE, 'grass');
        wall.body.immovable = true;
    },

    addGrass: function(x, y){
        var grass = game.add.sprite(x * this.PIXEL_SIZE, y * this.PIXEL_SIZE, 'grass');
        game.physics.arcade.enable(grass);
        grass.body.immovable = true;
        this.grassList.add(grass);

    },

    showGameWinner: function(player){
        if(player == null){
            this.button = game.add.button(230, 350, 'start-game');
        } else {
            this.gameMessage = game.add.text(0, 0, "GAME OVER!\nPLAYER " + player + " WINS", this.messageStyle);
            this.gameMessage.setTextBounds(0, 0, 600, 560);
            this.button = game.add.button(230, 350, 'start-game');

        }
        this.button.onInputUp.add(function(){
            this.restartGame();
        }, this);
    },

    restartGame: function(){
        gameInPlay = true;
        game.state.start('main');
    },

    // TODO: Implement functions
    messageHandlePlayerPos: function (msg) {
        console.log(msg.msg_code + " probably IS HANDLED");
        if(msg.nick != this.nickName) {
            console.log("msg: " + msg.nick + "saved: " + this.nickName);
            this.player2.x = msg.x;
            this.player2.y = msg.y;
        }
    },

    messageHandleWelcome: function (msg) {
        console.log(msg.msg_code + " IS NOT HANDLED");
    },

    messageHandleBombPlanted: function (msg) {
        console.log(msg.msg_code + " IS NOT HANDLED");
    },

    messageHandleBombExploded: function (msg) {
        console.log(msg.msg_code + " IS NOT HANDLED");
    },

    messageHandleCurrentScore: function (msg) {
        console.log(msg.msg_code + " IS NOT HANDLED");
    },

    messageHandleNewBombBox: function (msg) {
        console.log(msg.msg_code + " IS NOT HANDLED");
    },

    messageHandleBombAmount: function (msg) {
        console.log(msg.msg_code + " IS NOT HANDLED");
    },

    messagePlayerMove: function(x, y, uid) { // TODO: Call when player moves, probably UIDs can be ignored
        const msg = {
            "msg_code": "player_move",
            "x": x,
            "y": y,
            "uid": uid
        }
        doSend(JSON.stringify(msg));
    },

    messagePlayerPlantBomb: function (uid) { // TODO: Call when bomb has been planted
        const msg = {
            "uid": uid
        }
        doSend(JSON.stringify(msg));
    },

    saveNickName: function (nickName) {
        this.nickName = nickName;
        console.log("Nickname: " + this.nickName);
    }

};

var GAME_SIZE = 600;
var gameInPlay = false;
var game = new Phaser.Game(GAME_SIZE, GAME_SIZE);
game.state.add('main', mainState);
game.state.start('main');
