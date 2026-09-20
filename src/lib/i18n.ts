import { TOPICS, type Chip, type FlowNode } from "@/lib/chat-flow"
import { type Sprache } from "@/lib/sprache"
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
  "fahrplan:traunstein": "Train to Traunstein",
  // Wege zu einzelnen Zielen.
  "ziel:rauschberg": `Route to the ${BERGBAHNEN.rauschbergName} valley station`,
  "ziel:foerchensee": `Route to the ${WANDERN.foerchensee}`,
  "ziel:sonntagshorn": `Route to the ${WANDERN.sonntagshorn}`,
  "ziel:arena": `Route to the ${EVENTS.chiemgauArena}`,
  "ziel:rathausgarage": "Route to the car park",
}

const EN: Record<string, Uebersetzung> = {
  start: {
    messages: [
      "Grüß Gott, and welcome to the Ruhpolding tourist information. I am the digital assistant and help with questions about your stay.",
      "You are currently at {standort:kurz}. What can I help you with? Pick a topic or just type.",
    ],
  },
  menu: {
    messages: ["Of course. What else can I help you with?"],
  },
  danke: {
    messages: [
      "You are very welcome. Enjoy your stay in Ruhpolding, and just ask if anything else comes up.",
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
      `You are currently at {standort:kurz}, here in Ruhpolding in the Chiemgau. From here it is {naehe:touristinfo} to the tourist information and {naehe:rauschberg} to the ${BERGBAHNEN.rauschbergName} valley station.`,
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
      `There are two: the ${BERGBAHNEN.rauschbergBahnEn} up the ${BERGBAHNEN.rauschbergName} and the ${BERGBAHNEN.unternbergBahnEn} up the ${BERGBAHNEN.unternbergName}. Both start in the village and run daily in summer from ${BERGBAHNEN.betriebSommerVon} to ${BERGBAHNEN.betriebSommerBis}, last ride up at ${BERGBAHNEN.letzteBergfahrt}.`,
      `It is {naehe:rauschberg} from here to the ${BERGBAHNEN.rauschbergName} valley station.`,
    ],
  },
  wandern: {
    kurz: [
      `As said: about ${WANDERN.wegenetzKm} of waymarked trails, and in summer the mountain lifts run from ${BERGBAHNEN.betriebSommerVon} to ${BERGBAHNEN.betriebSommerBis}.`,
    ],
    messages: [
      [
        `Ruhpolding has about ${WANDERN.wegenetzKm} of waymarked trails. Popular choices are the ${BERGBAHNEN.rauschbergName} with the ${BERGBAHNEN.rauschbergBahnEn} from the village, the ${BERGBAHNEN.unternbergName} with the ${BERGBAHNEN.unternbergBahnEn}, and the flat loop around the ${WANDERN.foerchensee}.`,
        `There are about ${WANDERN.wegenetzKm} of waymarked trails here. Most walked are the ${BERGBAHNEN.rauschbergName}, reached by the ${BERGBAHNEN.rauschbergBahnEn} from the village, the ${BERGBAHNEN.unternbergName} with the ${BERGBAHNEN.unternbergBahnEn}, and the level loop around the ${WANDERN.foerchensee}.`,
      ],
      `In summer the mountain lifts run daily from ${BERGBAHNEN.betriebSommerVon} to ${BERGBAHNEN.betriebSommerBis}, last ride up at ${BERGBAHNEN.letzteBergfahrt}. From here it is {naehe:rauschberg} to the ${BERGBAHNEN.rauschbergName} valley station.`,
    ],
  },
  events: {
    kurz: [
      `As said: the ${EVENTS.biathlonKurzEn} ${EVENTS.biathlonMonatEn}, the ${EVENTS.sommerkonzerteEn} ${EVENTS.sommerkonzerteZeitEn}, the ${EVENTS.wochenmarktEn} ${EVENTS.wochenmarktZeitEn}.`,
    ],
    messages: [
      `Three fixed dates each year: the ${EVENTS.biathlonKurzEn} at the ${EVENTS.chiemgauArena} ${EVENTS.biathlonMonatEn}, the ${EVENTS.sommerkonzerteEn} at the ${EVENTS.kurpark}, ${EVENTS.sommerkonzerteZeitEn}, and the ${EVENTS.wochenmarktEn} ${EVENTS.wochenmarktZeitEn} on the ${EVENTS.rathausplatz}.`,
    ],
  },
  anreise: {
    kurz: [
      `As said: by car on the ${ANREISE.autobahn} to ${ANREISE.ausfahrt}, by train ${ANREISE.bahnTaktEn} from ${ANREISE.bahnAbfahrtsort}.`,
    ],
    messages: [
      `By car take the ${ANREISE.autobahn} to the ${ANREISE.ausfahrt} exit, then the ${ANREISE.bundesstrasse}, ${ANREISE.fahrzeitAbAusfahrtEn}.`,
      `By train there is an ${ANREISE.bahnTaktEn} service from ${ANREISE.bahnAbfahrtsort} to Ruhpolding, taking ${ANREISE.bahnFahrzeitEn}. The station is ${ANREISE.bahnhofZumZentrumEn} from the centre, and {naehe:bahnhof} from here.`,
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
    // SIMULIERT: tagesaktuelle Angabe, im Prototyp ohne Datenanbindung nicht
    // echt darstellbar.
    kurz: [
      "As said, the demo conditions: fair today, a chance of thunderstorms tomorrow afternoon.",
    ],
    messages: [
      "Demo conditions: fair today, 22 °C in the valley, freezing level at 3,200 m, light winds. Thunderstorms are possible tomorrow afternoon, so an early start is advisable.",
    ],
  },
  essen: {
    kurz: [
      `As said: the ${GASTRONOMIE.gipfelalm} up the mountain, the ${GASTRONOMIE.gasthausPost} and the ${GASTRONOMIE.pizzeria} in the village.`,
    ],
    messages: [
      `Everything from mountain huts to fine dining. Up on the ${BERGBAHNEN.rauschbergName} the ${GASTRONOMIE.gipfelalm} with its panoramic terrace, in the village the ${GASTRONOMIE.gasthausPost} with Bavarian cooking and the ${GASTRONOMIE.pizzeria}. For fine dining there is the restaurant at Hotel ${GASTRONOMIE.hotelGehoben}.`,
    ],
  },
  familie: {
    kurz: [
      `As said: the ${FAMILIE.freizeitpark}, the ${FAMILIE.vitalwelt} and the ${FAMILIE.barfusswegEn} at the ${WANDERN.foerchensee}.`,
    ],
    messages: [
      `With children, three places are worth it: the ${FAMILIE.freizeitpark} with its fairytale wood and rides, open ${FAMILIE.freizeitparkOeffnungEn}, the ${FAMILIE.vitalwelt} with a children's pool and slide, and the ${FAMILIE.barfusswegEn} at the ${WANDERN.foerchensee}. If it rains, the ${FAMILIE.heimatmuseum} is an option.`,
      `The ${FAMILIE.vitalwelt} is {naehe:vitalwelt} from here.`,
    ],
  },
  winter: {
    kurz: [
      `As said: around ${LOIPEN.netz} of trails and the competition stadium at the ${EVENTS.chiemgauArena}.`,
    ],
    messages: [
      `Ruhpolding is a centre for cross-country skiing: around ${LOIPEN.netz} of groomed trails and the competition stadium at the ${EVENTS.chiemgauArena}, which is open to the public and {naehe:arena} from here. For downhill there are smaller areas at the ${WINTER.skigebiet} and in Inzell.`,
    ],
  },
  unterkunft: {
    kurz: [
      `As said: from a room in a guest house to the ${UNTERKUNFT.hoechsteKategorieEn}, bookable through the guest card platform or directly with the host.`,
    ],
    messages: [
      `The range runs from a room in a guest house through farm stays to the ${UNTERKUNFT.hoechsteKategorieEn}. You can book through the official guest card platform or directly with the host, and the tourist information also places guests at short notice whenever something is free.`,
    ],
  },
  info: {
    messages: [
      "These are the contact details of the tourist information. The team is happy to help in person as well, {naehe:touristinfo} from here.",
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
      `For a pushchair the loop around the ${WANDERN.foerchensee} (${WANDERN.foerchenseeRundeEn}) or the ${WANDERN.uferwegTraunEn} work well. Both are walkable all year and need no mountain gear.`,
    ],
    qr: {
      title: `Route to the ${WANDERN.foerchensee}`,
      hint: "Scan the code to take the route with you.",
    },
  },
  "wandern-schwer": {
    messages: [
      `The climb up the ${WANDERN.sonntagshorn} (${WANDERN.sonntagshornHoehe}), the highest peak in the Chiemgau Alps, is a demanding one. Allow ${WANDERN.sonntagshornGehzeitEn} from the ${WANDERN.sonntagshornStartEn}, and bring sturdy boots and a head for heights.`,
    ],
    qr: {
      title: `Route to the ${WANDERN.sonntagshornStartEn}`,
      hint: "Scan the code to take the starting point with you.",
    },
  },
  "bergbahn-preise": {
    messages: ["Here are the summer fares for the two mountain lifts."],
    card: {
      title: "Mountain lifts Ruhpolding, summer",
      rows: [
        {
          label: `${BERGBAHNEN.rauschbergName}, return ticket`,
          value: `adults ${BERGBAHNEN.rauschbergErwachsen}`,
        },
        {
          label: `${BERGBAHNEN.unternbergName}, return ticket`,
          value: `adults ${BERGBAHNEN.unternbergErwachsen}`,
        },
        {
          label: `children ${BERGBAHNEN.kinderAlterEn}`,
          value: BERGBAHNEN.ermaessigungKinder,
        },
        {
          label: "with the guest card",
          value: BERGBAHNEN.ermaessigungGaestekarteEn,
        },
      ],
      note: BERGBAHNEN.kartenhinweisEn,
    },
  },
  "events-biathlon": {
    messages: [
      `The ${EVENTS.biathlonName} takes place ${EVENTS.biathlonTerminEn} at the ${EVENTS.chiemgauArena}. Tickets are available online and at the box office. A free ski bus runs ${EVENTS.skibusTaktEn} from the village centre to the arena, and it is {naehe:arena} from here.`,
    ],
    qr: {
      title: `Route to the ${EVENTS.chiemgauArena}`,
      hint: "Scan the code to take the route with you.",
    },
  },
  "events-woche": {
    // SIMULIERT: wie die deutsche Fassung eine Demo-Auswahl.
    messages: [
      "This week (demo selection): Wednesday 8 pm open-air concert by the traditional brass band at the Kurpark, Thursday 10 am guided herb walk (sign up at the tourist information), Friday 8 am weekly market on the Rathausplatz.",
    ],
  },
  "anreise-parken": {
    messages: ["An overview of where to park in the village."],
    card: {
      title: "Parking in Ruhpolding",
      rows: [
        { label: PARKEN.rathausEn, value: PARKEN.rathausTarifEn },
        { label: PARKEN.laubauEn, value: PARKEN.laubauTarifEn },
        { label: PARKEN.vitalweltEn, value: PARKEN.vitalweltTarifEn },
        { label: "motorhomes", value: PARKEN.wohnmobileEn },
      ],
      note: PARKEN.gaestekarteHinweisEn,
    },
    qr: {
      title: `Route to the ${PARKEN.rathausEn}`,
      hint: "Scan the code to be guided there.",
    },
  },
  "anreise-bus": {
    messages: [
      `The village bus (${ANREISE.ortsbusLinieEn}) runs ${ANREISE.ortsbusTaktEn} between the station, the centre and the valley stations. With the ${ANREISE.gaestekarteName} guest card travel is free across the whole Chiemgau, including regional trains as far as ${ANREISE.gaestekarteBahnBis}.`,
    ],
  },
  "wetter-3tage": {
    // SIMULIERT: wie die deutsche Fassung eine Demo-Prognose.
    messages: [
      "Demo forecast: Wednesday sunny 24 °C, Thursday changeable 19 °C with showers, Friday settled 21 °C. The risk of thunderstorms is highest on Thursday.",
    ],
  },
  "wetter-webcam": {
    // SIMULIERT: wie die deutsche Fassung ohne Livebilder.
    messages: [
      `There are live webcams at the ${BERGBAHNEN.rauschbergName} summit station, the ${EVENTS.chiemgauArena} and on the ${EVENTS.rathausplatz}. In the real application the current images would appear here.`,
    ],
  },
  "essen-huette": {
    messages: [
      `Huts with a playground right outside: the ${GASTRONOMIE.almstueberl} next to the summit station, the ${GASTRONOMIE.weitseealm} at the cross-country centre and the ${GASTRONOMIE.laubaualm} at the hikers' car park. All three are easy to reach with a pushchair.`,
    ],
  },
  "essen-ruhetag": {
    messages: [
      `Many inns in the village close on ${GASTRONOMIE.ruhetageEn}. The mountain restaurants at the lifts stay open every day in summer. An up-to-date overview is available at the tourist information.`,
    ],
  },
  "familie-regen": {
    messages: [
      `For wet weather: the ${FAMILIE.vitalwelt} with its indoor pool and sauna, the amusement park with its covered areas, the ${FAMILIE.kletterhalleEn} (${FAMILIE.kletterhalleFahrzeitEn} away) and the ${FAMILIE.heimatmuseum}. The tourist information has a craft corner for children.`,
    ],
  },
  "familie-baby": {
    messages: [
      `There are baby changing facilities at the tourist information, at the ${FAMILIE.vitalwelt} and at the ${BERGBAHNEN.rauschbergName} and ${BERGBAHNEN.unternbergName} valley stations. Most cafés in the village are happy to warm water if you need it.`,
    ],
  },
  "winter-loipe": {
    messages: ["The key facts about cross-country skiing here."],
    card: {
      title: "Cross-country skiing in Ruhpolding",
      rows: [
        {
          label: "trail network",
          value: `about ${LOIPEN.netz}, ${LOIPEN.spurartenEn}`,
        },
        { label: "trail pass, day", value: LOIPEN.passTag },
        { label: "trail pass, week", value: LOIPEN.passWoche },
        { label: "with the guest card", value: LOIPEN.gaestekarteEn },
      ],
      // SIMULIERT: wie die deutsche Fassung ohne Datenanbindung.
      note: "Snow depth and trail report would be updated daily in the real application.",
    },
  },
  "winter-verleih": {
    messages: [
      `Sports shops with hire: ${WINTER.sportgeschaeft} on the Dorfplatz, the ski hire at the ${WINTER.skigebiet} valley station and the ${WINTER.langlaufShopEn} at the ${EVENTS.chiemgauArena}. During the school holidays it is worth reserving ahead.`,
    ],
  },
  "unterkunft-hof": {
    messages: [
      `${UNTERKUNFT.hoefeAnzahlEn} farms in Ruhpolding offer farm holidays, many with animals to help look after and an alpine hut of their own. These places are often booked out months ahead, so it is worth asking early.`,
    ],
  },
  "unterkunft-barrierefrei": {
    messages: [
      `Several houses are certified to the ${UNTERKUNFT.zertifizierung} standard, among them ${UNTERKUNFT.barrierefreiHaeuserEn}. The ${FAMILIE.vitalwelt} and the ${BERGBAHNEN.rauschbergName} gondola are wheelchair accessible.`,
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
