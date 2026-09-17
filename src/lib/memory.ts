import { TOPICS, waehleVariante, type FlowNode } from "@/lib/chat-flow"
import { type Sprache } from "@/lib/sprache"

/**
 * Gesprächsgedächtnis.
 *
 * Dass ein Modell sich auf Vorheriges bezieht, ist eines der Merkmale, an
 * denen eine Testperson es erkennt. Zwei Wirkungen reichen dafür: ein
 * gelegentlicher Rückbezug auf ein früher besuchtes Thema, und eine kürzere
 * Antwort, wenn dieselbe Frage ein zweites Mal kommt.
 */

type Besuch = { id: string; topic?: string }

export type Verlauf = {
  /** Besuchte Knoten in der Reihenfolge des Gesprächs. */
  besuche: Besuch[]
  /** Länge der Historie beim letzten Rückbezug. */
  letzterRueckbezug: number
}

export function neuerVerlauf(): Verlauf {
  return { besuche: [], letzterRueckbezug: Number.NEGATIVE_INFINITY }
}

/** Schreibt den Knoten in die Historie. */
export function merken(verlauf: Verlauf, node: FlowNode): void {
  verlauf.besuche.push({ id: node.id, topic: node.topic })
}

/** Wurde dieser Knoten in diesem Gespräch schon einmal gezeigt? */
export function istWiederholung(verlauf: Verlauf, node: FlowNode): boolean {
  return verlauf.besuche.some((besuch) => besuch.id === node.id)
}

const RUECKBEZUEGE = [
  "Du hattest vorhin nach {thema} gefragt, dazu passt das hier gut.",
  "Nach {thema} hattest du ja schon gefragt, das ergänzt sich gut.",
  "Das schließt an {thema} an, wonach du vorhin gefragt hattest.",
  "Vorhin ging es dir um {thema}, jetzt schauen wir hier weiter.",
] as const

const RUECKBEZUEGE_EN = [
  "You asked about {thema} earlier, this goes well with it.",
  "You had already asked about {thema}, and this adds to it.",
  "This follows on from {thema}, which you asked about earlier.",
  "Earlier you were after {thema}, so let us carry on from here.",
] as const

/** Mindestabstand zwischen zwei Rückbezügen, in Antworten. */
const ABSTAND = 3

/**
 * Zieht einen Rückbezug auf ein früheres Thema, oder null.
 *
 * Vermerkt den Bezug zugleich im Verlauf, damit der Mindestabstand greift.
 * Höchstens jede dritte Antwort, und auch dann nicht immer: käme der Bezug
 * bei jedem Themenwechsel, wirkte er aufdringlich und fiele im Test negativ
 * auf.
 */
export function zieheRueckbezug(
  verlauf: Verlauf,
  node: FlowNode,
  sprache: Sprache = "de"
): string | null {
  const thema = node.topic
  if (!thema) return null

  if (verlauf.besuche.length - verlauf.letzterRueckbezug < ABSTAND) return null

  // Nur beim Wechsel in ein Thema, das noch nicht dran war.
  if (verlauf.besuche.some((besuch) => besuch.topic === thema)) return null

  const vorheriges = [...verlauf.besuche]
    .reverse()
    .find((besuch) => besuch.topic && besuch.topic !== thema)?.topic
  if (!vorheriges) return null

  if (Math.random() < 0.5) return null

  const thema_vorher = TOPICS.find((topic) => topic.id === vorheriges)
  const satz = sprache === "en" ? thema_vorher?.satzEn : thema_vorher?.satz
  if (!satz) return null

  verlauf.letzterRueckbezug = verlauf.besuche.length
  return waehleVariante(
    sprache === "en" ? RUECKBEZUEGE_EN : RUECKBEZUEGE
  ).replace("{thema}", satz)
}
