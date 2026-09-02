import * as React from "react"

import { BERGBAHNEN, TOURIST_INFO } from "@/lib/daten"
import { type Sprache } from "@/lib/sprache"

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
  /** Wegangaben zu den Zielen, die in Antworten vorkommen. */
  naehe: Record<string, string>
  /** Dieselben Wegangaben auf Englisch. */
  naeheEn: Record<string, string>
}

/*
 * DATEN: vom Autor zu ersetzen. Sämtliche Wegangaben in diesem Block sind
 * Platzhalter. Sie sind so formuliert, dass sie auch dann tragen, wenn Ziel
 * und Aufstellort zusammenfallen.
 */
export const STANDORTE: Standort[] = [
  {
    id: "info",
    label: `Tourist-Information, ${TOURIST_INFO.adresse.split(",")[0]}`,
    kurz: "an der Tourist-Information",
    kurzEn: "the tourist information",
    naehe: {
      // DATEN: vom Autor zu ersetzen
      touristinfo: "ein paar Schritte",
      rauschberg: "12 Gehminuten",
      arena: "20 Gehminuten",
      vitalwelt: "5 Gehminuten",
      bahnhof: "10 Gehminuten",
    },
    naeheEn: {
      // DATEN: vom Autor zu ersetzen
      touristinfo: "a few steps",
      rauschberg: "a 12 minute walk",
      arena: "a 20 minute walk",
      vitalwelt: "a 5 minute walk",
      bahnhof: "a 10 minute walk",
    },
  },
  {
    id: "bahnhof",
    label: "Bahnhof Ruhpolding",
    kurz: "am Bahnhof",
    kurzEn: "the railway station",
    naehe: {
      // DATEN: vom Autor zu ersetzen
      touristinfo: "10 Gehminuten",
      rauschberg: "20 Gehminuten",
      arena: "25 Gehminuten",
      vitalwelt: "12 Gehminuten",
      bahnhof: "keine zwei Schritte",
    },
    naeheEn: {
      // DATEN: vom Autor zu ersetzen
      touristinfo: "a 10 minute walk",
      rauschberg: "a 20 minute walk",
      arena: "a 25 minute walk",
      vitalwelt: "a 12 minute walk",
      bahnhof: "no distance at all",
    },
  },
  {
    id: "rauschberg",
    label: `Talstation ${BERGBAHNEN.rauschbergName}`,
    kurz: `an der Talstation ${BERGBAHNEN.rauschbergName}`,
    kurzEn: `the ${BERGBAHNEN.rauschbergName} valley station`,
    naehe: {
      // DATEN: vom Autor zu ersetzen
      touristinfo: "12 Gehminuten",
      rauschberg: "keine 100 Meter",
      arena: "15 Gehminuten",
      vitalwelt: "15 Gehminuten",
      bahnhof: "20 Gehminuten",
    },
    naeheEn: {
      // DATEN: vom Autor zu ersetzen
      touristinfo: "a 12 minute walk",
      rauschberg: "less than 100 metres",
      arena: "a 15 minute walk",
      vitalwelt: "a 15 minute walk",
      bahnhof: "a 20 minute walk",
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
): string {
  const en = sprache === "en"
  return text.replace(
    /\{(naehe|standort):([a-zA-Z]+)\}/g,
    (_treffer, art: string, schluessel: string) => {
      if (art === "standort") {
        if (schluessel === "kurz") return en ? standort.kurzEn : standort.kurz
        if (schluessel === "label") return standort.label
        return ""
      }
      const wege = en ? standort.naeheEn : standort.naehe
      return wege[schluessel] ?? ""
    },
  )
}

/** Der aktive Aufstellort, von der Vorschauleiste nach unten gereicht. */
export const StandortContext = React.createContext<Standort>(STANDORTE[0])

export function useStandort(): Standort {
  return React.useContext(StandortContext)
}
