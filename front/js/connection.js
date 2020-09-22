class ServerConnection {
    constructor(url, nick, onclose, msgHandlers) {
        this.ws = new WebSocket(url);
        this.nick = nick;
        this.ws.onopen = this.onopen;
        this.ws.onmessage = this.onmessage;
        this.ws.onclose = onclose;
        this.msgHandlers = msgHandlers;
    }

    onopen = (e) => {
        console.log("Connected");
        const msg = {
            msg_code: "connect",
            nick: this.nick
        }
        this.ws.send(JSON.stringify(msg));
    }

    onmessage = (e) => {
        const msg = JSON.parse(e.data);
        console.log(msg);

        switch (msg.msg_code) {
            case "welcome_msg":
                this.msgHandlers.handleWelcomeMsg(msg);
                break;
            case "player_pos":
                this.msgHandlers.handlePlayerPos(msg);
                break;
            case "Bomb has been planted":
                this.msgHandlers.handleBombHasBeenPlanted(msg);
                break;
            case "Bomb exploded":
                console.log("^^^ UNHANDLED MESSAGE ^^^");
                break;
            case "current score":
                console.log("^^^ UNHANDLED MESSAGE ^^^");
                break;
            case "new_bomb_box":
                console.log("^^^ UNHANDLED MESSAGE ^^^");
                break;
            case "bomb_amount":
                console.log("^^^ UNHANDLED MESSAGE ^^^");
                break;

        }
    }

    disconnect = (uid) => {
        const msg = {
            msg_code: "disconnect",
            uid: uid
        }
        this.sendMessage(msg);
        this.ws.close();
    }

    sendMessage = (msg) => {
        this.ws.send(JSON.stringify(msg));
    }
}



