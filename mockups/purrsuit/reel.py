"""
Purrsuit's upright cuts with sound, from the same footage as the site's film:
  python3 reel.py <jinx renders dir> <out dir>
- Purrsuit-AppPreview-886x1920.mp4: 16 bars of the game, cut on the bar to its run song (132 BPM, 29.1 s), at the size
  of an App Store app preview for 6.5" and 6.9" iPhones (the game's 1080 x 2340 frames scale to it exactly);
- Purrsuit-Reel-1080x1920.mp4: the same 16 bars on a 9:16 frame (blurred sides), plus two bars of end card with the
  logo and Jinx, for Reels, TikTok and Shorts (32.7 s).
The music is the game's own (tools/audio: synthesis and the MIT/CC0 MuseScore General soundfont).
"""
import os, subprocess, sys
from PIL import Image, ImageDraw, ImageFilter
from art import GAME, LILITA, backdrop, fit_alpha, font, logo, rounded_mask, tame_shadow

R, OUT = sys.argv[1], sys.argv[2]
FILM = os.path.join(GAME, "Captures/film")
SONG = os.path.join(GAME, "Assets/Resources/Audio/music/run.ogg")
FPS = 30
BAR = 4 * 60 / 132          # 1.818 s
os.makedirs(OUT, exist_ok=True)

# (video, start s, bars): every cut lands on a bar line of the song
MONTAGE = [
    ("intro", 0.0, 2),       # the logo drops in, the bar fills
    ("journey", 1.8, 2),     # the docks: a tuna toss, TUNA BONK!
    ("journey", 16.6, 2),    # Shadow Dash
    ("journey", 37.6, 2),    # the Cannery's presses
    ("journey", 61.8, 2),    # off the pier and into the sea
    ("journey", 87.0, 1),    # the Wreck's hull
    ("journey", 101.5, 1),   # the Deep End
    ("journey", 114.4, 2),   # Barnacle Bess's spout
    ("boss", 5.8, 2),        # Big Bruno: POUNCE!, HE'S MAD NOW!
]
assert sum(b for _, _, b in MONTAGE) == 16


def frames(size):
    """The montage's frames at size, cut exactly on the bars (frame counts from bar times, so nothing drifts)."""
    t = 0.0
    for video, t0, bars in MONTAGE:
        n = round((t + bars * BAR) * FPS) - round(t * FPS)
        t += bars * BAR
        p = subprocess.Popen(["ffmpeg", "-v", "error", "-ss", "%.3f" % t0, "-i", os.path.join(FILM, video + ".mp4"),
                              "-t", "%.3f" % (n / FPS + 0.5), "-vf", "fps=%d,scale=%d:%d:flags=lanczos" % (FPS, size[0], size[1]),
                              "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
        last = None
        for _ in range(n):
            raw = p.stdout.read(size[0] * size[1] * 3)
            if len(raw) == size[0] * size[1] * 3:
                last = Image.frombytes("RGB", size, raw)
            yield last
        p.stdout.close()
        p.wait()


def encoder(path, size, seconds, fade):
    return subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "%dx%d" % size,
                             "-r", str(FPS), "-i", "-", "-stream_loop", "-1", "-i", SONG,
                             "-t", "%.3f" % seconds, "-af", "afade=t=out:st=%.3f:d=%.3f" % (seconds - fade, fade),
                             "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-maxrate", "8M", "-bufsize", "16M",
                             "-pix_fmt", "yuv420p", "-profile:v", "high", "-r", str(FPS),
                             "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-ac", "2",
                             "-movflags", "+faststart", "-shortest", path], stdin=subprocess.PIPE)


def end_card(w, h, k):
    """The logo, Jinx and the tagline on the night-violet of the game's credits; k eases it in (0..1)."""
    im = backdrop((w, h), base=(18, 12, 46), glow=(64, 44, 140), centre=(0.5, 0.5), reach=0.9).convert("RGBA")
    lg = logo(round(w * 0.82))
    jinx = fit_alpha(tame_shadow(Image.open(os.path.join(R, "hero.png"))), 4)
    jh = round(h * 0.5)
    jinx = jinx.resize((round(jinx.width * jh / jinx.height), jh), Image.LANCZOS)
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    layer.alpha_composite(jinx, ((w - jinx.width) // 2, round(h * 0.29)))
    layer.alpha_composite(lg, ((w - lg.width) // 2, round(h * 0.09)))
    d = ImageDraw.Draw(layer)
    ft, fp = font(LILITA, round(w * 0.075)), font(LILITA, round(w * 0.045))
    tag, pill = "Follow the fish.", "Coming to iPhone"
    tw = d.textlength(tag, font=ft)
    d.text(((w - tw) / 2, round(h * 0.815)), tag, font=ft, fill=(255, 255, 255, 255))
    pw, ph = round(d.textlength(pill, font=fp) + w * 0.09), round(w * 0.085)
    p = Image.new("RGBA", (pw, ph), (0, 0, 0, 0))
    p.paste((255, 255, 255, 242), (0, 0), rounded_mask((pw, ph), ph // 2))
    ImageDraw.Draw(p).text((round(w * 0.045), round(ph * 0.17)), pill, font=fp, fill=(27, 22, 58, 255))
    layer.alpha_composite(p, ((w - pw) // 2, round(h * 0.89)))
    layer.putalpha(layer.getchannel("A").point(lambda v: round(v * k)))
    im.alpha_composite(layer)
    return im.convert("RGB")


# ---------------------------------------------------------------- the App Store preview: the game alone, 16 bars
size = (886, 1920)
secs = 16 * BAR
enc = encoder(os.path.join(OUT, "Purrsuit-AppPreview-886x1920.mp4"), size, secs, 1.2)
for f in frames(size):
    enc.stdin.write(f.tobytes())
enc.stdin.close()
enc.wait()
print("wrote the App Store preview, %.2f s" % secs)

# ---------------------------------------------------------------- the reel: 9:16 with blurred sides, then the end card
W, H = 1080, 1920
secs = 18 * BAR
enc = encoder(os.path.join(OUT, "Purrsuit-Reel-1080x1920.mp4"), (W, H), secs, 1.6)
for f in frames(size):
    bg = f.resize((54, 117), Image.BILINEAR).filter(ImageFilter.GaussianBlur(3)).resize((W, round(W * 117 / 54)), Image.BICUBIC)
    bg = bg.crop((0, (bg.height - H) // 2, W, (bg.height - H) // 2 + H))
    bg = Image.blend(bg, Image.new("RGB", (W, H), (18, 12, 46)), 0.35)
    bg.paste(f, ((W - size[0]) // 2, 0))
    enc.stdin.write(bg.tobytes())
cards = round(2 * BAR * FPS)
static = [end_card(W, H, 1.0)]
for i in range(cards):
    k = min(1.0, i / (0.5 * FPS))
    im = end_card(W, H, k) if k < 1 else static[0]
    enc.stdin.write(im.tobytes())
enc.stdin.close()
enc.wait()
print("wrote the reel, %.2f s" % secs)
