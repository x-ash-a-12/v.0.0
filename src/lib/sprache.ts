/**
 * Sprachliche Bausteine, die sowohl der Gesprächsbaum als auch der weiche
 * Fallback braucht.
 *
 * Sie liegen in einer eigenen Datei, weil chat-flow.ts und fallback.ts sich
 * sonst gegenseitig importieren müssten.
 */

/** Die Dialogsprachen des Prototyps. */
export type Sprache = "de" | "en"

/** Übliche deutsche Füllwörter, die nichts über das Thema aussagen. */
export const STOPWOERTER = new Set([
  "ich", "du", "wo", "was", "wie", "kann", "gibt", "es", "der", "die", "das",
  "ein", "eine", "einen", "einem", "und", "oder", "mit", "für", "bei", "nach",
  "von", "zu", "in", "am", "im", "auf", "ist", "sind", "hab", "habe", "gerne",
  "bitte", "mal", "denn", "noch", "dem", "den", "des", "hin", "her", "man",
  "mir", "mich", "sich", "wir", "ihr", "sie", "er", "uns", "euch", "aber",
  "auch", "wann", "warum", "welche", "welcher", "welches", "gehen", "geht",
  "machen", "macht", "sein", "seid", "wird", "werden", "würde", "könnte",
  "möchte", "will", "soll", "muss", "darf", "dort", "hier", "heute", "morgen",
  "etwas", "nichts", "viel", "sehr", "schon", "nur", "also", "dann", "wenn",
  "weil", "dass", "als", "aus", "über", "unter", "vor", "hinter", "neben",
])

/** Zerlegt eine Eingabe in kleingeschriebene Wörter. */
export function zerlege(text: string): string[] {
  return text.toLowerCase().split(/[^a-zäöüß]+/).filter(Boolean)
}

/**
 * Das längste inhaltstragende Wort, in der Schreibweise der Eingabe. Es wird
 * in Rückfragen zitiert, damit die Antwort die Eingabe erkennbar aufgreift.
 *
 * Der Plan nennt "mehr als vier Zeichen". Die Schwelle liegt hier bei vier,
 * sonst fiele das Beispiel aus dem Akzeptanzkriterium ("Hund") heraus.
 */
export function leitbegriff(text: string): string | null {
  let beste: string | null = null
  for (const wort of text.match(/[a-zA-ZäöüÄÖÜß]+/g) ?? []) {
    if (wort.length < 4) continue
    if (STOPWOERTER.has(wort.toLowerCase())) continue
    if (!beste || wort.length > beste.length) beste = wort
  }
  return beste
}
