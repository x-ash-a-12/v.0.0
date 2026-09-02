import * as React from "react"

import { BERGBAHNEN, TOURIST_INFO } from "@/lib/daten"

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
  /** Wegangaben zu den Zielen, die in Antworten vorkommen. */
  naehe: Record<string, string>
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
    naehe: {
      // DATEN: vom Autor zu ersetzen
      touristinfo: "ein paar Schritte",
      rauschberg: "12 Gehminuten",
      arena: "20 Gehminuten",
      vitalwelt: "5 Gehminuten",
      bahnhof: "10 Gehminuten",
    },
  },
  {
    id: "bahnhof",
    label: "Bahnhof Ruhpolding",
    kurz: "am Bahnhof",
    naehe: {
      // DATEN: vom Autor zu ersetzen
      touristinfo: "10 Gehminuten",
      rauschberg: "20 Gehminuten",
      arena: "25 Gehminuten",
      vitalwelt: "12 Gehminuten",
      bahnhof: "keine zwei Schritte",
    },
  },
  {
    id: "rauschberg",
    label: `Talstation ${BERGBAHNEN.rauschbergName}`,
    kurz: `an der Talstation ${BERGBAHNEN.rauschbergName}`,
    naehe: {
      // DATEN: vom Autor zu ersetzen
      touristinfo: "12 Gehminuten",
      rauschberg: "keine 100 Meter",
      arena: "15 Gehminuten",
      vitalwelt: "15 Gehminuten",
      bahnhof: "20 Gehminuten",
    },
  },
]

/**
 * Ersetzt die Platzhalter eines Antworttexts.
 *
 * Unbekannte Platzhalter verschwinden, statt sichtbar stehen zu bleiben: eine
 * geschweifte Klammer im Text würde den Prototyp im Test sofort entlarven.
 */
export function aufloesen(text: string, standort: Standort): string {
  return text.replace(
    /\{(naehe|standort):([a-zA-Z]+)\}/g,
    (_treffer, art: string, schluessel: string) => {
      if (art === "standort") {
        if (schluessel === "kurz") return standort.kurz
        if (schluessel === "label") return standort.label
        return ""
      }
      return standort.naehe[schluessel] ?? ""
    },
  )
}

/** Der aktive Aufstellort, von der Vorschauleiste nach unten gereicht. */
export const StandortContext = React.createContext<Standort>(STANDORTE[0])

export function useStandort(): Standort {
  return React.useContext(StandortContext)
}
