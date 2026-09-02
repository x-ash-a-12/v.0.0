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

import { leitbegriff, type Sprache } from "@/lib/sprache"
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
}

/** Strukturierte Info als Karte (Preise, Kontaktdaten, Fahrpläne). */
export type InfoCard = {
  title: string
  rows: { label: string; value: string }[]
  note?: string
}

/** Ein QR-Code zum Mitnehmen auf das eigene Gerät. */
export type QrPayload = {
  title: string
  hint: string
  url: string
}

/**
 * Google-Maps-Suchabfrage für ein Ziel in Ruhpolding. Das ist keine erfundene
 * Tatsache, sondern eine Abfrage, die die Karte selbst beantwortet.
 */
function mapsSuche(ziel: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${ziel} Ruhpolding`,
  )}`
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
    Array.isArray(eintrag) ? waehleVariante(eintrag) : eintrag,
  )
}

/** Überbrückung, solange die eigentliche Antwort noch nicht steht. */
const UEBERBRUECKUNGEN = [
  "Einen Moment, ich schaue nach.",
  "Ich sehe kurz nach.",
  "Das habe ich gleich.",
  "Moment, ich hole die Zahlen.",
] as const

export function ueberbrueckung(): string {
  return waehleVariante(UEBERBRUECKUNGEN)
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
      { label: "Leichte Tour mit Kinderwagen", to: "wandern-leicht" },
      { label: "Anspruchsvolle Bergtour", to: "wandern-schwer" },
      { label: "Preise Bergbahnen", to: "bergbahn-preise" },
      { label: "Andere Frage", to: "menu" },
    ],
  },
  "wandern-leicht": {
    id: "wandern-leicht",
    messages: [
      `Für den Kinderwagen eignet sich der Rundweg am ${WANDERN.foerchensee} (${WANDERN.foerchenseeRunde}) oder der ${WANDERN.uferwegTraun}. Beide sind ganzjährig begehbar und brauchen keine Bergausrüstung.`,
    ],
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
    qr: {
      title: `Weg zum ${WANDERN.sonntagshornStart}`,
      hint: "Scanne den Code, um den Startpunkt mitzunehmen.",
      url: mapsSuche(WANDERN.sonntagshornStart),
    },
    topic: "wandern",
    chips: backChips("wandern"),
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
    qr: {
      title: `Weg zum ${PARKEN.rathaus}`,
      hint: "Scanne den Code, um dich hinführen zu lassen.",
      url: mapsSuche(PARKEN.rathaus),
    },
    topic: "anreise",
    chips: backChips("anreise"),
  },
  "anreise-bus": {
    id: "anreise-bus",
    messages: [
      `Der Ortsbus (${ANREISE.ortsbusLinie}) fährt ${ANREISE.ortsbusTakt} zwischen Bahnhof, Zentrum und den Talstationen. Mit der Gästekarte ${ANREISE.gaestekarteName} ist die Fahrt im gesamten Chiemgau kostenlos, inklusive der Regionalzüge bis ${ANREISE.gaestekarteBahnBis}.`,
    ],
    topic: "anreise",
    chips: backChips("anreise"),
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
        { label: "Loipennetz", value: `ca. ${LOIPEN.netz}, ${LOIPEN.spurarten}` },
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

type Intent = { test: RegExp; to: string; topic: string }

/**
 * Begrüßung und Dank sind kein Thema im Sinne der Themenauswahl. Treffen sie
 * zusammen mit einem echten Thema, entscheidet das echte Thema, sonst würde
 * "Danke, wo kann ich parken?" zur Rückfrage.
 */
const SMALLTALK = "smalltalk"

/** Reihenfolge zählt: spezielle Muster vor allgemeinen. */
const INTENTS: Intent[] = [
  { test: /danke|vielen dank|passt|super|klasse|top\b|thanks|thank you|perfect/i, to: "danke", topic: SMALLTALK },
  { test: /biathlon|weltcup|world cup|arena/i, to: "events-biathlon", topic: "events" },
  { test: /webcam|kamera|camera/i, to: "wetter-webcam", topic: "wetter" },
  { test: /park(en|platz|haus|ing)?|wohnmobil|stellplatz|camper|motorhome/i, to: "anreise-parken", topic: "anreise" },
  { test: /\bbus\b|ortsbus|öpnv|gästekarte|gastkarte|guest card|public transport/i, to: "anreise-bus", topic: "anreise" },
  { test: /loipe|loipenpass|cross.?country|trail pass/i, to: "winter-loipe", topic: "winter" },
  { test: /verleih|ausleih|mieten|\brental\b|\bhire\b|\brent\b/i, to: "winter-verleih", topic: "winter" },
  // Wortgrenze auch vorn, sonst gilt jeder Bahnhof als Bauernhof.
  { test: /bauernhof|\bhof\b|\bfarm\b/i, to: "unterkunft-hof", topic: "unterkunft" },
  { test: /barrierefrei|rollstuhl|reisen für alle|accessible|wheelchair/i, to: "unterkunft-barrierefrei", topic: "unterkunft" },
  { test: /wickel|stillen|baby|nappy|nappies|changing table|breastfeed/i, to: "familie-baby", topic: "familie" },
  { test: /spielplatz|playground/i, to: "essen-huette", topic: "essen" },
  { test: /ruhetag|geschlossen|closing day|closed/i, to: "essen-ruhetag", topic: "essen" },
  {
    test: /wander|tour\b|wandern|gipfel|rauschberg|unternberg|sonntagshorn|bergbahn|gondel|seilbahn|sessel(bahn|lift)|hütte|hüttenwanderung|hik(e|ing)|\btrail|summit|cable car|mountain lift/i,
    to: "wandern",
    topic: "wandern",
  },
  {
    test: /event|veranstalt|konzert|markt|programm|was ist los|heute abend|concert|festival|what.s on/i,
    to: "events",
    topic: "events",
  },
  {
    // "bahn" mit Wortgrenze, sonst zieht jede Bergbahn, Seilbahn und
    // Sesselbahn das Thema Anreise in die Frage hinein.
    test: /anreise|anfahrt|autobahn|\ba8\b|\bzug\b|bahnhof|\bbahn\b|münchen|route|navigation|wie komme ich|how do i get|get(ting)? (here|there)|\btrain\b|\bstation\b|motorway/i,
    to: "anreise",
    topic: "anreise",
  },
  {
    test: /wetter|regen|sonne|temperatur|gewitter|prognose|vorhersage|schnee(lage)?|weather|\brain|forecast|temperature|thunderstorm/i,
    to: "wetter",
    topic: "wetter",
  },
  {
    test: /essen|restaurant|gasthaus|einkehr|hunger|pizzeria|wirt|frühstück|kulinar|\beat\b|\bfood\b|dinner|lunch|breakfast|hungry/i,
    to: "essen",
    topic: "essen",
  },
  {
    // Wortgrenze hinter der Endung, sonst zieht "Kinderwagen" das Thema
    // Familie in eine Wanderfrage hinein und macht sie künstlich mehrdeutig.
    test: /kind(er|ern)?\b|familie|freizeitpark|vitalwelt|schwimmbad|child(ren)?\b|\bkids?\b|family|swimming/i,
    to: "familie",
    topic: "familie",
  },
  {
    test: /winter|langlauf|ski\b|skifahren|rodel|schlitten|eislauf|skiing|sledg(e|ing)|toboggan|skating/i,
    to: "winter",
    topic: "winter",
  },
  {
    test: /übernacht|unterkunft|hotel|ferienwohnung|zimmer|pension|schlafen|apartment|\bstay\b|accommodation|\broom\b|guest house|\bsleep\b/i,
    to: "unterkunft",
    topic: "unterkunft",
  },
  {
    test: /öffnungszeit|kontakt|telefon|adresse|erreichen|tourist.?info|e-?mail|anschrift|opening hours|contact|phone|address|tourist information/i,
    to: "info",
    topic: "info",
  },
  {
    test: /hallo|grüß|servus|\bhi\b|\bhey\b|guten (tag|morgen|abend)|moin|hello|good (morning|afternoon|evening)/i,
    to: "menu",
    topic: SMALLTALK,
  },
]

export type MatchResult =
  | { kind: "hit"; to: string }
  | { kind: "ambiguous"; candidates: Chip[]; term: string | null }
  | { kind: "miss"; term: string | null }

/**
 * Ordnet freien Text zu. Anders als früher bricht die Suche nicht beim ersten
 * Treffer ab: greifen Muster aus mehreren Themen, ist die Eingabe mehrdeutig
 * und wird zur Rückfrage, statt stillschweigend das erste Thema zu nehmen.
 */
export function matchIntent(text: string): MatchResult {
  const treffer = INTENTS.filter((intent) => intent.test.test(text))
  const term = leitbegriff(text)

  const inhaltlich = treffer.filter((intent) => intent.topic !== SMALLTALK)
  const relevant = inhaltlich.length > 0 ? inhaltlich : treffer

  if (relevant.length === 0) return { kind: "miss", term }

  // Set erhält die Reihenfolge des ersten Auftretens, also die des
  // spezifischsten Musters.
  const themen = [...new Set(relevant.map((intent) => intent.topic))]
  if (themen.length === 1) return { kind: "hit", to: relevant[0].to }

  const candidates: Chip[] = themen.slice(0, 3).map((thema) => ({
    // Deutsches Label; rueckfrageKnoten tauscht es für Englisch aus.
    label: TOPICS.find((topic) => topic.id === thema)?.label ?? thema,
    // Ziel ist der spezifischste Knoten dieses Themas, nicht der
    // Themeneinstieg. So landet die Testperson direkt bei ihrer Frage.
    to: relevant.find((intent) => intent.topic === thema)!.to,
  }))

  return { kind: "ambiguous", candidates, term }
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
  return sprache === "en" ? `${davor} or ${letztes}` : `${davor} oder ${letztes}`
}

/** Die Rückfrage als fertiger Knoten, mit den Kandidaten als Chips. */
export function rueckfrageKnoten(
  candidates: Chip[],
  term: string | null,
  sprache: Sprache = "de",
): FlowNode {
  const themen = aufzaehlung(
    candidates.map((chip) => {
      const topic = TOPICS.find((eintrag) => chip.to.startsWith(eintrag.id))
      if (!topic) return chip.label
      return sprache === "en" ? topic.satzEn : topic.satz
    }),
    sprache,
  )

  const vorlage =
    sprache === "en"
      ? waehleVariante(RUECKFRAGEN_EN)
      : waehleVariante(
          term ? [...RUECKFRAGEN, ...RUECKFRAGEN_MIT_BEGRIFF] : RUECKFRAGEN,
        )

  return {
    id: "rueckfrage-mehrdeutig",
    messages: [
      vorlage.replace("{themen}", themen).replace("{begriff}", term ?? ""),
    ],
    chips: [
      ...candidates.map((chip) => {
        const topic = TOPICS.find((eintrag) => chip.to.startsWith(eintrag.id))
        if (!topic || sprache !== "en") return chip
        return { ...chip, label: topic.labelEn }
      }),
      { label: sprache === "en" ? "Something else" : "Andere Frage", to: "menu" },
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

export function getNode(id: string): FlowNode {
  return FLOW[id] ?? NOTKNOTEN
}
