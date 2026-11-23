"""Blocky toy-style characters (original designs, "brick avatar" look) for Blender/bpy.
Rigid parts on pivot empties (no armature): root -> hips -> torso -> head / armL / armR ; hips -> legL / legR.
Faces are 2D decals (PNG drawn with PIL) on the head front; one decal plane per expression, switched with hide_render keys.
The character faces -Y. Units: U = one block unit (metres)."""
import bpy, math, os, mathutils
from PIL import Image, ImageDraw

U = .3
D = math.radians
HERE = os.path.dirname(os.path.abspath(__file__))
FACEDIR = os.path.join(HERE, 'assets', 'faces')

# ---------------- materials ----------------
_mats = {}
def plastic(col, rough=.38, name=None):
    key = (col, rough)
    if key in _mats: return _mats[key]
    m = bpy.data.materials.new(name or f'plastic_{col}'); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = hexrgb(col); b.inputs['Roughness'].default_value = rough
    try: b.inputs['Coat Weight'].default_value = .15; b.inputs['Coat Roughness'].default_value = .2
    except Exception: pass
    _mats[key] = m; return m

def hexrgb(h, a=1):
    h = h.lstrip('#'); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return tuple([(x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4) for x in c] + [a])

def block(name, size, at, col, parent, bevel=.06, mat=None, seg=3):
    bpy.ops.mesh.primitive_cube_add(size=1)
    o = bpy.context.object; o.name = name; o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    o.location = at; o.parent = parent
    if bevel:
        mod = o.modifiers.new('bevel', 'BEVEL'); mod.width = bevel; mod.segments = seg; mod.limit_method = 'NONE'
    o.data.materials.append(mat or plastic(col))
    for p in o.data.polygons: p.use_smooth = True
    try: o.data.shade_auto_smooth()
    except Exception: pass
    return o

def pivot(name, at, parent=None):
    e = bpy.data.objects.new(name, None); bpy.context.scene.collection.objects.link(e)
    e.empty_display_size = .1; e.location = at; e.parent = parent; e.rotation_mode = 'XYZ'; return e

# ---------------- faces (PIL decals) ----------------
def draw_face(expr, o):
    S = 512; im = Image.new('RGBA', (S, S), (0, 0, 0, 0)); g = ImageDraw.Draw(im)
    ink = o.get('ink', (25, 20, 20, 255)); skin = o.get('skin_rgb', (255, 210, 170, 255))
    eye_y, ex = 205, 110
    def eye(cx, kind):
        if kind == 'open':   g.ellipse([cx - 30, eye_y - 44, cx + 30, eye_y + 44], fill=ink); g.ellipse([cx - 14, eye_y - 32, cx + 4, eye_y - 12], fill=(255, 255, 255, 255))
        if kind == 'wide':   g.ellipse([cx - 44, eye_y - 52, cx + 44, eye_y + 52], fill=(255, 255, 255, 255), outline=ink, width=10); g.ellipse([cx - 16, eye_y - 16, cx + 16, eye_y + 16], fill=ink)
        if kind == 'happy':  g.arc([cx - 38, eye_y - 30, cx + 38, eye_y + 40], 200, 340, fill=ink, width=16)
        if kind == 'shut':   g.line([cx - 36, eye_y + 6, cx + 36, eye_y + 6], fill=ink, width=14)
        if kind == 'half':   g.chord([cx - 32, eye_y - 40, cx + 32, eye_y + 44], 0, 180, fill=ink); g.line([cx - 40, eye_y + 2, cx + 40, eye_y + 2], fill=ink, width=10)
        if kind == 'squeeze':g.line([cx - 36, eye_y - 22, cx + 30, eye_y], fill=ink, width=14); g.line([cx - 36, eye_y + 22, cx + 30, eye_y], fill=ink, width=14)
        if kind == 'x':      g.line([cx - 32, eye_y - 32, cx + 32, eye_y + 32], fill=ink, width=16); g.line([cx - 32, eye_y + 32, cx + 32, eye_y - 32], fill=ink, width=16)
        if kind == 'star':   g.ellipse([cx - 40, eye_y - 48, cx + 40, eye_y + 48], fill=ink); g.ellipse([cx - 22, eye_y - 34, cx + 2, eye_y - 8], fill=(255, 255, 255, 255)); g.ellipse([cx + 6, eye_y + 6, cx + 20, eye_y + 20], fill=(255, 255, 255, 255))
    def brows(lift=0, tilt=0, w=14):
        for s in (-1, 1):
            cx = 256 + s * ex; y = eye_y - 78 - lift
            g.line([cx - 40, y + s * tilt * -1 if False else y + tilt * (1 if s < 0 else -1) * -1, cx + 40, y - tilt * (1 if s < 0 else -1) * -1], fill=ink, width=w)
    def mouth(kind):
        my = 360
        if kind == 'smile':  g.arc([170, my - 70, 342, my + 30], 20, 160, fill=ink, width=16)
        if kind == 'grin':   g.chord([160, my - 60, 352, my + 60], 0, 180, fill=ink); g.chord([182, my - 40, 330, my + 10], 0, 180, fill=(255, 255, 255, 255)); g.rectangle([182, my - 4, 330, my + 2], fill=ink)
        if kind == 'flat':   g.line([200, my, 312, my], fill=ink, width=14)
        if kind == 'frown':  g.arc([180, my - 10, 332, my + 80], 200, 340, fill=ink, width=16)
        if kind == 'o':      g.ellipse([216, my - 40, 296, my + 60], fill=ink); g.ellipse([232, my + 20, 280, my + 52], fill=(200, 70, 80, 255))
        if kind == 'scream': g.rounded_rectangle([196, my - 40, 316, my + 80], 40, fill=ink); g.rectangle([214, my - 34, 298, my - 16], fill=(255, 255, 255, 255)); g.ellipse([226, my + 30, 286, my + 74], fill=(200, 70, 80, 255))
        if kind == 'teeth':  g.rounded_rectangle([180, my - 26, 332, my + 30], 14, fill=(255, 255, 255, 255), outline=ink, width=10); [g.line([x, my - 26, x, my + 30], fill=ink, width=6) for x in (218, 256, 294)]
        if kind == 'wavy':   g.line([(190, my), (220, my - 16), (250, my), (280, my - 16), (310, my), (330, my - 10)], fill=ink, width=12, joint='curve')
        if kind == 'smug':   g.arc([210, my - 60, 340, my + 20], 20, 120, fill=ink, width=16)
        if kind == 'tongue': g.chord([180, my - 50, 332, my + 40], 0, 180, fill=ink); g.rounded_rectangle([228, my - 6, 296, my + 80], 34, fill=(225, 90, 110, 255), outline=ink, width=8)
        if kind == 'open':   g.chord([186, my - 50, 326, my + 60], 0, 180, fill=ink); g.ellipse([226, my + 10, 286, my + 50], fill=(200, 70, 80, 255))
    E = {
        'neutral': ('open', 'open', 0, 0, 'flat'), 'smile': ('open', 'open', 4, 0, 'smile'), 'grin': ('happy', 'happy', 10, 0, 'grin'),
        'shock': ('wide', 'wide', 26, 0, 'o'), 'scared': ('wide', 'wide', 18, -14, 'wavy'), 'panic': ('wide', 'wide', 22, -16, 'scream'),
        'strain': ('squeeze', 'squeeze', -6, 18, 'teeth'), 'angry': ('open', 'open', -8, 20, 'teeth'), 'tired': ('half', 'half', -4, -6, 'frown'),
        'sad': ('open', 'open', 6, -16, 'frown'), 'dead': ('x', 'x', 0, 0, 'flat'), 'wonder': ('star', 'star', 18, -6, 'o'),
        'smug': ('half', 'open', 6, 8, 'smug'), 'lick': ('happy', 'happy', 6, 0, 'tongue'), 'disgust': ('half', 'squeeze', -4, 14, 'wavy'), 'talk': ('open', 'open', 4, 0, 'open'),
    }
    l, r, lift, tilt, m = E[expr]
    eye(256 - ex, l); eye(256 + ex, r)
    for s in (-1, 1):                                    # brows: tilt > 0 = angry V (inner ends down)
        cx = 256 + s * ex; y = eye_y - 80 - lift
        inner, outer = (cx - s * 38, y + tilt), (cx + s * 38, y - tilt * .6)
        g.line([inner, outer], fill=ink, width=14)
    if o.get('mustache'): g.chord([180, 300, 332, 368], 180, 360, fill=o['mustache']);
    if o.get('freckles'):
        for x, y in [(150, 290), (172, 300), (160, 316), (352, 290), (340, 300), (362, 316)]: g.ellipse([x - 6, y - 6, x + 6, y + 6], fill=(205, 120, 80, 200))
    if o.get('blush'): [g.ellipse([cx - 40, 290, cx + 40, 320], fill=(255, 120, 120, 90)) for cx in (130, 382)]
    mouth(m)
    return im

EXPRS = ['neutral', 'smile', 'grin', 'shock', 'scared', 'panic', 'strain', 'angry', 'tired', 'sad', 'dead', 'wonder', 'smug', 'lick', 'disgust', 'talk']

def face_mat(cname, expr, o):
    os.makedirs(FACEDIR, exist_ok=True)
    p = os.path.join(FACEDIR, f'{cname}_{expr}.png'); draw_face(expr, o).save(p)
    m = bpy.data.materials.new(f'face_{cname}_{expr}'); m.use_nodes = True; nt = m.node_tree
    b = nt.nodes['Principled BSDF']; b.inputs['Roughness'].default_value = .4
    t = nt.nodes.new('ShaderNodeTexImage'); t.image = bpy.data.images.load(p); t.extension = 'CLIP'
    nt.links.new(t.outputs['Color'], b.inputs['Base Color']); nt.links.new(t.outputs['Alpha'], b.inputs['Alpha'])
    try: m.surface_render_method = 'DITHERED'
    except Exception: pass
    return m

# ---------------- character ----------------
def make(cname, o):
    """o: skin, shirt, pants, shoes, hair (colour), hair_style, hat, hat_col, kid, skirt, coat, vest, belt, tie, collar, visor, mustache, freckles."""
    k = .78 if o.get('kid') else 1.0; u = U * k
    root = pivot(cname, (0, 0, 0)); root['blocky'] = 1
    hips = pivot(cname + '_hips', (0, 0, 2 * u), root)
    torso = pivot(cname + '_torso', (0, 0, 0), hips)
    legs = {}
    for s, side in ((1, 'L'), (-1, 'R')):
        lp = pivot(f'{cname}_leg{side}', (s * .5 * u, 0, 0), hips)
        block(f'{cname}_thigh{side}', (.98 * u, .98 * u, 1.55 * u), (0, 0, -.78 * u), o['pants'], lp)
        block(f'{cname}_shoe{side}', (1.0 * u, 1.08 * u, .48 * u), (0, -.04 * u, -1.76 * u), o.get('shoes', '#2a2a2a'), lp, bevel=.04)
        legs[side] = lp
    tw = 2.0 * u
    block(cname + '_body', (tw, 1.0 * u, 2.0 * u), (0, 0, 1.0 * u), o['shirt'], torso)
    if o.get('belt'): block(cname + '_belt', (tw * 1.02, 1.04 * u, .2 * u), (0, 0, .12 * u), o['belt'], torso, bevel=.02)
    if o.get('vest'):
        block(cname + '_vestL', (.72 * u, 1.06 * u, 1.85 * u), (.62 * u, 0, 1.0 * u), o['vest'], torso, bevel=.03)
        block(cname + '_vestR', (.72 * u, 1.06 * u, 1.85 * u), (-.62 * u, 0, 1.0 * u), o['vest'], torso, bevel=.03)
    if o.get('tie'): block(cname + '_tie', (.26 * u, .1 * u, 1.2 * u), (0, -.52 * u, 1.25 * u), o['tie'], torso, bevel=.02)
    if o.get('collar'): block(cname + '_collar', (1.3 * u, 1.1 * u, .22 * u), (0, 0, 1.95 * u), o['collar'], torso, bevel=.03)
    if o.get('coat'):
        block(cname + '_coat', (tw * 1.04, 1.08 * u, 2.0 * u), (0, 0, 1.0 * u), o['coat'], torso)
        block(cname + '_coattail', (tw * 1.04, 1.08 * u, 1.1 * u), (0, 0, -.5 * u), o['coat'], hips)
        if o.get('coat_open'): block(cname + '_shirtgap', (.5 * u, .1 * u, 1.9 * u), (0, -.53 * u, 1.0 * u), o['shirt'], torso, bevel=.01)
        for i in range(3): block(cname + f'_btn{i}', (.12 * u, .06 * u, .12 * u), (.32 * u if o.get('coat_open') else 0, -.56 * u, (1.6 - i * .5) * u), '#222222', torso, bevel=.01)
    if o.get('skirt'): block(cname + '_skirt', (tw * 1.06, 1.2 * u, 1.3 * u), (0, 0, -.62 * u), o['skirt'], hips)
    if o.get('badge'): block(cname + '_badge', (.3 * u, .06 * u, .3 * u), (.55 * u, -.53 * u, 1.55 * u), o['badge'], torso, bevel=.01)
    if o.get('logo'): block(cname + '_logo', (.9 * u, .04 * u, .7 * u), (0, -.52 * u, 1.2 * u), o['logo'], torso, bevel=.01)
    arms = {}
    for s, side in ((1, 'L'), (-1, 'R')):
        ap = pivot(f'{cname}_arm{side}', (s * 1.5 * u, 0, 1.82 * u), torso)
        sleeve = o.get('coat') or o['shirt']
        if o.get('short_sleeves'):
            block(f'{cname}_sleeve{side}', (.98 * u, .98 * u, .8 * u), (0, 0, -.25 * u), sleeve, ap)
            block(f'{cname}_forearm{side}', (.9 * u, .9 * u, 1.2 * u), (0, 0, -1.15 * u), o['skin'], ap)
        else:
            block(f'{cname}_sleeve{side}', (.98 * u, .98 * u, 1.7 * u), (0, 0, -.68 * u), sleeve, ap)
            block(f'{cname}_hand{side}', (.86 * u, .86 * u, .42 * u), (0, 0, -1.68 * u), o.get('gloves', o['skin']), ap)
        arms[side] = ap
    neck = pivot(cname + '_neck', (0, 0, 2.0 * u), torso)
    hs = 1.3 if not o.get('kid') else 1.45
    head = block(cname + '_head', (1.22 * u * hs, 1.15 * u * hs, 1.15 * u * hs), (0, 0, .62 * u * hs), o['skin'], neck, bevel=.09 * u / .3 * hs, seg=5)
    # faces
    faces = {}
    for ex in o.get('exprs', EXPRS):
        bpy.ops.mesh.primitive_plane_add(size=1); f = bpy.context.object; f.name = f'{cname}_face_{ex}'
        f.scale = (1.05 * u * hs, 1.05 * u * hs, 1); f.rotation_euler = (D(90), 0, 0); f.location = (0, -.577 * u * hs - .003, .6 * u * hs); f.parent = neck
        f.data.materials.append(face_mat(cname, ex, o)); f.hide_render = ex != 'neutral'; faces[ex] = f
    # hair / hats
    hc = o.get('hair', '#3a2a1a'); st = o.get('hair_style', 'short'); H = 1.15 * u * hs; top = .62 * u * hs + H / 2
    hatted = o.get('hat') in ('flatcap', 'bowler', 'cloche', 'police', 'hardhat')
    if st in ('short', 'messy', 'long', 'bob', 'spiky') and not hatted:
        block(cname + '_hairtop', (1.3 * u * hs, 1.24 * u * hs, .3 * u * hs), (0, .02 * u, top + .06 * u), hc, neck, bevel=.05)
        block(cname + '_hairback', (1.3 * u * hs, .3 * u * hs, .9 * u * hs), (0, .5 * u * hs, top - .38 * u * hs), hc, neck, bevel=.04)
        for s in (-1, 1): block(cname + f'_hairside{s}', (.18 * u * hs, 1.2 * u * hs, .5 * u * hs), (s * .62 * u * hs, .03 * u, top - .18 * u * hs), hc, neck, bevel=.03)
        block(cname + '_fringe', (1.28 * u * hs, .2 * u * hs, .22 * u * hs), (0, -.55 * u * hs, top - .1 * u * hs), hc, neck, bevel=.03)
    if st == 'messy':
        for i, (x, z) in enumerate([(-.4, .32), (0, .38), (.38, .3), (-.15, .28), (.2, .34)]):
            b = block(cname + f'_tuft{i}', (.36 * u, .36 * u, .3 * u), (x * u, (-.25 + .15 * i) * u, top + z * u), hc, neck, bevel=.05); b.rotation_euler = (D(15 * (i - 2)), D(20 * (i % 3 - 1)), D(30 * i))
    if st == 'spiky':
        for i in range(7):
            bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=.2 * u, depth=.55 * u); c = bpy.context.object; c.name = cname + f'_spike{i}'
            c.parent = neck; c.location = ((-.45 + .15 * i) * u, (.25 - .07 * i) * u, top + .3 * u); c.rotation_euler = (D(-20), D((i - 3) * 14), D(45)); c.data.materials.append(plastic(hc))
    if hatted and st in ('short', 'messy', 'bob', 'long'):
        block(cname + '_hairback', (1.3 * u * hs, .3 * u * hs, .7 * u * hs), (0, .5 * u * hs, top - .45 * u * hs), hc, neck, bevel=.04)
        for s2 in (-1, 1): block(cname + f'_hairside{s2}', (.16 * u * hs, .9 * u * hs, .35 * u * hs), (s2 * .62 * u * hs, .1 * u, top - .3 * u * hs), hc, neck, bevel=.03)
    if st in ('long', 'bob'):
        block(cname + '_hairlong', (1.34 * u, .5 * u, 1.3 * u if st == 'long' else .95 * u), (0, .42 * u, top - (.8 if st == 'long' else .55) * u), hc, neck, bevel=.05)
        for s in (-1, 1): block(cname + f'_hairlock{s}', (.24 * u, .9 * u, .95 * u if st == 'long' else .7 * u), (s * .64 * u, .08 * u, top - .55 * u), hc, neck, bevel=.04)
    hat = o.get('hat'); hcol = o.get('hat_col', '#333333')
    if hat == 'flatcap':
        block(cname + '_cap', (1.36 * u * hs, 1.3 * u * hs, .34 * u * hs), (0, .02 * u, top + .1 * u), hcol, neck, bevel=.08)
        block(cname + '_capbrim', (1.2 * u * hs, .5 * u * hs, .1 * u), (0, -.72 * u * hs, top), hcol, neck, bevel=.03)
    if hat == 'bowler':
        bpy.ops.mesh.primitive_uv_sphere_add(radius=.62 * u * hs, segments=32, ring_count=16); bpy.ops.object.shade_smooth(); b = bpy.context.object; b.name = cname + '_bowler'; b.scale = (1, 1, .85); b.parent = neck; b.location = (0, 0, top + .05 * u); b.data.materials.append(plastic(hcol, .3))
        bpy.ops.mesh.primitive_cylinder_add(radius=.9 * u * hs, depth=.06 * u, vertices=40); b = bpy.context.object; b.name = cname + '_brim'; b.parent = neck; b.location = (0, 0, top + .02 * u); b.data.materials.append(plastic(hcol, .3))
        block(cname + '_band', (1.26 * u * hs, 1.26 * u * hs, .14 * u), (0, 0, top + .1 * u), '#1a1a1a', neck, bevel=.03)
    if hat == 'cloche':
        bpy.ops.mesh.primitive_uv_sphere_add(radius=.76 * u * hs, segments=32, ring_count=16); bpy.ops.object.shade_smooth(); b = bpy.context.object; b.name = cname + '_cloche'; b.scale = (1, 1, .72); b.parent = neck; b.location = (0, .02 * u, top - .1 * u); b.data.materials.append(plastic(hcol, .5))
        bpy.ops.mesh.primitive_uv_sphere_add(radius=.15 * u); bpy.ops.object.shade_smooth(); b = bpy.context.object; b.name = cname + '_flower'; b.parent = neck; b.location = (.6 * u * hs, -.3 * u * hs, top + .05 * u); b.data.materials.append(plastic(o.get('flower', '#f2c12e')))
    if hat == 'police':
        bpy.ops.mesh.primitive_cylinder_add(radius=.7 * u * hs, depth=.45 * u, vertices=40); bpy.ops.object.shade_smooth(); b = bpy.context.object; b.name = cname + '_policehat'; b.parent = neck; b.location = (0, .02 * u, top + .2 * u); b.data.materials.append(plastic(hcol, .45))
        block(cname + '_visor', (1.1 * u * hs, .45 * u * hs, .08 * u), (0, -.68 * u * hs, top - .02 * u), '#111111', neck, bevel=.02)
        block(cname + '_hatbadge', (.25 * u, .05 * u, .25 * u), (0, -.71 * u * hs, top + .2 * u), '#e8c04a', neck, bevel=.01)
    if hat == 'hardhat':
        bpy.ops.mesh.primitive_uv_sphere_add(radius=.7 * u * hs, segments=32, ring_count=16); bpy.ops.object.shade_smooth(); b = bpy.context.object; b.name = cname + '_hardhat'; b.scale = (1, 1.05, .75); b.parent = neck; b.location = (0, 0, top - .02 * u); b.data.materials.append(plastic(hcol, .3))
        block(cname + '_hhbrim', (1.6 * u * hs, 1.7 * u * hs, .08 * u), (0, -.08 * u, top - .05 * u), hcol, neck, bevel=.03)
    if o.get('visor'):
        block(cname + '_visor', (1.28 * u * hs, .12 * u, .3 * u), (0, -.62 * u * hs, .72 * u * hs), o['visor'], neck, bevel=.03, mat=glow(o['visor']))
    if o.get('backpack'): block(cname + '_backpack', (1.5 * u, .7 * u, 1.6 * u), (0, .8 * u, 1.05 * u), o['backpack'], torso)
    C = {'name': cname, 'root': root, 'hips': hips, 'torso': torso, 'neck': neck, 'armL': arms['L'], 'armR': arms['R'], 'legL': legs['L'], 'legR': legs['R'], 'faces': faces, 'u': u, 'o': o}
    return C

def glow(col, k=3):
    m = bpy.data.materials.new('glow_' + col); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = hexrgb(col); b.inputs['Emission Color'].default_value = hexrgb(col); b.inputs['Emission Strength'].default_value = k; return m

# ---------------- performance ----------------
# pose: {joint: (fwd, out, turn)} degrees. arms/legs: fwd = swing forward/up, out = away from the body. torso/neck/hips: fwd = lean/nod forward, out = tilt to own left, turn = look to own left.
POSES = {
    'stand': {}, 'idle': {'armL': (0, 4, 0), 'armR': (0, 4, 0)},
    'wave': {'armR': (10, 150, 0), 'neck': (0, 0, -8)},
    'point': {'armR': (88, 8, 0), 'torso': (0, 0, -10)},
    'shrug': {'armL': (25, 40, 0), 'armR': (25, 40, 0), 'neck': (0, 8, 0)},
    'shock': {'armL': (60, 35, 0), 'armR': (60, 35, 0), 'torso': (-6, 0, 0), 'neck': (-8, 0, 0)},
    'hands_head': {'armL': (150, 30, 0), 'armR': (150, 30, 0), 'torso': (4, 0, 0)},
    'flail': {'armL': (40, 150, 0), 'armR': (80, 120, 0), 'torso': (-20, 0, 0), 'neck': (-15, 0, 0)},
    'slip': {'legR': (80, 0, 0), 'legL': (-10, 0, 0), 'armL': (40, 120, 0), 'armR': (70, 110, 0), 'torso': (-25, 0, 0), 'neck': (-20, 0, 0)},
    'fall': {'legL': (40, 20, 0), 'legR': (10, 15, 0), 'armL': (20, 155, 0), 'armR': (20, 150, 0), 'torso': (-10, 0, 0), 'neck': (-25, 0, 0)},
    'float': {'armL': (0, 85, 0), 'armR': (0, 85, 0), 'neck': (-8, 0, 0)},
    'stroke1': {'armL': (165, 10, 0), 'armR': (30, 20, 0), 'torso': (10, 0, 12), 'neck': (-14, 0, -10)},
    'stroke2': {'armL': (30, 20, 0), 'armR': (165, 10, 0), 'torso': (10, 0, -12), 'neck': (-14, 0, 10)},
    'reach_up': {'armR': (175, 0, 0), 'armL': (40, 25, 0), 'neck': (-20, 0, 0)},
    'reach_fwd': {'armR': (95, 0, 0), 'armL': (95, 0, 0), 'torso': (15, 0, 0)},
    'slump': {'armL': (5, 20, 0), 'armR': (5, 20, 0), 'neck': (22, 10, 0), 'torso': (8, 0, 0)},
    'present': {'armR': (60, 50, 0), 'armL': (5, 6, 0), 'neck': (0, 0, -15)},
    'press': {'armL': (100, 10, 0), 'armR': (100, 10, 0), 'torso': (14, 0, 0), 'neck': (-6, 0, 0)},
    'lean': {'armL': (60, 5, 0), 'armR': (60, 5, 0), 'torso': (22, 0, 0)},
    'phone': {'armR': (110, -15, 0), 'armL': (5, 6, 0), 'neck': (22, 0, 0)},
    'mummy': {'armL': (0, -2, 0), 'armR': (0, -2, 0)},
    'clap': {'armL': (80, -10, 0), 'armR': (80, -10, 0)},
    'cheer': {'armL': (165, 25, 0), 'armR': (165, 25, 0), 'neck': (-12, 0, 0)},
    'walk0': {'legL': (28, 0, 0), 'legR': (-28, 0, 0), 'armL': (-28, 4, 0), 'armR': (28, 4, 0)},
    'walk1': {'legL': (-28, 0, 0), 'legR': (28, 0, 0), 'armL': (28, 4, 0), 'armR': (-28, 4, 0)},
    'run0': {'legL': (55, 0, 0), 'legR': (-45, 0, 0), 'armL': (-55, 6, 0), 'armR': (60, 6, 0), 'torso': (12, 0, 0)},
    'run1': {'legL': (-45, 0, 0), 'legR': (55, 0, 0), 'armL': (60, 6, 0), 'armR': (-55, 6, 0), 'torso': (12, 0, 0)},
    'sit': {'legL': (90, 4, 0), 'legR': (90, 4, 0), 'armL': (20, 10, 0), 'armR': (20, 10, 0)},
}
JOINTS = ['hips', 'torso', 'neck', 'armL', 'armR', 'legL', 'legR']

def set_pose(C, pose, frame=None, interp=None):
    P = POSES[pose] if isinstance(pose, str) else pose
    for j in JOINTS:
        f, o, t = P.get(j, (0, 0, 0))
        side = 1 if j.endswith('L') else -1
        ob = C[j]
        if j in ('armL', 'armR', 'legL', 'legR'): ob.rotation_euler = (-D(f), -side * D(o), side * D(t))
        else: ob.rotation_euler = (D(f), D(o), D(t))
        if frame is not None:
            ob.keyframe_insert('rotation_euler', frame=frame)

def set_face(C, expr, frame):
    for ex, f in C['faces'].items():
        f.hide_render = ex != expr; f.keyframe_insert('hide_render', frame=frame)
        f.hide_viewport = f.hide_render; f.keyframe_insert('hide_viewport', frame=frame)

def place(C, frame, loc=None, rot_z=None, rot=None):
    r = C['root']
    if loc is not None: r.location = loc; r.keyframe_insert('location', frame=frame)
    if rot is not None: r.rotation_euler = tuple(D(a) for a in rot); r.keyframe_insert('rotation_euler', frame=frame)
    elif rot_z is not None: r.rotation_euler = (0, 0, D(rot_z)); r.keyframe_insert('rotation_euler', frame=frame)

def cycle(C, a, b, f0, f1, period, frame_step=None):
    """alternate two poses (walk/run/swim) between frames f0..f1, one half cycle per period/2 frames"""
    half = period / 2; f = f0; i = 0
    while f <= f1:
        set_pose(C, a if i % 2 == 0 else b, frame=round(f)); f += half; i += 1

def constant_keys(obj, path_prefix=('hide_render', 'hide_viewport')):
    ad = obj.animation_data
    if not ad or not ad.action: return
    for fc in fcurves(ad.action):
        if fc.data_path in path_prefix:
            for kp in fc.keyframe_points: kp.interpolation = 'CONSTANT'

def fcurves(act):
    try: return list(act.fcurves)
    except Exception: pass
    out = []
    for layer in act.layers:
        for strip in layer.strips:
            for cb in strip.channelbags: out += list(cb.fcurves)
    return out
