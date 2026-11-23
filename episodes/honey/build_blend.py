"""Builds honey.blend: "What if you fell into a giant pool of honey?" with blocky toy characters (kit/blender/blocky.py).
Three places far apart in one scene: FACTORY (x 0), BOSTON 1919 (x 100), MUSEUM year 5026 (x 200). One camera per shot,
switched by timeline markers. Run:  python3 build_blend.py  (writes out/honey.blend)"""
import bpy, sys, os, math, mathutils, json
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, os.path.join(HERE, '../../kit/blender')); sys.path.insert(0, HERE)
import blocky as bk
from blocky import block, plastic, hexrgb, pivot, D
from cast_blocky import CAST

FPS = 30
def F(t): return int(round(t * FPS)) + 1
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene; sc.render.fps = FPS
END = 48.0; sc.frame_start = 1; sc.frame_end = F(END)

# ---------------------------------------------------------------- materials
def mat(name, col, rough=.5, metal=0, **kw):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = hexrgb(col) if isinstance(col, str) else col
    b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    for k, v in kw.items(): b.inputs[k].default_value = v
    return m
HONEY = mat('honey', '#e08c00', .05, **{'Subsurface Weight': .12, 'Subsurface Radius': (1, .45, .08), 'Subsurface Scale': .1, 'Coat Weight': .8, 'Coat Roughness': .02, 'IOR': 1.49})
HONEY.node_tree.nodes['Principled BSDF'].inputs['Emission Color'].default_value = hexrgb('#ff9a10'); HONEY.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = .08
MOLASSES = mat('molasses', '#2a1206', .08, **{'Coat Weight': 1.0, 'Coat Roughness': .03, 'Specular IOR Level': .7})
AMBER = mat('amber', '#ffae3a', .03, **{'Transmission Weight': 1.0, 'IOR': 1.45})
STEEL = mat('steel', '#9aa3ad', .3, .9); DARK = mat('dark', '#2b2e33', .6)
def text(s, at, size, col='#ffffff', rot=(90, 0, 0), extrude=.01, align='CENTER', emit=0, parent=None):
    cu = bpy.data.curves.new('txt', 'FONT'); cu.body = s; cu.size = size; cu.extrude = extrude; cu.align_x = align; cu.align_y = 'CENTER'
    try: cu.font = bpy.data.fonts.load('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf')
    except Exception: pass
    o = bpy.data.objects.new('txt_' + s[:12], cu); sc.collection.objects.link(o); o.location = at; o.rotation_euler = tuple(D(a) for a in rot)
    m = mat('txt_' + col, col, .4)
    if emit: m.node_tree.nodes['Principled BSDF'].inputs['Emission Color'].default_value = hexrgb(col); m.node_tree.nodes['Principled BSDF'].inputs['Emission Strength'].default_value = emit
    cu.materials.append(m); o.parent = parent; return o
def box(name, size, at, col=None, m=None, bevel=.02, rot=None):
    o = block(name, size, at, col or '#888888', None, bevel=bevel, mat=m, seg=2)
    if rot: o.rotation_euler = tuple(D(a) for a in rot)
    return o
def cyl(name, r, h, at, col=None, m=None, rot=None, verts=32):
    bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, vertices=verts, location=at); o = bpy.context.object; o.name = name
    o.data.materials.append(m or plastic(col)); bpy.ops.object.shade_smooth()
    if rot: o.rotation_euler = tuple(D(a) for a in rot)
    return o
def area(name, at, aim, energy, col='#ffffff', size=2.0, shape='SQUARE'):
    l = bpy.data.lights.new(name, 'AREA'); l.energy = energy; l.size = size; l.color = hexrgb(col)[:3]; l.shape = shape
    o = bpy.data.objects.new(name, l); sc.collection.objects.link(o); o.location = at
    o.rotation_euler = (mathutils.Vector(aim) - mathutils.Vector(at)).to_track_quat('-Z', 'Y').to_euler(); return o
def point(name, at, energy, col='#ffffff', r=.2):
    l = bpy.data.lights.new(name, 'POINT'); l.energy = energy; l.color = hexrgb(col)[:3]; l.shadow_soft_size = r
    o = bpy.data.objects.new(name, l); sc.collection.objects.link(o); o.location = at; return o
def key(o, path, frame, value=None, interp=None):
    if value is not None: setattr(o, path, value)
    o.keyframe_insert(path, frame=frame)

# world: soft sky light everywhere (each place adds its own lights)
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; bg = w.node_tree.nodes['Background']
bg.inputs[0].default_value = hexrgb('#9cc4ff'); bg.inputs[1].default_value = .35

# ================================================================ FACTORY (x 0)
def build_factory():
    box('f_floor', (30, 30, .2), (0, 2, -.1), m=mat('concrete', '#8d8a84', .85), bevel=0)
    wallm = mat('fwall', '#c9b98f', .8)
    box('f_wall_back', (30, .3, 12), (0, 12, 6), m=wallm, bevel=0); box('f_wall_l', (.3, 30, 12), (-12, 2, 6), m=wallm, bevel=0); box('f_wall_r', (.3, 30, 12), (12, 2, 6), m=wallm, bevel=0)
    for i in range(7): box(f'f_pillar{i}', (.5, .5, 12), (-11 + i * 3.6, 11.7, 6), '#a0441f', bevel=.03)
    # big windows on the back wall (bright)
    for i in range(4): box(f'f_window{i}', (2.6, .1, 3.2), (-8 + i * 5.3, 11.82, 7.2), m=bk.glow('#fff3d0', 2.2), bevel=0)
    # THE VAT: steel walls, honey inside
    VX, VY, VW, VD, RIM = 0, 2.6, 6.4, 5.2, 1.25
    for nm, size, at in [('vat_front', (VW + .5, .25, RIM), (VX, VY - VD / 2, RIM / 2)), ('vat_back', (VW + .5, .25, RIM), (VX, VY + VD / 2, RIM / 2)),
                         ('vat_l', (.25, VD, RIM), (VX - VW / 2, VY, RIM / 2)), ('vat_r', (.25, VD, RIM), (VX + VW / 2, VY, RIM / 2))]:
        box(nm, size, at, m=STEEL, bevel=.04)
    for i in range(12): cyl(f'vat_rivet{i}', .04, .03, (VX - VW / 2 + .3 + i * .52, VY - VD / 2 - .13, RIM - .15), m=STEEL, rot=(90, 0, 0), verts=8)
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=120, y_subdivisions=100, size=1, location=(VX, VY, 1.02)); h = bpy.context.object; h.name = 'honey_surface'
    h.scale = (VW, VD, 1); bpy.ops.object.transform_apply(scale=True); h.data.materials.append(HONEY); bpy.ops.object.shade_smooth()
    box('honey_body', (VW - .05, VD - .05, .9), (VX, VY, .55), m=HONEY, bevel=0)
    # slow viscous swell + splash ripples (Wave modifier keyed on the splash)
    tex = bpy.data.textures.new('honeynoise', 'CLOUDS'); tex.noise_scale = 1.4
    d = h.modifiers.new('swell', 'DISPLACE'); d.texture = tex; d.strength = .05; d.texture_coords = 'OBJECT'
    em = bpy.data.objects.new('honey_noise_drift', None); sc.collection.objects.link(em); d.texture_coords_object = em
    key(em, 'location', 1, (0, 0, 0)); key(em, 'location', F(END), (1.2, .8, .3))
    wv = h.modifiers.new('splash', 'WAVE'); wv.use_normal = False; wv.height = .12; wv.width = .7; wv.speed = .06; wv.narrowness = 1.6; wv.falloff_radius = 3.5
    wv.start_position_x = 0; wv.start_position_y = .0; wv.time_offset = F(2.9); wv.damping_time = 90; wv.lifetime = 0
    # catwalk along the front edge (z 1.3) with a railing on the outer side
    CW = mathutils.Vector((0, -.55, 1.3))
    box('catwalk', (9, 1.1, .1), (0, CW.y, CW.z - .05), m=mat('grate', '#5b6470', .5, .6), bevel=.01)
    for i in range(10): box(f'cat_post{i}', (.08, .08, 1.0), (-4.4 + i * .98, CW.y - .5, CW.z + .5), '#e0b020', bevel=.01)
    box('cat_rail', (9, .08, .08), (0, CW.y - .5, CW.z + 1.0), '#e0b020', bevel=.01); box('cat_rail2', (9, .06, .06), (0, CW.y - .5, CW.z + .55), '#e0b020', bevel=.01)
    for i in range(4): box(f'cat_leg{i}', (.15, .15, 1.3), (-4 + i * 2.7, CW.y - .4, .65), m=STEEL, bevel=.01)
    box('cat_stairs', (1.0, 2.2, .1), (4.9, -1.5, .7), '#5b6470', rot=(-35, 0, 0))
    box('honey_puddle', (.7, .5, .02), (.25, CW.y + .15, CW.z + .005), m=HONEY, bevel=.01)
    # pipe pouring honey into the vat
    cyl('pipe_v', .22, 6, (2.2, 4.6, 5.5), m=STEEL); cyl('pipe_h', .22, 3, (2.2, 6.0, 8.4), m=STEEL, rot=(90, 0, 0)); cyl('pipe_mouth', .28, .3, (2.2, 4.6, 2.5), m=STEEL)
    stream = cyl('honey_stream', .09, 1.3, (2.2, 4.6, 1.7), m=HONEY, verts=16)
    # signs
    sgn = box('f_sign', (6.5, .12, 1.4), (0, 11.7, 4.6), '#3a2412', bevel=.04)
    text('GOLDEN HIVE HONEY CO.', (0, 11.6, 4.6), .62, '#ffd23a', extrude=.02)
    box('caution_bg', (1.5, .06, .7), (-2.6, -1.08, 2.0), '#f2c200', bevel=.02); text('CAUTION: STICKY', (-2.6, -1.12, 2.0), .18, '#111111')
    # shelves with honey jars, barrels, crates, hex decor
    for z in (1.0, 2.0, 3.0):
        box(f'shelf{z}', (6, .7, .08), (-7.5, 9, z), '#7a4a26', bevel=.01)
        for k in range(9):
            j = cyl(f'jar{z}_{k}', .2, .42, (-10 + k * .62, 9, z + .25), m=HONEY); box(f'lid{z}_{k}', (.36, .36, .1), (-10 + k * .62, 9, z + .5), '#d23a2a', bevel=.02)
    for i in range(6): cyl(f'barrel{i}', .5, 1.2, (7 + (i % 3) * 1.1, 8.5 - (i // 3) * 1.2, .6), '#c07a2a' if i % 2 else '#8a4a1a')
    for i in range(5): box(f'crate{i}', (1, 1, 1), (-9 + (i % 3) * 1.05, 4 + (i // 3) * 1.05, .5 + (i // 3) * 0), '#b8874a', bevel=.03)
    for i in range(8):                                                     # hexagon decor (honeycomb) on side wall
        bpy.ops.mesh.primitive_cylinder_add(radius=.5, depth=.1, vertices=6, location=(11.8, -2 + (i % 4) * 1.0, 5 + (i // 4) * .9 + (i % 2) * .45), rotation=(0, D(90), 0))
        o = bpy.context.object; o.name = f'hex{i}'; o.data.materials.append(plastic('#ffc21a'))
    # the WALL CLOCK (time-lapse gag)
    cyl('clock_face', .9, .1, (-4.5, 11.8, 6.8), '#f6f2e6', rot=(90, 0, 0)); cyl('clock_rim', .98, .08, (-4.5, 11.85, 6.8), '#222222', rot=(90, 0, 0))
    hands = []
    for nm, ln, wd in (('clock_hour', .5, .09), ('clock_min', .75, .06)):
        pv = pivot(nm + '_pv', (-4.5, 11.72, 6.8)); b = box(nm, (wd, .03, ln), (0, 0, ln / 2 - .05), '#111111', bevel=.01); b.parent = pv; hands.append(pv)
    # the "honey never spoils" hero jar (close-up)
    jar = cyl('hero_jar', .32, .7, (-6.3, 8.4, 1.4), m=AMBER); cyl('hero_honey', .3, .55, (-6.3, 8.4, 1.36), m=HONEY); box('hero_lid', (.6, .6, .14), (-6.3, 8.4, 1.82), '#c8302a', bevel=.04)
    box('hero_label', (.5, .02, .3), (-6.3, 8.08, 1.42), '#fff4dc', bevel=.005)
    text('BEST BEFORE:', (-6.3, 8.06, 1.48), .055, '#5a3010', extrude=.002); text('NEVER', (-6.3, 8.06, 1.37), .11, '#c8302a', extrude=.003)
    # lights
    area('f_key', (4, -6, 9), (0, 2.5, 1), 2600, '#ffe2b0', 6); area('f_fill', (-7, -5, 4), (0, 2, 1.5), 700, '#cfe0ff', 5)
    area('f_back', (0, 10.5, 8), (0, 2, 1), 1600, '#ffd28a', 6)
    for i in range(3):
        x = -4 + i * 4; cyl(f'lampshade{i}', .5, .35, (x, 2.5, 7.2), '#2a3a2a', verts=24); box(f'lampcord{i}', (.03, .03, 4.6), (x, 2.5, 9.6), '#111111', bevel=0)
        bulb = bpy.ops.mesh.primitive_uv_sphere_add(radius=.16, location=(x, 2.5, 6.95)); bpy.context.object.data.materials.append(bk.glow('#fff0c8', 8))
        point(f'lamp{i}', (x, 2.5, 6.6), 900, '#ffd9a0', .4)
    return {'stream': stream, 'hands': hands, 'catwalk': CW, 'vat': (VX, VY), 'surface': 1.02}

# ================================================================ BOSTON 1919 (x 100)
def build_boston():
    X0 = 100
    box('b_street', (12, 90, .2), (X0, 25, -.1), m=mat('cobble', '#6f675c', .9), bevel=0)
    for s in (-1, 1): box(f'b_sidewalk{s}', (3, 90, .3), (X0 + s * 7.5, 25, .05), '#a59f92', bevel=.02)
    for i in range(30): box(f'b_line{i}', (.12, 1.2, .01), (X0, -10 + i * 3, .01), '#d8cfae', bevel=0)
    brick = ['#8a3a28', '#7a4a30', '#a0583a', '#6a3022', '#8c5a3c']
    for s in (-1, 1):
        y = -12
        for i in range(12):
            wdt = 6 + (i % 3) * 1.5; hgt = 8 + ((i * 7) % 5) * 1.6
            bx = X0 + s * (9 + 3); box(f'b_bld{s}_{i}', (6, wdt - .2, hgt), (bx, y + wdt / 2, hgt / 2), brick[(i + (s > 0)) % 5], bevel=.05)
            for r in range(int(hgt // 2.2)):
                for c in range(int(wdt // 1.6)):
                    box(f'b_win{s}_{i}_{r}_{c}', (.08, .7, 1.1), (bx - s * 3.02, y + .9 + c * 1.6, 2.0 + r * 2.2), m=mat('winglass', '#2a3a52', .1, .3), bevel=0)
            box(f'b_cornice{s}_{i}', (6.4, wdt - .1, .4), (bx, y + wdt / 2, hgt + .2), '#d8cdb4', bevel=.03)
            if i % 2 == 0:
                box(f'b_awning{s}_{i}', (1.4, wdt - 1, .1), (bx - s * 3.6, y + wdt / 2, 3.0), ['#2f6a3a', '#a02a2a', '#2a4a8a'][i % 3], bevel=.02, rot=(0, s * -20, 0))
            y += wdt
    # elevated railway crossing the street (it was smashed in the real flood)
    for s in (-1, 1): box(f'b_el_col{s}', (.4, .4, 6), (X0 + s * 5, 22, 3), '#3a4a3a', bevel=.02)
    box('b_el_deck', (40, 2.2, .6), (X0, 22, 6.2), '#3a4a3a', bevel=.03)
    for i in range(16): box(f'b_el_truss{i}', (.15, .15, 1.6), (X0 - 19 + i * 2.5, 22, 7.2), '#2e3a2e', bevel=0, rot=(0, 35 if i % 2 else -35, 0))
    # the giant MOLASSES TANK at the end of the street
    tank = cyl('b_tank', 8, 15, (X0, 52, 7.5), '#6a6e72', verts=64)
    for k in range(6): cyl(f'b_tank_band{k}', 8.05, .2, (X0, 52, 1 + k * 2.6), '#4a4e52', verts=64)
    tl = text('MOLASSES', (X0, 43.8, 11), 2.2, '#f2e8c8', extrude=.05)
    # 1919 props: lamp posts, a horse-cart, barrels
    for i in range(8):
        for s in (-1, 1): cyl(f'b_lamp{s}{i}', .08, 4, (X0 + s * 6.4, -6 + i * 7, 2), '#1e2420'); bpy.ops.mesh.primitive_uv_sphere_add(radius=.25, location=(X0 + s * 6.4, -6 + i * 7, 4.1)); bpy.context.object.data.materials.append(bk.glow('#fff0c0', 2))
    box('b_cart', (1.8, 3, 1.0), (X0 + 3.5, 14, 1.0), '#7a5030', bevel=.05)
    for s in (-1, 1): cyl(f'b_wheel{s}', .55, .12, (X0 + 3.5 + s * .95, 13.2, .55), '#3a2a1a', rot=(0, 90, 0)); cyl(f'b_wheelb{s}', .55, .12, (X0 + 3.5 + s * .95, 14.9, .55), '#3a2a1a', rot=(0, 90, 0))
    for i in range(4): cyl(f'b_barrel{i}', .4, 1.0, (X0 - 5.2 + (i % 2) * .85, 6 + i // 2 * .85, .7), '#8a5a2a')
    # the MOLASSES WAVE: a long rounded slab that rolls down the street toward the camera
    bpy.ops.mesh.primitive_cube_add(size=1); wave = bpy.context.object; wave.name = 'b_wave'; wave.scale = (13, 14, 1); bpy.ops.object.transform_apply(scale=True)
    bv = wave.modifiers.new('bevel', 'BEVEL'); bv.width = .5; bv.segments = 6
    sub = wave.modifiers.new('sub', 'SUBSURF'); sub.levels = 2; sub.render_levels = 2
    wt = bpy.data.textures.new('wavenoise', 'CLOUDS'); wt.noise_scale = 1.5; wd = wave.modifiers.new('lumps', 'DISPLACE'); wd.texture = wt; wd.strength = .35
    wave.data.materials.append(MOLASSES); bpy.ops.object.shade_smooth()
    flood = box('b_flood', (12, 90, .1), (X0, 25, -1), m=MOLASSES, bevel=0)
    # sky + sun
    area('b_sun', (X0 - 30, -30, 40), (X0, 20, 0), 25000, '#fff1da', 25); area('b_fill', (X0 + 20, -20, 10), (X0, 10, 2), 2500, '#bcd4ff', 15)
    sky = box('b_skycard', (140, .2, 70), (X0, 75, 30), m=bk.glow('#a8cdf2', 1.0), bevel=0)
    return {'X0': X0, 'wave': wave, 'flood': flood, 'tank': tank}

# ================================================================ MUSEUM year 5026 (x 200)
def build_museum():
    X0 = 200
    box('m_floor', (24, 24, .2), (X0, 4, -.1), m=mat('mfloor', '#20232a', .12, .2), bevel=0)
    wm = mat('mwall', '#2c3440', .7)
    box('m_wall_back', (24, .3, 9), (X0, 10, 4.5), m=wm, bevel=0); box('m_wall_l', (.3, 24, 9), (X0 - 9, 4, 4.5), m=wm, bevel=0); box('m_wall_r', (.3, 24, 9), (X0 + 9, 4, 4.5), m=wm, bevel=0)
    for i in range(5): box(f'm_neon{i}', (16, .05, .06), (X0, 9.8, 1 + i * 1.6), m=bk.glow('#38d8ff', 2.5), bevel=0)
    box('m_banner', (9, .1, 1.5), (X0, 9.75, 6.6), '#0e1620', bevel=.02)
    text('MUSEUM OF ANCIENT HUMANS', (X0, 9.65, 6.85), .45, '#38d8ff', emit=3); text('YEAR 5026', (X0, 9.65, 6.25), .32, '#ffffff', emit=2)
    # the exhibit: plinth + amber block
    P = mathutils.Vector((X0, 3.2, 0))
    box('m_plinth', (2.4, 2.4, .9), (P.x, P.y, .45), '#d8dde4', bevel=.06)
    box('m_plinth_glow', (2.5, 2.5, .05), (P.x, P.y, .9), m=bk.glow('#ffb43a', 2.0), bevel=0)
    amber = box('m_amber', (1.9, 1.9, 2.3), (P.x, P.y, .9 + 1.15), m=AMBER, bevel=.12)
    box('m_glasscase', (2.2, 2.2, 2.6), (P.x, P.y, .9 + 1.3), m=mat('glass', '#ffffff', 0.0, **{'Transmission Weight': 1.0, 'IOR': 1.05}), bevel=.02)
    box('m_plaque', (1.6, .08, .5), (P.x, P.y - 1.3, .55), '#c8a050', bevel=.02, rot=(-20, 0, 0))
    text('HONEY MAN', (P.x, P.y - 1.37, .62), .17, '#1a1208', extrude=.005, rot=(70, 0, 0)); text('c. 2026 A.D.  -  found in a honey vat', (P.x, P.y - 1.37, .47), .065, '#1a1208', extrude=.003, rot=(70, 0, 0))
    # other exhibits
    for i, (nm, col) in enumerate([('ANCIENT BRICK PHONE', '#30343c'), ('PIZZA, PROBABLY', '#e0a040'), ('TOILET PAPER (RARE)', '#f4f4f4')]):
        x = X0 - 6 + i * 6 if i != 1 else X0 + 6; y = 6.5 if i != 1 else 6.5
        if i == 1: x = X0 + 6
        if i == 2: x = X0 - 6; y = 1.5
        box(f'm_ped{i}', (1.2, 1.2, 1.1), (x, y, .55), '#d8dde4', bevel=.05)
        if i == 0: box('m_phone', (.4, .1, .7), (x, y, 1.45), col, bevel=.04, rot=(0, 0, 15)); box('m_phonescreen', (.32, .02, .55), (x - .01, y - .05, 1.45), m=bk.glow('#3a6aa0', 1), bevel=0, rot=(0, 0, 15))
        if i == 1: cyl('m_pizza', .45, .06, (x, y, 1.15), col); box('m_pep', (.12, .12, .03), (x + .1, y, 1.2), '#b02a1a')
        if i == 2: cyl('m_tp', .22, .35, (x, y, 1.3), col, rot=(90, 0, 0)); cyl('m_tpcore', .07, .36, (x, y, 1.3), '#b89a6a', rot=(90, 0, 0))
        box(f'm_ped_sign{i}', (1.4, .05, .3), (x, y - .7, .9), '#0e1620', bevel=.01); text(nm, (x, y - .74, .9), .09, '#38d8ff', emit=2, extrude=.002)
    box('m_rope', (3.6, .05, .05), (P.x, P.y - 1.9, .8), '#b02a2a', bevel=.01)
    for s in (-1, 1): cyl(f'm_post{s}', .06, .9, (P.x + s * 1.8, P.y - 1.9, .45), '#c8a050')
    box('m_sign_lick', (1.3, .06, .45), (P.x + 1.9, P.y - 1.1, 1.75), '#f2c200', bevel=.02); text('PLEASE DO NOT', (P.x + 1.9, P.y - 1.14, 1.82), .085, '#111111', extrude=.003); text('LICK THE GLASS', (P.x + 1.9, P.y - 1.14, 1.68), .085, '#111111', extrude=.003)
    # lights: spot on the exhibit, cool fill
    sp = bpy.data.lights.new('m_spot', 'SPOT'); sp.energy = 2500; sp.spot_size = D(40); sp.shadow_soft_size = .4; sp.color = hexrgb('#ffe6c0')[:3]
    so = bpy.data.objects.new('m_spot', sp); sc.collection.objects.link(so); so.location = (P.x, P.y - 2, 7); so.rotation_euler = (mathutils.Vector(P) + mathutils.Vector((0, 0, 1.8)) - so.location).to_track_quat('-Z', 'Y').to_euler()
    point('m_amberglow', (P.x, P.y, 2.0), 150, '#ffa020', .5)
    area('m_fill', (X0 - 4, -6, 4), (X0, 3, 1.5), 900, '#9ad8ff', 6); area('m_rim', (X0 + 5, 9, 6), (X0, 3, 1.5), 1200, '#38d8ff', 4)
    return {'X0': X0, 'P': P, 'amber': amber}

FA = build_factory(); BO = build_boston(); MU = build_museum()

# ================================================================ CAST
CH = {}
for n in ('dave', 'tom', 'mabel', 'gent', 'cop', 'prof', 'kid'):
    CH[n] = bk.make(n, CAST[n])
CH['mummy'] = bk.make('mummy', {**CAST['dave'], 'exprs': ['dead', 'neutral']})
OFF = (0, -60, -30)
for C in CH.values(): bk.place(C, 1, loc=OFF); bk.set_pose(C, 'idle', 1); bk.set_face(C, 'neutral', 1)
def at(C, t, loc=None, rot_z=None, rot=None): bk.place(C, F(t), loc=loc, rot_z=rot_z, rot=rot)
def pose(C, t, p): bk.set_pose(C, p, frame=F(t))
def face(C, t, f): bk.set_face(C, f, F(t))

# ---------------- DAVE in the factory
d = CH['dave']; CW = FA['catwalk']; S = FA['surface']
at(d, 0, (-3.6, CW.y, CW.z), rot_z=90)               # walking along the catwalk toward +x, side-on
pose(d, 0, 'phone'); face(d, 0, 'smile')
for k in range(0, 6):                                  # walk cycle (legs) while texting
    t = .0 + k * .33; p = dict(bk.POSES['phone']); p.update(bk.POSES['walk0' if k % 2 == 0 else 'walk1']); p['armR'] = bk.POSES['phone']['armR']; p['neck'] = bk.POSES['phone']['neck']; pose(d, t, p)
at(d, 1.95, (.15, CW.y, CW.z), rot_z=90)
pose(d, 2.0, 'phone'); face(d, 2.05, 'shock')
pose(d, 2.12, 'slip'); at(d, 2.12, (.3, CW.y + .05, CW.z + .15), rot=(-15, 0, 0))
at(d, 2.35, (.3, CW.y + .3, CW.z + .55), rot=(-50, 0, 0)); pose(d, 2.35, 'flail'); face(d, 2.35, 'panic')
at(d, 2.65, (.2, 1.0, S + .9), rot=(-110, 0, 0)); pose(d, 2.65, 'fall')
at(d, 2.9, (0, 1.8, S + .3), rot=(-165, 0, 0))            # head-first splash
at(d, 3.0, (0, 1.8, S - 2.0), rot=(0, 0, 0))               # (under) -> pops up
at(d, 3.15, (0, 1.8, S - 1.6), rot=(0, 0, 0)); pose(d, 3.15, 'float'); face(d, 3.15, 'panic')
at(d, 3.5, (0, 1.8, S - .95), rot=(8, 0, 0)); pose(d, 3.5, 'flail')
at(d, 4.4, (0, 1.8, S - 1.0), rot=(0, 0, 0)); pose(d, 4.4, 'float'); face(d, 4.6, 'confused')
face(d, 6.0, 'wonder'); at(d, 7.6, (0, 1.8, S - 1.0)); at(d, 8.5, (0, 1.8, S - .72)); face(d, 8.4, 'grin'); pose(d, 8.5, 'cheer')
pose(d, 9.4, 'float'); face(d, 9.6, 'smile'); face(d, 10.4, 'confused'); pose(d, 10.2, 'reach_up')
face(d, 11.4, 'shock')
at(d, 12.8, (0, 1.8, S - .85)); face(d, 12.9, 'strain')
bk.cycle(d, 'stroke1', 'stroke2', F(12.9), F(15.6), period=46)          # slow strokes (wet cement)
face(d, 15.8, 'angry'); bk.cycle(d, 'stroke1', 'stroke2', F(15.8), F(18.4), period=16)   # frantic strokes
at(d, 15.8, (0, 1.8, S - .85)); at(d, 18.4, (0, 2.1, S - .85))              # and moves BACKWARD
pose(d, 18.5, 'float'); face(d, 18.5, 'strain')
# L8 lie there (time lapse) — he floats still, tired
at(d, 30.0, (0, 1.8, S - .8), rot=(0, 0, 0)); pose(d, 30.0, 'float'); face(d, 30.0, 'tired'); face(d, 31.6, 'tired'); face(d, 32.4, 'sad')
pose(d, 31.0, 'slump')
at(d, 35.3, (0, 1.8, S - .8)); at(d, 35.31, OFF)

# honey globs that fly up on the splash and stick on Dave
globs = []
for i in range(14):
    g = box(f'glob{i}', (.14, .14, .12), (0, 1.8, S), m=HONEY, bevel=.05); globs.append(g)
    a = i / 14 * 6.283; r = .6 + (i % 3) * .3
    key(g, 'location', F(2.88), (math.cos(a) * .2, 1.8 + math.sin(a) * .2, S)); key(g, 'scale', F(2.85), (0, 0, 0)); key(g, 'scale', F(2.9), (1, 1, 1))
    key(g, 'location', F(3.25), (math.cos(a) * r, 1.8 + math.sin(a) * r, S + 1.0 + (i % 4) * .25)); key(g, 'location', F(3.7), (math.cos(a) * r * 1.3, 1.8 + math.sin(a) * r * 1.3, S - .05))
    key(g, 'scale', F(3.7), (1, 1, 1)); key(g, 'scale', F(4.0), (0, 0, 0))
# goo stuck on Dave's head / arms (child of his parts)
for i, (part, off) in enumerate([('neck', (.12, -.05, .62)), ('neck', (-.14, .1, .58)), ('armL', (0, 0, -.52)), ('armR', (0, -.05, -.4)), ('neck', (0, -.24, .55))]):
    g = block(f'goo{i}', (.16, .16, .1 + .05 * (i % 2)), off, '#f0a010', d[part], bevel=.05, mat=HONEY)
    key(g, 'scale', F(3.05), (0, 0, 0)); key(g, 'scale', F(3.15), (1, 1, 1))
# honey strand from the raised hand (L4 close-up): a long thin drip
strand = cyl('strand', .03, 1, (0, 0, 0), m=HONEY, verts=12); strand.parent = d['armR']; strand.location = (0, 0, -.45)
key(strand, 'scale', F(10.15), (0, 0, 0)); key(strand, 'scale', F(10.3), (1, 1, .2)); key(strand, 'scale', F(12.5), (.6, .6, 1.4)); key(strand, 'scale', F(12.7), (0, 0, 0))
strand.location = (0, 0, -.45 - .5)

# ---------------- BOSTON
X0 = BO['X0']
walkers = [('tom', (X0 - 2.0, 14.0), 0), ('mabel', (X0 + 1.2, 11.5), 0), ('gent', (X0 - .3, 9.0), 0)]
for n, (x, y), rz in walkers:
    C = CH[n]; at(C, 18.4, (x, y, 0), rot_z=rz); face(C, 18.4, 'smile' if n != 'gent' else 'smug')
    for k in range(8):
        t = 18.4 + k * .34; pose(C, t, 'walk0' if k % 2 == 0 else 'walk1'); at(C, t, (x, y - k * .3, 0))
    t = 18.4 + 8 * .34; at(C, t, (x, y - 8 * .3, 0))
    # turn around to look at the tank (bang), shock
    at(C, 21.0, (x, y - 2.4, 0), rot_z=180); pose(C, 21.0, 'shock'); face(C, 21.1, 'shock')
    # run toward camera
    at(C, 22.3, (x, y - 2.4, 0), rot_z=0); face(C, 22.3, 'panic')
    bk.cycle(C, 'run0', 'run1', F(22.3), F(25.2), period=12)
    at(C, 25.2, (x, y - 2.4 - 9, 0))
    # stuck in the molasses (chest deep)
    stuck = (x * .5 + X0 * .5 + (-1.6 if n == 'tom' else 1.4 if n == 'mabel' else 0), 3.0 + (1.2 if n == 'gent' else 0), -.45)
    at(C, 26.4, stuck, rot_z=(15 if n == 'tom' else -15 if n == 'mabel' else 0)); pose(C, 26.4, 'reach_up' if n != 'gent' else 'hands_head'); face(C, 26.4, 'panic')
    face(C, 28.0, 'sad' if n == 'gent' else 'scared'); pose(C, 28.2, 'flail' if n == 'tom' else 'reach_up')
    at(C, 30.0, stuck); at(C, 30.01, OFF)
cop = CH['cop']; at(cop, 26.4, (X0 + 4.2, -3.0, .3), rot_z=-145); pose(cop, 26.4, 'reach_fwd'); face(cop, 26.4, 'strain')
face(cop, 28.4, 'sad'); pose(cop, 28.6, 'shrug'); at(cop, 30.0, (X0 + 4.2, -3.0, .3)); at(cop, 30.01, OFF)
# the wave: bursts from the tank at 20.8, rolls down the street, then the street is flooded
wave = BO['wave']; fl = BO['flood']
key(wave, 'location', 1, (X0, 60, -10)); key(wave, 'scale', 1, (.2, .2, .2))
key(wave, 'location', F(20.75), (X0, 46, 2)); key(wave, 'scale', F(20.75), (.4, .3, 4))
key(wave, 'location', F(22.4), (X0, 30, 2.6)); key(wave, 'scale', F(22.4), (1, 1, 5.5))
key(wave, 'location', F(24.6), (X0, 8, 2.0)); key(wave, 'scale', F(24.6), (1, 1.2, 4.2))
key(wave, 'location', F(26.2), (X0, -14, .6)); key(wave, 'scale', F(26.2), (1, 1.4, 1.6))
key(fl, 'location', F(22.0), (X0, 25, -1)); key(fl, 'location', F(26.0), (X0, 25, .55))
# tank burst: the tank sinks/splits
tk = BO['tank']; key(tk, 'scale', F(20.7), (1, 1, 1)); key(tk, 'scale', F(21.2), (1.15, 1.15, .55)); key(tk, 'location', F(21.2), (X0, 52, 4.2))

# ---------------- MUSEUM
P = MU['P']; prof = CH['prof']; kid = CH['kid']; mm = CH['mummy']
at(mm, 35.3, (P.x, P.y, .98), rot_z=0); pose(mm, 35.3, 'mummy'); face(mm, 35.3, 'dead')
at(prof, 35.3, (P.x - 2.4, P.y - 2.6, 0), rot_z=-20); face(prof, 35.3, 'talk'); pose(prof, 35.3, 'present')
for k in range(6): face(prof, 35.6 + k * .45, 'talk' if k % 2 == 0 else 'smile')
pose(prof, 37.5, 'point'); face(prof, 38.5, 'smug')
at(kid, 35.3, (P.x + 3.2, P.y - 3.4, 0), rot_z=30); pose(kid, 35.3, 'idle'); face(kid, 35.3, 'neutral')
for k in range(6): pose(kid, 39.0 + k * .3, 'walk0' if k % 2 == 0 else 'walk1')
at(kid, 39.0, (P.x + 3.2, P.y - 3.4, 0)); at(kid, 40.8, (P.x + .35, P.y - 1.38, 0), rot_z=180); pose(kid, 40.8, 'press'); face(kid, 40.8, 'wonder')
face(kid, 42.9, 'lick'); pose(kid, 42.9, 'press')
face(prof, 42.6, 'shock'); at(prof, 42.6, (P.x - 1.6, P.y - 2.4, 0), rot_z=-40); face(prof, 43.6, 'disgust'); pose(prof, 43.6, 'hands_head')

for C in CH.values():
    for f in C['faces'].values(): bk.constant_keys(f)

# ================================================================ CAMERAS (one per shot, switched by markers)
SH = []
def shot(t, frm, to, lens=35, aim=None, aim2=None, roll=0):
    cam = bpy.data.objects.new(f'cam_{len(SH):02d}', bpy.data.cameras.new(f'cam_{len(SH):02d}')); sc.collection.objects.link(cam)
    cam.data.lens = lens; cam.data.clip_start = .02; cam.data.clip_end = 400
    SH.append((t, cam, frm, to, aim, aim2, lens, roll))
def finalize():
    for i, (t, cam, frm, to, aim, aim2, lens, roll) in enumerate(SH):
        t1 = SH[i + 1][0] if i + 1 < len(SH) else END
        tgt = bpy.data.objects.new(f'aim_{i:02d}', None); sc.collection.objects.link(tgt)
        key(tgt, 'location', F(t), aim); key(tgt, 'location', F(t1), aim2 or aim)
        c = cam.constraints.new('TRACK_TO'); c.target = tgt; c.track_axis = 'TRACK_NEGATIVE_Z'; c.up_axis = 'UP_Y'
        key(cam, 'location', F(t), frm); key(cam, 'location', F(t1), to)
        if isinstance(lens, tuple): key(cam.data, 'lens', F(t), lens[0]); key(cam.data, 'lens', F(t1), lens[1])
        m = sc.timeline_markers.new(f'S{i:02d}', frame=F(t)); m.camera = cam
        if i == 0: sc.camera = cam
v = mathutils.Vector
# FACTORY
shot(0.0,  (-6.5, -4.6, 1.9), (-5.6, -4.0, 2.1), 26, (-2.5, -.4, 2.2), (-.6, -.3, 2.2))              # wide: Dave texting on the catwalk
shot(1.75, (1.5, -.75, 1.55), (1.3, -.7, 1.5), 32, (.2, -.5, 1.5), (.3, -.45, 1.55))                  # low close on shoes -> the puddle
shot(2.3,  (4.6, .2, 2.4), (4.2, .6, 2.0), 28, (.4, .6, 2.0), (0, 1.6, 1.1))                          # side: he falls in
shot(3.05, (0, -.9, 1.35), (0, -.6, 1.4), 38, (0, 1.8, 1.45), (0, 1.8, 1.5))                          # pops up, honey face
shot(4.5,  (.3, -.9, 2.5), (.1, -.5, 2.2), 30, (0, 1.8, 1.45), (0, 1.8, 1.45))                           # top-down push-in
shot(6.65, (-2.6, .5, 1.45), (-2.2, .7, 1.5), 30, (0, 1.8, 1.4), (0, 1.8, 1.6))                     # honey level: he floats up
shot(9.3,  (1.4, .3, 1.8), (1.15, .55, 1.9), 30, (0, 1.8, 1.8), (0, 1.8, 2.0))                        # close: hand rising, honey strand
shot(12.75,(2.2, -.2, 2.2), (-2.0, -.4, 2.0), 30, (0, 1.8, 1.3), (0, 1.8, 1.3))                       # orbit: slow strokes
shot(15.7, (0, .1, 1.45), (0, .5, 1.4), 40, (0, 2.0, 1.55), (0, 2.1, 1.55))                           # close: frantic, sliding back
# BOSTON
shot(18.55,(X0 - 2.5, -8, 1.6), (X0 - 2.0, -6.5, 1.8), 24, (X0, 20, 4.0), (X0, 20, 5.0))                # street, 1919
shot(20.4, (X0 + 3.5, 6, 1.2), (X0 + 3.0, 6.5, 1.4), 22, (X0, 44, 6), (X0, 40, 6))                       # the tank bursts
shot(22.35,(X0 + 1.0, -4, .8), (X0 + 1.0, -6, .9), 22, (X0, 15, 2.0), (X0, 12, 2.2))                    # wave rushing at the camera, people running
shot(24.3, (X0 - 1.0, -2.5, 1.2), (X0 - 1.0, -3.5, 1.2), 26, (X0, 6, 1.6), (X0, 2, 1.8))                # wave overtakes
shot(26.55,(X0 + 6.5, -9, 6.5), (X0 + 5.5, -7.5, 5.5), 26, (X0, 3, .3), (X0, 2.5, .4))                  # stuck people + rescuer
# FACTORY again (time lapse)
shot(30.05,(0, 1.75, 5.2), (0, 1.78, 4.0), 32, (0, 1.8, 1.0), (0, 1.8, 1.0))                          # top: tired float
shot(31.6, (-4.5, 9.6, 6.8), (-4.5, 9.9, 6.8), 40, (-4.5, 11.8, 6.8), (-4.5, 11.8, 6.8))              # the clock spins (time passes)
shot(33.3, (-6.3, 6.9, 1.5), (-6.3, 7.3, 1.45), 45, (-6.3, 8.4, 1.45), (-6.3, 8.4, 1.42))            # BEST BEFORE: NEVER
# MUSEUM
shot(35.45,(MU['X0'] - 3.5, -7.5, 2.6), (MU['X0'] - 2.4, -6.0, 2.4), 24, (MU['X0'], 4, 2.2), (MU['X0'], 3.6, 1.8))   # wide: year 5026
shot(37.65,(P.x + .3, P.y - 5.0, 2.0), (P.x + .1, P.y - 3.4, 2.0), 32, (P.x, P.y, 1.9), (P.x, P.y, 1.9))                  # push in on the exhibit
shot(40.1, (P.x - .25, P.y - 2.7, 2.3), (P.x - .15, P.y - 2.3, 2.3), 45, (P.x, P.y, 2.3), (P.x, P.y, 2.32))             # the sweetest mummy
shot(42.35,(P.x + 1.75, P.y - .45, 1.2), (P.x + 1.6, P.y - .65, 1.15), 28, (P.x + .3, P.y - 1.5, 1.1), (P.x + .3, P.y - 1.5, 1.1))  # kid licks the glass
finalize()

# clock hands spin during the time lapse; factory light drops to night and back
hh, mh = FA['hands']
key(hh, 'rotation_euler', F(31.5), (0, 0, 0)); key(mh, 'rotation_euler', F(31.5), (0, 0, 0))
key(hh, 'rotation_euler', F(33.2), (0, -D(360 * 2), 0)); key(mh, 'rotation_euler', F(33.2), (0, -D(360 * 24), 0))
for fc in bk.fcurves(hh.animation_data.action) + bk.fcurves(mh.animation_data.action):
    for kp in fc.keyframe_points: kp.interpolation = 'LINEAR'

# ================================================================ RENDER SETTINGS
sc.render.engine = 'CYCLES'; sc.cycles.samples = int(os.environ.get('SAMPLES', 20)); sc.cycles.use_denoising = True
try: sc.cycles.denoiser = 'OPENIMAGEDENOISE'
except Exception: pass
sc.cycles.max_bounces = 6; sc.cycles.transmission_bounces = 6; sc.cycles.glossy_bounces = 3; sc.cycles.diffuse_bounces = 2
sc.render.use_persistent_data = True
sc.render.resolution_x, sc.render.resolution_y = 720, 1280
sc.view_settings.view_transform = 'Standard'; sc.view_settings.exposure = -.1 #; sc.view_settings.look = 'AgX - Punchy' if 'AgX - Punchy' in [l for l in bpy.types.ColorManagedViewSettings.bl_rna.properties['look'].enum_items.keys()] else 'None'
sc.render.image_settings.file_format = 'JPEG'; sc.render.image_settings.quality = 92
sc.render.use_motion_blur = False
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(HERE, 'out', 'honey.blend'))
print('SAVED', sc.frame_end, 'frames,', len(SH), 'shots')
