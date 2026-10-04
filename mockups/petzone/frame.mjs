// Puts capture.mjs's screenshots in their frames and writes the site's WebPs:
//
//   node frame.mjs [RAW] [DEST] [desktop-light desktop-dark mobile-light heroes]
//
// RAW: capture.mjs's PNGs ($TMPDIR/petzone-folio/raw). DEST: the site's src/assets/work/petzone (default, beside
// this folder). Desktop shots go in a macOS window (2000 px wide, the light or dark theme's title bar, the app's
// address in its pill); phone shots in an iPhone (2000 px tall, its status bar drawn over the page's own top);
// the heroes put a window and a phone together. Transparent, with a soft shadow, so the page's ground shows.
import { existsSync, mkdirSync, readdirSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { HERE, sharp } from "./app.mjs"

const RAW = process.argv[2] ?? join(tmpdir(), "petzone-folio", "raw")
const DEST = process.argv[3] ?? join(HERE, "../../src/assets/work/petzone")
const URL_TEXT = "petzone-coral.vercel.app"
const WEBP = { quality: 88, alphaQuality: 100, effort: 6, smartSubsample: true }
const FONT = "-apple-system, 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif"

const svg = (w, h, body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">${body}</svg>`)

/** A soft shadow under a rounded rectangle, as a transparent layer the size of the canvas. Blurred at a quarter
 *  of the size and scaled back up (a wide blur at full size is slow), and kept: every window, and every phone,
 *  is the same size. */
const shadows = new Map()
async function shadow(cw, ch, x, y, w, h, r) {
  const key = [cw, ch, x, y, w, h, r].join(",")
  if (!shadows.has(key)) {
    const q = 4
    const layer = async (blur, dy, alpha) => {
      const small = await sharp(svg(Math.round(cw / q), Math.round(ch / q), `<rect x="${x / q}" y="${(y + dy) / q}" width="${w / q}" height="${h / q}" rx="${r / q}" fill="rgba(0,0,0,${alpha})"/>`)).blur(Math.max(0.3, blur / q)).png().toBuffer()
      return sharp(small).resize(cw, ch, { kernel: "cubic" }).png().toBuffer()
    }
    shadows.set(key, [await layer(34, 22, 0.2), await layer(6, 3, 0.1)])
  }
  return shadows.get(key)
}

/** The macOS window: title bar, traffic lights, the address pill; the screenshot under it. 2000 px wide. */
export async function windowed(png, dark = false) {
  const W = 2000, M = 90, BAR = 64, R = 18
  const ww = W - 2 * M
  const shot = await sharp(png).resize(ww).png().toBuffer()
  const { height: sh } = await sharp(shot).metadata()
  const wh = BAR + sh, H = wh + 2 * M
  const bar = dark ? "#202022" : "#f3f3f5", line = dark ? "#2c2c2e" : "#e2e2e6"
  const pill = dark ? "#2d2d30" : "#ffffff", pillLine = dark ? "#38383b" : "#e1e1e5", ink = dark ? "#a8a8ad" : "#5f5f64"
  const lights = [["#ff5f57", "#e0443e"], ["#febc2e", "#dea123"], ["#28c840", "#1aab29"]]
    .map(([f, s], i) => `<circle cx="${30 + i * 25}" cy="32" r="7.5" fill="${f}" stroke="${s}" stroke-width="1"/>`).join("")
  const pw = 440, ph = 36, px = (ww - pw) / 2, py = (BAR - ph) / 2
  const lock = `<g transform="translate(${ww / 2 - 98},${BAR / 2 - 8})" fill="none" stroke="${ink}" stroke-width="1.6"><rect x="0" y="6.5" width="11" height="9" rx="2" fill="${ink}" stroke="none"/><path d="M2.6 6.6V4.4a2.9 2.9 0 0 1 5.8 0v2.2"/></g>`
  const chrome = svg(ww, wh, `
    <defs><clipPath id="c"><rect width="${ww}" height="${wh}" rx="${R}"/></clipPath></defs>
    <g clip-path="url(#c)">
      <rect width="${ww}" height="${BAR}" fill="${bar}"/>
      <rect y="${BAR - 1}" width="${ww}" height="1" fill="${line}"/>
      ${lights}
      <rect x="${px}" y="${py}" width="${pw}" height="${ph}" rx="9" fill="${pill}" stroke="${pillLine}"/>
      ${lock}
      <text x="${ww / 2 + 8}" y="${BAR / 2 + 6}" text-anchor="middle" font-family="${FONT}" font-size="16" fill="${ink}">${URL_TEXT}</text>
    </g>`)
  const mask = svg(ww, wh, `<rect width="${ww}" height="${wh}" rx="${R}" fill="#fff"/>`)
  const win = await sharp({ create: { width: ww, height: wh, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: chrome }, { input: shot, top: BAR, left: 0 }, { input: mask, blend: "dest-in" }])
    .png().toBuffer()
  const edge = svg(ww, wh, `<rect x="0.5" y="0.5" width="${ww - 1}" height="${wh - 1}" rx="${R}" fill="none" stroke="${dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.10)"}"/>`)
  return sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([...(await shadow(W, H, M, M, ww, wh, R)).map((input) => ({ input })), { input: win, left: M, top: M }, { input: edge, left: M, top: M }])
    .png().toBuffer()
}

/** The iPhone: a black body, the Dynamic Island and the status bar over the page's top. 2000 px tall. */
export async function phoned(png) {
  const S = 2.04, M = 110, BEZEL = 22
  const sw = Math.round(393 * S), shotH = Math.round(798 * S), bar = Math.round(54 * S)
  const sh = bar + shotH
  const bw = sw + 2 * BEZEL, bh = sh + 2 * BEZEL
  const W = bw + 2 * M, H = bh + 2 * M
  const shot = await sharp(png).resize(sw, shotH).png().toBuffer()
  // The status bar takes the page's own top colour.
  const { data } = await sharp(shot).extract({ left: 4, top: 2, width: 1, height: 1 }).raw().toBuffer({ resolveWithObject: true })
  const top = `rgb(${data[0]},${data[1]},${data[2]})`
  const lum = (0.2126 * data[0] + 0.7152 * data[1] + 0.0722 * data[2]) / 255
  const ink = lum > 0.5 ? "#111" : "#f5f5f5"
  const status = svg(sw, bar, `
    <rect width="${sw}" height="${bar}" fill="${top}"/>
    <text x="${Math.round(72 * S)}" y="${Math.round(36 * S)}" text-anchor="middle" font-family="${FONT}" font-weight="600" font-size="${Math.round(17 * S)}" fill="${ink}">9:41</text>
    <g fill="${ink}" transform="translate(${Math.round(300 * S)},${Math.round(23 * S)}) scale(${S})">
      <rect x="0" y="7" width="3" height="4" rx="0.8"/><rect x="4.5" y="5" width="3" height="6" rx="0.8"/><rect x="9" y="2.5" width="3" height="8.5" rx="0.8"/><rect x="13.5" y="0" width="3" height="11" rx="0.8"/>
      <path transform="translate(22,0)" d="M7.7 2.3a9.6 9.6 0 0 1 6.6 2.6l1.2-1.3A11.4 11.4 0 0 0 7.7.5 11.4 11.4 0 0 0-.1 3.6l1.2 1.3a9.6 9.6 0 0 1 6.6-2.6zm0 3.6a6 6 0 0 1 4.1 1.6L13 6.2a7.8 7.8 0 0 0-5.3-2.1 7.8 7.8 0 0 0-5.3 2.1l1.2 1.3a6 6 0 0 1 4.1-1.6zm0 3.6a2.4 2.4 0 0 1 1.6.6L7.7 11.9 6.1 10.1a2.4 2.4 0 0 1 1.6-.6z"/>
      <rect x="42" y="0.5" width="22" height="10.5" rx="3" fill="none" stroke="${ink}" stroke-opacity="0.45"/><rect x="44" y="2.5" width="18" height="6.5" rx="1.6"/><rect x="65" y="3.8" width="1.6" height="3.8" rx="0.8" fill-opacity="0.5"/>
    </g>
    <rect x="${(sw - 126 * S) / 2}" y="${11 * S}" width="${126 * S}" height="${37 * S}" rx="${18.5 * S}" fill="#000"/>`)
  const RS = Math.round(55 * S)
  const screen = await sharp({ create: { width: sw, height: sh, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: status, top: 0, left: 0 }, { input: shot, top: bar, left: 0 }, { input: svg(sw, sh, `<rect width="${sw}" height="${sh}" rx="${RS}" fill="#fff"/>`), blend: "dest-in" }])
    .png().toBuffer()
  const RB = RS + BEZEL
  const body = svg(bw, bh, `
    <rect width="${bw}" height="${bh}" rx="${RB}" fill="#0d0d0d"/>
    <rect x="1.5" y="1.5" width="${bw - 3}" height="${bh - 3}" rx="${RB - 1.5}" fill="none" stroke="#3a3a3c" stroke-width="3"/>`)
  return sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([...(await shadow(W, H, M, M, bw, bh, RB)).map((input) => ({ input })), { input: body, left: M, top: M }, { input: screen, left: M + BEZEL, top: M + BEZEL }])
    .png().toBuffer()
}

/** A window and a phone together: the window at the left, the phone over its lower right. 2000 px wide. */
export async function hero(desktopPng, phonePng, dark = false) {
  const win = await sharp(await windowed(desktopPng, dark)).resize(1720).png().toBuffer()
  const phone = await sharp(await phoned(phonePng)).resize(null, 1060).png().toBuffer()
  const { width: ww, height: wh } = await sharp(win).metadata()
  const { width: pw, height: ph } = await sharp(phone).metadata()
  const W = 2000, H = Math.max(wh, ph + 230)
  return sharp({ create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: win, left: 0, top: 0 }, { input: phone, left: W - pw, top: H - ph }])
    .png().toBuffer()
}

async function write(png, path) {
  mkdirSync(join(path, ".."), { recursive: true })
  await sharp(png).webp(WEBP).toFile(path)
  console.log(path)
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const only = new Set(process.argv.slice(4))
  const wanted = (set) => !only.size || only.has(set)
  for (const set of ["desktop-light", "desktop-dark", "mobile-light"].filter(wanted)) {
    const dir = join(RAW, set)
    if (!existsSync(dir)) continue
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".png") && !f.includes(".failed"))) {
      const png = join(dir, file)
      const framed = set.startsWith("mobile") ? await phoned(png) : await windowed(png, set.endsWith("dark"))
      await write(framed, join(DEST, set, file.replace(/\.png$/, ".webp")))
    }
  }
  const has = (p) => wanted("heroes") && existsSync(join(RAW, p))
  if (has("desktop-light/home.png") && has("mobile-light/home.png"))
    await write(await hero(join(RAW, "desktop-light/home.png"), join(RAW, "mobile-light/home.png")), join(DEST, "hero-light.webp"))
  if (has("desktop-dark/register.png") && has("mobile-dark/register.png"))
    await write(await hero(join(RAW, "desktop-dark/register.png"), join(RAW, "mobile-dark/register.png"), true), join(DEST, "hero-dark.webp"))
}
