import type { Sprache } from "@/lib/sprache"

/**
 * Zeitbewusstsein.
 *
 * Ein Terminal steht den ganzen Tag am selben Ort und weiß, wie spät es ist.
 * Diesen Umstand nicht zu nutzen, war die auffälligste Lücke: der Prototyp
 * hat um 21 Uhr eine Bergbahn empfohlen, die seit drei Stunden steht.
 *
 * Zwei Dinge folgen aus der Uhrzeit. Erstens ein Hinweis am Vorschlag, ob das
 * Ziel gerade offen hat. Zweitens die Reihenfolge: was jetzt geschlossen ist,
 * rutscht ans Ende, ohne zu verschwinden. Es ganz auszublenden wäre falsch,
 * denn wer abends fragt, plant oft für den nächsten Tag.
 *
 * Alle Funktionen bekommen den Zeitpunkt übergeben, statt selbst zur Uhr zu
 * greifen. Sonst wäre keine Antwort des Prototyps mehr wiederholbar prüfbar.
 */

/** Öffnungszeiten eines Ziels, soweit belegt. */
export type Oeffnung = {
  /** "09:30" */
  von: string
  /** Fehlt, wenn die Quelle nur einen Beginn nennt. */
  bis?: string
  /**
   * Wochentage nach Date.getDay(): 0 ist Sonntag. Fehlt die Angabe, gilt
   * täglich.
   */
  tage?: number[]
  /**
   * Letzter sinnvoller Aufbruch, etwa die letzte Bergfahrt. Ab dann lohnt
   * sich die Anfahrt nicht mehr, auch wenn formal noch offen ist.
   */
  letzterEinlass?: string
}

export type Status = "offen" | "gleich" | "bald_zu" | "zu"

function alsMinuten(zeit: string): number {
  const [stunde, minute] = zeit.split(":").map(Number)
  return stunde * 60 + minute
}

/** Wie spät es ist, in Minuten seit Mitternacht. */
export function standMinuten(jetzt: Date): number {
  return jetzt.getHours() * 60 + jetzt.getMinutes()
}

/**
 * Der Zustand eines Ziels zum gegebenen Zeitpunkt.
 *
 * "gleich" heißt: öffnet innerhalb der nächsten Stunde. "bald_zu" heißt: die
 * letzte sinnvolle Ankunft ist in weniger als einer Stunde. Beides ist für
 * jemanden, der gerade vor dem Bildschirm steht, wichtiger als das nackte
 * Offen oder Zu.
 */
export function status(
  oeffnung: Oeffnung | undefined,
  jetzt: Date
): Status | null {
  if (!oeffnung) return null

  if (oeffnung.tage && !oeffnung.tage.includes(jetzt.getDay())) return "zu"

  const stand = standMinuten(jetzt)
  const von = alsMinuten(oeffnung.von)
  const bis = oeffnung.bis ? alsMinuten(oeffnung.bis) : 24 * 60
  const schluss = oeffnung.letzterEinlass
    ? alsMinuten(oeffnung.letzterEinlass)
    : bis

  if (stand < von) return von - stand <= 60 ? "gleich" : "zu"
  if (stand >= bis) return "zu"
  if (stand >= schluss) return "bald_zu"
  if (schluss - stand <= 60) return "bald_zu"
  return "offen"
}

/** Der Zustand als Satzteil, der an einen Vorschlag passt. */
export function statusText(
  oeffnung: Oeffnung | undefined,
  jetzt: Date,
  sprache: Sprache = "de"
): string | null {
  const lage = status(oeffnung, jetzt)
  if (!lage || !oeffnung) return null
  const en = sprache === "en"

  switch (lage) {
    case "offen":
      return en
        ? `Open now${oeffnung.bis ? `, until ${oeffnung.bis}` : ""}`
        : `Jetzt geöffnet${oeffnung.bis ? `, bis ${oeffnung.bis} Uhr` : ""}`
    case "gleich":
      return en ? `Opens at ${oeffnung.von}` : `Öffnet um ${oeffnung.von} Uhr`
    case "bald_zu":
      return en
        ? `Open, but closing soon${
            oeffnung.letzterEinlass
              ? ` (last entry ${oeffnung.letzterEinlass})`
              : ""
          }`
        : `Geöffnet, aber bald Schluss${
            oeffnung.letzterEinlass
              ? ` (letzte Möglichkeit ${oeffnung.letzterEinlass} Uhr)`
              : ""
          }`
    case "zu":
      return en
        ? `Closed now, opens at ${oeffnung.von}`
        : `Jetzt geschlossen, öffnet um ${oeffnung.von} Uhr`
  }
}

/**
 * Wie stark ein Ziel gerade infrage kommt, für die Reihenfolge der
 * Vorschläge. Höher ist besser.
 */
export function eignung(
  oeffnung: Oeffnung | undefined,
  jetzt: Date,
  tagesfuellend = false
): number {
  // Ein ganzer Tagesausflug lohnt sich ab dem Nachmittag nicht mehr. Das ist
  // unabhängig von Öffnungszeiten: ein Berg hat immer offen.
  if (tagesfuellend && jetzt.getHours() >= 14) return 0

  switch (status(oeffnung, jetzt)) {
    case "offen":
      return 3
    case "bald_zu":
      return 1
    case "gleich":
      return 2
    case "zu":
      return 0
    default:
      // Ohne belegte Öffnungszeit wird nicht umsortiert: eine Vermutung wäre
      // hier schlechter als gar keine Aussage.
      return 3
  }
}

/**
 * Der Hinweis an einem Tagesausflug, wenn der Tag dafür schon zu weit ist.
 *
 * Seit ungesicherte Ziele nicht mehr vorgeschlagen werden, sind die Listen
 * kürzer, und ein Tagesausflug rutscht abends nicht mehr auf die zweite
 * Seite. Er bleibt stehen, weil jemand für morgen planen kann, aber er sagt,
 * dass er heute nicht mehr passt.
 */
export function spaetHinweis(
  tagesfuellend: boolean | undefined,
  jetzt: Date,
  sprache: Sprache = "de"
): string | null {
  if (!tagesfuellend || jetzt.getHours() < 14) return null
  return sprache === "en"
    ? "Too late to start today, better tomorrow morning"
    : "Für heute zu spät, eher etwas für morgen früh"
}

export type Tageszeit =
  "morgen" | "vormittag" | "mittag" | "nachmittag" | "abend" | "nacht"

export function tageszeit(jetzt: Date): Tageszeit {
  const stunde = jetzt.getHours()
  if (stunde < 5) return "nacht"
  if (stunde < 10) return "morgen"
  if (stunde < 12) return "vormittag"
  if (stunde < 14) return "mittag"
  if (stunde < 18) return "nachmittag"
  if (stunde < 22) return "abend"
  return "nacht"
}

/** Die Uhrzeit als "14:05". */
export function uhrzeit(jetzt: Date): string {
  return `${String(jetzt.getHours()).padStart(2, "0")}:${String(
    jetzt.getMinutes()
  ).padStart(2, "0")}`
}

const WOCHENTAGE = [
  "Sonntag",
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
]

const WOCHENTAGE_EN = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
]

export function wochentag(jetzt: Date, sprache: Sprache = "de"): string {
  return (sprache === "en" ? WOCHENTAGE_EN : WOCHENTAGE)[jetzt.getDay()]
}

/**
 * Eine Einleitung, die die Tageszeit aufgreift.
 *
 * Der Bezug auf die Uhrzeit ist das, was den Eindruck erzeugt, das Gegenüber
 * sei in derselben Situation wie der Gast, statt einen Katalog vorzulesen.
 */
export function zeitbezug(jetzt: Date, sprache: Sprache = "de"): string {
  const en = sprache === "en"
  const zeit = uhrzeit(jetzt)
  switch (tageszeit(jetzt)) {
    case "morgen":
      return en
        ? `It is ${zeit}, so there is a whole day ahead of you.`
        : `Es ist ${zeit} Uhr, da liegt noch ein ganzer Tag vor Ihnen.`
    case "vormittag":
      return en
        ? `It is ${zeit}, so most of the day is still ahead of you.`
        : `Es ist ${zeit} Uhr, der größte Teil des Tages liegt noch vor Ihnen.`
    case "mittag":
      return en
        ? `It is ${zeit}, still plenty of time for something bigger.`
        : `Es ist ${zeit} Uhr, für etwas Größeres reicht der Tag noch.`
    case "nachmittag":
      return en
        ? `It is ${zeit}, so I will not put anything that needs a full day first.`
        : `Es ist ${zeit} Uhr, deshalb nenne ich nichts, was einen ganzen Tag braucht, an erster Stelle.`
    case "abend":
      return en
        ? `It is ${zeit}, so there is not much of today left.`
        : `Es ist ${zeit} Uhr, vom Tag ist nicht mehr viel übrig.`
    case "nacht":
      return en
        ? `It is ${zeit}, so this is more of a plan for tomorrow.`
        : `Es ist ${zeit} Uhr, das wird eher ein Plan für morgen.`
  }
}
