let websocket;

function init() {
    document.connectionForm.inputUrl.value = "ws://localhost:8000/";
    //document.myform.inputNickname.value = "Nickname";
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
    //writeToScreen("disconnected\n");
    console.log("disconnected");
    document.connectionForm.connectButton.disabled = false;
    document.connectionForm.disconnectButton.disabled = true;
}

function onMessage(evt) {
    //writeToScreen("response: " + evt.data + '\n');
    console.log("received message " + evt);
}

function onError(evt) {
    console.log('error: ' + evt.data);

    websocket.close();

    document.connectionForm.connectButton.disabled = false;
    document.connectionForm.disconnectButton.disabled = true;

}

function doSend(message) {
    //writeToScreen("sent: " + message + '\n');
    websocket.send(message);
}

function writeToScreen(message) {
    //document.connectionForm.outputtext.value += message
    //document.connectionForm.outputtext.scrollTop = document.connectionForm.outputtext.scrollHeight;

}

window.addEventListener("load", init, false);


function sendText() {
    //doSend(document.connectionForm.inputtext.value);
}

function clearText() {
    //document.connectionForm.outputtext.value = "";
}

function doDisconnect() {
    websocket.close();
}