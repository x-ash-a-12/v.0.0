import * as React from "react"

import { BERGBAHNEN } from "@/lib/daten"
import { type Sprache } from "@/lib/sprache"
import { WETTER, type Wetter } from "@/lib/wetter"

/**
 * Simulierter Aufstellort des Terminals.
 *
 * Kein GPS und keine Geolocation-API: das Gerät steht fest an einem Ort, und
 * welcher das ist, stellt der Versuchsleiter in der Vorschauleiste ein.
 */
export type Standort = {
  id: string
  /** Volle Bezeichnung, für den Umschalter. */
  label: string
  /**
   * Kurzform samt Präposition für den Satz "Du stehst gerade ...".
   * Die Präposition gehört hierher, weil sie je nach Ort "an der" oder
   * "am" lautet.
   */
  kurz: string
  /** Englisch, ohne Präposition: der Satz lautet "You are currently at ...". */
  kurzEn: string
  /**
   * Ein Satz zu dem, was direkt an diesem Aufstellort liegt. Antwort auf
   * "was kann ich hier machen": eine Frage, die sich nur mit Ortsbezug
   * sinnvoll beantworten lässt.
   */
  angebot: string
  /** Dieselbe Auskunft auf Englisch. */
  angebotEn: string
  /** Wegangaben zu den Zielen, die in Antworten vorkommen. */
  naehe: Record<string, string>
  /** Dieselben Wegangaben auf Englisch. */
  naeheEn: Record<string, string>
}

/*
 * Wegangaben nur, wo sie belegt sind.
 *
 * Bis zum 23.09.2026 standen hier Platzhalter wie "12 Gehminuten". Einer
 * davon war nachweislich falsch: von der Tourist-Information zum Bahnhof
 * "10 Gehminuten", obwohl beide im Bahnhofsgebäude liegen (Ortsplan, Feld
 * N9). Eine geratene Entfernung schickt Gäste los wie eine geratene
 * Öffnungszeit. Deshalb stehen hier nur noch die Angaben, die belegt sind.
 * Fehlt eine, lässt aufloesen() den Satz weg, in dem sie stünde.
 *
 * DATEN: Weitere Gehzeiten vom Autor nachzutragen, sobald belegt.
 */
export const STANDORTE: Standort[] = [
  {
    id: "info",
    // Ohne Straße: mit ihr lief der Name im Umschalter unter den Pfeil.
    label: "Tourist-Information",
    kurz: "an der Tourist-Information",
    kurzEn: "the tourist information",
    angebot: "",
    angebotEn: "",
    naehe: {
      touristinfo: "nur wenige Schritte",
      bahnhof: "nur wenige Schritte, beide liegen im Bahnhofsgebäude",
    },
    naeheEn: {
      touristinfo: "just a few steps",
      bahnhof: "just a few steps, both are in the station building",
    },
  },
  {
    id: "bahnhof",
    label: "Bahnhof Ruhpolding",
    kurz: "am Bahnhof",
    kurzEn: "the railway station",
    angebot: "",
    angebotEn: "",
    naehe: {
      touristinfo: "nur wenige Schritte, sie liegt im Bahnhofsgebäude",
      bahnhof: "nur wenige Schritte",
    },
    naeheEn: {
      touristinfo: "just a few steps, it is in the station building",
      bahnhof: "just a few steps",
    },
  },
  {
    id: "rauschberg",
    label: `Talstation ${BERGBAHNEN.rauschbergName}`,
    kurz: `an der Talstation ${BERGBAHNEN.rauschbergName}`,
    kurzEn: `the ${BERGBAHNEN.rauschbergName} valley station`,
    angebot: "",
    angebotEn: "",
    naehe: {
      rauschberg: "nur wenige Schritte",
    },
    naeheEn: {
      rauschberg: "just a few steps",
    },
  },
]

/**
 * Ersetzt die Platzhalter eines Antworttexts.
 *
 * Unbekannte Platzhalter verschwinden, statt sichtbar stehen zu bleiben: eine
 * geschweifte Klammer im Text würde den Prototyp im Test sofort entlarven.
 */
export function aufloesen(
  text: string,
  standort: Standort,
  sprache: Sprache = "de",
  wetter: Wetter = WETTER[0]
): string {
  return ersetze(ohneUnbekannteWege(text, standort, sprache), standort, sprache, wetter)
}

/**
 * Nimmt Zeilen und Sätze heraus, deren Wegangabe am Aufstellort nicht belegt
 * ist. "Von hier sind es {naehe:arena}." wird sonst zu "Von hier sind es ."
 * oder, schlimmer, zu einer geratenen Zahl.
 */
function ohneUnbekannteWege(
  text: string,
  standort: Standort,
  sprache: Sprache
): string {
  const wege = sprache === "en" ? standort.naeheEn : standort.naehe
  const unbekannt = (teil: string) =>
    [...teil.matchAll(/\{naehe:([a-zA-Z]+)\}/g)].some(
      (treffer) => !wege[treffer[1]]
    )
  return text
    .split("\n")
    .filter((zeile) => !(zeile.trim().startsWith("—") && unbekannt(zeile)))
    .map((zeile) =>
      zeile
        .split(/(?<=[.!?])\s+/)
        .filter((satz) => !unbekannt(satz))
        .join(" ")
    )
    .filter((zeile) => zeile.length > 0)
    .join("\n")
}

function ersetze(
  text: string,
  standort: Standort,
  sprache: Sprache = "de",
  wetter: Wetter = WETTER[0]
): string {
  const en = sprache === "en"
  return text.replace(
    /\{(naehe|standort|wetter):([a-zA-Z]+)\}/g,
    (_treffer, art: string, schluessel: string) => {
      if (art === "wetter") {
        if (schluessel === "lage") return en ? wetter.lageEn : wetter.lage
        if (schluessel === "kurz") return en ? wetter.kurzEn : wetter.kurz
        return ""
      }
      if (art === "standort") {
        if (schluessel === "kurz") return en ? standort.kurzEn : standort.kurz
        if (schluessel === "label") return standort.label
        if (schluessel === "angebot") {
          return en ? standort.angebotEn : standort.angebot
        }
        return ""
      }
      const wege = en ? standort.naeheEn : standort.naehe
      return wege[schluessel] ?? ""
    }
  )
}

/** Der aktive Aufstellort, von der Vorschauleiste nach unten gereicht. */
export const StandortContext = React.createContext<Standort>(STANDORTE[0])

export function useStandort(): Standort {
  return React.useContext(StandortContext)
}
