import type { Chip, FlowNode } from "@/lib/chat-flow"
import { eignung, statusText, zeitbezug } from "@/lib/jetzt"
import type { Sprache } from "@/lib/sprache"
import {
  naechsteAbfahrten,
  taktHinweis,
  verbindung as findeVerbindung,
} from "@/lib/fahrplan"
import {
  GRUPPEN,
  VORSCHLAEGE,
  ziel as findeZiel,
  type Gruppe,
  type Ziel,
  mapsSuche,
} from "@/lib/ziele"

/**
 * Baut die beiden Knotenarten, die zur Laufzeit entstehen: den Vorschlag aus
 * drei Zielen und die Antwort auf ein einzelnes gewähltes Ziel.
 *
 * Beide stehen nicht im FLOW, weil sie von Daten abhängen, die sich
 * kombinieren lassen: welche Gruppe, ab welcher Stelle, welches Ziel. Sie als
 * Knoten auszuschreiben hieße, jede Kombination von Hand anzulegen.
 *
 * Der Ablauf, den sie zusammen ergeben:
 *
 *   allgemeine Frage  →  drei Vorschläge, einer hervorgehoben
 *   Auswahl per Text  →  das Ziel mit QR-Code zur Navigation
 *   "gibt es andere"  →  die nächsten drei aus derselben Gruppe
 *
 * Das ist der Weg, den der Testlauf vom 03.09. um 11:57 gesucht und nicht
 * gefunden hat: dreimal wurde nach dem Weg zur Gondelbahn gefragt, dreimal
 * kam dieselbe Beschreibung statt einer Wegführung.
 */

/* ------------------------------------------------------------------ *
 * Vorschlagsliste
 * ------------------------------------------------------------------ */

/**
 * Hervorhebung des beliebtesten Vorschlags.
 *
 * SIMULIERT: Der Prototyp erhebt keine Beliebtheit, die Auszeichnung steht
 * fest in der Gruppe. In der echten Anwendung käme sie aus den Aufrufzahlen.
 * In Abschnitt 4.4 der Arbeit als Grenze auszuweisen.
 */
const FAVORIT = [
  "Am häufigsten gewählt.",
  "Das nehmen die meisten.",
  "Der beliebteste der drei.",
  "Wird hier am häufigsten nachgefragt.",
]

const FAVORIT_EN = [
  "Most often chosen.",
  "This is what most people take.",
  "The most popular of the three.",
]

const ABSCHLUSS = [
  "Sag mir, was dich anspricht, dann bekommst du den Weg dorthin als QR-Code. Wenn nichts dabei ist, frag einfach nach anderen Vorschlägen.",
  "Welches davon soll ich dir genauer zeigen? Du bekommst dann gleich die Navigation dazu. Sonst nenne ich dir andere.",
  "Such dir eines aus, dann gebe ich dir den Weg dorthin mit. Passt keines, sag Bescheid, ich habe noch mehr.",
]

const ABSCHLUSS_EN = [
  "Tell me which one appeals and you will get the route there as a QR code. If none of them fit, just ask for other suggestions.",
  "Which one shall I show you in detail? You will get the directions with it. Otherwise I will name others.",
]

const NICHTS_MEHR = [
  "Mehr habe ich zu diesem Thema nicht hinterlegt. Eines der genannten Ziele zeige ich dir aber gern genauer.",
  "Das waren alle, die ich dazu habe. Wenn eines davon doch passt, sag es mir.",
]

const NICHTS_MEHR_EN = [
  "That is all I have on this topic. I am happy to show you one of the places above in detail though.",
  "Those were all of them. If one of them does fit after all, just say so.",
]

/** Zieht deterministisch nichts, sondern überlässt die Wahl waehleVariante. */
type Zieher = (varianten: readonly string[]) => string

/**
 * Die Vorschlagsliste als Knoten.
 *
 * `ab` verschiebt das Fenster über die Ziele der Gruppe. Der Zustand steckt
 * damit in der Knoten-ID und nicht in einer Variablen, die zwischen zwei
 * Gesprächen überleben könnte.
 */
export function empfehlungsKnoten(
  gruppenId: string,
  ab: number,
  sprache: Sprache,
  waehle: Zieher,
  jetzt: Date
): FlowNode | null {
  const gruppe: Gruppe | undefined = GRUPPEN[gruppenId]
  if (!gruppe) return null

  const en = sprache === "en"

  // Was jetzt geschlossen ist, rutscht nach hinten, verschwindet aber nicht:
  // wer am Abend fragt, plant oft schon für den nächsten Tag. Die Sortierung
  // ist stabil, gleich gut geeignete Ziele behalten ihre Reihenfolge.
  const sortiert = gruppe.ziele
    .map(findeZiel)
    .filter((eintrag): eintrag is Ziel => Boolean(eintrag))
    .map((eintrag, index) => ({ eintrag, index }))
    .sort((a, b) => {
      const diff =
        eignung(b.eintrag.oeffnung, jetzt, b.eintrag.tagesfuellend) -
        eignung(a.eintrag.oeffnung, jetzt, a.eintrag.tagesfuellend)
      return diff !== 0 ? diff : a.index - b.index
    })
    .map((eintrag) => eintrag.eintrag)

  const ausschnitt = sortiert.slice(ab, ab + VORSCHLAEGE)

  // Wer nach weiteren fragt, bis keine mehr da sind, bekommt eine Absage und
  // nicht eine leere Liste.
  if (ausschnitt.length === 0) {
    const bisher = sortiert.slice(0, ab).map((eintrag) => eintrag.id)
    return {
      id: `empfehlung:${gruppenId}:${ab}`,
      fertig: true,
      messages: [en ? NICHTS_MEHR_EN : NICHTS_MEHR],
      // Das bisherige Angebot bleibt wählbar: die Ziele sind ja genannt.
      angebot: bisher,
      gruppe: { id: gruppenId, ab },
      chips: [
        ...bisher.slice(-VORSCHLAEGE).map((id) => zielChip(id, en)),
        { label: en ? "Something else" : "Andere Frage", to: "menu" },
      ],
      topic: themaDerGruppe(gruppe),
    }
  }

  const noch = sortiert.length - (ab + ausschnitt.length)

  const chips: Chip[] = ausschnitt.map((eintrag) => zielChip(eintrag.id, en))
  if (noch > 0) {
    chips.push({
      label: en ? "Other suggestions" : "Andere Vorschläge",
      to: `empfehlung:${gruppenId}:${ab + ausschnitt.length}`,
    })
  }
  chips.push({ label: en ? "Something else" : "Andere Frage", to: "menu" })

  return {
    id: `empfehlung:${gruppenId}:${ab}`,
    fertig: true,
    // Jeder Vorschlag als eigene Sprechblase: drei Möglichkeiten in einem
    // Absatz liest niemand zu Ende, und vergleichen lassen sie sich so schon
    // gar nicht.
    messages: [
      // Der Zeitbezug steht nur in der ersten Runde: beim zweiten Mal wäre
      // dieselbe Bemerkung über die Uhrzeit eine Marotte.
      ab === 0
        ? `${zeitbezug(jetzt, sprache)} ${waehle(
            en ? gruppe.einleitungEn : gruppe.einleitung
          )}`
        : waehle(en ? gruppe.einleitungEn : gruppe.einleitung),
      ...ausschnitt.map((eintrag, index) =>
        vorschlag(
          eintrag,
          ab + index + 1,
          eintrag.id === gruppe.favorit,
          en,
          waehle,
          jetzt
        )
      ),
      waehle(en ? ABSCHLUSS_EN : ABSCHLUSS),
    ],
    angebot: ausschnitt.map((eintrag) => eintrag.id),
    gruppe: { id: gruppenId, ab },
    topic: themaDerGruppe(gruppe),
    chips,
  }
}

/**
 * Ein Vorschlag als Textblock.
 *
 * Nummer und Name in der ersten Zeile, damit sich auf beides Bezug nehmen
 * lässt: "das zweite" ebenso wie "ich würde gern auf den Rauschberg". Die
 * Eckdaten stehen abgesetzt, sonst verschwinden sie im Fließtext und die drei
 * Vorschläge werden unvergleichbar.
 */
function vorschlag(
  eintrag: Ziel,
  nummer: number,
  istFavorit: boolean,
  en: boolean,
  waehle: Zieher,
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
  const lage = statusText(eintrag.oeffnung, jetzt, en ? "en" : "de")
  if (lage) zeilen.push(`— ${lage}`)
  if (istFavorit) {
    zeilen.push(`★ ${waehle(en ? FAVORIT_EN : FAVORIT)}`)
  }
  return zeilen.join("\n")
}

function zielChip(id: string, en: boolean): Chip {
  const eintrag = findeZiel(id)
  return {
    label: eintrag ? (en ? eintrag.nameEn : eintrag.name) : id,
    to: `ziel:${id}`,
  }
}

/** Das Thema einer Gruppe: das ihrer Ziele, sofern sie sich einig sind. */
function themaDerGruppe(gruppe: Gruppe): string | undefined {
  const themen = new Set(
    gruppe.ziele.map((id) => findeZiel(id)?.topic).filter(Boolean)
  )
  return themen.size === 1 ? [...themen][0] : undefined
}

/* ------------------------------------------------------------------ *
 * Einzelnes Ziel mit Wegführung
 * ------------------------------------------------------------------ */

const HINWEIS_QR = [
  "Scanne den Code mit der Handykamera, dann führt dich die Karte hin.",
  "Einmal mit der Kamera scannen und die Route liegt auf deinem Gerät.",
  "Code scannen, dann übernimmt die Navigation auf deinem Handy.",
]

const HINWEIS_QR_EN = [
  "Scan the code with your phone camera and the map will guide you there.",
  "One scan with the camera and the route is on your own device.",
]

const EINLEITUNG_ZIEL = [
  "Gute Wahl.",
  "Sehr gern.",
  "Das lässt sich machen.",
  "Alles klar.",
]

const EINLEITUNG_ZIEL_EN = ["Good choice.", "Certainly.", "That works."]

/**
 * Ein Ziel mit Beschreibung, Entfernung und QR-Code.
 *
 * Der QR-Code ist der Punkt der ganzen Übung: eine Wegbeschreibung, die am
 * Terminal vorgelesen wird, hat der Gast beim Losgehen schon vergessen. Ein
 * Code, den er scannt, ist auf seinem Gerät.
 */
export function zielKnoten(
  zielId: string,
  sprache: Sprache,
  waehle: Zieher,
  jetzt: Date
): FlowNode | null {
  const eintrag = findeZiel(zielId)
  if (!eintrag) return null

  const en = sprache === "en"
  const name = en ? eintrag.nameEn : eintrag.name

  const beschreibung = [
    en ? eintrag.beschreibungEn : eintrag.beschreibung,
    `— ${en ? eintrag.eckdatenEn : eintrag.eckdaten}`,
  ]
  if (eintrag.naehe) {
    beschreibung.push(
      en
        ? `— {naehe:${eintrag.naehe}} from here`
        : `— von hier {naehe:${eintrag.naehe}}`
    )
  }
  const lage = statusText(eintrag.oeffnung, jetzt, sprache)
  if (lage) beschreibung.push(`— ${lage}`)

  const herkunft = gruppeVon(eintrag)

  return {
    id: `ziel:${zielId}`,
    fertig: true,
    topic: eintrag.topic,
    ziel: zielId,
    // Die Herkunft bleibt am Knoten hängen, damit "gibt es auch andere" von
    // hier aus weitergeht statt wieder bei den ersten dreien anzufangen.
    gruppe: herkunft,
    messages: [
      `${waehle(en ? EINLEITUNG_ZIEL_EN : EINLEITUNG_ZIEL)} ${name}:`,
      beschreibung.join("\n"),
    ],
    qr: {
      // Über dem Code steht der Ort, den die Karte ansteuert, nicht der
      // Anzeigename des Vorschlags. Sonst führt der Code bei einer Bergtour
      // scheinbar auf den Gipfel und tatsächlich zum Parkplatz.
      title: en ? `Route to ${eintrag.suche}` : `Weg zu ${eintrag.suche}`,
      hint: waehle(en ? HINWEIS_QR_EN : HINWEIS_QR),
      url: mapsSuche(eintrag.suche),
    },
    chips: geschwisterChips(eintrag, en),
  }
}

/**
 * Unter einem Ziel stehen die Alternativen aus derselben Gruppe.
 *
 * Wer sich ein Ziel angesehen hat, will als nächstes oft ein anderes sehen.
 * Ihn dafür erst ins Menü und zurück zu schicken wäre der Umweg, den die
 * Vorschlagsliste gerade abschaffen soll.
 */
function geschwisterChips(eintrag: Ziel, en: boolean): Chip[] {
  const herkunft = gruppeVon(eintrag)
  const gruppe = herkunft ? GRUPPEN[herkunft.id] : undefined

  const chips: Chip[] = []
  if (gruppe) {
    for (const id of gruppe.ziele) {
      if (id === eintrag.id || chips.length >= 2) continue
      chips.push(zielChip(id, en))
    }
    chips.push({
      label: en ? "All suggestions" : "Alle Vorschläge",
      to: `empfehlung:${gruppe.id}:0`,
    })
  }
  chips.push({ label: en ? "Something else" : "Andere Frage", to: "menu" })
  return chips
}

/**
 * Aus welcher Vorschlagsrunde ein Ziel stammt.
 *
 * Gesucht wird die Gruppe des eigenen Themas, denn ein Ziel kann in mehreren
 * stehen: der Rauschberg gehört zum Wandern und taucht zugleich unter den
 * Vorschlägen für den Aufstellort auf. `ab` ist der Anfang der Runde, in der
 * das Ziel vorgeschlagen wurde, damit die nächste Runde dort anschließt.
 */
function gruppeVon(eintrag: Ziel): { id: string; ab: number } | undefined {
  const gruppe = Object.values(GRUPPEN).find(
    (kandidat) =>
      kandidat.id === eintrag.topic && kandidat.ziele.includes(eintrag.id)
  )
  if (!gruppe) return undefined

  const stelle = gruppe.ziele.indexOf(eintrag.id)
  return { id: gruppe.id, ab: Math.floor(stelle / VORSCHLAEGE) * VORSCHLAEGE }
}

/* ------------------------------------------------------------------ *
 * Fahrplan
 * ------------------------------------------------------------------ */

const FAHRPLAN_EINLEITUNG = [
  "Mit der Bahn ab {start}. Die nächsten Abfahrten:",
  "Das geht mit der Bahn ab {start}. Hier die nächsten Verbindungen:",
  "Ab {start} fährt die Bahn. Das sind die nächsten drei:",
]

const FAHRPLAN_EINLEITUNG_EN = [
  "By train from {start}. The next departures:",
  "You can take the train from {start}. Here are the next connections:",
]

/**
 * Die nächsten Abfahrten als Tabelle.
 *
 * Der eigentliche Grund für die Tabelle: Eine Fahrplanauskunft in Fließtext
 * beantwortet die Frage "wann muss ich los" nicht, weil man sie zweimal lesen
 * muss. In Spalten steht die Antwort in der ersten Zeile, und was darunter
 * steht, sagt, wie viel Spielraum bleibt, wenn man diese eine verpasst.
 */
export function fahrplanKnoten(
  verbindungsId: string,
  sprache: Sprache,
  waehle: Zieher,
  jetzt: Date
): FlowNode | null {
  const eintrag = findeVerbindung(verbindungsId)
  if (!eintrag) return null

  const en = sprache === "en"
  const naechste = naechsteAbfahrten(eintrag, jetzt, 3)
  const start = en ? eintrag.startEn : eintrag.start
  const ziel = en ? eintrag.zielEn : eintrag.ziel

  const spalten = en ? ["Departs", "Arrives", "Line"] : ["Ab", "An", "Linie"]
  const mitUmstieg = naechste.some(({ fahrt }) => fahrt.umstieg)
  if (mitUmstieg) spalten.push(en ? "Change" : "Umstieg")

  const zeilen = naechste.map(({ fahrt, morgen }) => {
    const zeile = [
      morgen ? `${fahrt.ab} ${en ? "(tomorrow)" : "(morgen)"}` : fahrt.ab,
      fahrt.an,
      eintrag.linie,
    ]
    if (mitUmstieg) zeile.push(fahrt.umstieg ?? "—")
    return zeile
  })

  const takt = taktHinweis(eintrag)
  const nachricht = waehle(en ? FAHRPLAN_EINLEITUNG_EN : FAHRPLAN_EINLEITUNG)

  const zusatz: string[] = []
  if (eintrag.dauer > 0) {
    zusatz.push(
      en
        ? `The journey takes about ${eintrag.dauer} minutes.`
        : `Die Fahrt dauert etwa ${eintrag.dauer} Minuten.`
    )
  }
  if (takt) {
    zusatz.push(
      en ? "Trains run roughly hourly." : "Die Züge fahren etwa stündlich."
    )
  }
  // Die Gästekarte ist bis Traunstein gültig; das gehört an jede Auskunft, in
  // der die Strecke vorkommt, denn es entscheidet über den Ticketkauf.
  zusatz.push(
    en
      ? "With the Chiemgau Karte the stretch to Traunstein is free."
      : "Mit der Chiemgau Karte ist die Strecke bis Traunstein frei."
  )

  return {
    id: `fahrplan:${verbindungsId}`,
    fertig: true,
    topic: "anreise",
    ziel: "bahnhof",
    messages: [nachricht.replace("{start}", start), zusatz.join(" ")],
    table: {
      title: en ? `${start} to ${ziel}` : `${start} nach ${ziel}`,
      columns: spalten,
      rows: zeilen,
      // Die nächste Abfahrt ist die Antwort, der Rest ist Kontext.
      highlight: 0,
      note: en ? eintrag.hinweisEn : eintrag.hinweis,
    },
    chips: [
      {
        label: en ? "Route to the station" : "Weg zum Bahnhof",
        to: "ziel:bahnhof",
      },
      {
        label: en ? "Local bus & guest card" : "Ortsbus & Gästekarte",
        to: "anreise-bus",
      },
      { label: en ? "Something else" : "Andere Frage", to: "menu" },
    ],
  }
}
