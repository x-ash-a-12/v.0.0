import { TOPICS, type Chip, type FlowNode } from "@/lib/chat-flow"
import { WEB } from "@/lib/web"
import { type Sprache } from "@/lib/sprache"
import {
  ANREISE,
  BERGBAHNEN,
  EVENTS,
  FAMILIE,
  GASTRONOMIE,
  KULTUR,
  PARKEN,
  TOURIST_INFO,
  WANDERN,
  WINTER,
} from "@/lib/daten"

/**
 * Sprachumschaltung Deutsch und Englisch.
 *
 * Übersetzt ist der gesamte Gesprächsbaum: Begrüßung, Menü, die neun
 * Themen-Einstiege und alle Unterknoten, dazu die Beschriftungen der Karten
 * und Tabellen. Ein englischsprachiger Gast soll dieselben Auskünfte
 * bekommen wie ein deutschsprachiger, nicht eine gekürzte Fassung davon.
 *
 * Zahlen, Preise und Uhrzeiten stehen deshalb nur einmal in daten.ts und
 * werden von beiden Fassungen eingesetzt. Was übersetzt wird, ist der Text
 * darum herum. Eine Preisangabe kann so nicht in einer Sprache veralten und
 * in der anderen stehenbleiben.
 *
 * Eurobeträge behalten das deutsche Dezimalkomma, auch im englischen Text:
 * sie stehen an einem Gerät in Deutschland und sind dort so ausgezeichnet.
 */
/** Wortlisten zur Erkennung. Ab zwei Treffern gilt die Sprache als erkannt. */
const MARKER: Record<Sprache, string[]> = {
  en: [
    "the",
    "is",
    "are",
    "where",
    "how",
    "what",
    "can",
    "you",
    "i",
    "my",
    "do",
    "does",
    "there",
    "any",
    "please",
    "we",
    "me",
    "get",
    "to",
  ],
  de: [
    "der",
    "die",
    "das",
    "wo",
    "wie",
    "was",
    "kann",
    "ich",
    "mein",
    "gibt",
    "es",
    "und",
    "mit",
    "für",
    "bei",
    "einen",
    "eine",
    "sind",
    "wir",
  ],
}

const MINDESTTREFFER = 2

/**
 * Erkennt die Sprache einer Eingabe, oder null, wenn sie zu kurz oder zu
 * uneindeutig ist. Dann bleibt die zuletzt erkannte Sprache stehen.
 */
export function erkenneSprache(text: string): Sprache | null {
  const woerter = text
    .toLowerCase()
    .split(/[^a-zäöüß]+/)
    .filter(Boolean)
  const zaehle = (sprache: Sprache) =>
    woerter.filter((wort) => MARKER[sprache].includes(wort)).length

  const en = zaehle("en")
  const de = zaehle("de")

  if (en >= MINDESTTREFFER && en > de) return "en"
  if (de >= MINDESTTREFFER && de > en) return "de"
  return null
}

/** Hinweis beim Wechsel, damit der Sprung nicht unkommentiert passiert. */
export const WECHSELHINWEIS: Record<Sprache, string> = {
  en: "Sure, let's continue in English.",
  de: "Gern, wir machen auf Deutsch weiter.",
}

/** Einleitung, wenn nur die deutsche Fassung eines Knotens vorliegt. */
export const NUR_DEUTSCH = "I have the details in German only for now."

type Kartenzeile = { label: string; value: string }

type Uebersetzung = {
  messages: (string | string[])[]
  /** Kurzfassung für die Wiederholung, sofern der Knoten eine hat. */
  kurz?: (string | string[])[]
  /**
   * Beschriftungen, die nur an diesem Knoten gelten. Alles, was an mehreren
   * Knoten gleich heißt, steht in CHIPS_GLOBAL und muss hier nicht stehen.
   */
  chips?: Record<string, string>
  /** Karte, Tabelle und QR-Code, soweit der Knoten sie trägt. */
  card?: { title: string; rows: Kartenzeile[]; note?: string }
  table?: { title: string; columns: string[]; rows: string[][]; note?: string }
  qr?: { title: string; hint: string }
}

/**
 * Beschriftungen, die an mehreren Knoten vorkommen.
 *
 * Vorher stand jede Beschriftung in der Fassung jedes einzelnen Knotens, an
 * dem sie auftauchte. "Zurück zum Thema" hätte damit siebzehnmal gepflegt
 * werden müssen, "Weg zur Talstation" an vier Stellen, und genau diese
 * Lücken sind im Testlauf vom 17.09. als deutsche Schaltfläche unter einer
 * englischen Antwort aufgefallen.
 *
 * Deshalb liegt die Zuordnung Ziel zu Beschriftung jetzt an einer Stelle.
 * Ein Knoten kann sie überschreiben, wenn dieselbe Schaltfläche bei ihm
 * etwas anderes heißen soll, aber er muss nichts wiederholen.
 */
const CHIPS_GLOBAL: Record<string, string> = {
  ...Object.fromEntries(TOPICS.map((topic) => [topic.id, topic.labelEn])),
  menu: "Something else",
  // Unterknoten, die von mehreren Stellen aus angesteuert werden.
  bergbahnen: "Which mountain lifts are there?",
  "bergbahn-preise": "Lift prices",
  "wandern-leicht": "Easy walk with a pushchair",
  "wandern-schwer": "Demanding mountain tour",
  "events-biathlon": "Biathlon world cup",
  "events-woche": "What is on this week?",
  "anreise-parken": "Parking in the village",
  "anreise-bus": "Local bus & guest card",
  busnetz: "Which lines are there?",
  "wetter-3tage": "Three day mountain forecast",
  "wetter-webcam": "Webcams",
  "essen-huette": "Huts with a playground",
  "essen-ruhetag": "Mind the closing days",
  "familie-regen": "Things to do in the rain",
  "familie-baby": "Changing & feeding",
  "winter-loipe": "Trails & trail pass",
  "winter-verleih": "Ski hire",
  "unterkunft-hof": "Farm holidays",
  "unterkunft-barrierefrei": "Accessible stays",
  "qr-hinweis": "How does the QR code work?",
  "empfehlung:hier:0": "What can I do here?",
  "bedarf:": "What can I do here?",
  "dienst:ortsplan": "Village map",
  "dienst:tickets": "Buy tickets",
  hinweise: "Current notices",
  info: "Tourist information",
  "zettel:neu:info": "Add to my notes",
  "empfehlung:essen:0": "Suggestions for eating out",
  "fahrplan:traunstein": "Train to Traunstein",
  // Wege zu einzelnen Zielen.
  "ziel:rauschberg": `Route to the ${BERGBAHNEN.rauschbergName} valley station`,
  "ziel:foerchensee": `Route to the ${WANDERN.foerchensee}`,
  "ziel:taubensee": `Route to ${WANDERN.taubenseeEn}`,
  "ziel:unternberg": `Route to the ${BERGBAHNEN.unternbergName}`,
  "ziel:sonntagshorn": `Route to the ${WANDERN.sonntagshorn}`,
  "ziel:arena": `Route to the ${EVENTS.chiemgauArena}`,
  "ziel:rathausgarage": "Route to the car park",
  // Seiten auf ruhpolding.de (web.ts). Auch dort, wo die deutsche Aufschrift
  // eine eigene ist ("Alle Touren auf ruhpolding.de").
  ...Object.fromEntries(
    Object.values(WEB).map((seite) => [
      `web:${seite.id}`,
      `${seite.titelEn} on ruhpolding.de`,
    ])
  ),
  "web:alle-wandertouren": "All tours on ruhpolding.de",
  "web:wetter": "Forecast on ruhpolding.de",
  "web:webcams": "Webcams on ruhpolding.de",
  "web:unterkunft": "Search accommodation on ruhpolding.de",
}

const EN: Record<string, Uebersetzung> = {
  sport: {
    kurz: [
      "As I said: from tandem flights at the Unternberg to golf and the BergFit trail, there is plenty on offer.",
    ],
    messages: [
      "Ruhpolding has plenty on offer for sport: tandem paragliding and the Fly-Line at the Unternberg, golf and adventure golf, and the BergFit trail, which tests your fitness for the mountains.",
      "Cycling and mountain biking are part of it too, and in winter cross-country and downhill skiing. Shall I find something that suits you?",
    ],
    chips: {
      "bedarf:i=sport": "Yes, please",
      "bedarf:i=rad": "Cycling & MTB",
      winter: "Winter sports",
      "web:sport": "All sports on ruhpolding.de",
    },
  },
  start: {
    messages: [
      "Grüß Gott, and a warm welcome to Ruhpolding! Lovely to have you here. I am the digital assistant of the tourist information and I am happy to help with anything about your stay.",
      "You are currently at {standort:kurz}. Just tell me what you have in mind and I will find what suits you. Or tap a topic below.",
    ],
    chips: {
      "bedarf:": "What can I do here?",
      "dienst:ortsplan": "Village map & orientation",
      "fahrplan:traunstein": "Train & bus",
      hinweise: "Current notices",
      menu: "All topics",
    },
  },
  menu: {
    messages: [
      [
        "Of course. What else can I help you with?",
        "Gladly. What else would you like to know?",
      ],
    ],
  },
  danke: {
    messages: [
      "You are very welcome. Enjoy your stay in Ruhpolding, and if something else comes up tomorrow, just come back, you are no bother.",
    ],
  },
  /*
   * Die Meta-Knoten stehen bewusst auch auf Englisch bereit.
   *
   * "Where am I" und "what can you do" sind für einen englischsprachigen
   * Gast die ersten Eingaben überhaupt. Ausgerechnet dort mit dem Hinweis
   * zu antworten, die Auskunft liege nur auf Deutsch vor, würde die
   * Sprachumschaltung im Test genau an der Stelle entwerten, an der sie
   * zuerst auffällt.
   */
  standort: {
    messages: [
      "You are currently at {standort:kurz}, here in Ruhpolding in the Chiemgau.",
      "From here it is {naehe:touristinfo} to the tourist information.",
    ],
  },
  "ueber-mich": {
    messages: [
      "I am the digital assistant of the Ruhpolding tourist information, not a person. I cover the topics around your stay here: hiking and the mountain lifts, events, getting here and parking, the weather, food, things to do with children, winter, places to stay and the tourist information itself.",
      "Just type away, full sentences are fine. If I do not have something, I will say so.",
    ],
  },
  "qr-hinweis": {
    messages: [
      "For places where it helps, I show a QR code. Scan it with your phone camera and the route is on your own device. Tell me where you want to go and I will bring up the code.",
    ],
    chips: {
      "wandern-leicht": `Route to the ${WANDERN.foerchensee}`,
      "events-biathlon": `Route to the ${EVENTS.chiemgauArena}`,
      "anreise-parken": "Route to the car park",
      menu: "Something else",
    },
  },
  bergbahnen: {
    messages: [
      `There are two in the village: the ${BERGBAHNEN.unternbergBahnEn} up the ${BERGBAHNEN.unternbergName} and the Rauschberg lift. The Rauschberg lift is not running at present because it is being rebuilt.`,
      "The Unternberg chairlift does not run in the rain.",
    ],
    chips: { "ziel:unternberg": "Route to the Unternberg" },
  },
  wandern: {
    kurz: [
      `As said: the ${BERGBAHNEN.unternbergBahnEn} on the ${BERGBAHNEN.unternbergName} is running, the Rauschberg lift is not.`,
    ],
    messages: [
      `Around Ruhpolding there are tours for every level, from the ${WANDERN.taubenseeEn} walk (${WANDERN.taubenseeLaenge}) up to the ${WANDERN.sonntagshorn} (${WANDERN.sonntagshornHoehe}).`,
      `Without climbing yourself, the ${BERGBAHNEN.unternbergBahnEn} takes you up the ${BERGBAHNEN.unternbergName}. The Rauschberg lift is not running at present, it is being rebuilt.`,
      "So I can name the right tour for you: shall I ask you a few questions?",
    ],
    chips: { "bedarf:i=berge": "Yes, find a suitable tour" },
  },
  events: {
    kurz: [
      `As said: the ${EVENTS.biathlonKurzEn} ${EVENTS.biathlonTerminEn}, everything else in the tourist information's weekly programme.`,
    ],
    messages: [
      `The fixed date is the ${EVENTS.biathlonKurzEn} at the ${EVENTS.chiemgauArena}; the next edition is ${EVENTS.biathlonTerminEn}.`,
      "All other events are in the events calendar. The tourist information also hands out a printed programme every week.",
    ],
    chips: { "dienst:tickets": "Buy tickets" },
  },
  anreise: {
    kurz: [
      `As said: by car on the ${ANREISE.autobahn} to ${ANREISE.ausfahrt}, by train via Traunstein.`,
    ],
    messages: [
      `By car take the ${ANREISE.autobahn} to the ${ANREISE.ausfahrt} exit; from there it is ${ANREISE.fahrzeitAbAusfahrtEn}.`,
      "By train you come via Traunstein, from where the Bayerische Regiobahn runs to Ruhpolding. The station is {naehe:bahnhof} from here.",
    ],
  },
  busnetz: {
    messages: [
      `Two village bus lines run here, plus the ${ANREISE.rufbusName} on-demand bus. These are the routes.`,
      `${ANREISE.rufbusHinweisEn} It runs on weekdays ${ANREISE.rufbusWerktagsEn}, at weekends and on public holidays ${ANREISE.rufbusWochenendeEn}. Both village lines are free with the ${ANREISE.gaestekarteName}.`,
    ],
    table: {
      title: "Buses in Ruhpolding",
      columns: ["Line", "Route"],
      rows: [
        ["9532", ANREISE.dorflinie9532],
        ["9533", ANREISE.dorflinie9533],
        [ANREISE.rufbusName, ANREISE.rufbusHinweisEn],
        ["RVO", `regional buses to ${ANREISE.regionalZieleEn}`],
      ],
      // SIMULIERT wäre hier ein Takt. Die Quelle nennt keinen, deshalb steht
      // an seiner Stelle auch auf Englisch der Verweis auf die Auskunft.
      note: "Ruhpolding Tourismus publishes no timetable for the village lines. Departure times are posted at the stops and available at the tourist information.",
    },
  },
  wetter: {
    kurz: ["As said: {wetter:lage}"],
    messages: ["{wetter:lage}"],
    chips: { "bedarf:f=1": "What suits the weather?" },
  },
  essen: {
    kurz: [
      `As said: in the village among others the ${GASTRONOMIE.gasthausPost} and the ${GASTRONOMIE.pizzeria}, up the mountain the ${GASTRONOMIE.almstueberl}.`,
    ],
    messages: [
      `Ruhpolding Tourismus keeps a list of the restaurants in the village, among them the ${GASTRONOMIE.gasthausPost}, the ${GASTRONOMIE.pizzeria} and, up the mountain, the ${GASTRONOMIE.almstueberl}.`,
      "I do not have reliable opening times or closing days, so please check those with the restaurant.",
    ],
    chips: { "empfehlung:essen:0": "Suggestions for eating out" },
  },
  familie: {
    kurz: [
      `As said: the ${FAMILIE.freizeitpark}, the ${FAMILIE.vitalwelt} and, when it rains, the museums in the village.`,
    ],
    messages: [
      `With children, the ${FAMILIE.freizeitpark} and the ${FAMILIE.vitalwelt} leisure pool are options in the village, and the three museums when it rains.`,
      "What fits best depends on how long you are staying and on the weather. Shall I ask you briefly?",
    ],
    chips: { "bedarf:i=familie,b=kinder": "Yes, suitable suggestions" },
  },
  winter: {
    kurz: [
      `As said: cross-country and biathlon at the ${EVENTS.chiemgauArena}, downhill at Unternberg, ${WINTER.skigebiet} and Maiergschwendt.`,
    ],
    messages: [
      `In winter Ruhpolding is above all a cross-country and biathlon resort. The ${EVENTS.chiemgauArena} hosts the ${EVENTS.biathlonKurzEn}. It is {naehe:arena} from here. For downhill there are three ski areas: Unternberg, ${WINTER.skigebiet} and Maiergschwendt.`,
    ],
  },
  unterkunft: {
    kurz: [
      "As said: all hosts are on ruhpolding.de, and at the desk you can get an offer to take away.",
    ],
    messages: [
      "The hosts in Ruhpolding are listed on ruhpolding.de, where you can also book directly.",
      "At the tourist information desk the team will put together an offer and print it for you, so you can compare in peace and come back later.",
    ],
  },
  info: {
    messages: [
      "These are the contact details of the tourist information. The team is happy to help in person as well. It is {naehe:touristinfo} from here.",
    ],
    kurz: ["As said, here are the contact details once more."],
    card: {
      title: "Tourist information Ruhpolding",
      rows: [
        { label: "address", value: TOURIST_INFO.adresse },
        { label: "phone", value: TOURIST_INFO.telefon },
        { label: "email", value: TOURIST_INFO.email },
        { label: "opening hours", value: TOURIST_INFO.oeffnungszeitenEn },
      ],
      note: TOURIST_INFO.kartenhinweisEn,
    },
  },

  /*
   * Die Unterknoten der Themen.
   *
   * Sie standen bis zum Testlauf vom 17.09. nur auf Deutsch bereit. Wer auf
   * Englisch "Easy walk with a pushchair" antippte, bekam den Hinweis, die
   * Auskunft liege nur auf Deutsch vor, und danach den deutschen Text. Für
   * einen englischsprachigen Gast endete das Gespräch damit genau an der
   * Stelle, an der es konkret wurde.
   */
  "wandern-leicht": {
    messages: [
      "For pushchairs the tourist information's walking flyer names these trails:",
      "— Ruhpolding legends trail, 3.6 km, accessible and easy with a pushchair\n— Traun meadows and Taubensee, 8.6 km, with an off-road pushchair\n— Schwarzachen Alm, 7.1 km, wide forest road, hardly steep",
      "Which trail would you like to know more about?",
    ],
    chips: {
      "ziel:sagenweg": "Ruhpolding legends trail",
      "ziel:taubensee": "Traun meadows and Taubensee",
      "ziel:schwarzachen": "Schwarzachen Alm",
    },
  },
  "wandern-schwer": {
    messages: [
      `The most demanding tour in the summit flyer is the ${WANDERN.sonntagshorn} (1,961 m), the highest mountain in the Chiemgau: 16.9 km, 9 hours, 1,340 m ascent from Laubau.`,
      "According to the flyer it requires alpine experience, sure-footedness, a head for heights and climbing ability at grade I to II.",
    ],
    chips: {
      "ziel:sonntagshorn": "More about the Sonntagshorn",
      "empfehlung:gipfel:0": "All summit hikes",
    },
  },
  "bergbahn-preise": {
    messages: ["Here are the fares for the Unternberg chairlift."],
    card: {
      title: "Unternberg chairlift",
      rows: [
        {
          label: "adults, return ticket",
          value: BERGBAHNEN.unternbergErwachsen,
        },
        {
          label: `children ${BERGBAHNEN.kinderAlterEn}`,
          value: BERGBAHNEN.ermaessigungKinder,
        },
      ],
      note: BERGBAHNEN.kartenhinweisEn,
    },
  },
  "events-biathlon": {
    messages: [
      `The ${EVENTS.biathlonName} takes place ${EVENTS.biathlonTerminEn} at the ${EVENTS.chiemgauArena}. Tickets are sold at the tourist information and online via Reservix. Village bus 9533 stops at the arena. It is {naehe:arena} from here.`,
    ],
    qr: {
      title: `Route to the ${EVENTS.chiemgauArena}`,
      hint: "Scan the code to take the route with you.",
    },
  },
  "events-woche": {
    messages: [
      "I do not hold this week's programme. The tourist information hands out a printed programme every week, and all events are in the events calendar on ruhpolding.de.",
      `The tourist information is open ${TOURIST_INFO.oeffnungszeitenEn}.`,
    ],
  },
  "anreise-parken": {
    messages: ["An overview of parking in the village."],
    card: {
      title: "Parking in Ruhpolding",
      rows: [
        { label: PARKEN.rathausEn, value: PARKEN.rathausTarifEn },
        { label: PARKEN.laubauEn, value: PARKEN.laubauTarifEn },
        { label: "motorhomes", value: PARKEN.wohnmobileEn },
      ],
      note: "Parking in the village centre is free, but time limits and parking discs still apply. The hiking car parks, the Chiemgau Arena car park and the underground car park charge a fee.",
    },
    qr: {
      title: "Route to the town hall car park",
      hint: "Scan the code to be guided there.",
    },
  },
  "anreise-bus": {
    messages: [
      `In the village there are the village bus lines (${ANREISE.ortsbusLinieEn}) and the ${ANREISE.rufbusName} on-demand bus. With the ${ANREISE.gaestekarteName} the village lines are free, and so is the train as far as ${ANREISE.gaestekarteBahnBis}.`,
    ],
  },
  "wetter-3tage": {
    messages: [
      "I do not hold a forecast for the coming days myself. The current forecast for Ruhpolding is on ruhpolding.de, though.",
      "The tourist information's tour flyers advise checking the weather forecast and the route carefully before every tour.",
    ],
  },
  "wetter-webcam": {
    messages: [
      "I cannot show webcam images here. ruhpolding.de has a webcam page, though, including a view over Ruhpolding to the Rauschberg and one from the Hochfelln towards the Chiemsee.",
    ],
  },
  "essen-huette": {
    messages: [
      "I do not have reliable information on which huts have a playground, and I would rather not guess. Most mountain inns are open until 19 October this year.",
      `At the tourist information desk someone will help you in person (${TOURIST_INFO.oeffnungszeitenEn}).`,
    ],
  },
  "essen-ruhetag": {
    messages: [
      "There is no single closing day for everyone. The tourist information collects closing days and seasonal breaks in a restaurant list that it keeps up to date. You can take a copy there.",
    ],
  },
  "familie-regen": {
    messages: [
      `For rainy days Ruhpolding Tourismus names the ${FAMILIE.vitalwelt} and the three museums in the village: the ${KULTUR.holzknechtmuseum}, the ${FAMILIE.heimatmuseumEn} and the ${KULTUR.glockenschmiede}. Nearby it lists the Babalu Funpark in Traunstein.`,
    ],
    chips: { "vorschlag:i=kultur,f=1:0": "Suggestions for indoors" },
  },
  "familie-baby": {
    messages: [
      "I do not have reliable information on baby changing facilities.",
      `At the tourist information desk someone will help you in person (${TOURIST_INFO.oeffnungszeitenEn}).`,
    ],
  },
  "winter-loipe": {
    messages: [
      "Ruhpolding Tourismus gives neither a total length for the trail network nor prices for a trail pass, so I will not give you any either.",
      "Individual trails are listed with their length on ruhpolding.de, for example the Drei-Seen-Loipe at 12.3 km.",
    ],
  },
  "winter-verleih": {
    messages: [
      "Under „Ski- & Snowboard Verleih“ Ruhpolding Tourismus lists Sport Plenk, the Langlaufschule Ruhpolding and the Langlauf- & Wintersportschule. I have no prices or times for them.",
      "I am happy to give you the overview of all ski schools and hire shops.",
    ],
  },
  "unterkunft-hof": {
    messages: [
      "Farms offering farm holidays are listed individually in the hosts list on ruhpolding.de. The list gives no total.",
    ],
  },
  "unterkunft-barrierefrei": {
    messages: [
      "Accessible places to stay are marked individually in the hosts list on ruhpolding.de. I do not have a compilation, and I would rather not name any I cannot check.",
    ],
  },
}

/**
 * Beschriftungen, die nicht am Ziel hängen, sondern am Wortlaut.
 *
 * "Zurück zum Thema" führt auf das jeweilige Thema, trägt also dieselbe
 * Ziel-ID wie die Themenkachel im Menü. Über das Ziel allein ließen sich die
 * beiden nicht auseinanderhalten, und die Rückkehr hieße auf Englisch dann
 * "Hiking & mountain lifts" statt "Back to the topic". Deshalb entscheidet
 * hier die deutsche Beschriftung.
 */
const CHIPS_NACH_WORTLAUT: Record<string, string> = {
  "Zurück zum Thema": "Back to the topic",
  "Andere Frage": "Something else",
  "Alle Vorschläge": "All suggestions",
  Ortsplan: "Village map",
  "Andere Vorschläge": "Other suggestions",
}

/**
 * Gibt den Knoten in der gewünschten Sprache zurück.
 *
 * Liegt für Englisch keine Fassung vor, bleibt der deutsche Text stehen und
 * wird angekündigt, statt ihn wortlos auf Deutsch auszugeben.
 */
export function uebersetze(node: FlowNode, sprache: Sprache): FlowNode {
  if (sprache === "de") return node

  const fassung = EN[node.id]

  // Die Beschriftungen gelten auch ohne englische Fassung des Knotens. Sonst
  // stünde unter dem Hinweis, die Auskunft liege nur auf Deutsch vor, auch
  // noch eine deutsche Schaltflächenreihe.
  const chips: Chip[] | undefined = node.chips?.map((chip) => ({
    ...chip,
    label:
      fassung?.chips?.[chip.to] ??
      CHIPS_NACH_WORTLAUT[chip.label] ??
      CHIPS_GLOBAL[chip.to] ??
      chip.label,
  }))

  if (!fassung) {
    return { ...node, messages: [NUR_DEUTSCH, ...node.messages], chips }
  }

  return {
    ...node,
    messages: fassung.messages,
    // Nur ersetzen, was der Knoten auch hat: sonst bekäme ein Knoten ohne
    // Kurzfassung durch die Übersetzung eine.
    ...(node.kurz && fassung.kurz ? { kurz: fassung.kurz } : {}),
    ...(node.card && fassung.card ? { card: fassung.card } : {}),
    ...(node.table && fassung.table ? { table: fassung.table } : {}),
    ...(node.qr && fassung.qr
      ? { qr: { ...node.qr, title: fassung.qr.title, hint: fassung.qr.hint } }
      : {}),
    chips,
  }
}
