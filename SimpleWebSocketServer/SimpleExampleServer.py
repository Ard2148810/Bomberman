'''
The MIT License (MIT)
Copyright (c) 2013 Dave P.
'''

import signal
import sys
import ssl
from SimpleWebSocketServer import WebSocket, SimpleWebSocketServer, SimpleSSLWebSocketServer
from optparse import OptionParser


class SimpleEcho(WebSocket):

   def handleMessage(self):
      self.sendMessage(self.data)

   def handleConnected(self):
      pass

   def handleClose(self):
      pass


class Room:
   rooms_number = 0
   connections = {}

   def __init__(self):
      self.id = self.rooms_number
      self.rooms_number += 1
      self.connected = []

   def connect(self, client):
      self.connected.append(client)
      self.connections[client] = self.id

   def disconnect(self, client):
      self.connected.remove(client)
      del self.connections[client]

   def send_message(self, message, sender):
      for client in self.connected:
         if sender != client:
            client.sendMessage(message)


rooms = [Room()]


clients = []


class SimpleChat(WebSocket):

   def handleMessage(self):
      client_room_id = Room.connections[self]
      rooms[client_room_id].send_message(self.data, self)

   def handleConnected(self):
      print (self.address, 'connected')
      rooms[0].connect(self)
      rooms[0].send_message(self.address[0] + u' - connected', self)

   def handleClose(self):
      client_room_id = Room.connections[self]
      rooms[client_room_id].send_message(self.address[0] + u' - disconnected', self)
      print (self.address, 'closed')
      rooms[client_room_id].disconnect(self)



if __name__ == "__main__":

   parser = OptionParser(usage="usage: %prog [options]", version="%prog 1.0")
   parser.add_option("--host", default='', type='string', action="store", dest="host", help="hostname (localhost)")
   parser.add_option("--port", default=8000, type='int', action="store", dest="port", help="port (8000)")
   parser.add_option("--example", default='echo', type='string', action="store", dest="example", help="echo, chat")
   parser.add_option("--ssl", default=0, type='int', action="store", dest="ssl", help="ssl (1: on, 0: off (default))")
   parser.add_option("--cert", default='./cert.pem', type='string', action="store", dest="cert", help="cert (./cert.pem)")
   parser.add_option("--key", default='./key.pem', type='string', action="store", dest="key", help="key (./key.pem)")
   parser.add_option("--ver", default=ssl.PROTOCOL_TLSv1, type=int, action="store", dest="ver", help="ssl version")

   (options, args) = parser.parse_args()

   cls = SimpleEcho
   if options.example == 'chat':
      cls = SimpleChat

   if options.ssl == 1:
      server = SimpleSSLWebSocketServer(options.host, options.port, cls, options.cert, options.key, version=options.ver)
   else:
      server = SimpleWebSocketServer(options.host, options.port, cls)

   def close_sig_handler(signal, frame):
      server.close()
      sys.exit()

   signal.signal(signal.SIGINT, close_sig_handler)

   server.serveforever()
