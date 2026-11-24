"""Narrator voice: Chatterbox TTS + 'Ethan' English male reference.
Usage: python chatterbox_voice.py script.txt out_dir/
script.txt: one sentence/line per row ([SECTION] lines are skipped). Writes 000.wav, 001.wav ..."""
import sys, os, torch, torchaudio as ta
torch.set_num_threads(os.cpu_count() or 2)
from chatterbox.tts import ChatterboxTTS
REF = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'ref_ethan.wav')
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
lines = [l.strip() for l in open(src) if l.strip() and not l.strip().startswith('[')]
m = ChatterboxTTS.from_pretrained(device='cuda' if torch.cuda.is_available() else 'cpu')
m.prepare_conditionals(REF, exaggeration=0.5)
for i, t in enumerate(lines):
    f = f'{out}/{i:03d}.wav'
    if os.path.exists(f): continue          # resumable
    torch.manual_seed(1000 + i)
    w = m.generate(t, exaggeration=0.5, cfg_weight=0.3, temperature=0.75)
    ta.save(f + '.tmp.wav', w, m.sr); os.replace(f + '.tmp.wav', f)
    print(i, round(w.shape[-1] / m.sr, 2), flush=True)
