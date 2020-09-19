let websocket;
let target;

function init() {
    document.connectionForm.inputUrl.value = "ws://localhost:8000/";
    document.connectionForm.disconnectButton.disabled = true;
}

function doConnect() {
    websocket = new WebSocket(document.connectionForm.inputUrl.value);
    websocket.onopen = function (evt) {
        onOpen(evt)
    };
    websocket.onclose = function (evt) {
        onClose(evt)
    };
    websocket.onmessage = function (evt) {
        onMessage(evt)
    };
    websocket.onerror = function (evt) {
        onError(evt)
    };

}

function onOpen(evt) {
    // Sending message with nickname when connected
    const connectMsg =
        {
            "msg_code": "connect",
            "nick": document.connectionForm.inputNickname.value
        };
    websocket.send(JSON.stringify(connectMsg));

    console.log("connected");
    handlePlayerConnected();

    document.connectionForm.connectButton.disabled = true;
    document.connectionForm.disconnectButton.disabled = false;
}

function onClose(evt) {
    console.log("disconnected");
    document.connectionForm.connectButton.disabled = false;
    document.connectionForm.disconnectButton.disabled = true;
}

function onMessage(evt) {   // TODO: Handling incoming messages from server
    console.log("Received message " + evt.data);    // DEBUG ONLY
    const msg = JSON.parse(evt.data);
    switch (msg.msg_code) {
        case "welcome_msg":
            messageHandleWelcome(msg);
            break;
        case "player_pos":
            messageHandlePlayerPos(msg);
            break;
        case "Bomb has been planted":
            messageHandleBombPlanted(msg);
            break;
        case "Bomb exploded":
            messageHandleBombExploded(msg);
            break;
        case "current score":
            messageHandleCurrentScore(msg);
            break;
        case "new_bomb_box":
            messageHandleNewBombBox(msg);
            break;
        case "bomb_amount":
            messageHandleBombAmount(msg);
            break;
        default:
            console.log("UNRECOGNIZED msg_code!");

    }
}

function onError(evt) {
    console.log('error: ' + evt.data);

    websocket.close();

    document.connectionForm.connectButton.disabled = false;
    document.connectionForm.disconnectButton.disabled = true;

}

function doSend(message) {  // TODO: Sending messages to server
    websocket.send(message);
}

window.addEventListener("load", init, false);


function doDisconnect() {
    websocket.close();
}

function sendText() {
    let json = document.connectionForm.debugRequests.value;
    doSend(json)
}


// Messages
// (UIDs are probably useless since server knows which player sends message, but they are kept for consistency)

function messageHandleWelcome(msg) {
    if(target !== null) {
        target.messageHandleWelcome(msg);
    }
}

function messageHandlePlayerPos(msg) {
    if(target !== null) {
        target.messageHandlePlayerPos(msg);
    }
}

function messageHandleBombPlanted(msg) {
    if(target !== null) {
        target.messageHandleBombPlanted(msg);
    }
}

function messageHandleBombExploded(msg) {
    if(target !== null) {
        target.messageHandleBombExploded(msg);
    }
}

function messageHandleCurrentScore(msg) {
    if(target !== null) {
        target.messageHandleCurrentScore(msg);
    }
}

function messageHandleNewBombBox(msg) {
    if(target !== null) {
        target.messageHandleNewBombBox(msg);
    }
}

function messageHandleBombAmount(msg) {
    if(target !== null) {
        target.messageHandleBombAmount(msg);
    }
}