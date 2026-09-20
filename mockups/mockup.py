"""
Petzone 3D mockup generator.
usage: Blender -b -P mockup.py -- <screenshot> <out.png> [orders|sales-dark|pos-dark]
env:   MOCKUP_W / MOCKUP_H (default 4000x2600), MOCKUP_SAMPLES (default 160), MOCKUP_LIFT=1 to lift UI elements
Lighting is a uniform white environment plus one wide, soft sun. Their strengths sum to exactly 1,
so every lit surface renders at precisely its own colour: the backdrop is a flat off-white and the
screenshot keeps its true colours, while occlusion gives real soft shadows.
"""
import bpy, math, os, sys
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:]
IMG, OUT = argv[0], argv[1]
LAYOUT = argv[2] if len(argv) > 2 else "orders"

OFFWHITE  = (1.0, 1.0, 1.0, 1)   # site ground is pure white   # linear -> #F4F4F5 in sRGB
WORLD     = 0.72                     # uniform environment radiance
SUN_SHARE = 1.0 - WORLD              # the sun supplies the rest
SUN_ANGLE = 35                       # degrees; wide = very soft shadows
GAP       = 0.55                     # further off the backdrop, so the shadow reads

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
img = bpy.data.images.load(IMG)
W, H = img.size
ASPECT = W / H

# ---------- materials ----------
def diffuse_mat(name, color=None, image=None):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree
    for n in list(nt.nodes): nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    bsdf = nt.nodes.new("ShaderNodeBsdfDiffuse")
    if image:
        tex = nt.nodes.new("ShaderNodeTexImage")
        tex.image = image; tex.interpolation = 'Linear'; tex.extension = 'EXTEND'
        nt.links.new(tex.outputs["Color"], bsdf.inputs["Color"])
    else:
        bsdf.inputs["Color"].default_value = color
    nt.links.new(bsdf.outputs[0], out.inputs[0])
    return m

screen_mat = diffuse_mat("Screen", image=img)   # one material: rims show the edge pixels of the crop
bg_mat = diffuse_mat("Backdrop", color=OFFWHITE)

# ---------- geometry ----------
def card(name, width, height, uv_rect, loc, rot, thickness, corner):
    """Rounded, extruded plate textured with a crop of the screenshot. uv_rect = (u0,v0,u1,v1)."""
    mesh = bpy.data.meshes.new(name)
    hw, hh = width/2, height/2
    mesh.from_pydata([(-hw,-hh,0),(hw,-hh,0),(hw,hh,0),(-hw,hh,0)], [], [(0,1,2,3)])
    mesh.update()
    uv = mesh.uv_layers.new(name="UVMap")
    u0,v0,u1,v1 = uv_rect
    for loop, co in zip(mesh.loops, [(u0,v0),(u1,v0),(u1,v1),(u0,v1)]):
        uv.data[loop.index].uv = co
    for p in mesh.polygons: p.use_smooth = True
    ob = bpy.data.objects.new(name, mesh)
    scene.collection.objects.link(ob)
    ob.location = loc
    ob.rotation_euler = [math.radians(a) for a in rot]
    ob.data.materials.append(screen_mat)
    # rounded corners
    b = ob.modifiers.new("Corners", 'BEVEL')
    b.affect = 'VERTICES'; b.width = corner; b.segments = 24; b.use_clamp_overlap = True
    # thickness, extruded backwards so the face stays where it was placed
    s = ob.modifiers.new("Thickness", 'SOLIDIFY')
    s.thickness = thickness; s.offset = -1; s.use_rim = True
    # tiny rounded edge that catches the light
    e = ob.modifiers.new("Edge", 'BEVEL')
    e.affect = 'EDGES'; e.width = thickness * 0.35; e.segments = 4
    e.limit_method = 'ANGLE'; e.angle_limit = math.radians(40)
    e.use_clamp_overlap = True; e.harden_normals = True
    return ob

MAIN_W = 3.2
MAIN_H = MAIN_W / ASPECT
ROT = (90, 0, 0)          # straight on, no tilt
main = card("Screen", MAIN_W, MAIN_H, (0,0,1,1), (0,0,0), ROT, thickness=0.035, corner=0.05)
bpy.context.view_layer.update()
M = main.matrix_world
N = (M.to_3x3() @ Vector((0,0,1))).normalized()     # screen normal (towards camera)
UP = (M.to_3x3() @ Vector((0,1,0))).normalized()
RIGHT = (M.to_3x3() @ Vector((1,0,0))).normalized()

def on_screen(u, v, lift):
    return M @ Vector(((u-0.5)*MAIN_W, (v-0.5)*MAIN_H, lift))

def px(x0,y0,x1,y1):
    return (x0/W, 1-y1/H, x1/W, 1-y0/H)

def element(name, rect, radius, lift, scale=1.1, thickness=0.014, inset=2):
    """Lift a UI element off the screen. rect = pixel bounds (x0,y0,x1,y1); radius = px or 'pill'."""
    x0,y0,x1,y1 = rect
    x0 += inset; y0 += inset; x1 -= inset; y1 -= inset
    w = (x1-x0)/W * MAIN_W * scale
    h = (y1-y0)/H * MAIN_H * scale
    r_px = (y1-y0)/2 if radius == 'pill' else max(0, radius - inset)
    corner = min(r_px/H * MAIN_H * scale, min(w,h)/2 * 0.999)
    u = (x0+x1)/2/W; v = 1-(y0+y1)/2/H
    return card(name, w, h, px(x0,y0,x1,y1), on_screen(u, v, lift), ROT, thickness, corner)

# Lifted elements are off by default: they duplicate UI over its original, which stays visible
# underneath. Set MOCKUP_LIFT=1 to bring them back.
if os.environ.get("MOCKUP_LIFT") == "1":
    if LAYOUT.startswith("sales"):
        element("Row",         (376, 490, 1934, 556),  12,     0.13, 1.06, 0.02)
        element("ViewReports", (1641, 258, 1800, 306), 'pill', 0.18, 1.18)
        element("RecordSale",  (1811, 258, 1957, 306), 'pill', 0.22, 1.18)
        element("Columns",     (1731, 366, 1877, 412), 'pill', 0.10, 1.12)
        element("Sidebar",     (16, 655, 245, 712),    'pill', 0.11, 1.12)
    elif LAYOUT.startswith("pos"):
        element("Product",     (1058, 470, 1390, 682), 22,     0.14, 1.10, 0.02)
        element("Search",      (366, 304, 1204, 352),  'pill', 0.08, 1.06)
        element("AddCustomer", (1714, 238, 1948, 286), 'pill', 0.18, 1.18)
        element("Drawer",      (1608, 846, 1770, 892), 'pill', 0.16, 1.18)
        element("Register",    (16, 668, 290, 724),    'pill', 0.10, 1.12)
    else:
        element("KPI",         (352, 344, 1956, 476),  16,     0.09, 1.06, 0.02)
        element("OrderRow",    (352, 640, 1956, 730),  12,     0.13, 1.06, 0.02)
        element("CreateOrder", (1803, 260, 1955, 304), 'pill', 0.20, 1.2)
        element("Tabs",        (376, 528, 922, 572),   'pill', 0.06, 1.08)

# backdrop: parallel to the screen, just behind it, so it is lit exactly like the screen
bpy.ops.mesh.primitive_plane_add(size=1)
bd = bpy.context.object
bd.name = "Backdrop"
bd.scale = (120, 120, 1)
bd.rotation_euler = main.rotation_euler
bd.location = -N * GAP
bd.data.materials.append(bg_mat)
# Transparent output: the backdrop stops being a surface and only catches the shadow,
# so the page's own block pattern can sit behind the render.
bd.is_shadow_catcher = True

# ---------- lighting ----------
world = bpy.data.worlds.new("World"); scene.world = world
world.use_nodes = True
wbg = world.node_tree.nodes["Background"]
wbg.inputs[0].default_value = (1, 1, 1, 1)
wbg.inputs[1].default_value = WORLD

L = (N + 0.55*UP - 0.35*RIGHT).normalized()          # light comes from the upper left, in front
cos_t = N.dot(L)
sun = bpy.data.lights.new("Sun", 'SUN')
sun.energy = SUN_SHARE * math.pi / cos_t              # diffuse radiance = albedo * E*cos/pi
sun.angle = math.radians(SUN_ANGLE)
sun_ob = bpy.data.objects.new("Sun", sun)
scene.collection.objects.link(sun_ob)
sun_ob.rotation_euler = (-L).to_track_quat('-Z', 'Y').to_euler()

# ---------- camera ----------
cam_data = bpy.data.cameras.new("Camera"); cam_data.lens = 50
cam = bpy.data.objects.new("Camera", cam_data)
scene.collection.objects.link(cam)
# Dead centre. At 50mm the frame is 0.72*D wide, so this fills about 90% of it.
cam.location = (0, -4.95, 0)
cam.rotation_euler = (Vector((0, 0, 0)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
scene.camera = cam

# ---------- render ----------
scene.render.resolution_x = int(os.environ.get("MOCKUP_W", 6000))
scene.render.resolution_y = int(os.environ.get("MOCKUP_H", 4395))
scene.render.resolution_percentage = 100
scene.render.filter_size = 1.2
scene.render.film_transparent = True
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGBA'
scene.render.image_settings.color_depth = '8'
scene.render.image_settings.compression = 15
scene.render.filepath = OUT
scene.view_settings.view_transform = 'Standard'
scene.view_settings.look = 'None'

scene.render.engine = 'CYCLES'
cy = scene.cycles
cy.samples = int(os.environ.get("MOCKUP_SAMPLES", 160))
cy.use_adaptive_sampling = True
cy.use_denoising = True
for attr, val in (("denoiser", 'OPENIMAGEDENOISE'), ("denoising_input_passes", 'RGB_ALBEDO_NORMAL'),
                  ("denoising_prefilter", 'ACCURATE'), ("denoising_use_gpu", True),
                  ("caustics_reflective", False), ("caustics_refractive", False)):
    try: setattr(cy, attr, val)
    except Exception as ex: print("skip", attr, ex)
device = "CPU"
try:
    prefs = bpy.context.preferences.addons['cycles'].preferences
    prefs.compute_device_type = 'METAL'
    prefs.get_devices()
    for d in prefs.devices:
        d.use = (d.type == 'METAL')
    if any(d.use for d in prefs.devices):
        cy.device = 'GPU'; device = "GPU/Metal"
except Exception as ex:
    print("Metal unavailable:", ex)
print("RENDER", device, scene.render.resolution_x, "x", scene.render.resolution_y, "samples", cy.samples)

bpy.context.preferences.filepaths.save_version = 0   # no .blend1 backups next to the renders
blend_path = os.path.splitext(OUT)[0] + ".blend"
bpy.ops.wm.save_as_mainfile(filepath=blend_path)
bpy.ops.render.render(write_still=True)
webp = os.path.splitext(OUT)[0] + ".webp"
scene.render.image_settings.file_format = "WEBP"
scene.render.image_settings.quality = 100
bpy.data.images["Render Result"].save_render(filepath=webp, scene=scene)

print("DONE", OUT, webp, blend_path, bpy.app.version_string)
