"""
Purrsuit: portfolio renders of Jinx, the game's Blender-modelled hero.
usage: Blender -b "<Pigeon Panic>/art/characters/jinx/Jinx.blend" -P render_jinx.py -- <out dir> [jobs] [--samples N]
jobs (comma separated, default all): hero, turnaround, looks, faces, wire, turntable
Opens the game's own .blend and never saves it: the poses, lights and cameras are made in memory. Every render is a
transparent PNG with the floor as a shadow catcher, so the backgrounds are added afterwards (compose_jinx.py).
Cycles on the GPU, denoised, Standard view transform so the painted textures keep their colours.
"""
import bpy, math, os, sys
from mathutils import Matrix, Vector

argv = sys.argv[sys.argv.index("--") + 1:]
OUT = argv[0]
JOBS = (argv[1] if len(argv) > 1 and not argv[1].startswith("--") else "hero,turnaround,looks,faces,wire,turntable").split(",")
SAMPLES = int(argv[argv.index("--samples") + 1]) if "--samples" in argv else 128
os.makedirs(OUT, exist_ok=True)

scn = bpy.context.scene
GAME = os.path.abspath(bpy.path.abspath("//../../../Assets/Resources/Characters/Jinx"))
LOOKS = list(scn["pp_outfits"])
KEYS = ["".join(w[:1].upper() + w[1:] for w in n.split()) for n in LOOKS]
rig = bpy.data.objects["Jinx_Rig"]
body = bpy.data.objects["Jinx"]
faces = {o["pp_part"]: o for o in bpy.data.objects if o.type == "MESH" and o.get("pp_part", "").startswith("face")}

# ---------- render settings ----------
scn.render.engine = "CYCLES"
prefs = bpy.context.preferences.addons["cycles"].preferences
for kind in ("METAL", "OPTIX", "CUDA"):
    try:
        prefs.compute_device_type = kind
        break
    except TypeError:
        continue
try:
    prefs.refresh_devices()
except AttributeError:
    prefs.get_devices()
for d in prefs.devices:
    d.use = True
scn.cycles.device = "GPU"
scn.cycles.samples = SAMPLES
scn.cycles.use_adaptive_sampling = True
scn.cycles.adaptive_threshold = 0.015
scn.cycles.use_denoising = True
scn.render.film_transparent = True
scn.view_settings.view_transform = "Standard"
scn.view_settings.look = "None"
scn.render.image_settings.file_format = "PNG"
scn.render.image_settings.color_mode = "RGBA"
scn.render.resolution_percentage = 100
scn.render.use_persistent_data = True   # the turntable only moves its camera rig: no re-sync per frame

# ---------- world and lights: a cool sky fill, a warm key, two coloured rims ----------
world = scn.world or bpy.data.worlds.new("World")
scn.world = world
world.use_nodes = True
bg = world.node_tree.nodes.get("Background")
bg.inputs["Color"].default_value = (0.55, 0.62, 0.82, 1.0)
bg.inputs["Strength"].default_value = 0.55

def look_at(ob, target):
    ob.rotation_euler = (Vector(target) - ob.location).to_track_quat("-Z", "Y").to_euler()

def light(name, energy, color, loc, size):
    ld = bpy.data.lights.new(name, "AREA")
    ld.energy, ld.color, ld.size = energy, color, size
    lo = bpy.data.objects.new(name, ld)
    lo.location = loc
    scn.collection.objects.link(lo)
    look_at(lo, (0, 0, 0.9))
    return lo

LIGHTS = [
    light("Key", 300.0, (1.0, 0.94, 0.86), (-1.8, -2.6, 2.8), 1.8),
    light("Fill", 90.0, (0.82, 0.9, 1.0), (2.4, -2.0, 1.3), 2.4),
    light("Rim", 380.0, (0.45, 0.85, 1.0), (1.3, 2.5, 2.3), 1.0),
    light("Rim2", 260.0, (1.0, 0.75, 0.45), (-1.7, 2.1, 1.7), 1.0),
]

floor_me = bpy.data.meshes.new("_floor")
floor_me.from_pydata([(-6, -6, 0), (6, -6, 0), (6, 6, 0), (-6, 6, 0)], [], [(0, 1, 2, 3)])
floor = bpy.data.objects.new("_floor", floor_me)
scn.collection.objects.link(floor)
floor.is_shadow_catcher = True

cam_d = bpy.data.cameras.new("_cam")
cam = bpy.data.objects.new("_cam", cam_d)
scn.collection.objects.link(cam)
scn.camera = cam

def shoot(path, yaw, target, dist, lens, w, h, height=None):
    scn.render.resolution_x, scn.render.resolution_y = w, h
    cam_d.lens = lens
    a = math.radians(yaw)
    t = Vector(target)
    cam.location = Vector((math.sin(a) * dist, -math.cos(a) * dist, height if height is not None else t.z + 0.1))
    look_at(cam, t)
    scn.render.filepath = path
    bpy.ops.render.render(write_still=True)
    print("wrote", path)

# ---------- looks: the body's base colour, gloss and glow per outfit, the face's vertex colours ----------
mat = body.data.materials[0]
nt = mat.node_tree
bsdf = next(n for n in nt.nodes if n.type == "BSDF_PRINCIPLED")
tex_base = next(n for n in nt.nodes if n.type == "TEX_IMAGE" and n.image and "Albedo" in n.image.name)
tex_gloss = next(n for n in nt.nodes if n.type == "TEX_IMAGE" and n.image and "MetallicSmoothness" in n.image.name)
shared_gloss = tex_gloss.image
em_node = nt.nodes.new("ShaderNodeTexImage")
nt.links.new(em_node.outputs["Color"], bsdf.inputs["Emission Color"])

def image(path, non_color=False):
    if not os.path.exists(path):
        return None
    im = bpy.data.images.load(path, check_existing=True)
    im.colorspace_settings.name = "Non-Color" if non_color else "sRGB"
    return im

def wear(k):
    key = KEYS[k]
    tex_base.image = image(os.path.join(GAME, "Jinx_Body_%s_AlbedoTransparency.png" % key)) or tex_base.image
    tex_gloss.image = image(os.path.join(GAME, "Jinx_Body_%s_MetallicSmoothness.png" % key), True) or shared_gloss
    em = image(os.path.join(GAME, "Baked", "Jinx_Body_%s_Emission.png" % key))
    em_node.image = em
    bsdf.inputs["Emission Strength"].default_value = 1.6 if em else 0.0
    for f in faces.values():
        f.data.color_attributes.active_color = f.data.color_attributes["col_%d" % k]
        for fm in f.data.materials:
            for n in fm.node_tree.nodes:
                if n.type in ("VERTEX_COLOR", "ATTRIBUTE"):
                    if hasattr(n, "layer_name"):
                        n.layer_name = "col_%d" % k
                    else:
                        n.attribute_name = "col_%d" % k

def expression(name):
    for part, f in faces.items():
        f.hide_render = part != name

# ---------- poses: the bind pose (A-pose, for the sheets) or a relaxed stand ----------
def rotate_bone(name, axis, deg):
    """Rotates a pose bone about an armature-space axis through its head."""
    pb = rig.pose.bones[name]
    bpy.context.view_layer.update()
    m = pb.matrix.copy()
    head = m.translation.copy()
    r = Matrix.Rotation(math.radians(deg), 4, axis)
    pb.matrix = Matrix.Translation(head) @ r @ Matrix.Translation(-head) @ m
    bpy.context.view_layer.update()

def pose(kind):
    for pb in rig.pose.bones:
        pb.matrix_basis = Matrix.Identity(4)
    bpy.context.view_layer.update()
    if kind == "relaxed":
        rotate_bone("upperarm.L", "Y", 24)
        rotate_bone("upperarm.R", "Y", -24)
        rotate_bone("forearm.L", "X", -14)
        rotate_bone("forearm.R", "X", -14)
        rotate_bone("forearm.L", "Y", 6)
        rotate_bone("forearm.R", "Y", -6)
        rotate_bone("head", "Y", -4)
        rotate_bone("head", "X", 3)
        rotate_bone("tail.1", "X", -10)
        rotate_bone("tail.2", "Z", 14)
        rotate_bone("tail.3", "Z", 18)
        rotate_bone("thigh.R", "Y", -3)
        rotate_bone("thigh.L", "Y", 3)

def spin(deg):
    rig.rotation_euler = (0, 0, math.radians(deg))
    bpy.context.view_layer.update()

MID = (0, 0, 0.82)

# ---------- jobs ----------
if "hero" in JOBS:
    pose("relaxed"); wear(0); expression("face"); spin(0)
    shoot(os.path.join(OUT, "hero.png"), 28, (0, 0, 0.8), 5.0, 70, 1600, 2400, 1.05)

if "turnaround" in JOBS:
    pose("bind"); wear(0); expression("face"); spin(0)
    for name, yaw in (("front", 0), ("three_quarter", 38), ("side", 90), ("back", 180)):
        shoot(os.path.join(OUT, "turn_%s.png" % name), yaw, MID, 4.8, 60, 1000, 1500)

if "looks" in JOBS:
    pose("relaxed"); expression("face"); spin(0)
    for k in range(len(LOOKS)):
        wear(k)
        shoot(os.path.join(OUT, "look_%d.png" % k), 20, MID, 4.8, 60, 900, 1400)
        shoot(os.path.join(OUT, "look_%d_back.png" % k), 200, MID, 4.8, 60, 900, 1400)
    wear(0)

if "faces" in JOBS:
    pose("bind"); wear(0); spin(0)
    for part in ("face", "face_blink", "face_happy", "face_shock"):
        expression(part)
        shoot(os.path.join(OUT, "%s.png" % part), 16, (0, 0, 1.31), 1.75, 70, 1100, 1100)
    expression("face")

if "wire" in JOBS:
    pose("bind"); wear(0); expression("face"); spin(0)
    shoot(os.path.join(OUT, "wire_textured.png"), 30, MID, 4.8, 60, 1200, 1600)
    clay = bpy.data.materials.new("_clay")
    clay.use_nodes = True
    p = clay.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (0.34, 0.35, 0.41, 1)   # mid grey, so the wires read against it
    p.inputs["Roughness"].default_value = 0.55
    ink = bpy.data.materials.new("_ink")
    ink.use_nodes = True
    q = ink.node_tree.nodes["Principled BSDF"]
    q.inputs["Base Color"].default_value = (0.03, 0.035, 0.06, 1)
    q.inputs["Roughness"].default_value = 0.8
    shown = [body, faces["face"]]
    saved = {o.name: [s.material for s in o.material_slots] for o in shown}
    wires = []
    for o in shown:
        for s in o.material_slots:
            s.material = clay
        w = o.copy()
        w.data = o.data.copy()
        w.data.materials.clear()
        w.data.materials.append(ink)
        scn.collection.objects.link(w)
        m = w.modifiers.new("Wire", "WIREFRAME")
        m.thickness = 0.0018
        m.offset = 1.0
        m.use_even_offset = True
        m.use_replace = True
        wires.append(w)
    shoot(os.path.join(OUT, "wire_clay.png"), 30, MID, 4.8, 60, 1200, 1600)
    for w in wires:
        bpy.data.objects.remove(w, do_unlink=True)
    for o in shown:
        for s, m in zip(o.material_slots, saved[o.name]):
            s.material = m

if "turntable" in JOBS:
    # the camera and the lights orbit together, so the light stays put relative to the picture as the cat turns
    pose("relaxed"); wear(0); expression("face"); spin(0)
    frames = int(os.environ.get("TURN_FRAMES", "120"))
    pivot = bpy.data.objects.new("_pivot", None)
    scn.collection.objects.link(pivot)
    scn.render.resolution_x, scn.render.resolution_y = 1080, 1350
    cam_d.lens = 62
    cam.location = Vector((0, -4.9, 1.12))
    look_at(cam, MID)
    for o in [cam] + LIGHTS:
        o.parent = pivot
    os.makedirs(os.path.join(OUT, "turn"), exist_ok=True)
    for i in range(frames):
        pivot.rotation_euler = (0, 0, math.radians(-360.0 * i / frames))
        scn.render.filepath = os.path.join(OUT, "turn", "%04d.png" % i)
        bpy.ops.render.render(write_still=True)
        print("wrote", scn.render.filepath)
