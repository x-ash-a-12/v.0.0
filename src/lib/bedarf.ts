import type { Chip, FlowNode } from "@/lib/chat-flow"
import { eignung, spaetHinweis, zeitbezug } from "@/lib/jetzt"
import type { Sprache } from "@/lib/sprache"
import type { WetterId } from "@/lib/wetter"
import {
  GRUPPEN,
  VORSCHLAEGE,
  ZIELE,
  vorschlagbar,
  ziel as findeZiel,
  type Aufstieg,
  type Begleitung,
  type Interesse,
  type Ziel,
} from "@/lib/ziele"

/**
 * Bedarfsklärung vor der Empfehlung.
 *
 * So arbeitet die Auskunft am Schalter: "Man fragt so lange, bis man weiß,
 * was der Gast will." (KA [00:12:47]) Gefragt wird nach dem Interesse, nach
 * der Aufenthaltsdauer, nach der Begleitung und bei den Bergen danach, ob
 * jemand hinauflaufen oder hinauffahren will und wie geübt er ist
 * (KA [00:11:47] bis [00:13:43]). Das Wetter fragt niemand ab, das weiß die
 * Mitarbeiterin, und das Terminal weiß es auch (wetter.ts).
 *
 * Vorher antwortete der Prototyp auf "was kann ich hier machen" sofort mit
 * drei festen Vorschlägen. Genau das beschreibt Frau Amort als das, was man
 * nicht tut: "Das kann man nie pauschalisieren." (KA [00:13:07])
 *
 * Zwei Dinge halten die Klärung kurz. Jede Frage lässt sich überspringen, und
 * "Gleich Vorschläge zeigen" steht immer darunter, denn nicht jeder will
 * gefragt werden (KA [00:15:51]). Und eine freie Antwort kann mehrere Fragen
 * auf einmal beantworten: "wir sind mit Kinderwagen und nur heute da".
 *
 * Der Zustand steckt in der Knoten-ID, wie bei den Vorschlagslisten:
 *
 *   bedarf:i=berge,d=heute          nächste offene Frage
 *   vorschlag:i=berge,d=heute:0     das Ergebnis, ab Stelle 0
 *
 * Dieselben Antworten ergeben dieselben Vorschläge. Die Testläufe bleiben
 * damit vergleichbar.
 */

export type Dauer = "heute" | "tage"

/** "x" heißt: gefragt und übersprungen. */
export type Profil = {
  i?: Interesse | "x"
  d?: Dauer | "x"
  b?: Begleitung | "x"
  a?: Aufstieg | "x"
  /** Gleich Vorschläge zeigen, ohne weitere Fragen. */
  f?: "1"
  /** Mit Kinderwagen unterwegs. */
  k?: "1"
}

const SCHLUESSEL = ["i", "d", "b", "a", "k", "f"] as const

export function kodiere(profil: Profil): string {
  return SCHLUESSEL.filter((schluessel) => profil[schluessel])
    .map((schluessel) => `${schluessel}=${profil[schluessel]}`)
    .join(",")
}

export function dekodiere(text: string): Profil {
  const profil: Record<string, string> = {}
  for (const teil of text.split(",")) {
    const [schluessel, wert] = teil.split("=")
    if (schluessel && wert) profil[schluessel] = wert
  }
  return profil as Profil
}

/** Beide Profile zusammen, das zweite gewinnt. */
export function ergaenze(alt: Profil, neu: Profil): Profil {
  return { ...alt, ...neu }
}

/* ------------------------------------------------------------------ *
 * Verstehen freier Antworten
 * ------------------------------------------------------------------ */

/**
 * Liest aus einer freien Eingabe, was sie über den Bedarf verrät.
 *
 * Auf dem normalisierten Text, Umlaute ausgeschrieben. Die Muster sind eng,
 * denn sie laufen auch außerhalb der Klärung mit, sobald jemand fragt, was er
 * hier machen kann.
 */
export function bedarfAusText(roh: string): Profil {
  const profil: Profil = {}

  if (/\bkinderwagen\w*\b|\bbuggy\b|\bpushchair\b|\bstroller\b|\bpram\b/.test(roh)) {
    profil.k = "1"
  }
  if (/\bkinderwagen\w*\b|\bkind\w*\b|\bbaby\w*\b|\bfamilie\w*\b|\bchild\w*\b|\bkids?\b|\bpushchair\b|\bstroller\b/.test(roh)) {
    profil.b = "kinder"
  } else if (/\boma\b|\bopa\b|\bgrosseltern\b|\baelter\w*\b|\bsenior\w*\b|\brollator\b|\bnicht (mehr )?(so )?gut zu fuss\b|\bgehbehindert\w*\b|\belderly\b|\bgrand(ma|pa|parents)\b/.test(roh)) {
    profil.b = "senioren"
  } else if (/\bzu zweit\b|\ballein\w*\b|\bnur erwachsene\b|\berwachsene\b|\bmein (mann|frau|partner\w*)\b|\bmeine (frau|partnerin|freundin)\b|\bpaar\b|\bcouple\b|\balone\b|\badults?\b/.test(roh)) {
    profil.b = "erwachsene"
  }

  if (/\bnur (heute|einen tag|den einen tag|kurz)\b|\bnur noch heute\b|\beinen tag\b|\btagesausflug\b|\bheute abend (fahren|reisen)\b|\bmorgen (fahren|reisen) wir\b|\bjust today\b|\bone day\b|\bday trip\b/.test(roh)) {
    profil.d = "heute"
  } else if (/\bwoche\w*\b|\bpaar tage\b|\bein paar tagen\b|\bmehrere tage\b|\b[2-9] tage\b|\b(zwei|drei|vier|fuenf|sechs|sieben|zehn) tage\b|\bnoch laenger\b|\burlaub\b|\bfew days\b|\ba week\b|\bseveral days\b/.test(roh)) {
    profil.d = "tage"
  }

  if (/\b(sessel)?(bahn|lift|gondel|seilbahn)\b|\bhinauf ?fahren\b|\bhochfahren\b|\bmit der bahn\b|\bnicht (selbst )?laufen\b|\bby lift\b|\bcable car\b/.test(roh)) {
    profil.a = "bahn"
  } else if (/\bgeuebt\b|\berfahren\b|\btrittsicher\b|\bsportlich\b|\bfit\b|\bschon oft\b|\bbergerfahr\w*\b|\banspruchsvoll\w*\b|\bschwer\w*\b|\bfordernd\b|\bexperienced\b|\bchallenging\b/.test(roh)) {
    profil.a = "geuebt"
  } else if (/\bgemuetlich\w*\b|\bleicht\w*\b|\beinfach\w*\b|\bnicht so fit\b|\banfaenger\w*\b|\bflach\w*\b|\bentspannt\w*\b|\beasy\b|\bgentle\b|\bbeginner\w*\b/.test(roh)) {
    profil.a = "gemuetlich"
  }

  if (/\brad\w*\b|\bfahrrad\w*\b|\bmountainbik\w*\b|\bmtb\b|\bbike\w*\b|\bbiking\b|\bcycl\w*\b|\bradl\w*\b/.test(roh)) {
    profil.i = "rad"
  } else if (/\bspazier\w*\b|\bflanier\w*\b|\bwalk\w*\b|\bstroll\w*\b/.test(roh)) {
    // Spazieren heißt: zu Fuß, ohne Gipfel. Aus dem Testlauf vom 23.09.2026,
    // dort fiel "spazierengehen" aus der Bedarfsklärung heraus.
    profil.i = "berge"
    profil.a ??= "gemuetlich"
  } else if (/\bberg\w*\b|\bwander\w*\b|\bgipfel\w*\b|\bhike\w*\b|\bhiking\b|\bmountain\w*\b|\btour\w*\b/.test(roh)) {
    profil.i = "berge"
  } else if (/\bsport\w*\b|\baktiv\w*\b|\bbewegung\b|\bgolf\w*\b|\bminigolf\b|\bgleitschirm\w*\b|\bparaglid\w*\b|\btandem\w*\b|\bfitness\b|\bauspowern\b|\bactive\b|\bsports?\b/.test(roh)) {
    // Nach den Bergen: "eine sportliche Wanderung" bleibt eine Wanderung.
    profil.i = "sport"
  } else if (/\bkultur\w*\b|\bmuseum\w*\b|\bmuseen\b|\bkirche\w*\b|\bgeschichte\b|\bculture\b|\bmuseums?\b|\bchurch\b|\bhistory\b/.test(roh)) {
    profil.i = "kultur"
  } else if (/\bentspann\w*\b|\bgemuetlich\w*\b|\bruhig\w*\b|\bbaden\b|\bschwimm\w*\b|\bwellness\b|\bsauna\b|\brelax\w*\b|\bswim\w*\b/.test(roh)) {
    profil.i = "gemuetlich"
  } else if (profil.b === "kinder") {
    profil.i = "familie"
  }

  return profil
}

/** "Egal", "weiß nicht": die offene Frage überspringen. */
export const UEBERSPRINGEN =
  /^(egal|ist egal|weiss (ich )?nicht|keine ahnung|ueberspring\w*|weiter|passt schon|nichts davon|doesn t matter|skip|don t know|no idea)\b/

/** "Zeig mir einfach was": ohne weitere Fragen zum Ergebnis. */
export const GLEICH_ZEIGEN =
  /\b(zeig|zeige|gib)\b[^]*\b(einfach|gleich|sofort|direkt|schon)\b|\beinfach (vorschlaege|vorschlagen|was vorschlagen|zeigen)\b|\bgleich vorschlaege\b|\bkeine fragen\b|\bjust show\b|\bshow me\b/

/* ------------------------------------------------------------------ *
 * Fragen
 * ------------------------------------------------------------------ */

type Frage = "i" | "d" | "b" | "a"

/** Die nächste offene Frage, in der Reihenfolge der Auskunft. */
export function naechsteFrage(profil: Profil): Frage | null {
  if (profil.f) return null
  if (!profil.i) return "i"
  if (!profil.d) return "d"
  if (!profil.b) return "b"
  if (profil.i === "berge" && !profil.a) return "a"
  return null
}

const QUITTUNG = ["Danke, das hilft mir.", "Gut, verstanden.", "Alles klar, danke.", "Prima."]
const QUITTUNG_EN = ["Thanks, that helps.", "Good, got it.", "All right, thanks.", "Great."]

type Zieher = (varianten: readonly string[]) => string

function frageText(frage: Frage, en: boolean): string {
  switch (frage) {
    case "i":
      return en
        ? "Gladly! So that I do not suggest things at random: what do you feel like doing?"
        : "Sehr gern! Damit ich Ihnen nicht irgendetwas vorschlage: Worauf haben Sie Lust?"
    case "d":
      return en
        ? "And how long are you staying in Ruhpolding?"
        : "Wie lange sind Sie denn noch in Ruhpolding?"
    case "b":
      return en ? "And who is coming along?" : "Und wer ist mit dabei?"
    case "a":
      return en
        ? "Would you like to walk up or take the lift? And have you walked in the mountains before?"
        : "Möchten Sie hinauflaufen oder mit der Bahn hinauffahren? Und sind Sie schon öfter in den Bergen gegangen?"
  }
}

function frageChips(frage: Frage, profil: Profil, en: boolean): Chip[] {
  const mit = (neu: Profil) => `bedarf:${kodiere(ergaenze(profil, neu))}`
  const optionen: [string, string, Profil][] = {
    i: [
      ["Berge & Wandern", "Mountains & hiking", { i: "berge" }],
      ["Radfahren", "Cycling", { i: "rad" }],
      ["Mit Kindern unterwegs", "Out with children", { i: "familie", b: "kinder" }],
      ["Sport & Aktiv", "Sport & activities", { i: "sport" }],
      ["Kultur & Museen", "Culture & museums", { i: "kultur" }],
      ["Eher gemütlich", "Something relaxed", { i: "gemuetlich" }],
    ] as [string, string, Profil][],
    d: [
      ["Nur heute", "Just today", { d: "heute" }],
      ["Ein paar Tage", "A few days", { d: "tage" }],
    ] as [string, string, Profil][],
    b: [
      ["Mit Kindern", "With children", { b: "kinder" }],
      ["Mit Kinderwagen", "With a pushchair", { b: "kinder", k: "1" }],
      ["Ältere Personen", "Older people", { b: "senioren" }],
      ["Nur Erwachsene", "Adults only", { b: "erwachsene" }],
    ] as [string, string, Profil][],
    a: [
      ["Zu Fuß, ich bin geübt", "On foot, I am experienced", { a: "geuebt" }],
      ["Zu Fuß, eher gemütlich", "On foot, but easy-going", { a: "gemuetlich" }],
      ["Lieber mit der Bahn", "Rather by lift", { a: "bahn" }],
    ] as [string, string, Profil][],
  }[frage]

  const chips: Chip[] = optionen.map(([de, englisch, neu]) => ({
    label: en ? englisch : de,
    to: mit(neu),
  }))
  if (frage !== "i") {
    chips.push({
      label: en ? "Skip" : "Überspringen",
      to: mit({ [frage]: "x" } as Profil),
    })
  }
  chips.push({
    label: en ? "Show suggestions now" : "Gleich Vorschläge zeigen",
    to: `vorschlag:${kodiere(profil)}:0`,
  })
  return chips
}

/**
 * Der Knoten zu einem Stand der Klärung: die nächste Frage oder, wenn alles
 * geklärt ist, das Ergebnis.
 */
export function bedarfKnoten(
  kodiert: string,
  sprache: Sprache,
  waehle: Zieher,
  jetzt: Date,
  wetter: WetterId
): FlowNode {
  const profil = dekodiere(kodiert)
  const frage = naechsteFrage(profil)
  if (!frage) return vorschlagKnoten(kodiert, 0, sprache, waehle, jetzt, wetter)

  const en = sprache === "en"
  const schonEtwas = SCHLUESSEL.some((schluessel) => profil[schluessel])
  const text = frageText(frage, en)

  return {
    id: `bedarf:${kodiert}`,
    fertig: true,
    topic: profil.i === "berge" ? "wandern" : undefined,
    messages: [
      // Die erste Frage hat ihr "Gern." schon, die folgenden quittieren die
      // letzte Antwort. Ohne Quittung wirkt die Folge wie ein Formular.
      schonEtwas && frage !== "i"
        ? `${waehle(en ? QUITTUNG_EN : QUITTUNG)} ${text}`
        : text,
    ],
    chips: frageChips(frage, profil, en),
  }
}

/* ------------------------------------------------------------------ *
 * Ergebnis
 * ------------------------------------------------------------------ */

const TEXT_INTERESSE: Record<Interesse, [string, string]> = {
  berge: ["Berge und Wandern", "mountains and hiking"],
  rad: ["Radfahren", "cycling"],
  familie: ["etwas mit Kindern", "something with children"],
  kultur: ["Kultur", "culture"],
  gemuetlich: ["etwas Gemütliches", "something relaxed"],
  sport: ["etwas Sportliches", "something sporty"],
}
const TEXT_DAUER: Record<Dauer, [string, string]> = {
  heute: ["nur heute", "just today"],
  tage: ["ein paar Tage", "a few days"],
}
const TEXT_BEGLEITUNG: Record<Begleitung, [string, string]> = {
  kinder: ["mit Kindern", "with children"],
  senioren: ["mit älteren Personen", "with older people"],
  erwachsene: ["unter Erwachsenen", "adults only"],
}
const TEXT_AUFSTIEG: Record<Aufstieg, [string, string]> = {
  geuebt: ["zu Fuß und geübt", "on foot and experienced"],
  gemuetlich: ["zu Fuß und gemütlich", "on foot and easy-going"],
  bahn: ["mit der Bahn hinauf", "up by lift"],
}

/** Der verstandene Bedarf in einem Satz: so hört der Gast, dass er gehört wurde. */
function zusammenfassung(profil: Profil, wetter: WetterId, en: boolean): string {
  const k = en ? 1 : 0
  const teile: string[] = []
  if (profil.i && profil.i !== "x") teile.push(TEXT_INTERESSE[profil.i][k])
  if (profil.a && profil.a !== "x") teile.push(TEXT_AUFSTIEG[profil.a][k])
  // "etwas mit Kindern, mit Kindern" sagt dasselbe zweimal.
  if (profil.k) {
    teile.push(en ? "with a pushchair" : "mit Kinderwagen")
  } else if (
    profil.b &&
    profil.b !== "x" &&
    !(profil.b === "kinder" && profil.i === "familie")
  ) {
    teile.push(TEXT_BEGLEITUNG[profil.b][k])
  }
  if (profil.d && profil.d !== "x") teile.push(TEXT_DAUER[profil.d][k])
  const wetterText =
    wetter === "regen"
      ? en
        ? "in the rain"
        : "bei Regen"
      : en
        ? "in fine weather"
        : "bei schönem Wetter"
  // Ohne geklärtes Merkmal wäre "Für dich also: bei Regen" eine
  // Zusammenfassung von nichts.
  if (teile.length === 0) {
    return en
      ? `Then a few suggestions for today, ${wetterText}.`
      : `Dann ein paar Vorschläge für heute, ${wetterText}.`
  }
  teile.push(wetterText)
  const liste = teile.join(", ")
  return en ? `So for you: ${liste}.` : `Für Sie also: ${liste}.`
}

/**
 * Welche Ziele zum Profil passen, in Vorschlagsreihenfolge.
 *
 * Ausgeschlossen wird, was ungesichert ist, was beim Wetter nicht geht und
 * was für die Begleitung nicht passt. Bei den Bergen entscheidet die Art des
 * Aufstiegs. Sortiert wird danach, was gerade offen ist, bei Regen kommt
 * zuerst, was drinnen ist, und bei nur einem Tag zuerst, was kurz ist.
 */
export function passendeZiele(
  profil: Profil,
  wetter: WetterId,
  jetzt: Date
): Ziel[] {
  const interesse = profil.i && profil.i !== "x" ? profil.i : null
  const basis = interesse
    ? ZIELE.filter((eintrag) => eintrag.interessen?.includes(interesse))
    : GRUPPEN.hier.ziele
        .map(findeZiel)
        .filter((eintrag): eintrag is Ziel => Boolean(eintrag))
  // Beim Sport gibt die Sportgruppe die Reihenfolge vor. Sonst stünde die
  // Vita Alpina vorn, nur weil sie im Register weiter oben steht, und sie
  // ist die Wahl für Regen, nicht für einen Sonnentag.
  if (interesse === "sport") {
    const rang = (id: string) => {
      const stelle = GRUPPEN.sport.ziele.indexOf(id)
      return stelle === -1 ? Number.MAX_SAFE_INTEGER : stelle
    }
    basis.sort((a, b) => rang(a.id) - rang(b.id))
  }

  return basis
    .filter(vorschlagbar)
    .filter((eintrag) => !(wetter === "regen" && eintrag.beiRegenNicht))
    .filter(
      (eintrag) =>
        !profil.b ||
        profil.b === "x" ||
        !eintrag.nichtFuer?.includes(profil.b)
    )
    // Mit Kinderwagen nur Wege, die der Flyer dafür nennt. Ziele im Ort
    // (Bad, Museen, Freizeitpark) bleiben, über sie sagt der Prototyp zum
    // Kinderwagen nichts.
    .filter(
      (eintrag) =>
        !profil.k || eintrag.topic !== "wandern" || Boolean(eintrag.kinderwagen)
    )
    .filter(
      (eintrag) =>
        interesse !== "berge" ||
        !profil.a ||
        profil.a === "x" ||
        eintrag.aufstieg === profil.a
    )
    .map((eintrag, index) => ({
      eintrag,
      index,
      punkte:
        eignung(eintrag.oeffnung, jetzt, eintrag.tagesfuellend) * 10 +
        (wetter === "regen" && eintrag.drinnen ? 5 : 0) +
        (profil.d === "heute" && eintrag.kurz ? 3 : 0) -
        // Wer nur heute da ist, bekommt einen Tagesausflug nicht zuerst.
        (profil.d === "heute" && eintrag.tagesfuellend ? 8 : 0) +
        // Mit Kindern kommen leichte und kürzere Touren zuerst.
        (profil.b === "kinder" && eintrag.schwierigkeit === "leicht" ? 4 : 0) -
        (profil.b === "kinder" && eintrag.tagesfuellend ? 8 : 0),
    }))
    .sort((a, b) => b.punkte - a.punkte || a.index - b.index)
    .map(({ eintrag }) => eintrag)
}

const ABSCHLUSS = [
  "Ist etwas für Sie dabei? Sagen Sie mir einfach, was Sie anspricht, dann erzähle ich Ihnen mehr, auch worauf Sie achten sollten.",
  "Was davon gefällt Ihnen? Dann sage ich Ihnen gern, für wen es sich eignet und worauf Sie achten sollten.",
]
const ABSCHLUSS_EN = [
  "Anything for you? Just tell me what appeals and I will tell you more, including what to watch out for.",
  "Which of these do you like? Then I am happy to tell you who it suits and what to watch out for.",
]

/** Was es am Schalter gibt, wenn nichts Gesichertes passt. */
function nichtsPassend(profil: Profil, wetter: WetterId, en: boolean): string[] {
  const saetze = [
    en
      ? "For exactly that I have nothing reliable on record, and I do not want to guess."
      : "Genau dafür habe ich nichts Gesichertes hinterlegt, und raten möchte ich nicht.",
  ]
  if (profil.i === "berge") {
    // KA [00:12:01]: Prospekte der Almen mit Ausgangspunkten und Höhen,
    // "dann können sie selbst aussuchen".
    saetze.push(
      en
        ? "The flyer „Ruhpoldinger Almsommer“ lists all mountain inns with starting points, walking times and ascent, so you can choose for yourself. It is laid out in the entrance area of the tourist information."
        : "Im Flyer „Ruhpoldinger Almsommer“ stehen alle Almen mit Ausgangspunkten, Gehzeiten und Höhenmetern. Da können Sie selbst aussuchen. Er liegt im Eingangsbereich der Tourist-Information aus."
    )
  }
  if (wetter === "regen") {
    saetze.push(
      en
        ? "In this rain I would suggest something indoors instead."
        : "Bei dem Regen würde ich Ihnen heute eher etwas drinnen vorschlagen."
    )
  }
  return saetze
}

export function vorschlagKnoten(
  kodiert: string,
  ab: number,
  sprache: Sprache,
  waehle: Zieher,
  jetzt: Date,
  wetter: WetterId
): FlowNode {
  const profil = dekodiere(kodiert)
  const en = sprache === "en"
  const alle = passendeZiele(profil, wetter, jetzt)
  const ausschnitt = alle.slice(ab, ab + VORSCHLAEGE)
  const id = `vorschlag:${kodiert}:${ab}`
  const topic = profil.i === "berge" ? "wandern" : undefined

  const neuAnfangen: Chip = {
    label: en ? "Different wishes" : "Andere Wünsche",
    to: "bedarf:",
  }
  const andereFrage: Chip = {
    label: en ? "Something else" : "Andere Frage",
    to: "menu",
  }

  if (ausschnitt.length === 0) {
    const chips: Chip[] = []
    if (wetter === "regen" && profil.i !== "kultur") {
      chips.push({
        label: en ? "Something indoors" : "Etwas drinnen",
        to: `vorschlag:${kodiere({ i: "kultur", f: "1" })}:0`,
      })
    }
    chips.push(neuAnfangen, { label: en ? "Tourist information" : "Tourist-Information", to: "info" }, andereFrage)
    return {
      id,
      fertig: true,
      topic,
      messages: [
        zusammenfassung(profil, wetter, en),
        ...(ab > 0
          ? [
              en
                ? "Those were all the suggestions I have for this."
                : "Das waren alle Vorschläge, die ich dafür habe.",
            ]
          : nichtsPassend(profil, wetter, en)),
      ],
      chips,
    }
  }

  const einleitung: string[] = [zusammenfassung(profil, wetter, en)]
  if (wetter === "regen" && (profil.i === "berge" || !profil.i)) {
    // KA [00:13:43]: "Bei Regenwetter schicke ich keinen auf den Hochfelln."
    einleitung.push(
      en
        ? "In this rain I will not send you up a mountain today."
        : "Bei dem Regen schicke ich Sie heute nicht auf den Berg."
    )
  }
  if (ab === 0) einleitung.push(zeitbezug(jetzt, sprache))

  const weiter =
    alle.length > ab + ausschnitt.length
      ? `vorschlag:${kodiert}:${ab + ausschnitt.length}`
      : undefined

  const chips: Chip[] = ausschnitt.map((eintrag) => ({
    label: en ? eintrag.nameEn : eintrag.name,
    to: `ziel:${eintrag.id}`,
  }))
  if (weiter) {
    chips.push({
      label: en ? "Other suggestions" : "Andere Vorschläge",
      to: weiter,
    })
  }
  chips.push(neuAnfangen, andereFrage)

  return {
    id,
    fertig: true,
    topic,
    messages: [
      einleitung.join(" "),
      ...ausschnitt.map((eintrag, index) =>
        vorschlagText(eintrag, ab + index + 1, en, jetzt)
      ),
      waehle(en ? ABSCHLUSS_EN : ABSCHLUSS),
    ],
    angebot: ausschnitt.map((eintrag) => eintrag.id),
    weiter,
    chips,
  }
}

/** Ein Vorschlag als Textblock, im selben Aufbau wie in empfehlung.ts. */
function vorschlagText(
  eintrag: Ziel,
  nummer: number,
  en: boolean,
  jetzt: Date
): string {
  const zeilen = [
    `${nummer} · ${en ? eintrag.nameEn : eintrag.name}`,
    en ? eintrag.beschreibungEn : eintrag.beschreibung,
    `— ${en ? eintrag.eckdatenEn : eintrag.eckdaten}`,
  ]
  if (eintrag.naehe) {
    zeilen.push(
      en
        ? `— {naehe:${eintrag.naehe}} from here`
        : `— von hier {naehe:${eintrag.naehe}}`
    )
  }
  const spaet = spaetHinweis(eintrag.tagesfuellend, jetzt, en ? "en" : "de")
  if (spaet) zeilen.push(`— ${spaet}`)
  return zeilen.join("\n")
}
