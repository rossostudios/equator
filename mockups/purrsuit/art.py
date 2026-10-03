"""Shared drawing for Purrsuit's case-study images and film: the phone, backdrops, the game's fonts and its logo."""
import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

GAME = os.environ.get("PURRSUIT_REPO", os.path.expanduser("~/Desktop/Pigeon Panic"))
FONTS = os.path.join(GAME, "Assets/Resources/Fonts")
LILITA = os.path.join(FONTS, "LilitaOne-Regular.ttf")   # the game's UI font (OFL)
TITAN = os.path.join(FONTS, "TitanOne-Regular.ttf")     # its display font, the logo's (OFL)

NAVY = (20, 26, 61)          # the backdrop the props and icons were rendered on
INK = (26, 16, 51)           # the logo's outline
GOLD_TOP, GOLD_BOTTOM = (255, 247, 158), (255, 158, 26)
SCREEN_ASPECT = 1080 / 2340  # an iPhone-shaped screen, as the game's captures are


def font(path, size):
    return ImageFont.truetype(path, size)


def rounded_mask(size, radius, scale=4):
    """An antialiased rounded-rectangle mask (drawn large, then scaled down)."""
    w, h = size
    big = Image.new("L", (w * scale, h * scale), 0)
    ImageDraw.Draw(big).rounded_rectangle([0, 0, w * scale - 1, h * scale - 1], radius * scale, fill=255)
    return big.resize((w, h), Image.LANCZOS)


class Phone:
    """A plain modern phone: a dark body with a thin lit rim, the screen inset with rounded corners and the
    Dynamic Island. Built once per size; screen() puts a picture in it."""

    def __init__(self, height):
        self.b = b = max(6, round(height * 0.0165))
        self.sh = sh = height - 2 * b
        self.sw = sw = round(sh * SCREEN_ASPECT)
        self.w, self.h = w, h = sw + 2 * b, height
        r = round(w * 0.15)
        body = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        outer = rounded_mask((w, h), r)
        body.paste((58, 58, 68, 255), (0, 0), outer)
        inner = rounded_mask((w - 4, h - 4), r - 2)
        body.paste((14, 14, 18, 255), (2, 2), inner)
        self.body = body
        self.mask = rounded_mask((sw, sh), r - b)
        iw, ih = round(sw * 0.31), round(sw * 0.09)
        island = Image.new("RGBA", (iw, ih), (0, 0, 0, 0))
        island.paste((5, 5, 7, 255), (0, 0), rounded_mask((iw, ih), ih // 2))
        self.island, self.island_at = island, (b + (sw - iw) // 2, b + round(sw * 0.03))

    def screen(self, picture):
        """The phone (RGBA) showing picture, which is fitted to the screen."""
        out = self.body.copy()
        pic = picture.convert("RGB")
        if pic.size != (self.sw, self.sh):
            pic = pic.resize((self.sw, self.sh), Image.LANCZOS)
        out.paste(pic, (self.b, self.b), self.mask)
        out.alpha_composite(self.island, self.island_at)
        return out

    def shadow(self, spread=0.035, alpha=110):
        """A soft shadow the size of the phone, padded so the blur has room (paste it at -pad)."""
        pad = round(self.h * spread * 2)
        s = Image.new("RGBA", (self.w + 2 * pad, self.h + 2 * pad), (0, 0, 0, 0))
        s.paste((0, 0, 0, alpha), (pad, pad), rounded_mask((self.w, self.h), round(self.w * 0.15)))
        return s.filter(ImageFilter.GaussianBlur(self.h * spread)), pad


def backdrop(size, base=NAVY, glow=(46, 44, 112), centre=(0.5, 0.45), reach=0.75):
    """The navy the props and icons were rendered on, with a soft light behind the subject."""
    w, h = size
    small = Image.new("RGB", (64, 64), base)
    d = ImageDraw.Draw(small)
    cx, cy = centre[0] * 64, centre[1] * 64
    for i in range(40, 0, -1):
        k = i / 40
        c = tuple(round(base[j] + (glow[j] - base[j]) * (1 - k) ** 1.6) for j in range(3))
        rx, ry = 64 * reach * k, 64 * reach * k * w / h * 0.62
        d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=c)
    return small.filter(ImageFilter.GaussianBlur(3)).resize(size, Image.BICUBIC)


def fit_alpha(im, pad=0):
    """Crops an RGBA render to what it draws (its alpha), plus pad pixels."""
    box = im.getchannel("A").getbbox()
    x0, y0, x1, y1 = box
    return im.crop((max(0, x0 - pad), max(0, y0 - pad), min(im.width, x1 + pad), min(im.height, y1 + pad)))


def gradient_text(text, fnt, top, bottom, stroke, stroke_fill=INK, shadow=0, skew=0.0):
    """Text filled with a vertical gradient, outlined and with a hard drop shadow, slanted: the game's titles (UIFx)."""
    l, t, r, b = fnt.getbbox(text, stroke_width=stroke)
    w, h = r - l + 2 * stroke, b - t + 2 * stroke + shadow
    pad = round(h * abs(skew)) + 4
    canvas = Image.new("RGBA", (w + 2 * pad, h + 4), (0, 0, 0, 0))
    org = (pad - l + stroke, -t + stroke)
    if shadow:
        sh = Image.new("L", canvas.size, 0)
        ImageDraw.Draw(sh).text((org[0], org[1] + shadow), text, font=fnt, fill=255, stroke_width=stroke, stroke_fill=255)
        canvas.paste(stroke_fill + (255,), (0, 0), sh)
    ol = Image.new("L", canvas.size, 0)
    ImageDraw.Draw(ol).text(org, text, font=fnt, fill=255, stroke_width=stroke, stroke_fill=255)
    canvas.paste(stroke_fill + (255,), (0, 0), ol)
    fill = Image.new("L", canvas.size, 0)
    ImageDraw.Draw(fill).text(org, text, font=fnt, fill=255)
    grad = Image.new("RGBA", canvas.size)
    gd = ImageDraw.Draw(grad)
    y0, y1 = org[1] + t, org[1] + b
    for y in range(canvas.height):
        k = min(1, max(0, (y - y0) / max(1, y1 - y0)))
        gd.line([(0, y), (canvas.width, y)], fill=tuple(round(top[i] + (bottom[i] - top[i]) * k) for i in range(3)) + (255,))
    canvas.paste(grad, (0, 0), fill)
    if skew:
        # slant to the right as the game's UIFx does: x' = x + skew * (bottom - y)
        canvas = canvas.transform(canvas.size, Image.AFFINE, (1, skew, -skew * canvas.height, 0, 1, 0), Image.BICUBIC)
    return canvas


def logo(width):
    """PURRSUIT and THE GREAT FISH HEIST, drawn as the game draws them (UIKit.Title on a slanted ribbon)."""
    size = 400
    title = gradient_text("PURRSUIT", font(TITAN, size), GOLD_TOP, GOLD_BOTTOM, stroke=round(size * 0.085),
                          shadow=round(size * 0.085), skew=0.08)
    title = fit_alpha(title)
    rw, rh = round(title.width * 0.6), round(size * 0.36)
    ribbon = Image.new("RGBA", (rw + 60, rh), (0, 0, 0, 0))
    band = Image.new("RGBA", (rw, rh))
    bd = ImageDraw.Draw(band)
    for y in range(rh):
        k = y / rh
        bd.line([(0, y), (rw, y)], fill=(round(33 - 18 * k), round(20 - 12 * k), round(87 - 46 * k), 238))
    band.putalpha(rounded_mask((rw, rh), round(rh * 0.2)))
    ribbon.alpha_composite(band, (30, 0))
    ribbon = ribbon.transform(ribbon.size, Image.AFFINE, (1, 0.2, -0.2 * rh, 0, 1, 0), Image.BICUBIC)
    f = font(LILITA, round(rh * 0.6))
    d = ImageDraw.Draw(ribbon)
    l, t, r, b = d.textbbox((0, 0), "THE GREAT FISH HEIST", font=f)
    d.text(((ribbon.width - (r - l)) / 2 - l, (rh - (b - t)) / 2 - t), "THE GREAT FISH HEIST", font=f, fill=(255, 255, 255, 255))
    out = Image.new("RGBA", (title.width, title.height + round(rh * 1.15)), (0, 0, 0, 0))
    out.alpha_composite(ribbon, ((title.width - ribbon.width) // 2, out.height - rh))
    out.alpha_composite(title, (0, 0))
    k = width / out.width
    return out.resize((width, round(out.height * k)), Image.LANCZOS)


def tame_shadow(im, spread_x=0.8, spread_y=0.16, power=1.6):
    """A shadow-catcher render's floor shadow reaches the frame's edges (big soft lights): keep it as a contact shadow
    that fades out around the feet. Shadow pixels are the pure black ones; the cat is opaque."""
    from PIL import ImageChops
    im = im.convert("RGBA")
    r, g, b, a = im.split()
    solid = a.point(lambda v: 255 if v > 250 else 0)
    box = solid.getbbox()
    if box is None:
        return im
    x0, y0, x1, y1 = box
    dark = ImageChops.lighter(r, ImageChops.lighter(g, b)).point(lambda v: 255 if v <= 4 else 0)
    shadow = ImageChops.multiply(dark, ImageChops.invert(solid))
    rx, ry = max(2, round((x1 - x0) * spread_x)), max(2, round((y1 - y0) * spread_y))
    blob = ImageChops.invert(Image.radial_gradient("L")).resize((2 * rx, 2 * ry), Image.BICUBIC)
    blob = blob.point(lambda v: round(255 * (max(0.0, (v / 255 - 0.29) / 0.71)) ** power))
    fall = Image.new("L", im.size, 0)
    fall.paste(blob, (round((x0 + x1) / 2) - rx, y1 - ry))
    alpha = Image.composite(ImageChops.multiply(a, fall), a, shadow)
    im.putalpha(alpha)
    return im
