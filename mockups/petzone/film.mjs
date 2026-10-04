// Petzone's film: film.html drawn frame by frame and piped to ffmpeg, one cut per language.
//
//   node film.mjs [RAW] [RENDERS] [OUT] [en es]
//
// RAW: capture.mjs's screenshots (the film's screens in film/, and their -es twins); RENDERS: render_dasha.py's
// (the turntable and the rig). OUT: the site's public/work/petzone. 1600 x 900, 30 fps, silent, H.264, with a
// WebP poster per cut: the system of Petzone's and Purrsuit's earlier films (caption cards, the product over a
// blur of itself, an end card).
import { spawn } from "node:child_process"
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

import { HERE, REPO, chromium, sharp } from "./app.mjs"
import { phoned, windowed } from "./frame.mjs"

const RAW = process.argv[2] ?? join(tmpdir(), "petzone-folio", "raw")
const RENDERS = process.argv[3] ?? join(tmpdir(), "petzone-folio", "renders")
const OUT = process.argv[4] ?? join(HERE, "../../public/work/petzone")
const LANGS = process.argv.slice(5).length ? process.argv.slice(5) : ["en", "es"]
const WORK = join(tmpdir(), "petzone-folio", "film")
const FPS = 30
const url = (p) => pathToFileURL(p).href

const COPY = {
  en: {
    tag: "The till and back office of a pet shop in Itagüí, Colombia.",
    endLine: "One store record, from the counter to the close.",
    endBy: "Designed and built by",
    endFoot: "chrisrosso.dev  ·  Screens show the demo store's sample data.",
    cards: {
      home: { eyebrow: "Home", title: "Every day <em>starts here.</em>", sub: "Today's sales, orders to prepare, balances to collect. Or ask Dasha." },
      register: { eyebrow: "Register", title: "Sell in <em>seconds.</em>", sub: "Scan or search, pick the customer, charge with F2." },
      paid: { eyebrow: "Paid", title: "Charged once, <em>recorded.</em>", sub: "The receipt goes by WhatsApp or on paper." },
      orders: { eyebrow: "Orders", title: "Paid, pending, <em>ready to go.</em>", sub: "Every sale and order in one list, with what's left to collect." },
      products: { eyebrow: "Products", title: "Sizes, lots and <em>stock.</em>", sub: "Each variant with its own code, price, lots and expiry." },
      discounts: { eyebrow: "Discounts", title: "Codes, or <em>automatic.</em>", sub: "Buy X get Y, money off, free delivery." },
      reports: { eyebrow: "Reports", title: "How the month <em>is going.</em>", sub: "Sales, margin, tickets and balances over 30 days." },
      empty: { eyebrow: "Empty pages", title: "Nothing yet? <em>Meet Dasha.</em>", sub: "Every page with nothing in it has a scene of its own." },
      rig: { eyebrow: "In 3D", title: "Rigged, groomed, <em>textured.</em>", sub: "Built in Blender from code, her coat a Substance Designer graph." },
      scenes: { eyebrow: "21 scenes", title: "One for <em>every empty page.</em>", sub: "Each moves when you point at it." },
      phones: { eyebrow: "Anywhere", title: "At the counter, or <em>on a phone.</em>", sub: "Spanish or English, light or dark." },
    },
  },
  es: {
    tag: "La caja y el back office de una tienda de mascotas en Itagüí, Colombia.",
    endLine: "Un solo registro de la tienda, del mostrador al cierre.",
    endBy: "Diseñado y desarrollado por",
    endFoot: "chrisrosso.dev  ·  Las pantallas muestran los datos de ejemplo de la tienda demo.",
    cards: {
      home: { eyebrow: "Inicio", title: "Cada día <em>empieza aquí.</em>", sub: "Las ventas de hoy, los pedidos por preparar, los saldos por cobrar. O pregúntale a Dasha." },
      register: { eyebrow: "Caja", title: "Vende en <em>segundos.</em>", sub: "Escanea o busca, elige el cliente y cobra con F2." },
      paid: { eyebrow: "Cobrado", title: "Se cobra una vez y <em>queda registrado.</em>", sub: "El recibo sale por WhatsApp o en papel." },
      orders: { eyebrow: "Pedidos", title: "Pagado, pendiente, <em>listo.</em>", sub: "Cada venta y pedido en una lista, con lo que falta por cobrar." },
      products: { eyebrow: "Productos", title: "Tamaños, lotes y <em>existencias.</em>", sub: "Cada variante con su referencia, precio, lotes y vencimiento." },
      discounts: { eyebrow: "Descuentos", title: "Con código, o <em>automáticos.</em>", sub: "Compra X lleva Y, dinero de descuento, domicilio gratis." },
      reports: { eyebrow: "Reportes", title: "Cómo <em>va el mes.</em>", sub: "Ventas, margen, tickets y saldos de 30 días." },
      empty: { eyebrow: "Páginas vacías", title: "¿Aún nada? <em>Esta es Dasha.</em>", sub: "Cada página sin datos tiene su propia escena." },
      rig: { eyebrow: "En 3D", title: "Con esqueleto, pelaje y <em>texturas.</em>", sub: "Hecha en Blender con código, su pelaje es un grafo de Substance Designer." },
      scenes: { eyebrow: "21 escenas", title: "Una para <em>cada página vacía.</em>", sub: "Cada una se mueve al pasar el cursor." },
      phones: { eyebrow: "Donde sea", title: "En el mostrador, o <em>en el celular.</em>", sub: "En español o inglés, claro u oscuro." },
    },
  },
}

const SCREENS = { home: "desktop-light/home", "reg-0": "film/reg-0", "reg-1": "film/reg-1", "reg-2": "film/reg-2", "reg-3": "film/reg-3",
  paid: "desktop-light/paid", orders: "desktop-light/orders", order: "desktop-light/order", product: "desktop-light/product",
  variants: "desktop-light/variants", discount: "desktop-light/discount", reports: "desktop-light/reports", "empty-orders": "desktop-light/empty-orders" }

/** A screenshot of the language's own, falling back to English. */
function raw(path, lang) {
  const [set, name] = path.split("/")
  const own = join(RAW, lang === "en" ? set : `${set}-${lang}`, `${name}.png`)
  return existsSync(own) ? own : join(RAW, set, `${name}.png`)
}

async function prepare(lang) {
  const dir = join(WORK, lang)
  mkdirSync(dir, { recursive: true })
  const windows = {}
  for (const [name, path] of Object.entries(SCREENS)) {
    const file = join(dir, `win-${name}.png`)
    if (!existsSync(file)) await sharp(await windowed(raw(path, lang))).png().toFile(file)
    windows[name] = url(file)
  }
  const phones = {}
  for (const [key, path] of [["light", "mobile-light/home"], ["dark", "mobile-dark/register"]]) {
    const file = join(dir, `phone-${key}.png`)
    if (!existsSync(file)) await sharp(await phoned(raw(path, lang))).png().toFile(file)
    phones[key] = url(file)
  }
  // Where Dasha sits on the empty Orders page, measured by capture.mjs.
  const artFile = [join(RAW, lang === "en" ? "film" : `film-${lang}`, "dasha-art.json"), join(RAW, "film", "dasha-art.json")].find(existsSync)
  const dashaArt = JSON.parse(readFileSync(artFile, "utf8"))
  return { windows, phones, dashaArt }
}

async function shared() {
  const dir = join(WORK, "shared")
  mkdirSync(dir, { recursive: true })
  const manifest = JSON.parse(readFileSync(join(REPO, "lib/empty-art.json"), "utf8"))
  const art = (f) => url(join(REPO, "public/empty", f))
  const ids = ["orders", "drafts", "products", "inventory", "customers", "accounts", "checkout", "tickets", "register-day", "reports",
    "discounts", "purchase-orders", "refills", "lots", "plan", "not-found", "all-clear", "staff", "locations", "supplier-history", "portal"]
  const scenes = ids.filter((id) => manifest[id]).map((id) => ({
    tier: manifest[id].tier, frames: manifest[id].frames, still: art(`${id}.webp`), strip: manifest[id].frames ? art(`${id}-motion.webp`) : null,
  }))
  const turntable = readdirSync(join(RENDERS, "turntable")).filter((f) => /^\d{4}\.png$/.test(f)).sort().map((f) => url(join(RENDERS, "turntable", f)))
  // The rig: the controls over clay, the deform bones in a ghost (as boards.mjs draws them).
  const rig = JSON.parse(readFileSync(join(RENDERS, "rig.json"), "utf8"))
  const lines = (items, width) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${rig.width}" height="${rig.height}">${items
    .flatMap((c) => c.segs.filter((s) => s[0][2] > 0 && s[1][2] > 0).map((s) => `<line x1="${s[0][0]}" y1="${s[0][1]}" x2="${s[1][0]}" y2="${s[1][1]}" stroke="${rig.colors[c.kind]}" stroke-width="${width}" stroke-linecap="round"/>`)).join("")}</svg>`)
  const controls = join(dir, "rig-controls.png"), deform = join(dir, "rig-deform.png")
  await sharp(join(RENDERS, "rig_clay.png")).composite([{ input: lines(rig.controls.filter((c) => c.kind !== "Tweak" && c.kind !== "Root"), 2.6) }]).png().toFile(controls)
  await sharp(join(RENDERS, "rig_ghost.png")).composite([{ input: lines(rig.deform, 2.4) }]).png().toFile(deform)
  return {
    font: url(join(REPO, "public/fonts/inter/InterVariable.woff2")),
    mark: url(join(REPO, "public/petzone-mark.svg")),
    equator: url(join(HERE, "../../public/logo.svg")),
    dashaStrip: { still: art("orders.webp"), strip: art("orders-motion.webp"), frames: manifest.orders.frames },
    scenes, turntable, rig: { controls: url(controls), deform: url(deform) },
  }
}

async function cut(lang, base) {
  const config = { ...base, ...(await prepare(lang)), copy: COPY[lang] }
  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 })
  await page.goto(url(join(HERE, "film.html")))
  await page.evaluate((c) => window.__setup(c), config)
  const duration = await page.evaluate(() => window.__duration)
  // The poster: her turned back to face us, beside the name, at the end of the film's first beat.
  const poster = async () => {
    await page.evaluate((t) => window.__render(t), 4.0)
    await sharp(await page.screenshot({ type: "png" })).webp({ quality: 82 }).toFile(join(OUT, `film-${lang}.webp`))
  }
  // FILM_POSTER=1: only the posters, from a cut already encoded.
  if (process.env.FILM_POSTER) {
    await poster()
    await browser.close()
    return
  }
  // FILM_FRAMES=2.4,6,12: those moments as PNGs in the work folder, to check a layout without a whole cut.
  if (process.env.FILM_FRAMES) {
    for (const t of process.env.FILM_FRAMES.split(",").map(Number)) {
      await page.evaluate((x) => window.__render(x), t)
      await page.screenshot({ path: join(WORK, `test-${lang}-${t}.png`) })
    }
    await browser.close()
    return
  }
  mkdirSync(OUT, { recursive: true })
  const mp4 = join(OUT, `film-${lang}.mp4`)
  const ffmpeg = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "mjpeg", "-i", "-",
    "-c:v", "libx264", "-preset", "slow", "-crf", "21", "-pix_fmt", "yuv420p", "-movflags", "+faststart", mp4], { stdio: ["pipe", "inherit", "inherit"] })
  const frames = Math.round(duration * FPS)
  for (let f = 0; f < frames; f++) {
    await page.evaluate((t) => window.__render(t), f / FPS)
    const jpg = await page.screenshot({ type: "jpeg", quality: 93 })
    if (!ffmpeg.stdin.write(jpg)) await new Promise((r) => ffmpeg.stdin.once("drain", r))
    if (f % 150 === 0) console.log(lang, `${(f / FPS).toFixed(1)}s`)
  }
  ffmpeg.stdin.end()
  await new Promise((r, j) => ffmpeg.on("close", (code) => (code ? j(new Error(`ffmpeg ${code}`)) : r())))
  await poster()
  await browser.close()
  console.log(mp4)
}

const base = await shared()
for (const lang of LANGS) await cut(lang, base)
writeFileSync(join(WORK, "done.txt"), new Date().toISOString())
