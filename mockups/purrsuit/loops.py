"""
Purrsuit's loops for the case study: a few silent seconds of the game moving, cut from its own footage (the
FilmShots editor tool, Captures/film), plus the Blender turntable of Jinx on the 3D chapter's navy.
  python3 loops.py <jinx renders dir>
Writes public/work/purrsuit/loops/<name>.mp4 (H.264) and <name>.webp (the poster, its first frame).
"""
import os, subprocess, sys
from PIL import Image
from art import GAME, backdrop, tame_shadow

R = sys.argv[1]
SITE = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(SITE, "public/work/purrsuit/loops")
FILM = os.path.join(GAME, "Captures/film")
os.makedirs(OUT, exist_ok=True)

# name: (video, start s, seconds)
CLIPS = {
    # the run (the campaign's moves; the docks are the same place in both modes)
    "tuna": ("journey", 1.8, 4.5),      # a low tuna thrown across the lanes: jump it, or land on it (TUNA BONK!)
    "crates": ("journey", 9.0, 4.0),    # a row of fish crates pounced in one bounce: CRATE CHAIN
    "super": ("journey", 16.6, 4.0),    # Jinx's super, Shadow Dash
    "boss": ("boss", 3.0, 6.4),         # BIG BRUNO!, a jump, a pounce, HE'S MAD NOW!
    # the endless journey
    "presses": ("journey", 36.5, 5.5),  # the Cannery's presses on the beat: red dodge, amber roll, green go
    "dive": ("journey", 61.0, 6.0),     # off the pier, the fishbowl, into the Kelp Shallows
    "hull": ("journey", 85.8, 4.5),     # the Wreck: a wall-run along the hull
    "spout": ("journey", 113.2, 5.8),   # Barnacle Bess's spout up to the rooftops
}
W, H = 462, 1000   # the phone's shape, drawn four to a row on the page


def encode(args, out):
    subprocess.run(["ffmpeg", "-v", "error", "-y"] + args + ["-c:v", "libx264", "-preset", "slow", "-crf", "27",
                    "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart", "-an", out], check=True)


for name, (video, t0, dur) in CLIPS.items():
    out = os.path.join(OUT, name + ".mp4")
    encode(["-ss", str(t0), "-t", str(dur), "-i", os.path.join(FILM, video + ".mp4"),
            "-vf", "fps=30,scale=%d:%d:flags=lanczos" % (W, H)], out)
    first = os.path.join(R, "_%s_first.png" % name)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", out, "-frames:v", "1", first], check=True)
    Image.open(first).save(os.path.join(OUT, name + ".webp"), "WEBP", quality=85, method=6)
    print("wrote", out)

# Jinx on the turntable, one turn at 24 fps, wide (3:2) like the 3D chapter's boards
frames = sorted(f for f in os.listdir(os.path.join(R, "turn")) if f.endswith(".png"))
tw, th = 1200, 800
bg = backdrop((tw, th), centre=(0.5, 0.5), reach=0.85).convert("RGBA")
tmp = os.path.join(R, "turn_composed")
os.makedirs(tmp, exist_ok=True)
k = 620 / 800          # the cat is 800 px tall in a 1080 x 1350 frame (rows 279-1079): 620 px here
for i, f in enumerate(frames):
    im = tame_shadow(Image.open(os.path.join(R, "turn", f)))
    im = im.resize((round(im.width * k), round(im.height * k)), Image.LANCZOS)
    b = bg.copy()
    b.alpha_composite(im, (tw // 2 - im.width // 2, 735 - round(1079 * k)))
    b.convert("RGB").save(os.path.join(tmp, "%04d.png" % i))
out = os.path.join(OUT, "turntable.mp4")
encode(["-framerate", "24", "-i", os.path.join(tmp, "%04d.png")], out)
Image.open(os.path.join(tmp, "0000.png")).save(os.path.join(OUT, "turntable.webp"), "WEBP", quality=85)
print("wrote", out, len(frames), "frames")
