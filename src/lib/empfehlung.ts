import type { Chip, FlowNode } from "@/lib/chat-flow"
import { eignung, spaetHinweis, statusText, zeitbezug } from "@/lib/jetzt"
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
  RADVERLEIH,
  vorschlagbar,
} from "@/lib/ziele"
import type { WetterId } from "@/lib/wetter"
import { schalterSatz } from "@/lib/service"
import { zettelChip } from "@/lib/zettel"
import { FLYER, flyerQuelle } from "@/lib/flyer"
import { TOURIST_INFO } from "@/lib/daten"

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

const ABSCHLUSS = [
  "Welcher Vorschlag interessiert Sie? Dann sage ich Ihnen, für wen er sich eignet und worauf Sie achten sollten.",
  "Sagen Sie mir, was davon Sie anspricht. Dann erzähle ich Ihnen mehr dazu. Passt nichts, nenne ich Ihnen gern andere.",
]

const ABSCHLUSS_EN = [
  "Which suggestion interests you? Then I will tell you who it suits and what to watch out for.",
  "Tell me which of these appeals and I will tell you more. If none fit, I am happy to name others.",
]

const NICHTS_MEHR = [
  "Mehr habe ich zu diesem Thema nicht hinterlegt. Eines der genannten Ziele erkläre ich Ihnen aber gern genauer.",
  "Das waren alle, die ich dazu habe. Wenn eines davon doch passt, sagen Sie es mir.",
]

const NICHTS_MEHR_EN = [
  "That is all I have on this topic. I am happy to explain one of the places above in detail though.",
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
  jetzt: Date,
  wetter: WetterId = "sonne"
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
    // Was nicht belegt ist, wird nicht vorgeschlagen (KA [00:23:34]), und bei
    // Regen nichts, was bei Regen nicht fährt oder nicht ratsam ist.
    .filter(vorschlagbar)
    .filter((eintrag) => !(wetter === "regen" && eintrag.beiRegenNicht))
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
        vorschlag(eintrag, ab + index + 1, en, jetzt)
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
  const lage = statusText(eintrag.oeffnung, jetzt, en ? "en" : "de")
  if (lage) zeilen.push(`— ${lage}`)
  const spaet = spaetHinweis(eintrag.tagesfuellend, jetzt, en ? "en" : "de")
  if (spaet) zeilen.push(`— ${spaet}`)
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
  "Scannen Sie den Code mit der Handykamera, dann führt Sie die Karte zum Ausgangspunkt.",
  "Einmal mit der Kamera scannen, dann haben Sie den Weg zum Ausgangspunkt auf Ihrem Handy.",
]

const HINWEIS_QR_EN = [
  "Scan the code with your phone camera and the map will guide you to the starting point.",
  "One scan with the camera and the route to the starting point is on your phone.",
]

const EINLEITUNG_ZIEL = ["Gern.", "Sehr gern.", "Gute Wahl."]

const EINLEITUNG_ZIEL_EN = ["Certainly.", "Gladly.", "Good choice."]

/**
 * Ein Ziel in der Detailauskunft.
 *
 * Der Ablauf folgt der Vorgabe des Autors vom 23.09.2026 und der Arbeitsweise
 * der Auskunft: erst was es ist, dann für wen es sich eignet, dann worauf man
 * achten muss, dann der Weg zum Ausgangspunkt. Zum Schluss die Frage nach
 * genau einem passenden Flyer. Mehr nicht, denn "alles einfach
 * herumzuschmeißen, das macht man auch nicht" (KA [00:14:27]).
 *
 * Öffnungszeiten nennt der Prototyp nie. Die Auskunft ruft dafür bei den
 * Betrieben an, weil Webseiten oft nicht stimmen (KA [00:06:11],
 * [00:22:35]). Der Prototyp verweist deshalb an die Tourist-Information,
 * die das nachfragt. Eine Telefonnummer des Betreibers steht nur dort, wo ein
 * Flyer sie nennt.
 */
export function zielKnoten(
  zielId: string,
  sprache: Sprache,
  waehle: Zieher,
  jetzt: Date,
  wetter: WetterId = "sonne"
): FlowNode | null {
  const eintrag = findeZiel(zielId)
  if (!eintrag) return null

  const en = sprache === "en"
  const name = en ? eintrag.nameEn : eintrag.name
  const herkunft = gruppeVon(eintrag)
  const qr = {
    // Über dem Code steht der Ort, den die Karte ansteuert, nicht der
    // Anzeigename. Bei einer Bergtour ist das der Ausgangspunkt.
    title: en ? `Route to ${eintrag.suche}` : `Weg zu: ${eintrag.suche}`,
    hint: waehle(en ? HINWEIS_QR_EN : HINWEIS_QR),
    url: mapsSuche(eintrag.suche),
  }

  // Nicht belegt: Name und Weg ja, alles andere nein. "Bevor ich falsche
  // Informationen herausgebe, gebe ich lieber keine heraus." (KA [00:23:34])
  if (eintrag.ungesichert) {
    return {
      id: `ziel:${zielId}`,
      fertig: true,
      topic: eintrag.topic,
      ziel: zielId,
      gruppe: herkunft,
      messages: [
        en
          ? `I have nothing reliable on ${name}, so I would rather not describe it. The map will at least show you where it is.`
          : `Zu ${name} habe ich nichts Gesichertes hinterlegt, deshalb beschreibe ich es Ihnen lieber nicht. Wo es liegt, zeigt Ihnen die Karte.`,
        schalterSatz(sprache),
      ],
      qr,
      chips: geschwisterChips(eintrag, en),
    }
  }

  // 1. Was es ist
  const kopf = [
    en ? eintrag.beschreibungEn : eintrag.beschreibung,
    `— ${en ? eintrag.eckdatenEn : eintrag.eckdaten}`,
  ]
  if (eintrag.naehe) {
    kopf.push(
      en
        ? `— {naehe:${eintrag.naehe}} from here`
        : `— von hier {naehe:${eintrag.naehe}}`
    )
  }
  const lage = statusText(eintrag.oeffnung, jetzt, sprache)
  if (lage) kopf.push(`— ${lage}`)
  const spaet = spaetHinweis(eintrag.tagesfuellend, jetzt, sprache)
  if (spaet) kopf.push(`— ${spaet}`)

  const messages: string[] = [
    eintrag.ausserBetrieb
      ? `${name}:`
      : `${waehle(en ? EINLEITUNG_ZIEL_EN : EINLEITUNG_ZIEL)} ${name}:`,
    kopf.join("\n"),
  ]
  if (eintrag.ausserBetrieb) {
    messages.push(en ? eintrag.ausserBetrieb.en : eintrag.ausserBetrieb.de)
  }

  // 2. Für wen es sich eignet
  if (eintrag.geeignet) {
    messages.push(
      en
        ? `Suitable for: ${eintrag.geeignet.en}`
        : `Geeignet für: ${eintrag.geeignet.de}`
    )
  }

  // 3. Worauf man achten muss
  const achtung: string[] = []
  if (eintrag.achtung) {
    achtung.push(en ? eintrag.achtung.en : eintrag.achtung.de)
  }
  // Wer ein Ziel bei Regen direkt wählt, bekommt die Warnung trotzdem. Die
  // Vorschläge lassen es bei Regen weg (KA [00:13:43]).
  if (wetter === "regen" && eintrag.beiRegenNicht) {
    achtung.push(
      en
        ? "In this rain I would advise against it today. Something indoors would be the better choice."
        : "Bei dem Regen heute würde ich Ihnen davon abraten. Etwas drinnen wäre heute die bessere Wahl."
    )
  }
  if (eintrag.interessen?.includes("rad")) {
    achtung.push(en ? RADVERLEIH.en : RADVERLEIH.de)
  }
  if (achtung.length > 0) {
    messages.push(
      en
        ? `Please note: ${achtung.join(" ")}`
        : `Worauf Sie achten sollten: ${achtung.join(" ")}`
    )
  }

  // 4. Öffnungszeiten: nie nennen, sondern sagen, wer sie weiß.
  if (eintrag.zeitenErfragen) {
    messages.push(zeitenSatz(sprache))
  }

  // 5. Woher die Angaben stammen (M [00:07:28])
  if (eintrag.flyer) messages.push(flyerQuelle(eintrag.flyer, en))

  const flyer = eintrag.flyer ? FLYER[eintrag.flyer] : null
  const chips: Chip[] = []
  if (flyer) {
    chips.push(
      { label: en ? "Yes, please" : "Ja, gern", to: `flyer:${flyer.id}` },
      { label: en ? "No, thank you" : "Nein, danke", to: "flyer-nein" }
    )
  }
  chips.push(
    zettelChip(`ziel:${zielId}`, sprache),
    ...geschwisterChips(eintrag, en).filter((chip) => chip.to !== "menu")
  )
  if (!flyer) chips.push({ label: en ? "Something else" : "Andere Frage", to: "menu" })

  return {
    id: `ziel:${zielId}`,
    fertig: true,
    topic: eintrag.topic,
    ziel: zielId,
    // Die Herkunft bleibt am Knoten hängen, damit "gibt es auch andere" von
    // hier aus weitergeht statt wieder bei den ersten dreien anzufangen.
    gruppe: herkunft,
    messages,
    qr,
    // Die Frage nach dem Flyer kommt nach dem Kartenlink, wie am Schalter:
    // erst der Weg, dann das Material dazu.
    nachher: flyer
      ? [
          en
            ? `Would you like the flyer „${flyer.titelEn}“ free of charge to go with it?`
            : `Möchten Sie den Flyer „${flyer.titel}“ kostenlos dazu haben?`,
        ]
      : undefined,
    jaNein: Boolean(flyer),
    nein: flyer ? "flyer-nein" : undefined,
    chips,
  }
}

/** Wer die Öffnungszeiten weiß, mit Telefon und Öffnungszeiten der TI. */
export function zeitenSatz(sprache: Sprache): string {
  return sprache === "en"
    ? `I do not hold reliable opening times. The tourist information checks them with the operator: phone ${TOURIST_INFO.telefon}, ${TOURIST_INFO.oeffnungszeitenEn}.`
    : `Aktuelle Öffnungszeiten habe ich nicht verlässlich hinterlegt. Die Tourist-Information fragt sie für Sie nach: Tel. ${TOURIST_INFO.telefon}, ${TOURIST_INFO.oeffnungszeiten}.`
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
      const geschwister = findeZiel(id)
      if (!geschwister || !vorschlagbar(geschwister)) continue
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
      zettelChip(`fahrplan:${verbindungsId}`, sprache),
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
