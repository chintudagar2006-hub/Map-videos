"""film.json for "The Assassin Without His Glasses" (Viper). Narrated; faces carry every beat."""
import json, math
L = {l["i"]: l for l in json.load(open("voice/lines.json"))}
W = json.load(open("voice/words.json"))
FPS = 30
def S(t): return {"s": round(t, 3)}
def st(i): return L[i]["start"]
def en(i): return L[i]["end"]
def wtime(i, n): ix = [w for w in W if w["line"] == i]; return ix[min(n, len(ix) - 1)]["s"]
def widx(i): ix = [k for k, w in enumerate(W) if w["line"] == i]; return [ix[0], ix[-1]]
def cam(target, framing, side=0.0, lens=32, height=None, look_up=0.0):
    fov = 2 * math.degrees(math.atan(18 / lens)); half = math.tan(math.radians(fov / 2))
    h = {"C": 1.15, "M": 1.6, "W": 2.2, "O": .8, "P": 3.6}[framing]
    d = h / half; a = math.radians(side); x, y, z = target
    zc = z - .16 * h + look_up; cz = height if height is not None else zc - .1
    return {"pos": [round(x + math.sin(a) * d, 3), round(y - math.cos(a) * d, 3), round(cz, 3)], "aim": [x, y, round(zc, 3)], "lens": lens, "framing": framing}
def raw(pos, aim, lens, framing): return {"pos": pos, "aim": aim, "lens": lens, "framing": framing}
def station(t, subject, c, travel=None, **kw):
    s = {"at": S(t), "lead": 3, "subject": subject, "hold": .25, **c, **kw}
    if travel is not None: s["travel"] = travel
    return s
acts, takes, fx, kicks, moods, sentences = [], [], [], [], [], []
def act(who, t, **kw):
    if "pos" in kw and "move_s" not in kw: kw["move_s"] = .03
    acts.append({"who": who, "at": S(t), **kw})
SUBJ = {1: "viper", 2: "viper", 3: "viper", 4: "viper", 5: "chef", 6: "pot", 7: "viper", 8: "viper", 9: "chef", 10: "chef", 11: "viper", 12: "guard1", 13: "viper", 14: "viper", 15: "viper"}
for i in L: sentences.append({"text": L[i]["text"], "words": widx(i), "subject": SUBJ[i]})
OFF = [90, 90, 0]
HV, HC, HK, HG = 1.6, 1.5, 1.45, 1.55
def head(p, h): return [p[0], p[1], p[2] + h]
def walk(who, t0, t1, a, b, dirn, step=.3):
    n = max(2, int((t1 - t0) / step))
    for k in range(n + 1):
        u = k / n; act(who, t0 + (t1 - t0) * u, pos=[round(a[0] + (b[0] - a[0]) * u, 3), round(a[1] + (b[1] - a[1]) * u, 3), round(a[2] + (b[2] - a[2]) * u, 3)], pose="walk0" if k % 2 else "walk1", dir=dirn, view="34", move_s=step * 1.05)
for w in ("chef", "king", "guard1", "guard2"): act(w, 0, pos=OFF, view="front", dir=1, pose="stand", face="standard")

# ---------- L1-L3a ROOF (night)
RIDGE = [-1.2, 2.0, 7.85]; HATCH = [0.4, 0.6, 7.0]
act("viper", 0, pos=RIDGE, view="34", dir=1, pose="crouch", face="evil")
act("viper", st(2), face="sus", pose="crouch")
act("viper", wtime(2, 6), face="confused")
act("viper", st(3) - .05, pos=[HATCH[0] - .5, HATCH[1] + .5, HATCH[2] + .2], pose="jump", face="cool", move_s=.4)
act("viper", wtime(3, 4), pos=[HATCH[0], HATCH[1], HATCH[2] - 1.6], pose="fall", face="terrified", move_s=.35)
takes.append({"id": "roof", "place": "roof", "stations": [
    station(0, "viper", raw([0.3, -2.4, 7.9], [-0.9, 2.0, 9.3], 24, "W")),
    station(wtime(1, 6), "viper", cam(head(RIDGE, HV - .5), "M", side=-24, lens=30, height=7.6), travel=2.4),
    station(st(2) + .2, "viper", cam(head(RIDGE, HV - .5), "C", side=-10, lens=38, height=8.6), travel=1.0),
    station(st(3), "hatch", raw([2.0, -2.6, 9.4], [0.3, 0.8, 7.2], 26, "W"), travel=.8)]})
fx += [{"at": S(wtime(1, 8)), "kind": "glint", "on": "viper"}, {"at": S(wtime(2, 6)), "kind": "question", "on": "viper"}]
moods += [{"at": S(0), "look": "spot_dark"}]

# ---------- L3b-L10 KITCHEN
POT = [0.9, 2.6, 0]; LAND = [0.4, 0.9, 0]; VK = [0.0, 1.3, 0]; CK = [2.1, 1.2, 0]
t0 = wtime(3, 6)
act("viper", t0, pos=[LAND[0], LAND[1], 1.6], pose="fall", face="terrified", view="front", dir=1)
act("viper", t0 + .35, pos=LAND, pose="crouch", face="sus", move_s=.3)
act("viper", st(4) + .2, pos=[-0.1, 1.6, 0], view="34", dir=1, pose="kneel", face="cool")          # bows to the stew pot (the "king")
act("chef", st(5) - .05, pos=[3.2, 1.0, 0], view="34", dir=-1, pose="hold_up", face="evil", prop="cleaver", hand="R")
act("chef", st(5) + .5, pos=CK, move_s=.5); act("chef", wtime(5, 8), face="rage")
act("viper", st(5) + .3, pos=VK, pose="flinch", face="terrified", view="34", dir=1)
act("viper", st(6), pos=[0.25, 2.0, 0], pose="point_out", face="sus", view="34", dir=1)
act("viper", st(7), face="sick", pose="hand_mouth")
act("viper", st(8), face="starstruck", pose="cheer")
act("viper", wtime(8, 6), face="heartEyes", pose="hands_hips")
act("chef", st(8) + .3, face="confused", pose="stand", prop=None)
act("chef", st(9), face="wail", pose="hand_mouth")
act("chef", st(10), face="puppy", pose="cheer")
takes.append({"id": "kitchen", "place": "kitchen", "stations": [
    station(t0 - .05, "viper", raw([0.4, -1.6, 1.0], [0.4, 0.9, 2.4], 22, "W")),
    station(t0 + .5, "viper", cam(head(LAND, HV - .6), "M", side=-10, lens=28), travel=.8),
    station(st(4), "pot", raw([-1.8, -1.9, 1.7], [0.6, 2.4, 1.2], 22, "P"), travel=1.2),
    station(st(5), "chef", cam(head(CK, HC + .3), "M", side=-20, lens=28, height=.9), travel=.7),
    station(wtime(5, 8), "chef", cam(head(CK, HC + .2), "C", side=-12, lens=34, height=1.0), travel=.6),
    station(st(6), "pot", cam([0.9, 2.6, 1.35], "O", side=-25, lens=30, height=2.0), travel=.9),
    station(st(7), "viper", cam(head([0.25, 2.0, 0], HV), "C", side=-22, lens=36), travel=.7),
    station(st(8), "viper", cam(head([0.25, 2.0, 0], HV), "M", side=-8, lens=30), travel=.7),
    station(wtime(8, 6), "viper", cam(head([0.25, 2.0, 0], HV), "C", side=-15, lens=40), travel=.8),
    station(st(9), "chef", cam(head(CK, HC), "C", side=18, lens=36), travel=.7),
    station(st(10), "chef", cam([1.1, 1.6, 1.2], "W", side=6, lens=26), travel=1.0)]})
kicks += [{"at": S(t0 + .35), "amp": 2.2}, {"at": S(wtime(5, 8)), "amp": 1.6}]
fx += [{"at": S(t0 + .35), "kind": "dust_puff", "on": "viper"}, {"at": S(wtime(5, 8)), "kind": "glint", "on": "chef"}, {"at": S(st(6) + .6), "kind": "steam", "on": "pot"},
       {"at": S(st(7)), "kind": "sweat", "on": "viper"}, {"at": S(wtime(8, 6)), "kind": "shine", "on": "viper"}, {"at": S(st(9)), "kind": "drop", "on": "chef"}, {"at": S(st(9) + .5), "kind": "drop", "on": "chef"}]
moods += [{"at": S(wtime(5, 8)), "look": "flash_red"}, {"at": S(st(7)), "look": "spot_dark"}, {"at": S(st(8)), "look": "spot_hero"}, {"at": S(st(10)), "look": "warm_up"}]

# ---------- L11-L15 HALL: the invite, the checkpoint, the throne, the secret, food poisoning
G1 = [1.55, 2.6, 0]; G2 = [1.95, 3.5, 0]; KING = [0, 17.05, 0.4]
act("viper", st(11) - .05, pos=[-0.3, -1.4, 0], view="front", dir=1, pose="hold_up", face="cool", prop="platter", hand="R")
act("chef", st(11) - .05, pos=OFF)
act("guard1", st(11) - .05, pos=G1, view="34", dir=-1, pose="hold_up", face="sus", prop="cloche", hand="R")
act("guard2", st(11) - .05, pos=G2, view="34", dir=-1, pose="point_out", face="deadInside")
act("king", 0, pos=KING, view="front", dir=1, pose="sit_chair", face="evil")
walk("viper", st(12) + .2, en(12), [-0.3, -1.0, 0], [-0.5, 7.0, 0], 1, step=.32)
act("viper", en(12), prop="platter")
act("guard1", wtime(12, 4), face="sus", pose="hold_up"); act("guard2", wtime(12, 6), face="tired")
walk("viper", st(13), en(13) - .3, [-0.5, 9.5, 0], [-0.6, 15.7, .4], 1, step=.2)
act("viper", en(13) - .25, pos=[-0.75, 15.75, .4], pose="hold_up", face="evil", prop="platter", view="34", dir=1)
act("king", st(13) + .4, face="confused")
act("viper", st(14), face="sus")
act("viper", st(15) - .05, pos=[0.6, 15.6, .4], pose="lie_back", face="sick", prop=None, view="front", dir=1)
act("king", st(15) + .2, face="disgust")
takes.append({"id": "hall", "place": "hall", "stations": [
    station(st(11) - .1, "viper", cam(head([-0.3, -1.4, 0], HV), "M", side=-10, lens=30)),
    station(wtime(11, 8), "viper", cam(head([-0.3, -1.4, 0], HV), "C", side=8, lens=36), travel=.8),
    station(st(12), "guard1", raw([-1.6, -2.2, 1.9], [1.3, 3.2, 1.3], 22, "W"), travel=.9),
    station(wtime(12, 5), "guard1", cam(head(G1, HG), "M", side=-35, lens=30), travel=.9),
    station(wtime(12, 10), "viper", raw([1.4, 1.5, 1.5], [-0.5, 7.0, 1.4], 26, "W"), travel=1.0),
    station(st(13), "viper", raw([1.8, 10.5, 2.2], [-0.4, 16.0, 1.4], 22, "P"), travel=1.1),
    station(en(13) - .2, "king", cam(head(KING, HK - .3), "M", side=8, lens=30), travel=.8),
    station(st(14), "viper", cam(head([-0.75, 15.75, .4], HV), "C", side=-20, lens=40), travel=.5),
    station(st(15), "viper", raw([1.8, 13.4, 1.6], [0.5, 15.8, .6], 28, "W"), travel=.7),
    station(wtime(15, 6), "viper", raw([1.45, 13.9, 1.35], [0.35, 15.6, .62], 30, "M"), travel=2.2)]})
kicks += [{"at": S(st(15)), "amp": 1.8}]
fx += [{"at": S(st(12) + .4), "kind": "glint", "on": "guard1"}, {"at": S(en(13) - .3), "kind": "dust_puff", "on": "viper"}, {"at": S(st(15) + .2), "kind": "sweat", "on": "viper"},
       {"at": S(st(15) + .9), "kind": "whistle_zzz", "on": "viper"}, {"at": S(st(15) + .3), "kind": "steam", "on": "viper"}]
moods += [{"at": S(st(11)), "look": "warm_up"}, {"at": S(st(14)), "look": "spot_dark"}, {"at": S(st(15)), "look": "flash_warm"}]
END = en(15) + 2.6
for tk in takes:
    prev = None
    for s in tk["stations"]:
        if prev is not None:
            d = math.dist(prev["pos"], s["pos"]) + .6 * math.dist(prev["aim"], s["aim"])
            s["travel"] = round(max(s.get("travel", .5), min(2.4, .45 + d / 1.8)), 2)
        prev = s
film = {
    "title": "The Assassin Without His Glasses", "fps": FPS, "size": [1080, 1920], "words": "voice/words.json", "end": int(END * FPS), "kit3d": True, "tween": {"ones": True},
    "camera_idea": {"name": "Heist gone soft", "why": "It starts like a spy thriller (low moonlit roof, dramatic drop) and keeps that serious camera while everything turns into a cooking show.", "signature": "Every 'serious' push-in lands on something stupid: the stew pot, the crying chef, the green face."},
    "cast": {"viper": {"puppet": "cast:viper", "height": 1.85, "heads_tall": 3.3}, "chef": {"puppet": "cast:headchef", "height": 1.8, "heads_tall": 2.6},
             "king": {"puppet": "cast:king", "height": 1.75, "heads_tall": 2.8}, "guard1": {"puppet": "cast:knight", "height": 1.8, "heads_tall": 2.9}, "guard2": {"puppet": "cast:knight", "height": 1.8, "heads_tall": 2.9}},
    "places": {"roof": {"set": "roof", "light": "night", "light_over": {"ai": 1.35, "amb": "#7a84c0"}},
               "kitchen": {"set": "kitchen", "light": "interior", "light_over": {"ai": 1.3, "amb": "#c8a888", "si": 1.2}},
               "hall": {"set": "hall", "light": "interior", "light_over": {"ai": 1.4, "amb": "#e0d0b0", "si": 1.3}}},
    "held3d": [{"who": "chef", "obj": "cleaver", "module": "sets/lib.js", "builder": "buildCleaver", "grip": "raise", "hand": "R"},
               {"who": "viper", "obj": "platter", "module": "sets/lib.js", "builder": "buildPlatter", "grip": "raise", "hand": "R"},
               {"who": "guard1", "obj": "cloche", "module": "sets/lib.js", "builder": "buildPlatter", "grip": "raise", "hand": "R"}],
    "takes": takes, "kicks": kicks, "acts": acts, "sentences": sentences, "fx": fx, "moods": moods, "sound": [],
}
json.dump(film, open("film.json", "w"), indent=1)
print("stations", sum(len(t["stations"]) for t in takes), "end", round(END, 2))
