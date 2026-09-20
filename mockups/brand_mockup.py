"""
Brand mockup: a logo SVG laid flat on a plate, on the same canvas, camera and lighting as mockup.py.
usage: Blender -b -P brand_mockup.py -- <logo.svg> <out.png>
env:   MOCKUP_W / MOCKUP_H (default 4000x2600), MOCKUP_SAMPLES (default 160),
       LOGO_SCALE (logo width as a fraction of the canvas width, default 0.42),
       PLATE / INK (linear RGB "r,g,b"; defaults near-white plate, near-black ink)
"""
import bpy, math, os, sys
from mathutils import Vector, Matrix

argv = sys.argv[sys.argv.index("--") + 1:]
SVG, OUT = argv[0], argv[1]
rgb = lambda s: tuple(float(v) for v in s.split(",")) + (1,)
PLATE = rgb(os.environ.get("PLATE", "0.90,0.90,0.90"))
INK   = rgb(os.environ.get("INK", "1,1,1"))   # white mark
LOGO_SCALE = float(os.environ.get("LOGO_SCALE", 0.56))

OFFWHITE  = (1.0, 1.0, 1.0, 1)   # site ground is pure white
WORLD     = 0.72
SUN_SHARE = 1.0 - WORLD
SUN_ANGLE = 35
GAP       = 0.55
ASPECT    = 2000 / 1299            # same canvas proportions as the screenshot mockups

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

def diffuse_mat(name, color):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes): nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfDiffuse")
    bsdf.inputs["Color"].default_value = color
    nt.links.new(bsdf.outputs[0], out.inputs[0])
    return m

plate_mat = diffuse_mat("Plate", PLATE)
ink_mat   = diffuse_mat("Ink", INK)
bg_mat    = diffuse_mat("Backdrop", OFFWHITE)

def card(name, width, height, mat, loc, rot, thickness, corner):
    mesh = bpy.data.meshes.new(name)
    hw, hh = width/2, height/2
    mesh.from_pydata([(-hw,-hh,0),(hw,-hh,0),(hw,hh,0),(-hw,hh,0)], [], [(0,1,2,3)])
    mesh.update()
    for p in mesh.polygons: p.use_smooth = True
    ob = bpy.data.objects.new(name, mesh)
    scene.collection.objects.link(ob)
    ob.location = loc
    ob.rotation_euler = [math.radians(a) for a in rot]
    ob.data.materials.append(mat)
    b = ob.modifiers.new("Corners", 'BEVEL')
    b.affect = 'VERTICES'; b.width = corner; b.segments = 24; b.use_clamp_overlap = True
    s = ob.modifiers.new("Thickness", 'SOLIDIFY')
    s.thickness = thickness; s.offset = -1; s.use_rim = True
    e = ob.modifiers.new("Edge", 'BEVEL')
    e.affect = 'EDGES'; e.width = thickness * 0.35; e.segments = 4
    e.limit_method = 'ANGLE'; e.angle_limit = math.radians(40)
    e.use_clamp_overlap = True; e.harden_normals = True
    return ob

MAIN_W = 3.2
MAIN_H = MAIN_W / ASPECT
ROT = (90, 0, 0)          # straight on, no tilt
main = card("Canvas", MAIN_W, MAIN_H, plate_mat, (0,0,0), ROT, thickness=0.035, corner=0.05)
# The plate only exists to position and scale the logo. Hidden by default, so the
# mark reads directly on the page pattern; set BRAND_PLATE=1 to render the card.
main.hide_render = os.environ.get("BRAND_PLATE") != "1"
bpy.context.view_layer.update()
M = main.matrix_world
N = (M.to_3x3() @ Vector((0,0,1))).normalized()
UP = (M.to_3x3() @ Vector((0,1,0))).normalized()
RIGHT = (M.to_3x3() @ Vector((1,0,0))).normalized()

# ---------- logo: import the SVG as filled curves, fit it to the canvas, lay it on the plate ----------
before = set(bpy.data.objects)
bpy.ops.import_curve.svg(filepath=os.path.abspath(SVG))
bpy.context.view_layer.update()
parts = [o for o in bpy.data.objects if o not in before and o.type == 'CURVE']
if not parts:
    raise SystemExit("SVG import produced no curves")
corners = [o.matrix_world @ Vector(c) for o in parts for c in o.bound_box]
lo = Vector((min(c.x for c in corners), min(c.y for c in corners), 0))
hi = Vector((max(c.x for c in corners), max(c.y for c in corners), 0))
size = hi - lo
s = (MAIN_W * LOGO_SCALE) / size.x
centre = (lo + hi) / 2
fit = Matrix.Translation((0, 0, 0.002)) @ Matrix.Diagonal((s, s, s, 1)) @ Matrix.Translation(-centre)
for o in parts:
    o.data.dimensions = '2D'; o.data.fill_mode = 'BOTH'; o.data.resolution_u = 32
    o.data.materials.clear(); o.data.materials.append(ink_mat)
    world = o.matrix_world.copy()
    o.parent = main
    o.matrix_parent_inverse = Matrix.Identity(4)
    o.matrix_basis = fit @ world
print("LOGO", len(parts), "curves, svg size %.2f x %.2f -> %.3f x %.3f units" % (size.x, size.y, size.x*s, size.y*s))

# ---------- backdrop ----------
bpy.ops.mesh.primitive_plane_add(size=1)
bd = bpy.context.object
bd.name = "Backdrop"; bd.scale = (120, 120, 1)
bd.rotation_euler = main.rotation_euler; bd.location = -N * GAP
bd.data.materials.append(bg_mat)
bd.is_shadow_catcher = True

# ---------- lighting ----------
world = bpy.data.worlds.new("World"); scene.world = world
world.use_nodes = True
wbg = world.node_tree.nodes["Background"]
wbg.inputs[0].default_value = (1, 1, 1, 1); wbg.inputs[1].default_value = WORLD
L = (N + 0.55*UP - 0.35*RIGHT).normalized()
sun = bpy.data.lights.new("Sun", 'SUN')
sun.energy = SUN_SHARE * math.pi / N.dot(L); sun.angle = math.radians(SUN_ANGLE)
sun_ob = bpy.data.objects.new("Sun", sun); scene.collection.objects.link(sun_ob)
sun_ob.rotation_euler = (-L).to_track_quat('-Z', 'Y').to_euler()

# ---------- camera ----------
cam_data = bpy.data.cameras.new("Camera"); cam_data.lens = 50
cam = bpy.data.objects.new("Camera", cam_data); scene.collection.objects.link(cam)
# Dead centre. At 50mm the frame is 0.72*D wide, so this fills about 90% of it.
cam.location = (0, -4.95, 0)
cam.rotation_euler = (Vector((0, 0, 0)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
scene.camera = cam

# ---------- render ----------
scene.render.resolution_x = int(os.environ.get("MOCKUP_W", 6000))
scene.render.resolution_y = int(os.environ.get("MOCKUP_H", 4395))
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.filter_size = 1.2
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.image_settings.color_depth = '8'
scene.render.image_settings.compression = 15
scene.render.filepath = OUT
scene.view_settings.view_transform = 'Standard'; scene.view_settings.look = 'None'
scene.render.engine = 'CYCLES'
cy = scene.cycles
cy.samples = int(os.environ.get("MOCKUP_SAMPLES", 160))
cy.use_adaptive_sampling = True; cy.use_denoising = True
for attr, val in (("denoiser", 'OPENIMAGEDENOISE'), ("denoising_input_passes", 'RGB_ALBEDO_NORMAL'),
                  ("denoising_prefilter", 'ACCURATE'), ("denoising_use_gpu", True),
                  ("caustics_reflective", False), ("caustics_refractive", False)):
    try: setattr(cy, attr, val)
    except Exception as ex: print("skip", attr, ex)
device = "CPU"
try:
    prefs = bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type = 'METAL'; prefs.get_devices()
    for d in prefs.devices: d.use = (d.type == 'METAL')
    if any(d.use for d in prefs.devices): cy.device = 'GPU'; device = "GPU/Metal"
except Exception as ex:
    print("Metal unavailable:", ex)
print("RENDER", device, scene.render.resolution_x, "x", scene.render.resolution_y, "samples", cy.samples)

bpy.context.preferences.filepaths.save_version = 0
blend_path = os.path.splitext(OUT)[0] + ".blend"
bpy.ops.wm.save_as_mainfile(filepath=blend_path)
bpy.ops.render.render(write_still=True)
webp = os.path.splitext(OUT)[0] + ".webp"
scene.render.image_settings.file_format = "WEBP"; scene.render.image_settings.quality = 100
bpy.data.images["Render Result"].save_render(filepath=webp, scene=scene)
print("DONE", OUT, webp, blend_path, bpy.app.version_string)
