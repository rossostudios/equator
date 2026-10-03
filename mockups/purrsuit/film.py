"""
Purrsuit's film for the case study: 1600 x 900, 30 fps, silent, one cut per language, in the system the site's other
films use (a white caption card with an eyebrow, a headline with one phrase in the accent colour and a line under it,
the product in a phone over a blur of itself, an end card with the logo).
  python3 film.py <jinx renders dir> [en|es|all] [--frames a,b] [--still t]
Footage: the game's own frames, filmed by its FilmShots editor tool (Captures/film/intro.mp4, journey.mp4, boss.mp4:
the perfect bot playing, 1080 x 2340 at 60 fps), stills from Captures/cat-ui-hires, and the Blender turntable of Jinx
(render_jinx.py turntable). Writes public/work/purrsuit/film-<lang>.mp4 and its poster film-<lang>.webp.
"""
import os, subprocess, sys
from PIL import Image, ImageDraw, ImageFilter
from art import GAME, LILITA, NAVY, Phone, backdrop, font, logo, rounded_mask, tame_shadow

R = sys.argv[1]
LANGS = ["en", "es"] if len(sys.argv) < 3 or sys.argv[2] == "all" else [sys.argv[2]]
W, H, FPS = 1600, 900, 30
SITE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(SITE, "public/work/purrsuit")
FILM = os.path.join(GAME, "Captures/film")
SHOTS = os.path.join(GAME, "Captures/cat-ui-hires")
os.makedirs(OUT, exist_ok=True)

ACCENT = (106, 61, 240)       # Jinx's hoodie
HEAD = (27, 22, 58)
SUB = (98, 98, 122)
PHONE = Phone(820)
SHADOW, SPAD = PHONE.shadow()
PX, PY = 1000, (H - PHONE.h) // 2      # the phone's place when a card sits on the left (each in its half)

# ---------------------------------------------------------------- the words, per language
# a headline is a list of (text, accent?) runs
T = {
    "en": dict(
        run=("AN IPHONE GAME", [("Cats raid a ", 0), ("fish market.", 1)], "Swipe to dodge, jump and roll. The Dog Squad is right behind you."),
        super=("SUPERS", [("Every hero has a ", 0), ("super.", 1)], "Jinx's Shadow Dash smashes straight through the crates."),
        places=("ENDLESS", [("Seven places, ", 0), ("one run.", 1)], "The docks, a cannery, the sea floor, a shipwreck, the deep end, a whale and the rooftops."),
        dive=("THE DIVE", [("Then you ", 0), ("dive.", 1)], "A fishbowl for a helmet, floaty jumps and water physics."),
        deep=("THE DEEP END", [("Lantern Lou ", 0), ("lights the way.", 1)], "It is dark down there. The hazards glow."),
        whale=("BARNACLE BESS", [("Thar she ", 0), ("blows.", 1)], "A whale's spout launches you up to the rooftops."),
        boss=("CAMPAIGN · 30 LEVELS", [("Every level ends in a ", 0), ("boss fight.", 1)], "Read the wind-up, then pounce."),
        jinx=("3D", [("Rigged in Blender, ", 0), ("painted in Substance Painter.", 1)], "Jinx: 47,000 triangles, six looks, a face for every mood."),
        shop=("THE SHOP", [("Looks, ", 0), ("never loot boxes.", 1)], "Every look is cosmetic. Nothing buys score."),
        tagline="Follow the fish.", pill="iPhone · in TestFlight",
    ),
    "es": dict(
        run=("UN JUEGO PARA IPHONE", [("Unos gatos asaltan un ", 0), ("mercado de pescado.", 1)], "Desliza para esquivar, saltar y rodar, con la brigada canina detrás."),
        super=("SÚPERPODERES", [("Cada héroe tiene su ", 0), ("súper.", 1)], "El Shadow Dash de Jinx atraviesa las cajas."),
        places=("MODO INFINITO", [("Siete lugares, ", 0), ("una sola carrera.", 1)], "Los muelles, una enlatadora, el fondo del mar, un naufragio, las profundidades, una ballena y los tejados."),
        dive=("EL CHAPUZÓN", [("Y luego ", 0), ("te lanzas al agua.", 1)], "Una pecera de casco, saltos flotantes y física de agua."),
        deep=("LAS PROFUNDIDADES", [("Lantern Lou ", 0), ("te alumbra el camino.", 1)], "Allá abajo está oscuro. Los peligros brillan."),
        whale=("BARNACLE BESS", [("¡Ahí ", 0), ("sopla!", 1)], "El chorro de una ballena te lanza hasta los tejados."),
        boss=("CAMPAÑA · 30 NIVELES", [("Cada nivel termina con ", 0), ("un jefe.", 1)], "Lee el amago y luego cáele encima."),
        jinx=("3D", [("Armado en Blender, ", 0), ("pintado en Substance Painter.", 1)], "Jinx: 47.000 triángulos, seis looks, una cara para cada ánimo."),
        shop=("LA TIENDA", [("Looks, ", 0), ("nunca cajas de botín.", 1)], "Cada look es cosmético. Nada compra puntos."),
        tagline="Sigue al pescado.", pill="iPhone · en TestFlight",
    ),
}

# ---------------------------------------------------------------- pieces
def ease(k):
    k = max(0.0, min(1.0, k))
    return 1 - (1 - k) ** 3


def card(eyebrow, runs, sub, width=540):
    """The white caption card (RGBA), with its own soft shadow."""
    fe, fh, fs = font(LILITA, 19), font(LILITA, 50), font(LILITA, 24)
    pad = 34
    d0 = ImageDraw.Draw(Image.new("RGB", (8, 8)))
    # headline: words with their colour, wrapped to the card
    words = []
    for text, acc in runs:
        for i, w in enumerate(text.split(" ")):
            if w:
                words.append((w, acc))
    lines, line, lw = [], [], 0
    space = d0.textlength(" ", font=fh)
    for w, acc in words:
        ww = d0.textlength(w, font=fh)
        if line and lw + space + ww > width - 2 * pad:
            lines.append(line); line, lw = [], 0
        line.append((w, acc)); lw += (space if lw else 0) + ww
    if line:
        lines.append(line)
    sub_lines, cur = [], ""
    for w in sub.split(" "):
        test = (cur + " " + w).strip()
        if d0.textlength(test, font=fs) > width - 2 * pad and cur:
            sub_lines.append(cur); cur = w
        else:
            cur = test
    sub_lines.append(cur)
    hh, sh_ = 56, 32
    height = pad + 24 + 14 + len(lines) * hh + 12 + len(sub_lines) * sh_ + pad - 6
    body = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    body.paste((255, 255, 255, 255), (0, 0), rounded_mask((width, height), 26))
    d = ImageDraw.Draw(body)
    x = pad
    tracked = 0
    for ch in eyebrow:   # letter-spaced caps
        d.text((x + tracked, pad - 4), ch, font=fe, fill=ACCENT)
        tracked += d.textlength(ch, font=fe) + 2.2
    y = pad + 24 + 10
    for ln in lines:
        x = pad
        for i, (w, acc) in enumerate(ln):
            d.text((x, y), w, font=fh, fill=ACCENT if acc else HEAD)
            x += d.textlength(w, font=fh) + space
        y += hh
    y += 10
    for s in sub_lines:
        d.text((pad, y), s, font=fs, fill=SUB)
        y += sh_
    shadow = Image.new("RGBA", (width + 80, height + 80), (0, 0, 0, 0))
    shadow.paste((10, 8, 30, 90), (40, 52), rounded_mask((width, height), 26))
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    shadow.alpha_composite(body, (40, 40))
    return shadow


def blur_bg(frame):
    """The frame itself, blurred to fill the film's width behind the phone, a little darker."""
    w, h = frame.size
    band = frame.crop((0, round(h * 0.30), w, round(h * 0.30 + w * 9 / 16)))
    small = band.resize((64, 36), Image.BILINEAR).filter(ImageFilter.GaussianBlur(2.2))
    big = small.resize((W, H), Image.BICUBIC)
    return Image.blend(big, Image.new("RGB", (W, H), NAVY), 0.28)


class Clip:
    """Frames of a video, decoded at the film's rate and the phone's screen size, one after another."""

    def __init__(self, name, t0, dur, size=(PHONE.sw, PHONE.sh)):
        self.size = size
        self.n = round(dur * FPS)
        self.p = subprocess.Popen(["ffmpeg", "-v", "error", "-ss", "%.3f" % t0, "-i", os.path.join(FILM, name + ".mp4"),
                                   "-t", "%.3f" % (dur + 0.5), "-vf", "fps=%d,scale=%d:%d:flags=lanczos" % (FPS, size[0], size[1]),
                                   "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE,
                                  stderr=subprocess.DEVNULL)   # closing early breaks its pipe on purpose
        self.last = None

    def next(self):
        raw = self.p.stdout.read(self.size[0] * self.size[1] * 3)
        if len(raw) == self.size[0] * self.size[1] * 3:
            self.last = Image.frombytes("RGB", self.size, raw)
        return self.last

    def close(self):
        self.p.stdout.close()
        self.p.wait()


def still(name):
    return Image.open(os.path.join(SHOTS, name + ".png")).convert("RGB").resize((PHONE.sw, PHONE.sh), Image.LANCZOS)


def compose(bg, screen, crd=None, k_in=1.0, k_out=1.0, px=PX, py=PY):
    """One frame: background, the phone showing screen, the card easing in from the left and out."""
    im = bg.convert("RGBA")
    im.alpha_composite(SHADOW, (round(px) - SPAD, py - SPAD + 18))
    im.alpha_composite(PHONE.screen(screen), (round(px), py))
    if crd is not None:
        a = ease(k_in) * min(1.0, k_out)
        if a > 0.01:
            c = crd.copy()
            c.putalpha(c.getchannel("A").point(lambda v: round(v * a)))
            x = 90 + round(40 * ease(k_in)) - 40   # the card's own shadow margin is 40
            im.alpha_composite(c, (x, (H - c.height) // 2))
    return im.convert("RGB")


# ---------------------------------------------------------------- segments: each yields its frames
def seg_phone(clips, words, dur, phone_from=None):
    """The phone playing one clip after another ([(video, start, seconds)]), the card on the left."""
    crd = card(*words) if words else None
    n = round(dur * FPS)
    queue = list(clips)
    cur, left = None, 0
    for i in range(n):
        if left <= 0:
            if cur:
                cur.close()
            name, t0, d = queue.pop(0)
            cur, left = (Clip(name, t0, d), round(d * FPS)) if name != "still" else (None, round(d * FPS))
            pic = None if cur else still(t0)
        frame = cur.next() if cur else pic
        left -= 1
        t = i / FPS
        px = PX
        if phone_from is not None:
            px = phone_from + (PX - phone_from) * ease(t / 0.7)
        yield compose(blur_bg(frame), frame, crd, (t - 0.25) / 0.45, (dur - t) / 0.3, px)
    if cur:
        cur.close()


def seg_intro(dur):
    """The game opening on the phone, centred: the logo drops in, the bar fills, home with Jinx waving."""
    clip = Clip("intro", 0.0, dur)
    for i in range(round(dur * FPS)):
        f = clip.next()
        yield compose(blur_bg(f), f, px=(W - PHONE.w) // 2)
    clip.close()


def seg_jinx(words, dur):
    """The Blender turntable on the backdrop, with the card."""
    crd = card(*words)
    frames = sorted(os.listdir(os.path.join(R, "turn")))
    bg = backdrop((W, H), centre=(0.7, 0.5), reach=0.7).convert("RGBA")
    cache = {}
    for i in range(round(dur * FPS)):
        t = i / FPS
        name = frames[i % len(frames)]
        if name not in cache:
            im = tame_shadow(Image.open(os.path.join(R, "turn", name)))
            cache[name] = im.resize((round(im.width * 1215 / im.height), 1215), Image.LANCZOS)   # Jinx ~720 px tall
        im = bg.copy()
        tt = cache[name]
        im.alpha_composite(tt, (1200 - tt.width // 2, 845 - round(tt.height * 1079 / 1350)))   # his feet at y 845
        a = ease((t - 0.25) / 0.45) * min(1.0, (dur - t) / 0.3)
        c = crd.copy()
        c.putalpha(c.getchannel("A").point(lambda v: round(v * a)))
        im.alpha_composite(c, (80 + round(40 * ease((t - 0.25) / 0.45)) - 40, (H - c.height) // 2))
        yield im.convert("RGB")


def seg_end(words, dur):
    """The logo, the tagline and a pill, over the night-violet of the game's credits."""
    bg = backdrop((W, H), base=(18, 12, 46), glow=(60, 40, 130), centre=(0.5, 0.42), reach=0.8).convert("RGBA")
    lg = logo(900)
    ft, fp = font(LILITA, 46), font(LILITA, 30)
    tag, pill = words
    top = (H - (lg.height + 182)) // 2
    words_layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(words_layer)
    w = d.textlength(tag, font=ft)
    d.text(((W - w) / 2, top + lg.height + 30), tag, font=ft, fill=(255, 255, 255, 255))
    pw = round(d.textlength(pill, font=fp) + 64)
    p = Image.new("RGBA", (pw, 62), (0, 0, 0, 0))
    p.paste((255, 255, 255, 242), (0, 0), rounded_mask(p.size, 31))
    ImageDraw.Draw(p).text((32, 13), pill, font=fp, fill=HEAD + (255,))
    words_layer.alpha_composite(p, ((W - pw) // 2, top + lg.height + 120))
    for i in range(round(dur * FPS)):
        t = i / FPS
        im = bg.copy()
        k = ease(t / 0.6)
        s = 0.92 + 0.08 * k
        l2 = lg.resize((round(lg.width * s), round(lg.height * s)), Image.LANCZOS)
        l2.putalpha(l2.getchannel("A").point(lambda v: round(v * k)))
        im.alpha_composite(l2, ((W - l2.width) // 2, top + (lg.height - l2.height) // 2))
        a = ease((t - 0.35) / 0.5)
        if a > 0:
            layer = words_layer.copy()
            layer.putalpha(layer.getchannel("A").point(lambda v: round(v * a)))
            im.alpha_composite(layer)
        yield im.convert("RGB")


def crossfade(a, b, n):
    """The last n frames of a over the first n of b."""
    for i in range(n):
        yield Image.blend(a[i], b[i], (i + 1) / (n + 1))


def film(lang):
    w = T[lang]
    # (generator, seconds); the next segment fades in over the last 0.33 s of the one before
    segs = [
        (seg_intro, (4.6,)),
        (seg_phone, ([("journey", 0.6, 6.4)], w["run"], 6.4, (W - PHONE.w) // 2)),
        (seg_phone, ([("journey", 14.2, 5.2)], w["super"], 5.2)),
        (seg_phone, ([("journey", 37.5, 1.1), ("journey", 71.5, 1.1), ("journey", 88.0, 1.1), ("journey", 104.0, 1.1),
                      ("journey", 114.5, 1.1), ("journey", 126.0, 1.1), ("journey", 160.5, 1.2)], w["places"], 7.8)),
        (seg_phone, ([("journey", 61.0, 6.2)], w["dive"], 6.2)),
        (seg_phone, ([("journey", 100.0, 5.4)], w["deep"], 5.4)),
        (seg_phone, ([("journey", 113.2, 5.8)], w["whale"], 5.8)),
        (seg_phone, ([("boss", 2.8, 5.8), ("boss", 11.6, 2.0), ("still", "09_result_win", 1.4)], w["boss"], 9.2)),
        (seg_jinx, (w["jinx"], 5.2)),
        (seg_phone, ([("still", "04f_look_couture", 2.4), ("still", "04h_look_night", 2.2)], w["shop"], 4.6)),
        (seg_end, ((w["tagline"], w["pill"]), 4.0)),
    ]
    out = os.path.join(OUT, "film-%s.mp4" % lang)
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "%dx%d" % (W, H),
                            "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "23",
                            "-maxrate", "1900k", "-bufsize", "3800k", "-pix_fmt", "yuv420p", "-profile:v", "high",
                            "-movflags", "+faststart", out], stdin=subprocess.PIPE)
    X = 10   # crossfade frames
    tail = []
    total = 0
    poster = None
    for si, (gen, args) in enumerate(segs):
        frames = gen(*args)
        head = []
        fading = len(tail) == X   # the segment before held its last X frames back for this fade
        for f in frames:
            if fading:
                head.append(f)
                if len(head) == X:
                    for g in crossfade(tail, head, X):
                        enc.stdin.write(g.tobytes()); total += 1
                    tail, fading = [], False
                continue
            # hold back the last X frames of each segment for the next one's fade
            tail.append(f)
            if len(tail) > X:
                g = tail.pop(0)
                enc.stdin.write(g.tobytes()); total += 1
                if si == 1 and poster is None and total > 4.6 * FPS + 50:
                    poster = g
        print(lang, "segment", si, "done,", total, "frames")
    for g in tail:
        enc.stdin.write(g.tobytes()); total += 1
    enc.stdin.close()
    enc.wait()
    print("wrote", out, "%.1f s" % (total / FPS))
    if poster is not None:
        poster.save(os.path.join(OUT, "film-%s.webp" % lang), "WEBP", quality=88, method=6)


for lang in LANGS:
    film(lang)
