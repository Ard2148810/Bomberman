from backend.BombermanServer import BombermanServer, Bomb

server=BombermanServer()
objects_hit=[]
bomb=Bomb()
bomb.x=2
bomb.y=2
bomb.x_range=2
bomb.y_range=2


for x in range(0,5):
    for y in range(0,5):
        if (x,y)==(3,2) or (x,y)==(4,2):
            pass
        else:
            server.box.append(
                {
                    "box_uid": str(x + y),
                    "box_pos": (x, y)
                }
            )



blastRange = range(bomb.x+1, bomb.x + bomb.x_range+1)
objects_hit.extend(server.evaluate_blast(blastRange, bomb, "x"))
blastRange = range(bomb.x-1, bomb.x - bomb.x_range-1,-1)
objects_hit.extend(server.evaluate_blast(blastRange, bomb, "x"))
blastRange = range(bomb.y+1, bomb.y + bomb.y_range+1)
objects_hit.extend(server.evaluate_blast(blastRange, bomb, "y"))
blastRange = range(bomb.y-1,bomb.y - bomb.y_range-1,-1)
objects_hit.extend(server.evaluate_blast(blastRange, bomb, "y"))
blastRange = range(bomb.x,bomb.x+1)
objects_hit.extend(server.evaluate_blast(blastRange, bomb, "x"))

print(objects_hit)