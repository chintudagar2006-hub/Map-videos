"""Sound for "The Assassin Without His Glasses": room tones per place, SFX on the story events (from film.json), a light comedy
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

# ---------- scene spans (take start -> next take start)
spans = []
for k, tk in enumerate(F["takes"]):
    a = tsec(tk["stations"][0]["at"]); b = tsec(F["takes"][k + 1]["stations"][0]["at"]) if k + 1 < len(F["takes"]) else END
    spans.append((tk["place"], a, b))

# ---------- room tones
for place, a, b in spans:
    d = round((b - a) * SR) / SR
    n_ = int(d * SR)
    M_ = lambda y: (np.asarray(y).mean(0) if np.asarray(y).ndim == 2 and np.asarray(y).shape[0] == 2 else np.asarray(y))[:n_]
    if place == "roof": x = M_(G.breeze(d, r, level=.9)) * .8 + M_(lp(colored(n_, r, 1.2), 300)) * .08 + M_(G.crickets(d, r)) * .1
    elif place == "kitchen":                                            # fire crackle + the stew bubbling
        x = M_(lp(colored(n_, r, .8), 600)) * .12; ck = np.zeros(n_)
        for k in range(int(d * 14)): i0 = int(r.random() * (n_ - 200)); ck[i0:i0 + 120] += (r.random() - .5) * np.exp(-np.arange(120) / 25)
        bub = np.zeros(n_)
        for k in range(int(d * 5)): i0 = int(r.random() * (n_ - 2400)); tt = np.arange(2400) / SR; bub[i0:i0 + 2400] += np.sin(2 * np.pi * (180 + 300 * tt / .05) * tt) * np.exp(-tt * 40) * .5
        x = x + hp(ck, 1500) * 1.2 + lp(bub, 1200) * .6
    else: x = M_(lp(colored(n_, r, 1.0), 500)) * .12 + M_(bp(colored(n_, r, .4), 200, 900)) * .03
    x = fades(np.asarray(x, float)[:int(d * SR)], .12, .12); put(amb, x, a, db(-6))

# ---------- SFX
LAND = None
for st_ in F["takes"]:
    if st_["id"] == "kitchen": LAND = st_["stations"][0]["at"]["s"] + .4
put(sfx, G.whoosh(.9, r, peak=.6, f_lo=200, f_hi=1500, tail=.3), L[3]["start"] + .6, db(-8))          # the drop through the roof
put(sfx, G.push_thump(r), LAND, db(-2)); put(sfx, G.rattle(.5, r), LAND + .05, db(-14))
n = int(.9 * SR); tt = np.arange(n) / SR; shing = hp(colored(n, r, 0), 4000) * np.exp(-tt * 5) * .4 + np.sin(2 * np.pi * 3200 * tt) * np.exp(-tt * 4) * .25
put(sfx, shing, L[5]["start"] + 1.2, db(-8))                                                    # the cleaver
put(sfx, G.whoosh(.5, r, peak=.25, f_lo=300, f_hi=900), L[6]["start"] + 1.5, db(-16))          # the finger dip
for k in range(3): put(sfx, G.clink(r, bright=.8), L[12]["start"] + .6 + k * .9, db(-14))      # guards lifting cloches
for t_ in np.arange(L[12]["start"] + .2, L[12]["end"], .32): put(sfx, G.stroll_step(r, scuff=.2), t_, db(-18))
for t_ in np.arange(L[13]["start"], L[13]["end"] - .3, .2): put(sfx, G.stroll_step(r, scuff=.4), t_, db(-14))
put(sfx, G.push_thump(r), L[15]["start"], db(-6))                                               # he collapses
n = int(1.4 * SR); tt = np.arange(n) / SR; grumble = lp(colored(n, r, 1.5), 180) * (1 + np.sin(2 * np.pi * 7 * tt)) * np.exp(-tt * 1.2)
put(sfx, grumble * 2.5, L[15]["start"] + .4, db(-6))                                            # the stomach
for k in F.get("kicks", []):
    t = tsec(k["at"])
    if t > 1: put(sfx, G.push_thump(r), t, db(-9))
for e in F.get("fx", []):
    t = tsec(e["at"]); kd = e["kind"]
    if kd in ("coin",): [put(sfx, G.clink(r, bright=1.3), t + i * .07, db(-10)) for i in range(3)]
    elif kd in ("glow",):                                              # hologram slide: a bright sweep blip
        n = int(.22 * SR); tt = np.arange(n) / SR; f = 900 + 2600 * tt / .22; x = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9); put(sfx, x, t, db(-16))
    elif kd in ("glint", "shine"):
        n = int(.6 * SR); tt = np.arange(n) / SR; x = sum(np.sin(2 * np.pi * f0 * tt) for f0 in (2093, 2637, 3136)) * np.exp(-tt * 6) / 3; put(sfx, x, t, db(-20))
    elif kd in ("scream", "steam"): put(sfx, G.whoosh(.35, r, peak=.08, f_lo=600, f_hi=3000, tail=.12), t - .05, db(-15))
    elif kd == "dust_hit" and t > 1: put(sfx, G.push_thump(r), t, db(-6)); put(sfx, G.rattle(.25, r), t, db(-14))
    elif kd == "sweat": put(sfx, G.whoosh(.5, r, peak=.3, f_lo=200, f_hi=700), t, db(-20))
# camera moves: soft air whooshes on the longer, faster travels
for tk in F["takes"]:
    for s in tk["stations"][1:]:
        tr = s.get("travel", .5); t = tsec(s["at"]) - tr
        if tr >= .7: put(sfx, G.whoosh(tr + .2, r, peak=tr * .55, f_lo=250, f_hi=1500, tail=.2), t, db(-24), pan=(r.random() - .5) * .6)
# ---------- music: a light, bouncy comedy bed (vibes chords + plucked bass + brushed snare), 104 bpm; a bright brass hit at the end
bpm = 104; beat = 60 / bpm
prog = [(50, [50, 53, 57]), (50, [50, 53, 57]), (46, [46, 50, 53]), (45, [45, 49, 52])]      # Dm Dm Bb A (sneaky)
def pluck(f, dur, vel):
    n = int(dur * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * tt) + .35 * np.sin(4 * np.pi * f * tt)) * np.exp(-tt * 7) * vel
t, bar = .2, 0
while t < L[15]["start"]:
    root, ch = prog[bar % 4]
    for b in range(4):
        tb = t + b * beat
        put(mus, pluck(I.m2f(root - 12 + (7 if b % 2 else 0)), beat * .9, .5), tb, pan=-.1)
        if b in (1, 3): put(mus, I.snare(vel=.25, r=r, dur=.18, snappy=.4), tb, db(-10), pan=.15)
    for k, m in enumerate(ch):
        x = I.vibes(I.m2f(m + 12), vel=.32, r=r, dur=beat * 3.6)
        put(mus, x, t + k * .02, db(-6), pan=(k - 1) * .3)
        put(mus, I.vibes(I.m2f(ch[(k + bar) % 3] + 24), vel=.18, r=r, dur=beat * 1.2), t + beat * (1.5 + k), db(-10), pan=.3)
    t += 4 * beat; bar += 1
for k, m in enumerate([45, 44, 43]):                                               # a sad brass fall for the food poisoning
    put(mus, I.brass(I.m2f(m), .7 if k < 2 else 1.8, vel=.6, r=r, kind="tuba"), L[15]["start"] + .2 + k * .55, db(-4))

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
