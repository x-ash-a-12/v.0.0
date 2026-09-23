import { describe, expect, test } from "bun:test"

import { FLOW, getNode } from "@/lib/chat-flow"
import { passendeZiele, type Profil } from "@/lib/bedarf"
import { zeitpunkt } from "@/lib/fahrplan"
import { aufloesen, STANDORTE } from "@/lib/location"
import { MELDUNGEN, offeneMeldungen } from "@/lib/meldungen"
import { neuerKontext, verstehe, type Kontext } from "@/lib/verstehen"
import { wetter } from "@/lib/wetter"
import { alsText, eintragAus, zettelKnoten } from "@/lib/zettel"
import { flyerVon } from "@/lib/flyer"
import { rueckfrageImGespraech } from "@/lib/fallback"
import { GRUPPEN, ZIELE, vorschlagbar } from "@/lib/ziele"

/**
 * Tests für den Umbau nach den Interviews vom 18.09. (Dr. Matjan) und vom
 * 22.09.2026 (Auskunft der Tourist-Information). Jeder Block nennt die
 * Arbeitsweise, die er absichert. Der Plan dazu steht in PLAN-INTERVIEWS.md.
 */

const MITTAGS = zeitpunkt(12, 0)

function ziel(text: string, kontext: Kontext = neuerKontext()): string | null {
  const ergebnis = verstehe(text, kontext)
  return ergebnis.kind === "hit" ? ergebnis.to : null
}

function nach(id: string, wetterId: "sonne" | "regen" = "sonne"): Kontext {
  const node = getNode(id, "de", MITTAGS, { wetter: wetterId, zettel: [] })
  return {
    knoten: node.id,
    topic: node.topic ?? null,
    chips: node.chips ?? [],
    istRueckfrage: Boolean(node.jaNein),
    angebot: node.angebot ?? [],
    gruppe: node.gruppe ?? null,
    ziel: node.ziel ?? null,
    weiter: node.weiter ?? null,
    nein: node.nein ?? null,
    flyer: flyerVon(node),
  }
}

function text(id: string, wetterId: "sonne" | "regen" = "sonne"): string {
  return getNode(id, "de", MITTAGS, { wetter: wetterId, zettel: [] })
    .messages.flat()
    .join("\n")
}

describe("Erst fragen, dann empfehlen (KA [00:12:47])", () => {
  test("die offene Frage nach Unternehmungen beginnt mit dem Interesse", () => {
    const node = getNode("bedarf:", "de", MITTAGS)
    expect(node.messages.flat().join(" ")).toContain("Was interessiert Sie")
    expect(node.chips?.map((chip) => chip.label)).toContain(
      "Gleich Vorschläge zeigen"
    )
  })

  test("die Reihenfolge folgt der Auskunft: Interesse, Dauer, Begleitung", () => {
    expect(text("bedarf:i=kultur")).toContain("Wie lange")
    expect(text("bedarf:i=kultur,d=tage")).toContain("Wer ist mit dabei")
  })

  test("bei den Bergen wird nach Aufstieg und Erfahrung gefragt", () => {
    // KA [00:11:53], [00:11:57]
    expect(text("bedarf:i=berge,d=tage,b=erwachsene")).toContain(
      "hinauflaufen oder mit der Bahn"
    )
  })

  test("eine freie Antwort füllt mehrere Fragen auf einmal", () => {
    expect(
      ziel("wir sind mit kinderwagen und nur heute da", nach("bedarf:"))
    ).toBe("bedarf:i=familie,d=heute,b=kinder,k=1")
  })

  test("was die erste Frage schon verrät, wird nicht noch einmal gefragt", () => {
    expect(ziel("was können wir mit den kindern hier machen")).toBe(
      "bedarf:i=familie,b=kinder"
    )
  })

  test("überspringen und gleich zeigen gehen immer", () => {
    expect(ziel("egal", nach("bedarf:i=berge"))).toBe("bedarf:i=berge,d=x")
    expect(ziel("zeig mir einfach was", nach("bedarf:i=berge"))).toBe(
      "vorschlag:i=berge:0"
    )
  })

  test("ist alles geklärt, kommt das Ergebnis mit dem verstandenen Bedarf", () => {
    const node = getNode("bedarf:i=familie,d=heute,b=kinder", "de", MITTAGS)
    expect(node.id).toBe("vorschlag:i=familie,d=heute,b=kinder:0")
    expect(node.messages.flat().join(" ")).toContain(
      "Für Sie also: etwas mit Kindern, nur heute"
    )
  })

  test("eine Frage außerhalb der Klärung wird trotzdem beantwortet", () => {
    expect(ziel("wo ist das klo", nach("bedarf:i=berge"))).toBe(
      "dienst:toilette"
    )
  })

  test("dieselben Antworten ergeben dieselben Vorschläge", () => {
    const a = getNode("vorschlag:i=berge,a=bahn:0", "de", MITTAGS).angebot
    const b = getNode("vorschlag:i=berge,a=bahn:0", "de", MITTAGS).angebot
    expect(a).toEqual(b)
    expect(a).toEqual(["unternberg"])
  })
})

describe("Das Wetter entscheidet mit (KA [00:13:43], [00:19:23])", () => {
  test("bei Regen keine Bergtour und kein Unternberg", () => {
    const regen = passendeZiele({ i: "berge" }, "regen", MITTAGS).map(
      (eintrag) => eintrag.id
    )
    expect(regen).not.toContain("sonntagshorn")
    expect(regen).not.toContain("unternberg")
    expect(text("vorschlag:i=berge:0", "regen")).toContain(
      "schicke ich Sie heute nicht auf den Berg"
    )
  })

  test("wer bei Regen ein Bergziel direkt wählt, wird gewarnt", () => {
    expect(text("ziel:sonntagshorn", "regen")).toContain("davon abraten")
    expect(text("ziel:sonntagshorn", "sonne")).not.toContain("davon abraten")
    expect(text("ziel:unternberg", "regen")).toContain("davon abraten")
  })

  test("bei Regen kommt zuerst, was drinnen ist", () => {
    const erste = passendeZiele({}, "regen", MITTAGS)[0]
    expect(erste.drinnen).toBe(true)
  })

  test("findet sich nichts Gesichertes, wird das gesagt statt geraten", () => {
    const antwort = text("vorschlag:i=berge,a=geuebt:0", "regen")
    expect(antwort).toContain("nichts Gesichertes")
    // KA [00:12:01]: die Almenübersicht mit Ausgangspunkten und Höhen.
    expect(antwort).toContain("Ausgangspunkten, Gehzeiten und Höhenmetern")
  })

  test("die Wetterauskunft folgt der Einstellung", () => {
    const vorlage = FLOW.wetter.messages.flat().join(" ")
    const mitRegen = aufloesen(vorlage, STANDORTE[0], "de", wetter("regen"))
    expect(mitRegen).toContain("Regen")
    expect(mitRegen).not.toContain("{wetter")
  })
})

describe("Lieber keine Information als eine falsche (KA [00:23:34])", () => {
  const profile: Profil[] = [
    {},
    { i: "berge" },
    { i: "familie" },
    { i: "kultur" },
    { i: "gemuetlich" },
    { i: "berge", a: "gemuetlich" },
  ]

  test("keine Vorschlagsliste enthält ein ungesichertes Ziel", () => {
    for (const gruppe of Object.keys(GRUPPEN)) {
      for (const wetterId of ["sonne", "regen"] as const) {
        for (const ab of [0, 3, 6]) {
          const node = getNode(`empfehlung:${gruppe}:${ab}`, "de", MITTAGS, {
            wetter: wetterId,
            zettel: [],
          })
          for (const id of node.angebot ?? []) {
            const eintrag = ZIELE.find((z) => z.id === id)!
            // Die Absage am Ende einer Liste nennt die bisherigen noch
            // einmal, auch dort darf nichts Ungesichertes stehen.
            expect(vorschlagbar(eintrag)).toBe(true)
          }
        }
      }
    }
    for (const profil of profile) {
      for (const wetterId of ["sonne", "regen"] as const) {
        for (const eintrag of passendeZiele(profil, wetterId, MITTAGS)) {
          expect(vorschlagbar(eintrag)).toBe(true)
        }
      }
    }
  })

  test("ein ungesichertes Ziel wird nur gefunden, nicht beschrieben", () => {
    const antwort = text("ziel:foerchensee")
    expect(antwort).toContain("nichts Gesichertes")
    expect(antwort).not.toContain("3 km")
    expect(getNode("ziel:foerchensee").qr?.url).toContain("google.com/maps")
  })

  test("die Rauschbergbahn wird nirgends als fahrend dargestellt", () => {
    expect(text("ziel:rauschberg")).toContain("fährt derzeit nicht")
    for (const id of ["wandern", "bergbahnen", "bergbahn-preise", "essen"]) {
      const inhalt = JSON.stringify(FLOW[id])
      expect(inhalt).not.toContain("24,00")
      expect(inhalt).not.toContain("Gipfelalm")
    }
    expect(text("bergbahnen")).toContain("Rauschbergbahn fährt derzeit nicht")
  })

  test("kein Vorschlag nennt einen erfundenen Favoriten", () => {
    for (const gruppe of Object.keys(GRUPPEN)) {
      expect(text(`empfehlung:${gruppe}:0`)).not.toMatch(
        /★|beliebteste|am häufigsten/
      )
    }
  })
})

describe("Die täglichen Fragen am Schalter (KA [00:07:59])", () => {
  const faelle: [string, string][] = [
    ["wo ist das klo", "dienst:toilette"],
    ["gibt es hier eine toilette", "dienst:toilette"],
    ["wo fährt der schienenersatzverkehr", "dienst:sev"],
    ["wo fährt der ersatzbus", "dienst:sev"],
    ["kann ich hier zugtickets kaufen", "dienst:zugticket"],
    ["wo bekomme ich eine fahrkarte", "dienst:zugticket"],
    ["mein zug ist ausgefallen", "dienst:bahn"],
    ["ich will mich über den busfahrer beschweren", "dienst:bahn"],
    ["wo gibt es karten für den biathlon", "dienst:tickets"],
    ["haben sie einen ortsplan", "dienst:ortsplan"],
    ["gibt es aktuelle hinweise", "hinweise"],
    ["ist irgendwas gesperrt", "hinweise"],
  ]

  for (const [eingabe, erwartet] of faelle) {
    test(`„${eingabe}“ → ${erwartet}`, () => {
      expect(ziel(eingabe)).toBe(erwartet)
    })
  }

  test("die Toilette liegt im Bahnhofsgebäude neben der Tourist-Info", () => {
    // Angabe des Autors vom 23.09.2026, im Ortsplan Feld N9.
    expect(text("dienst:toilette")).toContain("Bahnhofsgebäude")
  })

  test("Radverleih nennt nur die beiden Verleihe aus dem Flyer", () => {
    expect(ziel("kann ich hier fahrrad leihen")).toBe("dienst:radverleih")
    expect(ziel("wo kann ich ein e-bike mieten")).toBe("dienst:radverleih")
    const antwort = text("dienst:radverleih")
    expect(antwort).toContain("Radl Sepp")
    expect(antwort).toContain("Die RADgeber")
    expect(antwort).toContain("Öffnungszeiten und Preise habe ich nicht")
  })

  test("Zugtickets gibt es nicht in der Tourist-Information", () => {
    expect(text("dienst:zugticket")).toContain("im Zug")
  })
})

describe("Grenzen benennen und weiterverweisen (KA [00:09:56])", () => {
  test("Ziele außerhalb gehen an die Tourist-Info dort", () => {
    expect(ziel("wie komme ich zum kehlsteinhaus")).toBe(
      "verweis:berchtesgaden"
    )
    expect(ziel("wo gibt es am chiemsee den besten kaiserschmarrn")).toBe(
      "verweis:chiemsee"
    )
    expect(ziel("wo kann ich die salzburger stadttour buchen")).toBe(
      "verweis:salzburg"
    )
    expect(text("verweis:berchtesgaden")).toContain("außerhalb von Ruhpolding")
  })

  test("die Fahrt nach Salzburg bleibt eine Fahrplanfrage", () => {
    expect(ziel("wie komme ich nach salzburg")).toBe("fahrplan:salzburg")
  })

  test("ohne Treffer verweist der Fallback an den Schalter", () => {
    const antwort = verstehe("xyzzy quux")
    expect(antwort.kind).toBe("miss")
  })
})

describe("Der Zettel zum Mitnehmen (KA [00:28:47], M [00:26:09])", () => {
  test("„schreib mir das auf“ legt das Gezeigte auf den Zettel", () => {
    expect(ziel("schreib mir das auf", nach("ziel:vitalwelt"))).toBe(
      "zettel:neu:ziel:vitalwelt"
    )
    expect(ziel("merk dir das", nach("fahrplan:traunstein"))).toBe(
      "zettel:neu:fahrplan:traunstein"
    )
  })

  test("drucken und mailen werden erkannt", () => {
    expect(ziel("druck mir das bitte aus")).toBe("zettel:drucken")
    expect(ziel("kannst du mir das per mail schicken")).toBe("zettel:mail")
  })

  test("die Frage nach der E-Mail-Adresse der TI ist kein Versandwunsch", () => {
    expect(ziel("wie ist die email adresse der tourist info")).not.toBe(
      "zettel:mail"
    )
  })

  test("ein Ziel und ein Fahrplan werden zu Einträgen", () => {
    const ort = eintragAus("ziel:vitalwelt", "de", MITTAGS)
    expect(ort?.titel).toBe("Vita Alpina")
    const bahn = eintragAus("fahrplan:traunstein", "de", MITTAGS)
    expect(bahn?.zeilen.some((zeile) => zeile.includes("Ersatzverkehr"))).toBe(
      true
    )
  })

  test("ein ungesichertes Ziel kommt nicht auf den Zettel", () => {
    const node = getNode("ziel:foerchensee")
    expect(node.chips?.some((chip) => chip.to.startsWith("zettel:"))).toBe(
      false
    )
  })

  test("der Druck meldet den Status vor dem Ergebnis", () => {
    const eintrag = eintragAus("ziel:vitalwelt", "de", MITTAGS)!
    const node = zettelKnoten("drucken", [eintrag], "de")!
    expect(node.messages.flat()[0]).toContain("Einen Moment")
    expect(node.zettel?.eintraege).toHaveLength(1)
    expect(node.nachher?.flat().join(" ")).toContain("kein Drucker")
  })

  test("ein leerer Zettel wird erklärt statt gedruckt", () => {
    expect(zettelKnoten("drucken", [], "de")?.id).toBe("zettel:leer")
  })

  test("der QR-Code bleibt lesbar kurz", () => {
    const viele = Array.from({ length: 20 }, () =>
      eintragAus("fahrplan:traunstein", "de", MITTAGS)!
    )
    expect(alsText(viele, "de").length).toBeLessThanOrEqual(900)
  })
})

describe("Aktuelle Hinweise wie die Rundmail (KA [00:18:32])", () => {
  test("zum Fahrplan erscheint der Ersatzverkehr", () => {
    const node = getNode("fahrplan:traunstein", "de", MITTAGS)
    const ids = offeneMeldungen(node, "sonne", new Set()).map((m) => m.id)
    expect(ids).toContain("sev")
  })

  test("ein gezeigter Hinweis kommt nicht noch einmal", () => {
    const node = getNode("fahrplan:traunstein", "de", MITTAGS)
    expect(offeneMeldungen(node, "sonne", new Set(["sev"]))).toHaveLength(0)
  })

  test("der Regenhinweis zum Unternberg erscheint nur bei Regen", () => {
    const node = getNode("ziel:unternberg", "de", MITTAGS)
    const sonne = offeneMeldungen(node, "sonne", new Set()).map((m) => m.id)
    const regen = offeneMeldungen(node, "regen", new Set()).map((m) => m.id)
    expect(sonne).not.toContain("unternberg-regen")
    expect(regen).toContain("unternberg-regen")
  })

  test("jeder Hinweis nennt Quelle und Stand", () => {
    for (const meldung of MELDUNGEN) {
      expect(meldung.quelle.length).toBeGreaterThan(0)
      expect(meldung.stand).toMatch(/^\d{2}\.\d{2}\.\d{4}$/)
    }
  })
})

describe("Englisch auch in den neuen Teilen", () => {
  const ids = [
    "bedarf:",
    "bedarf:i=berge,d=tage,b=erwachsene",
    "vorschlag:i=kultur:0",
    "vorschlag:i=berge,a=geuebt:0",
    "dienst:toilette",
    "dienst:ortsplan",
    "verweis:berchtesgaden",
    "hinweise",
  ]
  for (const id of ids) {
    test(`${id} antwortet auf Englisch`, () => {
      const node = getNode(id, "en", MITTAGS, { wetter: "regen", zettel: [] })
      const inhalt = node.messages.flat().join(" ")
      expect(inhalt).not.toMatch(/\b(und|nicht|dich|habe|Gern)\b/)
      for (const chip of node.chips ?? []) {
        expect(chip.label).not.toMatch(/Andere|Überspringen|Gleich/)
      }
    })
  }
})

describe("Vorschlag, Details, Karte, dann ein Flyer (Vorgabe vom 23.09.2026)", () => {
  test("die Detailauskunft nennt Eignung, Grenzen und Quelle", () => {
    const antwort = text("ziel:sonntagshorn")
    expect(antwort).toContain("Geeignet für:")
    expect(antwort).toContain("Worauf Sie achten sollten:")
    expect(antwort).toContain("Kletterkönnen im I. bis II. Schwierigkeitsgrad")
    expect(antwort).toContain("Quelle: Flyer „Die 10 schönsten Gipfeltouren“")
  })

  test("nach dem Kartenlink kommt genau eine Flyerfrage", () => {
    const node = getNode("ziel:sagenweg", "de", MITTAGS)
    expect(node.qr?.url).toContain("google.com/maps")
    expect(node.nachher?.flat()).toHaveLength(1)
    expect(node.nachher?.flat()[0]).toContain(
      "„Die 10 schönsten Wander- & Spazierwege“ kostenlos dazu"
    )
    expect(node.chips?.[0].to).toBe("flyer:wandern")
    expect(node.chips?.[1].to).toBe("flyer-nein")
  })

  test("der Flyer passt zur Art des Ziels", () => {
    expect(getNode("ziel:zinnkopf").chips?.[0].to).toBe("flyer:gipfel")
    expect(getNode("ziel:rad-tal").chips?.[0].to).toBe("flyer:rad")
    expect(getNode("ziel:vitalwelt").chips?.[0].to).toBe("flyer:ortsplan")
    expect(getNode("ziel:langerbauer").chips?.[0].to).toBe("flyer:almsommer")
  })

  test("ja und nein auf die Flyerfrage, auch getippt", () => {
    const frage = nach("ziel:sagenweg")
    expect(ziel("ja gerne", frage)).toBe("flyer:wandern")
    expect(ziel("nein danke", frage)).toBe("flyer-nein")
  })

  test("die zweite Frage: digital oder gedruckt", () => {
    expect(text("flyer:wandern")).toContain("digital aufs Handy oder gedruckt")
    expect(ziel("digital bitte", nach("flyer:wandern"))).toBe(
      "flyer:wandern:digital"
    )
    expect(ziel("lieber gedruckt", nach("flyer:wandern"))).toBe(
      "flyer:wandern:gedruckt"
    )
  })

  test("digital: ein QR-Code auf das PDF, anders gerahmt als die Route", () => {
    const node = getNode("flyer:gipfel:digital", "de", MITTAGS)
    expect(node.qr?.art).toBe("flyer")
    expect(node.qr?.url).toMatch(/^https:\/\/cdn\.tomas-travel\.com\/.+\.pdf$/)
    expect(getNode("ziel:zinnkopf").qr?.art).toBeUndefined()
  })

  test("gedruckt: Eingangsbereich, auch außerhalb der Öffnungszeiten", () => {
    const antwort = text("flyer:almsommer:gedruckt")
    expect(antwort).toContain("Eingangsbereich der Tourist-Information")
    expect(antwort).toContain("auch außerhalb der Öffnungszeiten zugänglich")
  })

  test("der Ortsplan wird ebenfalls angeboten", () => {
    const node = getNode("dienst:ortsplan", "de", MITTAGS)
    expect(node.chips?.[0].to).toBe("flyer:ortsplan")
    expect(node.messages.flat().join(" ")).toContain("Feld N9")
  })
})

describe("Keine Öffnungszeiten, keine geratenen Entfernungen", () => {
  test("wo Zeiten zählen, verweist der Prototyp an die Tourist-Info", () => {
    for (const id of ["vitalwelt", "heimatmuseum", "langerbauer", "unternberg"]) {
      const antwort = text(`ziel:${id}`)
      expect(antwort).toContain("nicht verlässlich hinterlegt")
      expect(antwort).toContain("+49 (0) 8663 88060")
      expect(antwort).toContain("Mo bis Fr 9 bis 17 Uhr")
    }
  })

  test("unbelegte Wegangaben fallen weg statt geraten zu werden", () => {
    const tal = STANDORTE.find((standort) => standort.id === "rauschberg")!
    const satz =
      "Die Dorflinie hält dort. Von hier sind es {naehe:arena}.\n— von hier {naehe:vitalwelt}"
    expect(aufloesen(satz, tal)).toBe("Die Dorflinie hält dort.")
  })

  test("von der Tourist-Info zum Bahnhof sind es nur wenige Schritte", () => {
    const info = STANDORTE.find((standort) => standort.id === "info")!
    expect(aufloesen("{naehe:bahnhof}", info)).toContain("Bahnhofsgebäude")
  })
})

describe("Anrede Sie", () => {
  const DU = /\b(du|dir|dich|dein\w*|Du|Dir|Dich|Dein\w*)\b/

  test("kein deutscher Antworttext duzt", () => {
    const ids = [
      ...Object.keys(FLOW),
      ...ZIELE.map((eintrag) => `ziel:${eintrag.id}`),
      ...Object.keys(GRUPPEN).map((gruppe) => `empfehlung:${gruppe}:0`),
      "bedarf:",
      "bedarf:i=berge",
      "bedarf:i=berge,d=tage",
      "bedarf:i=berge,d=tage,b=erwachsene",
      "vorschlag:i=berge,a=geuebt:0",
      "dienst:ortsplan",
      "dienst:toilette",
      "dienst:radverleih",
      "flyer:wandern",
      "flyer:wandern:digital",
      "flyer:wandern:gedruckt",
      "flyer-nein",
      "hinweise",
    ]
    const fundstellen: string[] = []
    for (const id of ids) {
      for (const wetterId of ["sonne", "regen"] as const) {
        const node = getNode(id, "de", MITTAGS, { wetter: wetterId, zettel: [] })
        const texte = [
          ...node.messages.flat(),
          ...(node.kurz?.flat() ?? []),
          ...(node.nachher?.flat() ?? []),
          ...(node.chips ?? []).map((chip) => chip.label),
        ]
        for (const t of texte) if (DU.test(t)) fundstellen.push(`${id}: ${t}`)
      }
    }
    expect(fundstellen).toEqual([])
  })
})

describe("Nachträge aus dem Browsertest vom 23.09.2026", () => {
  test("die Frage mit Kinderwagen führt in die Bedarfsklärung", () => {
    expect(
      ziel(
        "Wir sind mit Kinderwagen da und bleiben ein paar Tage. Was können wir hier machen?"
      )
    ).toBe("bedarf:i=familie,d=tage,b=kinder,k=1")
  })

  test("die Kinderwagenwege stammen aus dem Wanderflyer", () => {
    const node = getNode("wandern-leicht", "de", MITTAGS)
    expect(node.angebot).toEqual(["sagenweg", "taubensee", "schwarzachen"])
  })
})

describe("Kinderwagen", () => {
  test("mit Kinderwagen nur Wege, die der Flyer dafür nennt", () => {
    const ziele = passendeZiele(
      { i: "familie", b: "kinder", k: "1" },
      "sonne",
      MITTAGS
    )
    for (const eintrag of ziele) {
      if (eintrag.topic === "wandern") expect(eintrag.kinderwagen).toBe(true)
    }
    expect(ziele.map((eintrag) => eintrag.id)).not.toContain("bergwald")
  })

  test("die Zusammenfassung nennt den Kinderwagen", () => {
    expect(text("vorschlag:i=familie,b=kinder,k=1:0")).toContain(
      "mit Kinderwagen"
    )
  })

  test("keine Behauptung, was gerade geöffnet hat", () => {
    const vormittags = getNode("vorschlag:i=kultur:0", "de", zeitpunkt(11, 0))
    expect(vormittags.messages.flat().join(" ")).not.toMatch(
      /geöffnet|haben zu/
    )
  })
})

describe("Hinweise nur, wo sie hingehören", () => {
  test("beim Sagenweg kein Hinweis zur Rauschbergbahn", () => {
    const node = getNode("ziel:sagenweg", "de", MITTAGS)
    expect(offeneMeldungen(node, "regen", new Set())).toHaveLength(0)
  })

  test("bei den Bergbahnen schon", () => {
    const node = getNode("bergbahnen", "de", MITTAGS)
    const ids = offeneMeldungen(node, "sonne", new Set()).map((m) => m.id)
    expect(ids).toContain("rauschberg")
  })
})

describe("Testlauf des Autors vom 23.09.2026, 11:58", () => {
  test("Berge, nur heute, mit Kindern, geübt: kein Staubfall", () => {
    const node = getNode(
      "vorschlag:i=berge,d=heute,b=kinder,a=geuebt:0",
      "de",
      MITTAGS
    )
    expect(node.angebot).not.toContain("staubfall")
    // Leichtes zuerst, keine Tagestour vorn.
    expect(node.angebot?.[0]).toBe("zinnkopf")
  })

  test("nach dem digitalen Flyer: „ich will den Flyer ausgedruck“", () => {
    const nachDigital = { ...nach("flyer:wandern:digital"), flyer: "wandern" }
    expect(ziel("ich will den Flyer ausgedruck", nachDigital)).toBe(
      "flyer:wandern:gedruckt"
    )
    expect(ziel("Flyer in ausgedruckter form", nachDigital)).toBe(
      "flyer:wandern:gedruckt"
    )
  })

  test("der Flyer bleibt über mehrere Schritte bekannt", () => {
    const spaeter = { ...nach("menu"), flyer: "gipfel" }
    expect(ziel("kann ich den flyer noch gedruckt haben", spaeter)).toBe(
      "flyer:gipfel:gedruckt"
    )
    expect(ziel("den flyer bitte", spaeter)).toBe("flyer:gipfel")
  })

  test("ohne angebotenen Flyer zeigt der Prototyp die Auswahl", () => {
    expect(ziel("haben sie flyer")).toBe("flyer-liste")
  })

  test("„spazierengehen“ bleibt in der Bedarfsklärung", () => {
    expect(ziel("spazierengehen", nach("bedarf:"))).toBe(
      "bedarf:i=berge,a=gemuetlich"
    )
  })

  test("„ja gern“ auf „Darf ich Ihnen ein paar Fragen stellen?“", () => {
    expect(ziel("ja gern", nach("wandern"))).toBe("bedarf:i=berge")
    expect(ziel("nein", nach("wandern"))).toBe("vorschlag:i=berge,f=1:0")
  })

  test("Wechsel zwischen digital und gedruckt per Schaltfläche", () => {
    const digital = getNode("flyer:wandern:digital", "de", MITTAGS)
    expect(digital.chips?.[0].to).toBe("flyer:wandern:gedruckt")
    const gedruckt = getNode("flyer:wandern:gedruckt", "de", MITTAGS)
    expect(gedruckt.chips?.some((c) => c.to === "flyer:wandern:digital")).toBe(
      true
    )
  })
})

describe("Rückfrage im Gesprächsfaden", () => {
  test("die Schaltflächen der vorigen Frage bleiben stehen", () => {
    const frage = getNode("bedarf:i=berge", "de", MITTAGS)
    const rueckfrage = rueckfrageImGespraech(frage.chips ?? [], "de")
    expect(rueckfrage.chips).toEqual(frage.chips)
    expect(rueckfrage.behalteKontext).toBe(true)
    expect(rueckfrage.messages.flat()[0]).toContain("nicht")
  })
})

describe("Testlauf des Autors vom 23.09.2026, 12:06", () => {
  test("„Ortplan“ in der Flyerauswahl, mit Tippfehler", () => {
    expect(ziel("Ortplan", nach("flyer-liste"))).toBe("flyer:ortsplan")
    expect(ziel("Ortplan")).toBe("dienst:ortsplan")
  })

  test("„welche flyer gibt es“ zeigt die Auswahl, auch mit gemerktem Flyer", () => {
    const spaeter = { ...nach("flyer:ortsplan:digital"), flyer: "ortsplan" }
    expect(ziel("welche flyer gibt es", spaeter)).toBe("flyer-liste")
  })

  test("„nein ich will andere flyer“ zeigt die Auswahl", () => {
    const spaeter = { ...nach("flyer:ortsplan"), flyer: "ortsplan" }
    expect(ziel("nein ich will andere flyer", spaeter)).toBe("flyer-liste")
    expect(ziel("Nein ich will einen anderen flyern", spaeter)).toBe(
      "flyer-liste"
    )
  })

  test("ein Flyer beim Namen, auch mitten im Flyerdialog", () => {
    const dialog = { ...nach("flyer:ortsplan"), flyer: "ortsplan" }
    expect(ziel("den almflyer bitte", dialog)).toBe("flyer:almsommer")
    expect(ziel("lieber den radflyer digital", dialog)).toBe("flyer:rad:digital")
    expect(ziel("ich will den ortsplan doch digital", dialog)).toBe(
      "flyer:ortsplan:digital"
    )
  })

  test("die Form allein bleibt beim gemerkten Flyer", () => {
    const dialog = { ...nach("flyer:ortsplan"), flyer: "ortsplan" }
    expect(ziel("ausgedruckt", dialog)).toBe("flyer:ortsplan:gedruckt")
  })

  test("eine Radfrage ohne Flyerbezug ist keine Frage nach dem Radflyer", () => {
    expect(ziel("ich möchte radfahren")).toBe("bedarf:i=rad")
  })
})
