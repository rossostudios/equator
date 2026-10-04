// The loops on Petzone's case study, each an H.264 MP4 with its WebP poster in public/work/petzone/loops:
//
//   node loops.mjs [RAW] [RENDERS] [OUT]
//
//   turntable.mp4           Dasha turning a full circle, render_dasha.py's 96 frames on the studio ground (wide)
//   scenes.mp4              every empty page's scene on one grid, each playing its hover motion in turn (wide)
//   empty-<page>-{en,es}    an empty page in the app (Orders, Customers, the register, the 404) as the pointer
//                           finds Dasha: her strip plays where capture.mjs found her, at the app's own 2x pixels
import { spawn } from "node:child_process"
import { existsSync, mkdirSync, readdirSync, readFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { HERE, REPO, sharp } from "./app.mjs"

const RAW = process.argv[2] ?? join(tmpdir(), "petzone-folio", "raw")
const RENDERS = process.argv[3] ?? join(tmpdir(), "petzone-folio", "renders")
const OUT = process.argv[4] ?? join(HERE, "../../public/work/petzone/loops")
const FPS = 24
mkdirSync(OUT, { recursive: true })
const svg = (w, h, body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${body}</svg>`)

/** Pipes frames (PNG buffers, from an async generator) into an MP4, and writes the first as its poster. */
async function encode(name, w, h, frames) {
  const mp4 = join(OUT, `${name}.mp4`)
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "png", "-i", "-",
    "-vf", `scale=${w}:${h}:flags=lanczos`, "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4],
    { stdio: ["pipe", "inherit", "inherit"] })
  let first = null
  for await (const frame of frames) {
    first ??= frame
    if (!ff.stdin.write(frame)) await new Promise((r) => ff.stdin.once("drain", r))
  }
  ff.stdin.end()
  await new Promise((r, j) => ff.on("close", (c) => (c ? j(new Error(`ffmpeg ${c}`)) : r())))
  await sharp(first).resize(w, h).webp({ quality: 82 }).toFile(join(OUT, `${name}.webp`))
  console.log(mp4)
}

const ground = (w, h) =>
  sharp(svg(w, h, `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf8f3"/><stop offset="1" stop-color="#efe7dc"/></linearGradient>
    <radialGradient id="r" cx="0.5" cy="0.45" r="0.7"><stop offset="0" stop-color="#fffdf9" stop-opacity="0.85"/><stop offset="1" stop-color="#fffdf9" stop-opacity="0"/></radialGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/><rect width="${w}" height="${h}" fill="url(#r)"/>`)).png().toBuffer()

/** A strip's frames as buffers: the WebP strip is `frames` tiles side by side. */
async function stripFrames(path, frames, size) {
  const { width, height } = await sharp(path).metadata()
  const tw = width / frames
  return Promise.all(Array.from({ length: frames }, (_, i) =>
    sharp(path).extract({ left: Math.round(i * tw), top: 0, width: Math.round(tw), height }).resize(size, size).png().toBuffer()))
}

// ---- turntable --------------------------------------------------------------------------------------
{
  const dir = join(RENDERS, "turntable")
  const files = existsSync(dir) ? readdirSync(dir).filter((f) => /^\d{4}\.png$/.test(f)).sort() : []
  if (files.length) {
    const bg = await ground(1200, 800)
    await encode("turntable", 1200, 800, (async function* () {
      for (const f of files) yield sharp(bg).composite([{ input: join(dir, f) }]).png().toBuffer()
    })())
  }
}

// ---- every scene on one grid, playing in turn --------------------------------------------------------
{
  const manifest = JSON.parse(readFileSync(join(REPO, "lib/empty-art.json"), "utf8"))
  const art = (f) => join(REPO, "public/empty", f)
  const ids = ["orders", "drafts", "products", "inventory", "customers", "accounts", "checkout", "tickets", "register-day", "reports",
    "discounts", "purchase-orders", "refills", "lots", "plan", "not-found", "all-clear", "staff", "locations", "supplier-history", "portal"]
    .filter((id) => manifest[id])
  const W = 2400, C = 7, T = 330, gx = Math.round((W - C * T) / (C + 1)), rows = Math.ceil(ids.length / C), H = rows * T + (rows + 1) * 20
  const tiles = await Promise.all(ids.map(async (id) => {
    const size = manifest[id].tier === "A" ? T : Math.round(T * 0.82)
    return {
      size,
      still: await sharp(art(`${id}.webp`)).resize(size, size).png().toBuffer(),
      frames: manifest[id].frames ? await stripFrames(art(`${id}-motion.webp`), manifest[id].frames, size) : [],
    }
  }))
  const bg = await sharp({ create: { width: W, height: H, channels: 4, background: "#fcfcfb" } }).png().toBuffer()
  const STEP = 0.24, LEAD = 0.5
  const total = Math.ceil((LEAD + ids.length * STEP + 1.0) * FPS)
  await encode("scenes", 1680, Math.round((1680 * H) / W / 2) * 2, (async function* () {
    for (let f = 0; f < total; f++) {
      const layers = tiles.map((t, i) => {
        const k = f - Math.round((LEAD + i * STEP) * FPS)
        const input = k >= 0 && k < t.frames.length ? t.frames[k] : t.still
        return { input, left: gx + (i % C) * (T + gx) + Math.round((T - t.size) / 2), top: 20 + Math.floor(i / C) * (T + 20) + (T - t.size) }
      })
      yield sharp(bg).composite(layers).png().toBuffer()
    }
  })())
}

// ---- the empty pages in the app, the pointer on Dasha --------------------------------------------------
// Each crop, in the page's CSS pixels: how wide, and how far above her it starts. Orders and Customers start under
// their panel's top edge; the register's product pane is narrower than 760, and its search field sits just above her.
const CROPS = { orders: { width: 760, above: 60 }, customers: { width: 760, above: 60 }, register: { width: 736, above: 52 }, 404: { width: 760, above: 70 } }
for (const page of ["orders", "customers", "register", "404"]) {
  for (const lang of ["en", "es"]) {
    const dir = join(RAW, lang === "en" ? "desktop-light" : "desktop-light-es")
    const shot = join(dir, `empty-${page}.png`), meta = join(dir, `empty-${page}.art.json`)
    if (!existsSync(shot) || !existsSync(meta)) continue
    const box = JSON.parse(readFileSync(meta, "utf8"))
    const manifest = JSON.parse(readFileSync(join(REPO, "lib/empty-art.json"), "utf8"))[box.scene]
    const k = box.scale
    // A crop of the page round her: the scene, its title, its sentence and its buttons, at the loop's 760 x 560.
    const { width, above } = CROPS[page]
    const cw = width * k, ch = Math.round((width * 560) / 760) * k
    const cx = Math.round((box.x + box.width / 2) * k - cw / 2), cy = Math.round(box.y * k - above * k)
    const crop = await sharp(shot).extract({ left: Math.max(0, cx), top: Math.max(0, cy), width: cw, height: ch }).png().toBuffer()
    const size = Math.round(box.width * k)
    const at = { left: Math.round(box.x * k) - Math.max(0, cx), top: Math.round(box.y * k) - Math.max(0, cy) }
    const frames = await stripFrames(join(REPO, "public/empty", `${box.scene}-motion.webp`), manifest.frames, size)
    // The page's own still where she sits: its ground behind the strip's transparent pixels.
    const plate = await sharp(crop).extract({ left: at.left, top: at.top, width: size, height: size }).png().toBuffer()
    // The panel she sits on, from her own top corner (her scene is transparent there).
    const pageBg = await sharp(crop).extract({ left: at.left + 3, top: at.top + 3, width: 1, height: 1 }).resize(size, size).png().toBuffer()
    const hold = (s) => Math.round(s * FPS)
    const order = [...Array(hold(0.9)).fill(-1), ...frames.map((_, i) => i), ...Array(hold(1.3)).fill(-1)]
    await encode(`empty-${page}-${lang}`, 760, 560, (async function* () {
      for (const i of order) {
        yield sharp(crop).composite(i < 0 ? [{ input: plate, ...at }] : [{ input: pageBg, ...at }, { input: frames[i], ...at }]).png().toBuffer()
      }
    })())
  }
}
