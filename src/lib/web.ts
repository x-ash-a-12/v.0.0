import type { Chip, FlowNode } from "@/lib/chat-flow"
import type { Sprache } from "@/lib/sprache"

/**
 * Seiten auf ruhpolding.de, auf die der Prototyp verweist.
 *
 * Bisher endeten viele Antworten beim Satz, die Tourist-Information wisse
 * mehr, samt Telefon und Öffnungszeiten. Das hilft nur zu Öffnungszeiten.
 * Die offizielle Seite hält zu fast jedem Thema eine eigene Übersicht, und
 * genau die soll der Gast bekommen: nicht die Startseite, sondern die Seite
 * zu dem, wonach er gefragt hat (Vorgabe des Autors, 23.09.2026).
 *
 * Jede Adresse wurde am 23.09.2026 abgerufen und lieferte HTTP 200. Die
 * Glockenschmiede hat keine eigene Seite mehr (404), sie steht unter
 * "Museen". Wer eine Adresse ergänzt, prüft sie genauso, denn ein toter Link
 * am Terminal ist dieselbe Falschauskunft wie eine falsche Öffnungszeit.
 */
export type WebId =
  | "wandern"
  | "alle-wandertouren"
  | "wanderwege"
  | "gipfeltouren"
  | "almen"
  | "radfahren"
  | "biketouren"
  | "bergbahnen"
  | "unternberg"
  | "veranstaltungen"
  | "anreise"
  | "mobilitaet"
  | "chiemgau-karte"
  | "wetter"
  | "webcams"
  | "restaurants"
  | "familien"
  | "bei-regen"
  | "baeder"
  | "freizeit"
  | "coaster"
  | "museen"
  | "holzknechtmuseum"
  | "heimatmuseum"
  | "kirchen"
  | "winter"
  | "langlaufen"
  | "ski-alpin"
  | "skischulen"
  | "unterkunft"
  | "bauernhof"
  | "barrierefrei"
  | "kontakt"
  | "sport"
  | "paragleiten"
  | "fly-line"
  | "bergfit"
  | "terrainkur"
  | "golf"
  | "adventure-golf"
  | "minigolf"

export type WebSeite = {
  id: WebId
  url: string
  /** Wie die Seite im Satz heißt: "die Seite ... auf ruhpolding.de". */
  titel: string
  titelEn: string
}

const BASIS = "https://www.ruhpolding.de"

function seite(
  id: WebId,
  pfad: string,
  titel: string,
  titelEn: string
): [WebId, WebSeite] {
  return [id, { id, url: `${BASIS}/${pfad}`, titel, titelEn }]
}

export const WEB: Record<WebId, WebSeite> = Object.fromEntries([
  seite("wandern", "wandern", "Wandern", "Hiking"),
  seite(
    "alle-wandertouren",
    "alle-wandertouren",
    "Alle Wandertouren",
    "All hiking tours"
  ),
  seite(
    "wanderwege",
    "schoensten-wander-spazierwege",
    "Die schönsten Wander- & Spazierwege",
    "The most beautiful walks"
  ),
  seite(
    "gipfeltouren",
    "schoensten-gipfeltouren",
    "Die 10 schönsten Gipfeltouren",
    "The 10 most beautiful summit hikes"
  ),
  seite("almen", "almen", "Almen", "Mountain pastures and huts"),
  seite("radfahren", "radfahren", "Radfahren", "Cycling"),
  seite(
    "biketouren",
    "10-schoenste-biketouren",
    "Die 10 schönsten Bike-Touren",
    "The 10 most beautiful bike tours"
  ),
  seite("bergbahnen", "bergbahnen", "Bergbahnen", "Mountain lifts"),
  seite(
    "unternberg",
    "meine-bergwelt-unternberg-ruhpolding",
    "Meine Bergwelt Unternberg",
    "Meine Bergwelt Unternberg"
  ),
  seite(
    "veranstaltungen",
    "veranstaltungskalender",
    "Veranstaltungskalender",
    "Events calendar"
  ),
  seite(
    "anreise",
    "anreise-nach-ruhpolding",
    "Anreise nach Ruhpolding",
    "Getting to Ruhpolding"
  ),
  seite(
    "mobilitaet",
    "mobilitaet-vor-ort",
    "Mobilität vor Ort",
    "Getting around locally"
  ),
  seite(
    "chiemgau-karte",
    "chiemgau-karte",
    "Chiemgau Karte",
    "Chiemgau Karte guest card"
  ),
  seite("wetter", "wetter", "Wetter", "Weather"),
  seite("webcams", "webcams", "Webcams", "Webcams"),
  seite(
    "restaurants",
    "gaststaetten-und-restaurants",
    "Gaststätten & Restaurants",
    "Restaurants and inns"
  ),
  seite("familien", "fuer-familien", "Für Familien", "For families"),
  seite(
    "bei-regen",
    "bei-regen",
    "Ruhpolding bei Regen",
    "Ruhpolding in the rain"
  ),
  seite("baeder", "baeder-und-seen", "Bäder & Seen", "Pools and lakes"),
  seite(
    "freizeit",
    "freizeiteinrichtungen-in-ruhpolding",
    "Freizeiteinrichtungen",
    "Leisure facilities"
  ),
  seite(
    "coaster",
    "chiemgau-coaster-ruhpolding",
    "Chiemgau Coaster",
    "Chiemgau Coaster"
  ),
  seite("museen", "museen", "Museen", "Museums"),
  seite(
    "holzknechtmuseum",
    "holzknechtmuseum-chiemgau",
    "Holzknechtmuseum",
    "Woodcutters' museum"
  ),
  seite(
    "heimatmuseum",
    "heimatmuseum-ruhpolding-1",
    "Heimatmuseum",
    "Local history museum"
  ),
  seite(
    "kirchen",
    "kirchen-und-kapellen",
    "Kirchen & Kapellen",
    "Churches and chapels"
  ),
  seite("winter", "winter", "Winter", "Winter"),
  seite("langlaufen", "langlaufen", "Langlaufen", "Cross-country skiing"),
  seite("ski-alpin", "ski-alpin", "Ski Alpin", "Alpine skiing"),
  seite(
    "skischulen",
    "ski-snowboardschulen",
    "Ski- & Snowboardschulen",
    "Ski and snowboard schools"
  ),
  seite(
    "unterkunft",
    "unterkunftsuche",
    "Unterkunftsuche",
    "Accommodation search"
  ),
  seite(
    "bauernhof",
    "urlaub-auf-dem-bauernhof",
    "Urlaub auf dem Bauernhof",
    "Farm holidays"
  ),
  seite(
    "barrierefrei",
    "barrierefrei-reisen",
    "Barrierefrei reisen",
    "Accessible travel"
  ),
  seite("kontakt", "kontakt", "Kontakt", "Contact"),
  seite(
    "sport",
    "zeit-fuer-bewegung",
    "Zeit für Bewegung",
    "Time for exercise"
  ),
  seite(
    "paragleiten",
    "fliegen-und-paragleiten",
    "Fliegen & Paragleiten",
    "Flying and paragliding"
  ),
  seite(
    "fly-line",
    "meine-bergwelt-fly-line-am-unternberg",
    "Fly-Line am Unternberg",
    "Fly-Line at the Unternberg"
  ),
  seite("bergfit", "bergfit", "BergFit-Weg", "BergFit trail"),
  seite(
    "terrainkur",
    "terrainkurwege",
    "Terrainkurwege",
    "Terrain cure trails"
  ),
  seite("golf", "golf", "Golf", "Golf"),
  seite(
    "adventure-golf",
    "adventure-golf-park-ruhpolding-1",
    "Adventure Golf Park",
    "Adventure Golf Park"
  ),
  seite(
    "minigolf",
    "minigolf-1",
    "Minigolf am Kurhaus",
    "Minigolf at the Kurhaus"
  ),
]) as Record<WebId, WebSeite>

/** Die Seite zum Thema, wenn jemand ohne weiteren Bezug "die Website" will. */
export const THEMA_WEB: Record<string, WebId> = {
  wandern: "wandern",
  events: "veranstaltungen",
  anreise: "anreise",
  wetter: "wetter",
  essen: "restaurants",
  familie: "familien",
  winter: "winter",
  unterkunft: "unterkunft",
  info: "kontakt",
  sport: "sport",
}

export function webSeite(id: string): WebSeite | undefined {
  return (WEB as Record<string, WebSeite>)[id]
}

/** Schaltfläche auf die Seite, mit dem Titel der Seite oder eigener Aufschrift. */
export function webChip(id: WebId, sprache: Sprache, label?: string): Chip {
  const eintrag = WEB[id]
  return {
    label:
      label ??
      (sprache === "en"
        ? `${eintrag.titelEn} on ruhpolding.de`
        : `${eintrag.titel} auf ruhpolding.de`),
    to: `web:${id}`,
  }
}

const EINLEITUNG = [
  "Gern, hier ist die Seite „{titel}“ auf ruhpolding.de.",
  "Sehr gern. Auf der Seite „{titel}“ auf ruhpolding.de finden Sie mehr dazu.",
]
const EINLEITUNG_EN = [
  "Of course, here is the page „{titel}“ on ruhpolding.de.",
  "Gladly. You will find more on the page „{titel}“ on ruhpolding.de.",
]

type Zieher = (varianten: readonly string[]) => string

/**
 * Die Seite als QR-Code zum Mitnehmen, darunter der Link zum Anklicken.
 *
 * Eigener Rahmen (gestrichelt, Weltkugel), damit der Code nicht mit dem Weg
 * zum Ausgangspunkt oder dem Flyer verwechselt wird (qr-card.tsx).
 */
export function webKnoten(
  id: string,
  sprache: Sprache,
  waehle: Zieher
): FlowNode | null {
  const eintrag = webSeite(id)
  if (!eintrag) return null
  const en = sprache === "en"
  const titel = en ? eintrag.titelEn : eintrag.titel
  return {
    id: `web:${id}`,
    fertig: true,
    messages: [
      waehle(en ? EINLEITUNG_EN : EINLEITUNG).replace("{titel}", titel),
    ],
    qr: {
      art: "web",
      title: `ruhpolding.de: ${titel}`,
      hint: en
        ? "Scan with your phone camera to open the page."
        : "Mit der Handykamera scannen, dann öffnet sich die Seite.",
      url: eintrag.url,
    },
    nachher: [
      en
        ? "Is there anything else I can do for you?"
        : "Kann ich sonst noch etwas für Sie tun?",
    ],
    chips: [
      { label: en ? "Something else" : "Andere Frage", to: "menu" },
      { label: en ? "Thanks, that's all" : "Danke, das war's", to: "danke" },
    ],
  }
}
