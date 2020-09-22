class ServerConnection {
    constructor(url, nick) {
        this.ws = new WebSocket(url);
        this.nick = nick;
        this.ws.onopen = this.onopen;
        this.ws.onmessage = this.onmessage;
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
                console.log("MSG");
                break;
            case "player_pos":
                console.log("MSG");
                break;
            case "Bomb has been planted":
                console.log("MSG");
                break;
            case "Bomb exploded":
                console.log("MSG");
                break;
            case "current score":
                console.log("MSG");
                break;
            case "new_bomb_box":
                console.log("MSG");
                break;
            case "bomb_amount":
                console.log("MSG");
                break;

        }
    }

    disconnect = (uid) => {
        const msg = {
            msg_code: "disconnect",
            uid: uid
        }
        this.ws.send(JSON.stringify(msg));
    }
}



