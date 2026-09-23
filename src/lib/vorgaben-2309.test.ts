import { describe, expect, test } from "bun:test"

import { FLOW, getNode } from "@/lib/chat-flow"
import { passendeZiele } from "@/lib/bedarf"
import { BILDER } from "@/lib/bilder"
import { zeitpunkt } from "@/lib/fahrplan"
import { uebersetze } from "@/lib/i18n"
import { neuerKontext, verstehe, type Kontext } from "@/lib/verstehen"
import { WEB } from "@/lib/web"
import { flyerVon } from "@/lib/flyer"
import { ZIELE, webVon } from "@/lib/ziele"

/**
 * Vorgaben des Autors vom 23.09.2026: Sport als eigenes Thema, Verweise auf
 * die passende Seite von ruhpolding.de, Flyer oder Website zur Wahl, wenige
 * Bilder in der Detailauskunft.
 */

const MITTAGS = zeitpunkt(12, 0)

function ziel(text: string, kontext: Kontext = neuerKontext()): string | null {
  const ergebnis = verstehe(text, kontext)
  return ergebnis.kind === "hit" ? ergebnis.to : null
}

function nach(id: string): Kontext {
  const node = getNode(id, "de", MITTAGS)
  return {
    ...neuerKontext(),
    knoten: node.id,
    topic: node.topic ?? null,
    chips: node.chips ?? [],
    istRueckfrage: Boolean(node.jaNein),
    nein: node.nein ?? null,
    flyer: flyerVon(node),
  }
}

describe("Sport", () => {
  test("wird im Freitext erkannt", () => {
    expect(ziel("Ich möchte Sport machen")).toBe("sport")
    expect(ziel("was kann ich hier sportliches unternehmen")).toBe(
      "bedarf:i=sport"
    )
    expect(ziel("gibt es hier Golf")).toBe("ziel:golfclub")
    expect(ziel("Gleitschirmfliegen")).toBe("ziel:tandemflug")
  })

  test("eine sportliche Wanderung bleibt eine Wanderung", () => {
    expect(ziel("sportliche Wanderung")).toBe("wandern")
  })

  test("steht in der Interessenfrage der Bedarfsklärung", () => {
    const chips = getNode("bedarf:", "de", MITTAGS).chips ?? []
    expect(chips.map((chip) => chip.to)).toContain("bedarf:i=sport")
  })

  test("bei Sonne kommt nicht zuerst das Hallenbad", () => {
    const zuerst = passendeZiele({ i: "sport" }, "sonne", MITTAGS)[0]
    expect(zuerst.id).toBe("tandemflug")
  })

  test("bei Regen nichts, was bei Regen nicht geht", () => {
    const ids = passendeZiele({ i: "sport" }, "regen", MITTAGS).map((z) => z.id)
    expect(ids[0]).toBe("vitalwelt")
    expect(ids).not.toContain("tandemflug")
    expect(ids).not.toContain("minigolf")
  })

  test("der Themeneinstieg ist übersetzt", () => {
    const en = uebersetze(FLOW.sport, "en")
    expect(en.messages.flat().join(" ")).toContain("tandem paragliding")
  })
})

describe("Seiten auf ruhpolding.de", () => {
  test("jede Adresse liegt auf ruhpolding.de", () => {
    for (const seite of Object.values(WEB)) {
      expect(seite.url.startsWith("https://www.ruhpolding.de/")).toBe(true)
    }
  })

  test("jede Web-Schaltfläche im Baum führt auf einen Web-Knoten", () => {
    const ziele = Object.values(FLOW).flatMap((node) =>
      (node.chips ?? [])
        .map((chip) => chip.to)
        .filter((to) => to.startsWith("web:"))
    )
    expect(ziele.length).toBeGreaterThan(15)
    for (const to of ziele) expect(getNode(to).id).toBe(to)
  })

  test("der Web-Knoten gibt die Seite als eigenen QR-Code aus", () => {
    const node = getNode("web:alle-wandertouren")
    expect(node.qr?.art).toBe("web")
    expect(node.qr?.url).toBe("https://www.ruhpolding.de/alle-wandertouren")
  })

  test("das Wandern bietet den Überblick über alle Touren an", () => {
    const chips = FLOW.wandern.chips ?? []
    expect(chips.map((chip) => chip.to)).toContain("web:alle-wandertouren")
  })

  test("die Unterkunft verweist auf die Unterkunftsuche", () => {
    const chips = FLOW.unterkunft.chips ?? []
    expect(chips.map((chip) => chip.to)).toContain("web:unterkunft")
  })

  test("jedes Ziel mit Flyer hat auch eine Seite", () => {
    for (const eintrag of ZIELE) {
      if (eintrag.flyer && eintrag.flyer !== "ortsplan") {
        expect(webVon(eintrag)).toBeDefined()
      }
    }
  })

  test("der Skiverleih nennt die Verleiher, die ruhpolding.de nennt", () => {
    // Bis zum 23.09.2026 stand hier, Ruhpolding Tourismus nenne keine.
    const text = FLOW["winter-verleih"].messages.flat().join(" ")
    expect(text).toContain("Sport Plenk")
    expect(text).not.toContain("nicht beim Namen")
  })
})

describe("Flyer oder Website", () => {
  test("die Website lässt sich wählen, auch getippt", () => {
    const frage = nach("ziel:sagenweg")
    expect(ziel("die Website bitte", frage)).toBe("web:wanderwege")
    expect(ziel("lieber online", frage)).toBe("web:wanderwege")
    expect(ziel("den Flyer bitte", frage)).toBe("flyer:wandern")
  })

  test("ohne Flyer wird nur die Website angeboten", () => {
    const node = getNode("ziel:minigolf", "de", MITTAGS)
    expect(node.chips?.[0].to).toBe("web:minigolf")
    expect(node.nachher?.flat()[0]).toContain("ruhpolding.de")
  })
})

describe("Bilder", () => {
  test("nur in der Detailauskunft, nie in der Vorschlagsliste", () => {
    expect(getNode("ziel:tandemflug", "de", MITTAGS).bild?.url).toBe(
      BILDER.tandemflug.url
    )
    expect(
      getNode("vorschlag:i=sport,f=1:0", "de", MITTAGS).bild
    ).toBeUndefined()
    expect(getNode("empfehlung:sport:0", "de", MITTAGS).bild).toBeUndefined()
  })

  test("jedes Bild nennt Urheber und Herkunft", () => {
    for (const bild of Object.values(BILDER)) {
      expect(bild.urheber.length).toBeGreaterThan(3)
      expect(bild.seite.startsWith("https://www.ruhpolding.de/")).toBe(true)
    }
  })

  test("wenige Bilder: höchstens zwölf Ziele tragen eins", () => {
    expect(ZIELE.filter((eintrag) => eintrag.bild).length).toBeLessThanOrEqual(
      12
    )
  })
})
