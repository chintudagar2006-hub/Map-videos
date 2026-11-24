import sys, glob, json, os
from faster_whisper import WhisperModel
m = WhisperModel('small.en', device='cpu', compute_type='int8')
for f in sorted(glob.glob('voice/refs/*.mp3')):
    o = f[:-4] + '.json'
    if os.path.exists(o): continue
    segs, _ = m.transcribe(f, word_timestamps=True, language='en')
    out = [dict(s=round(s.start, 2), e=round(s.end, 2), t=s.text.strip(), words=[(w.word.strip(), round(w.start, 2), round(w.end, 2)) for w in s.words]) for s in segs]
    json.dump(out, open(o, 'w'), indent=0); print(f, len(out), flush=True)
