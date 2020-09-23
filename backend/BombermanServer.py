'''
The MIT License (MIT)
Copyright (c) 2013 Dave P.
'''
import json
import signal
import sys
import ssl
import time
import uuid
import threading
from optparse import OptionParser
from random import randrange

from backend.library.SimpleWebSocketServer import WebSocket, SimpleSSLWebSocketServer, SimpleWebSocketServer

bombTickingTime = 3
moveCooldown = 0.1


class Bomb:

    def __init__(self, bombermanServer, x, y, x_range, y_range, player):
        self.id = uuid.uuid4()
        self.bombermanServer = bombermanServer
        self.x_range = x_range
        self.y_range = y_range
        self.x = x
        self.y = y
        self.player = player

    def start_ticking(self):
        time.sleep(bombTickingTime)
        self.bombermanServer.bombs.remove(self)
        self.bombermanServer.send_bomb_exploded(self)
        if self.player.bombAmount < self.player.maxBombs:
            self.player.bombAmount += 1


class BombermanServer:

    def __init__(self):
        self.map_size_x = 10
        self.map_size_y = 10
        self.bombs_amount = 1
        self.bombs = []
        self.boxAmount = 150
        self.players = []
        self.box = []
        self.giftsAmount = 10
        self.gifts = []
        self.playersPositions = [[1, 1], [1, self.map_size_y-1], [self.map_size_x-1, 1], [self.map_size_x-1, self.map_size_y-1]]
        self.voidBoxes = [[1, 2], [2, 1], [self.map_size_x - 2, 1], [self.map_size_x-1, 2], [1, self.map_size_y - 2],
                         [2, self.map_size_y-1], [self.map_size_x - 2, self.map_size_y-1],
                         [self.map_size_x-1, self.map_size_y - 2]]
        self.standardBoxes = []
        self.generate_standardBoxes()
        self.voidBoxes.append(self.standardBoxes)

        print (self.standardBoxes)

    def generate_standardBoxes(self):
        for x in range(2, self.map_size_x-1, 2):
            for y in range(2, self.map_size_y-1, 2):
                self.standardBoxes.append([x, y])

    def start_game(self):
        # self.send_msg_to_all_players("players has connected: ")
        print(self.players.__len__())
        if self.players.__len__() == 2:
            for i in range(0,self.players.__len__()):
                self.players[i].x = self.playersPositions[i][0]
                self.players[i].y = self.playersPositions[i][1]

            self.send_welcome_msg()
            threading.Thread(target=self.send_positions).start()

    def send_msg_to_all_players(self, msg):
        print(str(msg).replace("'", "\""))
        for player in self.players:
            player.sendMessage(str(msg).replace("'", "\""))

    def generate_gifts(self):
        for i in range(0, self.giftsAmount):
            giftX=randrange(1,self.map_size_x-1)
            giftY=randrange(1,self.map_size_y-1)
            if [giftX,giftY] not in self.standardBoxes:
                self.gifts.append(
                    {
                        "uid": str(uuid.uuid4()),
                        "pos": [giftX, giftY],
                        "type": randrange(2)
                    }
                )


    def generate_boxes(self):
        for i in range(0, self.boxAmount):
            generatedCoords = [randrange(1,self.map_size_x), randrange(1,self.map_size_y)]
            if generatedCoords in self.voidBoxes or generatedCoords in self.playersPositions or generatedCoords in self.standardBoxes or generatedCoords in [d['pos'] for d in self.box]:
                continue

            self.box.append(
                {
                    "uid": str(uuid.uuid4()),
                    "pos": generatedCoords
                }
            )

    def send_welcome_msg(self):
        self.generate_boxes()
        self.generate_gifts()
        msg = {"msg_code": "welcome_msg"}
        msg["map_size_x"] = self.map_size_x + 1
        msg["map_size_y"] = self.map_size_y + 1
        msg["bombs_amount"] = self.bombs_amount
        msg["current_score"] = 0
        msg["box"] = self.box
        msg["gifts"] = self.gifts
        for player in self.players:
            msg["client_uid"] = player.name
            print(str(msg).replace("'", "\""))
            player.sendMessage(str(msg).replace("'", "\""))


    def add_new_player(self, player):
        self.players.append(player)

    def remove_player(self, player):
        self.players.remove(player)

    def send_bomb_planted(self, x, y, x_range, y_range, player):
        msg = {"msg_code": "Bomb has been planted", "x": x, "y": y}
        newBomb = Bomb(self, x, y, x_range, y_range, player)
        threading.Thread(target=newBomb.start_ticking).start()
        self.bombs.append(newBomb)
        msg["bomb_uid"] = str(newBomb.id)
        self.send_msg_to_all_players(msg)

    def evaluate_blast(self, blastRange, bomb, mode):
        objects_hit = []
        for i in blastRange:
            if mode == "x":
                blastPos = [i, bomb.y]
            else:
                blastPos = [bomb.x, i]
            for standardBox in self.standardBoxes:
                if standardBox == blastPos:
                    return objects_hit


            for box in self.box:
                if box["pos"] == blastPos:
                    self.box.remove(box)
                    objects_hit.append(box["uid"])
                    return objects_hit

            for player in self.players:
                if [player.x, player.y] == blastPos:
                    objects_hit.append(player.name)
                    msg = {
                        "msg_code": "Bomb exploded",
                        "bomb_uid": str(bomb.id),
                        "x_range": bomb.x_range,
                        "y_range": bomb.y_range,
                        "objects_hit": objects_hit
                    }
                    player.sendMessage(str(msg).replace("'", "\""))
                    self.players.remove(player)
                    bomb.player.score += 1
                    msg = {"msg_code": "current score", "score": bomb.player.score}
                    bomb.player.sendMessage(str(msg).replace("'", "\""))
        return objects_hit

    def send_bomb_exploded(self, bomb):
        objects_hit = []

        blastRange = range(bomb.x + 1, bomb.x + bomb.x_range + 1)
        objects_hit.extend(self.evaluate_blast(blastRange, bomb, "x"))
        blastRange = range(bomb.x - 1, bomb.x - bomb.x_range - 1, -1)
        objects_hit.extend(self.evaluate_blast(blastRange, bomb, "x"))
        blastRange = range(bomb.y + 1, bomb.y + bomb.y_range + 1)
        objects_hit.extend(self.evaluate_blast(blastRange, bomb, "y"))
        blastRange = range(bomb.y - 1, bomb.y - bomb.y_range - 1, -1)
        objects_hit.extend(self.evaluate_blast(blastRange, bomb, "y"))
        blastRange = range(bomb.x, bomb.x + 1)
        objects_hit.extend(self.evaluate_blast(blastRange, bomb, "x"))

        msg = {
            "msg_code": "Bomb exploded",
            "bomb_uid": str(bomb.id),
            "x_range": bomb.x_range,
            "y_range": bomb.y_range,
            "objects_hit": objects_hit
        }


        self.send_msg_to_all_players(msg)

    def send_positions(self):
        msg = {"msg_code": "player_pos"}
        while (1):
            time.sleep(moveCooldown)
            for player in self.players:
                if player.hasNextMove:
                    playerPos = [player.next_x, player.next_y]
                    player.hasNextMove = False
                    player.x = player.next_x
                    player.y = player.next_y

                    for gift in bombermanServer.gifts:
                        if gift["pos"] == playerPos:
                            if gift["type"] == 0:
                                player.maxBombs += 1
                                player.bombAmount += 1
                                msg2 = {"msg_code": "bomb_amount", "amount": player.bombAmount}
                                player.sendMessage(str(msg2).replace("'", "\""))
                            if gift["type"] == 1:
                                player.x_range += 1
                                player.y_range += 1
                            bombermanServer.gifts.remove(gift)

                msg["nick"] = player.name
                msg["x"] = player.x
                msg["y"] = player.y
                self.send_msg_to_all_players(msg)


bombermanServer = BombermanServer()


class Player(WebSocket):

    def handleMessage(self):
        msg = json.loads(self.data)
        if msg["msg_code"] == "connect":
            self.name = msg["nick"]
            self.x_range = 1
            self.y_range = 1
            self.score = 0
            self.bombAmount = 1
            self.maxBombs = 1
            self.hasNextMove = False
            bombermanServer.add_new_player(self)
            bombermanServer.start_game()
        if msg["msg_code"] == "player_move":
            print (msg)
            print(msg["x"])
            isntOnBox = True
            newPlayerPos = [msg["x"], msg["y"]]
            print(self.name)
            for box in bombermanServer.box:
                if newPlayerPos == box["pos"]:
                    isntOnBox = False
                    break
            for box in bombermanServer.standardBoxes:
                if newPlayerPos == box:
                    isntOnBox = False
                    break

            if abs(self.x - msg["x"]) <= 1 and abs(self.y - msg["y"]) <= 1 \
                   and msg["x"] <= bombermanServer.map_size_x-1 and msg["y"] <= bombermanServer.map_size_y-1 \
                   and msg["x"] >= 1 and msg["y"] >= 1 \
                   and isntOnBox and ~self.hasNextMove:
                self.next_x = msg["x"]
                self.next_y = msg["y"]
                self.hasNextMove = True

        if msg["msg_code"] == "player_plant_bomb":
            if self.bombAmount > 0:
                self.bombAmount -= 1
                msg = {"msg_code": "bomb_amount", "amount": self.bombAmount}
                self.sendMessage(str(msg).replace("'", "\""))
                bombermanServer.send_bomb_planted(self.x, self.y, self.x_range, self.y_range, self)
        if msg["msg_code"] == "disconnect":
            bombermanServer.remove_player(self)

    def handleConnected(self):
        pass

    def handleClose(self):
        pass


# class SimpleEcho(WebSocket):
#
#     def handleMessage(self):
#         self.sendMessage(self.data)
#
#     def handleConnected(self):
#         pass
#
#     def handleClose(self):
#         pass


# class Room:
#     rooms_created = 0
#     connections = {}
#
#     def __init__(self):
#         self.id = Room.rooms_created
#         Room.rooms_created += 1
#         self.connected = []
#
#     def connect(self, client):
#         self.connected.append(client)
#         self.connections[client] = self.id
#
#     def disconnect(self, client):
#         self.connected.remove(client)
#         del self.connections[client]
#
#     def send_message(self, message, sender):
#         for client in self.connected:
#             if sender != client:
#                 client.sendMessage(message)
#
#
# rooms = [Room(), Room(), Room()]
#
#
# class SimpleChat(WebSocket):
#
#     def handleMessage(self):
#         client_room_id = Room.connections[self]
#         rooms[client_room_id].send_message(self.data, self)
#
#     def handleConnected(self):
#         room_id = SimpleChat.get_room_id(self)
#         print(self.address, 'connected to room', room_id)
#         rooms[room_id].connect(self)
#         rooms[room_id].send_message(self.address[0] + u' - connected to room ' + str(room_id), self)
#
#     @staticmethod
#     def get_room_id(client):
#         path = client.request.path.split('/')
#         room_id = int(path[2])
#         return room_id
#
#     def handleClose(self):
#         client_room_id = Room.connections[self]
#         rooms[client_room_id].send_message(self.address[0] + u' - disconnected', self)
#         print(self.address, 'closed')
#         rooms[client_room_id].disconnect(self)


if __name__ == "__main__":

    parser = OptionParser(usage="usage: %prog [options]", version="%prog 1.0")
    parser.add_option("--host", default='', type='string', action="store", dest="host", help="hostname (localhost)")
    parser.add_option("--port", default=8000, type='int', action="store", dest="port", help="port (8000)")
    parser.add_option("--example", default='chat', type='string', action="store", dest="example", help="echo, chat")
    parser.add_option("--ssl", default=0, type='int', action="store", dest="ssl", help="ssl (1: on, 0: off (default))")
    parser.add_option("--cert", default='./cert.pem', type='string', action="store", dest="cert",
                      help="cert (./cert.pem)")
    parser.add_option("--key", default='./key.pem', type='string', action="store", dest="key", help="key (./key.pem)")
    parser.add_option("--ver", default=ssl.PROTOCOL_TLSv1, type=int, action="store", dest="ver", help="ssl version")

    (options, args) = parser.parse_args()

    cls = Player
    # if options.example == 'chat':
    #     cls = SimpleChat

    if options.ssl == 1:
        server = SimpleSSLWebSocketServer(options.host, options.port, cls, options.cert, options.key,
                                          version=options.ver)
    else:
        server = SimpleWebSocketServer(options.host, options.port, cls)


    def close_sig_handler(signal, frame):
        server.close()
        sys.exit()


    signal.signal(signal.SIGINT, close_sig_handler)

    print("Server has started")
    server.serveforever()
