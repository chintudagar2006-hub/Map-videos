"""Sound for "White Roof": room tones per place, SFX on the story events (from film.json), a light comedy
score ducked under the voice, then the mix with the user's (already bleeped) voice. Writes sound/mix.wav (48 kHz stereo)."""
import json, os, sys
import numpy as np, soundfile as sf
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "kit", "audio"))
from dsp import SR, rng, lp, hp, bp, colored, fades
import sfx_gen as G
import instruments as I

F = json.load(open("film.json")); L = {l["i"]: l for l in json.load(open("voice/lines.json"))}
voice, vsr = sf.read("voice/voice48.wav"); assert vsr == SR, vsr
END = F["end"] / F["fps"]; N = int(END * SR) + SR
sfx = np.zeros((N, 2)); amb = np.zeros((N, 2)); mus = np.zeros((N, 2))
r = rng(7)
def tsec(a): return a["s"] if isinstance(a, dict) else a / F["fps"]
def put(buf, x, t, g=1.0, pan=0.0):
    i = int(t * SR); x = np.asarray(x, float)
    if x.ndim == 2 and x.shape[0] == 2 and x.shape[1] != 2: x = x.T
    if x.ndim == 1: x = np.stack([x * (1 - max(0, pan)), x * (1 + min(0, pan))], 1)
    if i >= N or i < 0: return
    j = min(N, i + len(x)); buf[i:j] += x[:j - i] * g
def db(v): return 10 ** (v / 20)

C = json.load(open("cues.json"))
spans = []
for k, tk in enumerate(F["takes"]):
    a = tsec(tk["stations"][0]["at"]); b = tsec(F["takes"][k + 1]["stations"][0]["at"]) if k + 1 < len(F["takes"]) else END
    spans.append((tk["place"], a, b))
def mono(x):
    x = np.asarray(x, float); return x.mean(0) if x.ndim == 2 and x.shape[0] == 2 else (x.mean(1) if x.ndim == 2 else x)
for place, a, b in spans:
    d = b - a; n_ = int(d * SR)
    if n_ < 100: continue
    tt = np.arange(n_) / SR
    if place == "street":   # warm breeze + distant cicadas + a far dog
        x = lp(colored(n_, r, 1.0), 900) * .25 + bp(colored(n_, r, 0), 4500, 7000) * (.5 + .5 * np.sin(2 * np.pi * 7 * tt) ** 2) * .05
    elif place == "street_hot":  # heavy heat drone + loud cicadas
        x = lp(colored(n_, r, 1.2), 300) * .35 + bp(colored(n_, r, 0), 4000, 7500) * (.4 + .6 * np.sin(2 * np.pi * 9 * tt) ** 2) * .12 + np.sin(2 * np.pi * 55 * tt) * .02
    elif place == "hot":  # rattling AC + fan hum
        x = np.sin(2 * np.pi * 120 * tt) * .03 + lp(colored(n_, r, .8), 600) * .25 * (1 + .3 * np.sin(2 * np.pi * 13 * tt))
        x[tt + a > C["trip"] + .2] *= .08
    else:  # cool room: quiet, a clock tick, ice clinks
        x = lp(colored(n_, r, .6), 1200) * .04
        for k in range(int(d)): put(sfx, I.snare(vel=.06, r=r, dur=.03, snappy=1.0), a + k + .5, db(-20))
    put(amb, fades(x, .08, .08), a, db(-6))
def blip(t, f0=880, g=-18):
    n = int(.12 * SR); tt = np.arange(n) / SR; x = np.sin(2 * np.pi * (f0 + 900 * tt / .12) * tt) * np.exp(-tt * 28); put(sfx, x, t, db(g))
def boom(t, g=-6):
    n = int(1.2 * SR); tt = np.arange(n) / SR; x = np.sin(2 * np.pi * (70 * np.exp(-tt * 3)) * tt) * np.exp(-tt * 4) + lp(colored(n, r, 1), 500) * np.exp(-tt * 5) * .7; put(sfx, x, t, db(g))
def sizzle(t, d, g=-12):
    n = int(d * SR); tt = np.arange(n) / SR; x = hp(colored(n, r, 0), 3000) * (.6 + .4 * np.sin(2 * np.pi * 23 * tt) ** 2); put(sfx, fades(x, .1, .3), t, db(g))
# paint glugging onto the roof
n = int((C["paint1"] - C["paint0"]) * SR); tt = np.arange(n) / SR
glug = lp(colored(n, r, .5), 700) * (.5 + .5 * np.sin(2 * np.pi * 6 * tt) ** 4); put(sfx, fades(glug, .1, .3), C["paint0"], db(-8))
for k in range(5): put(sfx, G.clink(r, bright=.7), C["paint0"] + k * .5, db(-24))
blip(L[3]["start"] + .3, 500, -14)   # 115 sign
put(sfx, G.whoa(r), L[6]["start"] - .1, db(-18))
sizzle(C["egg"], 3.5, -10)
for i in range(5): put(sfx, G.whoosh(.6, r, peak=.3, f_lo=1500, f_hi=6000, tail=.2), C["mirror"] + i * .12, db(-20))
n = int(1.5 * SR); tt = np.arange(n) / SR; ping = sum(np.sin(2 * np.pi * f * tt) for f in (1568, 2093, 3136)) * np.exp(-tt * 2.5) / 3; put(sfx, ping, L[12]["start"] + .8, db(-16))
for i in range(6): put(sfx, hp(colored(int(.25 * SR), r, 0), 2000) * 2, C["trip"] - .4 + i * .09, db(-14))
boom(C["trip"], -4); put(sfx, G.rattle(.6, r), C["trip"] + .05, db(-12))
for k in F.get("kicks", []):
    t = tsec(k["at"])
    if t > 1: put(sfx, G.push_thump(r), t, db(-12))
for e in F.get("fx", []):
    t = tsec(e["at"]); kd = e["kind"]
    if kd in ("glint", "shine"):
        n = int(.6 * SR); tt = np.arange(n) / SR; x = sum(np.sin(2 * np.pi * f0 * tt) for f0 in (2093, 2637, 3136)) * np.exp(-tt * 6) / 3; put(sfx, x, t, db(-20))
    elif kd == "steam": sizzle(t, .8, -18)
for tk in F["takes"]:
    for s in tk["stations"][1:]:
        tr = s.get("travel", .5); t = tsec(s["at"]) - tr
        if tr >= .8: put(sfx, G.whoosh(tr + .2, r, peak=tr * .55, f_lo=250, f_hi=1800, tail=.2), t, db(-23), pan=(r.random() - .5) * .6)
for tk in F["takes"][1:]: put(sfx, G.whoosh(.35, r, peak=.15, f_lo=400, f_hi=3500, tail=.1), tsec(tk["stations"][0]["at"]) - .2, db(-19))
# ---------- music: lazy desert twang (A minor), heavier after August; drops out at the trip, calm major pad in the cool room
bpm = 92; beat = 60 / bpm
prog = [(45, [57, 60, 64]), (43, [55, 59, 62]), (41, [53, 57, 60]), (40, [52, 56, 59])]
def pluck(f, dur, vel):
    n = int(dur * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * tt) + .45 * np.sin(4 * np.pi * f * tt) + .2 * np.sin(6 * np.pi * f * tt)) * np.exp(-tt * 5) * vel
cool0 = F["takes"][-1]["stations"][0]["at"]; cool0 = tsec(cool0)
t, bar = .1, 0
while t < cool0 - .2:
    if C["trip"] - .2 < t < cool0: break
    root, ch = prog[bar % 4]; hot = t > L[7]["start"]
    for b in range(4):
        tb = t + b * beat
        put(mus, pluck(I.m2f(root - 12), beat * .9, .5 if not hot else .65), tb)
        if b in (1, 3): put(mus, I.snare(vel=.15 if not hot else .25, r=r, dur=.12, snappy=.4), tb, db(-12), pan=.2)
        put(mus, pluck(I.m2f(ch[b % 3] + 12), beat * .6, .22), tb + beat * .5, pan=-.3)
    t += 4 * beat; bar += 1
n = int((END - cool0) * SR); tt = np.arange(n) / SR
pad = sum(np.sin(2 * np.pi * I.m2f(m) * tt) for m in (60, 64, 67, 71)) / 4 * np.minimum(1, tt / 1.2) * .35
put(mus, fades(pad, .5, 1.0), cool0, db(-6))
# ---------- duck the music under the voice
v = voice if voice.ndim == 1 else voice.mean(1)
v = np.pad(v, (0, max(0, N - len(v))))[:N]
env = np.abs(v); w = int(.05 * SR); env = np.convolve(env, np.ones(w) / w, "same")
duck = np.where(env > .02, db(-9), 1.0); duck = np.convolve(duck, np.ones(int(.15 * SR)) / int(.15 * SR), "same")
mus *= duck[:, None]

def norm(x, peak=.9): m = np.max(np.abs(x)); return x / m * peak if m > 0 else x
mix = np.stack([v, v], 1) * 1.0 + norm(sfx) * db(-7) + norm(amb) * db(-17) + norm(mus) * db(-15)
mix = mix[:int(END * SR)]
os.makedirs("sound", exist_ok=True)
sf.write("sound/mix_raw.wav", norm(mix, .95).astype(np.float32), SR)
os.system('ffmpeg -v error -y -i sound/mix_raw.wav -af "loudnorm=I=-14:TP=-1.2:LRA=11" -ar 48000 sound/mix.wav')
print("mix", mix.shape[0] / SR, "s")
