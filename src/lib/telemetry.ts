import type { Sprache } from "@/lib/sprache"
import type { Grund } from "@/lib/verstehen"
import type { WetterId } from "@/lib/wetter"

/**
 * Stand des Protokollformats.
 *
 * 1: alle Exporte ohne diese Angabe. Innerhalb von 1 fehlen je nach Datum
 *    `grund` (vor dem 03.09.2026 nachmittags), `sprache` (vor dem 17.09.) und
 *    `zettel` (vor dem 23.09.). Ein fehlendes Feld heißt dort "unbekannt",
 *    nicht "kein Treffer".
 * 2: Kopf mit `gestartet` und `build`; bei Eingaben Ziel, Kandidaten und
 *    Leitbegriff; bei Antworten Lauf, Sprache, Wetter, Bauart und Kurzfassung;
 *    dazu das Ereignis "fertig". Zum Lesen und für den Abgleich mit der
 *    Tonaufnahme außerdem `datum`, `startzeit` und `dauer` im Kopf und
 *    `zeit` je Eintrag, alle in deutscher Zeit bzw. als Abstand zum Start.
 *    Maßgeblich für die Auswertung bleiben `t`, `gestartet` und `dauerMs`.
 *
 * Neue Felder kommen nur hinzu. Bestehende ändern ihre Bedeutung nicht, damit
 * alte und neue Exporte gemeinsam auswertbar bleiben.
 */
export const PROTOKOLL_VERSION = 2

/**
 * Der Code-Stand, aus dem die Seite gebaut wurde: Commit-Kürzel, mit
 * "-dirty" bei nicht committeten Änderungen, "dev" im Dev-Server. Gesetzt in
 * vite.config.ts. Ohne ihn lässt sich ein Export nicht gegen den Code
 * nachspielen, der ihn erzeugt hat.
 */
declare const __BUILD__: string

/**
 * Interaktionsprotokoll für die Think-Aloud-Tests.
 *
 * Ohne dieses Protokoll beruht die Auswertung auf Erinnerung. Es hält fest,
 * was eingegeben wurde, wie der Prototyp es eingeordnet hat und welchen Weg
 * das Gespräch genommen hat.
 *
 * Alles nur im Speicher: kein Netzwerkaufruf, kein localStorage, kein
 * personenbezogenes Datum. Das Protokoll lebt so lange wie die Seite offen
 * ist.
 */
export type LogEintrag = {
  /** Millisekunden seit Sitzungsbeginn. */
  t: number
  art:
    | "eingabe"
    | "chip"
    | "antwort"
    | "fertig"
    | "reset"
    | "sprache"
    | "zettel"
  /**
   * Roheingabe bei "eingabe", Beschriftung bei "chip", das eingestellte
   * Kürzel bei "sprache".
   */
  text?: string
  treffer?: "hit" | "ambiguous" | "miss"
  /**
   * Bei einem Treffer die Stufe, die ihn erzeugt hat. In der Auswertung
   * unterscheidbar zu machen, ob eine Eingabe am Wortschatz hing oder am
   * Gesprächszustand, ist der Unterschied zwischen "es hat funktioniert" und
   * einer Aussage darüber, warum.
   */
  grund?: Grund
  knoten?: string
  standort?: string
  /** Eingabe mit Treffer: der Knoten, auf den die Zuordnung zeigt. */
  ziel?: string
  /** Mehrdeutige Eingabe: die Knoten, die die Rückfrage anbietet. */
  kandidaten?: string[]
  /** Eingabe: der Leitbegriff, an dem Rückfrage und Fallback hängen. */
  term?: string | null
  /**
   * Antwort und "fertig": die laufende Nummer der Antwort. Eine Antwort ohne
   * "fertig" mit derselben Nummer wurde nicht zu Ende ausgegeben, weil vorher
   * die nächste Eingabe kam.
   */
  lauf?: number
  /** Antwort: die Sprache, in der sie ausgegeben wurde. */
  sprache?: Sprache
  /** Antwort: das Wetter, das der Versuchsleiter eingestellt hatte. */
  wetter?: WetterId
  /**
   * Antwort: "baum", wenn der Text fest im Dialogbaum steht, "situativ", wenn
   * er zur Laufzeit zusammengestellt wurde (Ziel, Fahrplan, Vorschläge,
   * Rückfrage). Entspricht der Weiche "Antwort vorformuliert?" im Ablauf.
   */
  bauart?: "baum" | "situativ"
  /** Antwort: die Kurzfassung, weil der Knoten schon einmal gezeigt wurde. */
  kurz?: boolean
}

const beginn = Date.now()
const gestartet = new Date(beginn).toISOString()
const eintraege: LogEintrag[] = []

export function protokolliere(eintrag: Omit<LogEintrag, "t">): void {
  eintraege.push({ t: Date.now() - beginn, ...eintrag })
}

/** Kopie des bisherigen Protokolls. */
export function protokoll(): LogEintrag[] {
  return [...eintraege]
}

/** Millisekunden als hh:mm:ss, wie die Zeitmarken der Transkripte. */
export function alsDauer(ms: number): string {
  const sekunden = Math.floor(ms / 1000)
  const zahl = (wert: number) => String(wert).padStart(2, "0")
  return [
    Math.floor(sekunden / 3600),
    Math.floor(sekunden / 60) % 60,
    sekunden % 60,
  ]
    .map(zahl)
    .join(":")
}

const DEUTSCH = { timeZone: "Europe/Berlin" } as const

function zeitstempel(): string {
  const jetzt = new Date()
  const zahl = (wert: number) => String(wert).padStart(2, "0")
  return [
    jetzt.getFullYear(),
    zahl(jetzt.getMonth() + 1),
    zahl(jetzt.getDate()),
    `${zahl(jetzt.getHours())}${zahl(jetzt.getMinutes())}`,
  ].join("-")
}

/**
 * Lädt das Protokoll als JSON herunter.
 *
 * Der Blob entsteht im Browser, es geht nichts an einen Server.
 */
export function exportiere(): void {
  const inhalt = JSON.stringify(
    {
      protokollVersion: PROTOKOLL_VERSION,
      build: typeof __BUILD__ === "undefined" ? "unbekannt" : __BUILD__,
      datum: new Date(beginn).toLocaleDateString("de-DE", {
        ...DEUTSCH,
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      startzeit: new Date(beginn).toLocaleTimeString("de-DE", DEUTSCH),
      dauer: alsDauer(Date.now() - beginn),
      gestartet,
      erzeugt: new Date().toISOString(),
      dauerMs: Date.now() - beginn,
      eintraege: eintraege.map((eintrag) => ({
        zeit: alsDauer(eintrag.t),
        ...eintrag,
      })),
    },
    null,
    2
  )

  const blob = new Blob([inhalt], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `protokoll-${zeitstempel()}.json`
  link.click()
  URL.revokeObjectURL(url)
}
