"""Sound for the 10 s preview: voice + whooshes on cuts, slip squeak, big splash, gloop bubbles, a light plucky music bed ducked under the voice."""
import os, sys, numpy as np, soundfile as sf
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "kit", "audio"))
from dsp import SR, rng, lp, hp, bp, colored, fades
import sfx_gen as G, instruments as I
END = float(sys.argv[1]) if len(sys.argv) > 1 else 10.0
voice, vsr = sf.read("voice/voice48.wav"); assert vsr == SR
N = int(END * SR); r = rng(5)
sfx = np.zeros((N, 2)); mus = np.zeros((N, 2))
def put(buf, x, t, g=1.0):
    x = np.asarray(x, float)
    if x.ndim == 2 and x.shape[0] == 2 and x.shape[1] != 2: x = x.T
    if x.ndim == 1: x = np.stack([x, x], 1)
    i = int(t * SR); j = min(N, i + len(x))
    if 0 <= i < N: buf[i:j] += x[:j - i] * g
db = lambda v: 10 ** (v / 20)
for t in (1.75, 2.3, 3.05, 4.5, 6.65, 9.3): put(sfx, G.whoosh(.45, r, peak=.25), t - .2, db(-14))
# slip squeak (rising sine chirp) + body thud on the rail
tt = np.arange(int(.25 * SR)) / SR; sq = np.sin(2 * np.pi * (700 + 1800 * tt / .25) * tt) * np.exp(-tt * 6) * .5; put(sfx, sq, 2.08, db(-10))
put(sfx, G.splash_big(r), 2.85, db(-4))
put(sfx, G.bubbles(1.6, r, 10, f_lo=150, f_hi=700), 3.0, db(-12))
for k in range(5):                                                     # sticky gloops while he moves
    t0 = 3.4 + k * 1.15; d = .18; tt = np.arange(int(d * SR)) / SR; g = np.sin(2 * np.pi * (260 - 140 * tt / d) * tt) * np.exp(-tt * 18); put(sfx, g, t0, db(-15))
put(sfx, I.glock(I.m2f(84) if hasattr(I, 'm2f') else 1046, vel=.6, r=r), 8.55, db(-12))   # ding on "float"
# music: bouncy pluck bass + glock on a C-F-G-C loop at 112 bpm
try: from instruments import m2f
except Exception: m2f = lambda m: 440 * 2 ** ((m - 69) / 12)
beat = 60 / 112; prog = [48, 53, 55, 48]
for b in range(int(END / beat) + 1):
    t = b * beat; root = prog[(b // 4) % 4]
    put(mus, I.pluck(m2f(root - 12 + (7 if b % 2 else 0)), vel=.7, r=r, dur=.5), t, db(-10))
    if b % 2 == 0: put(mus, I.pluck(m2f(root + 12 + [0, 4, 7, 12][b // 2 % 4]), vel=.45, r=r, dur=.4, bright=.8), t + beat / 2, db(-16))
# duck music under the voice
v = voice[:N] if voice.ndim == 2 else np.stack([voice[:N]] * 2, 1)
if len(v) < N: v = np.vstack([v, np.zeros((N - len(v), 2))])
env = np.abs(v).mean(1); k = int(.12 * SR); env = np.convolve(env, np.ones(k) / k, 'same'); duck = 1 - np.clip(env * 9, 0, .6)
mix = v * 1.0 + sfx + mus * duck[:, None] * .7
mix[-int(.4 * SR):] *= np.linspace(1, 0, int(.4 * SR))[:, None]
mix /= max(1e-6, np.abs(mix).max()) / .89
os.makedirs("sound", exist_ok=True); sf.write("sound/mix10.wav", mix, SR); print("ok", mix.shape)
