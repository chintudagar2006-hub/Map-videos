"""film.json for "What If the Whole World Used ONE Currency?" (Globo). Narrated map story + cafe / World Bank gags."""
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
def top(x, y, h, lens=30, tilt=.07): return {**raw([x, round(y - h * tilt, 2), h], [x, y, 0], lens, "W"), "lead": 0}
def station(t, subject, c, travel=None, **kw):
    s = {"at": S(t), "lead": 3, "subject": subject, "hold": .25, **c, **kw}
    if travel is not None: s["travel"] = travel
    return s
acts, takes, fx, kicks, moods, sentences = [], [], [], [], [], []
def act(who, t, **kw):
    if "pos" in kw and "move_s" not in kw: kw["move_s"] = .03
    acts.append({"who": who, "at": S(t), **kw})
SUBJ = {4: "brad", 5: "bar", 6: "brad", 10: "brad", 12: "bank", 13: "bank", 14: "bank", 26: "brad", 27: "bank"}
for i in L: sentences.append({"text": L[i]["text"], "words": widx(i), "subject": SUBJ.get(i, "map")})
OFF = [90, 90, 0]
END = en(29) + 2.4
cues = {"poof": wfind(1, "disappeared"), "syms": st(2) + .2, "gold": wfind(2, "single"), "globo": st(3) - .1, "globo_end": en(3) + .5,
        "nobody": st(7), "gov": wfind(7, "government"), "tag9": wfind(8, "nine"), "tag2": st(9), "fly": st(11), "cheer": st(15), "fire": st(16),
        "europe": st(17), "greece": wfind(18, "Greece"), "print": wfind(18, "print"), "coinwar": st(19) - .1, "eagle": wfind(20, "eagle") - .2,
        "croissant": wfind(21, "croissant") - .2, "moose": wfind(22, "moose") - .2, "spider": wfind(23, "spider") - .2, "meet": st(24), "potato": st(25),
        "final": st(28), "comment": st(29), "end": END + 1}
cues = {k: round(v, 3) for k, v in cues.items()}
for w in ("brad", "bar", "bank"): act(w, 0, pos=OFF, view="front", dir=1, pose="stand", face="standard")
# ---------- MAP: L1-L3
takes.append({"id": "map_open", "place": "map", "stations": [
    station(0, "map", top(-55, 25, 52)),
    station(cues["poof"] + .3, "map", top(-40, 22, 75), travel=1.6),
    station(st(2) + .3, "map", top(-5, 14, 135, lens=28), travel=1.6),
    station(st(3) - .15, "map", top(-10, 14, 42), travel=.5)]})
kicks += [{"at": S(cues["poof"]), "amp": 1.4}, {"at": S(st(3)), "amp": 1.6}]
moods += [{"at": S(0), "look": "warm_up"}]
def scene(t, here):
    for w in ("brad", "bar", "bank"):
        if w not in here: act(w, t, pos=OFF)
# ---------- CAFE: L4-L6
scene(st(4) - .15, ("brad", "bar"))
BR = [-0.85, 0.45, 0]; BA = [0.35, 1.8, 0]
act("brad", st(4) - .1, pos=BR, view="34", dir=1, pose="hands_hips", face="cool")
act("bar", st(4) - .1, pos=BA, view="34", dir=-1, pose="stand", face="delight")
act("bar", st(5), pose="point_out", face="proud")
act("brad", st(6) - .1, pose="shrug", face="confused")
act("bar", st(6) + .2, pose="shrug", face="awkward")
takes.append({"id": "cafe1", "place": "cafe", "stations": [
    station(st(4) - .1, "brad", raw([-2.6, -2.6, 1.7], [-0.2, 1.2, 1.45], 26, "W")),
    station(st(4) + .4, "brad", cam([BR[0], BR[1], 1.45], "M", side=-25, lens=30), travel=.9),
    station(st(5), "bar", cam([BA[0], BA[1], 1.4], "M", side=10, lens=32, height=1.45), travel=.5),
    station(st(6), "brad", cam([BR[0], BR[1], 1.5], "C", side=-15, lens=38), travel=.4)]})
fx += [{"at": S(st(6) + .3), "kind": "question", "on": "brad"}, {"at": S(st(5) + .2), "kind": "shine", "on": "bar"}]
moods += [{"at": S(st(4)), "look": "warm_up"}]
# ---------- MAP: L7-L9
takes.append({"id": "map_gov", "place": "map", "stations": [
    station(st(7) - .05, "map", top(-48, 27, 40)),
    station(st(8) + .2, "map", top(2, 36, 50), travel=1.0),
    station(st(9) - .1, "map", top(30, 20, 72), travel=1.0)]})
# ---------- CAFE: L10
act("brad", st(10) - .1, pos=BR, pose="cheer", face="starstruck", view="front")
takes.append({"id": "cafe2", "place": "cafe", "stations": [station(st(10) - .1, "brad", cam([BR[0], BR[1], 1.5], "M", side=-5, lens=32))]})
fx += [{"at": S(st(10) + .2), "kind": "shine", "on": "brad"}]
# ---------- MAP: L11
takes.append({"id": "map_fly", "place": "map", "stations": [station(st(11) - .1, "map", top(37, 16, 95)), station(st(11) + .6, "map", top(37, 14, 70), travel=1.2)]})
# ---------- BANK: L12-L14
BK = [0.2, 1.6, 0]
scene(st(12) - .15, ("bank",))
act("bank", st(12) - .1, pos=BK, view="front", dir=1, pose="hands_hips", face="proud")
act("bank", st(13) + .4, pose="point_up", face="evil")
act("bank", st(14) - .05, pose="point_out", face="scream", view="34", dir=-1)
takes.append({"id": "bank1", "place": "bank", "stations": [
    station(st(12) - .1, "bank", raw([0, -5.2, 2.0], [0, 2.6, 2.1], 24, "W")),
    station(wfind(12, "One") , "bank", cam([BK[0], BK[1], 1.5], "W", side=0, lens=26, height=1.4), travel=1.4),
    station(st(13) + .3, "bank", cam([BK[0], BK[1], 1.55], "M", side=12, lens=28, height=1.0), travel=1.6),
    station(st(14) - .05, "bank", cam([BK[0], BK[1], 1.6], "C", side=-8, lens=36), travel=.25)]})
kicks += [{"at": S(st(14)), "amp": 2.0}]
moods += [{"at": S(st(12)), "look": "spot_dark"}, {"at": S(st(14)), "look": "flash_red"}]
fx += [{"at": S(st(14) + .1), "kind": "glint", "on": "bank"}]
# ---------- MAP: L15-L18
takes.append({"id": "map_half", "place": "map", "stations": [
    station(st(15) - .05, "map", top(-5, 12, 140, lens=28)),
    station(st(17) - .1, "map", top(2, 34, 46), travel=.9),
    station(cues["greece"] - .2, "map", top(6, 26, 24), travel=1.0)]})
kicks += [{"at": S(st(16)), "amp": 1.2}, {"at": S(cues["greece"]), "amp": 1.5}]
# ---------- MAP: L19-L25 the coin war
A = [-22, 14]
takes.append({"id": "map_coin", "place": "map", "stations": [
    station(st(19) - .1, "map", top(A[0], A[1], 80)),
    station(cues["eagle"], "map", top(A[0] - 6, A[1] + 9, 58), travel=.6),
    station(cues["croissant"], "map", top(A[0] + 6, A[1] + 9, 58), travel=.5),
    station(cues["moose"], "map", top(A[0] - 6, A[1] - 6, 58), travel=.5),
    station(cues["spider"], "map", top(A[0] + 6, A[1] - 6, 58), travel=.5),
    station(st(24), "map", top(A[0], A[1] - 4, 82), travel=1.0),
    station(st(25) - .3, "map", top(A[0], A[1] + 2, 34), travel=.6)]})
kicks += [{"at": S(st(25) + .4), "amp": 1.8}]
# ---------- CAFE L26 / BANK L27
scene(st(26) - .15, ("brad", "bar"))
act("bar", st(26) - .15, pos=BA, face="jawdrop", pose="hand_mouth")
act("brad", st(26) - .1, pos=BR, pose="reach_up", face="scream", view="front", dir=1)
takes.append({"id": "cafe3", "place": "cafe", "stations": [station(st(26) - .1, "brad", cam([BR[0], BR[1], 1.55], "C", side=-10, lens=36))]})
kicks += [{"at": S(st(26)), "amp": 2.0}]
scene(st(27) - .15, ("bank",))
act("bank", st(27) - .1, pos=BK, view="34", dir=1, pose="finger_up", face="cool")
act("bank", wfind(27, "every"), pose="shrug", face="sideeye")
takes.append({"id": "bank2", "place": "bank", "stations": [station(st(27) - .1, "bank", cam([BK[0], BK[1], 1.55], "M", side=-14, lens=30)), station(wfind(27, "every"), "bank", cam([BK[0], BK[1], 1.6], "C", side=-6, lens=36), travel=1.6)]})
fx += [{"at": S(st(27) + .4), "kind": "glint", "on": "bank"}]
# ---------- MAP: L28-L29 end
takes.append({"id": "map_end", "place": "map", "stations": [station(st(28) - .1, "map", top(A[0], A[1] - 2, 90)), station(st(28) + 1.0, "map", top(A[0], A[1] - 3, 76), travel=3.0)]})
for tk in takes:
    prev = None
    for s in tk["stations"]:
        if prev is not None and tk["place"] != "map":
            d = math.dist(prev["pos"], s["pos"]) + .6 * math.dist(prev["aim"], s["aim"])
            s["travel"] = round(max(s.get("travel", .5), min(2.4, .45 + d / 1.8)), 2)
        prev = s
film = {
    "title": "What If the Whole World Used ONE Currency?", "fps": FPS, "size": [1080, 1920], "words": "voice/words.json", "end": int(END * FPS), "kit3d": True, "tween": {"ones": True},
    "camera_idea": {"name": "Map explainer", "why": "A top-down map carries the story; quick cuts to the cafe and the World Bank land each joke.", "signature": "Whip push-ins on the map, every beat a new pop-up."},
    "cast": {"brad": {"puppet": "cast:bro", "height": 1.8, "heads_tall": 2.9}, "bar": {"puppet": "cast:barista", "height": 1.65, "heads_tall": 2.9}, "bank": {"puppet": "cast:business", "height": 1.8, "heads_tall": 2.9}},
    "places": {"map": {"set": "map", "light": "day", "light_over": {"ai": 1.2}, "cues": cues},
               "cafe": {"set": "cafe", "light": "interior", "light_over": {"ai": 1.45, "amb": "#f0dcc0", "si": 1.3}},
               "bank": {"set": "bank", "light": "interior", "light_over": {"ai": 1.4, "amb": "#e8e0d0", "si": 1.3}, "cues": cues}},
    "takes": takes, "kicks": kicks, "acts": acts, "sentences": sentences, "fx": fx, "moods": moods, "sound": [],
}
json.dump(film, open("film.json", "w"), indent=1)
json.dump(cues, open("cues.json", "w"), indent=1)
print("stations", sum(len(t["stations"]) for t in takes), "end", round(END, 2))
