/**
 * Spielt ein exportiertes Interaktionsprotokoll gegen die aktuelle Zuordnung
 * nach und zeigt, was sich geändert hat.
 *
 *   bun run scripts/protokoll-nachspielen.ts protokoll-2026-09-03-1045.json
 *
 * Wozu: Das Protokoll hält fest, wie der Prototyp eine Eingabe zum Zeitpunkt
 * des Tests eingeordnet hat. Wird an der Zuordnung gearbeitet, ist die
 * eigentliche Frage nicht, ob die neuen Fälle jetzt gehen, sondern ob die
 * alten noch gehen. Die Testdatei deckt das für ausgewählte Eingaben ab,
 * dieses Skript für einen ganzen echten Testlauf.
 *
 * Klicks auf Schaltflächen werden mitgespielt, nicht bewertet: sie bauen den
 * Gesprächszustand auf, von dem die freien Eingaben abhängen. Ohne sie wäre
 * ein Rückbezug wie "und was kostet das" nicht nachvollziehbar.
 */
import { getNode } from "../src/lib/chat-flow"
import { flyerVon } from "../src/lib/flyer"
import { neuerKontext, verstehe, type Kontext } from "../src/lib/verstehen"

type Eintrag = {
  t: number
  art: "eingabe" | "chip" | "antwort" | "reset"
  text?: string
  treffer?: "hit" | "ambiguous" | "miss"
  knoten?: string
}

const datei = process.argv[2]
if (!datei) {
  console.error(
    "Aufruf: bun run scripts/protokoll-nachspielen.ts <protokoll.json>"
  )
  process.exit(1)
}

const roh = JSON.parse(await Bun.file(datei).text())
const eintraege: Eintrag[] = roh.eintraege ?? roh

let kontext: Kontext = neuerKontext()

function betrete(id: string): void {
  const node = getNode(id)
  if (node.id === "notknoten") {
    console.log(`   ⚠ Knoten "${id}" gibt es nicht mehr`)
    return
  }
  const vorher = kontext
  kontext = {
    knoten: node.id,
    topic: node.topic ?? null,
    chips: node.chips ?? [],
    // Wie use-chat.ts: Ja-Nein-Fragen, Listenfortsetzung und der zuletzt
    // angebotene Flyer gehören zum Zustand.
    istRueckfrage: node.id.startsWith("rueckfrage") || Boolean(node.jaNein),
    angebot: node.angebot ?? [],
    nummern: node.nummern,
    gruppe: node.gruppe ?? null,
    ziel:
      node.ziel ??
      (node.id === "menu" || node.id === "start" ? null : vorher.ziel),
    weiter: node.weiter ?? null,
    nein: node.nein ?? null,
    flyer: flyerVon(node) ?? vorher.flyer ?? null,
  }
}

let gesamt = 0
let jetztTreffer = 0
let vorherTreffer = 0
let verbessert = 0
let verschlechtert = 0

for (const eintrag of eintraege) {
  if (eintrag.art === "reset") {
    kontext = neuerKontext()
    betrete("start")
    continue
  }

  if (eintrag.art === "chip") {
    // Die Beschriftung kann sich seit dem Testlauf geändert haben, das Ziel
    // steht im Protokoll und ist die verlässlichere Angabe.
    betrete(eintrag.knoten ?? "menu")
    continue
  }

  if (eintrag.art !== "eingabe" || !eintrag.text) continue

  gesamt++
  const vorher = eintrag.treffer ?? "miss"
  const ergebnis = verstehe(eintrag.text, kontext)

  if (vorher === "hit") vorherTreffer++
  if (ergebnis.kind === "hit") {
    jetztTreffer++
    betrete(ergebnis.to)
  } else if (
    kontext.chips.length > 0 &&
    /^(bedarf:|vorschlag:|ziel:|flyer|dienst:|zettel:|empfehlung:|fahrplan:|wandern$|familie$)/.test(
      kontext.knoten ?? ""
    )
  ) {
    // Wie use-chat.ts: mitten im Ablauf bleibt der Zustand stehen.
  } else {
    kontext = {
      ...kontext,
      knoten: "rueckfrage",
      istRueckfrage: true,
      chips: ergebnis.kind === "ambiguous" ? [...ergebnis.candidates] : [],
    }
  }

  let marke = " "
  if (vorher !== "hit" && ergebnis.kind === "hit") {
    marke = "+"
    verbessert++
  } else if (vorher === "hit" && ergebnis.kind !== "hit") {
    marke = "-"
    verschlechtert++
  }

  const jetzt =
    ergebnis.kind === "hit"
      ? `${ergebnis.to} (${ergebnis.grund})`
      : ergebnis.kind
  console.log(`${marke} "${eintrag.text}"`)
  console.log(`    ${vorher.padEnd(10)} → ${jetzt}`)
}

console.log(
  `\n${gesamt} freie Eingaben: ${vorherTreffer} zugeordnet im Testlauf, ` +
    `${jetztTreffer} jetzt (${verbessert} besser, ${verschlechtert} schlechter)`
)
if (verschlechtert > 0) process.exit(1)
