"""Dasha for Petzone's case study, rendered in Blender from the Petzone repo's own build (scripts/empty-art).

    Blender -b --factory-startup --python render_dasha.py -- OUT [turnaround faces poses rig turntable]

PETZONE_REPO points at a Petzone checkout on main (default ~/Documents/Petzone). Her build is the app's: the
cached dasha.blend that `npm run empty-art` makes, rebuilt here when it is stale. Writes into OUT:

  turn_{front,quarter,side,back}.png   sitting, one camera distance for all four, 1024 x 1024
  face_{smile,w,sleepy}.png             her head: the open smile (1600), the drawings' small 'w', eyes shut
  pose_{peek,bat}.png                   the two library poses look-dev shows small, at 1024
  rig_{color,clay,ghost}.png            one camera, 1400 x 1400: textured; clay with no fur; a pale ghost of her
  rig.json                              the Rigify controls and the deform bones projected into that camera,
                                        as 2D polylines by bone collection, for compose.py to draw over clay
                                        and ghost "in front", as Blender's viewport draws them
  turntable/####.png                    a full turn, 96 frames, 1200 x 800 (about 25 minutes on an M4)
  duo.png                               the puppy sitting beside her, 2400 x 1600 (needs the repo's puppy.blend)
"""

import json
import math
import os
import sys

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Matrix, Vector

REPO = os.environ.get("PETZONE_REPO", os.path.expanduser("~/Documents/Petzone"))
sys.path.insert(0, os.path.join(REPO, "scripts", "empty-art"))
sys.dont_write_bytecode = True
import dasha  # noqa: E402
import studio  # noqa: E402

ARGS = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = os.path.abspath(ARGS[0] if ARGS else "dasha-renders")
ONLY = set(ARGS[1:])
SPP = int(os.environ.get("DASHA_SPP", "128"))
os.makedirs(OUT, exist_ok=True)


def wanted(name):
    return not ONLY or name in ONLY


dasha.load(dasha.CACHE)
scene, cam = studio.setup(samples=SPP, res=(1024, 1024))
P = dasha.Poser()
RIG = P.rig


def eyes_mid():
    return (P.head("eye.L") + P.head("eye.R")) * 0.5


def size(w, h=None):
    scene.render.resolution_x = w
    scene.render.resolution_y = h or w


def shoot(name, az, el, margin=1.12, parts=None, extra=(), look=True, fade=True, ellipse=None):
    P.frame(cam, az, el, margin=margin, parts=parts, extra=extra)
    if look:
        P.look_at(cam.location)
    studio.eye_lights(cam, eyes_mid())
    out = studio.render(os.path.join(OUT, name + ".png"), fade=fade, ellipse=ellipse)
    print("RENDERED", name, flush=True)
    return out


def orbit(az, el, centre, dist):
    """The camera az degrees round from her front (+ her left), el up, looking at centre."""
    a, e = math.radians(az), math.radians(el)
    d = Vector((math.sin(a) * math.cos(e), -math.cos(a) * math.cos(e), math.sin(e)))
    cam.location = centre + d * dist
    cam.rotation_euler = (-d).to_track_quat("-Z", "Y").to_euler()
    bpy.context.view_layer.update()


# --- the turnaround: sitting, one framing for every view --------------------------------------
if wanted("turnaround"):
    size(1024)
    P.pose("sit")
    P.frame(cam, 0, 10, margin=1.3)
    centre = Vector(P.points(25).mean(0))
    dist = (cam.location - centre).length
    for view, az in (("front", 0), ("quarter", 38), ("side", 90), ("back", 180)):
        orbit(az, 10, centre, dist)
        if view in ("front", "quarter"):
            P.look_at(cam.location)
        studio.eye_lights(cam, eyes_mid())
        studio.render(os.path.join(OUT, "turn_%s.png" % view))
        print("RENDERED turn", view, flush=True)

# --- faces ---------------------------------------------------------------------------------------
if wanted("faces"):
    # The smile fills two thirds of its board, so it renders at that size; the other two take a corner each.
    for name, face, px in (("smile", dict(mouth=1.0), 1600), ("w", dict(mouth=0.0), 1024), ("sleepy", dict(mouth=0.0, blink=1.0), 1024)):
        size(px)
        P.pose("sit")
        P.face(**face)
        shoot("face_" + name, 22, 8, margin=1.22, parts=["head", "ear.L", "ear.R"], look=name != "sleepy", fade=False)

# --- the pose library, large -------------------------------------------------------------------
def done(name):
    return os.path.exists(os.path.join(OUT, name + ".png"))


if wanted("poses"):
    size(1024)
    if not done("pose_sit"):
        P.pose("sit")
        shoot("pose_sit", 32, 14, margin=1.14)
    if not done("pose_wave"):
        P.pose("wave")
        shoot("pose_wave", 30, 12, margin=1.12)
    if not done("pose_stand"):
        P.pose("stand")
        card = P.hold(dasha.prop("card"))
        shoot("pose_stand", 26, 10, margin=1.12, extra=[card])
        P.detach(card)
        dasha.hide_prop("card")
    if not done("pose_sleep"):
        P.pose("sleep")
        shoot("pose_sleep", 14, 30, margin=1.14, look=False)
    if not done("pose_peek"):
        carton = dasha.prop("carton")
        P.pose("peek", edge_y=carton["edge"][0], edge_z=carton["edge"][1])
        shoot("pose_peek", 20, 12, margin=1.1, extra=[carton])
        dasha.hide_prop("carton")
    if not done("pose_bat"):
        P.pose("bat", side="L")
        yarn = bpy.data.objects["Yarn"]
        shoot("pose_bat", 40, 14, margin=1.1, extra=[yarn], look=False)
        dasha.hide_prop("yarn")

# --- the rig: textured, clay with the controls, a ghost with the deform bones -------------------
COLORS = {  # Rigify's own colour sets, by what a control does
    "IK": "#ff5a4f", "FK": "#54c76b", "Tweak": "#3aa4ff", "Spine": "#ffc93a", "Root": "#c58cff",
    "Paws": "#ff9a3a", "Tail": "#ffc93a", "Face": "#ff9a3a", "DEF": "#f49722",
}


def collection_key(bone):
    names = " ".join(c.name for c in bone.collections)
    for key in ("Tweak", "IK", "FK", "Root", "Paws", "Tail", "Spine"):
        if key in names:
            return key
    return "Face"


def shape_matrix(pb):
    """Where Blender draws a control's custom shape: the bone (or its custom_shape_transform), then the
    shape's own translation, rotation and scale, scaled by the bone's length."""
    src = pb.custom_shape_transform or pb
    M = RIG.matrix_world @ src.matrix
    length = pb.bone.length if pb.use_custom_shape_bone_size else 1.0
    T = Matrix.Translation(pb.custom_shape_translation)
    R = pb.custom_shape_rotation_euler.to_matrix().to_4x4()
    s = pb.custom_shape_scale_xyz * length
    S = Matrix.Diagonal((s[0], s[1], s[2], 1.0))
    return M @ T @ R @ S


def project(p):
    v = world_to_camera_view(scene, cam, p)
    return [round(v.x * scene.render.resolution_x, 2), round((1 - v.y) * scene.render.resolution_y, 2), round(v.z, 4)]


def controls():
    lines = []
    for pb in RIG.pose.bones:
        b = pb.bone
        if not pb.custom_shape or b.hide or not any(c.is_visible for c in b.collections):
            continue
        me = pb.custom_shape.data
        M = shape_matrix(pb)
        pts = [M @ v.co for v in me.vertices]
        segs = [[project(pts[e.vertices[0]]), project(pts[e.vertices[1]])] for e in me.edges]
        lines.append({"bone": pb.name, "kind": collection_key(b), "segs": segs})
    return lines


def deform_bones():
    """The deform skeleton as Blender's octahedral bones: head, a waist a tenth of the way along, tail."""
    out = []
    for pb in RIG.pose.bones:
        if not pb.name.startswith("DEF-"):
            continue
        h = RIG.matrix_world @ pb.head
        t = RIG.matrix_world @ pb.tail
        axis = t - h
        n = axis.length
        if n < 1e-6:
            continue
        M = (RIG.matrix_world @ pb.matrix).to_3x3()
        x, z = M.col[0].normalized() * n * 0.1, M.col[2].normalized() * n * 0.1
        w = h + axis * 0.1
        ring = [w + x, w + z, w - x, w - z]
        segs = []
        for q in ring:
            segs += [[project(h), project(q)], [project(q), project(t)]]
        for i in range(4):
            segs.append([project(ring[i]), project(ring[(i + 1) % 4])])
        out.append({"bone": pb.name, "kind": "DEF", "segs": segs})
    return out


def set_fur(show):
    for ob in bpy.data.objects:
        if ob.type == "CURVES":
            ob.hide_render = not show


def clay(alpha=1.0):
    mat = bpy.data.materials.new("Clay%.2f" % alpha)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs["Base Color"].default_value = (0.62, 0.6, 0.58, 1) if alpha >= 1 else (0.92, 0.9, 0.88, 1)
    bsdf.inputs["Roughness"].default_value = 0.55
    bsdf.inputs["Alpha"].default_value = alpha
    return mat


def swap_materials(mat):
    saved = {}
    for ob in bpy.data.objects:
        if ob.type == "MESH" and not ob.name.startswith("WGT-") and not ob.hide_render:
            saved[ob.name] = [s.material for s in ob.material_slots]
            for s in ob.material_slots:
                s.material = mat
    return saved


def restore_materials(saved):
    for name, mats in saved.items():
        for s, m in zip(bpy.data.objects[name].material_slots, mats):
            s.material = m


if wanted("rig"):
    size(1400)
    P.pose("sit")
    ellipse = shoot("rig_color", 30, 20, margin=1.16)
    set_fur(False)
    saved = swap_materials(clay())
    studio.render(os.path.join(OUT, "rig_clay.png"), ellipse=ellipse)
    restore_materials(saved)
    saved = swap_materials(clay(0.28))
    studio.render(os.path.join(OUT, "rig_ghost.png"), ellipse=ellipse)
    restore_materials(saved)
    set_fur(True)
    with open(os.path.join(OUT, "rig.json"), "w") as fh:
        json.dump({"width": scene.render.resolution_x, "height": scene.render.resolution_y, "colors": COLORS,
                   "controls": controls(), "deform": deform_bones()}, fh)
    print("RENDERED rig", flush=True)

# --- materials: her coat's maps, and the props' Substance materials on balls --------------------------
MATERIALS = ("linen", "kraft", "cardboard", "wood", "glaze", "yarn", "plastic", "brass")


# Each material's own colourway, of the several the scenes recolour it to (a teal gift wrap is still kraft paper).
CANON = {"linen": "#1E9C99", "kraft": "#b8895a", "plastic": "#FD951C"}


def latest_maps(name):
    """The props' map sets that `npm run empty-art` renders with sbsrender, cached by their parameters in the
    temp dir: the material's own colourway when one is named (CANON), else the newest set."""
    import glob
    import tempfile
    sets = glob.glob(os.path.join(tempfile.gettempdir(), "petzone-empty-art", "maps", name + "-*"))
    sets = [s for s in sets if os.path.exists(os.path.join(s, name + "_basecolor.png"))]
    if name in CANON:
        for s in sets:
            try:
                with open(os.path.join(s, "maps.json")) as fh:
                    values = json.load(fh).get("values", {})
            except (OSError, ValueError):
                continue
            if CANON[name].lower() in (str(v).lower() for v in values.values()):
                return s
    return max(sets, key=os.path.getmtime) if sets else None


def ball_material(name, folder):
    mat = bpy.data.materials.new("Ball_" + name)
    mat.use_nodes = True
    nt = mat.node_tree
    bsdf = nt.nodes["Principled BSDF"]
    coords = nt.nodes.new("ShaderNodeTexCoord")
    mapping = nt.nodes.new("ShaderNodeMapping")
    mapping.inputs["Scale"].default_value = (4.0, 2.0, 1.0)  # a UV sphere's map is twice as wide as tall
    nt.links.new(coords.outputs["UV"], mapping.inputs["Vector"])

    def tex(kind, non_color):
        path = os.path.join(folder, "%s_%s.png" % (name, kind))
        if not os.path.exists(path):
            return None
        t = nt.nodes.new("ShaderNodeTexImage")
        t.image = bpy.data.images.load(path)
        if non_color:
            t.image.colorspace_settings.name = "Non-Color"
        nt.links.new(mapping.outputs["Vector"], t.inputs["Vector"])
        return t

    base = tex("basecolor", False)
    if base:
        nt.links.new(base.outputs["Color"], bsdf.inputs["Base Color"])
    rough = tex("roughness", True)
    if rough:
        nt.links.new(rough.outputs["Color"], bsdf.inputs["Roughness"])
    metal = tex("metallic", True)
    if metal:
        nt.links.new(metal.outputs["Color"], bsdf.inputs["Metallic"])
    normal = tex("normal", True)
    if normal:
        nm = nt.nodes.new("ShaderNodeNormalMap")
        nt.links.new(normal.outputs["Color"], nm.inputs["Color"])
        nt.links.new(nm.outputs["Normal"], bsdf.inputs["Normal"])
    return mat


if wanted("materials"):
    folder = os.path.join(OUT, "maps")
    os.makedirs(folder, exist_ok=True)
    for image in bpy.data.images:
        if image.name.startswith("coat_") and image.name != "coat_basecolor_closed.png":
            image.filepath_raw = os.path.join(folder, image.name)
            image.file_format = "PNG"
            image.save()
            print("SAVED", image.name, flush=True)
    for ob in list(bpy.data.objects):
        if ob.type in ("MESH", "CURVES", "ARMATURE") and ob.name != "Floor" and not ob.name.startswith("Card"):
            ob.hide_render = True
    bpy.ops.mesh.primitive_uv_sphere_add(segments=96, ring_count=48, radius=0.5, location=(0, 0, 0.5))
    ball = bpy.context.active_object
    bpy.ops.object.shade_smooth()
    size(640)
    orbit(0, 14, Vector((0, 0, 0.5)), 3.2)
    for name in MATERIALS:
        maps = latest_maps(name)
        if not maps:
            print("NO MAPS", name, flush=True)
            continue
        ball.data.materials.clear()
        ball.data.materials.append(ball_material(name, maps))
        studio.render(os.path.join(OUT, "ball_%s.png" % name))
        print("RENDERED ball", name, flush=True)

# --- a full turn ---------------------------------------------------------------------------------
if wanted("turntable"):
    frames = int(os.environ.get("TURN_FRAMES", "96"))
    folder = os.path.join(OUT, "turntable")
    os.makedirs(folder, exist_ok=True)
    size(1200, 800)
    P.pose("sit")
    P.frame(cam, 26, 12, margin=1.32)
    pivot = Vector(P.points(25).mean(0))
    pivot.z = 0.0
    base = RIG.matrix_world.copy()
    ellipse = None
    for f in range(frames):
        path = os.path.join(folder, "%04d.png" % f)
        if os.path.exists(path) and ellipse is not None:
            continue
        angle = 2 * math.pi * f / frames
        RIG.matrix_world = Matrix.Translation(pivot) @ Matrix.Rotation(angle, 4, "Z") @ Matrix.Translation(-pivot) @ base
        bpy.context.view_layer.update()
        studio.eye_lights(cam, eyes_mid())
        ellipse = studio.render(path, ellipse=ellipse)
        print("RENDERED turntable", f, flush=True)
    RIG.matrix_world = base

# --- the puppy beside her: the repo's look-dev duo, at a board's 3:2 -------------------------------
# Last, because it opens her build again with the puppy appended.
if wanted("duo"):
    import puppy
    from dasha_pose import frame_points

    dasha.load(dasha.CACHE)
    puppy.append(puppy.CACHE)
    scene, cam = studio.setup(samples=max(SPP, 192), res=(2400, 1600))
    P, Q = dasha.Poser(), puppy.Poser()
    P.pose("sit")
    P.rot("root", Vector((0, 0, 1)), 14, pivot=P.head("root"))
    P.move("root", (-0.36, 0.02, 0))
    P.ground()
    Q.pose("sit", turn=-6.0, face=28.0)
    Q.put((0.38, 0.0), turn=-16.0)
    frame_points(cam, [tuple(p) for p in P.points(25)] + [tuple(p) for p in Q.points(25)], 12, 12, 1.1)
    P.look_at(cam.location)
    Q.look_at(cam.location)
    mid = sum(((R.head("eye.L") + R.head("eye.R")) * 0.5 for R in (P, Q)), Vector()) / 2
    studio.eye_lights(cam, mid, eyes=[bpy.data.objects["Eye.L"], bpy.data.objects["Eye.R"]])
    Q.eye_lights(cam)
    studio.render(os.path.join(OUT, "duo.png"), fade=True, alpha_samples=32)
    print("RENDERED duo", flush=True)
