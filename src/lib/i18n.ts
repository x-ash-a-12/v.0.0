import { TOPICS, type Chip, type FlowNode } from "@/lib/chat-flow"
import { type Sprache } from "@/lib/sprache"
import {
  ANREISE,
  BERGBAHNEN,
  EVENTS,
  FAMILIE,
  GASTRONOMIE,
  LOIPEN,
  UNTERKUNFT,
  WANDERN,
  WINTER,
} from "@/lib/daten"

/**
 * Sprachumschaltung Deutsch und Englisch.
 *
 * Übersetzt sind nur die Begrüßung, das Menü und die neun Themen-Einstiege.
 * Die Unterknoten bleiben deutsch und werden mit einem Hinweis eingeleitet.
 * Das reicht, um die Fähigkeit im Test zu zeigen, ohne den ganzen Baum zu
 * doppeln.
 */
/** Wortlisten zur Erkennung. Ab zwei Treffern gilt die Sprache als erkannt. */
const MARKER: Record<Sprache, string[]> = {
  en: [
    "the", "is", "are", "where", "how", "what", "can", "you", "i", "my",
    "do", "does", "there", "any", "please", "we", "me", "get", "to",
  ],
  de: [
    "der", "die", "das", "wo", "wie", "was", "kann", "ich", "mein", "gibt",
    "es", "und", "mit", "für", "bei", "einen", "eine", "sind", "wir",
  ],
}

const MINDESTTREFFER = 2

/**
 * Erkennt die Sprache einer Eingabe, oder null, wenn sie zu kurz oder zu
 * uneindeutig ist. Dann bleibt die zuletzt erkannte Sprache stehen.
 */
export function erkenneSprache(text: string): Sprache | null {
  const woerter = text.toLowerCase().split(/[^a-zäöüß]+/).filter(Boolean)
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

type Uebersetzung = {
  messages: (string | string[])[]
  /** Englische Beschriftung je Chip-Ziel. */
  chips?: Record<string, string>
}

/** Die Themenbeschriftungen stehen an den Themen selbst, nicht doppelt hier. */
const CHIPS_ALLGEMEIN: Record<string, string> = {
  ...Object.fromEntries(TOPICS.map((topic) => [topic.id, topic.labelEn])),
  menu: "Something else",
}

const EN: Record<string, Uebersetzung> = {
  start: {
    messages: [
      "Grüß Gott, and welcome to the Ruhpolding tourist information. I am the digital assistant and help with questions about your stay.",
      "You are currently at {standort:kurz}. What can I help you with? Pick a topic or just type.",
    ],
    chips: CHIPS_ALLGEMEIN,
  },
  menu: {
    messages: ["Of course. What else can I help you with?"],
    chips: CHIPS_ALLGEMEIN,
  },
  danke: {
    messages: [
      "You are very welcome. Enjoy your stay in Ruhpolding, and just ask if anything else comes up.",
    ],
    chips: CHIPS_ALLGEMEIN,
  },
  wandern: {
    messages: [
      [
        `Ruhpolding has about ${WANDERN.wegenetzKm} of waymarked trails. Popular choices are the ${BERGBAHNEN.rauschbergName} with the ${BERGBAHNEN.rauschbergBahnEn} from the village, the ${BERGBAHNEN.unternbergName} with the ${BERGBAHNEN.unternbergBahnEn}, and the flat loop around the ${WANDERN.foerchensee}.`,
        `There are about ${WANDERN.wegenetzKm} of waymarked trails here. Most walked are the ${BERGBAHNEN.rauschbergName}, reached by the ${BERGBAHNEN.rauschbergBahnEn} from the village, the ${BERGBAHNEN.unternbergName} with the ${BERGBAHNEN.unternbergBahnEn}, and the level loop around the ${WANDERN.foerchensee}.`,
      ],
      `In summer the mountain lifts run daily from ${BERGBAHNEN.betriebSommerVon} to ${BERGBAHNEN.betriebSommerBis}, last ride up at ${BERGBAHNEN.letzteBergfahrt}. From here it is {naehe:rauschberg} to the ${BERGBAHNEN.rauschbergName} valley station.`,
    ],
    chips: {
      "wandern-leicht": "Easy walk with a pushchair",
      "wandern-schwer": "Demanding mountain tour",
      "bergbahn-preise": "Lift prices",
      menu: "Something else",
    },
  },
  events: {
    messages: [
      `Three fixed dates each year: the ${EVENTS.biathlonKurzEn} at the ${EVENTS.chiemgauArena} ${EVENTS.biathlonMonatEn}, the ${EVENTS.sommerkonzerteEn} at the ${EVENTS.kurpark}, ${EVENTS.sommerkonzerteZeitEn}, and the ${EVENTS.wochenmarktEn} ${EVENTS.wochenmarktZeitEn} on the ${EVENTS.rathausplatz}.`,
    ],
    chips: {
      "events-biathlon": "Biathlon world cup",
      "events-woche": "What is on this week?",
      menu: "Something else",
    },
  },
  anreise: {
    messages: [
      `By car take the ${ANREISE.autobahn} to the ${ANREISE.ausfahrt} exit, then the ${ANREISE.bundesstrasse}, ${ANREISE.fahrzeitAbAusfahrtEn}.`,
      `By train there is an ${ANREISE.bahnTaktEn} service from ${ANREISE.bahnAbfahrtsort} to Ruhpolding, taking ${ANREISE.bahnFahrzeitEn}. The station is ${ANREISE.bahnhofZumZentrumEn} from the centre, and {naehe:bahnhof} from here.`,
    ],
    chips: {
      "anreise-parken": "Parking in the village",
      "anreise-bus": "Local bus & guest card",
      menu: "Something else",
    },
  },
  wetter: {
    // SIMULIERT: tagesaktuelle Angabe, im Prototyp ohne Datenanbindung nicht
    // echt darstellbar.
    messages: [
      "Demo conditions: fair today, 22 °C in the valley, freezing level at 3,200 m, light winds. Thunderstorms are possible tomorrow afternoon, so an early start is advisable.",
    ],
    chips: {
      "wetter-3tage": "Three day mountain forecast",
      "wetter-webcam": "Webcams",
      menu: "Something else",
    },
  },
  essen: {
    messages: [
      `Everything from mountain huts to fine dining. Up on the ${BERGBAHNEN.rauschbergName} the ${GASTRONOMIE.gipfelalm} with its panoramic terrace, in the village the ${GASTRONOMIE.gasthausPost} with Bavarian cooking and the ${GASTRONOMIE.pizzeria}. For fine dining there is the restaurant at Hotel ${GASTRONOMIE.hotelGehoben}.`,
    ],
    chips: {
      "essen-huette": "Huts with a playground",
      "essen-ruhetag": "Mind the closing days",
      menu: "Something else",
    },
  },
  familie: {
    messages: [
      `With children, three places are worth it: the ${FAMILIE.freizeitpark} with its fairytale wood and rides, open ${FAMILIE.freizeitparkOeffnungEn}, the ${FAMILIE.vitalwelt} with a children's pool and slide, and the ${FAMILIE.barfusswegEn} at the ${WANDERN.foerchensee}. If it rains, the ${FAMILIE.bergbahnMuseumEn} is an option.`,
      `The ${FAMILIE.vitalwelt} is {naehe:vitalwelt} from here.`,
    ],
    chips: {
      "familie-regen": "Things to do in the rain",
      "familie-baby": "Changing & feeding",
      menu: "Something else",
    },
  },
  winter: {
    messages: [
      `Ruhpolding is a centre for cross-country skiing: around ${LOIPEN.netz} of groomed trails and the competition stadium at the ${EVENTS.chiemgauArena}, which is open to the public and {naehe:arena} from here. For downhill there are smaller areas at the ${WINTER.skigebiet} and in Inzell.`,
    ],
    chips: {
      "winter-loipe": "Trails & trail pass",
      "winter-verleih": "Ski hire",
      menu: "Something else",
    },
  },
  unterkunft: {
    messages: [
      `The range runs from a room in a guest house through farm stays to the ${UNTERKUNFT.hoechsteKategorieEn}. You can book through the official guest card platform or directly with the host, and the tourist information also places guests at short notice whenever something is free.`,
    ],
    chips: {
      "unterkunft-hof": "Farm holidays",
      "unterkunft-barrierefrei": "Accessible stays",
      menu: "Something else",
    },
  },
  info: {
    messages: [
      "These are the contact details of the tourist information. The team is happy to help in person as well, {naehe:touristinfo} from here.",
    ],
    chips: { menu: "Something else" },
  },
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
  if (!fassung) {
    return { ...node, messages: [NUR_DEUTSCH, ...node.messages] }
  }

  const chips: Chip[] | undefined = node.chips?.map((chip) => ({
    ...chip,
    label: fassung.chips?.[chip.to] ?? chip.label,
  }))

  return { ...node, messages: fassung.messages, chips }
}
