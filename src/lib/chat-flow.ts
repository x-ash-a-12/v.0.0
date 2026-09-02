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

import { leitbegriff } from "@/lib/sprache"
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

/** Ein Knoten im vordefinierten Gesprächsbaum. */
export type FlowNode = {
  id: string
  /** Jeder Eintrag wird zu einer eigenen Sprechblase. */
  messages: string[]
  card?: InfoCard
  chips?: Chip[]
  /**
   * Erzwingt eine Überbrückung vor der Antwort. Knoten mit Karte bekommen
   * sie ohnehin, hier steht sie für Antworten, bei denen Nachschlagen
   * plausibel wirkt.
   */
  bridge?: boolean
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
  icon: LucideIcon
}

export const TOPICS: Topic[] = [
  {
    id: "wandern",
    label: "Wandern & Bergbahnen",
    satz: "Wandern und die Bergbahnen",
    icon: Mountain,
  },
  {
    id: "events",
    label: "Veranstaltungen",
    satz: "Veranstaltungen im Ort",
    icon: CalendarDays,
  },
  {
    id: "anreise",
    label: "Anreise & Parken",
    satz: "Anreise und Parken",
    icon: Bus,
  },
  {
    id: "wetter",
    label: "Wetter & Bergwetter",
    satz: "das Wetter",
    icon: CloudSun,
  },
  {
    id: "essen",
    label: "Essen & Einkehr",
    satz: "Essen und Einkehr",
    icon: Utensils,
  },
  {
    id: "familie",
    label: "Mit Kindern unterwegs",
    satz: "Angebote für Familien",
    icon: Users,
  },
  {
    id: "winter",
    label: "Winter & Langlauf",
    satz: "Winter und Langlauf",
    icon: Snowflake,
  },
  {
    id: "unterkunft",
    label: "Übernachten",
    satz: "eine Unterkunft",
    icon: BedDouble,
  },
  {
    id: "info",
    label: "Tourist-Information",
    satz: "die Tourist-Information",
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
      "Wobei kann ich helfen? Du kannst ein Thema wählen oder frei tippen.",
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
    messages: [
      `Ruhpolding hat ${WANDERN.wegenetz} markierte Wanderwege. Beliebt sind der ${BERGBAHNEN.rauschbergName} mit der ${BERGBAHNEN.rauschbergBahn} ab dem Ort, der ${BERGBAHNEN.unternbergName} mit der ${BERGBAHNEN.unternbergBahn} und die flache Runde um den ${WANDERN.foerchensee}.`,
      `Die Bergbahnen fahren im Sommer täglich von ${BERGBAHNEN.betriebszeitSommer}, letzte Bergfahrt um ${BERGBAHNEN.letzteBergfahrt}.`,
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
    chips: backChips("wandern"),
  },
  "wandern-schwer": {
    id: "wandern-schwer",
    messages: [
      `Anspruchsvoll ist der Aufstieg auf das ${WANDERN.sonntagshorn} (${WANDERN.sonntagshornHoehe}), den höchsten Berg der Chiemgauer Alpen. Gehzeit ${WANDERN.sonntagshornGehzeit} ab dem ${WANDERN.sonntagshornStart}, festes Schuhwerk und Trittsicherheit vorausgesetzt.`,
    ],
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
    chips: backChips("wandern"),
  },

  events: {
    id: "events",
    messages: [
      `Feste Termine im Jahr: der ${EVENTS.biathlonKurz} in der ${EVENTS.chiemgauArena} ${EVENTS.biathlonMonat}, die ${EVENTS.sommerkonzerte} am ${EVENTS.kurpark} (${EVENTS.sommerkonzerteZeit}) und der ${EVENTS.wochenmarkt} ${EVENTS.wochenmarktZeit} am ${EVENTS.rathausplatz}.`,
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
      `Der ${EVENTS.biathlonName} findet ${EVENTS.biathlonTermin} in der ${EVENTS.chiemgauArena} statt. Tickets gibt es online und an der Tageskasse. Vom Ortszentrum fährt ein kostenloser Skibus im ${EVENTS.skibusTakt} zur Arena.`,
    ],
    chips: backChips("events"),
  },
  "events-woche": {
    id: "events-woche",
    // SIMULIERT: tagesaktuelle Angabe, im Prototyp ohne Datenanbindung nicht
    // echt darstellbar. In Abschnitt 4.4 der Arbeit als Grenze auszuweisen.
    messages: [
      "Diese Woche (Demo-Auswahl): Mittwoch 20:00 Uhr Standkonzert der Trachtenkapelle am Kurpark, Donnerstag 10:00 Uhr geführte Kräuterwanderung (Anmeldung in der Tourist-Info), Freitag 8:00 Uhr Wochenmarkt am Rathausplatz.",
    ],
    chips: backChips("events"),
  },

  anreise: {
    id: "anreise",
    messages: [
      `Mit dem Auto über die ${ANREISE.autobahn} bis zur Ausfahrt ${ANREISE.ausfahrt}, dann die ${ANREISE.bundesstrasse}, ${ANREISE.fahrzeitAbAusfahrt}.`,
      `Mit der Bahn ${ANREISE.bahnTakt} ab ${ANREISE.bahnAbfahrtsort} nach Ruhpolding, Fahrzeit ${ANREISE.bahnFahrzeit}. Der Bahnhof liegt ${ANREISE.bahnhofZumZentrum} vom Zentrum.`,
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
    chips: backChips("anreise"),
  },
  "anreise-bus": {
    id: "anreise-bus",
    messages: [
      `Der Ortsbus (${ANREISE.ortsbusLinie}) fährt ${ANREISE.ortsbusTakt} zwischen Bahnhof, Zentrum und den Talstationen. Mit der Gästekarte ${ANREISE.gaestekarteName} ist die Fahrt im gesamten Chiemgau kostenlos, inklusive der Regionalzüge bis ${ANREISE.gaestekarteBahnBis}.`,
    ],
    chips: backChips("anreise"),
  },

  wetter: {
    id: "wetter",
    // SIMULIERT: tagesaktuelle Angabe, im Prototyp ohne Datenanbindung nicht
    // echt darstellbar. In Abschnitt 4.4 der Arbeit als Grenze auszuweisen.
    messages: [
      "Aktuelle Demo-Lage: heute heiter bei 22 °C im Tal, Nullgradgrenze bei 3.200 m, schwacher Wind. Für morgen sind am Nachmittag Wärmegewitter möglich, ein früher Tourenstart ist ratsam.",
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
    chips: backChips("wetter"),
  },
  "wetter-webcam": {
    id: "wetter-webcam",
    // SIMULIERT: Livebilder, im Prototyp ohne Datenanbindung nicht echt
    // darstellbar. In Abschnitt 4.4 der Arbeit als Grenze auszuweisen.
    messages: [
      `Live-Webcams gibt es von der ${BERGBAHNEN.rauschbergName}-Bergstation, der ${EVENTS.chiemgauArena} und vom ${EVENTS.rathausplatz}. In der echten Anwendung würden hier die aktuellen Bilder erscheinen.`,
    ],
    chips: backChips("wetter"),
  },

  essen: {
    id: "essen",
    messages: [
      `Von der Berghütte bis zum gehobenen Lokal ist alles da. Auf dem ${BERGBAHNEN.rauschbergName} die ${GASTRONOMIE.gipfelalm} mit Panoramaterrasse, im Ort das ${GASTRONOMIE.gasthausPost} mit bayerischer Küche und die ${GASTRONOMIE.pizzeria}. Gehoben isst man im Restaurant des Hotels ${GASTRONOMIE.hotelGehoben}.`,
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
    chips: backChips("essen"),
  },
  "essen-ruhetag": {
    id: "essen-ruhetag",
    messages: [
      `Viele Gasthäuser im Ort haben ${GASTRONOMIE.ruhetage} Ruhetag. Die Berggastronomie an den Bahnen hat im Sommer durchgehend geöffnet. Eine tagesaktuelle Übersicht liegt in der Tourist-Info aus.`,
    ],
    chips: backChips("essen"),
  },

  familie: {
    id: "familie",
    messages: [
      `Für Familien lohnen sich der ${FAMILIE.freizeitpark} mit Märchenwald und Fahrgeschäften (${FAMILIE.freizeitparkOeffnung}), die ${FAMILIE.vitalwelt} mit Kinderbecken und Rutsche und der ${FAMILIE.barfussweg} am ${WANDERN.foerchensee}. Bei Regen ist das ${FAMILIE.bergbahnMuseum} eine Option.`,
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
    chips: backChips("familie"),
  },
  "familie-baby": {
    id: "familie-baby",
    messages: [
      `Wickelmöglichkeiten gibt es in der Tourist-Info, in der ${FAMILIE.vitalwelt} und an den Talstationen von ${BERGBAHNEN.rauschbergName} und ${BERGBAHNEN.unternbergName}. Die meisten Cafés im Ort stellen bei Bedarf gern warmes Wasser bereit.`,
    ],
    chips: backChips("familie"),
  },

  winter: {
    id: "winter",
    messages: [
      `Ruhpolding ist ein Zentrum für Langlauf: rund ${LOIPEN.netz} gespurte Loipen und das Wettkampfstadion in der ${EVENTS.chiemgauArena}, das öffentlich genutzt werden kann. Alpin gibt es kleinere Skigebiete am ${WINTER.skigebiet} und in Inzell.`,
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
    chips: backChips("winter"),
  },
  "winter-verleih": {
    id: "winter-verleih",
    messages: [
      `Sportgeschäfte mit Verleih: ${WINTER.sportgeschaeft} am Dorfplatz, der Skiverleih an der Talstation ${WINTER.skigebiet} und der ${WINTER.langlaufShop} an der ${EVENTS.chiemgauArena}. In der Ferienzeit ist eine Reservierung empfehlenswert.`,
    ],
    chips: backChips("winter"),
  },

  unterkunft: {
    id: "unterkunft",
    messages: [
      `Vom Ferienzimmer über den Bauernhof bis zum ${UNTERKUNFT.hoechsteKategorie} ist das Angebot breit. Buchbar ist alles über die offizielle Gästekarten-Plattform oder direkt bei den Gastgebern. Die Tourist-Info vermittelt bei freier Kapazität auch spontan.`,
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
    chips: backChips("unterkunft"),
  },
  "unterkunft-barrierefrei": {
    id: "unterkunft-barrierefrei",
    messages: [
      `Mehrere Häuser sind nach dem Standard ${UNTERKUNFT.zertifizierung} zertifiziert, darunter ${UNTERKUNFT.barrierefreiHaeuser}. Die ${FAMILIE.vitalwelt} und die ${BERGBAHNEN.rauschbergName}-Gondel sind rollstuhlgerecht.`,
    ],
    chips: backChips("unterkunft"),
  },

  info: {
    id: "info",
    messages: [
      "Hier die Kontaktdaten der Tourist-Information. Vor Ort helfen dir die Mitarbeitenden auch persönlich weiter.",
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
  { test: /danke|vielen dank|passt|super|klasse|top\b/i, to: "danke", topic: SMALLTALK },
  { test: /biathlon|weltcup|arena/i, to: "events-biathlon", topic: "events" },
  { test: /webcam|kamera/i, to: "wetter-webcam", topic: "wetter" },
  { test: /park(en|platz|haus)?|wohnmobil|stellplatz/i, to: "anreise-parken", topic: "anreise" },
  { test: /\bbus\b|ortsbus|öpnv|gästekarte|gastkarte|guest/i, to: "anreise-bus", topic: "anreise" },
  { test: /loipe|loipenpass/i, to: "winter-loipe", topic: "winter" },
  { test: /verleih|ausleih|mieten/i, to: "winter-verleih", topic: "winter" },
  // Wortgrenze auch vorn, sonst gilt jeder Bahnhof als Bauernhof.
  { test: /bauernhof|\bhof\b/i, to: "unterkunft-hof", topic: "unterkunft" },
  { test: /barrierefrei|rollstuhl|reisen für alle/i, to: "unterkunft-barrierefrei", topic: "unterkunft" },
  { test: /wickel|stillen|baby/i, to: "familie-baby", topic: "familie" },
  { test: /spielplatz/i, to: "essen-huette", topic: "essen" },
  { test: /ruhetag|geschlossen/i, to: "essen-ruhetag", topic: "essen" },
  {
    test: /wander|tour\b|wandern|gipfel|rauschberg|unternberg|sonntagshorn|bergbahn|gondel|seilbahn|sessel(bahn|lift)|hütte|hüttenwanderung/i,
    to: "wandern",
    topic: "wandern",
  },
  {
    test: /event|veranstalt|konzert|markt|programm|was ist los|heute abend/i,
    to: "events",
    topic: "events",
  },
  {
    // "bahn" mit Wortgrenze, sonst zieht jede Bergbahn, Seilbahn und
    // Sesselbahn das Thema Anreise in die Frage hinein.
    test: /anreise|anfahrt|autobahn|\ba8\b|\bzug\b|bahnhof|\bbahn\b|münchen|route|navigation|wie komme ich/i,
    to: "anreise",
    topic: "anreise",
  },
  {
    test: /wetter|regen|sonne|temperatur|gewitter|prognose|vorhersage|schnee(lage)?/i,
    to: "wetter",
    topic: "wetter",
  },
  {
    test: /essen|restaurant|gasthaus|einkehr|hunger|pizzeria|wirt|frühstück|kulinar/i,
    to: "essen",
    topic: "essen",
  },
  {
    // Wortgrenze hinter der Endung, sonst zieht "Kinderwagen" das Thema
    // Familie in eine Wanderfrage hinein und macht sie künstlich mehrdeutig.
    test: /kind(er|ern)?\b|familie|freizeitpark|vitalwelt|schwimmbad/i,
    to: "familie",
    topic: "familie",
  },
  {
    test: /winter|langlauf|ski\b|skifahren|rodel|schlitten|eislauf/i,
    to: "winter",
    topic: "winter",
  },
  {
    test: /übernacht|unterkunft|hotel|ferienwohnung|zimmer|pension|schlafen|apartment/i,
    to: "unterkunft",
    topic: "unterkunft",
  },
  {
    test: /öffnungszeit|kontakt|telefon|adresse|erreichen|tourist.?info|e-?mail|anschrift/i,
    to: "info",
    topic: "info",
  },
  {
    test: /hallo|grüß|servus|\bhi\b|\bhey\b|guten (tag|morgen|abend)|moin/i,
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

/** "A oder B", bei dreien "A, B oder C". */
function aufzaehlung(teile: string[]): string {
  if (teile.length <= 1) return teile[0] ?? ""
  return `${teile.slice(0, -1).join(", ")} oder ${teile[teile.length - 1]}`
}

/** Die Rückfrage als fertiger Knoten, mit den Kandidaten als Chips. */
export function rueckfrageKnoten(
  candidates: Chip[],
  term: string | null,
): FlowNode {
  const themen = aufzaehlung(
    candidates.map(
      (chip) =>
        TOPICS.find((topic) => chip.to.startsWith(topic.id))?.satz ?? chip.label,
    ),
  )

  const vorlage = waehleVariante(
    term ? [...RUECKFRAGEN, ...RUECKFRAGEN_MIT_BEGRIFF] : RUECKFRAGEN,
  )

  return {
    id: "rueckfrage-mehrdeutig",
    messages: [
      vorlage.replace("{themen}", themen).replace("{begriff}", term ?? ""),
    ],
    chips: [...candidates, { label: "Andere Frage", to: "menu" }],
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
