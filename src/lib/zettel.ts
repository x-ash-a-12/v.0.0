import type { Chip, FlowNode } from "@/lib/chat-flow"
import { TOURIST_INFO } from "@/lib/daten"
import { naechsteAbfahrten, verbindung } from "@/lib/fahrplan"
import type { Sprache } from "@/lib/sprache"
import { mapsSuche, vorschlagbar, ziel as findeZiel } from "@/lib/ziele"

/**
 * Der Zettel, den der Gast mitnimmt.
 *
 * Am Schalter nimmt der Gast eine Information mit, einen Prospekt, den
 * Ortsplan, "oder auf seinem Zettel die Antworten auf die Fragen, die er
 * gestellt hat" (KA [00:28:47]). Dr. Matjan beschreibt dasselbe für den
 * Agenten: ausgegeben wird, "was letztlich vereinbart wurde", nicht der
 * Chatverlauf (M [00:26:09]), und zwar gedruckt oder per E-Mail. Ein
 * QR-Code sei "okay, aber nicht optimal" (M [00:24:34]).
 *
 * Deshalb sammelt der Gast selbst, was er behalten will, und bekommt den
 * Zettel auf drei Wegen. Drucken und E-Mail sind simuliert und sagen das.
 */
export type ZettelEintrag = {
  /** Knoten, aus dem der Eintrag stammt. Verhindert Doppelungen. */
  quelle: string
  titel: string
  zeilen: string[]
}

/** Was im Chat als Zettel erscheint. */
export type ZettelAnsicht = {
  titel: string
  eintraege: ZettelEintrag[]
  fuss: string
}

/** Knoten, deren Inhalt sich auf den Zettel schreiben lässt. */
export function zettelbar(knoten: string | null): knoten is string {
  if (!knoten) return false
  if (knoten === "info") return true
  if (knoten.startsWith("fahrplan:")) return true
  if (knoten.startsWith("ziel:")) {
    const eintrag = findeZiel(knoten.slice(5))
    return Boolean(eintrag && !eintrag.ungesichert)
  }
  return false
}

/** Die Schaltfläche unter einem Knoten, der auf den Zettel kann. */
export function zettelChip(knoten: string, sprache: Sprache): Chip {
  return {
    label: sprache === "en" ? "Add to my notes" : "Auf meinen Zettel",
    to: `zettel:neu:${knoten}`,
  }
}

/**
 * Baut den Eintrag aus der Knoten-ID.
 *
 * Aus der ID und nicht aus dem, was auf dem Schirm stand: so steht auf dem
 * Zettel der Kern der Auskunft, ohne Einleitung und ohne Überbrückungssatz.
 */
export function eintragAus(
  knoten: string,
  sprache: Sprache,
  jetzt: Date
): ZettelEintrag | null {
  const en = sprache === "en"

  if (knoten === "info") {
    return {
      quelle: knoten,
      titel: en ? "Tourist information Ruhpolding" : "Tourist-Information Ruhpolding",
      zeilen: [
        TOURIST_INFO.adresse,
        `${en ? "Phone" : "Telefon"} ${TOURIST_INFO.telefon}`,
        TOURIST_INFO.email,
        en ? TOURIST_INFO.oeffnungszeitenEn : TOURIST_INFO.oeffnungszeiten,
      ],
    }
  }

  if (knoten.startsWith("ziel:")) {
    const eintrag = findeZiel(knoten.slice(5))
    if (!eintrag) return null
    const zeilen = vorschlagbar(eintrag)
      ? [
          en ? eintrag.beschreibungEn : eintrag.beschreibung,
          en ? eintrag.eckdatenEn : eintrag.eckdaten,
        ]
      : []
    if (eintrag.ausserBetrieb) {
      zeilen.push(en ? eintrag.ausserBetrieb.en : eintrag.ausserBetrieb.de)
    }
    zeilen.push(`${en ? "Map" : "Karte"}: ${mapsSuche(eintrag.suche)}`)
    return {
      quelle: knoten,
      titel: en ? eintrag.nameEn : eintrag.name,
      zeilen: zeilen.filter(Boolean),
    }
  }

  if (knoten.startsWith("fahrplan:")) {
    const eintrag = verbindung(knoten.slice(9))
    if (!eintrag) return null
    const abfahrten = naechsteAbfahrten(eintrag, jetzt, 3).map(
      ({ fahrt, morgen }) =>
        en
          ? `dep ${fahrt.ab}${morgen ? " (tomorrow)" : ""}, arr ${fahrt.an}, ${eintrag.linie}`
          : `ab ${fahrt.ab}${morgen ? " (morgen)" : ""}, an ${fahrt.an}, ${eintrag.linie}`
    )
    return {
      quelle: knoten,
      titel: en
        ? `${eintrag.startEn} to ${eintrag.zielEn}`
        : `${eintrag.start} nach ${eintrag.ziel}`,
      zeilen: [
        ...abfahrten,
        en
          ? "Replacement buses near Eisenärzt at present, check with the Bayerische Regiobahn."
          : "Derzeit Ersatzverkehr wegen Gleisbau bei Eisenärzt, Lage bei der Bayerischen Regiobahn prüfen.",
      ],
    }
  }

  return null
}

function ansicht(
  eintraege: ZettelEintrag[],
  sprache: Sprache,
  titel?: string
): ZettelAnsicht {
  const en = sprache === "en"
  return {
    titel: titel ?? (en ? "Your notes" : "Ihr Zettel"),
    eintraege,
    fuss: en
      ? "Ruhpolding tourist information · information without guarantee, please check before you set off"
      : "Tourist-Information Ruhpolding · Angaben ohne Gewähr, vor dem Losgehen bitte prüfen",
  }
}

const AUSGABE_CHIPS = (en: boolean): Chip[] => [
  { label: en ? "Print" : "Ausdrucken", to: "zettel:drucken" },
  { label: en ? "Send by email" : "Per E-Mail", to: "zettel:mail" },
  { label: en ? "To my phone" : "Aufs Handy", to: "zettel:qr" },
  { label: en ? "Keep asking" : "Weiter fragen", to: "menu" },
]

function leer(sprache: Sprache): FlowNode {
  const en = sprache === "en"
  return {
    id: "zettel:leer",
    fertig: true,
    messages: [
      en
        ? "Your notes are still empty. Under every place and every connection there is an “Add to my notes” button, and whatever you collect there you can print or take with you at the end."
        : "Ihr Zettel ist noch leer. Unter jedem Ziel und jeder Verbindung steht „Auf meinen Zettel“. Was Sie dort sammeln, können Sie am Ende ausdrucken oder mitnehmen.",
    ],
    chips: [
      {
        label: en ? "What can I do here?" : "Was kann ich hier machen?",
        to: "bedarf:",
      },
      { label: en ? "Something else" : "Andere Frage", to: "menu" },
    ],
  }
}

/** Bestätigung nach dem Hinzufügen. */
export function hinzugefuegtKnoten(
  eintrag: ZettelEintrag,
  anzahl: number,
  schonDa: boolean,
  sprache: Sprache
): FlowNode {
  const en = sprache === "en"
  const satz = schonDa
    ? en
      ? `${eintrag.titel} is already on your notes.`
      : `${eintrag.titel} steht schon auf Ihrem Zettel.`
    : en
      ? `Done, ${eintrag.titel} is on your notes.`
      : `Erledigt, ${eintrag.titel} steht auf Ihrem Zettel.`
  const stand = en
    ? `There ${anzahl === 1 ? "is 1 entry" : `are ${anzahl} entries`} on it. Would you like to take it with you now, or keep asking?`
    : `Darauf ${anzahl === 1 ? "steht 1 Eintrag" : `stehen ${anzahl} Einträge`}. Möchten Sie ihn jetzt mitnehmen oder weiter fragen?`
  return {
    id: "zettel:neu",
    fertig: true,
    messages: [satz, stand],
    chips: AUSGABE_CHIPS(en),
  }
}

/**
 * Die Knoten rund um den Zettel, sofern sie aus der ID allein entstehen.
 *
 * `zettel:neu:…` und die gesendete E-Mail baut use-chat.ts selbst, weil sie
 * den Zettel verändern oder eine Eingabe brauchen.
 */
export function zettelKnoten(
  art: string,
  eintraege: ZettelEintrag[],
  sprache: Sprache
): FlowNode | null {
  const en = sprache === "en"
  if (eintraege.length === 0 && art !== "mail-abbruch") return leer(sprache)

  switch (art) {
    case "zeigen":
      return {
        id: "zettel:zeigen",
        fertig: true,
        messages: [
          en
            ? "This is what is on your notes so far. Only what you collected, not our whole conversation."
            : "Das steht bisher auf Ihrem Zettel. Nur was Sie gesammelt haben, nicht unser ganzes Gespräch.",
        ],
        zettel: ansicht(eintraege, sprache),
        chips: AUSGABE_CHIPS(en),
      }

    case "drucken":
      // Statusmeldung vor dem Ergebnis: "Es muss immer klar sein, was
      // passiert, etwa: Warten Sie kurz, ich drucke Ihnen das Ticket aus."
      // (M [00:58:14])
      return {
        id: "zettel:drucken",
        fertig: true,
        messages: [
          en
            ? "One moment, I am printing your notes."
            : "Einen Moment, ich drucke Ihnen Ihren Zettel aus.",
        ],
        warten: 1800,
        zettel: ansicht(
          eintraege,
          sprache,
          en ? "Printout" : "Ausdruck"
        ),
        nachher: [
          en
            ? "Done, your notes are in the tray below the screen. (Prototype: no printer is connected, nothing has been printed.)"
            : "Fertig, der Zettel liegt unten im Ausgabefach. (Prototyp: Es ist kein Drucker angeschlossen, gedruckt wurde nichts.)",
          en
            ? "If anything else comes up later, just come back and ask."
            : "Wenn Ihnen später noch etwas einfällt, kommen Sie einfach wieder und fragen Sie.",
        ],
        chips: [
          { label: en ? "Keep asking" : "Weiter fragen", to: "menu" },
          { label: en ? "Thanks, that's all" : "Danke, das war's", to: "danke" },
        ],
      }

    case "mail":
      return {
        id: "zettel:mail",
        fertig: true,
        messages: [
          en
            ? "Which email address should I send your notes to? Just type it below."
            : "An welche E-Mail-Adresse soll ich Ihnen den Zettel schicken? Tippen Sie sie einfach unten ein.",
        ],
        chips: [
          { label: en ? "Print instead" : "Lieber ausdrucken", to: "zettel:drucken" },
          { label: en ? "Cancel" : "Doch nicht", to: "zettel:zeigen" },
        ],
      }

    case "qr":
      return {
        id: "zettel:qr",
        fertig: true,
        messages: [
          en
            ? "Scan the code with your phone camera and your notes appear there as text."
            : "Scannen Sie den Code mit der Handykamera, dann haben Sie den Zettel als Text auf dem Handy.",
        ],
        qr: {
          title: en ? "Your notes" : "Ihr Zettel",
          hint: en
            ? "Printing or email is also possible."
            : "Ausdrucken oder per E-Mail geht auch.",
          url: alsText(eintraege, sprache),
        },
        chips: AUSGABE_CHIPS(en).filter((chip) => chip.to !== "zettel:qr"),
      }
  }

  return null
}

/** Die Antwort, wenn eine E-Mail-Adresse eingegeben wurde. */
export function gesendetKnoten(
  adresse: string,
  eintraege: ZettelEintrag[],
  sprache: Sprache
): FlowNode {
  const en = sprache === "en"
  return {
    id: "zettel:gesendet",
    fertig: true,
    messages: [
      en
        ? `One moment, I am sending your notes to ${adresse}.`
        : `Einen Moment, ich schicke Ihren Zettel an ${adresse}.`,
    ],
    warten: 1500,
    zettel: ansicht(eintraege, sprache, en ? "Email" : "E-Mail"),
    nachher: [
      en
        ? "Sent. Only what is on your notes went out, not our conversation. (Prototype: no email is sent and the address is not stored.)"
        : "Verschickt. Mitgeschickt wurde nur, was auf dem Zettel steht, nicht unser Gespräch. (Prototyp: Es wird keine E-Mail versendet und die Adresse nicht gespeichert.)",
    ],
    chips: [
      { label: en ? "Keep asking" : "Weiter fragen", to: "menu" },
      { label: en ? "Thanks, that's all" : "Danke, das war's", to: "danke" },
    ],
  }
}

/**
 * Der Zettel als schlichter Text für den QR-Code.
 *
 * Ein QR-Code trägt gut 2.000 Zeichen, lesbar bleibt er bei weit weniger.
 * Deshalb nur Titel und die ersten Zeilen je Eintrag.
 */
export function alsText(eintraege: ZettelEintrag[], sprache: Sprache): string {
  const kopf =
    sprache === "en"
      ? "Ruhpolding tourist information – your notes"
      : "Tourist-Information Ruhpolding – Ihr Zettel"
  const text = [
    kopf,
    ...eintraege.map((eintrag) =>
      [eintrag.titel, ...eintrag.zeilen.slice(0, 3)].join("\n")
    ),
  ].join("\n\n")
  return text.length > 900 ? `${text.slice(0, 897)}…` : text
}

/** Erkennt eine E-Mail-Adresse in der Eingabe. */
export const EMAIL = /[^\s@]+@[^\s@]+\.[^\s@]{2,}/
