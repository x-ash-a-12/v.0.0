import type { LucideIcon } from "lucide-react"
import {
  Activity,
  Bus,
  CalendarDays,
  CloudSun,
  Info,
  Mountain,
  Snowflake,
  Users,
  Utensils,
  BedDouble,
} from "lucide-react"

import { type Sprache } from "@/lib/sprache"
import { type Folge } from "@/lib/verstehen"
import { empfehlungsKnoten, fahrplanKnoten, zielKnoten } from "@/lib/empfehlung"
import { bedarfKnoten, vorschlagKnoten } from "@/lib/bedarf"
import { meldungenKnoten } from "@/lib/meldungen"
import { flyerKnoten, flyerListeKnoten, flyerNeinKnoten } from "@/lib/flyer"
import { dienstKnoten, verweisKnoten } from "@/lib/service"
import { webChip, webKnoten, type WebId } from "@/lib/web"
import type { WetterId } from "@/lib/wetter"
import { mapsSuche } from "@/lib/ziele"
import {
  zettelChip,
  zettelKnoten,
  type ZettelAnsicht,
  type ZettelEintrag,
} from "@/lib/zettel"
import {
  ANREISE,
  BERGBAHNEN,
  EVENTS,
  FAMILIE,
  GASTRONOMIE,
  KULTUR,
  PARKEN,
  TOURIST_INFO,
  WANDERN,
  WINTER,
} from "@/lib/daten"

/** Ein Quick-Reply-Button unter einer Bot-Nachricht. */
export type Chip = {
  label: string
  /** Ziel-Knoten im Antwortpfad. */
  to: string
  /**
   * Thema, aus dem der Vorschlag stammt.
   *
   * Nur die Kandidaten einer Rückfrage tragen es. Dort führt das Ziel oft auf
   * einen Unterknoten ("bergbahn-preise"), aus dessen ID sich das Thema nicht
   * ablesen lässt. Ohne diese Angabe blieb die englische Rückfrage bei den
   * deutschen Themennamen stehen.
   */
  topic?: string
}

/** Strukturierte Info als Karte (Preise, Kontaktdaten, Fahrpläne). */
export type InfoCard = {
  title: string
  rows: { label: string; value: string }[]
  note?: string
}

/**
 * Eine Tabelle, etwa mit den nächsten Abfahrten.
 *
 * Fahrplanzeiten in Fließtext zu setzen ist die Art von Auskunft, die man
 * zweimal lesen muss: "der nächste um 15:47, dann um 16:51, dann um 17:50"
 * lässt sich nicht überfliegen. In Spalten steht die Abfahrt neben der
 * Ankunft, und die Zeile, die gerade zählt, ist die oberste.
 */
export type DataTable = {
  title: string
  columns: string[]
  rows: string[][]
  /** Hervorgehobene Zeile, üblicherweise die nächste Abfahrt. */
  highlight?: number
  note?: string
}

/** Ein Bild mit Urheber und Herkunft, fertig in der Dialogsprache. */
export type BildAnzeige = {
  url: string
  alt: string
  urheber: string
  seite: string
}

/** Ein QR-Code zum Mitnehmen auf das eigene Gerät. */
export type QrPayload = {
  title: string
  hint: string
  url: string
  /**
   * "flyer" für einen Code auf ein Flyer-PDF, "web" für eine Seite auf
   * ruhpolding.de. Beide bekommen einen anderen Rahmen als der Code zum
   * Ausgangspunkt, damit der Gast sie auseinanderhält.
   */
  art?: "flyer" | "web"
}

/** Ein Knoten im vordefinierten Gesprächsbaum. */
export type FlowNode = {
  id: string
  /**
   * Jeder Eintrag wird zu einer eigenen Sprechblase. Steht dort statt eines
   * Texts eine Liste, ist sie eine Variantenliste: beim Ausgeben wird eine
   * davon gezogen. Ein Modell formuliert nie zweimal identisch, feste Strings
   * sind bei Wiederholung sofort als Datenbank erkennbar.
   *
   * Jede Variante muss denselben Informationsgehalt haben. Getauscht wird
   * die Formulierung, nie der Inhalt.
   */
  messages: (string | string[])[]
  card?: InfoCard
  table?: DataTable
  chips?: Chip[]
  /**
   * Erzwingt eine Überbrückung vor der Antwort. Knoten mit Karte bekommen
   * sie ohnehin, hier steht sie für Antworten, bei denen Nachschlagen
   * plausibel wirkt.
   */
  bridge?: boolean
  /** Wird als eigene Karte mit QR-Code unter die Antwort gehängt. */
  qr?: QrPayload
  /**
   * Ein Bild von ruhpolding.de, direkt nach der ersten Blase. Nur in der
   * Detailauskunft zu einem gewählten Ziel (bilder.ts).
   */
  bild?: BildAnzeige
  /**
   * Zugehöriges Thema aus TOPICS. Das Gedächtnis erkennt daran einen
   * Themenwechsel. Aus der ID allein ginge das nicht, "bergbahn-preise"
   * gehört zu "wandern".
   */
  topic?: string
  /**
   * Verkürzte Fassung, wenn der Knoten ein zweites Mal angesteuert wird.
   * Dieselbe Textwand zweimal zu lesen fällt im Test sofort auf.
   */
  kurz?: (string | string[])[]
  /**
   * Ziele, die dieser Knoten zur Auswahl stellt.
   *
   * Sie sind der Bezugspunkt für die nächste Eingabe: wer "ich würde gern auf
   * den Rauschberg" schreibt, wählt aus dieser Liste, ohne eine Schaltfläche
   * anzufassen.
   */
  angebot?: string[]
  /** Aus welcher Vorschlagsgruppe das Angebot stammt, und ab welcher Stelle. */
  gruppe?: { id: string; ab: number }
  /**
   * Das Ziel, um das es in diesem Knoten geht.
   *
   * Damit lässt sich "navigiere mich da hin" beantworten, ohne dass das Ziel
   * noch einmal genannt werden muss.
   */
  ziel?: string
  /**
   * Der Knoten ist bereits in der Dialogsprache gebaut und braucht keine
   * Übersetzung mehr. Gilt für alles, was zur Laufzeit entsteht.
   */
  fertig?: boolean
  /**
   * Der nächste Ausschnitt derselben Vorschlagsliste, für "gibt es noch
   * andere". Vorschläge aus der Bedarfsklärung haben keine Gruppe, deshalb
   * steht der Weg hier direkt.
   */
  weiter?: string
  /**
   * Aktuelle Hinweise, die dieser Knoten ausdrücklich zeigt, auch wenn sie
   * im Gespräch schon vorkamen. Sonst erscheinen Hinweise nur einmal und nur
   * beim passenden Thema (meldungen.ts).
   */
  hinweise?: string[]
  /** Der Zettel des Gasts, als eigene Karte. */
  zettel?: ZettelAnsicht
  /**
   * Nachrichten nach Karte, Tabelle, Zettel und QR-Code. Für den Abschluss
   * eines Vorgangs: erst "ich drucke", dann der Ausdruck, dann "fertig".
   */
  nachher?: (string | string[])[]
  /**
   * Zusätzliche Wartezeit in Millisekunden, bevor der Anhang erscheint. Die
   * Tippanzeige läuft dabei weiter, damit sichtbar bleibt, dass etwas
   * passiert (M [00:58:14]).
   */
  warten?: number
  /**
   * Die Antwort endet mit einer Ja-Nein-Frage. Ein getipptes "ja" wählt dann
   * die erste Schaltfläche, ein "nein" führt nach `nein`.
   */
  jaNein?: boolean
  nein?: string
  /**
   * Der Knoten ist eine Rückfrage auf eine unverstandene Eingabe. Er lässt
   * den Gesprächszustand stehen, damit die nächste Eingabe sich noch auf die
   * vorige Frage beziehen kann.
   */
  behalteKontext?: boolean
}

/** Thema für die Startauswahl und das Menü. */
export type Topic = {
  id: string
  label: string
  /**
   * Fließtextform für Rückfragen. Das Chip-Label liest sich mitten im Satz
   * wie ein Menüeintrag, diese Form nicht.
   */
  satz: string
  /** Englische Fassungen für die Sprachumschaltung (AP9). */
  labelEn: string
  satzEn: string
  icon: LucideIcon
}

export const TOPICS: Topic[] = [
  {
    id: "wandern",
    label: "Wandern & Bergbahnen",
    satz: "Wandern und die Bergbahnen",
    labelEn: "Hiking & mountain lifts",
    satzEn: "hiking and the mountain lifts",
    icon: Mountain,
  },
  {
    id: "sport",
    label: "Sport & Aktiv",
    satz: "Sport und Bewegung",
    labelEn: "Sport & activities",
    satzEn: "sport and activities",
    icon: Activity,
  },
  {
    id: "events",
    label: "Veranstaltungen",
    satz: "Veranstaltungen im Ort",
    labelEn: "Events",
    satzEn: "events in the village",
    icon: CalendarDays,
  },
  {
    id: "anreise",
    label: "Anreise & Parken",
    satz: "Anreise und Parken",
    labelEn: "Getting here & parking",
    satzEn: "getting here and parking",
    icon: Bus,
  },
  {
    id: "wetter",
    label: "Wetter & Bergwetter",
    satz: "das Wetter",
    labelEn: "Weather",
    satzEn: "the weather",
    icon: CloudSun,
  },
  {
    id: "essen",
    label: "Essen & Einkehr",
    satz: "Essen und Einkehr",
    labelEn: "Food & drink",
    satzEn: "food and drink",
    icon: Utensils,
  },
  {
    id: "familie",
    label: "Mit Kindern unterwegs",
    satz: "Angebote für Familien",
    labelEn: "With children",
    satzEn: "things to do with children",
    icon: Users,
  },
  {
    id: "winter",
    label: "Winter & Langlauf",
    satz: "Winter und Langlauf",
    labelEn: "Winter & cross-country",
    satzEn: "winter and cross-country skiing",
    icon: Snowflake,
  },
  {
    id: "unterkunft",
    label: "Übernachten",
    satz: "eine Unterkunft",
    labelEn: "Where to stay",
    satzEn: "somewhere to stay",
    icon: BedDouble,
  },
  {
    id: "info",
    label: "Tourist-Information",
    satz: "die Tourist-Information",
    labelEn: "Tourist information",
    satzEn: "the tourist information",
    icon: Info,
  },
]

const menuChips: Chip[] = TOPICS.map((topic) => ({
  label: topic.label,
  to: topic.id,
}))

/**
 * Die Auswahl am Einstieg.
 *
 * Vorher standen hier alle neun Themen. Die Auskunft wirft dem Gast nicht
 * alles auf einmal hin (KA [00:14:27]), sie fragt zuerst, was er will, und
 * gibt ihm dann meistens den Ortsplan (KA [00:30:27]). Deshalb stehen am
 * Anfang die Frage nach dem Vorhaben, die Orientierung und die Bahn, die am
 * Bahnhof täglich gefragt wird. Die Themen bleiben über "Alle Themen" da.
 */
const startChips: Chip[] = [
  { label: "Was kann ich hier unternehmen?", to: "bedarf:" },
  { label: "Ortsplan & Orientierung", to: "dienst:ortsplan" },
  { label: "Bahn & Bus", to: "fahrplan:traunstein" },
  { label: "Aktuelle Hinweise", to: "hinweise" },
  { label: "Alle Themen", to: "menu" },
]

/**
 * Verweis auf die passende Seite von ruhpolding.de. Der Knotenbaum ist auf
 * Deutsch gebaut, die englische Aufschrift setzt i18n.ts ein.
 */
const web = (id: WebId, label?: string): Chip => webChip(id, "de", label)

const backChips = (topic: string): Chip[] => [
  { label: "Zurück zum Thema", to: topic },
  { label: "Andere Frage", to: "menu" },
]

/** Zuletzt gezogener Index je Variantenliste, als Schlüssel die Liste selbst. */
const zuletzt = new Map<readonly string[], number>()

/**
 * Zieht eine Variante, nie zweimal dieselbe hintereinander. Wiederholt sich
 * eine Formulierung im selben Gespräch wortgleich, ist die Wirkung dahin.
 */
export function waehleVariante(varianten: readonly string[]): string {
  const vorher = zuletzt.get(varianten)
  let index = Math.floor(Math.random() * varianten.length)
  while (varianten.length > 1 && index === vorher) {
    index = Math.floor(Math.random() * varianten.length)
  }
  zuletzt.set(varianten, index)
  return varianten[index]
}

/** Löst die Variantenlisten einer Nachrichtenfolge zu festen Texten auf. */
export function ausformulieren(messages: (string | string[])[]): string[] {
  return messages.map((eintrag) =>
    Array.isArray(eintrag) ? waehleVariante(eintrag) : eintrag
  )
}

/** Überbrückung, solange die eigentliche Antwort noch nicht steht. */
const UEBERBRUECKUNGEN = [
  "Einen kleinen Moment, ich schaue für Sie nach.",
  "Ich sehe kurz für Sie nach.",
  "Das habe ich gleich für Sie.",
  "Moment, ich hole Ihnen die Zahlen.",
] as const

const UEBERBRUECKUNGEN_EN = [
  "One moment, I will look that up.",
  "Let me check.",
  "I have that in a moment.",
  "One moment, I will fetch the figures.",
] as const

/**
 * Sie steht vor jeder Karte und jeder Tabelle und war bis zum Testlauf vom
 * 17.09. auch auf Englisch deutsch. Gerade dort fällt es auf: die
 * Überbrückung ist die erste Zeile, die nach dem Antippen erscheint.
 */
export function ueberbrueckung(sprache: Sprache = "de"): string {
  return waehleVariante(
    sprache === "en" ? UEBERBRUECKUNGEN_EN : UEBERBRUECKUNGEN
  )
}

export const FLOW: Record<string, FlowNode> = {
  start: {
    id: "start",
    messages: [
      "Grüß Gott und herzlich willkommen in Ruhpolding! Schön, dass Sie da sind. Ich bin der digitale Assistent der Tourist-Information und helfe Ihnen gern bei allem rund um Ihren Aufenthalt.",
      "Sie stehen gerade {standort:kurz}. Erzählen Sie mir einfach, was Sie vorhaben, dann suche ich Ihnen das Passende heraus. Oder tippen Sie unten auf ein Thema.",
    ],
    chips: startChips,
  },

  menu: {
    id: "menu",
    messages: [
      [
        "Sehr gern. Wobei kann ich Ihnen noch helfen?",
        "Gern. Was darf es sonst noch sein?",
      ],
    ],
    chips: menuChips,
  },

  danke: {
    id: "danke",
    messages: [
      "Sehr gern geschehen! Ich wünsche Ihnen eine schöne Zeit in Ruhpolding. Und wenn Ihnen morgen noch etwas einfällt, kommen Sie einfach wieder vorbei, Sie stören nie.",
    ],
    chips: menuChips,
  },

  /*
   * Fragen an das Gerät statt an den Ort.
   *
   * Im Testlauf vom 03.09. blieben "wo bin ich", "was kann ich hier machen"
   * und "gib mir einen QR-Code aus" allesamt ohne Treffer. Für eine
   * Testperson sind das keine Randfälle: sie stehen vor einem Bildschirm an
   * einem fremden Ort und fragen zuerst nach der Lage, dann nach dem Gerät.
   * Ein Sprachmodell würde beides beantworten, ohne dass jemand es dafür
   * vorbereitet hätte.
   */

  standort: {
    id: "standort",
    messages: [
      [
        "Sie stehen gerade {standort:kurz}, hier in Ruhpolding im Chiemgau.",
        "Dieses Gerät steht {standort:kurz} in Ruhpolding.",
      ],
      "Zur Tourist-Information sind es von hier {naehe:touristinfo}.",
    ],
    chips: [
      { label: "Was kann ich hier machen?", to: "bedarf:" },
      { label: "Ortsplan", to: "dienst:ortsplan" },
      { label: "Anreise & Parken", to: "anreise" },
      { label: "Andere Frage", to: "menu" },
    ],
  },

  /*
   * "Was kann ich hier machen" führt jetzt in die Vorschlagsliste.
   *
   * Vorher stand hier ein Satz über die Umgebung und darunter das Themenmenü.
   * Das beantwortet die Frage nicht: wer so fragt, will nicht in eine
   * Themenauswahl geschickt werden, sondern etwas vorgeschlagen bekommen, aus
   * dem er wählen kann.
   */

  "ueber-mich": {
    id: "ueber-mich",
    messages: [
      [
        "Ich bin der digitale Assistent der Tourist-Information Ruhpolding, kein Mensch. Ich kenne die Themen rund um den Aufenthalt hier: Wandern und die Bergbahnen, Veranstaltungen, Anreise und Parken, Wetter, Essen, Angebote für Familien, den Winter, Unterkünfte und die Tourist-Info selbst.",
        "Ich bin ein digitaler Assistent, kein Mitarbeiter aus Fleisch und Blut. Auskunft gebe ich zu Wandern und Bergbahnen, Veranstaltungen, Anreise und Parken, Wetter, Essen, Familienangeboten, Winter, Unterkünften und der Tourist-Information.",
      ],
      [
        "Sie können frei tippen, ganze Sätze sind kein Problem. Was ich nicht weiß, sage ich Ihnen auch.",
        "Schreiben Sie einfach los, gern in ganzen Sätzen. Wenn ich etwas nicht hinterlegt habe, sage ich es Ihnen offen.",
      ],
    ],
    chips: menuChips,
  },

  "qr-hinweis": {
    id: "qr-hinweis",
    messages: [
      [
        `Zu Zielen, bei denen sich das lohnt, blende ich einen QR-Code ein. Sie scannen ihn mit der Handykamera und haben die Route auf dem eigenen Gerät. Sagen Sie mir, wohin Sie möchten, dann gebe ich den Code dazu aus.`,
        `Für Ziele im Ort gebe ich einen QR-Code mit aus: einmal mit der Handykamera scannen und die Route ist auf Ihrem Gerät. Nennen Sie mir das Ziel, dann bekommen Sie den passenden Code.`,
      ],
    ],
    chips: [
      { label: `Weg zum ${BERGBAHNEN.unternbergName}`, to: "ziel:unternberg" },
      { label: `Weg zu ${WANDERN.taubensee}`, to: "ziel:taubensee" },
      { label: "Weg zum Parkplatz", to: "ziel:rathausgarage" },
      { label: "Andere Frage", to: "menu" },
    ],
  },

  wandern: {
    id: "wandern",
    topic: "wandern",
    kurz: [
      `Wie gesagt: die ${BERGBAHNEN.unternbergBahn} am ${BERGBAHNEN.unternbergName} fährt, die Rauschbergbahn derzeit nicht.`,
    ],
    // Bis zum 22.09. stand hier, beide Bahnen führen täglich. Die
    // Rauschbergbahn fährt laut ruhpolding.de nicht, siehe daten.ts.
    messages: [
      [
        `Rund um Ruhpolding gibt es Touren für jeden Anspruch, vom Weg durch die ${WANDERN.taubensee} (${WANDERN.taubenseeLaenge}) bis zum ${WANDERN.sonntagshorn} (${WANDERN.sonntagshornHoehe}).`,
        `Die Spanne reicht vom Weg durch die ${WANDERN.taubensee} mit ${WANDERN.taubenseeLaenge} bis zum ${WANDERN.sonntagshorn} mit ${WANDERN.sonntagshornHoehe}.`,
      ],
      [
        `Ohne Aufstieg kommen Sie mit der ${BERGBAHNEN.unternbergBahn} auf den ${BERGBAHNEN.unternbergName}. Die Rauschbergbahn fährt derzeit nicht, sie wird neu gebaut.`,
        `Hinauf ohne eigenen Aufstieg geht es mit der ${BERGBAHNEN.unternbergBahn} am ${BERGBAHNEN.unternbergName}. Die Rauschbergbahn steht still, weil sie neu gebaut wird.`,
      ],
      "Damit ich Ihnen die passende Tour nenne: Darf ich Ihnen ein paar Fragen stellen?",
    ],
    // "ja gern" blieb im Testlauf vom 23.09.2026 ohne Treffer.
    jaNein: true,
    nein: "vorschlag:i=berge,f=1:0",
    chips: [
      { label: "Ja, passende Tour finden", to: "bedarf:i=berge" },
      { label: "Welche Bergbahnen gibt es?", to: "bergbahnen" },
      // Der Überblick über alle Touren, den der Prototyp nicht hält (Vorgabe
      // des Autors, 23.09.2026).
      web("alle-wandertouren", "Alle Touren auf ruhpolding.de"),
      { label: "Andere Frage", to: "menu" },
    ],
  },
  "wandern-leicht": {
    id: "wandern-leicht",
    // Laut Flyer "Die 10 schönsten Wander- & Spazierwege", 03/25. Andere
    // Wege nennt der Prototyp für den Kinderwagen nicht.
    messages: [
      "Für den Kinderwagen nennt der Wanderflyer der Tourist-Information diese Wege:",
      "— Ruhpoldinger Sagenweg, 3,6 km, barrierefrei und problemlos mit Kinderwagen\n— Traunauen und Taubensee, 8,6 km, mit geländegängigem Kinderwagen\n— Schwarzachen Alm, 7,1 km, breite Forststraße, kaum steigend",
      "Zu welchem Weg möchten Sie mehr wissen?",
    ],
    topic: "wandern",
    angebot: ["sagenweg", "taubensee", "schwarzachen"],
    chips: [
      { label: "Ruhpoldinger Sagenweg", to: "ziel:sagenweg" },
      { label: "Traunauen und Taubensee", to: "ziel:taubensee" },
      { label: "Schwarzachen Alm", to: "ziel:schwarzachen" },
      web("wanderwege"),
      { label: "Andere Frage", to: "menu" },
    ],
  },
  "wandern-schwer": {
    id: "wandern-schwer",
    // Anforderungen laut Flyer "Die 10 schönsten Gipfeltouren", 03/25.
    // Vorher stand hier nur "festes Schuhwerk und Trittsicherheit", das
    // unterschlug das Klettern im I. bis II. Grad.
    messages: [
      `Die anspruchsvollste Tour im Gipfelflyer ist das ${WANDERN.sonntagshorn} (${WANDERN.sonntagshornHoehe}), der höchste Berg des Chiemgaus: 16,9 km, 9 Stunden, 1.340 Höhenmeter ab der Laubau.`,
      "Sie erfordert laut Flyer alpine Erfahrung, Trittsicherheit, Schwindelfreiheit und Kletterkönnen im I. bis II. Schwierigkeitsgrad.",
    ],
    ziel: "sonntagshorn",
    topic: "wandern",
    chips: [
      { label: "Mehr zum Sonntagshorn", to: "ziel:sonntagshorn" },
      { label: "Alle Gipfeltouren", to: "empfehlung:gipfel:0" },
      web("gipfeltouren"),
      { label: "Andere Frage", to: "menu" },
    ],
  },
  /*
   * Eigener Knoten für die Frage, welche Bahnen es gibt.
   *
   * Bisher landete "welche Bergbahnen gibt es" auf dem Themeneinstieg, und
   * die Nachfrage "ja welche genau" fand nichts mehr, weil die Antwort schon
   * gefallen war. Der Einstieg nennt die Bahnen im Nebensatz, hier stehen sie
   * mit dem, was man vor Ort wissen will.
   */
  bergbahnen: {
    id: "bergbahnen",
    messages: [
      [
        `Im Ort gibt es zwei: die ${BERGBAHNEN.unternbergBahn} auf den ${BERGBAHNEN.unternbergName} und die Rauschbergbahn. Die Rauschbergbahn fährt derzeit nicht, weil sie neu gebaut wird.`,
        `Zwei Bahnen gibt es, die ${BERGBAHNEN.unternbergBahn} zum ${BERGBAHNEN.unternbergName} und die Rauschbergbahn. Fahren können Sie derzeit nur am ${BERGBAHNEN.unternbergName}, die Rauschbergbahn wird neu gebaut.`,
      ],
      "Bei Regen fährt die Sesselbahn am Unternberg nicht.",
    ],
    topic: "wandern",
    ziel: "unternberg",
    chips: [
      { label: "Weg zum Unternberg", to: "ziel:unternberg" },
      { label: "Preise Bergbahnen", to: "bergbahn-preise" },
      web("bergbahnen"),
      { label: "Andere Frage", to: "menu" },
    ],
  },

  "bergbahn-preise": {
    id: "bergbahn-preise",
    // Ohne Rauschberg-Preis (kein Fahrbetrieb) und ohne Gästekarten-
    // Ermäßigung (nicht belegt, daten.ts).
    messages: ["Hier die Preise der Sesselbahn am Unternberg."],
    card: {
      title: "Unternberg Sesselbahn",
      rows: [
        {
          label: "Erwachsene, Berg- und Talfahrt",
          value: BERGBAHNEN.unternbergErwachsen,
        },
        {
          label: `Kinder ${BERGBAHNEN.kinderAlter}`,
          value: BERGBAHNEN.ermaessigungKinder,
        },
      ],
      note: BERGBAHNEN.kartenhinweis,
    },
    topic: "wandern",
    chips: [web("unternberg"), ...backChips("wandern")],
  },

  /*
   * Sport, seit dem 23.09.2026. Quelle ruhpolding.de/zeit-fuer-bewegung.
   * Wie beim Wandern erst die Frage, ob der Prototyp nachfragen darf: die
   * Auswahl reicht vom Tandemflug bis zum Minigolf, und was passt, hängt an
   * Begleitung und Wetter.
   */
  sport: {
    id: "sport",
    topic: "sport",
    kurz: [
      "Wie gesagt: vom Tandemflug am Unternberg über Golf bis zum BergFit-Weg ist einiges dabei.",
    ],
    messages: [
      [
        "Sportlich ist in Ruhpolding einiges geboten: Tandem-Gleitschirmfliegen und die Fly-Line am Unternberg, Golf und Adventure Golf, dazu der BergFit-Weg, der Ihre Kondition für die Berge testet.",
        "Wer sich bewegen will, hat hier die Wahl: vom Tandemflug am Unternberg über den Golfclub bis zum BergFit-Weg, auf dem Sie Ihre Bergkondition testen können.",
      ],
      "Radfahren und Mountainbiken gehören natürlich auch dazu, im Winter Langlauf und Skifahren. Soll ich Ihnen etwas heraussuchen, das zu Ihnen passt?",
    ],
    jaNein: true,
    nein: "vorschlag:i=sport,f=1:0",
    chips: [
      { label: "Ja, gern", to: "bedarf:i=sport" },
      { label: "Radfahren & MTB", to: "bedarf:i=rad" },
      { label: "Wintersport", to: "winter" },
      web("sport", "Alle Sportangebote auf ruhpolding.de"),
      { label: "Andere Frage", to: "menu" },
    ],
  },

  events: {
    id: "events",
    topic: "events",
    kurz: [
      `Wie gesagt: der ${EVENTS.biathlonKurz} ${EVENTS.biathlonTermin}, alles Weitere im Wochenprogramm der Tourist-Information.`,
    ],
    // Vorher mit Sommerkonzerten und Wochenmarkt, beide nicht belegt.
    messages: [
      [
        `Fester Termin ist der ${EVENTS.biathlonKurz} in der ${EVENTS.chiemgauArena}, die nächste Ausgabe ist ${EVENTS.biathlonTermin}.`,
        `Der feste Höhepunkt im Jahr ist der ${EVENTS.biathlonKurz} in der ${EVENTS.chiemgauArena}, als Nächstes ${EVENTS.biathlonTermin}.`,
      ],
      "Alle weiteren Veranstaltungen stehen im Veranstaltungskalender. Die Tourist-Information gibt außerdem jede Woche ein gedrucktes Programm aus.",
    ],
    chips: [
      { label: "Biathlon-Weltcup", to: "events-biathlon" },
      { label: "Karten kaufen", to: "dienst:tickets" },
      { label: "Was ist diese Woche los?", to: "events-woche" },
      web("veranstaltungen"),
      { label: "Andere Frage", to: "menu" },
    ],
  },
  "events-biathlon": {
    id: "events-biathlon",
    bridge: true,
    // Den Skibus im Viertelstundentakt gab es nur im Antworttext, belegt ist
    // die Dorflinie 9533 mit Halt an der Arena.
    messages: [
      `Der ${EVENTS.biathlonName} findet ${EVENTS.biathlonTermin} in der ${EVENTS.chiemgauArena} statt. Karten gibt es in der Tourist-Information und online über Reservix. Die Dorflinie 9533 hält an der Arena. Von hier sind es {naehe:arena}.`,
    ],
    ziel: "arena",
    qr: {
      title: `Weg zur ${EVENTS.chiemgauArena}`,
      hint: "Scanne den Code, um die Route mitzunehmen.",
      url: mapsSuche(EVENTS.chiemgauArena),
    },
    topic: "events",
    chips: backChips("events"),
  },
  "events-woche": {
    id: "events-woche",
    // Vorher eine erfundene "Demo-Auswahl" mit Standkonzert, Kräuter-
    // wanderung und Wochenmarkt. Nichts davon war belegt.
    // KA [00:05:04]: "Wir machen außerdem jede Woche Veranstaltungsprogramme,
    // die ausgegeben werden. Es steht alles auf unserer Webseite."
    messages: [
      "Das aktuelle Wochenprogramm habe ich nicht hinterlegt. Die Tourist-Information gibt es jede Woche gedruckt aus, und alle Veranstaltungen stehen im Veranstaltungskalender auf ruhpolding.de.",
      `Die Tourist-Information hat ${TOURIST_INFO.oeffnungszeiten} geöffnet.`,
    ],
    topic: "events",
    chips: [web("veranstaltungen"), ...backChips("events")],
  },

  anreise: {
    id: "anreise",
    topic: "anreise",
    kurz: [
      `Wie gesagt: mit dem Auto über die ${ANREISE.autobahn} bis ${ANREISE.ausfahrt}, mit der Bahn über Traunstein.`,
    ],
    // Ohne Bundesstraße, Takt, Abfahrt ab München und Fahrzeit: keine davon
    // ist belegt (daten.ts).
    messages: [
      [
        `Mit dem Auto über die ${ANREISE.autobahn} bis zur Ausfahrt ${ANREISE.ausfahrt}, von dort sind es ${ANREISE.fahrzeitAbAusfahrt}.`,
        `Wer mit dem Auto kommt, verlässt die ${ANREISE.autobahn} bei ${ANREISE.ausfahrt}, danach sind es noch ${ANREISE.fahrzeitAbAusfahrt}.`,
      ],
      [
        "Mit der Bahn geht es über Traunstein, von dort fährt die Bayerische Regiobahn nach Ruhpolding. Zum Bahnhof sind es von hier {naehe:bahnhof}.",
        "Die Bahn kommt über Traunstein, die Strecke nach Ruhpolding fährt die Bayerische Regiobahn. Zum Bahnhof sind es von hier {naehe:bahnhof}.",
      ],
    ],
    chips: [
      { label: "Bahn nach Traunstein", to: "fahrplan:traunstein" },
      { label: "Parken im Ort", to: "anreise-parken" },
      { label: "Ortsbus & Gästekarte", to: "anreise-bus" },
      web("anreise"),
      { label: "Andere Frage", to: "menu" },
    ],
  },
  "anreise-parken": {
    id: "anreise-parken",
    messages: ["Ein Überblick über die Parkmöglichkeiten im Ort."],
    // Ohne das Parkhaus an der Vitalwelt und ohne freies Parken mit
    // Gästekarte, beides nicht belegt.
    card: {
      title: "Parken in Ruhpolding",
      rows: [
        { label: PARKEN.rathaus, value: PARKEN.rathausTarif },
        { label: PARKEN.laubau, value: PARKEN.laubauTarif },
        { label: "Wohnmobile", value: PARKEN.wohnmobile },
      ],
      // Flyer "Ruhpoldinger Almsommer", Drucklegung 03/25.
      note: "Im Ortszentrum parken Sie kostenfrei, Parkzeitbegrenzungen und Parkscheibe gelten weiterhin. Gebührenpflichtig sind die Wanderparkplätze, der Parkplatz an der Chiemgau Arena und die Tiefgarage.",
    },
    ziel: "rathausgarage",
    qr: {
      title: `Weg zum ${PARKEN.rathaus}`,
      hint: "Scannen Sie den Code, um sich hinführen zu lassen.",
      url: mapsSuche(PARKEN.rathaus),
    },
    topic: "anreise",
    chips: backChips("anreise"),
  },
  /*
   * Das Busnetz als Tabelle.
   *
   * Im Testlauf um 12:30 blieb "wie ist der Fahrplan dieser Linien" ohne
   * Antwort. Ehrlich beantworten lässt sich die Frage nur halb: die Strecken
   * der beiden Dorflinien sind belegt, ein Takt ist es nicht. Genau das steht
   * hier, statt entweder zu schweigen oder Zeiten zu erfinden.
   */
  busnetz: {
    id: "busnetz",
    topic: "anreise",
    messages: [
      [
        `Im Ort fahren zwei Dorflinien, dazu der Rufbus ${ANREISE.rufbusName}. Hier die Strecken.`,
        `Es gibt zwei Dorflinien und den Rufbus ${ANREISE.rufbusName}. Die Strecken im Überblick.`,
      ],
      [
        `${ANREISE.rufbusHinweis} Er fährt werktags ${ANREISE.rufbusWerktags}, am Wochenende und an Feiertagen ${ANREISE.rufbusWochenende}. Mit der ${ANREISE.gaestekarteName} sind beide Dorflinien kostenlos.`,
      ],
    ],
    table: {
      title: "Busse in Ruhpolding",
      columns: ["Linie", "Strecke"],
      rows: [
        ["9532", ANREISE.dorflinie9532],
        ["9533", ANREISE.dorflinie9533],
        [ANREISE.rufbusName, ANREISE.rufbusHinweis],
        ["RVO", `Regionalbusse nach ${ANREISE.regionalZiele}`],
      ],
      // SIMULIERT wäre hier ein Takt. Die Quelle nennt keinen, deshalb steht
      // an seiner Stelle der Verweis auf die Auskunft vor Ort.
      note: "Für die Dorflinien ist bei Ruhpolding Tourismus kein Takt veröffentlicht. Abfahrtszeiten hängen an den Haltestellen aus und liegen in der Tourist-Information aus.",
    },
    chips: [
      { label: "Bahn nach Traunstein", to: "fahrplan:traunstein" },
      { label: "Ortsbus & Gästekarte", to: "anreise-bus" },
      web("mobilitaet"),
      { label: "Andere Frage", to: "menu" },
    ],
  },

  "anreise-bus": {
    id: "anreise-bus",
    // Ohne Takt: für die Dorflinien ist keiner veröffentlicht.
    messages: [
      `Im Ort fahren die Dorflinien (${ANREISE.ortsbusLinie}) und der Rufbus ${ANREISE.rufbusName}. Mit der ${ANREISE.gaestekarteName} sind die Dorflinien kostenlos, die Bahn bis ${ANREISE.gaestekarteBahnBis} ebenfalls.`,
    ],
    topic: "anreise",
    chips: [
      { label: "Welche Linien gibt es?", to: "busnetz" },
      { label: "Bahn nach Traunstein", to: "fahrplan:traunstein" },
      web("chiemgau-karte"),
      { label: "Andere Frage", to: "menu" },
    ],
  },

  wetter: {
    id: "wetter",
    topic: "wetter",
    // SIMULIERT: tagesaktuelle Angabe, siehe Kommentar an den Nachrichten.
    kurz: ["Wie gesagt: {wetter:lage}"],
    // SIMULIERT: tagesaktuelle Angabe, im Prototyp ohne Datenanbindung nicht
    // echt darstellbar. In Abschnitt 4.4 der Arbeit als Grenze auszuweisen.
    // Die Lage kommt aus der Einstellung des Versuchsleiters (wetter.ts),
    // damit Wetterauskunft und Vorschläge nicht auseinanderlaufen.
    messages: ["{wetter:lage}"],
    chips: [
      { label: "Was passt zum Wetter?", to: "bedarf:f=1" },
      { label: "Bergwetter 3 Tage", to: "wetter-3tage" },
      { label: "Webcams", to: "wetter-webcam" },
      { label: "Andere Frage", to: "menu" },
    ],
  },
  "wetter-3tage": {
    id: "wetter-3tage",
    // Vorher eine erfundene Demo-Prognose, die auch der Wettereinstellung
    // widersprechen konnte.
    messages: [
      "Eine Prognose für die nächsten Tage habe ich selbst nicht hinterlegt. Die aktuelle Vorhersage für Ruhpolding steht aber auf ruhpolding.de.",
      "Die Tourenflyer der Tourist-Information raten, Wetterbericht und Strecke vor jeder Tour genau zu prüfen.",
    ],
    topic: "wetter",
    chips: [web("wetter", "Vorhersage auf ruhpolding.de"), ...backChips("wetter")],
  },
  "wetter-webcam": {
    id: "wetter-webcam",
    // Die früher genannten Webcam-Standorte waren nicht belegt. Seit dem
    // 23.09.2026 aus ruhpolding.de/webcams: Eggerschneid mit Blick zum
    // Rauschberg, Rauschberg und dreimal Hochfelln.
    messages: [
      "Webcam-Bilder kann ich Ihnen hier nicht zeigen. Auf ruhpolding.de gibt es aber eine Webcam-Seite, unter anderem mit Blick über Ruhpolding zum Rauschberg und vom Hochfelln Richtung Chiemsee.",
    ],
    topic: "wetter",
    chips: [web("webcams", "Webcams auf ruhpolding.de"), ...backChips("wetter")],
  },

  essen: {
    id: "essen",
    topic: "essen",
    kurz: [
      `Wie gesagt: im Ort unter anderem das ${GASTRONOMIE.gasthausPost} und die ${GASTRONOMIE.pizzeria}, am Berg die ${GASTRONOMIE.almstueberl}.`,
    ],
    // Vorher mit der Gipfelalm am Rauschberg, die in der Gastronomieliste
    // nicht vorkommt und deren Bahn nicht fährt.
    messages: [
      [
        `Ruhpolding Tourismus führt die Lokale im Ort in einer Liste, darunter das ${GASTRONOMIE.gasthausPost}, die ${GASTRONOMIE.pizzeria} und am Berg die ${GASTRONOMIE.almstueberl}.`,
        `In der Gastronomieliste von Ruhpolding Tourismus stehen unter anderem das ${GASTRONOMIE.gasthausPost}, die ${GASTRONOMIE.pizzeria} und die ${GASTRONOMIE.almstueberl}.`,
      ],
      "Öffnungszeiten und Ruhetage habe ich nicht gesichert hinterlegt, die erfragt die Tourist-Information für Sie.",
    ],
    chips: [
      { label: "Vorschläge zum Essen", to: "empfehlung:essen:0" },
      { label: "Ruhetage beachten", to: "essen-ruhetag" },
      web("restaurants"),
      { label: "Andere Frage", to: "menu" },
    ],
  },
  "essen-huette": {
    id: "essen-huette",
    // Vorher drei Hütten mit Spielplatz, zwei davon stehen in keiner Liste.
    messages: [
      "Welche Hütten einen Spielplatz haben, habe ich nicht gesichert hinterlegt, und raten will ich da nicht. Die meisten Almen haben heuer bis 19. Oktober offen.",
      `Am Schalter der Tourist-Information hilft Ihnen jemand persönlich weiter (${TOURIST_INFO.oeffnungszeiten}).`,
    ],
    topic: "essen",
    chips: [web("almen"), ...backChips("essen")],
  },
  "essen-ruhetag": {
    id: "essen-ruhetag",
    // KA [00:20:49], [00:21:59]: die Liste wird laufend nachgetragen und
    // liegt im Selbstbedienungsbereich aus. Ein pauschaler Ruhetag war nicht
    // belegt.
    messages: [
      "Einen festen Ruhetag für alle gibt es nicht. Ruhetage und Betriebsruhen sammelt die Tourist-Information in einer Gastronomieliste, die sie laufend nachträgt. Die Liste liegt dort zum Mitnehmen aus.",
    ],
    topic: "essen",
    chips: [web("restaurants"), ...backChips("essen")],
  },

  familie: {
    id: "familie",
    topic: "familie",
    kurz: [
      `Wie gesagt: der ${FAMILIE.freizeitpark}, die ${FAMILIE.vitalwelt} und bei Regen die Museen im Ort.`,
    ],
    // Vorher mit Barfußweg, Kinderbecken und Öffnungszeit, alles nicht
    // belegt.
    messages: [
      [
        `Mit Kindern kommen im Ort unter anderem der ${FAMILIE.freizeitpark} und das Erlebnisbad ${FAMILIE.vitalwelt} infrage, bei Regen auch die drei Museen.`,
        `Für Familien gibt es den ${FAMILIE.freizeitpark} und das Erlebnisbad ${FAMILIE.vitalwelt}, und wenn es regnet, die Museen im Ort.`,
      ],
      "Was genau passt, hängt davon ab, wie lange ihr bleibt und wie das Wetter ist. Soll ich kurz nachfragen?",
    ],
    jaNein: true,
    nein: "vorschlag:i=familie,b=kinder,f=1:0",
    chips: [
      { label: "Ja, passende Vorschläge", to: "bedarf:i=familie,b=kinder" },
      { label: "Angebote bei Regen", to: "familie-regen" },
      web("familien"),
      { label: "Andere Frage", to: "menu" },
    ],
  },
  "familie-regen": {
    id: "familie-regen",
    // Quelle: ruhpolding.de/bei-regen. Kletterhalle und Bastelecke standen
    // nur im Antworttext.
    messages: [
      `Bei Regen nennt Ruhpolding Tourismus die ${FAMILIE.vitalwelt} und die drei Museen im Ort: ${KULTUR.holzknechtmuseum}, ${FAMILIE.heimatmuseum} und ${KULTUR.glockenschmiede}. In der Umgebung steht dort der Babalu Funpark in Traunstein.`,
    ],
    topic: "familie",
    chips: [
      { label: "Vorschläge für drinnen", to: "vorschlag:i=kultur,f=1:0" },
      web("bei-regen"),
      { label: "Zurück zum Thema", to: "familie" },
      { label: "Andere Frage", to: "menu" },
    ],
  },
  "familie-baby": {
    id: "familie-baby",
    messages: [
      "Wo es Wickelmöglichkeiten gibt, habe ich nicht gesichert hinterlegt.",
      `Am Schalter der Tourist-Information hilft Ihnen jemand persönlich weiter (${TOURIST_INFO.oeffnungszeiten}).`,
    ],
    topic: "familie",
    chips: backChips("familie"),
  },

  winter: {
    id: "winter",
    topic: "winter",
    kurz: [
      `Wie gesagt: Langlauf und Biathlon in der ${EVENTS.chiemgauArena}, alpin Unternberg, ${WINTER.skigebiet} und Maiergschwendt.`,
    ],
    // Ohne die 75 km Loipen und das öffentlich nutzbare Stadion, beides
    // nicht belegt.
    messages: [
      [
        `Im Winter ist Ruhpolding vor allem Langlauf- und Biathlonort. Die ${EVENTS.chiemgauArena} ist Austragungsort des ${EVENTS.biathlonKurz}. Von hier sind es {naehe:arena}. Alpin gibt es drei Skigebiete: Unternberg, ${WINTER.skigebiet} und Maiergschwendt.`,
        `Der Winter gehört in Ruhpolding dem Langlauf und dem Biathlon, mit der ${EVENTS.chiemgauArena} als Wettkampfstätte. Zum Skifahren gibt es drei kleine Gebiete: Unternberg, ${WINTER.skigebiet} und Maiergschwendt.`,
      ],
    ],
    chips: [
      { label: "Loipen & Loipenpass", to: "winter-loipe" },
      { label: "Skiverleih", to: "winter-verleih" },
      web("winter"),
      { label: "Andere Frage", to: "menu" },
    ],
  },
  "winter-loipe": {
    id: "winter-loipe",
    // Vorher eine Karte mit Netzlänge und Loipenpass-Preisen, keiner der
    // Werte war belegt.
    messages: [
      "Eine Gesamtlänge des Loipennetzes und Preise für einen Loipenpass nennt Ruhpolding Tourismus nicht, deshalb nenne ich Ihnen auch keine.",
      "Einzelne Loipen stehen mit ihrer Länge auf ruhpolding.de, etwa die Drei-Seen-Loipe mit 12,3 km.",
    ],
    topic: "winter",
    chips: [web("langlaufen"), ...backChips("winter")],
  },
  "winter-verleih": {
    id: "winter-verleih",
    // Bis zum 23.09.2026 stand hier, Ruhpolding Tourismus nenne keine
    // Verleihbetriebe. Das war falsch: ruhpolding.de/ski-snowboardschulen
    // führt sie unter "Ski- & Snowboard Verleih".
    messages: [
      "Unter „Ski- & Snowboard Verleih“ nennt Ruhpolding Tourismus Sport Plenk, die Langlaufschule Ruhpolding und die Langlauf- & Wintersportschule. Preise und Zeiten habe ich dazu nicht hinterlegt.",
      "Die Übersicht mit allen Skischulen und Verleihern gebe ich Ihnen gern mit.",
    ],
    topic: "winter",
    chips: [web("skischulen"), ...backChips("winter")],
  },

  unterkunft: {
    id: "unterkunft",
    topic: "unterkunft",
    kurz: [
      "Wie gesagt: alle Gastgeber auf ruhpolding.de, und am Schalter bekommen Sie ein Angebot zum Mitnehmen.",
    ],
    // KA [00:26:23] bis [00:26:52]. Vorher mit 4-Sterne-Hotel und
    // spontaner Vermittlung, beides nicht belegt.
    messages: [
      "Die Gastgeber in Ruhpolding stehen auf ruhpolding.de, dort lässt sich auch direkt buchen.",
      "Am Schalter der Tourist-Information stellt Ihnen das Team ein Angebot zusammen und druckt es Ihnen aus. Damit können Sie in Ruhe vergleichen und später wiederkommen.",
    ],
    chips: [
      { label: "Urlaub am Bauernhof", to: "unterkunft-hof" },
      { label: "Barrierefrei übernachten", to: "unterkunft-barrierefrei" },
      web("unterkunft", "Unterkunft suchen auf ruhpolding.de"),
      { label: "Andere Frage", to: "menu" },
    ],
  },
  "unterkunft-hof": {
    id: "unterkunft-hof",
    messages: [
      "Höfe mit Urlaub am Bauernhof stehen in der Gastgeberliste auf ruhpolding.de einzeln. Eine Gesamtzahl nennt die Liste nicht.",
    ],
    topic: "unterkunft",
    chips: [web("bauernhof"), ...backChips("unterkunft")],
  },
  "unterkunft-barrierefrei": {
    id: "unterkunft-barrierefrei",
    messages: [
      "Barrierefreie Unterkünfte sind in der Gastgeberliste auf ruhpolding.de einzeln ausgewiesen. Eine Zusammenstellung habe ich nicht, und ich nenne Ihnen lieber keine, die ich nicht prüfen kann.",
    ],
    topic: "unterkunft",
    chips: [web("barrierefrei"), ...backChips("unterkunft")],
  },

  info: {
    id: "info",
    topic: "info",
    kurz: ["Wie gesagt, hier noch einmal die Kontaktdaten."],
    messages: [
      [
        "Hier die Kontaktdaten der Tourist-Information. Vor Ort helfen Ihnen die Mitarbeitenden auch persönlich weiter. Von hier sind es {naehe:touristinfo}.",
        "Das sind die Kontaktdaten der Tourist-Information. Persönlich weiter hilft Ihnen das Team auch vor Ort. Von hier sind es {naehe:touristinfo}.",
      ],
    ],
    card: {
      title: "Tourist-Information Ruhpolding",
      rows: [
        { label: "Adresse", value: TOURIST_INFO.adresse },
        { label: "Telefon", value: TOURIST_INFO.telefon },
        { label: "E-Mail", value: TOURIST_INFO.email },
        { label: "Öffnungszeiten", value: TOURIST_INFO.oeffnungszeiten },
      ],
      note: TOURIST_INFO.kartenhinweis,
    },
    chips: [
      zettelChip("info", "de"),
      web("kontakt"),
      { label: "Andere Frage", to: "menu" },
    ],
  },
}

/**
 * Wohin ein Rückbezug innerhalb eines Themas führt.
 *
 * "Was kostet das", "welche genau", "wie komme ich hin" tragen kein eigenes
 * Thema. Der Verstehens-Kern erkennt die Art der Nachfrage, das Ziel steht
 * hier, weil nur dieser Baum weiß, welcher Knoten die Antwort hält.
 *
 * Fehlt eine Art, gibt es dazu im Thema nichts zu vertiefen. Die Eingabe
 * landet dann im weichen Fallback und wird zur Rückfrage, statt auf einen
 * Knoten zu zeigen, der die Frage nicht beantwortet.
 */
export const FOLGEN: Record<string, Folge> = {
  wandern: {
    vertiefung: "bergbahnen",
    preis: "bergbahn-preise",
    zeit: "bergbahnen",
    weg: "bergbahnen",
  },
  sport: {
    vertiefung: "empfehlung:sport:0",
  },
  events: {
    vertiefung: "events-biathlon",
    zeit: "events-woche",
    weg: "events-biathlon",
  },
  anreise: {
    vertiefung: "busnetz",
    preis: "anreise-parken",
    weg: "anreise-parken",
    // "Wie ist der Fahrplan dieser Linien" blieb im Testlauf ohne Antwort.
    zeit: "busnetz",
  },
  wetter: {
    vertiefung: "wetter-3tage",
    zeit: "wetter-3tage",
  },
  essen: {
    vertiefung: "empfehlung:essen:0",
    zeit: "essen-ruhetag",
  },
  familie: {
    vertiefung: "familie-regen",
    weg: "familie",
  },
  winter: {
    vertiefung: "winter-loipe",
    preis: "winter-loipe",
  },
  unterkunft: {
    vertiefung: "unterkunft-hof",
  },
  info: {
    vertiefung: "info",
    zeit: "info",
    weg: "info",
    preis: "info",
  },
}

/* Rückfrage bei Mehrdeutigkeit. */

const RUECKFRAGEN = [
  "Damit ich Ihnen das Richtige heraussuche: Geht es Ihnen um {themen}?",
  "Das kann ich unterschiedlich verstehen. Meinen Sie {themen}?",
  "Kurze Rückfrage, damit ich nichts Falsches zeige: {themen}?",
  "Da gibt es mehrere Richtungen. Soll ich Ihnen {themen} zeigen?",
] as const

/** Nur wenn ein Leitbegriff vorliegt, sonst bliebe der Platzhalter leer. */
const RUECKFRAGEN_MIT_BEGRIFF = [
  "Bei „{begriff}“ bin ich nicht sicher, worauf Sie hinauswollen: {themen}?",
  "„{begriff}“ kann ich hier zweierlei verstehen. Geht es Ihnen um {themen}?",
  "Damit ich „{begriff}“ richtig einordne: {themen}?",
] as const

const RUECKFRAGEN_EN = [
  "So I show you the right thing: is this about {themen}?",
  "That could go two ways. Do you mean {themen}?",
  "Quick check so I do not show the wrong thing: {themen}?",
  "There are several directions here. Shall I show you {themen}?",
] as const

/** "A oder B", bei dreien "A, B oder C". */
function aufzaehlung(teile: string[], sprache: Sprache): string {
  if (teile.length <= 1) return teile[0] ?? ""
  const letztes = teile[teile.length - 1]
  const davor = teile.slice(0, -1).join(", ")
  return sprache === "en"
    ? `${davor} or ${letztes}`
    : `${davor} oder ${letztes}`
}

/** Die Rückfrage als fertiger Knoten, mit den Kandidaten als Chips. */
export function rueckfrageKnoten(
  candidates: Chip[],
  term: string | null,
  sprache: Sprache = "de"
): FlowNode {
  const themaVon = (chip: Chip) =>
    TOPICS.find(
      (eintrag) => eintrag.id === chip.topic || chip.to.startsWith(eintrag.id)
    )

  const themen = aufzaehlung(
    candidates.map((chip) => {
      const topic = themaVon(chip)
      if (!topic) return chip.label
      return sprache === "en" ? topic.satzEn : topic.satz
    }),
    sprache
  )

  const vorlage =
    sprache === "en"
      ? waehleVariante(RUECKFRAGEN_EN)
      : waehleVariante(
          term ? [...RUECKFRAGEN, ...RUECKFRAGEN_MIT_BEGRIFF] : RUECKFRAGEN
        )

  return {
    id: "rueckfrage-mehrdeutig",
    // Der Knoten baut seinen Text in beiden Sprachen selbst. Ohne diese
    // Kennzeichnung liefe er durch uebersetze(), fände dort keine Fassung
    // und bekäme den Hinweis vorangestellt, die Auskunft liege nur auf
    // Deutsch vor, obwohl er gerade auf Englisch fragt.
    fertig: true,
    messages: [
      vorlage.replace("{themen}", themen).replace("{begriff}", term ?? ""),
    ],
    chips: [
      ...candidates.map((chip) => {
        const topic = themaVon(chip)
        if (!topic || sprache !== "en") return chip
        return { ...chip, label: topic.labelEn }
      }),
      {
        label: sprache === "en" ? "Something else" : "Andere Frage",
        to: "menu",
      },
    ],
  }
}

/**
 * Notknoten für unbekannte IDs. Freier Text landet nicht mehr hier, dafür
 * sorgt fallback.ts. Diesen Knoten sieht nur, wer eine ID ansteuert, die es
 * nicht gibt, also im Fall eines Programmierfehlers.
 */
const NOTKNOTEN: FlowNode = {
  id: "notknoten",
  messages: [
    "Entschuldigung, da ist mir etwas dazwischengekommen. Wählen Sie am besten ein Thema, dann geht es weiter.",
  ],
  chips: menuChips,
}

/**
 * Löst eine Knoten-ID auf, auch die zur Laufzeit gebauten.
 *
 * Zwei Formen tragen ihre Daten in der ID:
 *
 *   ziel:<id>                  ein Ort mit Beschreibung und QR-Code
 *   empfehlung:<gruppe>:<ab>   drei Vorschläge ab der genannten Stelle
 *   fahrplan:<id>              die nächsten Abfahrten als Tabelle
 *
 * Der Zustand steckt damit in der ID und nicht in einer Variablen zwischen
 * den Aufrufen: derselbe Aufruf ergibt denselben Knoten, unabhängig davon,
 * was vorher im Gespräch passiert ist. Für die Vergleichbarkeit zweier
 * Testläufe ist das dieselbe Bedingung, die auch für die Zuordnung gilt.
 *
 * Die Sprache muss hier hinein, weil diese Knoten fertig gebaut werden und
 * nicht mehr durch uebersetze() laufen.
 */
/** Was zur Laufzeit außer Sprache und Uhrzeit in einen Knoten eingeht. */
export type Lage = {
  wetter: WetterId
  zettel: ZettelEintrag[]
}

const KEINE_LAGE: Lage = { wetter: "sonne", zettel: [] }

export function getNode(
  id: string,
  sprache: Sprache = "de",
  jetzt: Date = new Date(),
  lage: Lage = KEINE_LAGE
): FlowNode {
  const bekannt = FLOW[id]
  if (bekannt) return bekannt

  if (id.startsWith("ziel:")) {
    return (
      zielKnoten(id.slice(5), sprache, waehleVariante, jetzt, lage.wetter) ??
      NOTKNOTEN
    )
  }

  if (id.startsWith("fahrplan:")) {
    return (
      fahrplanKnoten(id.slice(9), sprache, waehleVariante, jetzt) ?? NOTKNOTEN
    )
  }

  if (id.startsWith("empfehlung:")) {
    const [, gruppe, ab] = id.split(":")
    return (
      empfehlungsKnoten(
        gruppe,
        Number(ab) || 0,
        sprache,
        waehleVariante,
        jetzt,
        lage.wetter
      ) ?? NOTKNOTEN
    )
  }

  if (id.startsWith("bedarf:")) {
    return bedarfKnoten(
      id.slice(7),
      sprache,
      waehleVariante,
      jetzt,
      lage.wetter
    )
  }

  if (id.startsWith("vorschlag:")) {
    const [, profil, ab] = id.split(":")
    return vorschlagKnoten(
      profil ?? "",
      Number(ab) || 0,
      sprache,
      waehleVariante,
      jetzt,
      lage.wetter
    )
  }

  if (id === "hinweise") return meldungenKnoten(sprache, lage.wetter)

  if (id.startsWith("web:")) {
    return webKnoten(id.slice(4), sprache, waehleVariante) ?? NOTKNOTEN
  }

  if (id.startsWith("dienst:")) {
    return dienstKnoten(id.slice(7), sprache) ?? NOTKNOTEN
  }

  if (id.startsWith("verweis:")) {
    return verweisKnoten(id.slice(8), sprache) ?? NOTKNOTEN
  }

  if (id === "flyer-nein") return flyerNeinKnoten(sprache)
  if (id === "flyer-liste") return flyerListeKnoten(sprache)

  if (id.startsWith("flyer:")) {
    return flyerKnoten(id.slice(6), sprache) ?? NOTKNOTEN
  }

  if (id.startsWith("zettel:")) {
    return zettelKnoten(id.slice(7), lage.zettel, sprache) ?? NOTKNOTEN
  }

  return NOTKNOTEN
}
