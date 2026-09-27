/**
 * Zeigt ein exportiertes Interaktionsprotokoll als Weg durch das Flowchart
 * "Ablauf einer Anfrage" (Bachelorarbeit, figures/ablauf-einer-anfrage.pdf).
 *
 *   bun run scripts/ablauf.ts ~/Downloads/protokoll-2026-09-27-1001.json
 *
 * Je Nutzeraktion steht da, welche Schritte sie durchlaufen hat und mit
 * welchem Ergebnis. Das Skript liest nur, was im Protokoll steht, und bewertet
 * nichts: ob eine erkannte Antwort inhaltlich passte, zeigt erst die Aufnahme.
 *
 * Liest Protokolle der Version 1 und 2. Was in Version 1 fehlt, steht als
 * "unbekannt" da.
 */

type Eintrag = {
  t: number
  art: string
  text?: string
  treffer?: "hit" | "ambiguous" | "miss"
  grund?: string
  knoten?: string
  ziel?: string
  kandidaten?: string[]
  term?: string | null
  lauf?: number
  sprache?: string
  wetter?: string
  bauart?: "baum" | "situativ"
  kurz?: boolean
}

/** Die Stufe der Zuordnung, in Worten. Siehe Grund in verstehen.ts. */
const GRUND: Record<string, string> = {
  meta: 'Frage an das Gerät selbst (Gruß, Dank, Menü, "was kannst du")',
  lexikon: "Stichwort aus der Wissensbasis",
  anapher: 'Rückbezug auf das laufende Thema ("was kostet das")',
  auswahl: 'Auswahl aus dem gerade Angebotenen ("ja", "das zweite")',
  zielwahl: "Ziel aus den Vorschlägen gewählt",
  empfehlung: "Vorschlagsliste zu einem Thema",
  bedarf: "Bedarfsklärung (Gegenfrage nach Interessen)",
  navigation: "Weg zu einem Ziel",
  fahrplan: "Verbindung nach auswärts",
  dienst: "Service-Frage (Hinweise, Dienste, Ziele außerhalb)",
  zettel: "Notizen",
  wiederholung: "Bitte um Wiederholung",
}

const RUECKFRAGE: Record<string, string> = {
  rueckfrage: "allgemeine Rückfrage mit den nächstliegenden Themen",
  "rueckfrage-mehrdeutig": "Rückfrage, welches Thema gemeint ist",
  "rueckfrage-kontext":
    "Rückfrage im laufenden Ablauf, Optionen bleiben stehen",
}

function alsDauer(ms: number): string {
  const sekunden = Math.floor(ms / 1000)
  const zahl = (wert: number) => String(wert).padStart(2, "0")
  return [
    Math.floor(sekunden / 3600),
    Math.floor(sekunden / 60) % 60,
    sekunden % 60,
  ]
    .map(zahl)
    .join(":")
}

const zeile = (schritt: string, ergebnis: string) =>
  console.log(`   ${schritt.padEnd(30)}${ergebnis}`)

const DEUTSCH = { timeZone: "Europe/Berlin" } as const

const dateien = process.argv.slice(2)
if (dateien.length === 0) {
  console.error("Aufruf: bun run scripts/ablauf.ts <protokoll.json> …")
  process.exit(1)
}

for (const datei of dateien) {
  const roh = JSON.parse(await Bun.file(datei).text())
  const eintraege: Eintrag[] = roh.eintraege ?? roh
  const version = roh.protokollVersion ?? 1
  const fertig = new Set(
    eintraege.filter((e) => e.art === "fertig").map((e) => e.lauf)
  )

  // Version 1 hat keinen Start im Kopf, er ergibt sich aus Export und Dauer.
  const start = new Date(
    roh.gestartet ?? Date.parse(roh.erzeugt) - (roh.dauerMs ?? 0)
  )
  console.log(`\n${datei}`)
  console.log(
    `Version ${version}, Build ${roh.build ?? "unbekannt"}, ` +
      `${start.toLocaleDateString("de-DE", { ...DEUTSCH, day: "2-digit", month: "2-digit", year: "numeric" })} ` +
      `${start.toLocaleTimeString("de-DE", DEUTSCH)}, ` +
      `Dauer ${alsDauer(roh.dauerMs ?? 0)}\n`
  )

  const zaehler = {
    aktionen: 0,
    chip: 0,
    freitext: 0,
    erkannt: 0,
    mehrdeutig: 0,
    nichtErkannt: 0,
    rueckfragen: 0,
    baum: 0,
    situativ: 0,
    vorzeitig: 0,
  }

  /** Die Antwort, die auf den Eintrag an Stelle i folgt, vor der nächsten Aktion. */
  const antwortNach = (i: number): Eintrag | undefined => {
    for (const e of eintraege.slice(i + 1)) {
      if (e.art === "antwort") return e
      if (e.art === "eingabe" || e.art === "chip" || e.art === "reset") return
    }
  }

  const ausgabe = (antwort: Eintrag) => {
    if (antwort.lauf === undefined) return "unbekannt (Protokoll Version 1)"
    if (fertig.has(antwort.lauf)) return "vollständig"
    // Die letzte Antwort kann beim Export noch laufen.
    if (antwort === eintraege.at(-1)) return "lief noch beim Export"
    zaehler.vorzeitig++
    return "vorzeitig weitergeschrieben (Antwort nicht zu Ende ausgegeben)"
  }

  const antwortTeil = (antwort: Eintrag | undefined) => {
    if (!antwort) {
      zeile("Ausgabe", "keine neue Antwort")
      return
    }
    zeile("Antwort bestimmen", antwort.knoten ?? "unbekannt")
    if (antwort.bauart) {
      zaehler[antwort.bauart]++
      zeile(
        "Antwort vorformuliert?",
        antwort.bauart === "baum"
          ? "ja, Text aus dem Dialogbaum"
          : `nein, situativ zusammengestellt (Wetter ${antwort.wetter})`
      )
    }
    const anpassung = [
      antwort.sprache === "en" ? "Englisch" : antwort.sprache ? "Deutsch" : "",
      antwort.kurz ? "Kurzfassung (schon einmal gezeigt)" : "",
    ].filter(Boolean)
    if (anpassung.length > 0) zeile("sprachlich anpassen", anpassung.join(", "))
    zeile("Ausgabe", ausgabe(antwort))
  }

  eintraege.forEach((e, i) => {
    const zeit = alsDauer(e.t)

    if (e.art === "eingabe") {
      zaehler.aktionen++
      zaehler.freitext++
      console.log(`[${zeit}] Freitext: "${e.text}"`)
      zeile("Schnellantwort gewählt?", "nein")
      const antwort = antwortNach(i)

      if (e.treffer === "hit") {
        zaehler.erkannt++
        zeile(
          "Anliegen erkennen",
          `erkannt: ${e.grund ? (GRUND[e.grund] ?? e.grund) : "Stufe unbekannt"}`
        )
        zeile("Anliegen eindeutig?", "ja")
        antwortTeil(antwort)
      } else {
        zaehler.rueckfragen++
        if (e.treffer === "ambiguous") {
          zaehler.mehrdeutig++
          zeile("Anliegen erkennen", "mehrere Themen möglich")
        } else {
          zaehler.nichtErkannt++
          zeile(
            "Anliegen erkennen",
            `nicht erkannt${e.term ? ` (Leitbegriff "${e.term}")` : ""}`
          )
        }
        const art = antwort?.knoten ?? ""
        zeile(
          "Anliegen eindeutig?",
          `nein → ${RUECKFRAGE[art] ?? art}` +
            (e.kandidaten ? ` (${e.kandidaten.join(", ")})` : "")
        )
        if (antwort) zeile("Ausgabe", ausgabe(antwort))
      }
      console.log()
      return
    }

    if (e.art === "chip") {
      zaehler.aktionen++
      zaehler.chip++
      console.log(`[${zeit}] Schnellantwort: "${e.text}"`)
      zeile("Schnellantwort gewählt?", "ja, Erkennen entfällt")
      antwortTeil(antwortNach(i))
      console.log()
      return
    }

    if (e.art === "antwort") {
      // Antworten ohne vorausgehende Aktion: Begrüßung, nach Neustart oder
      // Sprachwechsel. Die anderen stehen schon bei ihrer Aktion.
      const davor = eintraege
        .slice(0, i)
        .reverse()
        .find((x) => x.art !== "fertig" && x.art !== "zettel")
      if (!davor || davor.art === "reset" || davor.art === "sprache") {
        console.log(`[${zeit}] Systemantwort ohne Eingabe: ${e.knoten}`)
        console.log()
      }
      return
    }

    if (e.art === "reset") console.log(`[${zeit}] Neustart\n`)
    if (e.art === "sprache")
      console.log(`[${zeit}] Sprache umgestellt: ${e.text}\n`)
    if (e.art === "zettel")
      console.log(`[${zeit}] Auf die Notizen gelegt: ${e.knoten}\n`)
  })

  const z = zaehler
  console.log("Durchläufe je Schritt")
  zeile("Nutzeraktionen", `${z.aktionen}`)
  zeile("davon Schnellantwort", `${z.chip}`)
  zeile("davon Freitext", `${z.freitext}`)
  zeile("Anliegen erkannt", `${z.erkannt} von ${z.freitext}`)
  zeile("mehrdeutig", `${z.mehrdeutig} von ${z.freitext}`)
  zeile("nicht erkannt", `${z.nichtErkannt} von ${z.freitext}`)
  zeile("Rückfragen", `${z.rueckfragen}`)
  if (version >= 2) {
    zeile("vorformuliert", `${z.baum}`)
    zeile("situativ", `${z.situativ}`)
    zeile("vorzeitig weitergeschrieben", `${z.vorzeitig}`)
  }
}
