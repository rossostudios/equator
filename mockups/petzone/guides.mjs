// Six of the narrated guides from Petzone's help center, for the case study's Help center chapter. They are the
// app's own videos (Petzone's `npm run help-videos`), copied as they are into public/work/petzone/guides:
//
//   node guides.mjs [OUT]
//
//   <id>.mp4      1280 x 800 H.264 with a Spanish voice, its captions in the picture
//   <id>.webp     its poster, from the app's JPEG
//   <id>-es.vtt   the app's own captions track
//   <id>-en.vtt   the same cues in English, set just above the captions in the picture
//
// The English is written here, cue by cue, and a guide whose cues change in the app stops the script until it is
// translated again. Button names are the ones the app's English shows.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

import { HERE, REPO, sharp } from "./app.mjs"

const OUT = process.argv[2] ?? join(HERE, "../../public/work/petzone/guides")
const VIDEOS = join(REPO, "public/help/videos")

const GUIDES = {
  recorrido: [
    "Home shows you the day: sales, orders and payments still to collect",
    "On the left is every part of the store",
    "Point of sale is the register, where you sell",
    "From any screen, F8 opens a quick sale",
    "And ⌘K (or Ctrl+K) finds anything: products, customers, orders",
    "Home brings you back here",
  ],
  vender: [
    "Search for the product by name, or scan its barcode",
    "Or tap it in the list of products",
    "+ and − change the quantity",
    "Cash is already chosen: tap the note you're handed",
    "Petzone works out the change to give back",
    "Tap Charge to record the sale",
    "Done: the sale is recorded and the stock taken off",
    "Send the receipt on WhatsApp, or print it",
    "Next sale (or Enter) gets the register ready for the next customer",
  ],
  pedido: [
    "An order is a sale paid for or handed over later",
    "Choose the customer: the order is in their name",
    "Tap Reserve order instead of Pay now",
    "Choose whether they pick it up or you deliver it",
    "Tap Create order",
    "If they leave a deposit, record it right here",
    "Orders shows every open order",
    "When you start getting it ready, tap Prepare",
    "When it's ready to pick up, Mark ready",
    "With the customer's permission, you can tell them on WhatsApp",
    "When you hand it over, collect the balance",
    "and tap Mark delivered",
    "The order's timeline keeps every step and every payment",
  ],
  existencias: [
    "Inventory shows what's in the store for each product",
    "Tap the On hand number to change it",
    "Type how many units come in, in Adjust by",
    "Choose the reason: it stays in the product's history",
    "Taking some off: a torn bag, for example",
    "Sales and the purchases you receive adjust the stock on their own",
  ],
  recibir: [
    "The deliveries you're expecting are under Receive",
    "Type the number on the supplier's invoice or delivery note",
    "Count what arrived and type how many units of each product",
    "If everything ordered arrived, Receive all fills in the rest",
    "Tap Post receipt",
    "The stock goes up and each product's cost is updated",
  ],
  caja: [
    "Cash drawer: your register's cash through the day",
    "Taking cash out or putting it in outside a sale? Record it here",
    "Expenses paid from the drawer go in Reports › Expenses",
    "At the end of the day, tap Start closing",
    "Petzone shows you how much cash there should be",
    "Count the notes and coins and type the total",
    "If it matches, confirm. If not, explain the difference",
    "Tomorrow the drawer opens on its own with the first cash sale",
  ],
}

/** The cues of a WebVTT file: each one's timing line and its text. */
const cues = (vtt) =>
  vtt
    .replace(/\r/g, "")
    .split(/\n{2,}/)
    .map((block) => block.split("\n").filter(Boolean))
    .filter((lines) => lines.some((l) => l.includes("-->")))
    .map((lines) => {
      const at = lines.findIndex((l) => l.includes("-->"))
      return { timing: lines[at], text: lines.slice(at + 1).join("\n") }
    })

mkdirSync(OUT, { recursive: true })
for (const [id, english] of Object.entries(GUIDES)) {
  const spanish = readFileSync(join(VIDEOS, `${id}.vtt`), "utf8")
  const timed = cues(spanish)
  if (timed.length !== english.length)
    throw new Error(`${id}: the app's captions have ${timed.length} cues and the English ${english.length}. Translate them again.`)
  copyFileSync(join(VIDEOS, `${id}.mp4`), join(OUT, `${id}.mp4`))
  writeFileSync(join(OUT, `${id}-es.vtt`), spanish)
  // The picture already carries the Spanish at about 81 to 87% of its height; the English sits on the line above.
  const lines = timed.map((c, i) => `${i + 1}\n${c.timing} line:72% position:50% align:center\n${english[i]}`)
  writeFileSync(join(OUT, `${id}-en.vtt`), `WEBVTT\n\n${lines.join("\n\n")}\n`)
  await sharp(join(VIDEOS, `${id}.jpg`)).webp({ quality: 82 }).toFile(join(OUT, `${id}.webp`))
  console.log(join(OUT, id), `${timed.length} cues`)
}
