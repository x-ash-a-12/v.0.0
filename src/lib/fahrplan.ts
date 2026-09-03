/**
 * Fahrpläne für die Verbindungen ab Ruhpolding.
 *
 * Die Zeiten stammen aus dem gedruckten Fahrplan der Bayerischen Regiobahn
 * für die Linie RB 53, gültig vom 14.12.2025 bis 12.12.2026. Sie sind damit
 * die ersten Angaben im Prototyp, die sich zur Laufzeit auswerten lassen:
 * aus einer Liste von Abfahrten und der aktuellen Uhrzeit ergibt sich, wann
 * der nächste Zug fährt.
 *
 * Quelle: https://download.transdev.de/transdev/uploads/bb/schedule/2124/
 *         fahrplan-traunstein-ruhpolding-14-12-2025-12-12-2026.pdf
 * Abgerufen: 2026-09-03
 *
 * GRENZE DER DATEN: Der gedruckte Fahrplan unterscheidet zwischen Montag bis
 * Freitag, Samstag sowie Sonn- und Feiertagen, gibt die Zuordnung aber über
 * Spaltenbreiten an, die sich aus dem PDF nicht verlässlich zurücklesen
 * lassen. Aufgenommen sind deshalb die Abfahrten des Grundtakts, den alle
 * Verkehrstage teilen. Fahrten mit Sondervermerk (nur samstags, nur an
 * Schultagen, nur am 01.01.) sind ausgelassen, weil sie an einem beliebigen
 * Testtag falsch wären. Der Prototyp weist das in jeder Fahrplanausgabe aus
 * und verweist für die tagesaktuelle Auskunft auf brb.de. In Abschnitt 4.4
 * der Arbeit als Grenze auszuweisen.
 */

/** Eine Abfahrt in Minuten seit Mitternacht, zur einfachen Rechnung. */
export type Abfahrt = {
  /** Abfahrt am Startbahnhof, als "HH:MM". */
  ab: string
  /** Ankunft am Ziel, als "HH:MM". */
  an: string
  /**
   * Umstieg unterwegs, falls die Verbindung nicht durchgeht.
   * Der Prototyp nennt ihn, damit die Zeile nicht kürzer wirkt als die Reise.
   */
  umstieg?: string
}

export type Verbindung = {
  id: string
  /** Wohin es geht, im Nominativ: "Traunstein". */
  ziel: string
  zielEn: string
  /** Wo die Fahrt beginnt. */
  start: string
  startEn: string
  /** Linie oder Linienfolge, für die Kopfzeile der Tabelle. */
  linie: string
  /** Fahrzeit in Minuten, für die Angabe unter der Tabelle. */
  dauer: number
  /** Wonach jemand sucht, der diese Verbindung meint. */
  stichwoerter: string[]
  abfahrten: Abfahrt[]
  /** Fußnote unter der Tabelle. */
  hinweis: string
  hinweisEn: string
}

const BRB_HINWEIS =
  "Grundtakt der Linie RB 53, Fahrplanjahr 2026. An Wochenenden und Feiertagen fahren zusätzliche und abweichende Züge. Tagesaktuell auf brb.de."

const BRB_HINWEIS_EN =
  "Base timetable of line RB 53, 2026 timetable year. Additional and differing trains run at weekends and on public holidays. Live times at brb.de."

/*
 * Ruhpolding ab, Richtung Traunstein. Abfahrten des Grundtakts, Fahrzeit
 * 24 bis 25 Minuten. Ausgelassen: 7:05 und 16:19 (abweichende Verkehrstage)
 * sowie 0:03 und 1:33 (nur an Wochenenden beziehungsweise am 01.01.).
 */
const NACH_TRAUNSTEIN: Abfahrt[] = [
  { ab: "06:14", an: "06:38" },
  { ab: "07:14", an: "07:36" },
  { ab: "08:14", an: "08:36" },
  { ab: "09:14", an: "09:39" },
  { ab: "09:48", an: "10:10" },
  { ab: "10:50", an: "11:12" },
  { ab: "11:50", an: "12:12" },
  { ab: "12:48", an: "13:10" },
  { ab: "13:51", an: "14:13" },
  { ab: "14:50", an: "15:12" },
  { ab: "15:47", an: "16:12" },
  { ab: "16:51", an: "17:13" },
  { ab: "17:50", an: "18:12" },
  { ab: "18:50", an: "19:12" },
  { ab: "19:50", an: "20:12" },
  { ab: "20:50", an: "21:12" },
  { ab: "21:52", an: "22:15" },
  { ab: "22:52", an: "23:15" },
]

/*
 * Weiter mit dem RE 5 ab Traunstein. Die Anschlusszeiten stehen im selben
 * Fahrplan, die Ankunft am Fernziel steht dort nicht: aufgenommen ist deshalb
 * nur, wann der Anschluss abfährt, nicht wann er ankommt.
 */
const RE5_SALZBURG = [
  "06:44",
  "08:16",
  "09:16",
  "10:16",
  "11:16",
  "12:16",
  "13:16",
  "14:16",
  "15:16",
  "16:16",
  "17:16",
  "18:16",
  "19:16",
  "20:16",
  "21:16",
  "22:18",
  "23:19",
]

const RE5_MUENCHEN = [
  "06:44",
  "07:44",
  "08:44",
  "09:44",
  "10:44",
  "11:44",
  "12:44",
  "13:46",
  "14:44",
  "15:44",
  "16:44",
  "17:44",
  "18:44",
  "19:44",
  "20:44",
  "21:46",
  "22:45",
]

/** Minuten seit Mitternacht. */
export function minuten(zeit: string): number {
  const [stunde, minute] = zeit.split(":").map(Number)
  return stunde * 60 + minute
}

/** Die Gegenrechnung, für berechnete Zeiten. */
function alsZeit(gesamt: number): string {
  const stunde = Math.floor(gesamt / 60) % 24
  const minute = gesamt % 60
  return `${String(stunde).padStart(2, "0")}:${String(minute).padStart(2, "0")}`
}

/**
 * Baut die Fahrten mit Umstieg: zu jeder Fahrt nach Traunstein der erste
 * Anschluss, der dort mit genug Zeit zum Umsteigen abfährt.
 *
 * Weniger als sechs Minuten gelten nicht als Anschluss. Eine Verbindung
 * auszugeben, die nur auf dem Papier passt, wäre schlechter als sie
 * wegzulassen: der Gast steht dann am Bahnsteig und sieht den Zug fahren.
 */
const UMSTIEGSZEIT = 6

function ueberTraunstein(anschluesse: string[], fern: string): Abfahrt[] {
  const fahrten: Abfahrt[] = []
  for (const fahrt of NACH_TRAUNSTEIN) {
    const frueheste = minuten(fahrt.an) + UMSTIEGSZEIT
    const passt = anschluesse.find((zeit) => minuten(zeit) >= frueheste)
    if (!passt) continue
    fahrten.push({
      ab: fahrt.ab,
      an: passt,
      umstieg: `Traunstein an ${fahrt.an}, weiter mit dem RE 5 nach ${fern}`,
    })
  }
  return fahrten
}

export const VERBINDUNGEN: Verbindung[] = [
  {
    id: "traunstein",
    ziel: "Traunstein",
    zielEn: "Traunstein",
    start: "Bahnhof Ruhpolding",
    startEn: "Ruhpolding station",
    linie: "RB 53",
    dauer: 24,
    stichwoerter: [
      "traunstein",
      "kreisstadt",
      "bahnhof",
      "zug",
      "bahn",
      "train",
    ],
    abfahrten: NACH_TRAUNSTEIN,
    hinweis: BRB_HINWEIS,
    hinweisEn: BRB_HINWEIS_EN,
  },
  {
    id: "salzburg",
    ziel: "Salzburg",
    zielEn: "Salzburg",
    start: "Bahnhof Ruhpolding",
    startEn: "Ruhpolding station",
    linie: "RB 53, ab Traunstein RE 5",
    dauer: 0,
    stichwoerter: [
      "salzburg",
      "oesterreich",
      "mozart",
      "austria",
      "freilassing",
    ],
    abfahrten: ueberTraunstein(RE5_SALZBURG, "Salzburg und Freilassing"),
    hinweis:
      "Abfahrt ab Ruhpolding und Weiterfahrt ab Traunstein nach dem Fahrplan der Bayerischen Regiobahn. Die Ankunft in Salzburg richtet sich nach dem RE 5 und ist hier nicht hinterlegt.",
    hinweisEn:
      "Departure from Ruhpolding and onward connection from Traunstein per the Bayerische Regiobahn timetable. Arrival in Salzburg depends on the RE 5 and is not held here.",
  },
  {
    id: "muenchen",
    ziel: "München",
    zielEn: "Munich",
    start: "Bahnhof Ruhpolding",
    startEn: "Ruhpolding station",
    linie: "RB 53, ab Traunstein RE 5",
    dauer: 0,
    stichwoerter: ["muenchen", "munich", "hauptbahnhof", "rosenheim"],
    abfahrten: ueberTraunstein(RE5_MUENCHEN, "Rosenheim und München"),
    hinweis:
      "Abfahrt ab Ruhpolding und Weiterfahrt ab Traunstein nach dem Fahrplan der Bayerischen Regiobahn. Die Ankunft in München richtet sich nach dem RE 5 und ist hier nicht hinterlegt.",
    hinweisEn:
      "Departure from Ruhpolding and onward connection from Traunstein per the Bayerische Regiobahn timetable. Arrival in Munich depends on the RE 5 and is not held here.",
  },
]

export function verbindung(id: string): Verbindung | undefined {
  return VERBINDUNGEN.find((eintrag) => eintrag.id === id)
}

/**
 * Die nächsten Abfahrten ab einem Zeitpunkt.
 *
 * Reicht der Tag nicht mehr, wird vorne weitergezählt und die Fahrt als
 * "morgen" gekennzeichnet. Nach der letzten Abfahrt eine leere Tabelle zu
 * zeigen wäre die schlechtere Auskunft: wer um 23:30 fragt, will wissen, dass
 * der nächste Zug um 6:14 fährt.
 */
export function naechsteAbfahrten(
  eintrag: Verbindung,
  jetzt: Date,
  anzahl = 3
): { fahrt: Abfahrt; morgen: boolean }[] {
  const stand = jetzt.getHours() * 60 + jetzt.getMinutes()

  const heute = eintrag.abfahrten
    .filter((fahrt) => minuten(fahrt.ab) >= stand)
    .map((fahrt) => ({ fahrt, morgen: false }))

  if (heute.length >= anzahl) return heute.slice(0, anzahl)

  const morgen = eintrag.abfahrten
    .slice(0, anzahl - heute.length)
    .map((fahrt) => ({ fahrt, morgen: true }))

  return [...heute, ...morgen]
}

/** Wann nach dieser Abfahrt die übernächste kommt, in Minuten. */
export function taktHinweis(eintrag: Verbindung): string | null {
  if (eintrag.abfahrten.length < 3) return null
  const abstaende: number[] = []
  for (let i = 1; i < eintrag.abfahrten.length; i++) {
    abstaende.push(
      minuten(eintrag.abfahrten[i].ab) - minuten(eintrag.abfahrten[i - 1].ab)
    )
  }
  abstaende.sort((a, b) => a - b)
  const mitte = abstaende[Math.floor(abstaende.length / 2)]
  if (mitte >= 50 && mitte <= 70) return "etwa stündlich"
  return null
}

/** Nur für die Tests: die Rechnung soll ohne echte Uhr prüfbar sein. */
export function zeitpunkt(stunde: number, minute: number): Date {
  const datum = new Date(2026, 8, 3)
  datum.setHours(stunde, minute, 0, 0)
  return datum
}

export { alsZeit }
