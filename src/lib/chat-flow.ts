import type { LucideIcon } from "lucide-react"
import {
  Bus,
  CalendarDays,
  CloudSun,
  Info,
  Mountain,
  Snowflake,
  Users,
  Utensils,
  BedDouble,
} from "lucide-react"

import { type Sprache } from "@/lib/sprache"
import { type Folge } from "@/lib/verstehen"
import { empfehlungsKnoten, fahrplanKnoten, zielKnoten } from "@/lib/empfehlung"
import { mapsSuche } from "@/lib/ziele"
import {
  ANREISE,
  BERGBAHNEN,
  EVENTS,
  FAMILIE,
  GASTRONOMIE,
  LOIPEN,
  PARKEN,
  TOURIST_INFO,
  UNTERKUNFT,
  WANDERN,
  WINTER,
} from "@/lib/daten"

/** Ein Quick-Reply-Button unter einer Bot-Nachricht. */
export type Chip = {
  label: string
  /** Ziel-Knoten im Antwortpfad. */
  to: string
  /**
   * Thema, aus dem der Vorschlag stammt.
   *
   * Nur die Kandidaten einer Rückfrage tragen es. Dort führt das Ziel oft auf
   * einen Unterknoten ("bergbahn-preise"), aus dessen ID sich das Thema nicht
   * ablesen lässt. Ohne diese Angabe blieb die englische Rückfrage bei den
   * deutschen Themennamen stehen.
   */
  topic?: string
}

/** Strukturierte Info als Karte (Preise, Kontaktdaten, Fahrpläne). */
export type InfoCard = {
  title: string
  rows: { label: string; value: string }[]
  note?: string
}

/**
 * Eine Tabelle, etwa mit den nächsten Abfahrten.
 *
 * Fahrplanzeiten in Fließtext zu setzen ist die Art von Auskunft, die man
 * zweimal lesen muss: "der nächste um 15:47, dann um 16:51, dann um 17:50"
 * lässt sich nicht überfliegen. In Spalten steht die Abfahrt neben der
 * Ankunft, und die Zeile, die gerade zählt, ist die oberste.
 */
export type DataTable = {
  title: string
  columns: string[]
  rows: string[][]
  /** Hervorgehobene Zeile, üblicherweise die nächste Abfahrt. */
  highlight?: number
  note?: string
}

/** Ein QR-Code zum Mitnehmen auf das eigene Gerät. */
export type QrPayload = {
  title: string
  hint: string
  url: string
}

/** Ein Knoten im vordefinierten Gesprächsbaum. */
export type FlowNode = {
  id: string
  /**
   * Jeder Eintrag wird zu einer eigenen Sprechblase. Steht dort statt eines
   * Texts eine Liste, ist sie eine Variantenliste: beim Ausgeben wird eine
   * davon gezogen. Ein Modell formuliert nie zweimal identisch, feste Strings
   * sind bei Wiederholung sofort als Datenbank erkennbar.
   *
   * Jede Variante muss denselben Informationsgehalt haben. Getauscht wird
   * die Formulierung, nie der Inhalt.
   */
  messages: (string | string[])[]
  card?: InfoCard
  table?: DataTable
  chips?: Chip[]
  /**
   * Erzwingt eine Überbrückung vor der Antwort. Knoten mit Karte bekommen
   * sie ohnehin, hier steht sie für Antworten, bei denen Nachschlagen
   * plausibel wirkt.
   */
  bridge?: boolean
  /** Wird als eigene Karte mit QR-Code unter die Antwort gehängt. */
  qr?: QrPayload
  /**
   * Zugehöriges Thema aus TOPICS. Das Gedächtnis erkennt daran einen
   * Themenwechsel. Aus der ID allein ginge das nicht, "bergbahn-preise"
   * gehört zu "wandern".
   */
  topic?: string
  /**
   * Verkürzte Fassung, wenn der Knoten ein zweites Mal angesteuert wird.
   * Dieselbe Textwand zweimal zu lesen fällt im Test sofort auf.
   */
  kurz?: (string | string[])[]
  /**
   * Ziele, die dieser Knoten zur Auswahl stellt.
   *
   * Sie sind der Bezugspunkt für die nächste Eingabe: wer "ich würde gern auf
   * den Rauschberg" schreibt, wählt aus dieser Liste, ohne eine Schaltfläche
   * anzufassen.
   */
  angebot?: string[]
  /** Aus welcher Vorschlagsgruppe das Angebot stammt, und ab welcher Stelle. */
  gruppe?: { id: string; ab: number }
  /**
   * Das Ziel, um das es in diesem Knoten geht.
   *
   * Damit lässt sich "navigiere mich da hin" beantworten, ohne dass das Ziel
   * noch einmal genannt werden muss.
   */
  ziel?: string
  /**
   * Der Knoten ist bereits in der Dialogsprache gebaut und braucht keine
   * Übersetzung mehr. Gilt für alles, was zur Laufzeit entsteht.
   */
  fertig?: boolean
}

/** Thema für die Startauswahl und das Menü. */
export type Topic = {
  id: string
  label: string
  /**
   * Fließtextform für Rückfragen. Das Chip-Label liest sich mitten im Satz
   * wie ein Menüeintrag, diese Form nicht.
   */
  satz: string
  /** Englische Fassungen für die Sprachumschaltung (AP9). */
  labelEn: string
  satzEn: string
  icon: LucideIcon
}

export const TOPICS: Topic[] = [
  {
    id: "wandern",
    label: "Wandern & Bergbahnen",
    satz: "Wandern und die Bergbahnen",
    labelEn: "Hiking & mountain lifts",
    satzEn: "hiking and the mountain lifts",
    icon: Mountain,
  },
  {
    id: "events",
    label: "Veranstaltungen",
    satz: "Veranstaltungen im Ort",
    labelEn: "Events",
    satzEn: "events in the village",
    icon: CalendarDays,
  },
  {
    id: "anreise",
    label: "Anreise & Parken",
    satz: "Anreise und Parken",
    labelEn: "Getting here & parking",
    satzEn: "getting here and parking",
    icon: Bus,
  },
  {
    id: "wetter",
    label: "Wetter & Bergwetter",
    satz: "das Wetter",
    labelEn: "Weather",
    satzEn: "the weather",
    icon: CloudSun,
  },
  {
    id: "essen",
    label: "Essen & Einkehr",
    satz: "Essen und Einkehr",
    labelEn: "Food & drink",
    satzEn: "food and drink",
    icon: Utensils,
  },
  {
    id: "familie",
    label: "Mit Kindern unterwegs",
    satz: "Angebote für Familien",
    labelEn: "With children",
    satzEn: "things to do with children",
    icon: Users,
  },
  {
    id: "winter",
    label: "Winter & Langlauf",
    satz: "Winter und Langlauf",
    labelEn: "Winter & cross-country",
    satzEn: "winter and cross-country skiing",
    icon: Snowflake,
  },
  {
    id: "unterkunft",
    label: "Übernachten",
    satz: "eine Unterkunft",
    labelEn: "Where to stay",
    satzEn: "somewhere to stay",
    icon: BedDouble,
  },
  {
    id: "info",
    label: "Tourist-Information",
    satz: "die Tourist-Information",
    labelEn: "Tourist information",
    satzEn: "the tourist information",
    icon: Info,
  },
]

const menuChips: Chip[] = TOPICS.map((topic) => ({
  label: topic.label,
  to: topic.id,
}))

const backChips = (topic: string): Chip[] => [
  { label: "Zurück zum Thema", to: topic },
  { label: "Andere Frage", to: "menu" },
]

/** Zuletzt gezogener Index je Variantenliste, als Schlüssel die Liste selbst. */
const zuletzt = new Map<readonly string[], number>()

/**
 * Zieht eine Variante, nie zweimal dieselbe hintereinander. Wiederholt sich
 * eine Formulierung im selben Gespräch wortgleich, ist die Wirkung dahin.
 */
export function waehleVariante(varianten: readonly string[]): string {
  const vorher = zuletzt.get(varianten)
  let index = Math.floor(Math.random() * varianten.length)
  while (varianten.length > 1 && index === vorher) {
    index = Math.floor(Math.random() * varianten.length)
  }
  zuletzt.set(varianten, index)
  return varianten[index]
}

/** Löst die Variantenlisten einer Nachrichtenfolge zu festen Texten auf. */
export function ausformulieren(messages: (string | string[])[]): string[] {
  return messages.map((eintrag) =>
    Array.isArray(eintrag) ? waehleVariante(eintrag) : eintrag
  )
}

/** Überbrückung, solange die eigentliche Antwort noch nicht steht. */
const UEBERBRUECKUNGEN = [
  "Einen Moment, ich schaue nach.",
  "Ich sehe kurz nach.",
  "Das habe ich gleich.",
  "Moment, ich hole die Zahlen.",
] as const

const UEBERBRUECKUNGEN_EN = [
  "One moment, I will look that up.",
  "Let me check.",
  "I have that in a moment.",
  "One moment, I will fetch the figures.",
] as const

/**
 * Sie steht vor jeder Karte und jeder Tabelle und war bis zum Testlauf vom
 * 17.09. auch auf Englisch deutsch. Gerade dort fällt es auf: die
 * Überbrückung ist die erste Zeile, die nach dem Antippen erscheint.
 */
export function ueberbrueckung(sprache: Sprache = "de"): string {
  return waehleVariante(
    sprache === "en" ? UEBERBRUECKUNGEN_EN : UEBERBRUECKUNGEN
  )
}

export const FLOW: Record<string, FlowNode> = {
  start: {
    id: "start",
    messages: [
      "Grüß Gott und herzlich willkommen bei der Tourist-Information Ruhpolding. Ich bin der digitale Assistent und helfe bei Fragen rund um deinen Aufenthalt.",
      "Du stehst gerade {standort:kurz}. Wobei kann ich helfen? Du kannst ein Thema wählen oder frei tippen.",
    ],
    chips: menuChips,
  },

  menu: {
    id: "menu",
    messages: ["Gern. Womit kann ich sonst noch helfen?"],
    chips: menuChips,
  },

  danke: {
    id: "danke",
    messages: [
      "Sehr gern. Einen schönen Aufenthalt in Ruhpolding. Wenn noch etwas ist, frag einfach.",
    ],
    chips: menuChips,
  },

  /*
   * Fragen an das Gerät statt an den Ort.
   *
   * Im Testlauf vom 03.09. blieben "wo bin ich", "was kann ich hier machen"
   * und "gib mir einen QR-Code aus" allesamt ohne Treffer. Für eine
   * Testperson sind das keine Randfälle: sie stehen vor einem Bildschirm an
   * einem fremden Ort und fragen zuerst nach der Lage, dann nach dem Gerät.
   * Ein Sprachmodell würde beides beantworten, ohne dass jemand es dafür
   * vorbereitet hätte.
   */

  standort: {
    id: "standort",
    messages: [
      [
        `Du stehst gerade {standort:kurz}, hier in Ruhpolding im Chiemgau. Zur Tourist-Information sind es von hier {naehe:touristinfo}, zur Talstation ${BERGBAHNEN.rauschbergName} {naehe:rauschberg}.`,
        `Dieses Gerät steht {standort:kurz} in Ruhpolding. Von hier aus sind es {naehe:touristinfo} zur Tourist-Information und {naehe:rauschberg} zur Talstation ${BERGBAHNEN.rauschbergName}.`,
        `Der Standort ist {standort:kurz}, mitten in Ruhpolding. {naehe:touristinfo} zur Tourist-Information, {naehe:rauschberg} zur Talstation ${BERGBAHNEN.rauschbergName}.`,
      ],
    ],
    chips: [
      { label: "Was kann ich hier machen?", to: "empfehlung:hier:0" },
      { label: "Anreise & Parken", to: "anreise" },
      { label: "Andere Frage", to: "menu" },
    ],
  },

  /*
   * "Was kann ich hier machen" führt jetzt in die Vorschlagsliste.
   *
   * Vorher stand hier ein Satz über die Umgebung und darunter das Themenmenü.
   * Das beantwortet die Frage nicht: wer so fragt, will nicht in eine
   * Themenauswahl geschickt werden, sondern etwas vorgeschlagen bekommen, aus
   * dem er wählen kann.
   */

  "ueber-mich": {
    id: "ueber-mich",
    messages: [
      [
        "Ich bin der digitale Assistent der Tourist-Information Ruhpolding, kein Mensch. Ich kenne die Themen rund um den Aufenthalt hier: Wandern und die Bergbahnen, Veranstaltungen, Anreise und Parken, Wetter, Essen, Angebote für Familien, den Winter, Unterkünfte und die Tourist-Info selbst.",
        "Ich bin ein digitaler Assistent, kein Mitarbeiter aus Fleisch und Blut. Auskunft gebe ich zu Wandern und Bergbahnen, Veranstaltungen, Anreise und Parken, Wetter, Essen, Familienangeboten, Winter, Unterkünften und der Tourist-Information.",
      ],
      [
        "Du kannst frei tippen, ganze Sätze sind kein Problem. Was ich nicht weiß, sage ich dir auch.",
        "Schreib einfach los, gern in ganzen Sätzen. Wenn ich etwas nicht hinterlegt habe, sage ich es dir offen.",
      ],
    ],
    chips: menuChips,
  },

  "qr-hinweis": {
    id: "qr-hinweis",
    messages: [
      [
        `Zu Zielen, bei denen sich das lohnt, blende ich einen QR-Code ein. Du scannst ihn mit der Handykamera und hast die Route auf dem eigenen Gerät. Sag mir, wohin du willst, dann gebe ich den Code dazu aus.`,
        `Für Ziele im Ort gebe ich einen QR-Code mit aus: einmal mit der Handykamera scannen und die Route ist auf deinem Gerät. Nenn mir das Ziel, dann bekommst du den passenden Code.`,
      ],
    ],
    chips: [
      { label: `Weg zum ${BERGBAHNEN.rauschbergName}`, to: "ziel:rauschberg" },
      { label: `Weg zum ${WANDERN.foerchensee}`, to: "ziel:foerchensee" },
      { label: "Weg zum Parkplatz", to: "ziel:rathausgarage" },
      { label: "Andere Frage", to: "menu" },
    ],
  },

  wandern: {
    id: "wandern",
    topic: "wandern",
    kurz: [
      `Wie gesagt: rund ${WANDERN.wegenetzKm} markierte Wege, und die Bergbahnen fahren im Sommer von ${BERGBAHNEN.betriebSommerVon} bis ${BERGBAHNEN.betriebSommerBis} Uhr.`,
    ],
    messages: [
      [
        `Ruhpolding hat rund ${WANDERN.wegenetzKm} markierte Wanderwege. Beliebt sind der ${BERGBAHNEN.rauschbergName} mit der ${BERGBAHNEN.rauschbergBahn} ab dem Ort, der ${BERGBAHNEN.unternbergName} mit der ${BERGBAHNEN.unternbergBahn} und die flache Runde um den ${WANDERN.foerchensee}.`,
        `Das Wegenetz umfasst rund ${WANDERN.wegenetzKm}, alles markiert. Am häufigsten gegangen werden der ${BERGBAHNEN.rauschbergName}, den die ${BERGBAHNEN.rauschbergBahn} ab dem Ort erschließt, der ${BERGBAHNEN.unternbergName} mit der ${BERGBAHNEN.unternbergBahn} und die ebene Runde um den ${WANDERN.foerchensee}.`,
        `Zur Auswahl stehen rund ${WANDERN.wegenetzKm} markierte Wege. Besonders gefragt sind der ${BERGBAHNEN.rauschbergName}, erreichbar mit der ${BERGBAHNEN.rauschbergBahn} ab dem Ort, der ${BERGBAHNEN.unternbergName} mit der ${BERGBAHNEN.unternbergBahn}, und flach die Runde um den ${WANDERN.foerchensee}.`,
      ],
      [
        `Die Bergbahnen fahren im Sommer täglich von ${BERGBAHNEN.betriebSommerVon} bis ${BERGBAHNEN.betriebSommerBis} Uhr, letzte Bergfahrt um ${BERGBAHNEN.letzteBergfahrt} Uhr. Von hier sind es {naehe:rauschberg} zur Talstation ${BERGBAHNEN.rauschbergName}.`,
        `Beide Bahnen sind im Sommer täglich von ${BERGBAHNEN.betriebSommerVon} bis ${BERGBAHNEN.betriebSommerBis} Uhr in Betrieb, die letzte Bergfahrt geht um ${BERGBAHNEN.letzteBergfahrt} Uhr. Zur Talstation ${BERGBAHNEN.rauschbergName} sind es von hier {naehe:rauschberg}.`,
      ],
    ],
    chips: [
      { label: "Welche Bergbahnen gibt es?", to: "bergbahnen" },
      { label: "Leichte Tour mit Kinderwagen", to: "wandern-leicht" },
      { label: "Anspruchsvolle Bergtour", to: "wandern-schwer" },
      { label: "Andere Frage", to: "menu" },
    ],
  },
  "wandern-leicht": {
    id: "wandern-leicht",
    messages: [
      `Für den Kinderwagen eignet sich der Rundweg am ${WANDERN.foerchensee} (${WANDERN.foerchenseeRunde}) oder der ${WANDERN.uferwegTraun}. Beide sind ganzjährig begehbar und brauchen keine Bergausrüstung.`,
    ],
    ziel: "foerchensee",
    qr: {
      title: `Weg zum ${WANDERN.foerchensee}`,
      hint: "Scanne den Code, um die Route mitzunehmen.",
      url: mapsSuche(WANDERN.foerchensee),
    },
    topic: "wandern",
    chips: backChips("wandern"),
  },
  "wandern-schwer": {
    id: "wandern-schwer",
    messages: [
      `Anspruchsvoll ist der Aufstieg auf das ${WANDERN.sonntagshorn} (${WANDERN.sonntagshornHoehe}), den höchsten Berg der Chiemgauer Alpen. Gehzeit ${WANDERN.sonntagshornGehzeit} ab dem ${WANDERN.sonntagshornStart}, festes Schuhwerk und Trittsicherheit vorausgesetzt.`,
    ],
    ziel: "sonntagshorn",
    qr: {
      title: `Weg zum ${WANDERN.sonntagshornStart}`,
      hint: "Scanne den Code, um den Startpunkt mitzunehmen.",
      url: mapsSuche(WANDERN.sonntagshornStart),
    },
    topic: "wandern",
    chips: backChips("wandern"),
  },
  /*
   * Eigener Knoten für die Frage, welche Bahnen es gibt.
   *
   * Bisher landete "welche Bergbahnen gibt es" auf dem Themeneinstieg, und
   * die Nachfrage "ja welche genau" fand nichts mehr, weil die Antwort schon
   * gefallen war. Der Einstieg nennt die Bahnen im Nebensatz, hier stehen sie
   * mit dem, was man vor Ort wissen will.
   */
  bergbahnen: {
    id: "bergbahnen",
    messages: [
      [
        `Es sind zwei: die ${BERGBAHNEN.rauschbergBahn} auf den ${BERGBAHNEN.rauschbergName} und die ${BERGBAHNEN.unternbergBahn} auf den ${BERGBAHNEN.unternbergName}. Beide starten im Ort, im Sommer fahren sie täglich von ${BERGBAHNEN.betriebSommerVon} bis ${BERGBAHNEN.betriebSommerBis} Uhr, letzte Bergfahrt um ${BERGBAHNEN.letzteBergfahrt} Uhr.`,
        `Zwei Bahnen gibt es: die ${BERGBAHNEN.rauschbergBahn} zum ${BERGBAHNEN.rauschbergName} und die ${BERGBAHNEN.unternbergBahn} zum ${BERGBAHNEN.unternbergName}, beide ab dem Ort. Betrieb im Sommer täglich ${BERGBAHNEN.betriebSommerVon} bis ${BERGBAHNEN.betriebSommerBis} Uhr, die letzte Bergfahrt geht um ${BERGBAHNEN.letzteBergfahrt} Uhr.`,
      ],
      [
        `Zur Talstation ${BERGBAHNEN.rauschbergName} sind es von hier {naehe:rauschberg}.`,
        `Die Talstation ${BERGBAHNEN.rauschbergName} erreichst du von hier in {naehe:rauschberg}.`,
      ],
    ],
    topic: "wandern",
    ziel: "rauschberg",
    chips: [
      { label: "Weg zur Talstation", to: "ziel:rauschberg" },
      { label: "Preise Bergbahnen", to: "bergbahn-preise" },
      { label: "Andere Frage", to: "menu" },
    ],
  },

  "bergbahn-preise": {
    id: "bergbahn-preise",
    messages: ["Hier die Sommerpreise der beiden Bergbahnen."],
    card: {
      title: "Bergbahnen Ruhpolding, Sommer",
      rows: [
        {
          label: `${BERGBAHNEN.rauschbergName}, Berg- und Talfahrt`,
          value: `Erwachsene ${BERGBAHNEN.rauschbergErwachsen}`,
        },
        {
          label: `${BERGBAHNEN.unternbergName}, Berg- und Talfahrt`,
          value: `Erwachsene ${BERGBAHNEN.unternbergErwachsen}`,
        },
        {
          label: `Kinder ${BERGBAHNEN.kinderAlter}`,
          value: BERGBAHNEN.ermaessigungKinder,
        },
        { label: "mit Gästekarte", value: BERGBAHNEN.ermaessigungGaestekarte },
      ],
      note: BERGBAHNEN.kartenhinweis,
    },
    topic: "wandern",
    chips: backChips("wandern"),
  },

  events: {
    id: "events",
    topic: "events",
    kurz: [
      `Wie gesagt: ${EVENTS.biathlonKurz} ${EVENTS.biathlonMonat}, ${EVENTS.sommerkonzerte} ${EVENTS.sommerkonzerteZeit}, ${EVENTS.wochenmarkt} ${EVENTS.wochenmarktZeit}.`,
    ],
    messages: [
      [
        `Feste Termine im Jahr: der ${EVENTS.biathlonKurz} in der ${EVENTS.chiemgauArena} ${EVENTS.biathlonMonat}, die ${EVENTS.sommerkonzerte} am ${EVENTS.kurpark} (${EVENTS.sommerkonzerteZeit}) und der ${EVENTS.wochenmarkt} ${EVENTS.wochenmarktZeit} am ${EVENTS.rathausplatz}.`,
        `Drei Termine stehen jedes Jahr fest: ${EVENTS.biathlonMonat} der ${EVENTS.biathlonKurz} in der ${EVENTS.chiemgauArena}, ${EVENTS.sommerkonzerteZeit} die ${EVENTS.sommerkonzerte} am ${EVENTS.kurpark}, dazu der ${EVENTS.wochenmarkt} ${EVENTS.wochenmarktZeit} am ${EVENTS.rathausplatz}.`,
        `Im Jahreslauf gibt es den ${EVENTS.biathlonKurz} ${EVENTS.biathlonMonat} in der ${EVENTS.chiemgauArena}, die ${EVENTS.sommerkonzerte} am ${EVENTS.kurpark} (${EVENTS.sommerkonzerteZeit}) sowie ${EVENTS.wochenmarktZeit} den ${EVENTS.wochenmarkt} am ${EVENTS.rathausplatz}.`,
      ],
    ],
    chips: [
      { label: "Biathlon-Weltcup", to: "events-biathlon" },
      { label: "Was ist diese Woche los?", to: "events-woche" },
      { label: "Andere Frage", to: "menu" },
    ],
  },
  "events-biathlon": {
    id: "events-biathlon",
    bridge: true,
    messages: [
      `Der ${EVENTS.biathlonName} findet ${EVENTS.biathlonTermin} in der ${EVENTS.chiemgauArena} statt. Tickets gibt es online und an der Tageskasse. Vom Ortszentrum fährt ein kostenloser Skibus im ${EVENTS.skibusTakt} zur Arena, von hier sind es {naehe:arena}.`,
    ],
    ziel: "arena",
    qr: {
      title: `Weg zur ${EVENTS.chiemgauArena}`,
      hint: "Scanne den Code, um die Route mitzunehmen.",
      url: mapsSuche(EVENTS.chiemgauArena),
    },
    topic: "events",
    chips: backChips("events"),
  },
  "events-woche": {
    id: "events-woche",
    // SIMULIERT: tagesaktuelle Angabe, im Prototyp ohne Datenanbindung nicht
    // echt darstellbar. In Abschnitt 4.4 der Arbeit als Grenze auszuweisen.
    messages: [
      "Diese Woche (Demo-Auswahl): Mittwoch 20:00 Uhr Standkonzert der Trachtenkapelle am Kurpark, Donnerstag 10:00 Uhr geführte Kräuterwanderung (Anmeldung in der Tourist-Info), Freitag 8:00 Uhr Wochenmarkt am Rathausplatz.",
    ],
    topic: "events",
    chips: backChips("events"),
  },

  anreise: {
    id: "anreise",
    topic: "anreise",
    kurz: [
      `Wie gesagt: mit dem Auto über die ${ANREISE.autobahn} bis ${ANREISE.ausfahrt}, mit der Bahn ${ANREISE.bahnTakt} ab ${ANREISE.bahnAbfahrtsort}.`,
    ],
    messages: [
      [
        `Mit dem Auto über die ${ANREISE.autobahn} bis zur Ausfahrt ${ANREISE.ausfahrt}, dann die ${ANREISE.bundesstrasse}, ${ANREISE.fahrzeitAbAusfahrt}.`,
        `Wer mit dem Auto kommt, verlässt die ${ANREISE.autobahn} bei ${ANREISE.ausfahrt} und fährt über die ${ANREISE.bundesstrasse} weiter, ${ANREISE.fahrzeitAbAusfahrt}.`,
      ],
      [
        `Mit der Bahn ${ANREISE.bahnTakt} ab ${ANREISE.bahnAbfahrtsort} nach Ruhpolding, Fahrzeit ${ANREISE.bahnFahrzeit}. Der Bahnhof liegt ${ANREISE.bahnhofZumZentrum} vom Zentrum, von hier sind es {naehe:bahnhof}.`,
        `Züge fahren ${ANREISE.bahnTakt} ab ${ANREISE.bahnAbfahrtsort}, die Fahrt dauert ${ANREISE.bahnFahrzeit}. Vom Bahnhof ins Zentrum sind es ${ANREISE.bahnhofZumZentrum}, von hier bis dorthin {naehe:bahnhof}.`,
      ],
    ],
    chips: [
      { label: "Bahn nach Traunstein", to: "fahrplan:traunstein" },
      { label: "Parken im Ort", to: "anreise-parken" },
      { label: "Ortsbus & Gästekarte", to: "anreise-bus" },
      { label: "Andere Frage", to: "menu" },
    ],
  },
  "anreise-parken": {
    id: "anreise-parken",
    messages: ["Ein Überblick über die Parkmöglichkeiten im Ort."],
    card: {
      title: "Parken in Ruhpolding",
      rows: [
        { label: PARKEN.rathaus, value: PARKEN.rathausTarif },
        { label: PARKEN.laubau, value: PARKEN.laubauTarif },
        { label: PARKEN.vitalwelt, value: PARKEN.vitalweltTarif },
        { label: "Wohnmobile", value: PARKEN.wohnmobile },
      ],
      note: PARKEN.gaestekarteHinweis,
    },
    ziel: "rathausgarage",
    qr: {
      title: `Weg zum ${PARKEN.rathaus}`,
      hint: "Scanne den Code, um dich hinführen zu lassen.",
      url: mapsSuche(PARKEN.rathaus),
    },
    topic: "anreise",
    chips: backChips("anreise"),
  },
  /*
   * Das Busnetz als Tabelle.
   *
   * Im Testlauf um 12:30 blieb "wie ist der Fahrplan dieser Linien" ohne
   * Antwort. Ehrlich beantworten lässt sich die Frage nur halb: die Strecken
   * der beiden Dorflinien sind belegt, ein Takt ist es nicht. Genau das steht
   * hier, statt entweder zu schweigen oder Zeiten zu erfinden.
   */
  busnetz: {
    id: "busnetz",
    topic: "anreise",
    messages: [
      [
        `Im Ort fahren zwei Dorflinien, dazu der Rufbus ${ANREISE.rufbusName}. Hier die Strecken.`,
        `Es gibt zwei Dorflinien und den Rufbus ${ANREISE.rufbusName}. Die Strecken im Überblick.`,
      ],
      [
        `${ANREISE.rufbusHinweis} Er fährt werktags ${ANREISE.rufbusWerktags}, am Wochenende und an Feiertagen ${ANREISE.rufbusWochenende}. Mit der ${ANREISE.gaestekarteName} sind beide Dorflinien kostenlos.`,
      ],
    ],
    table: {
      title: "Busse in Ruhpolding",
      columns: ["Linie", "Strecke"],
      rows: [
        ["9532", ANREISE.dorflinie9532],
        ["9533", ANREISE.dorflinie9533],
        [ANREISE.rufbusName, ANREISE.rufbusHinweis],
        ["RVO", `Regionalbusse nach ${ANREISE.regionalZiele}`],
      ],
      // SIMULIERT wäre hier ein Takt. Die Quelle nennt keinen, deshalb steht
      // an seiner Stelle der Verweis auf die Auskunft vor Ort.
      note: "Für die Dorflinien ist bei Ruhpolding Tourismus kein Takt veröffentlicht. Abfahrtszeiten hängen an den Haltestellen aus und liegen in der Tourist-Information aus.",
    },
    chips: [
      { label: "Bahn nach Traunstein", to: "fahrplan:traunstein" },
      { label: "Ortsbus & Gästekarte", to: "anreise-bus" },
      { label: "Andere Frage", to: "menu" },
    ],
  },

  "anreise-bus": {
    id: "anreise-bus",
    messages: [
      `Der Ortsbus (${ANREISE.ortsbusLinie}) fährt ${ANREISE.ortsbusTakt} zwischen Bahnhof, Zentrum und den Talstationen. Mit der Gästekarte ${ANREISE.gaestekarteName} ist die Fahrt im gesamten Chiemgau kostenlos, inklusive der Regionalzüge bis ${ANREISE.gaestekarteBahnBis}.`,
    ],
    topic: "anreise",
    chips: [
      { label: "Welche Linien gibt es?", to: "busnetz" },
      { label: "Bahn nach Traunstein", to: "fahrplan:traunstein" },
      { label: "Andere Frage", to: "menu" },
    ],
  },

  wetter: {
    id: "wetter",
    topic: "wetter",
    // SIMULIERT: tagesaktuelle Angabe, siehe Kommentar an den Nachrichten.
    kurz: [
      "Wie gesagt, die Demo-Lage: heute heiter, morgen am Nachmittag Gewitterneigung.",
    ],
    // SIMULIERT: tagesaktuelle Angabe, im Prototyp ohne Datenanbindung nicht
    // echt darstellbar. In Abschnitt 4.4 der Arbeit als Grenze auszuweisen.
    messages: [
      [
        "Aktuelle Demo-Lage: heute heiter bei 22 °C im Tal, Nullgradgrenze bei 3.200 m, schwacher Wind. Für morgen sind am Nachmittag Wärmegewitter möglich, ein früher Tourenstart ist ratsam.",
        "Die Demo-Lage heute: heiter, 22 °C im Tal, schwacher Wind, Nullgradgrenze auf 3.200 m. Morgen können am Nachmittag Wärmegewitter aufziehen, deshalb früh losgehen.",
      ],
    ],
    chips: [
      { label: "Bergwetter 3 Tage", to: "wetter-3tage" },
      { label: "Webcams", to: "wetter-webcam" },
      { label: "Andere Frage", to: "menu" },
    ],
  },
  "wetter-3tage": {
    id: "wetter-3tage",
    // SIMULIERT: tagesaktuelle Angabe, im Prototyp ohne Datenanbindung nicht
    // echt darstellbar. In Abschnitt 4.4 der Arbeit als Grenze auszuweisen.
    messages: [
      "Demo-Prognose: Mittwoch sonnig 24 °C, Donnerstag wechselhaft 19 °C mit Schauern, Freitag stabil 21 °C. Die Gewitterneigung ist am Donnerstag am höchsten.",
    ],
    topic: "wetter",
    chips: backChips("wetter"),
  },
  "wetter-webcam": {
    id: "wetter-webcam",
    // SIMULIERT: Livebilder, im Prototyp ohne Datenanbindung nicht echt
    // darstellbar. In Abschnitt 4.4 der Arbeit als Grenze auszuweisen.
    messages: [
      `Live-Webcams gibt es von der ${BERGBAHNEN.rauschbergName}-Bergstation, der ${EVENTS.chiemgauArena} und vom ${EVENTS.rathausplatz}. In der echten Anwendung würden hier die aktuellen Bilder erscheinen.`,
    ],
    topic: "wetter",
    chips: backChips("wetter"),
  },

  essen: {
    id: "essen",
    topic: "essen",
    kurz: [
      `Wie gesagt: die ${GASTRONOMIE.gipfelalm} am Berg, im Ort das ${GASTRONOMIE.gasthausPost} und die ${GASTRONOMIE.pizzeria}.`,
    ],
    messages: [
      [
        `Von der Berghütte bis zum gehobenen Lokal ist alles da. Auf dem ${BERGBAHNEN.rauschbergName} die ${GASTRONOMIE.gipfelalm} mit Panoramaterrasse, im Ort das ${GASTRONOMIE.gasthausPost} mit bayerischer Küche und die ${GASTRONOMIE.pizzeria}. Gehoben isst man im Restaurant des Hotels ${GASTRONOMIE.hotelGehoben}.`,
        `Die Spanne reicht von der Berghütte bis zum gehobenen Lokal: oben am ${BERGBAHNEN.rauschbergName} die ${GASTRONOMIE.gipfelalm} mit Panoramaterrasse, unten im Ort das ${GASTRONOMIE.gasthausPost} mit bayerischer Küche und die ${GASTRONOMIE.pizzeria}, gehoben das Restaurant des Hotels ${GASTRONOMIE.hotelGehoben}.`,
      ],
    ],
    chips: [
      { label: "Hütten mit Spielplatz", to: "essen-huette" },
      { label: "Ruhetage beachten", to: "essen-ruhetag" },
      { label: "Andere Frage", to: "menu" },
    ],
  },
  "essen-huette": {
    id: "essen-huette",
    messages: [
      `Spielplatz direkt an der Hütte: das ${GASTRONOMIE.almstueberl} neben der Bergstation, die ${GASTRONOMIE.weitseealm} am Langlaufzentrum und die ${GASTRONOMIE.laubaualm} am Wanderparkplatz. Alle drei sind gut mit dem Kinderwagen erreichbar.`,
    ],
    topic: "essen",
    chips: backChips("essen"),
  },
  "essen-ruhetag": {
    id: "essen-ruhetag",
    messages: [
      `Viele Gasthäuser im Ort haben ${GASTRONOMIE.ruhetage} Ruhetag. Die Berggastronomie an den Bahnen hat im Sommer durchgehend geöffnet. Eine tagesaktuelle Übersicht liegt in der Tourist-Info aus.`,
    ],
    topic: "essen",
    chips: backChips("essen"),
  },

  familie: {
    id: "familie",
    topic: "familie",
    kurz: [
      `Wie gesagt: ${FAMILIE.freizeitpark}, ${FAMILIE.vitalwelt} und der ${FAMILIE.barfussweg} am ${WANDERN.foerchensee}.`,
    ],
    messages: [
      [
        `Für Familien lohnen sich der ${FAMILIE.freizeitpark} mit Märchenwald und Fahrgeschäften (${FAMILIE.freizeitparkOeffnung}), die ${FAMILIE.vitalwelt} mit Kinderbecken und Rutsche und der ${FAMILIE.barfussweg} am ${WANDERN.foerchensee}. Bei Regen ist das ${FAMILIE.bergbahnMuseum} eine Option.`,
        `Mit Kindern lohnen sich vor allem drei Ziele: der ${FAMILIE.freizeitpark} mit Märchenwald und Fahrgeschäften, geöffnet ${FAMILIE.freizeitparkOeffnung}, die ${FAMILIE.vitalwelt} mit Kinderbecken und Rutsche und der ${FAMILIE.barfussweg} am ${WANDERN.foerchensee}. Regnet es, bietet sich das ${FAMILIE.bergbahnMuseum} an.`,
      ],
      [
        `Zur ${FAMILIE.vitalwelt} sind es von hier {naehe:vitalwelt}.`,
        `Die ${FAMILIE.vitalwelt} erreichst du von hier in {naehe:vitalwelt}.`,
      ],
    ],
    chips: [
      { label: "Angebote bei Regen", to: "familie-regen" },
      { label: "Wickeln & Stillen im Ort", to: "familie-baby" },
      { label: "Andere Frage", to: "menu" },
    ],
  },
  "familie-regen": {
    id: "familie-regen",
    messages: [
      `Schlechtwetter-Programm: die ${FAMILIE.vitalwelt} mit Hallenbad und Sauna, der Freizeitpark mit überdachten Bereichen, die ${FAMILIE.kletterhalle} (${FAMILIE.kletterhalleFahrzeit}) und das ${FAMILIE.heimatmuseum}. Die Tourist-Info hat eine Bastelecke für Kinder.`,
    ],
    topic: "familie",
    chips: backChips("familie"),
  },
  "familie-baby": {
    id: "familie-baby",
    messages: [
      `Wickelmöglichkeiten gibt es in der Tourist-Info, in der ${FAMILIE.vitalwelt} und an den Talstationen von ${BERGBAHNEN.rauschbergName} und ${BERGBAHNEN.unternbergName}. Die meisten Cafés im Ort stellen bei Bedarf gern warmes Wasser bereit.`,
    ],
    topic: "familie",
    chips: backChips("familie"),
  },

  winter: {
    id: "winter",
    topic: "winter",
    kurz: [
      `Wie gesagt: rund ${LOIPEN.netz} Loipen und das Wettkampfstadion in der ${EVENTS.chiemgauArena}.`,
    ],
    messages: [
      [
        `Ruhpolding ist ein Zentrum für Langlauf: rund ${LOIPEN.netz} gespurte Loipen und das Wettkampfstadion in der ${EVENTS.chiemgauArena}, das öffentlich genutzt werden kann. Von hier sind es {naehe:arena} dorthin. Alpin gibt es kleinere Skigebiete am ${WINTER.skigebiet} und in Inzell.`,
        `Der Schwerpunkt liegt im Winter beim Langlauf: rund ${LOIPEN.netz} gespurte Loipen, dazu das öffentlich nutzbare Wettkampfstadion in der ${EVENTS.chiemgauArena}, {naehe:arena} von hier. Alpin bleiben die kleineren Skigebiete am ${WINTER.skigebiet} und in Inzell.`,
      ],
    ],
    chips: [
      { label: "Loipen & Loipenpass", to: "winter-loipe" },
      { label: "Skiverleih", to: "winter-verleih" },
      { label: "Andere Frage", to: "menu" },
    ],
  },
  "winter-loipe": {
    id: "winter-loipe",
    messages: ["Die wichtigsten Angaben zum Langlauf."],
    card: {
      title: "Langlauf in Ruhpolding",
      rows: [
        {
          label: "Loipennetz",
          value: `ca. ${LOIPEN.netz}, ${LOIPEN.spurarten}`,
        },
        { label: "Loipenpass Tag", value: LOIPEN.passTag },
        { label: "Loipenpass Woche", value: LOIPEN.passWoche },
        { label: "mit Gästekarte", value: LOIPEN.gaestekarte },
      ],
      // SIMULIERT: Schneelage und Spurbericht wären tagesaktuell und sind im
      // Prototyp ohne Datenanbindung nicht echt darstellbar.
      note: "Schneelage und Spurbericht in der echten Anwendung tagesaktuell.",
    },
    topic: "winter",
    chips: backChips("winter"),
  },
  "winter-verleih": {
    id: "winter-verleih",
    messages: [
      `Sportgeschäfte mit Verleih: ${WINTER.sportgeschaeft} am Dorfplatz, der Skiverleih an der Talstation ${WINTER.skigebiet} und der ${WINTER.langlaufShop} an der ${EVENTS.chiemgauArena}. In der Ferienzeit ist eine Reservierung empfehlenswert.`,
    ],
    topic: "winter",
    chips: backChips("winter"),
  },

  unterkunft: {
    id: "unterkunft",
    topic: "unterkunft",
    kurz: [
      `Wie gesagt: vom Ferienzimmer bis zum ${UNTERKUNFT.hoechsteKategorie}, buchbar über die Gästekarten-Plattform oder direkt beim Gastgeber.`,
    ],
    messages: [
      [
        `Vom Ferienzimmer über den Bauernhof bis zum ${UNTERKUNFT.hoechsteKategorie} ist das Angebot breit. Buchbar ist alles über die offizielle Gästekarten-Plattform oder direkt bei den Gastgebern. Die Tourist-Info vermittelt bei freier Kapazität auch spontan.`,
        `Das Angebot reicht vom Ferienzimmer über den Bauernhof bis zum ${UNTERKUNFT.hoechsteKategorie}. Buchen lässt sich alles über die offizielle Gästekarten-Plattform oder direkt beim Gastgeber, und die Tourist-Info vermittelt auch spontan, solange etwas frei ist.`,
      ],
    ],
    chips: [
      { label: "Urlaub am Bauernhof", to: "unterkunft-hof" },
      { label: "Barrierefrei übernachten", to: "unterkunft-barrierefrei" },
      { label: "Andere Frage", to: "menu" },
    ],
  },
  "unterkunft-hof": {
    id: "unterkunft-hof",
    messages: [
      `${UNTERKUNFT.hoefeAnzahl} Höfe in Ruhpolding bieten Urlaub am Bauernhof an, viele mit Tieren zum Mitversorgen und eigener Almhütte. Diese Betriebe sind oft Monate im Voraus ausgebucht, eine frühe Anfrage lohnt sich.`,
    ],
    topic: "unterkunft",
    chips: backChips("unterkunft"),
  },
  "unterkunft-barrierefrei": {
    id: "unterkunft-barrierefrei",
    messages: [
      `Mehrere Häuser sind nach dem Standard ${UNTERKUNFT.zertifizierung} zertifiziert, darunter ${UNTERKUNFT.barrierefreiHaeuser}. Die ${FAMILIE.vitalwelt} und die ${BERGBAHNEN.rauschbergName}-Gondel sind rollstuhlgerecht.`,
    ],
    topic: "unterkunft",
    chips: backChips("unterkunft"),
  },

  info: {
    id: "info",
    topic: "info",
    kurz: ["Wie gesagt, hier noch einmal die Kontaktdaten."],
    messages: [
      [
        "Hier die Kontaktdaten der Tourist-Information. Vor Ort helfen dir die Mitarbeitenden auch persönlich weiter, von hier sind es {naehe:touristinfo}.",
        "Das sind die Kontaktdaten der Tourist-Information. Persönlich weiter hilft dir das Team auch vor Ort, von hier sind es {naehe:touristinfo}.",
      ],
    ],
    card: {
      title: "Tourist-Information Ruhpolding",
      rows: [
        { label: "Adresse", value: TOURIST_INFO.adresse },
        { label: "Telefon", value: TOURIST_INFO.telefon },
        { label: "E-Mail", value: TOURIST_INFO.email },
        { label: "Öffnungszeiten", value: TOURIST_INFO.oeffnungszeiten },
      ],
      note: TOURIST_INFO.kartenhinweis,
    },
    chips: [{ label: "Andere Frage", to: "menu" }],
  },
}

/**
 * Wohin ein Rückbezug innerhalb eines Themas führt.
 *
 * "Was kostet das", "welche genau", "wie komme ich hin" tragen kein eigenes
 * Thema. Der Verstehens-Kern erkennt die Art der Nachfrage, das Ziel steht
 * hier, weil nur dieser Baum weiß, welcher Knoten die Antwort hält.
 *
 * Fehlt eine Art, gibt es dazu im Thema nichts zu vertiefen. Die Eingabe
 * landet dann im weichen Fallback und wird zur Rückfrage, statt auf einen
 * Knoten zu zeigen, der die Frage nicht beantwortet.
 */
export const FOLGEN: Record<string, Folge> = {
  wandern: {
    vertiefung: "bergbahnen",
    preis: "bergbahn-preise",
    zeit: "bergbahnen",
    weg: "bergbahnen",
  },
  events: {
    vertiefung: "events-biathlon",
    zeit: "events-woche",
    weg: "events-biathlon",
  },
  anreise: {
    vertiefung: "busnetz",
    preis: "anreise-parken",
    weg: "anreise-parken",
    // "Wie ist der Fahrplan dieser Linien" blieb im Testlauf ohne Antwort.
    zeit: "busnetz",
  },
  wetter: {
    vertiefung: "wetter-3tage",
    zeit: "wetter-3tage",
  },
  essen: {
    vertiefung: "essen-huette",
    zeit: "essen-ruhetag",
  },
  familie: {
    vertiefung: "familie-regen",
    weg: "familie",
  },
  winter: {
    vertiefung: "winter-loipe",
    preis: "winter-loipe",
  },
  unterkunft: {
    vertiefung: "unterkunft-hof",
  },
  info: {
    vertiefung: "info",
    zeit: "info",
    weg: "info",
    preis: "info",
  },
}

/* Rückfrage bei Mehrdeutigkeit. */

const RUECKFRAGEN = [
  "Damit ich dir das Richtige raussuche: geht es dir um {themen}?",
  "Das kann ich unterschiedlich verstehen. Meinst du {themen}?",
  "Kurze Rückfrage, damit ich nichts Falsches zeige: {themen}?",
  "Da gibt es mehrere Richtungen. Soll ich dir {themen} zeigen?",
] as const

/** Nur wenn ein Leitbegriff vorliegt, sonst bliebe der Platzhalter leer. */
const RUECKFRAGEN_MIT_BEGRIFF = [
  "Bei „{begriff}“ bin ich nicht sicher, worauf du hinauswillst: {themen}?",
  "„{begriff}“ kann ich hier zweierlei verstehen. Geht es dir um {themen}?",
  "Damit ich „{begriff}“ richtig einordne: {themen}?",
] as const

const RUECKFRAGEN_EN = [
  "So I show you the right thing: is this about {themen}?",
  "That could go two ways. Do you mean {themen}?",
  "Quick check so I do not show the wrong thing: {themen}?",
  "There are several directions here. Shall I show you {themen}?",
] as const

/** "A oder B", bei dreien "A, B oder C". */
function aufzaehlung(teile: string[], sprache: Sprache): string {
  if (teile.length <= 1) return teile[0] ?? ""
  const letztes = teile[teile.length - 1]
  const davor = teile.slice(0, -1).join(", ")
  return sprache === "en"
    ? `${davor} or ${letztes}`
    : `${davor} oder ${letztes}`
}

/** Die Rückfrage als fertiger Knoten, mit den Kandidaten als Chips. */
export function rueckfrageKnoten(
  candidates: Chip[],
  term: string | null,
  sprache: Sprache = "de"
): FlowNode {
  const themaVon = (chip: Chip) =>
    TOPICS.find(
      (eintrag) => eintrag.id === chip.topic || chip.to.startsWith(eintrag.id)
    )

  const themen = aufzaehlung(
    candidates.map((chip) => {
      const topic = themaVon(chip)
      if (!topic) return chip.label
      return sprache === "en" ? topic.satzEn : topic.satz
    }),
    sprache
  )

  const vorlage =
    sprache === "en"
      ? waehleVariante(RUECKFRAGEN_EN)
      : waehleVariante(
          term ? [...RUECKFRAGEN, ...RUECKFRAGEN_MIT_BEGRIFF] : RUECKFRAGEN
        )

  return {
    id: "rueckfrage-mehrdeutig",
    // Der Knoten baut seinen Text in beiden Sprachen selbst. Ohne diese
    // Kennzeichnung liefe er durch uebersetze(), fände dort keine Fassung
    // und bekäme den Hinweis vorangestellt, die Auskunft liege nur auf
    // Deutsch vor, obwohl er gerade auf Englisch fragt.
    fertig: true,
    messages: [
      vorlage.replace("{themen}", themen).replace("{begriff}", term ?? ""),
    ],
    chips: [
      ...candidates.map((chip) => {
        const topic = themaVon(chip)
        if (!topic || sprache !== "en") return chip
        return { ...chip, label: topic.labelEn }
      }),
      {
        label: sprache === "en" ? "Something else" : "Andere Frage",
        to: "menu",
      },
    ],
  }
}

/**
 * Notknoten für unbekannte IDs. Freier Text landet nicht mehr hier, dafür
 * sorgt fallback.ts. Diesen Knoten sieht nur, wer eine ID ansteuert, die es
 * nicht gibt, also im Fall eines Programmierfehlers.
 */
const NOTKNOTEN: FlowNode = {
  id: "notknoten",
  messages: ["Da ist mir etwas dazwischengekommen. Wähle am besten ein Thema."],
  chips: menuChips,
}

/**
 * Löst eine Knoten-ID auf, auch die zur Laufzeit gebauten.
 *
 * Zwei Formen tragen ihre Daten in der ID:
 *
 *   ziel:<id>                  ein Ort mit Beschreibung und QR-Code
 *   empfehlung:<gruppe>:<ab>   drei Vorschläge ab der genannten Stelle
 *   fahrplan:<id>              die nächsten Abfahrten als Tabelle
 *
 * Der Zustand steckt damit in der ID und nicht in einer Variablen zwischen
 * den Aufrufen: derselbe Aufruf ergibt denselben Knoten, unabhängig davon,
 * was vorher im Gespräch passiert ist. Für die Vergleichbarkeit zweier
 * Testläufe ist das dieselbe Bedingung, die auch für die Zuordnung gilt.
 *
 * Die Sprache muss hier hinein, weil diese Knoten fertig gebaut werden und
 * nicht mehr durch uebersetze() laufen.
 */
export function getNode(
  id: string,
  sprache: Sprache = "de",
  jetzt: Date = new Date()
): FlowNode {
  const bekannt = FLOW[id]
  if (bekannt) return bekannt

  if (id.startsWith("ziel:")) {
    return zielKnoten(id.slice(5), sprache, waehleVariante, jetzt) ?? NOTKNOTEN
  }

  if (id.startsWith("fahrplan:")) {
    return (
      fahrplanKnoten(id.slice(9), sprache, waehleVariante, jetzt) ?? NOTKNOTEN
    )
  }

  if (id.startsWith("empfehlung:")) {
    const [, gruppe, ab] = id.split(":")
    return (
      empfehlungsKnoten(
        gruppe,
        Number(ab) || 0,
        sprache,
        waehleVariante,
        jetzt
      ) ?? NOTKNOTEN
    )
  }

  return NOTKNOTEN
}
