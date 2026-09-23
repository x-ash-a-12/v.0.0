import type { FlowNode } from "@/lib/chat-flow"
import type { Sprache } from "@/lib/sprache"
import type { WetterId } from "@/lib/wetter"

/**
 * Aktuelle Hinweise, wie sie in der Auskunft per Rundmail umgehen.
 *
 * "Wer so eine Information bekommt, hat sie weiterzuleiten. Denn alle müssen
 * das gleiche Wissen haben." (KA [00:18:32]) Am Schalter erfährt der Gast
 * davon, weil die Mitarbeiterin es weiß. Am Terminal muss der Hinweis von
 * selbst kommen, sobald das Thema berührt wird, sonst gibt der Fahrplan Züge
 * aus, die gerade durch Busse ersetzt sind.
 *
 * Jede Meldung trägt Quelle und Stand. Das beantwortet die Frage, die
 * Dr. Matjan am Prototyp hatte: woher kommt diese Information? (M [00:07:28])
 */
export type Meldung = {
  id: string
  /**
   * Wo der Hinweis erscheint: eine Knoten-ID ("bergbahnen"), ein Präfix mit
   * Doppelpunkt am Ende ("fahrplan:") oder ein ganzes Thema ("thema:essen").
   *
   * Eng gefasst: Beim Sagenweg den Hinweis zur Rauschbergbahn zu zeigen,
   * überfrachtet die Antwort. "Alles einfach herumzuschmeißen, das macht man
   * auch nicht" (KA [00:14:27]).
   */
  bei: string[]
  titel: string
  titelEn: string
  text: string
  textEn: string
  quelle: string
  quelleEn: string
  stand: string
  /** Erscheint nur bei diesem Wetter. */
  nurBei?: WetterId
}

export const MELDUNGEN: Meldung[] = [
  {
    id: "sev",
    bei: ["thema:anreise", "fahrplan:"],
    titel: "Schienenersatzverkehr",
    titelEn: "Rail replacement buses",
    // Zeitraum und Abfahrtsstelle der Ersatzbusse sind nicht belegt.
    // DATEN: vom Autor bei der Auskunft zu erfragen, PLAN-INTERVIEWS.md 6.3
    text: "Bei Eisenärzt wird das Gleis erneuert, deshalb fahren auf der Strecke Ersatzbusse statt Zügen. Wo und wann die Busse fahren, nennt die Bayerische Regiobahn. Zugtickets gibt es nicht in der Tourist-Information, sondern im Zug.",
    textEn:
      "The track near Eisenärzt is being renewed, so replacement buses run instead of trains on this line. The Bayerische Regiobahn has the times and stops. Train tickets are not sold at the tourist information but on the train.",
    quelle: "Tourist-Information Ruhpolding",
    quelleEn: "Ruhpolding tourist information",
    stand: "22.09.2026",
  },
  {
    id: "rauschberg",
    bei: ["wandern", "bergbahnen", "ziel:rauschberg", "ziel:rauschberg-gipfel"],
    titel: "Rauschbergbahn",
    titelEn: "Rauschberg lift",
    text: "Die Rauschbergbahn fährt derzeit nicht, weil sie neu gebaut wird. Ein Termin für die Wiederaufnahme ist nicht bekannt.",
    textEn:
      "The Rauschberg lift is not running because it is being rebuilt. No date for reopening is known.",
    quelle: "ruhpolding.de",
    quelleEn: "ruhpolding.de",
    stand: "03.09.2026",
  },
  {
    id: "unternberg-regen",
    bei: [
      "wandern",
      "bergbahnen",
      "ziel:unternberg",
      "ziel:unternberg-tour",
      "ziel:unternbergalm",
    ],
    nurBei: "regen",
    titel: "Unternberg",
    titelEn: "Unternberg",
    text: "Bei Regen fährt die Sesselbahn am Unternberg nicht.",
    textEn: "The Unternberg chairlift does not run in the rain.",
    quelle: "Tourist-Information Ruhpolding",
    quelleEn: "Ruhpolding tourist information",
    stand: "22.09.2026",
  },
  {
    id: "almen",
    bei: [
      "thema:essen",
      "ziel:schwarzachen",
      "ziel:langerbauer",
      "ziel:brander",
      "ziel:unternbergalm",
    ],
    titel: "Almen",
    titelEn: "Mountain inns",
    text: "Die meisten Almen haben heuer nur bis 19. Oktober geöffnet, nicht bis Ende Oktober.",
    textEn:
      "Most mountain inns are open only until 19 October this year, not until the end of October.",
    quelle: "Umfrage der Tourist-Information bei den Almen",
    quelleEn: "tourist information survey of the mountain inns",
    stand: "22.09.2026",
  },
]

/** Ein Hinweis, wie er als Karte im Chat erscheint. */
export type HinweisKarte = {
  titel: string
  text: string
  /** "Quelle: …, Stand …" */
  herkunft: string
}

export function alsKarte(meldung: Meldung, sprache: Sprache): HinweisKarte {
  const en = sprache === "en"
  return {
    titel: en ? meldung.titelEn : meldung.titel,
    text: en ? meldung.textEn : meldung.text,
    herkunft: en
      ? `Source: ${meldung.quelleEn}, as of ${meldung.stand}`
      : `Quelle: ${meldung.quelle}, Stand ${meldung.stand}`,
  }
}

/**
 * Die Meldungen, die zu einem Knoten gehören und noch nicht gezeigt wurden.
 *
 * Einmal je Gespräch: wer den Hinweis zum Ersatzverkehr gelesen hat, braucht
 * ihn bei der zweiten Fahrplanfrage nicht noch einmal.
 */
export function offeneMeldungen(
  node: FlowNode,
  wetter: WetterId,
  gezeigt: Set<string>
): Meldung[] {
  return MELDUNGEN.filter((meldung) => {
    if (gezeigt.has(meldung.id)) return false
    if (meldung.nurBei && meldung.nurBei !== wetter) return false
    return meldung.bei.some((bezug) => {
      if (bezug.startsWith("thema:")) return node.topic === bezug.slice(6)
      if (bezug.endsWith(":")) return node.id.startsWith(bezug)
      return node.id === bezug
    })
  })
}

/**
 * Alle Hinweise auf einmal, für die Frage "gibt es etwas Aktuelles".
 *
 * Die Hinweise selbst hängt use-chat.ts als Karten an, deshalb trägt der
 * Knoten nur die Einleitung und die IDs.
 */
export function meldungenKnoten(sprache: Sprache, wetter: WetterId): FlowNode {
  const en = sprache === "en"
  const aktuell = MELDUNGEN.filter(
    (meldung) => !meldung.nurBei || meldung.nurBei === wetter
  )
  return {
    id: "hinweise",
    fertig: true,
    messages: [
      en
        ? `These are the current notices, ${aktuell.length} in all. Each one shows where it comes from and how recent it is.`
        : `Das sind die aktuellen Hinweise, ${aktuell.length} insgesamt. Bei jedem steht, woher er stammt und wie aktuell er ist.`,
    ],
    hinweise: aktuell.map((meldung) => meldung.id),
    chips: [
      {
        label: en ? "Train & bus" : "Bahn & Bus",
        to: "fahrplan:traunstein",
      },
      { label: en ? "Something else" : "Andere Frage", to: "menu" },
    ],
  }
}

export function meldung(id: string): Meldung | undefined {
  return MELDUNGEN.find((eintrag) => eintrag.id === id)
}
