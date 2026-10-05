// Shared browser setup for Petzone's case-study captures: a demo server (never production), the showcase store
// loaded once and kept, a fixed clock, English or Spanish, light or dark. capture.mjs and footage.mjs use it.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

export const HERE = dirname(fileURLToPath(import.meta.url))
export const REPO = process.env.PETZONE_REPO ?? join(process.env.HOME, "Documents/Petzone")
// The demo server: `npm run dev:demo` in the Petzone repo (it blanks Supabase, so data lives in the browser).
export const BASE = process.env.PETZONE_URL ?? "http://localhost:3101"
// Saturday 3 October 2026, 14:31 in Bogotá: the day the showcase is built for, and every screen's clock.
export const NOW = new Date(process.env.PETZONE_NOW ?? "2026-10-03T19:31:00Z")
export const LOGIN = { email: "demo@petzone.local", password: "demo@petzone.local" }

const require = createRequire(join(REPO, "package.json"))
export const { chromium } = require("@playwright/test")
export const sharp = require("sharp")

const STATE = join(HERE, ".state")
mkdirSync(STATE, { recursive: true })

/** A browser context signed in to the demo, in a language and theme, its clock fixed at NOW. store: "showcase"
 *  (the sample shop, built once and kept in .state) or "new" (an empty store, for the setup cards and empty pages). */
export async function open(browser, { lang = "en", theme = "light", store = "showcase", width = 1440, height = 900, scale = 2, phone = false, hideDemo = true } = {}) {
  const locale = lang === "en" ? "en-US" : "es-CO"
  const context = await browser.newContext({
    baseURL: BASE,
    viewport: { width, height },
    deviceScaleFactor: scale,
    isMobile: phone,
    hasTouch: phone,
    colorScheme: theme,
    locale,
    timezoneId: "America/Bogota",
    reducedMotion: "no-preference",
  })
  await context.clock.install({ time: NOW })
  const host = new URL(BASE).hostname
  await context.addCookies([{ name: "petzone_locale", value: locale, domain: host, path: "/" }])
  const saved = store === "showcase" ? await showcase(browser, lang) : null
  // What only the demo shows (its banners, its scenario menu) never reaches a picture: the app marks it
  // data-demo-only. The showcase builder keeps it, since it opens the scenario menu itself.
  if (hideDemo)
    await context.addInitScript(() => {
      const hide = () => {
        if (document.getElementById("pz-capture-demo")) return
        const style = document.createElement("style")
        style.id = "pz-capture-demo"
        style.textContent = "[data-demo-only] { display: none !important; }"
        document.head.appendChild(style)
      }
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", hide)
      else hide()
    })
  await context.addInitScript(
    ([locale, theme, saved]) => {
      try {
        if (!sessionStorage.getItem("pz-capture-seeded")) {
          sessionStorage.setItem("pz-capture-seeded", "1")
          localStorage.clear()
          if (saved) for (const [k, v] of Object.entries(saved)) localStorage.setItem(k, v)
        }
        localStorage.setItem("petzone:locale", locale)
        localStorage.setItem("theme", theme)
        // Onboarding tips would cover the screens.
        localStorage.setItem("petzone:onboarding:dismissed", "1")
      } catch {}
    },
    [locale, theme, saved]
  )
  const login = await context.request.post("/api/dev-session", { data: LOGIN })
  if (!login.ok()) throw new Error(`demo login failed (${login.status()}): is ${BASE} a dev:demo server?`)
  return context
}

/** The showcase store's localStorage, built once per language through the app's own "Demo scenarios" menu
 *  (Reports, then Showcase store) and kept in .state/showcase-<lang>.json. */
async function showcase(browser, lang) {
  const file = join(STATE, `showcase-${lang}.json`)
  if (existsSync(file)) return JSON.parse(readFileSync(file, "utf8"))
  const context = await open(browser, { lang, store: "new", hideDemo: false })
  const page = await context.newPage()
  await page.goto("/dashboard?section=reportes", { waitUntil: "domcontentloaded" })
  await page.getByRole("button", { name: /Escenarios demo|Demo scenarios/ }).click({ timeout: 120_000 })
  await page.getByRole("menuitem", { name: /Tienda de muestra|Showcase store/ }).click()
  await page.getByRole("alertdialog").getByRole("button", { name: /Cargar|Load/ }).click()
  await page.waitForLoadState("domcontentloaded")
  await page.waitForTimeout(3000)
  const saved = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map((k) => [k, localStorage.getItem(k)])))
  writeFileSync(file, JSON.stringify(saved))
  await context.close()
  return saved
}

/** Waits for the page to settle: fonts, images and the app's skeletons gone (the sign-in check and a
 *  page still loading are aria-busy). */
export async function settle(page, ms = 900) {
  await page.waitForLoadState("domcontentloaded")
  // Images in view (lazy ones further down never load until scrolled to), bounded from here: page timers
  // run on the installed clock.
  const loaded = page.evaluate(async () => {
    await document.fonts.ready
    const inView = [...document.images].filter((i) => {
      const r = i.getBoundingClientRect()
      return r.bottom > 0 && r.top < innerHeight && r.width > 0
    })
    await Promise.all(inView.map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r }))))
    await Promise.all(inView.map((i) => i.decode().catch(() => null)))
  })
  await Promise.race([loaded, page.waitForTimeout(8000)])
  await page.waitForFunction(() => !document.querySelector('[data-slot="skeleton"], [data-slot="page-skeleton"], [aria-busy="true"]'), null, { timeout: 60_000 }).catch(() => {})
  await page.waitForTimeout(ms)
}
