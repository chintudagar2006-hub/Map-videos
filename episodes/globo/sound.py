"""Sound for "One Currency" (Globo): room tones per place, SFX on the story events (from film.json), a light comedy
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
for place, a, b in spans:
    d = b - a; n_ = int(d * SR)
    if n_ < 100: continue
    if place == "cafe":
        x = np.asarray(G.babble(d, r, 180, 1.0)) if True else 0
        x = x.mean(0) if x.ndim == 2 and x.shape[0] == 2 else (x.mean(1) if x.ndim == 2 else x); x = x[:n_] * .5
        for k in range(int(d * 1.5)): ck = G.clink(r, bright=1.0); ck = np.asarray(ck); ck = ck.mean(0) if ck.ndim == 2 and ck.shape[0] == 2 else (ck.mean(1) if ck.ndim == 2 else ck); i0 = int(r.random() * max(1, n_ - len(ck))); x[i0:i0 + len(ck)] += ck[:n_ - i0] * .15
    elif place == "bank": x = lp(colored(n_, r, 1.0), 300) * .15 + np.sin(2 * np.pi * 60 * np.arange(n_) / SR) * .01
    else: x = lp(colored(n_, r, .6), 1800) * .03
    put(amb, fades(np.asarray(x, float)[:n_], .08, .08), a, db(-6))
def blip(t, f0=880, g=-18):
    n = int(.12 * SR); tt = np.arange(n) / SR; x = np.sin(2 * np.pi * (f0 + 900 * tt / .12) * tt) * np.exp(-tt * 28); put(sfx, x, t, db(g))
def ding(t, g=-12):
    n = int(1.2 * SR); tt = np.arange(n) / SR; x = sum(np.sin(2 * np.pi * f * tt) * a for f, a in ((1568, 1), (2349, .5), (3136, .35))) * np.exp(-tt * 3.5); put(sfx, x, t, db(g))
def boom(t, g=-6):
    n = int(1.0 * SR); tt = np.arange(n) / SR; x = np.sin(2 * np.pi * (70 * np.exp(-tt * 3)) * tt) * np.exp(-tt * 4) + lp(colored(n, r, 1), 400) * np.exp(-tt * 6) * .5; put(sfx, x, t, db(g))
put(sfx, G.whoosh(.6, r, peak=.3, f_lo=300, f_hi=3000, tail=.25), C["poof"] - .1, db(-8)); blip(C["poof"], 400, -12)
for i in range(14): blip(C["syms"] + i * .08, 700 + (i % 5) * 140, -22)
for i in range(6): blip(C["gold"] + i * .1, 1000 + i * 120, -20)
put(sfx, G.whoosh(.5, r, peak=.3, f_lo=200, f_hi=1500), C["globo"] - .2, db(-10)); ding(C["globo"] + .2, -8)
[put(sfx, G.clink(r, bright=1.3), C["globo"] + .25 + i * .06, db(-12)) for i in range(4)]
for k in ("nobody", "gov", "tag9", "tag2"): blip(C[k], 900, -16)
for i in range(10): put(sfx, G.whoosh(1.0, r, peak=.5, f_lo=500, f_hi=4000, tail=.2), C["fly"] + i * .13, db(-17), pan=(r.random() - .5))
put(sfx, G.hurrah(r, 200, 1.0), C["cheer"], db(-12)); put(sfx, G.applause(1.6, r), C["cheer"] + .1, db(-16))
n = int(1.8 * SR); fire = hp(colored(n, r, .3), 800) * (r.random(n) > .985) * 3 + lp(colored(n, r, 1.2), 500) * .4; put(sfx, fades(fire, .05, .4), C["fire"], db(-10)); boom(C["fire"], -10)
[put(sfx, G.clink(r, bright=1.1), C["europe"] + .4 + i * .07, db(-14)) for i in range(3)]
boom(C["greece"], -6); put(sfx, G.rattle(.5, r), C["greece"] + .05, db(-12)); blip(C["print"] + .3, 300, -12)
for k in ("eagle", "croissant", "moose", "spider"): blip(C[k], 1100, -14); put(sfx, G.whoa(r), C[k] + .05, db(-22))
# drumroll into the potato
n = int((C["potato"] - C["meet"]) * SR); tt = np.arange(n) / SR; roll = bp(colored(n, r, 0), 1500, 6000) * (0.5 + .5 * np.sin(2 * np.pi * 18 * tt) ** 2) * (tt / tt[-1]) ** 1.5; put(sfx, roll, C["meet"], db(-12))
ding(C["potato"] + .3, -6); boom(C["potato"] + .3, -9)
for k in F.get("kicks", []):
    t = tsec(k["at"])
    if t > 1: put(sfx, G.push_thump(r), t, db(-11))
for e in F.get("fx", []):
    t = tsec(e["at"]); kd = e["kind"]
    if kd in ("glint", "shine"):
        n = int(.6 * SR); tt = np.arange(n) / SR; x = sum(np.sin(2 * np.pi * f0 * tt) for f0 in (2093, 2637, 3136)) * np.exp(-tt * 6) / 3; put(sfx, x, t, db(-20))
    elif kd == "question": blip(t, 600, -16)
for tk in F["takes"]:
    for s in tk["stations"][1:]:
        tr = s.get("travel", .5); t = tsec(s["at"]) - tr
        if tr >= .5: put(sfx, G.whoosh(tr + .2, r, peak=tr * .55, f_lo=250, f_hi=1800, tail=.2), t, db(-22), pan=(r.random() - .5) * .6)
for tk in F["takes"][1:]: put(sfx, G.whoosh(.35, r, peak=.15, f_lo=400, f_hi=3500, tail=.1), tsec(tk["stations"][0]["at"]) - .2, db(-18))
ding(C["final"], -14); blip(C["comment"], 1300, -12)
# ---------- music: bright bouncy comedy bed, 116 bpm, C - Am - F - G; stops for the potato reveal, then back
bpm = 116; beat = 60 / bpm
prog = [(48, [60, 64, 67]), (45, [57, 60, 64]), (41, [57, 60, 65]), (43, [59, 62, 67])]
def pluck(f, dur, vel):
    n = int(dur * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * tt) + .35 * np.sin(4 * np.pi * f * tt)) * np.exp(-tt * 7) * vel
t, bar = .1, 0
while t < END:
    if C["meet"] - .1 < t < C["potato"] + .5: t += 4 * beat; bar += 1; continue
    root, ch = prog[bar % 4]
    for b in range(4):
        tb = t + b * beat
        put(mus, pluck(I.m2f(root - 12 + (12 if b % 2 else 0)), beat * .8, .55), tb, pan=-.1)
        if b in (1, 3): put(mus, I.snare(vel=.22, r=r, dur=.15, snappy=.5), tb, db(-10), pan=.15)
    for k, m in enumerate(ch):
        put(mus, I.vibes(I.m2f(m + 12), vel=.3, r=r, dur=beat * 1.6), t + k * .015, db(-6), pan=(k - 1) * .3)
        put(mus, I.vibes(I.m2f(m + 12), vel=.22, r=r, dur=beat * 1.6), t + 2 * beat + k * .015, db(-8), pan=(k - 1) * .3)
    t += 4 * beat; bar += 1
for k, m in enumerate([60, 64, 67, 72]): put(mus, I.brass(I.m2f(m), 1.2, vel=.6, r=r, kind="stab"), C["potato"] + .3 + k * .02, db(-6))
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
