import {
  TOPICS,
  waehleVariante,
  type Chip,
  type FlowNode,
} from "@/lib/chat-flow"
import { leitbegriff, type Sprache } from "@/lib/sprache"
import { themenRangfolge } from "@/lib/verstehen"
import { schalterSatz } from "@/lib/service"

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
 * Themen nach Stärke des Hinweises, höchstens die besten zwei.
 *
 * Die Bewertung kommt aus demselben Lexikon, das auch die Zuordnung
 * entscheidet. Früher standen hier eigene Stichwortlisten, die mit der Zeit
 * auseinanderliefen: eine Eingabe konnte im Hauptdurchlauf einem Thema
 * zugeordnet werden und in der Rückfrage ein anderes vorgeschlagen bekommen.
 * Der Unterschied liegt jetzt nur noch in der Schwelle. Hier gibt es keine:
 * auch ein schwacher Hinweis darf noch zu einem Vorschlag werden.
 */
export function weicheSuche(text: string): WeicherTreffer[] {
  return themenRangfolge(text)
    .slice(0, 2)
    .map(({ topic, label, punkte }) => ({ topic, label, score: punkte }))
}

/* Formulierungen. Je Fall mindestens vier, damit sich im selben Gespräch
   nichts wortgleich wiederholt. */

const MIT_BEGRIFF_ZWEI = [
  `Zu „{begriff}" habe ich gerade nichts Passendes hinterlegt. Meinen Sie {a}, oder suchen Sie eher {b}?`,
  `„{begriff}" ist bei mir nicht direkt hinterlegt. Passt {a} zu dem, was Sie suchen, oder eher {b}?`,
  `Beim Stichwort „{begriff}" bin ich mir nicht sicher. Geht es Ihnen um {a} oder um {b}?`,
  `Zu „{begriff}" finde ich nichts Eigenes. Am nächsten dran ist {a}, sonst vielleicht {b}?`,
]

const MIT_BEGRIFF_EINS = [
  `Zu „{begriff}" habe ich nichts Eigenes hinterlegt. Meinen Sie vielleicht {a}?`,
  `„{begriff}" ist bei mir nicht direkt hinterlegt. Passt {a} zu dem, was Sie suchen?`,
  `Beim Stichwort „{begriff}" bin ich unsicher. Geht es Ihnen um {a}?`,
  `Zu „{begriff}" finde ich nichts Genaues. Am nächsten dran wäre {a}.`,
]

const OHNE_BEGRIFF_ZWEI = [
  `Da bin ich mir nicht ganz sicher. Meinen Sie {a}, oder eher {b}?`,
  `Das kann ich gerade nicht eindeutig zuordnen. Geht es um {a} oder um {b}?`,
  `Ich bin nicht sicher, worauf Sie hinauswollen. Passt {a}, oder eher {b}?`,
  `Damit ich Sie richtig verstehe: {a} oder {b}?`,
]

const OHNE_BEGRIFF_EINS = [
  `Da bin ich mir nicht ganz sicher. Meinen Sie {a}?`,
  `Das kann ich gerade nicht eindeutig zuordnen. Geht es um {a}?`,
  `Ich bin nicht sicher, worauf Sie hinauswollen. Passt {a}?`,
  `Damit ich Sie richtig verstehe: Geht es Ihnen um {a}?`,
]

const NICHTS_MIT_BEGRIFF = [
  `Zu „{begriff}" habe ich gerade keine verlässliche Auskunft. Fragen Sie gern noch einmal anders, oder wählen Sie eines der Themen.`,
  `„{begriff}" liegt außerhalb dessen, was bei mir hinterlegt ist. Formulieren Sie es gern anders, oder schauen Sie in die Themen.`,
  `Zu „{begriff}" kann ich Ihnen nichts Belastbares sagen. Versuchen Sie es gern mit anderen Worten.`,
  `Beim Thema „{begriff}" muss ich passen. Fragen Sie gern anders, oder wählen Sie eines der Themen.`,
]

const NICHTS_OHNE_BEGRIFF = [
  `Dazu habe ich gerade keine verlässliche Auskunft. Fragen Sie gern noch einmal anders, oder wählen Sie eines der Themen.`,
  `Das kann ich Ihnen gerade nicht beantworten. Formulieren Sie es gern anders, oder schauen Sie in die Themen.`,
  `Dazu liegt mir nichts vor. Versuchen Sie es gern mit anderen Worten, oder wählen Sie eines der Themen.`,
  `Da muss ich passen. Fragen Sie gern noch einmal anders, oder wählen Sie eines der Themen.`,
]

/* Dieselben Fälle auf Englisch, für die Sprachumschaltung. */

const EN_MIT_BEGRIFF_ZWEI = [
  `I have nothing specific on „{begriff}“. Do you mean {a}, or are you rather after {b}?`,
  `„{begriff}“ is not something I hold directly. Would {a} fit, or rather {b}?`,
  `I am not sure about „{begriff}“. Is this about {a} or about {b}?`,
]

const EN_MIT_BEGRIFF_EINS = [
  `I have nothing of my own on „{begriff}“. Do you perhaps mean {a}?`,
  `„{begriff}“ is not something I hold directly. Would {a} fit what you are after?`,
  `I am unsure about „{begriff}“. Is this about {a}?`,
]

const EN_OHNE_BEGRIFF_ZWEI = [
  `I am not quite sure. Do you mean {a}, or rather {b}?`,
  `I cannot place that clearly. Is it about {a} or about {b}?`,
  `So I understand you correctly: {a} or {b}?`,
]

const EN_OHNE_BEGRIFF_EINS = [
  `I am not quite sure. Do you mean {a}?`,
  `I cannot place that clearly. Is it about {a}?`,
  `So I understand you correctly: is this about {a}?`,
]

const EN_NICHTS_MIT_BEGRIFF = [
  `I have nothing reliable on „{begriff}“. Do ask again in other words, or pick one of the topics.`,
  `„{begriff}“ is outside what I hold. Try putting it differently, or have a look at the topics.`,
  `I cannot tell you anything solid about „{begriff}“. Do try other words.`,
]

const EN_NICHTS_OHNE_BEGRIFF = [
  `I have nothing reliable on that. Do ask again in other words, or pick one of the topics.`,
  `I cannot answer that right now. Try putting it differently, or have a look at the topics.`,
  `Nothing on that here. Do try other words, or pick one of the topics.`,
]

function satzform(topic: string | undefined, sprache: Sprache): string {
  const eintrag = TOPICS.find((thema) => thema.id === topic)
  if (!eintrag) return ""
  return sprache === "en" ? eintrag.satzEn : eintrag.satz
}

function fuelle(
  vorlage: string,
  begriff: string | null,
  treffer: WeicherTreffer[],
  sprache: Sprache
): string {
  return vorlage
    .replace("{begriff}", begriff ?? "")
    .replace("{a}", satzform(treffer[0]?.topic, sprache))
    .replace("{b}", satzform(treffer[1]?.topic, sprache))
}

/**
 * Die Rückfrage als fertiger Knoten. Höchstens drei Chips: eine Neunerliste
 * sieht nach Menü aus, zwei gezielte Vorschläge sehen nach Verständnis aus.
 */
export function fallbackKnoten(
  text: string,
  sprache: Sprache = "de"
): FlowNode {
  const treffer = weicheSuche(text)
  const begriff = leitbegriff(text)
  const en = sprache === "en"

  let varianten: readonly string[]
  if (treffer.length >= 2) {
    if (begriff) varianten = en ? EN_MIT_BEGRIFF_ZWEI : MIT_BEGRIFF_ZWEI
    else varianten = en ? EN_OHNE_BEGRIFF_ZWEI : OHNE_BEGRIFF_ZWEI
  } else if (treffer.length === 1) {
    if (begriff) varianten = en ? EN_MIT_BEGRIFF_EINS : MIT_BEGRIFF_EINS
    else varianten = en ? EN_OHNE_BEGRIFF_EINS : OHNE_BEGRIFF_EINS
  } else {
    if (begriff) varianten = en ? EN_NICHTS_MIT_BEGRIFF : NICHTS_MIT_BEGRIFF
    else varianten = en ? EN_NICHTS_OHNE_BEGRIFF : NICHTS_OHNE_BEGRIFF
  }

  // Findet sich gar nichts, verweist der Prototyp wie die Auskunft weiter,
  // statt nur um andere Worte zu bitten (KA [00:10:53], [00:11:22]).
  const nichts = treffer.length === 0

  const chips: Chip[] = [
    ...treffer.map((eintrag) => {
      const topic = TOPICS.find((thema) => thema.id === eintrag.topic)
      return {
        label: en && topic ? topic.labelEn : eintrag.label,
        to: eintrag.topic,
      }
    }),
    ...(nichts
      ? [{ label: en ? "Tourist information" : "Tourist-Information", to: "info" }]
      : []),
    { label: en ? "Something else" : "Andere Frage", to: "menu" },
  ]

  return {
    id: "rueckfrage",
    // Der Knoten wählt seine Sprache oben selbst. Ohne diese Kennzeichnung
    // liefe er durch uebersetze(), fände dort keine Fassung und bekäme den
    // Hinweis vorangestellt, die Auskunft liege nur auf Deutsch vor, obwohl
    // er gerade auf Englisch nachfragt.
    fertig: true,
    messages: [
      fuelle(waehleVariante(varianten), begriff, treffer, sprache),
      ...(nichts ? [schalterSatz(sprache)] : []),
    ],
    chips,
  }
}

const IM_GESPRAECH = [
  "Das habe ich leider nicht verstanden. Sie können es anders formulieren oder unten eine der Möglichkeiten wählen.",
  "Da bin ich nicht mitgekommen. Formulieren Sie es gern anders, oder tippen Sie unten auf eine der Möglichkeiten.",
]
const IM_GESPRAECH_EN = [
  "Sorry, I did not understand that. You can put it differently or choose one of the options below.",
  "I did not quite follow. Feel free to rephrase, or tap one of the options below.",
]

/**
 * Rückfrage mitten im Gespräch.
 *
 * Im Testlauf vom 23.09.2026 verschwanden nach einer unverstandenen Eingabe
 * die Schaltflächen der vorigen Frage, und die Rückfrage bot stattdessen
 * Themen an. Der Gast war damit aus dem Faden. Diese Fassung lässt die
 * Schaltflächen stehen und den Gesprächszustand unverändert, sodass die
 * nächste Eingabe sich weiter auf die vorige Frage beziehen kann.
 */
export function rueckfrageImGespraech(
  chips: Chip[],
  sprache: Sprache = "de"
): FlowNode {
  return {
    id: "rueckfrage-kontext",
    fertig: true,
    behalteKontext: true,
    messages: [waehleVariante(sprache === "en" ? IM_GESPRAECH_EN : IM_GESPRAECH)],
    chips,
  }
}
