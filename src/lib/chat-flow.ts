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
}

/** Thema für die Startauswahl und das Menü. */
export type Topic = {
  id: string
  label: string
  icon: LucideIcon
}

export const TOPICS: Topic[] = [
  { id: "wandern", label: "Wandern & Bergbahnen", icon: Mountain },
  { id: "events", label: "Veranstaltungen", icon: CalendarDays },
  { id: "anreise", label: "Anreise & Parken", icon: Bus },
  { id: "wetter", label: "Wetter & Bergwetter", icon: CloudSun },
  { id: "essen", label: "Essen & Einkehr", icon: Utensils },
  { id: "familie", label: "Mit Kindern unterwegs", icon: Users },
  { id: "winter", label: "Winter & Langlauf", icon: Snowflake },
  { id: "unterkunft", label: "Übernachten", icon: BedDouble },
  { id: "info", label: "Tourist-Information", icon: Info },
]

const menuChips: Chip[] = TOPICS.map((topic) => ({
  label: topic.label,
  to: topic.id,
}))

const backChips = (topic: string): Chip[] => [
  { label: "Zurück zum Thema", to: topic },
  { label: "Andere Frage", to: "menu" },
]

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

  fallback: {
    id: "fallback",
    messages: [
      "Das habe ich leider nicht verstanden. Ich bin ein Prototyp mit vorgegebenen Themen. Wähle am besten eines davon aus:",
    ],
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
      "Ruhpolding hat rund 250 km markierte Wanderwege. Beliebt sind der Rauschberg mit der Gondelbahn ab dem Ort, der Unternberg mit der Sesselbahn und die flache Runde um den Förchensee.",
      "Die Bergbahnen fahren im Sommer täglich von 9:00 bis 16:30 Uhr, letzte Bergfahrt um 16:00 Uhr.",
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
      "Für den Kinderwagen eignet sich der Rundweg am Förchensee (etwa 3 km, eben) oder der Uferweg entlang der Traun. Beide sind ganzjährig begehbar und brauchen keine Bergausrüstung.",
    ],
    chips: backChips("wandern"),
  },
  "wandern-schwer": {
    id: "wandern-schwer",
    messages: [
      "Anspruchsvoll ist der Aufstieg auf das Sonntagshorn (1.961 m), den höchsten Berg der Chiemgauer Alpen. Gehzeit rund 4 Stunden ab dem Parkplatz Vorderlahnerkopf, festes Schuhwerk und Trittsicherheit vorausgesetzt.",
    ],
    chips: backChips("wandern"),
  },
  "bergbahn-preise": {
    id: "bergbahn-preise",
    messages: ["Hier die Sommerpreise der beiden Bergbahnen."],
    card: {
      title: "Bergbahnen Ruhpolding, Sommer",
      rows: [
        { label: "Rauschberg, Berg- und Talfahrt", value: "Erwachsene 24,00 €" },
        { label: "Unternberg, Berg- und Talfahrt", value: "Erwachsene 19,50 €" },
        { label: "Kinder 6 bis 15 Jahre", value: "50 % Ermäßigung" },
        { label: "mit Gästekarte", value: "20 % Ermäßigung" },
      ],
      note: "Preise nur zu Demonstrationszwecken.",
    },
    chips: backChips("wandern"),
  },

  events: {
    id: "events",
    messages: [
      "Feste Termine im Jahr: der Biathlon-Weltcup in der Chiemgau Arena im Januar, die Ruhpoldinger Sommerkonzerte am Kurpark (Mai bis September, mittwochs 20:00 Uhr) und der Wochenmarkt jeden Freitag von 8:00 bis 12:00 Uhr am Rathausplatz.",
    ],
    chips: [
      { label: "Biathlon-Weltcup", to: "events-biathlon" },
      { label: "Was ist diese Woche los?", to: "events-woche" },
      { label: "Andere Frage", to: "menu" },
    ],
  },
  "events-biathlon": {
    id: "events-biathlon",
    messages: [
      "Der BMW IBU Weltcup Biathlon findet vom 8. bis 12. Januar in der Chiemgau Arena statt. Tickets gibt es online und an der Tageskasse. Vom Ortszentrum fährt ein kostenloser Skibus im 15-Minuten-Takt zur Arena.",
    ],
    chips: backChips("events"),
  },
  "events-woche": {
    id: "events-woche",
    messages: [
      "Diese Woche (Demo-Auswahl): Mittwoch 20:00 Uhr Standkonzert der Trachtenkapelle am Kurpark, Donnerstag 10:00 Uhr geführte Kräuterwanderung (Anmeldung in der Tourist-Info), Freitag 8:00 Uhr Wochenmarkt am Rathausplatz.",
    ],
    chips: backChips("events"),
  },

  anreise: {
    id: "anreise",
    messages: [
      "Mit dem Auto über die A8 bis zur Ausfahrt Siegsdorf, dann die B306, rund 10 Minuten.",
      "Mit der Bahn stündlich ab München Hauptbahnhof nach Ruhpolding, Fahrzeit etwa 1:40 Stunden. Der Bahnhof liegt 10 Gehminuten vom Zentrum.",
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
        { label: "Parkplatz Rathaus", value: "1,00 €/Std., Tageskarte 6,00 €" },
        { label: "Wanderparkplatz Laubau", value: "kostenlos" },
        { label: "Parkhaus Vitalwelt", value: "1,50 €/Std." },
        { label: "Wohnmobile", value: "Stellplatz an der Chiemgau Arena" },
      ],
      note: "Mit der Gästekarte sind die Ortsparkplätze frei.",
    },
    chips: backChips("anreise"),
  },
  "anreise-bus": {
    id: "anreise-bus",
    messages: [
      "Der Ortsbus (Linie 9495) fährt werktags im Stundentakt zwischen Bahnhof, Zentrum und den Talstationen. Mit der Gästekarte GUEST ist die Fahrt im gesamten Chiemgau kostenlos, inklusive der Regionalzüge bis Traunstein.",
    ],
    chips: backChips("anreise"),
  },

  wetter: {
    id: "wetter",
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
    messages: [
      "Demo-Prognose: Mittwoch sonnig 24 °C, Donnerstag wechselhaft 19 °C mit Schauern, Freitag stabil 21 °C. Die Gewitterneigung ist am Donnerstag am höchsten.",
    ],
    chips: backChips("wetter"),
  },
  "wetter-webcam": {
    id: "wetter-webcam",
    messages: [
      "Live-Webcams gibt es von der Rauschberg-Bergstation, der Chiemgau Arena und vom Rathausplatz. In der echten Anwendung würden hier die aktuellen Bilder erscheinen.",
    ],
    chips: backChips("wetter"),
  },

  essen: {
    id: "essen",
    messages: [
      "Von der Berghütte bis zum gehobenen Lokal ist alles da. Auf dem Rauschberg die Gipfelalm mit Panoramaterrasse, im Ort das Gasthaus zur Post mit bayerischer Küche und die Pizzeria am Dorfplatz. Gehoben isst man im Restaurant des Hotels Steinbach.",
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
      "Spielplatz direkt an der Hütte: das Unternberg-Almstüberl neben der Bergstation, die Weitseealm am Langlaufzentrum und die Laubaualm am Wanderparkplatz. Alle drei sind gut mit dem Kinderwagen erreichbar.",
    ],
    chips: backChips("essen"),
  },
  "essen-ruhetag": {
    id: "essen-ruhetag",
    messages: [
      "Viele Gasthäuser im Ort haben Montag oder Dienstag Ruhetag. Die Berggastronomie an den Bahnen hat im Sommer durchgehend geöffnet. Eine tagesaktuelle Übersicht liegt in der Tourist-Info aus.",
    ],
    chips: backChips("essen"),
  },

  familie: {
    id: "familie",
    messages: [
      "Für Familien lohnen sich der Freizeitpark Ruhpolding mit Märchenwald und Fahrgeschäften (ab 9:30 Uhr), die Vitalwelt mit Kinderbecken und Rutsche und der Barfußweg am Förchensee. Bei Regen ist das Bergbahn-Museum eine Option.",
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
      "Schlechtwetter-Programm: die Vitalwelt mit Hallenbad und Sauna, der Freizeitpark mit überdachten Bereichen, die Kletterhalle in Inzell (15 Minuten) und das Heimatmuseum. Die Tourist-Info hat eine Bastelecke für Kinder.",
    ],
    chips: backChips("familie"),
  },
  "familie-baby": {
    id: "familie-baby",
    messages: [
      "Wickelmöglichkeiten gibt es in der Tourist-Info, in der Vitalwelt und an den Talstationen von Rauschberg und Unternberg. Die meisten Cafés im Ort stellen bei Bedarf gern warmes Wasser bereit.",
    ],
    chips: backChips("familie"),
  },

  winter: {
    id: "winter",
    messages: [
      "Ruhpolding ist ein Zentrum für Langlauf: rund 75 km gespurte Loipen und das Wettkampfstadion in der Chiemgau Arena, das öffentlich genutzt werden kann. Alpin gibt es kleinere Skigebiete am Westernberg und in Inzell.",
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
        { label: "Loipennetz", value: "ca. 75 km, klassisch und Skating" },
        { label: "Loipenpass Tag", value: "5,00 €" },
        { label: "Loipenpass Woche", value: "20,00 €" },
        { label: "mit Gästekarte", value: "Loipen kostenlos" },
      ],
      note: "Schneelage und Spurbericht in der echten Anwendung tagesaktuell.",
    },
    chips: backChips("winter"),
  },
  "winter-verleih": {
    id: "winter-verleih",
    messages: [
      "Sportgeschäfte mit Verleih: Sport Amort am Dorfplatz, der Skiverleih an der Talstation Westernberg und der Langlauf-Shop an der Chiemgau Arena. In der Ferienzeit ist eine Reservierung empfehlenswert.",
    ],
    chips: backChips("winter"),
  },

  unterkunft: {
    id: "unterkunft",
    messages: [
      "Vom Ferienzimmer über den Bauernhof bis zum 4-Sterne-Hotel ist das Angebot breit. Buchbar ist alles über die offizielle Gästekarten-Plattform oder direkt bei den Gastgebern. Die Tourist-Info vermittelt bei freier Kapazität auch spontan.",
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
      "Rund 20 Höfe in Ruhpolding bieten Urlaub am Bauernhof an, viele mit Tieren zum Mitversorgen und eigener Almhütte. Diese Betriebe sind oft Monate im Voraus ausgebucht, eine frühe Anfrage lohnt sich.",
    ],
    chips: backChips("unterkunft"),
  },
  "unterkunft-barrierefrei": {
    id: "unterkunft-barrierefrei",
    messages: [
      "Mehrere Häuser sind nach dem Standard Reisen für Alle zertifiziert, darunter zwei Hotels im Zentrum und ein Gästehaus am Kurpark. Die Vitalwelt und die Rauschberg-Gondel sind rollstuhlgerecht.",
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
        { label: "Adresse", value: "Hauptstraße 60, 83324 Ruhpolding" },
        { label: "Telefon", value: "08663 8806-0" },
        { label: "E-Mail", value: "info@ruhpolding.de" },
        { label: "Öffnungszeiten", value: "Mo bis Fr 8:30 bis 17:00, Sa 9:00 bis 12:00" },
      ],
      note: "Kontaktdaten nur zu Demonstrationszwecken.",
    },
    chips: [{ label: "Andere Frage", to: "menu" }],
  },
}

type Intent = { test: RegExp; to: string }

/** Reihenfolge zählt: spezielle Muster vor allgemeinen. */
const INTENTS: Intent[] = [
  { test: /danke|vielen dank|passt|super|klasse|top\b/i, to: "danke" },
  { test: /biathlon|weltcup|arena/i, to: "events-biathlon" },
  { test: /webcam|kamera/i, to: "wetter-webcam" },
  { test: /park(en|platz|haus)?|wohnmobil|stellplatz/i, to: "anreise-parken" },
  { test: /\bbus\b|ortsbus|öpnv|gästekarte|gastkarte|guest/i, to: "anreise-bus" },
  { test: /loipe|loipenpass/i, to: "winter-loipe" },
  { test: /verleih|ausleih|mieten/i, to: "winter-verleih" },
  { test: /bauernhof|hof\b/i, to: "unterkunft-hof" },
  { test: /barrierefrei|rollstuhl|reisen für alle/i, to: "unterkunft-barrierefrei" },
  { test: /wickel|stillen|baby/i, to: "familie-baby" },
  { test: /spielplatz/i, to: "essen-huette" },
  { test: /ruhetag|geschlossen/i, to: "essen-ruhetag" },
  {
    test: /wander|tour\b|wandern|gipfel|rauschberg|unternberg|sonntagshorn|bergbahn|gondel|seilbahn|sessel(bahn|lift)|hütte|hüttenwanderung/i,
    to: "wandern",
  },
  { test: /event|veranstalt|konzert|markt|programm|was ist los|heute abend/i, to: "events" },
  { test: /anreise|anfahrt|autobahn|\ba8\b|\bzug\b|bahn|münchen|route|navigation|wie komme ich/i, to: "anreise" },
  { test: /wetter|regen|sonne|temperatur|gewitter|prognose|vorhersage|schnee(lage)?/i, to: "wetter" },
  { test: /essen|restaurant|gasthaus|einkehr|hunger|pizzeria|wirt|frühstück|kulinar/i, to: "essen" },
  { test: /kind(er)?|familie|freizeitpark|vitalwelt|schwimmbad/i, to: "familie" },
  { test: /winter|langlauf|ski\b|skifahren|rodel|schlitten|eislauf/i, to: "winter" },
  { test: /übernacht|unterkunft|hotel|ferienwohnung|zimmer|pension|schlafen|apartment/i, to: "unterkunft" },
  {
    test: /öffnungszeit|kontakt|telefon|adresse|erreichen|tourist.?info|e-?mail|anschrift/i,
    to: "info",
  },
  { test: /hallo|grüß|servus|\bhi\b|\bhey\b|guten (tag|morgen|abend)|moin/i, to: "menu" },
]

/** Ordnet freien Text einem Knoten zu, sonst dem Fallback. */
export function matchIntent(text: string): string {
  for (const intent of INTENTS) {
    if (intent.test.test(text)) {
      return intent.to
    }
  }
  return "fallback"
}

export function getNode(id: string): FlowNode {
  return FLOW[id] ?? FLOW.fallback
}
