import type { Chip, FlowNode } from "@/lib/chat-flow"
import type { Sprache } from "@/lib/sprache"

/**
 * Die Flyer, die die Tourist-Information am häufigsten ausgibt.
 *
 * Frau Amort hat dem Autor am 22.09.2026 diese fünf in gedruckter Form
 * mitgegeben. Online liegen sie im Prospektportal von Ruhpolding Tourismus:
 * https://tportal.tomas.travel/ruhpolding/prospekt
 * Die Links unten führen direkt auf die PDF-Dateien, abgerufen 2026-09-23.
 *
 * Sie sind zugleich die Quelle für die Tourenangaben in ziele.ts: Länge,
 * Gehzeit, Höhenmeter, Schwierigkeit und die Hinweise, worauf man achten
 * muss, stehen dort so, wie der Flyer sie nennt.
 *
 * Ausgelegt sind die Flyer im Eingangsbereich der Tourist-Information. Das
 * Foyer ist auch außerhalb der Öffnungszeiten zugänglich (Angabe des Autors,
 * 23.09.2026; M [00:47:48] im Interview vom 18.09.).
 */
export type FlyerId = "ortsplan" | "almsommer" | "rad" | "gipfel" | "wandern"

export type Flyer = {
  id: FlyerId
  titel: string
  titelEn: string
  url: string
  /** Drucklegung laut Impressum, soweit angegeben. */
  stand?: string
}

export const FLYER: Record<FlyerId, Flyer> = {
  ortsplan: {
    id: "ortsplan",
    titel: "Ortsplan für Ruhpolding",
    titelEn: "Ruhpolding village map",
    url: "https://cdn.tomas-travel.com/irs18/repository/DEU00000060269578364/TBX00020010001917805/DEU00000062614564189.pdf",
  },
  almsommer: {
    id: "almsommer",
    titel: "Ruhpoldinger Almsommer",
    titelEn: "Ruhpolding alpine summer (serviced mountain huts)",
    url: "https://cdn.tomas-travel.com/irs18/repository/DEU00000062226742473/TBX00020010001917805/DEU00000062681677882.pdf",
    stand: "03/25",
  },
  rad: {
    id: "rad",
    titel: "Die 10 schönsten Fahrrad- & Mountainbiketouren",
    titelEn: "10 most beautiful cycling & mountain bike tours",
    url: "https://cdn.tomas-travel.com/irs18/repository/DEU00000061608440159/TBX00020010001917805/DEU00000062620780346.pdf",
    stand: "03/25",
  },
  gipfel: {
    id: "gipfel",
    titel: "Die 10 schönsten Gipfeltouren",
    titelEn: "10 most beautiful summit hikes",
    url: "https://cdn.tomas-travel.com/irs18/repository/DEU00000062129061368/TBX00020010001917805/DEU00000062681677868.pdf",
    stand: "03/25",
  },
  wandern: {
    id: "wandern",
    titel: "Die 10 schönsten Wander- & Spazierwege",
    titelEn: "10 most beautiful walking & hiking trails",
    url: "https://cdn.tomas-travel.com/irs18/repository/DEU00000060269944862/TBX00020010001917805/DEU00000062681677795.pdf",
    stand: "03/25",
  },
}

/** Quellenzeile unter einer Tour. */
export function flyerQuelle(id: FlyerId, en: boolean): string {
  const flyer = FLYER[id]
  const titel = en ? flyer.titelEn : flyer.titel
  if (en) {
    return `Source: flyer „${titel}“${flyer.stand ? `, printed ${flyer.stand}` : ""}`
  }
  return `Quelle: Flyer „${titel}“${flyer.stand ? `, Drucklegung ${flyer.stand}` : ""}`
}

/* ------------------------------------------------------------------ *
 * Die Flyerfrage
 * ------------------------------------------------------------------ */

/**
 * Nach dem Vorschlag fragt der Prototyp genau einmal nach einem passenden
 * Flyer. Sagt der Gast ja, folgt die zweite Frage: digital oder gedruckt.
 *
 * Digital heißt ein QR-Code auf das PDF. Er hat einen anderen Rahmen als der
 * Code zum Ausgangspunkt, damit beide nicht verwechselt werden. Gedruckt
 * heißt der Hinweis auf den Eingangsbereich der Tourist-Information, der auch
 * außerhalb der Öffnungszeiten offen ist.
 */
export function flyerKnoten(
  art: string,
  sprache: Sprache
): FlowNode | null {
  const en = sprache === "en"
  const [id, form] = art.split(":") as [FlyerId, string | undefined]
  const flyer = FLYER[id]
  if (!flyer) return null
  const titel = en ? flyer.titelEn : flyer.titel

  const weiter: Chip[] = [
    { label: en ? "Something else" : "Andere Frage", to: "menu" },
    { label: en ? "Thanks, that's all" : "Danke, das war's", to: "danke" },
  ]

  if (!form) {
    return {
      id: `flyer:${id}`,
      fertig: true,
      messages: [
        en
          ? `Gladly. Would you like the flyer „${titel}“ digitally on your phone or as a printed copy?`
          : `Gern. Möchten Sie den Flyer „${titel}“ digital aufs Handy oder gedruckt?`,
      ],
      chips: [
        {
          label: en ? "Digital (QR code)" : "Digital (QR-Code)",
          to: `flyer:${id}:digital`,
        },
        { label: en ? "Printed" : "Gedruckt", to: `flyer:${id}:gedruckt` },
      ],
    }
  }

  if (form === "digital") {
    return {
      id: `flyer:${id}:digital`,
      fertig: true,
      messages: [
        en
          ? "Here you go, the flyer as a PDF. Just scan the code with your phone camera."
          : "Bitte schön, hier ist der Flyer als PDF. Einfach den Code mit der Handykamera scannen.",
      ],
      qr: {
        art: "flyer",
        title: en ? `Flyer: ${titel}` : `Flyer: ${titel}`,
        hint: en
          ? "This code opens the flyer, not the route."
          : "Dieser Code öffnet den Flyer, nicht die Route.",
        url: flyer.url,
      },
      nachher: [
        en
          ? "Is there anything else I can help you with?"
          : "Kann ich Ihnen sonst noch weiterhelfen?",
      ],
      chips: [
        {
          label: en ? "Rather a printed copy" : "Doch lieber gedruckt",
          to: `flyer:${id}:gedruckt`,
        },
        ...weiter,
      ],
    }
  }

  if (form === "gedruckt") {
    return {
      id: `flyer:${id}:gedruckt`,
      fertig: true,
      messages: [
        en
          ? `The flyer „${titel}“ is laid out in the entrance area of the tourist information. The entrance area is open outside opening hours too. From here it is {naehe:touristinfo}.`
          : `Den Flyer „${titel}“ finden Sie im Eingangsbereich der Tourist-Information. Der Eingangsbereich ist auch außerhalb der Öffnungszeiten zugänglich. Von hier sind es {naehe:touristinfo}.`,
        en
          ? "Is there anything else I can help you with?"
          : "Kann ich Ihnen sonst noch weiterhelfen?",
      ],
      ziel: "touristinfo",
      chips: [
        {
          label: en
            ? "Route to the tourist information"
            : "Weg zur Tourist-Information",
          to: "ziel:touristinfo",
        },
        {
          label: en ? "Rather digital" : "Doch lieber digital",
          to: `flyer:${id}:digital`,
        },
        ...weiter,
      ],
    }
  }

  return null
}

/** Wenn der Gast den Flyer nicht möchte. */
export function flyerNeinKnoten(sprache: Sprache): FlowNode {
  const en = sprache === "en"
  return {
    id: "flyer-nein",
    fertig: true,
    messages: [
      en
        ? "No problem at all. If you would like to know anything else, just ask me."
        : "Gar kein Problem. Wenn Sie noch etwas wissen möchten, fragen Sie mich einfach.",
    ],
    chips: [
      { label: en ? "Something else" : "Andere Frage", to: "menu" },
      { label: en ? "Thanks, that's all" : "Danke, das war's", to: "danke" },
    ],
  }
}

/** Welche Flyer es gibt, wenn der Gast nach "einem Flyer" fragt. */
export function flyerListeKnoten(sprache: Sprache): FlowNode {
  const en = sprache === "en"
  const liste = Object.values(FLYER)
  return {
    id: "flyer-liste",
    fertig: true,
    messages: [
      en
        ? "The tourist information hands out these flyers most often. Which one would you like?"
        : "Diese Flyer gibt die Tourist-Information am häufigsten aus. Welchen möchten Sie?",
    ],
    chips: liste.map((flyer) => ({
      label: en ? flyer.titelEn : flyer.titel,
      to: `flyer:${flyer.id}`,
    })),
  }
}

/** Der Flyer, um den es in einem Knoten geht, soweit einer vorkommt. */
export function flyerVon(node: FlowNode): string | null {
  if (node.id.startsWith("flyer:")) return node.id.split(":")[1] ?? null
  const chip = node.chips?.find((eintrag) => eintrag.to.startsWith("flyer:"))
  return chip ? (chip.to.split(":")[1] ?? null) : null
}
