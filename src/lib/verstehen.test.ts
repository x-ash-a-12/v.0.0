import { describe, expect, test } from "bun:test"

import { FLOW, getNode, rueckfrageKnoten } from "@/lib/chat-flow"
import { fallbackKnoten } from "@/lib/fallback"
import {
  ANREISE,
  BERGBAHNEN,
  EVENTS,
  FAMILIE,
  GASTRONOMIE,
  PARKEN,
  TOURIST_INFO,
  WANDERN,
  WINTER,
} from "@/lib/daten"
import { NUR_DEUTSCH, uebersetze } from "@/lib/i18n"
import { GRUPPEN, ZIELE } from "@/lib/ziele"
import {
  minuten,
  naechsteAbfahrten,
  verbindung,
  zeitpunkt,
} from "@/lib/fahrplan"
import { status, statusText } from "@/lib/jetzt"
import { offeneMeldungen } from "@/lib/meldungen"
import {
  neuerKontext,
  normalisiere,
  stamm,
  verstehe,
  type Kontext,
} from "@/lib/verstehen"

/**
 * Regressionstests für die Zuordnung freier Eingaben.
 *
 * Der Anlass ist der Testlauf vom 03.09.2026: von zehn getippten Eingaben
 * blieben sechs ohne Treffer. Jede davon steht unten namentlich. Die übrigen
 * Fälle decken ab, was daneben nicht kaputtgehen darf.
 *
 * Warum überhaupt Tests in einem Prototyp: die Zuordnung ist der Teil, der
 * über den Eindruck im Think-Aloud-Test entscheidet, und sie ist zugleich der
 * Teil, bei dem eine gutgemeinte Ergänzung leise etwas anderes zerstört. Ein
 * neues Stichwort im Lexikon kann ein bestehendes Thema überstimmen, ohne
 * dass es beim Ausprobieren auffällt.
 */

/** Kürzel: Eingabe zuordnen und den Zielknoten zurückgeben, sonst null. */
function ziel(text: string, kontext: Kontext = neuerKontext()): string | null {
  const ergebnis = verstehe(text, kontext)
  return ergebnis.kind === "hit" ? ergebnis.to : null
}

/** Gibt es zu dieser ID einen Knoten, oder landet sie im Notknoten? */
function existiert(id: string): boolean {
  return getNode(id).id !== "notknoten"
}

/**
 * Mittag am 03.09.2026, der Vorgabezeitpunkt für alle Tests.
 *
 * Empfehlungen sortieren nach Eignung zur aktuellen Uhrzeit: was gerade zu
 * hat, rutscht nach hinten. Ohne festen Zeitpunkt hinge die Reihenfolge an
 * der Systemuhr, und dieselben Tests wären morgens grün und abends rot.
 * Mittags sind alle Ziele offen, die Reihenfolge entspricht also der in
 * GRUPPEN hinterlegten.
 */
const MITTAGS = zeitpunkt(12, 0)

/** Kontext, wie er nach einer Antwort auf diesem Knoten aussieht. */
function nach(knotenId: string, jetzt: Date = MITTAGS): Kontext {
  const node = getNode(knotenId, "de", jetzt)
  if (node.id === "notknoten") {
    throw new Error(`Knoten ${knotenId} gibt es nicht`)
  }
  return {
    knoten: node.id,
    topic: node.topic ?? null,
    chips: node.chips ?? [],
    istRueckfrage: false,
    angebot: node.angebot ?? [],
    nummern: node.nummern,
    gruppe: node.gruppe ?? null,
    ziel: node.ziel ?? null,
  }
}

describe("Normalisierung", () => {
  test("löst Umlaute auf, damit beide Schreibweisen gleich ankommen", () => {
    expect(normalisiere("Öffnungszeiten")).toBe("oeffnungszeiten")
    expect(normalisiere("Grüß Gott!")).toBe("gruess gott")
    expect(normalisiere("Wo kann ich WANDERN gehen?")).toBe(
      "wo kann ich wandern gehen"
    )
  })

  test("schneidet Flexionsendungen ab, aber nicht ins Wort hinein", () => {
    expect(stamm("bergbahnen")).toBe("bergbahn")
    expect(stamm("wandern")).toBe("wander")
    expect(stamm("bus")).toBe("bus")
    expect(stamm("ski")).toBe("ski")
  })
})

describe("Die Eingaben aus dem Testlauf vom 03.09.", () => {
  test("„wo kann ich wandern gehen“ führt in die Bedarfsklärung", () => {
    // Bis zum Testlauf um 12:30 endete das im Themeneinstieg, danach in drei
    // festen Vorschlägen. Seit dem Interview mit der Auskunft (22.09.) wird
    // erst nachgefragt, das Interesse steht dabei schon fest.
    expect(ziel("wo kann ich wandern gehen")).toBe("bedarf:i=berge")
  })

  test("„welche bergbahnen gibt es“ führt zu den Bahnen, nicht zum Einstieg", () => {
    expect(ziel("welche bergbahnen gibt es")).toBe("bergbahnen")
  })

  test("„ja welche genau“ bezieht sich auf das laufende Thema", () => {
    // Vorher: miss. Die Eingabe trägt kein Themenwort, der Bezug steht im
    // Gespräch.
    expect(ziel("ja welche genau", nach("wandern"))).toBe("bergbahnen")
  })

  test("„gib mir qr code aus“ wird beantwortet", () => {
    expect(ziel("gib mir qr code aus")).toBe("qr-hinweis")
  })

  test("„qr“ allein reicht", () => {
    expect(ziel("qr")).toBe("qr-hinweis")
  })

  test("„was kann ich hier machen“ beginnt mit einer Gegenfrage", () => {
    expect(ziel("was kann ich hier machen")).toBe("bedarf:")
  })

  test("„wo bin ich gerade“ und „wo bin ich“ nennen den Aufstellort", () => {
    expect(ziel("wo bin ich gerade")).toBe("standort")
    expect(ziel("wo bin ich")).toBe("standort")
  })
})

describe("Meta-Fragen an das Gerät", () => {
  test("Fragen nach dem Assistenten selbst", () => {
    expect(ziel("was kannst du")).toBe("ueber-mich")
    expect(ziel("bist du ein mensch")).toBe("ueber-mich")
    expect(ziel("wer bist du eigentlich")).toBe("ueber-mich")
    expect(ziel("what can you do")).toBe("ueber-mich")
  })

  test("Fragen nach dem Standort in mehreren Formulierungen", () => {
    expect(ziel("wo stehe ich hier")).toBe("standort")
    expect(ziel("wo sind wir")).toBe("standort")
    expect(ziel("where am i")).toBe("standort")
  })

  test("Fragen nach dem Ort und seinen Möglichkeiten", () => {
    expect(ziel("was gibt es hier zu sehen")).toBe("bedarf:")
    expect(ziel("was kann man hier unternehmen")).toBe("bedarf:")
    expect(ziel("was gibts hier")).toBe("bedarf:")
  })

  test("die Frage nach dem Ort auch im Konjunktiv", () => {
    expect(ziel("was könnte ich hier machen?")).toBe("bedarf:")
    expect(ziel("was könnte man hier unternehmen")).toBe("bedarf:")
    expect(ziel("was würde sich hier lohnen zu sehen")).toBe("bedarf:")
    expect(ziel("was macht man hier so")).toBe("bedarf:")
    expect(ziel("what could i do here")).toBe("bedarf:")
  })

  test("„nochmal“ wiederholt die letzte Antwort", () => {
    expect(ziel("nochmal bitte", nach("bergbahn-preise"))).toBe(
      "bergbahn-preise"
    )
  })

  test("„nochmal“ ohne vorherige Antwort führt nicht ins Leere", () => {
    expect(ziel("nochmal")).not.toBe("@wiederholung")
  })

  test("Dank und Gruß bleiben Rahmen, die Sachfrage gewinnt", () => {
    expect(ziel("danke")).toBe("danke")
    expect(ziel("hallo")).toBe("menu")
    // Die eigentliche Frage darf nicht vom Dank überstimmt werden.
    expect(ziel("danke, und wo kann ich parken?")).toBe("anreise-parken")
    expect(ziel("hallo, ich suche ein hotel")).toBe("unterkunft")
  })
})

describe("Auswahl aus dem zuletzt Angebotenen", () => {
  const rueckfrage: Kontext = {
    knoten: "rueckfrage",
    topic: null,
    chips: [
      { label: "Wandern & Bergbahnen", to: "wandern" },
      { label: "Winter & Langlauf", to: "winter" },
      { label: "Andere Frage", to: "menu" },
    ],
    istRueckfrage: true,
    angebot: [],
    gruppe: null,
    ziel: null,
  }

  test("„ja“ nimmt den ersten Vorschlag an", () => {
    expect(ziel("ja", rueckfrage)).toBe("wandern")
    expect(ziel("genau", rueckfrage)).toBe("wandern")
  })

  test("„nein“ führt zurück ins Menü", () => {
    expect(ziel("nein", rueckfrage)).toBe("menu")
  })

  test("„ja“ ohne gestellte Rückfrage wählt nichts aus", () => {
    // Sonst würde eine beiläufige Zustimmung in ein zufälliges Thema führen.
    expect(ziel("ja", nach("wandern"))).not.toBe("wandern-leicht")
  })

  test("Auswahl über die Position", () => {
    expect(ziel("das zweite", rueckfrage)).toBe("winter")
    expect(ziel("nummer 1", rueckfrage)).toBe("wandern")
  })

  test("Auswahl über die Beschriftung", () => {
    expect(ziel("leichte tour mit kinderwagen", nach("wandern"))).toBe(
      "wandern-leicht"
    )
  })
})

describe("Rückbezug auf das laufende Thema", () => {
  test("Preisfragen ohne Thema", () => {
    expect(ziel("was kostet das", nach("wandern"))).toBe("bergbahn-preise")
    expect(ziel("wie teuer ist das", nach("anreise"))).toBe("anreise-parken")
  })

  test("Vertiefung ohne Thema", () => {
    expect(ziel("erzähl mir mehr", nach("unterkunft"))).toBe("unterkunft-hof")
    expect(ziel("und weiter", nach("essen"))).toBe("essen-wahl")
  })

  test("Zeitfragen ohne Thema", () => {
    expect(ziel("wann denn", nach("events"))).toBe("events-woche")
  })

  test("ohne Gesprächszustand bleibt der Rückbezug erfolglos", () => {
    // Er soll den Zustand nutzen, nicht ohne ihn raten.
    expect(ziel("was kostet das")).toBeNull()
  })

  test("eine Frage mit eigenem Thema wird nicht als Rückbezug gelesen", () => {
    // "Was kostet die Bergbahn" trägt sein Thema selbst und soll auch im
    // Winterkontext bei der Bergbahn landen.
    expect(ziel("was kostet die bergbahn", nach("winter"))).toBe(
      "bergbahn-preise"
    )
  })
})

describe("Themenzuordnung", () => {
  const faelle: [string, string][] = [
    ["ich suche ein hotel", "unterkunft"],
    ["wo kann ich parken", "anreise-parken"],
    ["gibt es einen wochenmarkt", "events-woche"],
    ["wann ist der biathlon weltcup", "events-biathlon"],
    ["wie ist das wetter morgen", "wetter"],
    ["ich habe hunger", "essen"],
    ["wo kann ich mit dem kinderwagen wandern", "wandern-leicht"],
    ["wickeltisch", "familie-baby"],
    ["gibt es einen skiverleih", "winter-verleih"],
    ["was kostet der loipenpass", "winter-loipe"],
    ["urlaub am bauernhof", "unterkunft-hof"],
    ["barrierefreie unterkunft", "unterkunft-barrierefrei"],
    ["telefonnummer der tourist info", "info"],
    ["gibt es webcams", "wetter-webcam"],
    ["fährt ein bus in den ort", "anreise-bus"],
    ["wie komme ich mit dem zug nach ruhpolding", "anreise"],
    ["welche hütte hat einen spielplatz", "essen-huette"],
    ["haben die gasthäuser einen ruhetag", "essen-ruhetag"],
  ]

  for (const [eingabe, erwartet] of faelle) {
    test(`„${eingabe}“ → ${erwartet}`, () => {
      expect(ziel(eingabe)).toBe(erwartet)
    })
  }

  test("verträgt Vertipper ab einer gewissen Wortlänge", () => {
    expect(ziel("wo kann ich wandren gehen")).toBe("bedarf:i=berge")
    expect(ziel("ich suche ein hotell")).toBe("unterkunft")
    expect(ziel("bergbahen")).toBe("bergbahnen")
  })

  test("verträgt fehlende Umlaute", () => {
    expect(ziel("wo gibt es huetten")).toBe("essen-huette")
    expect(ziel("oeffnungszeiten")).toBe("info")
  })

  test("englische Eingaben landen im selben Thema", () => {
    expect(ziel("where can i go hiking")).toBe("bedarf:i=berge")
    expect(ziel("i am looking for a hotel")).toBe("unterkunft")
    expect(ziel("where can i park")).toBe("anreise-parken")
  })
})

describe("Rückfrage statt Raten", () => {
  test("zwei gleich starke Themen ergeben eine Rückfrage", () => {
    const ergebnis = verstehe("hotel mit restaurant")
    expect(ergebnis.kind).toBe("ambiguous")
  })

  test("ein deutlich stärkeres Thema setzt sich durch", () => {
    // Gegenprobe zum Fall darüber: hier soll gerade nicht gefragt werden.
    // "Mit den Kindern schwimmen" nennt zwar auch das Essen, das Gewicht
    // liegt aber klar bei der Familie.
    expect(ziel("wo kann ich mit den kindern schwimmen und essen")).toBe(
      "bedarf:i=familie,b=kinder"
    )
  })

  test("ein schwacher Hinweis reicht für einen Vorschlag, nicht für eine Antwort", () => {
    const ergebnis = verstehe("gibt es hier eine bahn")
    expect(ergebnis.kind).not.toBe("hit")
  })

  test("völlig Fremdes bleibt ein Fehlschlag und wird nicht gebogen", () => {
    for (const eingabe of [
      "wo finde ich einen zahnarzt",
      "kryptowährung kaufen",
    ]) {
      expect(verstehe(eingabe).kind).toBe("miss")
    }
  })
})

describe("Alle Ziele im Lexikon führen zu einem Knoten", () => {
  // Ein Tippfehler in einer Ziel-ID fiele sonst erst im Gespräch auf, und
  // zwar als Notknoten.
  const eingaben = [
    "wandern",
    "bergbahnen",
    "preise bergbahn",
    "kinderwagen",
    "sonntagshorn",
    "veranstaltungen",
    "biathlon",
    "diese woche",
    "anreise",
    "parken",
    "ortsbus",
    "wetter",
    "webcam",
    "essen",
    "huette",
    "ruhetag",
    "kinder",
    "wickeln",
    "winter",
    "loipe",
    "skiverleih",
    "hotel",
    "bauernhof",
    "barrierefrei",
    "oeffnungszeiten",
    "wo bin ich",
    "was kannst du",
    "was gibt es hier",
    "qr code",
  ]

  for (const eingabe of eingaben) {
    test(`„${eingabe}“ zeigt auf einen vorhandenen Knoten`, () => {
      const ergebnis = verstehe(eingabe)
      if (ergebnis.kind === "hit") {
        expect(existiert(ergebnis.to)).toBe(true)
      } else if (ergebnis.kind === "ambiguous") {
        for (const chip of ergebnis.candidates) {
          expect(existiert(chip.to)).toBe(true)
        }
      }
    })
  }
})

describe("Rückbezug, wenn die Vertiefung schon gelaufen ist", () => {
  test("„ja welche genau“ nach der Aufzählung geht einen Schritt weiter", () => {
    // Im Testlauf kam die Nachfrage, obwohl die Bahnen schon genannt waren.
    // Dieselbe Antwort noch einmal wäre hier die falsche Reaktion.
    const kontext = nach("bergbahnen")
    const wieder = ziel("ja welche genau", kontext)
    expect(wieder).not.toBeNull()
    expect(wieder).not.toBe("bergbahnen")
    expect(existiert(wieder!)).toBe(true)
  })
})

describe("Lieber keine Antwort als die falsche", () => {
  /*
   * Diese Fälle sind beim Durchspielen aufgefallen, nachdem die Zuordnung
   * schon stand. Sie sind der Preis eines toleranten Verfahrens: je mehr
   * eine Eingabe noch erreicht, desto mehr erreicht auch das Falsche.
   *
   * Für die Wirkung im Test ist der falsche Treffer der teurere Fehler. Wer
   * nach einem Leihfahrrad fragt und eine Auskunft über Skiverleih bekommt,
   * hält den Prototyp für dumm. Wer eine Rückfrage bekommt, hält ihn für
   * vorsichtig.
   */
  const fremd = [
    "gibt es hier wlan",
    "wo ist die naechste apotheke",
    "ich brauche einen arzt",
    "gibt es einen geldautomaten",
    "gibt es ein taxi",
    "gibt es hier einen supermarkt",
  ]

  for (const eingabe of fremd) {
    test(`„${eingabe}“ wird nicht zu einer Antwort gebogen`, () => {
      expect(verstehe(eingabe).kind).not.toBe("hit")
    })
  }
})

describe("Bestimmtheit", () => {
  test("dieselbe Eingabe ergibt im selben Zustand immer dasselbe Ziel", () => {
    // Die Anmutung ist die eines Sprachmodells, das Verfahren ist es nicht.
    // Ohne diese Eigenschaft wären zwei Testläufe nicht vergleichbar.
    const kontext = nach("wandern")
    const ergebnisse = new Set<string>()
    for (let i = 0; i < 50; i++) {
      ergebnisse.add(JSON.stringify(verstehe("was kostet das", kontext)))
      ergebnisse.add(JSON.stringify(verstehe("wo kann ich essen", kontext)))
    }
    expect(ergebnisse.size).toBe(2)
  })
})

describe("Die Eingaben aus dem Testlauf vom 03.09., 11:57", () => {
  /*
   * Gesucht war ein QR-Code zur Gondelbahn. Der Prototyp hat dreimal
   * dieselbe Beschreibung der Bergbahnen ausgegeben und zweimal gar nichts
   * gefunden. Der Grund war strukturell: er kannte Antworten, aber keine
   * Orte, und ohne Ort gibt es keine Wegführung.
   */
  test("„wie komme ich zum rauschberg“ führt zur Wegbeschreibung", () => {
    expect(ziel("wie komme ich zum rauschberg", nach("wandern"))).toBe(
      "ziel:rauschberg"
    )
  })

  test("„wie komme ich zu gondelbahn“ meint dasselbe Ziel", () => {
    expect(ziel("wie komme ich zu gondelbahn")).toBe("ziel:rauschberg")
  })

  test("„navigiere mich da hin“ nutzt das zuletzt genannte Ziel", () => {
    // Seit dem 22.09. die Sesselbahn am Unternberg: die Rauschbergbahn
    // fährt nicht, und die Auskunft über die Bahnen führt zur fahrenden.
    expect(ziel("navigiere mich da hin", nach("bergbahnen"))).toBe(
      "ziel:unternberg"
    )
  })

  test("„google maps“ ebenso", () => {
    expect(ziel("google maps", nach("bergbahnen"))).toBe("ziel:unternberg")
  })

  test("„wie komme ich von hier zu gondelbahn“ ebenso", () => {
    expect(ziel("wie komme ich von hier zu gondelbahn")).toBe("ziel:rauschberg")
  })

  test("das Ziel trägt einen QR-Code mit Kartenabfrage", () => {
    const node = getNode("ziel:rauschberg")
    expect(node.qr).toBeDefined()
    expect(node.qr!.url).toContain("google.com/maps")
    expect(node.qr!.title).toContain("Rauschbergbahn")
  })

  test("die Anreise bleibt die Anreise", () => {
    // Auch eine Wegfrage, aber ohne Ziel im Ort: sie darf nicht in der
    // Navigation hängenbleiben.
    expect(ziel("wie komme ich nach ruhpolding")).toBe("anreise")
  })
})

describe("Vorschlagen, auswählen, hinführen", () => {
  test("eine allgemeine Frage führt zu Vorschlägen oder zur Klärung", () => {
    // Touren und Kinder hängen an Kondition, Begleitung und Wetter, dort wird
    // erst gefragt. Beim Essen fragt sie nach der Küche.
    expect(ziel("welche wandertouren kann ich machen")).toBe("bedarf:i=berge")
    expect(ziel("was kannst du empfehlen zum essen")).toBe("essen-wahl")
    expect(ziel("hast du tipps für kinder")).toBe("bedarf:i=familie,b=kinder")
  })

  test("eine konkrete Frage bleibt konkret", () => {
    // Die Vorschlagsliste ist für den, der noch nicht weiß, was er will.
    // Wer nach den Bergbahnen fragt, weiß es.
    expect(ziel("welche bergbahnen gibt es")).toBe("bergbahnen")
    expect(ziel("was kostet der loipenpass")).toBe("winter-loipe")
  })

  test("der Vorschlag nennt drei Ziele und hebt keines hervor", () => {
    // Die Auszeichnung "beliebtester" war erfunden und stellte ein Angebot
    // über ein anderes (M [00:43:01]).
    const node = getNode("empfehlung:wandern:0", "de", MITTAGS)
    expect(node.angebot).toHaveLength(3)
    // Einleitung, drei Vorschläge, Abschluss.
    expect(node.messages).toHaveLength(5)
    const text = node.messages.flat().join("\n")
    expect(text).not.toContain("★")
    expect(text).toContain("1 · ")
    expect(text).toContain("3 · ")
  })

  test("ein Ziel lässt sich in eigenen Worten wählen", () => {
    const vorschlag = nach("empfehlung:wandern:0")
    expect(ziel("ich würde gern auf den rauschberg", vorschlag)).toBe(
      "ziel:rauschberg"
    )
    expect(ziel("das mit dem see klingt gut", vorschlag)).toBe(
      "ziel:taubensee"
    )
    // Die erste Runde nennt nur leichte Wege. Die Bitte um etwas Schweres
    // führt deshalb zur anspruchsvollen Tour, nicht zu einem der drei.
    expect(ziel("lieber etwas anspruchsvolles", vorschlag)).toBe(
      "wandern-schwer"
    )
  })

  test("ein Ziel lässt sich auch über die Position wählen", () => {
    expect(ziel("die zweite", nach("empfehlung:wandern:0"))).toBe(
      "ziel:taubensee"
    )
  })

  test("die zweite Seite zählt mit ihren gedruckten Nummern weiter", () => {
    // Dort steht "4 ·" ganz oben. Im Testlauf vom 17.09. blieben "4" und "3"
    // ohne Treffer, obwohl eine Liste auf dem Schirm stand.
    const seite2 = nach("empfehlung:hier:3")
    expect(seite2.angebot).toEqual(["freizeitpark", "sagenweg", "heimatmuseum"])
    expect(ziel("4", seite2)).toBe("ziel:freizeitpark")
    expect(ziel("nummer 5", seite2)).toBe("ziel:sagenweg")
    expect(ziel("ich nehme die 6", seite2)).toBe("ziel:heimatmuseum")
    // Ein Ordnungswort zählt dagegen ab dem obersten Vorschlag.
    expect(ziel("die erste", seite2)).toBe("ziel:freizeitpark")
  })

  test("eine Nummer, die nicht dasteht, wird nicht geraten", () => {
    const seite2 = nach("empfehlung:hier:3")
    // Die Liste zeigt 4, 5, 6. Eine "3" gibt es dort nicht mehr.
    expect(ziel("3", seite2)).toBeNull()
    expect(ziel("7", nach("empfehlung:hier:0"))).toBeNull()
  })

  test("Zahlen ohne Liste und Zahlen im Satz wählen nichts aus", () => {
    // Die Schaltflächen im Menü tragen keine Nummern, dort wäre jede Zahl
    // geraten. Und wer die Gruppengröße nennt, wählt nicht aus.
    expect(ziel("3", nach("menu"))).toBeNull()
    expect(ziel("wir sind 4 personen", nach("empfehlung:hier:0"))).toBeNull()
  })

  test("„was sonst“ rückt die Liste weiter", () => {
    // Blieb im Testlauf vom 17.09. ohne Treffer.
    expect(ziel("was sonst", nach("empfehlung:hier:0"))).toBe(
      "empfehlung:hier:3"
    )
    expect(ziel("sonst noch was", nach("empfehlung:hier:0"))).toBe(
      "empfehlung:hier:3"
    )
    expect(ziel("zeig mir mehr", nach("empfehlung:hier:0"))).toBe(
      "empfehlung:hier:3"
    )
    expect(ziel("what else", nach("empfehlung:hier:0"))).toBe(
      "empfehlung:hier:3"
    )
  })

  test("„gibt es auch andere“ rückt die Liste weiter", () => {
    expect(ziel("gibt es auch andere", nach("empfehlung:wandern:0"))).toBe(
      "empfehlung:wandern:3"
    )
    expect(ziel("nichts dabei", nach("empfehlung:familie:0"))).toBe(
      "empfehlung:familie:3"
    )
  })

  test("sind die Vorschläge erschöpft, wird das gesagt", () => {
    // Nicht eine leere Liste ausgeben, sondern eine Absage.
    const node = getNode("empfehlung:winter:3", "de", MITTAGS)
    expect(node.messages.length).toBeGreaterThan(0)
    expect(node.angebot?.length).toBeGreaterThan(0)
  })

  test("die Auswahl führt zu einem Ziel mit QR-Code", () => {
    for (const gruppe of ["wandern", "familie", "essen", "winter", "hier"]) {
      const node = getNode(`empfehlung:${gruppe}:0`, "de", MITTAGS)
      for (const id of node.angebot ?? []) {
        const zielNode = getNode(`ziel:${id}`, "de", MITTAGS)
        expect(zielNode.id).toBe(`ziel:${id}`)
        expect(zielNode.qr?.url).toContain("google.com/maps")
      }
    }
  })

  test("ein Vorschlag wiederholt sich innerhalb einer Gruppe nicht", () => {
    const gesehen: string[] = []
    for (let ab = 0; ab < 9; ab += 3) {
      const node = getNode(`empfehlung:wandern:${ab}`, "de", MITTAGS)
      // Die Absage am Ende nennt die bisherigen noch einmal, sie zählt nicht.
      if (!node.chips?.some((chip) => chip.label === "Andere Frage")) continue
      if (node.messages.flat().join(" ").includes("Mehr habe ich")) continue
      if (node.messages.flat().join(" ").includes("Das waren alle")) continue
      gesehen.push(...(node.angebot ?? []))
    }
    expect(new Set(gesehen).size).toBe(gesehen.length)
  })
})

describe("Wegführung ohne Ziel", () => {
  test("stehen mehrere zur Wahl, wird nachgefragt statt gegriffen", () => {
    const ergebnis = verstehe(
      "wie komme ich da hin",
      nach("empfehlung:wandern:0")
    )
    expect(ergebnis.kind).toBe("ambiguous")
  })

  test("ohne jeden Anhaltspunkt erklärt der Bot den QR-Code", () => {
    expect(ziel("qr code")).toBe("qr-hinweis")
  })
})

describe("Der Faden reißt nach einer Auswahl nicht ab", () => {
  test("„gibt es auch andere“ setzt die Runde fort, statt neu zu beginnen", () => {
    // Nach einem gewählten Ziel aus der ersten Runde muss die zweite folgen.
    // Wieder bei den ersten dreien anzufangen, wäre die Antwort auf eine
    // Frage, die gerade nicht gestellt wurde.
    expect(ziel("gibt es auch andere", nach("ziel:taubensee"))).toBe(
      "empfehlung:wandern:3"
    )
  })

  test("nach einer Auswahl bleibt das Ziel für die Wegfrage stehen", () => {
    expect(ziel("navigiere mich dahin", nach("ziel:foerchensee"))).toBe(
      "ziel:foerchensee"
    )
  })
})

describe("Die Eingaben aus dem Testlauf vom 03.09., 12:30", () => {
  test("„wo kann ich was essen gehen“ fragt nach der Küche", () => {
    // Vorher: der Themeneinstieg mit einer Aufzählung im Fließtext, danach
    // eine Liste, in der Almen und Gasthäuser gemischt standen.
    expect(ziel("wo kann ich was essen gehen")).toBe("essen-wahl")
  })

  test("„pizza“ meint ein Lokal, nicht das Thema Essen", () => {
    // Bis 24.09.2026 die Pizzeria Made in Italy. Die ist laut Google Maps
    // dauerhaft geschlossen und wird nicht mehr vorgeschlagen.
    expect(ziel("pizza")).toBe("ziel:pizza-co")
  })

  test("ein Lokal beim Namen genannt führt zum Lokal", () => {
    expect(ziel("wo ist die pizzeria eiscafe made in italy")).toBe(
      "ziel:pizzeria"
    )
  })

  test.each([
    ["restaurant maiers", "ziel:maiers"],
    ["ruhpoldinger hof", "ziel:ruhpoldinger-hof"],
    ["berggasthaus weingarten", "ziel:weingarten"],
    ["pizza & co", "ziel:pizza-co"],
    ["gibt es ein indisches restaurant", "ziel:safran"],
    ["beim häusler", "ziel:haeusler"],
    ["butz'n wirt", "ziel:butznwirt"],
  ])("„%s“ führt zum Lokal aus der Gastronomieliste", (text, erwartet) => {
    expect(ziel(text)).toBe(erwartet)
  })

  test("die Essensantworten sagen, dass nicht alle Restaurants bekannt sind", () => {
    const hinweis = /nicht alle Restaurants[^]*gaststaetten-und-restaurants/
    for (const id of ["essen", "essen-wahl", "empfehlung:essen-regional:0"]) {
      expect(JSON.stringify(getNode(id, "de", MITTAGS).messages)).toMatch(
        hinweis
      )
    }
  })
})

describe("Systemprüfung vom 24.09.2026", () => {
  test.each([
    [
      "gibt es ein restaurant mit bayerischer küche",
      "empfehlung:essen-regional:0",
    ],
    ["welche restaurants haben montag ruhetag", "essen-ruhetag"],
    ["museum", "empfehlung:museen:0"],
    ["welche museen gibt es", "empfehlung:museen:0"],
    ["was ist heute los", "events-woche"],
    ["tschüss", "abschied"],
  ])("„%s“ → %s", (text, erwartet) => {
    expect(ziel(text)).toBe(erwartet)
  })
})

describe("Essen im Ort, Testlauf vom 23.09.2026", () => {
  test.each(["was gibt es im ort zum essen", "was kann ich hier im ort essen"])(
    "„%s“ fragt nach der Küche, ohne Almen",
    (text) => {
      expect(ziel(text, nach("start"))).toBe("essen-wahl-ort")
      const chips = getNode("essen-wahl-ort").chips ?? []
      expect(chips.some((chip) => chip.to === "empfehlung:almen:0")).toBe(false)
    }
  )

  test("der Almenhinweis erscheint nicht, wenn jemand im Ort essen will", () => {
    const almen = (id: string) =>
      offeneMeldungen(getNode(id, "de", MITTAGS), "sonne", new Set()).some(
        (meldung) => meldung.id === "almen"
      )
    expect(almen("essen-wahl")).toBe(true)
    expect(almen("essen-wahl-ort")).toBe(false)
    expect(almen("empfehlung:essen-regional:0")).toBe(false)
    expect(almen("empfehlung:almen:0")).toBe(true)
  })

  test("„gibt es mehr?“ nach der Liste, danach „1“", () => {
    const liste = nach("empfehlung:essen-international:0")
    expect(ziel("gibt es mehr", liste)).toBe("empfehlung:essen-international:3")
    const ende = nach("empfehlung:essen-international:3")
    expect(ziel("Gibt es mehr?", ende)).toBe("empfehlung:essen-international:3")
    expect(ziel("1", ende)).toBe("ziel:safran")
  })

  test("die Restaurants im Ort enthalten keine Alm", () => {
    for (const gruppe of Object.keys(GRUPPEN).filter((id) =>
      id.startsWith("essen")
    )) {
      for (const id of GRUPPEN[gruppe].ziele) {
        expect(ZIELE.find((eintrag) => eintrag.id === id)?.flyer).not.toBe(
          "almsommer"
        )
      }
    }
  })

  test.each([
    ["wo kann ich italienisch essen", "empfehlung:essen-italienisch:0"],
    ["ich suche was bayerisches", "empfehlung:essen-regional:0"],
    ["wo gibt es vegetarisches essen", "empfehlung:essen-vegetarisch:0"],
    ["wo kann ich auf der alm essen", "empfehlung:almen:0"],
  ])("„%s“ führt direkt zur Küche", (text, erwartet) => {
    expect(ziel(text)).toBe(erwartet)
  })

  test("„welche buslinien gibt es“ wird beantwortet", () => {
    expect(ziel("welche buslinien gibt es")).toBe("anreise-bus")
  })

  test("„wie ist der fahrplan dieser linien“ zeigt das Busnetz", () => {
    // Vorher: miss. Die Frage ist ein Rückbezug, das Thema steht im Gespräch.
    expect(
      ziel("wie ist der fahrplan dieser linien", nach("anreise-bus"))
    ).toBe("busnetz")
  })

  test("das Ziel klebt nicht über einen Themenwechsel hinweg", () => {
    /*
     * Der schwerste Fehler des Laufs: Nach einer Frage zum Parken hing das
     * Ziel "Rathaus Tiefgarage" am Gespräch, überlebte drei Themenwechsel und
     * beantwortete dann "wie komme ich nach Traunstein" mit dem Weg zur
     * Garage. Ein Bezug, der sein Thema überlebt, ist kein Bezug mehr.
     */
    const nachParken: Kontext = {
      ...nach("anreise-parken"),
      ziel: "rathausgarage",
    }
    expect(ziel("wie komme ich nach traunstein", nachParken)).toBe(
      "fahrplan:traunstein"
    )
  })
})

describe("Fahrpläne", () => {
  test("Fernziele führen zur Fahrplantabelle, nicht zu einem Parkplatz", () => {
    expect(ziel("wie komme ich nach traunstein")).toBe("fahrplan:traunstein")
    expect(ziel("wie komme ich nach salzburg")).toBe("fahrplan:salzburg")
    expect(ziel("wann kommt die nächste bahn nach traunstein")).toBe(
      "fahrplan:traunstein"
    )
    expect(ziel("zug nach münchen")).toBe("fahrplan:muenchen")
  })

  test("die Anreise von außerhalb bleibt die Anreise", () => {
    // Auch eine Fahrfrage, aber in die andere Richtung.
    expect(ziel("wie komme ich mit dem zug nach ruhpolding")).toBe("anreise")
  })

  test("die Tabelle nennt drei Abfahrten mit Ab, An und Linie", () => {
    const node = getNode("fahrplan:traunstein")
    expect(node.table).toBeDefined()
    expect(node.table!.rows).toHaveLength(3)
    expect(node.table!.columns.slice(0, 3)).toEqual(["Ab", "An", "Linie"])
    // Die nächste Abfahrt ist die Antwort und wird hervorgehoben.
    expect(node.table!.highlight).toBe(0)
    for (const zeile of node.table!.rows) {
      expect(zeile[0]).toMatch(/^\d{2}:\d{2}/)
      expect(zeile[1]).toMatch(/^\d{2}:\d{2}$/)
    }
  })

  test("eine Verbindung mit Umstieg nennt den Umstieg", () => {
    const node = getNode("fahrplan:salzburg")
    expect(node.table!.columns).toContain("Umstieg")
    expect(node.table!.rows[0].at(-1)).toContain("Traunstein")
  })

  test("die Fußnote weist die Grenze der Daten aus", () => {
    // Der gedruckte Fahrplan unterscheidet Verkehrstage, der Prototyp nicht.
    // Das darf nicht verschwiegen werden.
    expect(getNode("fahrplan:traunstein").table!.note).toMatch(/RB 53/)
    expect(getNode("fahrplan:traunstein").table!.note).toMatch(/brb\.de/)
  })

  test("das Busnetz nennt Strecken und verschweigt den fehlenden Takt nicht", () => {
    const node = getNode("busnetz")
    expect(node.table!.rows.map((zeile) => zeile[0])).toContain("9532")
    expect(node.table!.note).toMatch(/kein Takt veröffentlicht/)
  })
})

describe("Zeitbewusstsein", () => {
  test("die nächsten Abfahrten richten sich nach der Uhrzeit", () => {
    const morgens = naechsteAbfahrten(
      verbindung("traunstein")!,
      zeitpunkt(7, 0)
    )
    expect(morgens[0].fahrt.ab).toBe("07:14")
    expect(morgens.map((e) => e.fahrt.ab)).toEqual(["07:14", "08:14", "09:14"])
  })

  test("nach der letzten Abfahrt wird auf morgen verwiesen", () => {
    // Eine leere Tabelle wäre die schlechtere Auskunft: wer um 23:30 fragt,
    // will wissen, dass der erste Zug um 6:14 fährt.
    const nachts = naechsteAbfahrten(
      verbindung("traunstein")!,
      zeitpunkt(23, 30)
    )
    expect(nachts).toHaveLength(3)
    expect(nachts[0].morgen).toBe(true)
    expect(nachts[0].fahrt.ab).toBe("06:14")
  })

  test("der Umstieg lässt genug Zeit zum Umsteigen", () => {
    for (const fahrt of verbindung("salzburg")!.abfahrten) {
      const [, ankunft] = fahrt.umstieg!.match(/an (\d{2}:\d{2})/)!
      expect(minuten(fahrt.an) - minuten(ankunft)).toBeGreaterThanOrEqual(6)
    }
  })

  test("Öffnungszeiten werden zur Uhrzeit in Bezug gesetzt", () => {
    const bahn = { von: "10:00", bis: "18:00", letzterEinlass: "17:30" }
    expect(status(bahn, zeitpunkt(8, 0))).toBe("zu")
    expect(status(bahn, zeitpunkt(9, 30))).toBe("gleich")
    expect(status(bahn, zeitpunkt(12, 0))).toBe("offen")
    expect(status(bahn, zeitpunkt(17, 0))).toBe("bald_zu")
    expect(status(bahn, zeitpunkt(19, 0))).toBe("zu")
  })

  test("ohne belegte Öffnungszeit wird nichts behauptet", () => {
    // Eine geratene Öffnungszeit ist die schädlichste Falschauskunft: nach
    // ihr geht jemand los.
    expect(status(undefined, zeitpunkt(12, 0))).toBeNull()
    expect(statusText(undefined, zeitpunkt(12, 0))).toBeNull()
  })

  test("ohne belegte Öffnungszeit nennt der Vorschlag keinen Öffnungsstand", () => {
    // Die Sommerzeiten des Unternbergs enden am 14.09., für die übrigen
    // Ziele gibt es keine belegten Zeiten. Ein "Jetzt geöffnet" wäre geraten.
    const mittags = getNode("empfehlung:wandern:0", "de", zeitpunkt(12, 0))
    expect(mittags.messages.flat().join("\n")).not.toContain("Jetzt geöffnet")
  })

  test("ein Tagesausflug sagt am Abend, dass er heute nicht mehr passt", () => {
    // Neun Stunden Gehzeit passen um acht Uhr abends in keinen Tag mehr.
    // Die Liste ist seit der Bereinigung zu kurz, um ihn nach hinten zu
    // schieben, also sagt er es selbst.
    const morgens = getNode("empfehlung:gipfel:0", "de", zeitpunkt(9, 0))
    expect(morgens.messages.flat().join("\n")).not.toContain("zu spät")
    // Abends rutschen die Tagestouren nach hinten und sagen, warum.
    const abends = getNode("empfehlung:gipfel:0", "de", zeitpunkt(20, 0))
    expect(abends.angebot).not.toContain("hochfelln")
    const spaeter = getNode("empfehlung:gipfel:3", "de", zeitpunkt(20, 0))
    expect(spaeter.messages.flat().join("\n")).toContain("Für heute zu spät")
  })

  test("die Einleitung greift die Uhrzeit auf", () => {
    const text = getNode("empfehlung:hier:0", "de", zeitpunkt(20, 15))
      .messages.flat()
      .join("\n")
    expect(text).toContain("20:15")
  })
})

describe("Elliptische Nachfragen zum Fahrplan", () => {
  test("„und nach salzburg“ nach einer Fahrplanauskunft", () => {
    // Im Browser aufgefallen: die Nachfrage enthält kein Fragewort mehr, der
    // Bezug steht ausschließlich in der vorigen Antwort.
    expect(ziel("und nach salzburg", nach("fahrplan:traunstein"))).toBe(
      "fahrplan:salzburg"
    )
  })

  test("ein Fernziel allein genügt", () => {
    // Ein Ort zwei Landkreise weiter wird nur genannt, wenn jemand hinwill.
    expect(ziel("salzburg")).toBe("fahrplan:salzburg")
    expect(ziel("traunstein")).toBe("fahrplan:traunstein")
  })

  test("ein starkes Thema schlägt die bloße Ortsnennung", () => {
    expect(ziel("biathlon")).toBe("events-biathlon")
  })
})

/**
 * Vollständigkeit der englischen Fassung.
 *
 * Anlass ist der Testlauf vom 17.09.2026: nach dem Umschalten auf Englisch
 * standen deutsche Schaltflächen unter englischen Antworten, und jeder
 * Unterknoten eines Themas antwortete mit dem Hinweis, die Auskunft liege
 * nur auf Deutsch vor. Ein englischsprachiger Gast bekam damit ein anderes
 * Gerät als ein deutschsprachiger.
 *
 * Diese Tests laufen über den ganzen Baum statt über einzelne Beispiele.
 * Ein neuer Knoten ohne englische Fassung fällt dadurch beim Anlegen auf und
 * nicht erst im nächsten Testlauf mit einer Person davor.
 */
describe("Die englische Fassung ist vollständig", () => {
  const MITTAG = zeitpunkt(12, 0)

  /**
   * Namen, die auch im englischen Text deutsch bleiben, weil sie so heißen.
   *
   * Sie werden vor der Prüfung aus dem Text geschnitten. Den Wortfilter
   * stattdessen zu lockern hieße, "zur" und "für" ganz zu erlauben, und
   * genau die stecken in den Sätzen, um die es geht.
   */
  const EIGENNAMEN = [
    GASTRONOMIE.gasthausPost,
    GASTRONOMIE.pizzeria,
    ANREISE.gaestekarteName,
    ANREISE.dorflinie9532,
    ANREISE.dorflinie9533,
    WANDERN.sonntagshornStart,
    EVENTS.biathlonName,
    "Grüß Gott",
    // Die Adresse der Gastronomieliste, im Hinweis zu den Restaurants.
    "ruhpolding.de/gaststaetten-und-restaurants",
  ]

  const ohneNamen = (text: string) =>
    EIGENNAMEN.reduce((rest, name) => rest.split(name).join(" "), text)

  /**
   * Deutsche Funktionswörter. Nach dem Abzug der Eigennamen hat keines von
   * ihnen mehr einen legitimen Platz in einem englischen Satz.
   */
  const DEUTSCHE_WOERTER =
    /\b(und|oder|der|die|das|den|dem|des|mit|von|zur|zum|für|ist|sind|nicht|hier|gibt|kann|kannst|auch|noch|ein|eine|einen|einem|täglich|geöffnet|geschlossen|Uhr|Stunden|Minuten|Gehminuten|Zurück|Thema|Andere|Frage|Welche|Übernachten|Hütten|Talstation|Kinderwagen|Bergbahnen|Parkplatz|Wanderparkplatz)\b/

  /** Deutsch im Text, nachdem die Eigennamen abgezogen sind? */
  const istDeutsch = (text: string) => DEUTSCHE_WOERTER.test(ohneNamen(text))

  /** Jede Knoten-ID, die im Gespräch erreichbar ist. */
  function alleKnoten(): string[] {
    return [
      ...Object.keys(FLOW),
      ...ZIELE.map((ziel) => `ziel:${ziel.id}`),
      ...Object.keys(GRUPPEN).flatMap((gruppe) =>
        [0, 3, 6].map((ab) => `empfehlung:${gruppe}:${ab}`)
      ),
      "fahrplan:traunstein",
      "fahrplan:salzburg",
    ]
  }

  /** Den Knoten so holen, wie der Hook ihn ausgibt. */
  function englisch(id: string) {
    const roh = getNode(id, "en", MITTAG)
    return roh.fertig ? roh : uebersetze(roh, "en")
  }

  test("jeder Knoten hat eine englische Fassung", () => {
    const ohne = alleKnoten().filter((id) => {
      const node = englisch(id)
      if (node.id === "notknoten") return false
      return node.messages.flat().join(" ").includes(NUR_DEUTSCH)
    })
    expect(ohne).toEqual([])
  })

  test("keine Schaltfläche bleibt deutsch", () => {
    const deutsch: string[] = []
    for (const id of alleKnoten()) {
      const node = englisch(id)
      for (const chip of node.chips ?? []) {
        if (istDeutsch(chip.label)) {
          deutsch.push(`${id}: "${chip.label}"`)
        }
      }
    }
    expect(deutsch).toEqual([])
  })

  test("kein Antworttext bleibt deutsch", () => {
    const deutsch: string[] = []
    for (const id of alleKnoten()) {
      const node = englisch(id)
      for (const text of [
        ...node.messages.flat(),
        ...(node.kurz?.flat() ?? []),
      ])
        if (istDeutsch(text)) deutsch.push(`${id}: ${text}`)
    }
    expect(deutsch).toEqual([])
  })

  test("Karten und Tabellen tragen englische Beschriftungen", () => {
    const deutsch: string[] = []
    for (const id of alleKnoten()) {
      const node = englisch(id)
      if (node.card) {
        const text = [
          node.card.title,
          ...node.card.rows.map((zeile) => zeile.label),
          node.card.note ?? "",
        ].join(" | ")
        if (istDeutsch(text)) deutsch.push(`${id} card: ${text}`)
      }
      if (node.table) {
        const text = [...node.table.columns, node.table.note ?? ""].join(" | ")
        if (istDeutsch(text)) deutsch.push(`${id} table: ${text}`)
      }
    }
    expect(deutsch).toEqual([])
  })

  test("die zur Laufzeit gebauten Knoten antworten englisch", () => {
    // Rückfrage und Fallback bauen ihren Text selbst in beiden Sprachen und
    // dürfen deshalb nicht durch uebersetze() laufen. Fehlte ihnen das
    // Kennzeichen "fertig", stellte die Übersetzung ihnen den Hinweis voran,
    // die Auskunft liege nur auf Deutsch vor, mitten in einer englischen
    // Nachfrage. Genau das trat im Testlauf vom 17.09. auf.
    const gebaut = [
      fallbackKnoten("hund", "en"),
      fallbackKnoten("xyzabc", "en"),
      rueckfrageKnoten(
        [
          {
            label: "Wandern & Bergbahnen",
            to: "bergbahn-preise",
            topic: "wandern",
          },
          { label: "Winter & Langlauf", to: "winter-loipe", topic: "winter" },
        ],
        "prices",
        "en"
      ),
    ]

    for (const node of gebaut) {
      expect(node.fertig).toBe(true)
      const text = node.messages.flat().join(" ")
      expect(text).not.toContain(NUR_DEUTSCH)
      expect(istDeutsch(text)).toBe(false)
      for (const chip of node.chips ?? []) {
        expect(istDeutsch(chip.label)).toBe(false)
      }
    }
  })

  test("die Rückfrage nennt die Themen auf Englisch", () => {
    // Das Ziel eines Kandidaten führt oft auf einen Unterknoten, aus dessen
    // ID sich das Thema nicht ablesen lässt. Vorher blieb die Rückfrage
    // deshalb bei den deutschen Themennamen stehen.
    const node = rueckfrageKnoten(
      [
        {
          label: "Wandern & Bergbahnen",
          to: "bergbahn-preise",
          topic: "wandern",
        },
        { label: "Winter & Langlauf", to: "winter-loipe", topic: "winter" },
      ],
      "prices",
      "en"
    )
    const text = node.messages.flat().join(" ")
    expect(text).toContain("hiking and the mountain lifts")
    expect(text).toContain("winter and cross-country skiing")
    expect(node.chips?.map((chip) => chip.label)).toEqual([
      "Hiking & mountain lifts",
      "Winter & cross-country",
      "Something else",
    ])
  })

  test("beide Sprachen bieten dieselben Wege an", () => {
    // Nicht der Wortlaut zählt, sondern die Struktur: gleich viele Antworten
    // und dieselben Schaltflächen mit denselben Zielen. Fiele auf Englisch
    // eine Schaltfläche weg, käme ein englischsprachiger Gast an eine Stelle
    // im Baum nicht heran, an die ein deutschsprachiger kommt.
    const abweichungen: string[] = []
    for (const id of alleKnoten()) {
      const de = getNode(id, "de", MITTAG)
      const en = englisch(id)
      if (de.id === "notknoten") continue

      if (de.messages.length !== en.messages.length) {
        abweichungen.push(
          `${id}: ${de.messages.length} Antworten de, ${en.messages.length} en`
        )
      }
      const ziele = (node: typeof de) => (node.chips ?? []).map((c) => c.to)
      if (ziele(de).join(",") !== ziele(en).join(",")) {
        abweichungen.push(
          `${id}: Schaltflächen de [${ziele(de)}] vs en [${ziele(en)}]`
        )
      }
      if (Boolean(de.card) !== Boolean(en.card)) {
        abweichungen.push(`${id}: Karte nur in einer Sprache`)
      }
      if (Boolean(de.table) !== Boolean(en.table)) {
        abweichungen.push(`${id}: Tabelle nur in einer Sprache`)
      }
      if (Boolean(de.qr) !== Boolean(en.qr)) {
        abweichungen.push(`${id}: QR-Code nur in einer Sprache`)
      }
    }
    expect(abweichungen).toEqual([])
  })

  test("die englischen Datenfelder nennen dieselben Zahlen wie die deutschen", () => {
    // Der Kern der Sache: eine Preisangabe darf nicht in einer Sprache
    // veralten und in der anderen stehenbleiben.
    //
    // Geprüft wird die Datenschicht, nicht der fertige Satz: die Antworten
    // ziehen aus Variantenlisten, zwei Aufrufe ergeben also nicht zwingend
    // denselben Text. Die Zahl dagegen steht fest, und jedes Feld "xEn" ist
    // die Übersetzung genau des Feldes "x" daneben.
    //
    // Uhrzeiten sind ausgenommen: "9:30 Uhr" und "9.30 am" sind dieselbe
    // Zeit in der jeweils üblichen Schreibweise.
    const bloecke: Record<string, Record<string, string>> = {
      TOURIST_INFO,
      BERGBAHNEN,
      WANDERN,
      PARKEN,
      ANREISE,
      WINTER,
      EVENTS,
      GASTRONOMIE,
      FAMILIE,
    }
    const zahlen = (text: string) =>
      (text.match(/\d+(?:[.,]\d+)?\s*(?:€|km|m\b|%)/g) ?? [])
        .map((treffer) => treffer.replace(/\s+/g, " "))
        .sort()

    const abweichungen: string[] = []
    for (const [name, block] of Object.entries(bloecke)) {
      for (const [feld, wert] of Object.entries(block)) {
        if (!feld.endsWith("En")) continue
        const deutsch = block[feld.slice(0, -2)]
        if (typeof deutsch !== "string" || typeof wert !== "string") continue
        const a = zahlen(deutsch)
        const b = zahlen(wert)
        if (a.join(",") !== b.join(",")) {
          abweichungen.push(`${name}.${feld}: de [${a}] vs en [${b}]`)
        }
      }
    }
    expect(abweichungen).toEqual([])
  })
})
