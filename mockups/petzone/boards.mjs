// The 3D boards on Petzone's case study, from render_dasha.py's renders:
//
//   node boards.mjs [RENDERS] [DEST]
//
// RENDERS: render_dasha.py's OUT. DEST: src/assets/work/petzone. Writes 3d/{poses,turnaround,faces,rig,coat,
// materials,puppy}.webp, each 2400 x 1600 on a warm studio ground (the frame Purrsuit's boards share, so the
// chapter's grid lines up), and the card's cover.
import { existsSync, mkdirSync, readFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { HERE, sharp } from "./app.mjs"

const RENDERS = process.argv[2] ?? join(tmpdir(), "petzone-folio", "renders")
const DEST = process.argv[3] ?? join(HERE, "../../src/assets/work/petzone")
const W = 2400, H = 1600
const WEBP = { quality: 88, alphaQuality: 100, effort: 6, smartSubsample: true }
const FONT = "-apple-system, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif"
const INK = "#6b6258"
const svg = (w, h, body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${body}</svg>`)

/** The studio ground: warm paper, lighter where the subjects stand, a touch darker at the edges. */
const ground = (w, h) =>
  sharp(svg(w, h, `
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf8f3"/><stop offset="1" stop-color="#efe7dc"/></linearGradient>
      <radialGradient id="r" cx="0.5" cy="0.45" r="0.7"><stop offset="0" stop-color="#fffdf9" stop-opacity="0.85"/><stop offset="1" stop-color="#fffdf9" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/><rect width="${w}" height="${h}" fill="url(#r)"/>`)).png().toBuffer()

const fit = async (path, w, h = w) => sharp(path).resize(w, h, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer()
// Boards show at a quarter of their size in the chapter's grid, so their words are set large enough to read there.
const label = (w, text, { color = INK, size = 40 } = {}) =>
  svg(w, 64, `<text x="${w / 2}" y="46" text-anchor="middle" font-family="${FONT}" font-size="${size}" fill="${color}">${text}</text>`)

/** Lays the layers on the ground. A layer may hang over an edge (a render's empty margin), so they are laid on
 *  a wider sheet first and the board is cut out of it. */
async function board(name, layers, w = W, h = H) {
  const out = join(DEST, `${name}.webp`)
  mkdirSync(join(out, ".."), { recursive: true })
  const PAD = 1200
  const sheet = await sharp({ create: { width: w + 2 * PAD, height: h + 2 * PAD, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite(layers.map((l) => ({ ...l, left: Math.round(l.left) + PAD, top: Math.round(l.top) + PAD }))).png().toBuffer()
  const over = await sharp(sheet).extract({ left: PAD, top: PAD, width: w, height: h }).png().toBuffer()
  await sharp(await ground(w, h)).composite([{ input: over }]).flatten({ background: "#f4efe7" }).webp(WEBP).toFile(out)
  console.log(out)
}

/** Where a render's subject is: the box of its pixels at least `min` opaque (200 leaves her soft shadow out). */
async function box(path, min = 200) {
  const { data, info } = await sharp(path).ensureAlpha().extractChannel(3).raw().toBuffer({ resolveWithObject: true })
  let x0 = info.width, y0 = info.height, x1 = -1, y1 = -1
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[y * info.width + x] < min) continue
      if (x < x0) x0 = x
      if (x > x1) x1 = x
      if (y < y0) y0 = y
      if (y > y1) y1 = y
    }
  }
  return { left: x0, top: y0, right: x1 + 1, bottom: y1 + 1, size: info.width }
}

const R = (f) => join(RENDERS, f)
const have = (...fs) => fs.every((f) => existsSync(R(f)))

// ---- six poses, one rig ------------------------------------------------------------------------------
if (have("pose_sit.png", "pose_wave.png", "pose_stand.png", "pose_sleep.png", "pose_peek.png", "pose_bat.png")) {
  const T = 780
  const files = ["pose_sit", "pose_wave", "pose_stand", "pose_peek", "pose_bat", "pose_sleep"]
  const layers = []
  for (const [i, f] of files.entries()) layers.push({ input: await fit(R(f + ".png"), T), left: 20 + (i % 3) * (T + 10), top: 20 + Math.floor(i / 3) * T })
  await board("3d/poses", layers)
}

// ---- the turnaround: one camera orbiting her, so one floor line; each view as wide as she is from there ------
if (have("turn_front.png", "turn_quarter.png", "turn_side.png", "turn_back.png")) {
  const views = ["turn_front", "turn_quarter", "turn_side", "turn_back"]
  const boxes = await Promise.all(views.map((f) => box(R(f + ".png"))))
  const GAP = 44, SIDE = 70, FLOOR = 1220
  const widths = boxes.reduce((n, b) => n + b.right - b.left, 0)
  const s = Math.min((W - 2 * SIDE - 3 * GAP) / widths, 1120 / Math.max(...boxes.map((b) => b.bottom - b.top)))
  const bottom = Math.max(...boxes.map((b) => b.bottom))
  let x = (W - (widths * s + 3 * GAP)) / 2
  const layers = []
  for (const [i, f] of views.entries()) {
    const b = boxes[i]
    layers.push({ input: await fit(R(f + ".png"), Math.round(b.size * s)), left: x - b.left * s, top: FLOOR - bottom * s })
    x += (b.right - b.left) * s + GAP
  }
  await board("3d/turnaround", layers)
}

/** A close-up, its neck dissolving into the ground instead of ending at the frame's edge. */
async function faded(path, size) {
  const tile = await fit(path, size)
  const mask = svg(size, size, `<defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0.62" stop-color="#fff"/><stop offset="0.97" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><rect width="${size}" height="${size}" fill="url(#f)"/>`)
  return sharp(tile).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer()
}

// ---- her faces: the open smile large, the drawings' 'w' and eyes shut beside it ----------------------
if (have("face_smile.png", "face_w.png", "face_sleepy.png")) {
  const B = 1600, S = 780
  await board("3d/faces", [
    { input: await faded(R("face_smile.png"), B), left: -30, top: 10 },
    { input: await faded(R("face_w.png"), S), left: 1600, top: 10 },
    { input: await faded(R("face_sleepy.png"), S), left: 1600, top: 810 },
  ])
}

// ---- the rig: the Rigify controls over clay, and the deform bones inside a ghost, from one camera ------------
if (have("rig_clay.png", "rig_ghost.png", "rig.json")) {
  const rig = JSON.parse(readFileSync(R("rig.json"), "utf8"))
  const C = 1200, k = C / rig.width
  // Drawn at the board's own size, so the lines stay as crisp as Blender's viewport draws them.
  const lines = (items, width) =>
    svg(C, C, items
      .flatMap((c) => c.segs.filter((s) => s[0][2] > 0 && s[1][2] > 0).map((s) =>
        `<line x1="${s[0][0] * k}" y1="${s[0][1] * k}" x2="${s[1][0] * k}" y2="${s[1][1] * k}" stroke="${rig.colors[c.kind]}" stroke-width="${width}" stroke-linecap="round"/>`))
      .join(""))
  // The tweak layer stays hidden, as an animator keeps it until a curve needs nudging; the root's floor ring
  // too, which only reads from above.
  const controls = rig.controls.filter((c) => c.kind !== "Tweak" && c.kind !== "Root")
  const layer = async (render, items, width) => sharp(await sharp(R(render)).resize(C, C).png().toBuffer()).composite([{ input: lines(items, width) }]).png().toBuffer()
  const keys = (pairs) => {
    let x = 0
    const body = pairs.map(([c, t]) => {
      const g = `<circle cx="${x + 15}" cy="32" r="13" fill="${c}"/><text x="${x + 40}" y="46" font-family="${FONT}" font-size="40" fill="${INK}">${t}</text>`
      x += 84 + t.length * 20
      return g
    })
    return { input: svg(x, 64, body.join("")), width: x }
  }
  const TOP = 110
  const left = keys([["#ff5a4f", "IK"], ["#54c76b", "FK"], ["#ffc93a", "spine, head, face, tail"]])
  const right = keys([["#f49722", "deform bones"]])
  await board("3d/rig", [
    { input: await layer("rig_clay.png", controls, 3.2), left: 0, top: TOP },
    { input: await layer("rig_ghost.png", rig.deform, 3), left: C, top: TOP },
    { input: svg(2, 1240, `<rect width="2" height="1240" fill="#e2d8ca"/>`), left: C - 1, top: 180 },
    { input: left.input, left: (C - left.width) / 2, top: TOP + C + 30 },
    { input: right.input, left: C + (C - right.width) / 2, top: TOP + C + 30 },
  ])
}

/** A map or a ball's name, on a pill in the corner of what it names. */
const pill = (text) => {
  const w = 64 + text.length * 21
  return svg(w, 76, `<rect width="${w}" height="76" rx="38" fill="#fffdf9" fill-opacity="0.94"/><text x="${w / 2}" y="51" text-anchor="middle" font-family="${FONT}" font-size="38" fill="#3b342c">${text}</text>`)
}
const rounded = async (input, size, r = 24) =>
  sharp(await sharp(input).resize(size, size).png().toBuffer()).composite([{ input: svg(size, size, `<rect width="${size}" height="${size}" rx="${r}" fill="#fff"/>`), blend: "dest-in" }]).png().toBuffer()

// ---- her coat: the Substance Designer graph's base colour large, its normal and roughness beside it -----------
if (have("maps/coat_basecolor.png", "maps/coat_normal.png", "maps/coat_roughness.png")) {
  const G = 20, B = H - 2 * G, S = (H - 3 * G) / 2
  await board("3d/coat", [
    { input: await rounded(R("maps/coat_basecolor.png"), B), left: G, top: G },
    { input: pill("base colour"), left: G + 32, top: G + B - 108 },
    { input: await rounded(R("maps/coat_normal.png"), S), left: W - G - S, top: G },
    { input: pill("normal"), left: W - G - S + 32, top: G + S - 108 },
    { input: await rounded(R("maps/coat_roughness.png"), S), left: W - G - S, top: 2 * G + S },
    { input: pill("roughness"), left: W - G - S + 32, top: 2 * G + 2 * S - 108 },
  ])
}

// ---- the props' Substance materials, each on a ball in its own colourway ------------------------------
{
  const names = [["linen", "linen"], ["kraft", "kraft paper"], ["cardboard", "cardboard"], ["wood", "wood"],
    ["glaze", "glaze"], ["yarn", "yarn"], ["plastic", "soft plastic"]].filter(([b]) => have(`ball_${b}.png`))
  if (names.length === 7) {
    const T = 640, P = 600, rows = [names.slice(0, 4), names.slice(4)], tops = [30, 790]
    const layers = []
    for (const [r, row] of rows.entries()) {
      for (const [i, [b, name]] of row.entries()) {
        const mid = W / 2 + (i - (row.length - 1) / 2) * P
        layers.push({ input: await fit(R(`ball_${b}.png`), T), left: mid - T / 2, top: tops[r] })
        layers.push({ input: label(T, name), left: mid - T / 2, top: tops[r] + T - 20 })
      }
    }
    await board("3d/materials", layers)
  }
}

// ---- the puppy, sitting beside her ----------------------------------------------------------------------
if (have("duo.png")) await board("3d/puppy", [{ input: await fit(R("duo.png"), W, H), left: 0, top: 0 }])

// ---- the card's cover: the app on a desktop and a phone, Dasha waving in front ---------------------------
if (have("pose_wave.png") && existsSync(join(DEST, "hero-light.webp"))) {
  const hero = await sharp(join(DEST, "hero-light.webp")).png().toBuffer()
  const { width, height } = await sharp(hero).metadata()
  const dasha = await fit(R("pose_wave.png"), 760)
  const out = join(DEST, "cover.webp")
  await sharp(hero).composite([{ input: dasha, left: 0, top: height - 760 }]).webp(WEBP).toFile(out)
  console.log(out, width, height)
}
