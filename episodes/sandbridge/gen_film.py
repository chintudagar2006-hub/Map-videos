"""film.json for "He Poured Sand Under a 500-Ton Bridge" (narrated, the user's script word for word)."""
import json, math
L = {l["i"]: l for l in json.load(open("voice/lines.json"))}
W = json.load(open("voice/words.json"))
FPS = 30
def S(t): return {"s": round(t, 3)}
def st(i): return L[i]["start"]
def en(i): return L[i]["end"]
def wtime(i, n): ix = [w for w in W if w["line"] == i]; return ix[min(n, len(ix) - 1)]["s"]
def widx(i): ix = [k for k, w in enumerate(W) if w["line"] == i]; return [ix[0], ix[-1]]
PZ = -0.2                                     # top of the footing pads
def cam(target, framing, side=0.0, lens=32, height=None, look_up=0.0):
    fov = 2 * math.degrees(math.atan(18 / lens)); half = math.tan(math.radians(fov / 2))
    h = {"C": 1.15, "M": 1.6, "W": 2.2, "O": .75, "P": 5.5, "X": 9.0}[framing]
    d = h / half; a = math.radians(side); x, y, z = target
    zc = z - .16 * h + look_up; cz = height if height is not None else zc - .1
    fr = "P" if framing == "X" else framing
    return {"pos": [round(x + math.sin(a) * d, 3), round(y - math.cos(a) * d, 3), round(cz, 3)], "aim": [x, y, round(zc, 3)], "lens": lens, "framing": fr}
def raw(pos, aim, lens, framing): return {"pos": pos, "aim": aim, "lens": lens, "framing": framing}
def station(t, subject, c, travel=None, **kw):
    s = {"at": S(t), "lead": 3, "subject": subject, "hold": .25, **c, **kw}
    if travel is not None: s["travel"] = travel
    return s
acts, takes, fx, kicks, moods, sentences = [], [], [], [], [], []
def act(who, t, **kw):
    if "pos" in kw and "move_s" not in kw: kw["move_s"] = .03
    acts.append({"who": who, "at": S(t), **kw})
FLAP = {"rage": "scream"}
def shout(who, i, face="rage", **kw):
    t = st(i); k = 0; act(who, t, face=face, **kw)
    while t + 4 / FPS < en(i): t += 4 / FPS; k += 1; act(who, t, face=FLAP.get(face, "scream") if k % 2 else face)
    act(who, en(i), face=face)
SUBJ = {1: "eng", 2: "our_arch", 3: "arch", 4: "arch", 5: "arch", 6: "eng", 7: "sand_box", 8: "our_arch", 9: "our_arch", 10: "our_arch", 11: "wk1", 12: "rival_arch",
        13: "crack", 14: "arch", 15: "eng", 16: "eng", 17: "plug", 18: "sand_box", 19: "our_arch", 20: "our_arch"}
for i in L: sentences.append({"text": L[i]["text"], "words": widx(i), "subject": SUBJ[i]})
OFF = [80, 80, 0]
ENG = [-0.55, -1.75, PZ]; ARC = [1.0, -1.6, PZ]
HE, HA, HW = 1.5, 1.55, 1.6
def head(p, h): return [p[0], p[1], p[2] + h]

# ---------- L1-L7 (DAY): the sand, the race, the red face, the silent kid
act("eng", 0, pos=ENG, view="34", dir=-1, pose="kneel_work", face="standard")
act("arch", 0, pos=OFF, view="34", dir=-1, pose="stand", face="standard")
for w in ("wk1", "wk2"): act(w, 0, pos=OFF, view="34", dir=1, pose="stand", face="standard")
act("eng", wtime(1, 6), face="cool")
act("arch", st(3) - .05, pos=[2.6, -1.7, PZ], view="34", dir=-1, pose="walk0", face="sus")
act("arch", st(3) + .6, pos=ARC, pose="stand", face="confused", move_s=.9)
act("arch", st(4), face="rage", pose="hands_hips")
shout("arch", 5, pose="point_out", dir=-1)
act("arch", en(5) + .05, face="rage", pose="hands_hips")
act("eng", st(6), face="standard", pose="kneel_work")
act("eng", st(7), face="cool", pose="kneel_hammer")
act("eng", wtime(7, 3), pose="kneel_hammer_hit")
day = [
    station(0, "sand_box", cam([-1.2, -1.2, PZ + .5], "O", side=-20, lens=28, height=PZ + .45)),
    station(wtime(1, 3), "eng", cam(head(ENG, HE - .4), "M", side=-18, lens=28), travel=1.0),
    station(wtime(1, 7), "our_arch", cam([0, 0, 3.0], "P", side=-6, lens=24, height=.4, look_up=1.0), travel=1.4),
    station(st(2) + .4, "our_arch", raw([-5, -19, 8.5], [0, 9, 1.0], 24, "P"), travel=2.4),
    station(st(3), "arch", cam([0.2, -1.6, PZ + 1.3], "W", side=-4, lens=24), travel=1.0),
    station(st(4), "arch", cam(head(ARC, HA), "C", side=-16, lens=36), travel=.7),
    station(st(5) + .3, "arch", cam([0.25, -1.65, PZ + 1.25], "W", side=8, lens=26), travel=.6),
    station(wtime(5, 9), "arch", cam(head(ARC, HA), "C", side=-10, lens=40), travel=.6),
    station(st(6), "eng", cam(head(ENG, HE - .4), "C", side=20, lens=38), travel=.7),
    station(st(7), "sand_box", cam([-1.2, -1.2, PZ + .45], "O", side=-25, lens=32), travel=.8),
]
takes.append({"id": "day", "place": "site_day", "stations": day})
fx += [{"at": S(wtime(1, 2)), "kind": "dust_puff", "on": "sand_box"}, {"at": S(st(4)), "kind": "steam", "on": "arch"}, {"at": S(st(5) + .2), "kind": "scream", "on": "arch"},
       {"at": S(wtime(7, 3)), "kind": "knock_hit", "on": "sand_box"}, {"at": S(wtime(7, 5)), "kind": "glint", "on": "plug"}]
moods += [{"at": S(st(4)), "look": "flash_red"}, {"at": S(st(6)), "look": "spot_hero"}]
kicks += [{"at": S(st(5) + .2), "amp": 1.6}]

# ---------- L8-L13 (GOLDEN): months later, the hardest part, the axes, the crack
G0 = st(8) - .05
act("eng", G0, pos=[-3.0, -1.9, PZ], view="front", dir=1, pose="stand", face="cool")
act("arch", G0, pos=[3.2, -1.8, PZ], view="34", dir=-1, pose="hands_hips", face="proud")
WK1 = [-1.85, 16.35, PZ]; WK2 = [1.95, 16.35, PZ]
act("wk1", st(11) - .05, pos=WK1, view="34", dir=1, pose="grip_swing", face="rage", prop="axe", hand="R")
act("wk2", st(11) - .05, pos=WK2, view="34", dir=-1, pose="grip_swing", face="strain", prop="axe", hand="R")
for k, t in enumerate([st(11) + .5 + j * .45 for j in range(int((en(12) - st(11)) / .45))]):
    act("wk1", t, pose="grip_raise" if k % 2 else "grip_swing"); act("wk2", t + .2, pose="grip_raise" if k % 2 else "grip_swing")
CR = wtime(13, 4)
act("wk1", CR, pose="flinch", face="terrified", prop=None); act("wk2", CR + .1, pose="flinch", face="scream", prop=None)
gold = [
    station(G0, "our_arch", raw([7, -17, 6.0], [0, 6, 2.0], 24, "P"), hold=.3),
    station(wtime(8, 3), "our_arch", cam([0, 0, 3.0], "P", side=-4, lens=24, height=1.0, look_up=.6), travel=1.6),
    station(st(9), "our_arch", cam([0, 0, 1.6], "W", side=-12, lens=22, height=.35, look_up=1.3), travel=1.2),
    station(wtime(10, 4), "our_arch", raw([0.3, -4.6, 0.3], [0, 0, 2.9], 22, "W"), travel=1.0),
    station(st(11), "wk1", cam([0, 16.4, PZ + 1.4], "W", side=-6, lens=22), travel=.5),
    station(wtime(11, 6), "wk1", cam(head(WK1, HW), "M", side=-24, lens=30), travel=.7),
    station(st(12), "rival_arch", cam([0, 18, 3.2], "P", side=4, lens=24, height=.6, look_up=.8), travel=.8),
    station(st(13), "rival_arch", cam([0.15, 16.25, 4.0], "M", side=-4, lens=28, height=2.6), travel=.6),
    station(CR + .1, "crack", cam([0.15, 16.25, 4.2], "O", side=-2, lens=34, height=3.2), travel=.4),
]
takes.append({"id": "gold1", "place": "site_gold", "stations": gold})
for j in range(int((en(12) - st(11)) / .45)): kicks.append({"at": S(st(11) + .5 + j * .45), "amp": .8})
kicks.append({"at": S(CR), "amp": 2.6})
fx += [{"at": S(st(11) + .5), "kind": "dust_hit", "on": "wk1"}, {"at": S(st(12) + .4), "kind": "dust_hit", "on": "rival_arch"}, {"at": S(CR), "kind": "knock_hit", "on": "crack"}, {"at": S(CR + .3), "kind": "dust_puff", "on": "crack"}]
moods += [{"at": S(st(8)), "look": "warm_up"}, {"at": S(CR), "look": "flash_red"}]

# ---------- L14-L20 (GOLDEN, our bridge): the sweating architect, the tiny wrench, the plug, the hourglass, the lock
act("arch", st(14) - .05, pos=[1.3, -1.75, PZ], view="front", dir=1, pose="flinch", face="terrified")
act("arch", wtime(14, 7), face="strain", pose="hands_hips")
act("eng", st(15) - .05, pos=[3.6, -1.75, PZ], view="34", dir=-1, pose="walk0", face="cool", prop="key", hand="R")
steps = int((en(15) - st(15)) / .3)
for k in range(1, steps + 1):
    u = k / steps; act("eng", st(15) + (en(15) - st(15)) * u, pos=[round(3.6 + (-0.55 - 3.6) * u, 3), -1.75, PZ], pose="walk1" if k % 2 else "walk0", move_s=.32)
act("eng", st(16), pos=ENG, pose="kneel", face="cool", view="34", dir=-1)
act("eng", st(17), pose="kneel_work", face="sus")
act("eng", st(18), pose="kneel", face="cool")
act("arch", st(18) + .3, face="jawdrop", pose="flinch")
act("arch", st(19) + .5, face="starstruck", pose="stand")
act("arch", st(20) + .4, face="delight", pose="cheer")
act("eng", wtime(20, 9), face="cool", pose="stand", pos=[-0.2, -1.8, PZ])
end_t = en(20) + 2.0
fin = [
    station(st(14) - .1, "arch", cam(head([1.3, -1.75, PZ], HA), "C", side=-12, lens=36)),
    station(st(15), "eng", cam([2.6, -1.75, PZ + 1.3], "W", side=-20, lens=24, height=.6), travel=.8),
    station(wtime(15, 8), "eng", cam([.6, -1.75, PZ + 1.3], "W", side=-14, lens=24, height=.5), travel=1.6),
    station(st(16), "eng", cam(head(ENG, HE - .45), "M", side=-25, lens=30), travel=.8),
    station(st(17), "plug", cam([-1.2, -1.55, PZ + .12], "O", side=-12, lens=40, height=PZ + .35), travel=.8),
    station(st(18), "sand_box", cam([-1.2, -1.6, PZ + .2], "O", side=-30, lens=32, height=PZ + .5), travel=.6),
    station(wtime(18, 6), "sand_box", cam([-.4, -1.2, PZ + .6], "M", side=-20, lens=26, height=PZ + .9), travel=1.2),
    station(st(19), "our_arch", raw([-2.5, -3.6, 3.5], [-3.6, -1.4, 4.0], 36, "O"), travel=1.2),
    station(wtime(19, 4), "our_arch", raw([-2.9, -3.2, 3.8], [-3.6, -1.4, 4.05], 46, "O"), travel=1.6),
    station(st(20), "our_arch", cam([0, 0, 3.0], "P", side=-6, lens=24, height=.6, look_up=1.0), travel=1.6),
    station(wtime(20, 9), "our_arch", cam([0, 0, 2.6], "P", side=14, lens=22, height=1.6, look_up=.6), travel=2.6),
]
takes.append({"id": "gold2", "place": "site_gold", "stations": fin})
POUR = [round(st(18) + .1, 2), round(en(19) + .6, 2)]
fx += [{"at": S(st(14) + .2), "kind": "sweat", "on": "arch"}, {"at": S(wtime(14, 7)), "kind": "sweat", "on": "arch"}, {"at": S(st(15) + .4), "kind": "glint", "on": "eng"},
       {"at": S(st(17) + .5), "kind": "glint", "on": "plug"}, {"at": S(st(18) + .1), "kind": "dust_puff", "on": "plug"}, {"at": S(wtime(20, 9)), "kind": "glow", "on": "our_arch"}]
moods += [{"at": S(st(14)), "look": "spot_dark"}, {"at": S(st(18)), "look": "warm_up"}, {"at": S(wtime(20, 9)), "look": "spot_hero"}]
for tk in takes:
    prev = None
    for s in tk["stations"]:
        if prev is not None:
            d = math.dist(prev["pos"], s["pos"]) + .6 * math.dist(prev["aim"], s["aim"])
            s["travel"] = round(max(s.get("travel", .5), min(2.6, .45 + d / 1.8)), 2)
        prev = s
film = {
    "title": "He Poured Sand Under a 500-Ton Bridge", "fps": FPS, "size": [1080, 1920], "words": "voice/words.json", "end": int(end_t * FPS), "kit3d": True, "tween": {"ones": True},
    "camera_idea": {"name": "The hourglass", "why": "The film is about patience against force: low, slow cranes up the huge arch for our kid, shaky handheld punches for the axes.", "signature": "The first and last shots crane from the tiny sand cylinder up to the 500-ton arch."},
    "cast": {"eng": {"puppet": "cast:engineer", "height": 1.7}, "arch": {"puppet": "cast:architect", "height": 1.75}, "wk1": {"puppet": "cast:worker", "height": 1.8}, "wk2": {"puppet": "cast:worker", "height": 1.8}},
    "places": {"site_day": {"set": "river", "light": "day", "built": False},
               "site_gold": {"set": "river", "light": "golden", "built": True, "pour": POUR, "chop": [round(st(11), 2), round(en(12), 2)], "crack": round(CR, 2)}},
    "held3d": [{"who": w, "obj": "axe", "module": "sets/lib.js", "builder": "buildAxe", "grip": "raise", "hand": "R", "by_pose": {"grip_swing": {"grip": "point"}}} for w in ("wk1", "wk2")]
              + [{"who": "eng", "obj": "key", "module": "sets/lib.js", "builder": "buildWrench", "grip": "point", "hand": "R"}],
    "takes": takes, "kicks": kicks, "acts": acts, "sentences": sentences, "fx": fx, "moods": moods, "sound": [],
}
json.dump(film, open("film.json", "w"), indent=1)
print("stations", sum(len(t["stations"]) for t in takes), "end", round(end_t, 2), "pour", POUR, "crack", round(CR, 2))
