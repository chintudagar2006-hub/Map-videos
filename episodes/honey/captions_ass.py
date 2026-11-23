"""words.json -> captions.ass (2-3 words at a time, bold white, black outline, lower middle like the references)."""
import json, re, sys
W = json.load(open('voice/words.json')); END = float(sys.argv[1]) if len(sys.argv) > 1 else 999
G = []; cur = []
def flush():
    global cur
    if cur: G.append([' '.join(w['w'] for w in cur), cur[0]['s'], cur[-1]['e']]); cur = []
for w in W:
    cur.append(w)
    if re.search(r'[,.?!]$', w['w']) or len(cur) >= 3 or len(' '.join(x['w'] for x in cur)) > 16: flush()
flush()
for i in range(len(G)):
    nx = G[i + 1][1] if i + 1 < len(G) else G[i][2] + .5
    G[i][2] = min(nx, G[i][2] + .45)
def ts(t): t = max(0, t); return f"{int(t // 3600)}:{int(t % 3600 // 60):02d}:{t % 60:05.2f}"
hdr = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Cap,DejaVu Sans,74,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,1,0,0,0,100,100,0,0,1,6,3,2,60,60,520,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
out = [hdr]
for text, s, e in G:
    if s >= END: break
    t = re.sub(r'[.,;:]$', '', text)
    out.append(f"Dialogue: 0,{ts(s - .03)},{ts(min(e, END))},Cap,,0,0,0,,{{\\fad(40,0)\\t(0,90,\\fscx108\\fscy108)\\t(90,180,\\fscx100\\fscy100)}}{t}\n")
open('captions.ass', 'w').write(''.join(out)); print(len(G), 'groups')
