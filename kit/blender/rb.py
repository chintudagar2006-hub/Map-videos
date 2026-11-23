"""Rocketbox (Microsoft, MIT) realistic avatars in Blender (bpy): load, fix textures/hair, faces via shape keys, poses via Bip01 bones.
Assets are fetched into kit/blender/assets/rocketbox (sparse git clone, see fetch_assets.sh)."""
import bpy, os, math, mathutils
HERE = os.path.dirname(os.path.abspath(__file__))
RB = os.environ.get('RB_ASSETS', os.path.join(HERE, 'assets', 'rocketbox', 'Assets'))

def _fix_materials(objs, texdir):
    for o in objs:
        if o.type != 'MESH': continue
        for slot in o.material_slots:
            m = slot.material
            if not m or m.get('_fixed'): continue
            m['_fixed'] = 1; nt = m.node_tree
            bsdf = [n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED'][0]
            imgs = [n for n in nt.nodes if n.type == 'TEX_IMAGE']
            for n in imgs:
                b = os.path.basename(n.image.filepath.replace('\\', '/'))
                p = os.path.join(texdir, b)
                if os.path.exists(p): n.image.filepath = p; n.image.reload()
            for l in list(nt.links):
                if l.to_node == bsdf and l.to_socket.name not in ('Base Color', 'Normal'): nt.links.remove(l)
            col = next((n for n in imgs if n.image.filepath.endswith('_color.tga')), None)
            nrm = next((n for n in imgs if n.image.filepath.endswith('_normal.tga')), None)
            if col: nt.links.new(col.outputs['Color'], bsdf.inputs['Base Color'])
            if 'opacity' in m.name and col:
                nt.links.new(col.outputs['Alpha'], bsdf.inputs['Alpha'])
                try: m.surface_render_method = 'DITHERED'
                except Exception: pass
            if nrm and not any(l.to_socket.name == 'Normal' for l in nt.links if l.to_node == bsdf):
                nm = nt.nodes.new('ShaderNodeNormalMap'); nrm.image.colorspace_settings.name = 'Non-Color'
                nt.links.new(nrm.outputs['Color'], nm.inputs['Color']); nt.links.new(nm.outputs['Normal'], bsdf.inputs['Normal'])
            bsdf.inputs['Roughness'].default_value = .62 if 'head' in m.name else .8
            if 'head' in m.name:
                try:
                    bsdf.inputs['Subsurface Weight'].default_value = .12; bsdf.inputs['Subsurface Radius'].default_value = (1, .35, .2); bsdf.inputs['Subsurface Scale'].default_value = .01
                except Exception: pass

def load(kind_name, name=None, facial=True, at=(0, 0, 0), rot_z=0):
    """kind_name: e.g. 'Adults/Male_Adult_06'. Returns dict(arm, mesh, name)."""
    base = os.path.join(RB, 'Avatars', kind_name); nm = os.path.basename(kind_name)
    fbx = os.path.join(base, 'Export', nm + ('_facial' if facial else '') + '.fbx')
    if not os.path.exists(fbx): fbx = os.path.join(base, 'Export', nm + '.fbx')
    before = set(bpy.data.objects)
    bpy.ops.import_scene.fbx(filepath=fbx, automatic_bone_orientation=False, ignore_leaf_bones=False)
    new = [o for o in bpy.data.objects if o not in before]
    _fix_materials(new, os.path.join(base, 'Textures'))
    arm = next(o for o in new if o.type == 'ARMATURE'); mesh = next(o for o in new if o.type == 'MESH')
    arm.name = name or nm; mesh.name = (name or nm) + '_body'
    # the FBX action keys the armature object itself (Bip01 height + Y-up fix); keep it and move the person with a parent empty
    root = bpy.data.objects.new((name or nm) + '_root', None); bpy.context.scene.collection.objects.link(root)
    arm.parent = root; root.location = at; root.rotation_euler = (0, 0, rot_z)
    act = arm.animation_data.action if arm.animation_data else None
    return {'arm': arm, 'mesh': mesh, 'root': root, 'name': name or nm, 'objs': new, 'rest_action': act}

# expressions as ARKit-style shape key weights (AK_xx names in the facial rigs)
FACES = {
    'neutral': {},
    'smile': {'AK_44_MouthSmileLeft': .7, 'AK_45_MouthSmileRight': .7, 'AK_07_CheekSquintLeft': .3, 'AK_08_CheekSquintRight': .3},
    'grin': {'AK_44_MouthSmileLeft': 1, 'AK_45_MouthSmileRight': 1, 'AK_25_JawOpen': .25, 'AK_07_CheekSquintLeft': .5, 'AK_08_CheekSquintRight': .5, 'AK_04_BrowOuterUpLeft': .3, 'AK_05_BrowOuterUpRight': .3},
    'shock': {'AK_25_JawOpen': .75, 'AK_21_EyeWideLeft': 1, 'AK_22_EyeWideRight': 1, 'AK_03_BrowInnerUp': 1, 'AK_04_BrowOuterUpLeft': .9, 'AK_05_BrowOuterUpRight': .9, 'AK_32_MouthFunnel': .3},
    'scared': {'AK_25_JawOpen': .35, 'AK_21_EyeWideLeft': .9, 'AK_22_EyeWideRight': .9, 'AK_03_BrowInnerUp': 1, 'AK_46_MouthStretchLeft': .7, 'AK_47_MouthStretchRight': .7, 'AK_30_MouthFrownLeft': .4, 'AK_31_MouthFrownRight': .4},
    'strain': {'AK_19_EyeSquintLeft': 1, 'AK_20_EyeSquintRight': 1, 'AK_01_BrowDownLeft': 1, 'AK_02_BrowDownRight': 1, 'AK_46_MouthStretchLeft': .8, 'AK_47_MouthStretchRight': .8, 'AK_48_MouthUpperUpLeft': .6, 'AK_49_MouthUpperUpRight': .6, 'AK_50_NoseSneerLeft': .6, 'AK_51_NoseSneerRight': .6, 'AK_25_JawOpen': .12},
    'panic': {'AK_25_JawOpen': .55, 'AK_03_BrowInnerUp': 1, 'AK_21_EyeWideLeft': .7, 'AK_22_EyeWideRight': .7, 'AK_46_MouthStretchLeft': 1, 'AK_47_MouthStretchRight': 1, 'AK_30_MouthFrownLeft': .6, 'AK_31_MouthFrownRight': .6},
    'tired': {'AK_09_EyeBlinkLeft': .55, 'AK_10_EyeBlinkRight': .55, 'AK_03_BrowInnerUp': .5, 'AK_30_MouthFrownLeft': .5, 'AK_31_MouthFrownRight': .5, 'AK_25_JawOpen': .08},
    'sad': {'AK_03_BrowInnerUp': 1, 'AK_30_MouthFrownLeft': .8, 'AK_31_MouthFrownRight': .8, 'AK_11_EyeLookDownLeft': .4, 'AK_12_EyeLookDownRight': .4, 'AK_42_MouthShrugLower': .5},
    'dead': {'AK_09_EyeBlinkLeft': 1, 'AK_10_EyeBlinkRight': 1, 'AK_25_JawOpen': .2, 'AK_30_MouthFrownLeft': .2, 'AK_31_MouthFrownRight': .2},
    'wonder': {'AK_25_JawOpen': .3, 'AK_21_EyeWideLeft': .6, 'AK_22_EyeWideRight': .6, 'AK_04_BrowOuterUpLeft': .7, 'AK_05_BrowOuterUpRight': .7, 'AK_44_MouthSmileLeft': .35, 'AK_45_MouthSmileRight': .35},
    'disgust': {'AK_50_NoseSneerLeft': 1, 'AK_51_NoseSneerRight': 1, 'AK_48_MouthUpperUpLeft': .8, 'AK_49_MouthUpperUpRight': .5, 'AK_01_BrowDownLeft': .7, 'AK_02_BrowDownRight': .7, 'AK_19_EyeSquintLeft': .5},
    'smug': {'AK_44_MouthSmileLeft': .8, 'AK_45_MouthSmileRight': .15, 'AK_04_BrowOuterUpLeft': .6, 'AK_19_EyeSquintLeft': .3, 'AK_20_EyeSquintRight': .3},
    'lick': {'AK_25_JawOpen': .35, 'AK_52_TongueOut': 1, 'AK_19_EyeSquintLeft': .4, 'AK_20_EyeSquintRight': .4, 'AK_44_MouthSmileLeft': .3, 'AK_45_MouthSmileRight': .3},
}

def face(av, f, frame=None, k=1.0):
    kb = av['mesh'].data.shape_keys.key_blocks if av['mesh'].data.shape_keys else None
    if not kb: return
    W = FACES[f] if isinstance(f, str) else f
    for b in kb:
        if not (b.name.startswith('AK_')): continue
        b.value = W.get(b.name, 0) * k
        if frame is not None: b.keyframe_insert('value', frame=frame)

def shape(av, name, v, frame):
    b = av['mesh'].data.shape_keys.key_blocks[name]; b.value = v; b.keyframe_insert('value', frame=frame)

# ---------------- poses ----------------
# A pose is a list of (bone, axis, degrees) steps applied in order to the rest (A-pose), about axes of the CHARACTER frame:
# the character faces -Y (toward a camera at -Y), +Z up, +X = the character's LEFT side. 'L'/'R' in the bone name: write the
# step for the left side with side='LR' to mirror it (axis Y and Z flip sign for the right side).
B = {'pelvis': 'Bip01 Pelvis', 'spine': 'Bip01 Spine', 'spine1': 'Bip01 Spine1', 'spine2': 'Bip01 Spine2', 'neck': 'Bip01 Neck', 'head': 'Bip01 Head',
     'clav': 'Bip01 {} Clavicle', 'upper': 'Bip01 {} UpperArm', 'fore': 'Bip01 {} Forearm', 'hand': 'Bip01 {} Hand', 'thigh': 'Bip01 {} Thigh', 'calf': 'Bip01 {} Calf', 'foot': 'Bip01 {} Foot'}
AX = {'x': (1, 0, 0), 'y': (0, 1, 0), 'z': (0, 0, 1)}

def _steps(pose):
    out = []
    for st in pose:
        bone, ax, deg = st[0], st[1], st[2]; side = st[3] if len(st) > 3 else None
        if '{}' in B.get(bone, bone):
            sides = ['L', 'R'] if side in (None, 'LR') else [side]
            for s in sides:
                a = list(AX[ax]); d = deg
                if s == 'R' and side in (None, 'LR'):
                    # mirror across the YZ plane: rotations about x keep sign, about y and z flip
                    if ax in ('y', 'z'): d = -deg
                out.append((B[bone].format(s), a, d))
        else: out.append((B.get(bone, bone), list(AX[ax]), deg))
    return out

def pose_quats(av, pose):
    """Apply a pose (from rest) and return {bone: (quat, loc)} in pose-bone local space."""
    import bpy
    arm = av['arm']; sc = bpy.context.scene
    root = av['root']; keep = (root.location.copy(), root.rotation_euler.copy())
    root.location = (0, 0, 0); root.rotation_euler = (0, 0, 0)
    for pb in arm.pose.bones: pb.rotation_mode = 'QUATERNION'; pb.rotation_quaternion = (1, 0, 0, 0); pb.location = (0, 0, 0)
    bpy.context.view_layer.update()
    W = arm.matrix_world
    for bone, ax, deg in _steps(pose):
        pb = arm.pose.bones.get(bone)
        if not pb: continue
        axis_arm = (W.to_3x3().inverted() @ mathutils.Vector(ax)).normalized()
        R = mathutils.Matrix.Rotation(math.radians(deg), 4, axis_arm)
        head = pb.matrix.translation.copy()
        M = pb.matrix.copy(); M.translation = (0, 0, 0); M = R @ M; M.translation = head
        pb.matrix = M
        bpy.context.view_layer.update()
    out = {pb.name: (pb.rotation_quaternion.copy(), pb.location.copy()) for pb in arm.pose.bones}
    root.location, root.rotation_euler = keep
    return out

def load_action(path, name):
    import bpy
    before = set(bpy.data.objects); acts = set(bpy.data.actions)
    bpy.ops.import_scene.fbx(filepath=path, automatic_bone_orientation=False, ignore_leaf_bones=False)
    new = [o for o in bpy.data.objects if o not in before]
    arm = next(o for o in new if o.type == 'ARMATURE'); act = arm.animation_data.action; act.name = name; act.use_fake_user = True
    for o in new: bpy.data.objects.remove(o, do_unlink=True)
    return act

def clip_quats(av, act, frame):
    """Sample a clip action at a (float) frame: {bone: (quat, loc)}."""
    import bpy
    arm = av['arm']; old = arm.animation_data.action
    arm.animation_data.action = act
    try: arm.animation_data.action_slot = act.slots[0]
    except Exception: pass
    bpy.context.scene.frame_set(int(frame), subframe=frame - int(frame))
    out = {pb.name: (pb.rotation_quaternion.copy(), pb.location.copy()) for pb in arm.pose.bones}
    arm.animation_data.action = old
    try: arm.animation_data.action_slot = old.slots[0]
    except Exception: pass
    return out

def clip_len(act):
    return act.frame_range[1] - act.frame_range[0], act.frame_range[0]
