"""Chatterbox + Ethan ref, per-speaker settings. usage: cb_multi.py script.tsv out_dir  (tsv: SPK<TAB>text)"""
import sys, os, torch, torchaudio as ta
torch.set_num_threads(os.cpu_count() or 2)
from chatterbox.tts import ChatterboxTTS
REF = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ref_ethan.wav')
src, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
rows = [l.rstrip('\n').split('\t', 1) for l in open(src) if l.strip()]
EX = {'N': (0.5, 0.3)}
m = ChatterboxTTS.from_pretrained(device='cuda' if torch.cuda.is_available() else 'cpu')
for i, (spk, t) in enumerate(rows):
    f = f'{out}/{i:03d}.wav'
    if os.path.exists(f): continue
    ex, cfg = EX.get(spk, (0.75, 0.4))
    m.prepare_conditionals(REF, exaggeration=ex)
    torch.manual_seed(1000 + i)
    w = m.generate(t, exaggeration=ex, cfg_weight=cfg, temperature=0.75)
    ta.save(f + '.tmp.wav', w, m.sr); os.replace(f + '.tmp.wav', f)
    print(i, spk, round(w.shape[-1] / m.sr, 2), t, flush=True)
