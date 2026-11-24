"""word timestamps for each line wav with faster-whisper. usage: words.py lines_dir out.json"""
import sys, os, json, glob
from faster_whisper import WhisperModel
m = WhisperModel('base.en', device='cpu', compute_type='int8')
out = {}
for f in sorted(glob.glob(os.path.join(sys.argv[1], '*.wav'))):
    segs, _ = m.transcribe(f, word_timestamps=True, language='en')
    ws = [dict(w=w.word.strip(), s=round(w.start, 3), e=round(w.end, 3)) for s in segs for w in s.words]
    out[os.path.basename(f)] = ws
    print(os.path.basename(f), ' '.join(w['w'] for w in ws), flush=True)
json.dump(out, open(sys.argv[2], 'w'), indent=0)
