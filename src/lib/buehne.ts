import * as React from "react"

/**
 * Das Element des simulierten Geräts in der Vorschau.
 *
 * Ein Overlay, das die bedienbare Fläche abdecken soll, hängt sich hier ein
 * statt an den <body>. Sonst läge es auch über der Vorschauleiste, und der
 * Versuchsleiter käme nicht mehr an Ansicht und Aufstellort.
 *
 * Der Context steht wie StandortContext in lib und nicht in der Komponente,
 * damit die Vorschau eine reine Komponentendatei bleibt.
 */
export const BuehneContext = React.createContext<HTMLElement | null>(null)
