// Every screen on Petzone's case study, captured from a demo server (app.mjs) as PNGs at twice the size they
// are shown: desktop 1440 x 900 and an iPhone's 393 x 798 page (its status bar is drawn) at 3x. frame.mjs puts them in their windows and phones.
//
//   node capture.mjs [RAW] [only…]     RAW defaults to $TMPDIR/petzone-folio/raw; "only" filters shot names
//
// The sample shop (the showcase store) for most of it, an empty store for the setup cards and Dasha's empty
// pages. English only: the site captions the screens in both languages.
import { mkdirSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { chromium, open, settle } from "./app.mjs"

const RAW = process.argv[2] && !process.argv[2].startsWith("-") ? process.argv[2] : join(tmpdir(), "petzone-folio", "raw")
const ONLY = new Set(process.argv.slice(3))
// The film is cut in both languages, so its screens are captured in Spanish too: PETZONE_LANG=es.
const LANG = process.env.PETZONE_LANG ?? "en"
const wanted = (name) => !ONLY.size || ONLY.has(name) || [...ONLY].some((o) => name.startsWith(o))

const rail = (page, name) => page.locator("nav, aside").getByRole("button", { name: new RegExp(`^(${name})`) }).first()
async function go(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded" })
  await settle(page, 1800)
}
async function to(page, ...names) {
  for (const n of names) {
    await rail(page, n).click()
    await settle(page, 900)
  }
}
// Product names are translated in Spanish, so the searches are words both languages share.
const SPANISH = { "Pro Plan adult small": "Pro Plan", "Chunky adult": "Chunky", "Taste of the Wild": "Taste of the Wild" }
async function ringUp(page, items = ["Pro Plan adult small", "Chunky adult", "Taste of the Wild"], customer = true, code = false) {
  await go(page, "/dashboard?mode=pos")
  for (const query of items) {
    const q = LANG === "es" ? (SPANISH[query] ?? query) : query
    await page.getByPlaceholder(/Scan or search|Escanea o busca/).first().fill(q)
    await page.waitForTimeout(500)
    await page.keyboard.press("Enter")
    await page.waitForTimeout(700)
  }
  await page.getByPlaceholder(/Scan or search|Escanea o busca/).first().fill("")
  if (customer) {
    await page.getByRole("button", { name: /Camila Zapata/ }).first().click()
    await page.waitForTimeout(600)
  }
  if (code) {
    // The neighbourhood's code, one of the showcase store's discounts, taken off before charging.
    await page.locator("summary").filter({ hasText: /discount|descuento/i }).first().click()
    await page.getByPlaceholder(/AMIGOS10/).first().fill("VECINOS5000")
    await page.keyboard.press("Enter")
    await page.waitForTimeout(800)
    await page.keyboard.press("Tab")
  }
  // Let the "added · Undo" line fade.
  await page.waitForTimeout(4500)
}

/** [name, set, options for open(), what to do before the picture] */
const SHOTS = [
  // ---- desktop, light ------------------------------------------------------------------------------------
  ["home", "desktop-light", {}, (p) => go(p, "/dashboard")],
  ["home-setup", "desktop-light", { store: "new" }, (p) => go(p, "/dashboard")],
  ["dasha", "desktop-light", {}, async (p) => {
    await go(p, "/dashboard?section=ventas")
    await p.getByRole("button", { name: /Open Dasha|Abrir Dasha|Open Sidekick|Abrir Sidekick/ }).first().click()
    await settle(p, 1200)
  }],
  ["register", "desktop-light", {}, (p) => ringUp(p, undefined, true, true)],
  ["paid", "desktop-light", {}, async (p) => {
    await ringUp(p, undefined, true, true)
    await p.keyboard.press("F2")
    await settle(p, 2000)
  }],
  ["todays-tickets", "desktop-light", {}, async (p) => { await go(p, "/dashboard?mode=pos"); await to(p, "Today's tickets|Tickets de hoy") }],
  ["cash-drawer", "desktop-light", {}, async (p) => { await go(p, "/dashboard?mode=pos"); await to(p, "Cash drawer|Jornada de caja") }],
  ["variant-picker", "desktop-light", {}, async (p) => {
    await go(p, "/dashboard?mode=pos")
    await p.getByPlaceholder(/Scan or search|Escanea o busca/).first().fill("Agility Gold cats")
    await p.waitForTimeout(500)
    await p.keyboard.press("Enter")
    await settle(p, 900)
  }],
  ["orders", "desktop-light", {}, (p) => go(p, "/dashboard?section=ventas")],
  ["order", "desktop-light", {}, async (p) => {
    await go(p, "/dashboard?section=ventas")
    await p.getByRole("button", { name: /^PED-\d+$/ }).first().click()
    await settle(p, 1500)
  }],
  ["customers", "desktop-light", {}, async (p) => { await go(p, "/dashboard"); await to(p, "Customers|Clientes") }],
  ["customer", "desktop-light", {}, async (p) => {
    await go(p, "/dashboard"); await to(p, "Customers|Clientes")
    await p.getByText(/^Camila Zapata$/).first().click()
    await settle(p, 1500)
  }],
  ["refills", "desktop-light", {}, async (p) => { await go(p, "/dashboard"); await to(p, "Customers|Clientes", "Refills|Recompras") }],
  ["products", "desktop-light", {}, async (p) => { await go(p, "/dashboard"); await to(p, "Products|Productos") }],
  ["product", "desktop-light", {}, async (p) => {
    await go(p, "/dashboard?product=INV-0010")
  }],
  ["variants", "desktop-light", {}, async (p) => {
    await go(p, "/dashboard?product=INV-0012")
    await p.getByText(/^(Variants|Variantes)$/).first().scrollIntoViewIfNeeded().catch(() => {})
    await p.waitForTimeout(500)
  }],
  ["new-product", "desktop-light", {}, async (p) => {
    await go(p, "/dashboard"); await to(p, "Products|Productos")
    await p.getByRole("button", { name: /^(New product|Nuevo producto)$/ }).first().click()
    await settle(p, 1500)
  }],
  ["inventory", "desktop-light", {}, async (p) => { await go(p, "/dashboard"); await to(p, "Products|Productos", "Inventory|Inventario") }],
  ["discounts", "desktop-light", {}, async (p) => { await go(p, "/dashboard"); await to(p, "Discounts|Descuentos") }],
  ["discount", "desktop-light", {}, async (p) => {
    await go(p, "/dashboard"); await to(p, "Discounts|Descuentos")
    await p.getByRole("button", { name: /^(Create discount|Crear descuento)/ }).first().click()
    await p.getByRole("button", { name: /^(Buy X get Y|Compra X)/ }).first().click()
    await settle(p, 1500)
  }],
  ["reports", "desktop-light", {}, async (p) => { await go(p, "/dashboard"); await to(p, "Reports|Reportes"); await settle(p, 2500) }],
  ["purchasing", "desktop-light", {}, async (p) => { await go(p, "/dashboard"); await to(p, "Products|Productos", "Purchase orders|Órdenes de compra") }],
  ["purchase-order", "desktop-light", {}, async (p) => {
    // The record opens from its address, as a shared link would.
    await go(p, "/dashboard?section=compras&po=OC-0076")
    await settle(p, 1200)
  }],
  ["cash", "desktop-light", {}, async (p) => { await go(p, "/dashboard"); await to(p, "Payments|Pagos") }],
  ["settings", "desktop-light", {}, async (p) => {
    await go(p, "/dashboard")
    await p.getByRole("button", { name: /^(Account:|Cuenta de)/ }).first().click()
    await p.getByRole("menuitem", { name: /^(Settings|Ajustes)/ }).first().click()
    await settle(p, 1500)
  }],
  // ---- Dasha's empty pages, in an empty store ------------------------------------------------------------
  ["empty-orders", "desktop-light", { store: "new" }, (p) => go(p, "/dashboard?section=ventas")],
  ["empty-customers", "desktop-light", { store: "new" }, async (p) => { await go(p, "/dashboard"); await to(p, "Customers|Clientes") }],
  ["empty-register", "desktop-light", { store: "new" }, (p) => go(p, "/dashboard?mode=pos")],
  ["empty-404", "desktop-light", { store: "new" }, async (p) => { await p.goto("/nope"); await settle(p, 1500) }],
  // ---- the film's register, filling item by item ------------------------------------------------------
  ["reg-0", "film", {}, (p) => go(p, "/dashboard?mode=pos")],
  ["reg-1", "film", {}, (p) => ringUp(p, ["Pro Plan adult small"], false)],
  ["reg-2", "film", {}, (p) => ringUp(p, ["Pro Plan adult small", "Chunky adult"], false)],
  ["reg-3", "film", {}, (p) => ringUp(p, undefined, true, true)],
  ["dasha-art", "film", { store: "new" }, async (p) => {
    await go(p, "/dashboard?section=ventas")
    // Where her scene sits, so the film can play its strip in place.
    const box = await p.locator('[data-slot="dasha-art"]').filter({ visible: true }).first().boundingBox()
    const { writeFileSync } = await import("node:fs")
    writeFileSync(join(RAW, "film" + (LANG === "en" ? "" : "-" + LANG), "dasha-art.json"), JSON.stringify(box))
  }],
  // ---- desktop, dark --------------------------------------------------------------------------------------
  ["home", "desktop-dark", { theme: "dark" }, (p) => go(p, "/dashboard")],
  ["register", "desktop-dark", { theme: "dark" }, (p) => ringUp(p, undefined, true, true)],
  ["orders", "desktop-dark", { theme: "dark" }, (p) => go(p, "/dashboard?section=ventas")],
  ["product", "desktop-dark", { theme: "dark" }, async (p) => {
    await go(p, "/dashboard?product=INV-0010")
  }],
  ["customer", "desktop-dark", { theme: "dark" }, async (p) => {
    await go(p, "/dashboard"); await to(p, "Customers|Clientes")
    await p.getByText(/^Camila Zapata$/).first().click()
    await settle(p, 1500)
  }],
  ["reports", "desktop-dark", { theme: "dark" }, async (p) => { await go(p, "/dashboard"); await to(p, "Reports|Reportes"); await settle(p, 2500) }],
  ["variant-picker", "desktop-dark", { theme: "dark" }, async (p) => {
    await go(p, "/dashboard?mode=pos")
    await p.getByPlaceholder(/Scan or search|Escanea o busca/).first().fill("Agility Gold cats")
    await p.waitForTimeout(500)
    await p.keyboard.press("Enter")
    await settle(p, 900)
  }],
  // The dark hero's phone.
  ["register", "mobile-dark", { phone: true, width: 393, height: 798, scale: 3, theme: "dark" }, (p) => ringUp(p)],
  // ---- a phone ------------------------------------------------------------------------------------------
  ...[
    ["home", (p) => go(p, "/dashboard")],
    ["menu", async (p) => {
      await go(p, "/dashboard")
      await p.getByRole("button", { name: /Open navigation|Abrir navegación/ }).click()
      await settle(p, 900)
    }],
    ["register", (p) => ringUp(p)],
    ["orders", (p) => go(p, "/dashboard?section=ventas")],
    ["customer", async (p) => {
      await go(p, "/dashboard?section=clientes")
      await p.getByText(/^Camila Zapata$/).first().click()
      await settle(p, 1500)
    }],
    ["product", async (p) => {
      await go(p, "/dashboard?product=INV-0010")
    }],
    ["variants", async (p) => {
      await go(p, "/dashboard?product=INV-0012")
      await p.getByText(/^(Variants|Variantes)$/).first().scrollIntoViewIfNeeded().catch(() => {})
      await p.waitForTimeout(500)
    }],
    ["variant-picker", async (p) => {
      await go(p, "/dashboard?mode=pos")
      await p.getByPlaceholder(/Scan or search|Escanea o busca/).first().fill("Agility Gold cats")
      await p.waitForTimeout(500)
      await p.keyboard.press("Enter")
      await settle(p, 900)
    }],
    ["discounts", async (p) => { await go(p, "/dashboard?section=descuentos") }],
    ["empty-orders", (p) => go(p, "/dashboard?section=ventas"), { store: "new" }],
  ].map(([name, fn, extra]) => [name, "mobile-light", { phone: true, width: 393, height: 798, scale: 3, ...(extra ?? {}) }, fn]),
]

const browser = await chromium.launch()
let failed = 0
for (const [name, set, options, before] of SHOTS) {
  const id = `${set}/${name}`
  if (!wanted(id) && !wanted(name)) continue
  const dir = join(RAW, LANG === "en" ? set : `${set}-${LANG}`)
  mkdirSync(dir, { recursive: true })
  const context = await open(browser, { lang: LANG, ...options })
  const page = await context.newPage()
  try {
    await before(page)
    await page.screenshot({ path: join(dir, `${name}.png`) })
    // Where Dasha's scene sits on an empty page, so loops.mjs can play its strip in place.
    if (name.startsWith("empty-")) {
      const art = page.locator('[data-slot="dasha-art"]').filter({ visible: true }).first()
      const box = (await art.count()) ? await art.boundingBox() : null
      const id = box ? await art.evaluate((n) => n.querySelector("img")?.getAttribute("src")?.match(/empty\/([\w-]+)\.webp/)?.[1]) : null
      if (box) writeFileSync(join(dir, `${name}.art.json`), JSON.stringify({ ...box, scene: id, scale: options.scale ?? 2 }))
    }
    console.log("captured", id)
  } catch (error) {
    failed++
    console.error("FAILED", id, String(error).split("\n")[0])
    await page.screenshot({ path: join(dir, `${name}.failed.png`) }).catch(() => {})
  }
  await context.close()
}
await browser.close()
process.exit(failed ? 1 : 0)
