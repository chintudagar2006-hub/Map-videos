"""Two-character Kokoro dialogue: per-line wavs (pitch, shout, polish), one timeline, words.json for the film kit.
usage: python3 make_voice.py <dialogue.json> <out_dir>"""
import json, os, re, subprocess, sys
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
import pathlib
M = os.environ.get("KOKORO_MODELS", str(pathlib.Path(__file__).resolve().parent / "models"))
k = Kokoro(f"{M}/kokoro-v1.0.onnx", f"{M}/voices-v1.0.bin")
D = json.load(open(sys.argv[1])); OUT = sys.argv[2]; os.makedirs(f"{OUT}/lines", exist_ok=True)
SR = 24000
def style(spec):  # "am_fenrir:0.6+bm_george:0.4"
    parts = [p.split(":") for p in spec.split("+")]
    return sum(k.get_voice_style(n) * float(w) for n, w in parts)
VO = D["voices"]; styles = {s: style(v["style"]) for s, v in VO.items()}
def ff(inp, out, af):
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", inp, "-af", af, "-ar", str(SR), "-ac", "1", out], check=True)
timeline, words, lines, t = [], [], [], D.get("lead", 0.25)
for i, L in enumerate(D["lines"], 1):
    v = VO[L["who"]]; shout = L.get("shout", False)
    sp = v.get("speed", 1.1) * (1.08 if shout else 1.0) * L.get("speed", 1.0)
    a, _ = k.create(L["say"], voice=styles[L["who"]], speed=sp, lang="en-us")
    nz = np.where(np.abs(a) > 0.008)[0]; a = a[max(0, nz[0] - 200): nz[-1] + 600]
    raw = f"{OUT}/lines/{i:02d}_raw.wav"; sf.write(raw, a, SR)
    semis = v.get("pitch", 0) + (0.8 if shout else 0) + L.get("pitch", 0)
    chain = [f"rubberband=pitch={2 ** (semis / 12):.4f}:formant=preserved" if semis else "anull",
             "highpass=f=80", v.get("eq", "equalizer=f=3000:t=q:w=1.2:g=3"),
             "acompressor=threshold=-20dB:ratio=4:attack=5:release=60:makeup=4" if shout else "acompressor=threshold=-22dB:ratio=2.5:attack=8:release=90:makeup=2",
             "aecho=0.8:0.5:18|31|47:0.07|0.05|0.03", "alimiter=limit=0.95"]
    fin = f"{OUT}/lines/{i:02d}.wav"; ff(raw, fin, ",".join(chain)); os.remove(raw)
    a, _ = sf.read(fin); a = a.astype(np.float32)
    t += L.get("pre", 0.0)
    dur = len(a) / SR
    toks = L.get("caption", L["say"]).split(); sayt = L["say"].split()
    wt = [max(1, len(re.sub(r"[^\w]", "", w))) + (3 if re.search(r"[.,?!]$", w) else 0) for w in sayt]
    if len(toks) != len(sayt): toks = sayt
    tot, acc = sum(wt), 0
    for w, x in zip(toks, wt):
        s = t + dur * acc / tot; acc += x; words.append({"w": w, "s": round(s, 3), "e": round(t + dur * acc / tot, 3), "who": L["who"], "line": i})
    lines.append({"i": i, "who": L["who"], "text": L["say"], "start": round(t, 3), "end": round(t + dur, 3)})
    timeline.append((t, a)); t += dur + L.get("gap", D.get("gap", 0.16))
end = t + D.get("tail", 0.8)
mix = np.zeros(int(end * SR) + 10, np.float32)
for s, a in timeline: i0 = int(s * SR); mix[i0:i0 + len(a)] += a
mix = mix / max(1e-6, np.max(np.abs(mix))) * 0.9
sf.write(f"{OUT}/voice.wav", mix, SR)
json.dump(words, open(f"{OUT}/words.json", "w"), indent=0); json.dump(lines, open(f"{OUT}/lines.json", "w"), indent=1)
print(f"{end:.2f} s, {len(lines)} lines, {len(words)} words")
