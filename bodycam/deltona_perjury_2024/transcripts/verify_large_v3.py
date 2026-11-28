import sys, wave, numpy as np
from faster_whisper import WhisperModel
m=WhisperModel('large-v3',device='cpu',compute_type='int8',cpu_threads=4)
for f,off in [('clip_205.wav',205),('clip_295.wav',295)]:
    segs,_=m.transcribe(np.frombuffer(wave.open(f).readframes(10**9),np.int16).astype(np.float32)/32768,beam_size=5,vad_filter=False,condition_on_previous_text=False)
    for s in segs:
        t=s.start+off; print(f"[{int(t//60):02d}:{t%60:05.2f}] {s.text.strip()}  (lp {s.avg_logprob:.2f})",flush=True)
