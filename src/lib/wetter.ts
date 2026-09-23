import * as React from "react"

/**
 * Simuliertes Wetter am Aufstellort.
 *
 * SIMULIERT: Der Prototyp hat keine Wetteranbindung. Der Versuchsleiter stellt
 * die Lage in der Vorschauleiste ein, genau wie den Aufstellort. In Abschnitt
 * 4.4 der Arbeit als Grenze auszuweisen.
 *
 * Warum es trotzdem hier steht: Die Auskunft richtet ihre Vorschläge nach dem
 * Wetter, ohne dass der Gast danach fragt. "Bei Regenwetter schicke ich keinen
 * auf den Hochfelln, auf keinen Fall" (KA [00:13:43]), und "wenn es regnet,
 * fährt der Unternberg nicht" (KA [00:19:23]). Ein Terminal, das bei Regen
 * eine Bergtour vorschlägt, macht genau den Fehler, den die Auskunft vermeidet.
 *
 * Als Einstellung statt als Zufall, damit zwei Testläufe mit derselben
 * Einstellung dasselbe zeigen.
 */
export type WetterId = "sonne" | "regen"

export type Wetter = {
  id: WetterId
  label: string
  /** Satz für den Wetterknoten, über {wetter:lage}. */
  lage: string
  lageEn: string
  /** Kurzform für die Zusammenfassung des Bedarfs, über {wetter:kurz}. */
  kurz: string
  kurzEn: string
}

export const WETTER: Wetter[] = [
  {
    id: "sonne",
    label: "Sonnig",
    lage: "Demo-Lage heute: trocken und sonnig. Für eine Bergtour ist das ein guter Tag, früh loszugehen ist trotzdem ratsam.",
    lageEn:
      "Demo conditions today: dry and sunny. A good day for a mountain tour, though an early start is still advisable.",
    kurz: "bei Sonne",
    kurzEn: "in the sunshine",
  },
  {
    id: "regen",
    label: "Regen",
    lage: "Demo-Lage heute: Regen. Die Sesselbahn am Unternberg fährt bei Regen nicht, und auf den Berg würde ich heute niemanden schicken. Drinnen gibt es die Vita Alpina und die drei Museen im Ort.",
    lageEn:
      "Demo conditions today: rain. The Unternberg chairlift does not run in the rain, and I would not send anyone up a mountain today. Indoors there is the Vita Alpina and the three museums in the village.",
    kurz: "bei Regen",
    kurzEn: "in the rain",
  },
]

export function wetter(id: WetterId): Wetter {
  return WETTER.find((eintrag) => eintrag.id === id) ?? WETTER[0]
}

/** Das eingestellte Wetter, von der Vorschauleiste nach unten gereicht. */
export const WetterContext = React.createContext<Wetter>(WETTER[0])

export function useWetter(): Wetter {
  return React.useContext(WetterContext)
}
