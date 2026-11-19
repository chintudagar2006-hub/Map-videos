"""Sound for "He Poured Sand Under a 500-Ton Bridge": room tones per place, SFX on the story events (from film.json), a light comedy
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
    x = M_(lp(colored(n_, r, .8), 900)) * .35 + M_(bp(colored(n_, r, .3), 300, 2400)) * .12 + M_(G.breeze(d, r, level=.4)) * .4 + M_(G.bird_chirps(d, r, density=.15)) * .15     # the roaring river
    x = fades(np.asarray(x, float)[:int(d * SR)], .12, .12); put(amb, x, a, db(-6))

# ---------- SFX
PL = F["places"]["site_gold"]; POUR = PL["pour"]; CHOP = PL["chop"]; CRACK = PL["crack"]
t = CHOP[0] + .5
while t < CHOP[1]:                                                     # axe chops into timber, stones grinding
    put(sfx, G.hammer_hit(r, big=.8), t, db(-6), pan=-.2); put(sfx, G.wood_crack(r)[:int(.25 * SR)], t + .01, db(-14), pan=.2); t += .45
put(sfx, G.creak(CHOP[1] - CHOP[0], r, rate0=40, rate1=90), CHOP[0] + .3, db(-12))
put(sfx, G.wood_crack(r), CRACK - .02, db(-1)); put(sfx, G.bolt_snap(r), CRACK, db(-6)); put(sfx, G.rattle(1.4, r, heavy=True), CRACK + .1, db(-10))
put(sfx, G.swing_squeak(r, a=.6), L[17]["start"] + .4, db(-12)); put(sfx, G.clink(r, bright=1.2), L[17]["end"] - .1, db(-10))   # the plug unscrews and drops
n = int((POUR[1] - POUR[0]) * SR); tt = np.arange(n) / SR; hiss = hp(colored(n, r, .2), 2500) * np.minimum(1, tt / .3) * np.minimum(1, (POUR[1] - POUR[0] - tt) / .5)
put(sfx, hiss * .6, POUR[0], db(-8))                                   # sand pouring like an hourglass
put(sfx, G.creak(POUR[1] - POUR[0], r, rate0=15, rate1=25), POUR[0] + .5, db(-20))
put(sfx, G.push_thump(r), POUR[1] - .2, db(-4))                        # the arch locks into place
for i in (3, 7): put(sfx, G.stroll_step(r, scuff=.3), L[i]["start"], db(-16))
n = int(.4 * SR); tt = np.arange(n) / SR; put(sfx, hp(colored(n, r, 0), 1500) * np.exp(-tt * 7), L[1]["start"] + .9, db(-12))   # sand pouring in (hook)
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
prog = [(57, [57, 60, 64]), (53, [53, 57, 60]), (55, [55, 59, 62]), (52, [52, 56, 59])]      # Am F G E
def pluck(f, dur, vel):
    n = int(dur * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * tt) + .35 * np.sin(4 * np.pi * f * tt)) * np.exp(-tt * 7) * vel
t, bar = .2, 0
while t < POUR[1] - .2:
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
for k, m in enumerate([50, 57, 62, 66]):                                           # a warm brass chord when the arch locks
    put(mus, I.brass(I.m2f(m), 2.6, vel=.6, r=r, kind="horn" if m > 55 else "tuba"), POUR[1] - .1, db(-5), pan=(k - 1.5) * .25)

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
