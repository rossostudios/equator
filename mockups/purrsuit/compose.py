"""
Purrsuit's case-study images, from the game's own captures and renders:
  python3 compose.py <jinx renders dir> [only]
- the cover and hero: Jinx (rendered in Blender) in front of two phones playing the game, transparent like the
  site's other heroes, so the house pattern shows behind it on the work card;
- the 3D chapter: the six looks, a turnaround, his faces, the wireframe, the painted texture sets (3:2 each, on the
  navy the props and icons were rendered on);
- props, icons and the app icon (3:2);
- the phone screenshots, as WebP (1080 x 2340, Captures/cat-ui-hires from the game's CatShotTool -hires).
Writes src/assets/work/purrsuit/**.webp. The renders come from render_jinx.py (Blender) and the game repo.
"""
import os, sys
from PIL import Image, ImageDraw, ImageFilter
from art import GAME, NAVY, Phone, backdrop, fit_alpha, font, LILITA, tame_shadow

R = sys.argv[1]
ONLY = sys.argv[2].split(",") if len(sys.argv) > 2 else None
SITE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(SITE, "src/assets/work/purrsuit")
SHOTS = os.path.join(GAME, "Captures/cat-ui-hires")
os.makedirs(os.path.join(OUT, "phone"), exist_ok=True)
os.makedirs(os.path.join(OUT, "3d"), exist_ok=True)


def want(name):
    return ONLY is None or name in ONLY


def save(im, rel, quality=90):
    path = os.path.join(OUT, rel + ".webp")
    im.save(path, "WEBP", quality=quality, method=6)
    print("wrote", path, im.size)


def render(name, shadow=True):
    im = Image.open(os.path.join(R, name + ".png")).convert("RGBA")
    return tame_shadow(im) if shadow else im


def shot(name):
    return Image.open(os.path.join(SHOTS, name + ".png")).convert("RGB")


def place(canvas, im, cx, bottom):
    canvas.alpha_composite(im, (round(cx - im.width / 2), round(bottom - im.height)))


def board(size=(2400, 1600), **kw):
    return backdrop(size, **kw).convert("RGBA")


# ---------------------------------------------------------------- the cover and hero (2000 x 1326, transparent)
if want("hero"):
    W, H = 2000, 1326
    hero = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ph = Phone(1080)
    for name, cx, top in (("00_loading", 1020, 60), ("12i_journey_shallows", 1560, 150)):
        p = ph.screen(shot(name))
        s, pad = ph.shadow()
        hero.alpha_composite(s, (cx - ph.w // 2 - pad, top - pad + 24))
        hero.alpha_composite(p, (cx - ph.w // 2, top))
    jinx = fit_alpha(render("hero"), 4)
    k = 1180 / jinx.height
    jinx = jinx.resize((round(jinx.width * k), 1180), Image.LANCZOS)
    place(hero, jinx, 600, H - 30)
    save(hero, "hero", 92)

# ---------------------------------------------------------------- 3D: the looks, a turnaround, faces, wireframe, textures
if want("looks"):
    # six across like a character select, each named under its feet
    b = board(reach=1.0, centre=(0.5, 0.55))
    names = ["Street", "Midnight", "Gold Heist", "Faux Tux", "The Evidence", "Catch of the Day"]
    label = font(LILITA, 44)
    d = ImageDraw.Draw(b)
    for k in range(6):
        im = render("look_%d" % k)
        solid = im.getchannel("A").point(lambda v: 255 if v > 250 else 0).getbbox()
        s = 960 / (solid[3] - solid[1])
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
        cx = 220 + k * 392
        fx, fy = (solid[0] + solid[2]) / 2 * s, solid[3] * s
        b.alpha_composite(im, (round(cx - fx), round(1250 - fy)))
        w = d.textlength(names[k].upper(), font=label)
        d.text((cx - w / 2, 1320), names[k].upper(), font=label, fill=(255, 255, 255, 235))
    save(b, "3d/looks")

if want("turnaround"):
    b = board(reach=0.9, centre=(0.5, 0.52))
    for i, n in enumerate(("front", "three_quarter", "side", "back")):
        im = fit_alpha(render("turn_" + n), 2)
        s = 1260 / im.height
        im = im.resize((round(im.width * s), 1260), Image.LANCZOS)
        place(b, im, 300 + i * 600, 1430)
    save(b, "3d/turnaround")

if want("faces"):
    b = board(centre=(0.33, 0.5), reach=0.8)
    big = render("face").resize((1600, 1600), Image.LANCZOS)
    b.alpha_composite(big, (0, 0))
    for i, n in enumerate(("face_happy", "face_shock")):
        im = render(n).resize((800, 800), Image.LANCZOS)
        b.alpha_composite(im, (1600, i * 800))
    d = ImageDraw.Draw(b)
    d.line([(1600, 0), (1600, 1600)], fill=NAVY + (255,), width=6)
    d.line([(1600, 800), (2400, 800)], fill=NAVY + (255,), width=6)
    save(b, "3d/faces")

if want("wire"):
    b = board(centre=(0.5, 0.5), reach=0.9)
    for i, n in enumerate(("wire_textured", "wire_clay")):
        im = render(n)
        solid = im.getchannel("A").point(lambda v: 255 if v > 250 else 0).getbbox()
        s = 1380 / (solid[3] - solid[1])
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
        fx, fy = (solid[0] + solid[2]) / 2 * s, solid[3] * s
        half = Image.new("RGBA", (1200, 1600), (0, 0, 0, 0))
        half.alpha_composite(im, (round(600 - fx), round(1500 - fy)))
        b.alpha_composite(half, (i * 1200, 0))
    ImageDraw.Draw(b).line([(1200, 0), (1200, 1600)], fill=(255, 255, 255, 60), width=3)
    save(b, "3d/wireframe")

if want("textures"):
    keys = ["Street", "Midnight", "GoldHeist", "FauxTux", "TheEvidence", "CatchOfTheDay"]
    tex = os.path.join(GAME, "Assets/Resources/Characters/Jinx")
    b = Image.new("RGBA", (2400, 1600), NAVY + (255,))
    for i, key in enumerate(keys):
        im = Image.open(os.path.join(tex, "Jinx_Body_%s_AlbedoTransparency.png" % key)).convert("RGBA").resize((760, 760), Image.LANCZOS)
        tile = Image.new("RGBA", im.size, (36, 38, 70, 255))
        tile.alpha_composite(im)
        b.alpha_composite(tile, (20 + (i % 3) * 800, 20 + (i // 3) * 800))
    save(b, "3d/textures")

# ---------------------------------------------------------------- props, icons, the app icon
if want("props"):
    strip = Image.open(os.path.join(GAME, "art/props/renders/props.png")).convert("RGBA")
    n = strip.width // 512
    order = [i for i in range(n) if i not in (20,)]   # the short tuna (the long one stays)
    b = Image.new("RGBA", (2400, 1600), NAVY + (255,))
    for j, i in enumerate(order[:24]):
        tile = strip.crop((i * 512, 0, i * 512 + 512, 512)).resize((400, 400), Image.LANCZOS)
        b.alpha_composite(tile, ((j % 6) * 400, (j // 6) * 400))
    save(b, "3d/props")

if want("icons"):
    icons = os.path.join(GAME, "Assets/Resources/UI/Icons")
    names = ["home", "hero_ginger", "hero_duchess", "boss_pup", "boss_guard", "boss_bruno", "boss_catcher",
             "boss_drone", "fish", "star", "trophy", "chest", "shop", "map", "endless", "heart", "lock", "ad",
             "gear", "sound", "music", "vibrate", "node", "node_next", "node_boss", "node_locked", "starOff"]
    b = Image.new("RGBA", (2400, 1600), NAVY + (255,))
    cols, rows = 7, 4
    cw, ch = 2400 / cols, 1600 / rows
    for j, n in enumerate(names[:cols * rows]):
        im = Image.open(os.path.join(icons, n + ".png")).convert("RGBA").resize((300, 300), Image.LANCZOS)
        b.alpha_composite(im, (round((j % cols) * cw + (cw - 300) / 2), round((j // cols) * ch + (ch - 300) / 2)))
    save(b, "3d/icons")

if want("appicon"):
    b = board(centre=(0.5, 0.5), reach=0.85)
    for path, size, cx in (("icon_blue_1024", 980, 820), ("icon_gold_1024", 640, 1810)):
        im = Image.open(os.path.join(GAME, "art/icon/renders", path + ".png")).convert("RGBA").resize((size, size), Image.LANCZOS)
        mask = Image.new("L", (size * 4, size * 4), 0)
        ImageDraw.Draw(mask).rounded_rectangle([0, 0, size * 4 - 1, size * 4 - 1], round(size * 4 * 0.2237), fill=255)
        im.putalpha(mask.resize((size, size), Image.LANCZOS))
        s = Image.new("RGBA", (size + 160, size + 160), (0, 0, 0, 0))
        s.paste((0, 0, 0, 120), (80, 80), im.getchannel("A"))
        s = s.filter(ImageFilter.GaussianBlur(28))
        b.alpha_composite(s, (cx - size // 2 - 80, 800 - size // 2 - 80 + 26))
        b.alpha_composite(im, (cx - size // 2, 800 - size // 2))
    save(b, "3d/app-icon")

# ---------------------------------------------------------------- the phone screenshots
PHONE = ["00_loading", "01_home", "03_levels", "03b_level_card", "03e_endless_postcards", "04_shop", "04f_look_couture",
         "04h_look_night", "04i_bundle", "06_hud", "06b_hud_powers", "06c_hud_chase", "06e_hud_boss", "07_pause",
         "08_revive", "09_result_win", "11_result_endless", "12c_journey_cannery", "12d_journey_dive_leap",
         "12i_journey_shallows", "12n_journey_rooftops", "13h_press_window", "14b_wreck_hull_run", "14c_trench_lou",
         "14h_whaleback", "14l_spout_apex_slowmo"]
if want("phone"):
    for n in PHONE:
        save(shot(n), "phone/" + n.split("_", 1)[1].replace("_", "-"), 88)
