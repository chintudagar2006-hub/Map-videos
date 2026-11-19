"""film.json for "He Painted His Roof White" (White Roof). Narrated; one neighbour line. Street (day) -> street (August heat)
-> a tar house at midnight -> his cool living room."""
import json, math, re
L = {l["i"]: l for l in json.load(open("voice/lines.json"))}
W = json.load(open("voice/words.json"))
FPS = 30
def S(t): return {"s": round(t, 3)}
def st(i): return L[i]["start"]
def en(i): return L[i]["end"]
def wfind(i, word):
    for w in W:
        if w["line"] == i and re.sub(r"[^\w]", "", w["w"]).lower().startswith(word.lower()): return w["s"]
    raise KeyError((i, word))
def widx(i): ix = [k for k, w in enumerate(W) if w["line"] == i]; return [ix[0], ix[-1]]
def cam(target, framing, side=0.0, lens=32, height=None, look_up=0.0):
    fov = 2 * math.degrees(math.atan(18 / lens)); half = math.tan(math.radians(fov / 2))
    h = {"C": 1.15, "M": 1.6, "W": 2.2, "O": .8, "P": 3.6}[framing]
    d = h / half; a = math.radians(side); x, y, z = target
    zc = z - .16 * h + look_up; cz = height if height is not None else zc - .1
    return {"pos": [round(x + math.sin(a) * d, 3), round(y - math.cos(a) * d, 3), round(cz, 3)], "aim": [x, y, round(zc, 3)], "lens": lens, "framing": framing}
def raw(pos, aim, lens, framing): return {"pos": pos, "aim": aim, "lens": lens, "framing": framing}
def station(t, subject, c, travel=None, **kw):
    s = {"at": S(t), "lead": 0, "subject": subject, "hold": .25, **c, **kw}
    if travel is not None: s["travel"] = travel
    return s
acts, takes, fx, kicks, moods, sentences = [], [], [], [], [], []
def act(who, t, **kw):
    if "pos" in kw and "move_s" not in kw: kw["move_s"] = .03
    acts.append({"who": who, "at": S(t), **kw})
CAST = ("hero", "nb", "mom")
def scene(t, here):
    for w in CAST:
        if w not in here: act(w, t, pos=OFF)
SUBJ = {1: "hero", 2: "town", 3: "sign", 4: "nb", 5: "nb", 6: "nb", 7: "town", 8: "town", 9: "roof", 10: "nb", 11: "town", 12: "town", 13: "town", 14: "hero", 15: "hero"}
for i in L: sentences.append({"text": L[i]["text"], "words": widx(i), "subject": SUBJ[i]})
OFF = [90, 90, 0]; END = en(15) + 2.4
H = 3.2; HS = [0.9, 0.4, H]; NBR = [-9.0, 0.6, H]; NBY = [-4.7, -3.0, 0]
cues = {"paint0": st(1) + .3, "paint1": en(2) - .5, "egg": st(9) - .1, "mirror": st(11), "trip": wfind(13, "trips"), "end": END + 1}
cues = {k: round(v, 3) for k, v in cues.items()}
for w in CAST: act(w, 0, pos=OFF, view="front", dir=1, pose="stand", face="standard")
# ---------- L1-L6 STREET (day): he paints, the valley tars, the neighbour yells
act("hero", 0, pos=HS, view="34", dir=-1, pose="hold_up", face="cool", prop="bucket", hand="R")
act("hero", wfind(1, "white"), face="delight")
act("nb", 0, pos=NBR, view="34", dir=1, pose="hold_up", face="cool", prop="mop", hand="R")
act("hero", st(3), prop="", pose="hands_hips", face="proud")
act("nb", st(4), face="proud"); act("nb", wfind(4, "seals"), pose="point_up", face="sus", prop="")
act("nb", st(5) - .1, pos=NBY, view="34", dir=1, pose="point_up", face="sus")
act("nb", st(6) - .05, pose="point_out", face="rage", dir=1)
act("nb", wfind(6, "chalk"), face="scream")
act("hero", st(6) + .2, face="sideeye", pose="hands_hips", dir=-1)
takes.append({"id": "street", "place": "street", "stations": [
    station(0, "hero", cam([HS[0], HS[1], H + 1.5], "M", side=-28, lens=30, height=H + 2.4)),
    station(wfind(1, "paint") , "hero", cam([HS[0] - .6, HS[1] + .4, H + 1.2], "W", side=-10, lens=28, height=H + 4.2), travel=1.4),
    station(st(2) - .05, "town", raw([14, -24, 20], [0, 6, 1], 24, "W"), travel=.05),
    station(wfind(2, "black") - .3, "town", raw([6, -17, 13], [-2, 4, 2], 26, "W"), travel=1.6),
    station(st(3) - .05, "sign", raw([-11.4, -8.6, 3.0], [-13, -3.9, 3.0], 30, "M"), travel=.05),
    station(st(4), "nb", cam([NBR[0], NBR[1], H + 1.45], "M", side=20, lens=30, height=H + 1.9), travel=.05),
    station(st(5) - .05, "nb", cam([NBY[0], NBY[1], 1.45], "M", side=-35, lens=30, height=1.1), travel=.05),
    station(st(6), "nb", cam([NBY[0], NBY[1], 1.55], "C", side=-25, lens=38, height=1.0), travel=.35),
    station(st(6) + 1.3, "hero", cam([HS[0], HS[1], H + 1.5], "M", side=-20, lens=32, height=H + .6), travel=.05)]})
fx += [{"at": S(wfind(1, "white")), "kind": "shine", "on": "hero"}, {"at": S(st(6) + 1.4), "kind": "glint", "on": "hero"}, {"at": S(st(6) + .1), "kind": "steam", "on": "nb"}, {"at": S(st(3) + .3), "kind": "sweat", "on": "nb"}]
kicks += [{"at": S(st(6)), "amp": 1.6}]
moods += [{"at": S(0), "look": "warm_up"}, {"at": S(st(6)), "look": "flash_warm"}]
# ---------- L7-L9 STREET (August heat): the heatwave parks over the town, an egg fries on a tar roof
scene(st(7) - .15, ("hero",))
act("hero", st(7) - .15, pos=OFF)
takes.append({"id": "heat", "place": "street_hot", "stations": [
    station(st(7) - .1, "town", raw([0, -30, 6], [5, 40, 18], 22, "W")),
    station(st(8), "town", raw([10, -26, 22], [0, 8, 2], 24, "W"), travel=2.2),
    station(st(9) - .1, "roof", raw([7.0, -2.6, 5.2], [8.5, 0.8, 3.3], 34, "M"), travel=.05),
    station(wfind(9, "frying"), "roof", raw([7.6, -1.6, 4.5], [8.5, 0.8, 3.35], 40, "C"), travel=1.2)]})
kicks += [{"at": S(st(7)), "amp": 1.3}, {"at": S(wfind(8, "parks")), "amp": 1.5}]
moods += [{"at": S(st(7)), "look": "flash_warm"}]
# ---------- L10 THE TAR HOUSE at midnight: dad + mom melting on the couch
from_l = st(10) - .1
scene(from_l, ("nb", "mom"))
act("nb", from_l, pos=[-0.7, 1.35, 0], view="front", dir=1, pose="sit_chair", face="wail")
act("mom", from_l, pos=[0.7, 1.35, 0], view="front", dir=-1, pose="sit_chair", face="deadInside")
act("nb", wfind(10, "midnight"), face="tired"); act("mom", wfind(10, "baking"), face="sick")
takes.append({"id": "hot1", "place": "hot", "stations": [station(from_l, "nb", raw([0.2, -3.2, 1.5], [0, 1.5, 1.1], 26, "W")), station(st(10) + 1.2, "nb", cam([-0.35, 1.35, 1.0], "M", side=0, lens=30, height=1.25), travel=1.6)]})
fx += [{"at": S(st(10) + .2), "kind": "sweat", "on": "nb"}, {"at": S(st(10) + .5), "kind": "sweat", "on": "mom"}, {"at": S(wfind(10, "midnight")), "kind": "steam", "on": "nb"}]
moods += [{"at": S(from_l), "look": "flash_warm"}]
# ---------- L11-L13 STREET (heat): rays soaked by tar, bounced by the white roof; the grid trips
scene(st(11) - .15, ())
takes.append({"id": "rays", "place": "street_hot", "stations": [
    station(st(11) - .1, "town", raw([2, -26, 16], [0, 4, 6], 24, "W")),
    station(wfind(12, "bouncing"), "town", raw([-3, -12, 9], [1, 3, 6], 26, "W"), travel=1.8),
    station(wfind(12, "space") - .2, "town", raw([6, -20, 6], [4, 6, 16], 24, "W"), travel=1.6),
    station(st(13) - .05, "town", raw([-8, -15, 4.5], [4.5, -3.5, 5.0], 26, "W"), travel=.05),
    station(cues["trip"] + .1, "town", raw([-2, -12, 5.5], [4.7, -4.5, 5.8], 30, "M"), travel=.4)]})
kicks += [{"at": S(cues["trip"]), "amp": 2.2}]
moods += [{"at": S(cues["trip"]), "look": "flash_red"}]
# ---------- the tar house goes dark (end of L13)
tdark = en(13) - .75
scene(tdark, ("nb", "mom"))
act("nb", tdark, pos=[-0.7, 1.35, 0], view="front", dir=1, pose="sit_chair", face="terrified")
act("mom", tdark, pos=[0.7, 1.35, 0], view="front", dir=-1, pose="sit_chair", face="wail")
takes.append({"id": "hot2", "place": "hot", "stations": [station(tdark, "nb", raw([0, -2.0, 1.25], [0, 1.4, 1.05], 28, "M"))]})
# ---------- L14-L15 HIS LIVING ROOM: 20 degrees cooler, nothing on
tc = st(14) - .1
scene(tc, ("hero",))
act("hero", tc, pos=[-0.2, 1.35, 0], view="front", dir=1, pose="sit_chair", face="cool", prop="lemonade", hand="R")
act("hero", wfind(15, "single"), face="proud")
act("hero", en(15) + .3, face="smug" if False else "cool")
takes.append({"id": "cool", "place": "cool", "stations": [
    station(tc, "hero", raw([0.6, -3.0, 1.5], [0, 1.6, 1.1], 26, "W")),
    station(st(15), "hero", cam([-0.2, 1.35, 1.0], "M", side=-10, lens=32, height=1.2), travel=1.4),
    station(en(15) + .2, "hero", cam([-0.2, 1.35, 1.05], "C", side=-6, lens=40, height=1.15), travel=1.8)]})
fx += [{"at": S(st(14) + .4), "kind": "shine", "on": "hero"}, {"at": S(en(15) + .4), "kind": "glint", "on": "hero"}]
moods += [{"at": S(tc), "look": "spot_hero"}]
for tk in takes[1:]:   # cut a beat AFTER the actors swap (acts land ~2 frames late in the bake)
    tk["stations"][0]["at"] = S(tk["stations"][0]["at"]["s"] + .12)
for tk in takes:
    prev = None
    for s in tk["stations"]:
        if prev is not None and "travel" not in s:
            d = math.dist(prev["pos"], s["pos"]) + .6 * math.dist(prev["aim"], s["aim"])
            s["travel"] = round(min(2.4, .45 + d / 6), 2)
        prev = s
film = {
    "title": "He Painted His Roof White", "fps": FPS, "size": [1080, 1920], "words": "voice/words.json", "end": int(END * FPS), "kit3d": True, "tween": {"ones": True},
    "camera_idea": {"name": "Heat story", "why": "High angles sell the black-vs-white roofs; the interiors sell the payoff.", "signature": "Aerial pushes over the valley, close faces in the rooms."},
    "cast": {"hero": {"puppet": "cast:painter", "height": 1.75, "heads_tall": 2.9}, "nb": {"puppet": "cast:bbqdad", "height": 1.8, "heads_tall": 2.9}, "mom": {"puppet": "cast:soccermom", "height": 1.68, "heads_tall": 2.9}},
    "places": {"street": {"set": "street", "light": "day", "light_over": {"ai": 1.2}, "cues": cues},
               "street_hot": {"set": "street", "light": "golden", "light_over": {"ai": 1.3, "amb": "#ffb070"}, "cues": cues, "hot": True},
               "hot": {"set": "room", "light": "interior", "light_over": {"ai": 1.2, "amb": "#d08050", "si": 1.1}, "cues": cues, "mode": "hot"},
               "cool": {"set": "room", "light": "interior", "light_over": {"ai": 1.35, "amb": "#c8dcf0", "si": 1.2}, "cues": cues, "mode": "cool"}},
    "held3d": [{"who": "hero", "obj": "bucket", "module": "sets/lib.js", "builder": "buildBucket", "grip": "raise", "hand": "R"},
               {"who": "nb", "obj": "mop", "module": "sets/lib.js", "builder": "buildMop", "grip": "raise", "hand": "R"},
               {"who": "hero", "obj": "lemonade", "module": "sets/lib.js", "builder": "buildLemonade", "grip": "raise", "hand": "R"}],
    "takes": takes, "kicks": kicks, "acts": acts, "sentences": sentences, "fx": fx, "moods": moods, "sound": [],
}
json.dump(film, open("film.json", "w"), indent=1); json.dump(cues, open("cues.json", "w"), indent=1)
print("stations", sum(len(t["stations"]) for t in takes), "end", round(END, 2))
