import {
  TOPICS,
  waehleVariante,
  type Chip,
  type FlowNode,
} from "@/lib/chat-flow"
import { leitbegriff, STOPWOERTER, zerlege } from "@/lib/sprache"

/**
 * Weicher zweiter Durchgang, wenn kein INTENTS-Muster gegriffen hat.
 *
 * Ein Sprachmodell weist eine Eingabe nicht ab, es greift sie auf und fragt
 * nach. Diese Datei erzeugt die Rückfrage: sie sucht das nächstliegende Thema
 * über Stichwörter und holt sich aus der Eingabe ein Wort, das sie zitieren
 * kann.
 */

export type WeicherTreffer = { topic: string; label: string; score: number }

/**
 * Stichwörter je Thema, als Wortstämme. Sie werden als Teilstring geprüft,
 * damit "Schwimmbad" auf "schwimm" trifft.
 */
const STICHWOERTER: Record<string, string[]> = {
  wandern: [
    "wander", "berg", "gipfel", "tour", "rauschberg", "unternberg",
    "sonntagshorn", "gondel", "seilbahn", "sessel", "hütte", "alm", "steig",
    "aussicht", "panorama", "klettern", "rundweg", "spazier", "höhenmeter",
  ],
  events: [
    "event", "veranstalt", "konzert", "markt", "fest", "programm", "biathlon",
    "weltcup", "arena", "musik", "tracht", "brauchtum", "termin", "bühne",
  ],
  anreise: [
    "anreise", "anfahrt", "autobahn", "zug", "bahn", "bus", "park", "auto",
    "route", "navigation", "haltestelle", "bahnhof", "taxi", "gästekarte",
    "wohnmobil", "stellplatz", "fahrplan", "ticket",
  ],
  wetter: [
    "wetter", "regen", "sonne", "temperatur", "gewitter", "prognose",
    "vorhersage", "wind", "webcam", "kalt", "warm", "nebel", "grad",
  ],
  essen: [
    "essen", "restaurant", "gasthaus", "einkehr", "hunger", "pizza", "wirt",
    "frühstück", "kaffee", "café", "bier", "mittag", "abendessen", "trinken",
    "vegan", "vegetarisch", "speise", "küche",
  ],
  familie: [
    "kind", "familie", "freizeitpark", "vitalwelt", "schwimm", "bad",
    "spielplatz", "baby", "wickel", "kinderwagen", "spiel", "rutsche",
    "märchen", "museum",
  ],
  winter: [
    "winter", "langlauf", "ski", "rodel", "schlitten", "eis", "loipe",
    "schnee", "verleih", "snowboard", "piste", "lift", "skating",
  ],
  unterkunft: [
    "übernacht", "unterkunft", "hotel", "ferienwohnung", "zimmer", "pension",
    "schlafen", "apartment", "bauernhof", "camping", "gastgeber", "buchen",
    "barrierefrei", "rollstuhl",
  ],
  info: [
    "öffnungszeit", "kontakt", "telefon", "adresse", "erreichen", "tourist",
    "mail", "anschrift", "information", "büro", "beratung",
  ],
}

/** Themen nach Stichworttreffern sortiert, höchstens die besten zwei. */
export function weicheSuche(text: string): WeicherTreffer[] {
  const woerter = zerlege(text).filter((wort) => !STOPWOERTER.has(wort))
  const punkte = new Map<string, number>()

  for (const wort of woerter) {
    for (const [topic, stichwoerter] of Object.entries(STICHWOERTER)) {
      const trifft = stichwoerter.some(
        (stich) =>
          wort.includes(stich) || (wort.length >= 4 && stich.includes(wort)),
      )
      // Ein Wort zählt je Thema nur einmal, sonst gewinnt die längste Liste.
      if (trifft) punkte.set(topic, (punkte.get(topic) ?? 0) + 1)
    }
  }

  return TOPICS.filter((topic) => punkte.has(topic.id))
    .map((topic) => ({
      topic: topic.id,
      label: topic.label,
      score: punkte.get(topic.id)!,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 2)
}

/* Formulierungen. Je Fall mindestens vier, damit sich im selben Gespräch
   nichts wortgleich wiederholt. */

const MIT_BEGRIFF_ZWEI = [
  `Zu „{begriff}" habe ich gerade nichts Passendes hinterlegt. Meinst du {a}, oder suchst du eher {b}?`,
  `„{begriff}" ist bei mir nicht direkt hinterlegt. Passt {a} zu dem, was du suchst, oder eher {b}?`,
  `Beim Stichwort „{begriff}" bin ich mir nicht sicher. Geht es dir um {a} oder um {b}?`,
  `Zu „{begriff}" finde ich nichts Eigenes. Am nächsten dran ist {a}, sonst vielleicht {b}?`,
]

const MIT_BEGRIFF_EINS = [
  `Zu „{begriff}" habe ich nichts Eigenes hinterlegt. Meinst du vielleicht {a}?`,
  `„{begriff}" ist bei mir nicht direkt hinterlegt. Passt {a} zu dem, was du suchst?`,
  `Beim Stichwort „{begriff}" bin ich unsicher. Geht es dir um {a}?`,
  `Zu „{begriff}" finde ich nichts Genaues. Am nächsten dran wäre {a}.`,
]

const OHNE_BEGRIFF_ZWEI = [
  `Da bin ich mir nicht ganz sicher. Meinst du {a}, oder eher {b}?`,
  `Das kann ich gerade nicht eindeutig zuordnen. Geht es um {a} oder um {b}?`,
  `Ich bin nicht sicher, worauf du hinauswillst. Passt {a}, oder eher {b}?`,
  `Damit ich dich richtig verstehe: {a} oder {b}?`,
]

const OHNE_BEGRIFF_EINS = [
  `Da bin ich mir nicht ganz sicher. Meinst du {a}?`,
  `Das kann ich gerade nicht eindeutig zuordnen. Geht es um {a}?`,
  `Ich bin nicht sicher, worauf du hinauswillst. Passt {a}?`,
  `Damit ich dich richtig verstehe: geht es dir um {a}?`,
]

const NICHTS_MIT_BEGRIFF = [
  `Zu „{begriff}" habe ich gerade keine verlässliche Auskunft. Frag mich gern noch einmal anders, oder wähle eines der Themen.`,
  `„{begriff}" liegt außerhalb dessen, was bei mir hinterlegt ist. Formulier es gern anders, oder schau in die Themen.`,
  `Zu „{begriff}" kann ich dir nichts Belastbares sagen. Versuch es gern mit anderen Worten.`,
  `Beim Thema „{begriff}" muss ich passen. Frag gern anders, oder wähle eines der Themen.`,
]

const NICHTS_OHNE_BEGRIFF = [
  `Dazu habe ich gerade keine verlässliche Auskunft. Frag mich gern noch einmal anders, oder wähle eines der Themen.`,
  `Das kann ich dir gerade nicht beantworten. Formulier es gern anders, oder schau in die Themen.`,
  `Dazu liegt mir nichts vor. Versuch es gern mit anderen Worten, oder wähle eines der Themen.`,
  `Da muss ich passen. Frag gern noch einmal anders, oder wähle eines der Themen.`,
]

function satzform(topic: string | undefined): string {
  return TOPICS.find((eintrag) => eintrag.id === topic)?.satz ?? ""
}

function fuelle(
  vorlage: string,
  begriff: string | null,
  treffer: WeicherTreffer[],
): string {
  return vorlage
    .replace("{begriff}", begriff ?? "")
    .replace("{a}", satzform(treffer[0]?.topic))
    .replace("{b}", satzform(treffer[1]?.topic))
}

/**
 * Die Rückfrage als fertiger Knoten. Höchstens drei Chips: eine Neunerliste
 * sieht nach Menü aus, zwei gezielte Vorschläge sehen nach Verständnis aus.
 */
export function fallbackKnoten(text: string): FlowNode {
  const treffer = weicheSuche(text)
  const begriff = leitbegriff(text)

  let varianten: string[]
  if (treffer.length >= 2) {
    varianten = begriff ? MIT_BEGRIFF_ZWEI : OHNE_BEGRIFF_ZWEI
  } else if (treffer.length === 1) {
    varianten = begriff ? MIT_BEGRIFF_EINS : OHNE_BEGRIFF_EINS
  } else {
    varianten = begriff ? NICHTS_MIT_BEGRIFF : NICHTS_OHNE_BEGRIFF
  }

  const chips: Chip[] = [
    ...treffer.map((eintrag) => ({ label: eintrag.label, to: eintrag.topic })),
    { label: "Andere Frage", to: "menu" },
  ]

  return {
    id: "rueckfrage",
    messages: [fuelle(waehleVariante(varianten), begriff, treffer)],
    chips,
  }
}
