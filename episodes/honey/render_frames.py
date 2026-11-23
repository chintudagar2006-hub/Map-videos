"""python3 render_frames.py <out_dir> <frames comma list | start-end> [scale%] [samples]"""
import bpy, sys, os, time
a = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else sys.argv[1:]
out, spec = a[0], a[1]; scale = int(a[2]) if len(a) > 2 else 100; spp = int(a[3]) if len(a) > 3 else 0
HERE = os.path.dirname(os.path.abspath(__file__))
bpy.ops.wm.open_mainfile(filepath=os.path.join(HERE, 'out', 'honey.blend'))
sc = bpy.context.scene; sc.render.resolution_percentage = scale
if spp: sc.cycles.samples = spp
sc.cycles.device = 'CPU'
try: sc.render.threads_mode = 'AUTO'
except Exception: pass
if '-' in spec: s, e = map(int, spec.split('-')); frames = range(s, e + 1)
else: frames = [int(x) for x in spec.split(',')]
os.makedirs(out, exist_ok=True)
for f in frames:
    p = os.path.join(out, f'f{f:05d}.jpg')
    if os.path.exists(p) and os.path.getsize(p) > 0: continue
    t = time.time(); sc.frame_set(f); sc.render.filepath = p + '.tmp.jpg'; bpy.ops.render.render(write_still=True)
    os.replace(p + '.tmp.jpg', p); print(f'frame {f} {time.time() - t:.1f}s', flush=True)
