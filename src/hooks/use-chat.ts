import * as React from "react"

import {
  ausformulieren,
  getNode,
  rueckfrageKnoten,
  TOPICS,
  ueberbrueckung,
  type Chip,
  type BildAnzeige,
  type DataTable,
  type FlowNode,
  type InfoCard,
  type QrPayload,
} from "@/lib/chat-flow"
import { neuerKontext, verstehe, type Kontext } from "@/lib/verstehen"
import { fallbackKnoten, rueckfrageImGespraech } from "@/lib/fallback"
import { flyerVon } from "@/lib/flyer"
import { aufloesen, useStandort } from "@/lib/location"
import {
  alsKarte,
  meldung,
  offeneMeldungen,
  type HinweisKarte,
} from "@/lib/meldungen"
import { type Sprache } from "@/lib/sprache"
import { protokolliere } from "@/lib/telemetry"
import { erkenneSprache, uebersetze, WECHSELHINWEIS } from "@/lib/i18n"
import {
  istWiederholung,
  merken,
  neuerVerlauf,
  zieheRueckbezug,
} from "@/lib/memory"
import { useWetter } from "@/lib/wetter"
import {
  EMAIL,
  eintraegeAus,
  gesendetKnoten,
  hinzugefuegtKnoten,
  type Antwort,
  type ZettelAnsicht,
  type ZettelEintrag,
} from "@/lib/zettel"

/**
 * Eine Nachricht des Assistenten trägt die Kennung der Antwort, zu der sie
 * gehört. Daran erkennt die Ansicht, welche Blasen zusammengehören und wo
 * der Merken-Knopf steht.
 */
type Bot = { id: string; role: "bot"; antwort?: string }

export type ChatMessage =
  | { id: string; role: "user"; kind: "text"; text: string }
  | (Bot & { kind: "text"; text: string })
  | (Bot & { kind: "card"; card: InfoCard })
  | (Bot & { kind: "table"; table: DataTable })
  | (Bot & { kind: "qr"; qr: QrPayload })
  | (Bot & { kind: "hinweis"; hinweis: HinweisKarte })
  | (Bot & { kind: "zettel"; zettel: ZettelAnsicht })
  | (Bot & { kind: "bild"; bild: BildAnzeige })

/** Was unter die Textnachrichten einer Antwort gehängt wird. */
type Anhang =
  | { kind: "card"; card: InfoCard }
  | { kind: "table"; table: DataTable }
  | { kind: "qr"; qr: QrPayload }
  | { kind: "hinweis"; hinweis: HinweisKarte }
  | { kind: "zettel"; zettel: ZettelAnsicht }
  | { kind: "bild"; bild: BildAnzeige }

/** Knoten, nach denen eine unverstandene Eingabe im Faden bleiben soll. */
const IM_ABLAUF =
  /^(bedarf:|vorschlag:|ziel:|flyer|dienst:|zettel:|empfehlung:|fahrplan:|wandern$|familie$)/

let counter = 0
function uid() {
  counter += 1
  return `m${counter}`
}

/**
 * Bleibt das zuletzt behandelte Ziel für die nächste Frage stehen?
 *
 * Es soll die einzelne Antwort überleben: wer nach der Gondelbahn fragt und
 * dann "navigiere mich da hin" schreibt, meint immer noch sie. Es darf aber
 * nicht das Thema überleben. Im Testlauf um 12:30 hing das Ziel "Rathaus
 * Tiefgarage" noch am Gespräch, als längst über Essen geredet wurde, und
 * beantwortete dann "wie komme ich nach Traunstein" mit dem Weg zur Garage.
 */
function uebernommenesZiel(vorher: Kontext, node: FlowNode): string | null {
  if (node.id === "menu" || node.id === "start") return null
  if (node.topic && vorher.topic && node.topic !== vorher.topic) return null
  return vorher.ziel
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/** Zufallswert im Bereich [min, max). */
function zufall(min: number, max: number) {
  return min + Math.random() * (max - min)
}

/** Kurze Denkpause vor jeder Antwort, in der die Punkte laufen. */
function denkpause() {
  return zufall(400, 900)
}

/** Zwei bis fünf Zeichen je Schritt, das trifft die Optik echter Token. */
function haeppchen() {
  return Math.floor(zufall(2, 6))
}

/** Wer Animationen abgewählt hat, bekommt den Text sofort vollständig. */
function magKeineAnimation() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  )
}

/**
 * Eine E-Mail-Adresse gehört nicht ins Protokoll.
 *
 * Das Protokoll wird exportiert und ausgewertet. Eine Adresse darin wäre ein
 * personenbezogenes Datum, das für die Auswertung nichts beiträgt.
 */
function ohneAdresse(text: string): string {
  return text.replace(new RegExp(EMAIL.source, "g"), "[E-Mail-Adresse]")
}

export function useChat() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [activeChips, setActiveChips] = React.useState<Chip[]>([])
  const [isTyping, setIsTyping] = React.useState(true)
  /** Die gerade entstehende Nachricht, getrennt von der fertigen Liste. */
  const [streaming, setStreaming] = React.useState<string | null>(null)
  const runIdRef = React.useRef(0)

  // Über eine Ref, damit ein Standortwechsel runNode nicht neu erzeugt und
  // das laufende Gespräch nicht abbricht. Er wirkt ab der nächsten Antwort.
  const standort = useStandort()
  const standortRef = React.useRef(standort)
  React.useEffect(() => {
    standortRef.current = standort
  }, [standort])

  // Das Wetter aus der Vorschauleiste, aus demselben Grund als Ref.
  const wetter = useWetter()
  const wetterRef = React.useRef(wetter)
  React.useEffect(() => {
    wetterRef.current = wetter
  }, [wetter])

  /** Was in diesem Gespräch schon gezeigt wurde. */
  const verlaufRef = React.useRef(neuerVerlauf())

  /**
   * Der Zustand, auf den sich die nächste freie Eingabe beziehen kann: der
   * zuletzt gezeigte Knoten, sein Thema und die Schaltflächen darunter.
   *
   * Als Ref, nicht als State: er wird nicht gerendert, und eine Neuzeichnung
   * mitten im Ausrollen einer Antwort würde die Animation abbrechen.
   */
  const kontextRef = React.useRef(neuerKontext())

  /** Dialogsprache. Sie folgt der Eingabe und wird beim Reset zurückgesetzt. */
  const [sprache, setSprache] = React.useState<Sprache>("de")
  const spracheRef = React.useRef<Sprache>("de")
  /** Wechselhinweis, den die nächste Antwort voranstellt. */
  const wechselRef = React.useRef<string | null>(null)

  /**
   * Der Zettel des Gasts. Als Ref für die Knotenbauer, als State für die
   * Anzeige der Anzahl in der Kopfzeile.
   */
  const zettelRef = React.useRef<ZettelEintrag[]>([])
  const [zettelAnzahl, setZettelAnzahl] = React.useState(0)

  /** Die Antworten dieses Gesprächs, nach ihrer Kennung. */
  const antwortenRef = React.useRef(new Map<string, Antwort>())
  /** Antworten, die etwas zum Mitnehmen enthalten und einen Knopf tragen. */
  const [merkbar, setMerkbar] = React.useState<ReadonlySet<string>>(new Set())
  /** Antworten, die schon auf dem Zettel stehen. */
  const [gemerkt, setGemerkt] = React.useState<ReadonlySet<string>>(new Set())
  /** Die Antwort, die gerade ausgerollt wird. Ihr Knopf kommt erst danach. */
  const [laufend, setLaufend] = React.useState<string | null>(null)

  /** Die jüngste Antwort, die ein bestimmter Knoten gegeben hat. */
  const antwortVon = React.useCallback(
    (knoten: string | null): Antwort | undefined => {
      if (!knoten) return undefined
      return [...antwortenRef.current.values()]
        .reverse()
        .find((antwort) => antwort.knoten === knoten)
    },
    []
  )

  /** Aktuelle Hinweise, die in diesem Gespräch schon erschienen sind. */
  const gezeigtRef = React.useRef(new Set<string>())

  /** Legt einen Eintrag auf den Zettel. Gibt zurück, ob er schon darauf war. */
  const aufZettel = React.useCallback((eintrag: ZettelEintrag): boolean => {
    const schonDa = zettelRef.current.some(
      (vorhanden) => vorhanden.quelle === eintrag.quelle
    )
    if (!schonDa) {
      zettelRef.current = [...zettelRef.current, eintrag]
      setZettelAnzahl(zettelRef.current.length)
      protokolliere({ art: "zettel", knoten: eintrag.quelle })
    }
    return schonDa
  }, [])

  /**
   * Legt eine Antwort auf den Zettel. Gibt die Einträge zurück und ob sie
   * alle schon darauf standen.
   */
  const merkeAntwortIntern = React.useCallback(
    (antwort: Antwort, jetzt: Date) => {
      const eintraege = eintraegeAus(antwort, spracheRef.current, jetzt)
      let alleSchonDa = eintraege.length > 0
      for (const eintrag of eintraege) {
        if (!aufZettel(eintrag)) alleSchonDa = false
      }
      if (eintraege.length > 0) {
        setGemerkt((vorher) => new Set(vorher).add(antwort.id))
      }
      return { eintraege, alleSchonDa }
    },
    [aufZettel]
  )

  /**
   * Knoten, die den Zettel verändern, bevor sie gebaut werden.
   *
   * "zettel:neu:<knoten>" legt die letzte Antwort dieses Knotens auf den
   * Zettel, getippt als "merk dir das". Druck, E-Mail und QR-Code nehmen
   * vorher mit, was gerade auf dem Schirm steht: wer nach einer
   * Fahrplanauskunft "druck mir das aus" sagt, will diese Auskunft gedruckt
   * haben.
   */
  const vorbereiten = React.useCallback(
    (id: string, jetzt: Date): string | FlowNode => {
      if (id.startsWith("zettel:neu:")) {
        const antwort = antwortVon(id.slice("zettel:neu:".length))
        if (!antwort) return "zettel:zeigen"
        const { eintraege, alleSchonDa } = merkeAntwortIntern(antwort, jetzt)
        if (eintraege.length === 0) return "zettel:zeigen"
        return hinzugefuegtKnoten(
          eintraege,
          zettelRef.current.length,
          alleSchonDa,
          spracheRef.current
        )
      }

      if (
        id === "zettel:drucken" ||
        id === "zettel:mail" ||
        id === "zettel:qr"
      ) {
        const antwort = antwortVon(kontextRef.current.knoten)
        if (antwort) merkeAntwortIntern(antwort, jetzt)
      }
      return id
    },
    [antwortVon, merkeAntwortIntern]
  )

  /** Nimmt eine Knoten-ID oder einen zur Laufzeit gebauten Knoten. */
  const runNode = React.useCallback(
    async (ziel: string | FlowNode) => {
      const myRun = runIdRef.current + 1
      runIdRef.current = myRun
      const aktiv = () => runIdRef.current === myRun

      // Die Uhrzeit einmal je Antwort feststellen und durchreichen, statt sie
      // in jedem Knotenbauer neu abzufragen. Sonst könnten zwei Teile
      // derselben Antwort von unterschiedlichen Minuten ausgehen.
      const jetzt = new Date()
      const vorbereitet =
        typeof ziel === "string" ? vorbereiten(ziel, jetzt) : ziel
      const roh =
        typeof vorbereitet === "string"
          ? getNode(vorbereitet, spracheRef.current, jetzt, {
              wetter: wetterRef.current.id,
              zettel: zettelRef.current,
            })
          : vorbereitet
      const node = roh.fertig ? roh : uebersetze(roh, spracheRef.current)

      setActiveChips([])
      setStreaming(null)
      setIsTyping(true)

      const sofort = magKeineAnimation()

      // Die Denkpause der ersten Nachricht steht vor allem, was Zustand
      // verändert. Ein Lauf, den der nächste Klick sofort ablöst, darf weder
      // im Gedächtnis noch im Protokoll auftauchen.
      await sleep(denkpause())
      if (!aktiv()) return

      protokolliere({
        art: "antwort",
        knoten: node.id,
        standort: standortRef.current.id,
      })

      // Sobald feststeht, was geantwortet wird, gilt es als Bezugspunkt für
      // die nächste Eingabe: nicht erst, wenn der Text zu Ende ausgerollt ist.
      //
      // Der Unterschied ist im Test der Normalfall, nicht die Ausnahme. Wer
      // liest, tippt weiter, sobald er genug gesehen hat, und bricht damit die
      // laufende Antwort ab. Stünde der Bezugspunkt erst am Ende, verlöre
      // gerade die schnelle Nachfrage ihren Bezug, also genau die, die ihn
      // braucht.
      const vorher = kontextRef.current
      if (!node.behalteKontext) kontextRef.current = {
        knoten: node.id,
        topic: node.topic ?? null,
        chips: node.chips ?? [],
        istRueckfrage: node.id.startsWith("rueckfrage") || Boolean(node.jaNein),
        angebot: node.angebot ?? [],
        gruppe: node.gruppe ?? null,
        nummern: node.nummern,
        ziel: node.ziel ?? uebernommenesZiel(vorher, node),
        weiter: node.weiter ?? null,
        nein: node.nein ?? null,
        flyer: flyerVon(node) ?? vorher.flyer ?? null,
      }

      const verlauf = verlaufRef.current
      // Beim zweiten Mal die kurze Fassung, statt dieselbe Textwand noch
      // einmal auszurollen.
      const inhalt =
        istWiederholung(verlauf, node) && node.kurz ? node.kurz : node.messages
      const bezug = zieheRueckbezug(verlauf, node, spracheRef.current)
      merken(verlauf, node)

      // Karten brauchen Vorlauf, sonst pulsieren nur die Punkte. Eine kurze
      // Zwischenmeldung füllt die Wartezeit, statt sie zu verstecken.
      const wechsel = wechselRef.current
      wechselRef.current = null

      const fuellen = (text: string) =>
        aufloesen(
          text,
          standortRef.current,
          spracheRef.current,
          wetterRef.current
        )

      // Die Antwort, wie sie gleich auf dem Schirm steht, für den
      // Merken-Knopf. Ohne Überleitung und Rückbezug: die gehören zum
      // Gespräch, nicht zur Auskunft.
      const antwortId = `a${myRun}`
      const antwort: Antwort = {
        id: antwortId,
        knoten: node.id,
        titel:
          TOPICS.find((topic) => topic.id === node.topic)?.[
            spracheRef.current === "en" ? "labelEn" : "label"
          ] ?? (spracheRef.current === "en" ? "Information" : "Auskunft"),
        texte: ausformulieren(inhalt)
          .map(fuellen)
          .filter((text) => text.trim().length > 0),
        angebot: node.angebot ?? [],
        link: node.qr?.url,
      }
      antwortenRef.current.set(antwortId, antwort)
      setLaufend(antwortId)
      if (eintraegeAus(antwort, spracheRef.current, jetzt).length > 0) {
        setMerkbar((vorher) => new Set(vorher).add(antwortId))
      }

      const nachrichten = [
        ...(wechsel ? [wechsel] : []),
        ...(bezug ? [bezug] : []),
        ...(node.bridge || node.card || node.table
          ? [ueberbrueckung(spracheRef.current)]
          : []),
        ...ausformulieren(inhalt),
      ]
        .map(fuellen)
        // Eine Nachricht, die nur aus einer unbelegten Wegangabe bestand,
        // ist nach dem Auflösen leer und erscheint nicht.
        .filter((text) => text.trim().length > 0)

      /** Rollt eine Nachricht aus. false, wenn der Lauf abgelöst wurde. */
      const ausrollen = async (text: string): Promise<boolean> => {
        setIsTyping(false)
        if (!sofort) {
          setStreaming("")
          let pos = 0
          while (pos < text.length) {
            await sleep(zufall(20, 35))
            // Der Abbruch muss innerhalb der Schleife greifen, sonst bleibt
            // eine halbe Blase stehen.
            if (!aktiv()) {
              setStreaming(null)
              return false
            }
            pos = Math.min(text.length, pos + haeppchen())
            setStreaming(text.slice(0, pos))
          }
          setStreaming(null)
        }
        setMessages((prev) => [
          ...prev,
          { id: uid(), role: "bot", kind: "text", text, antwort: antwortId },
        ])
        return true
      }

      /** Hängt einen Anhang nach kurzer Pause an. */
      const anhaengen = async (
        nachricht: Anhang,
        pause = zufall(600, 1000)
      ): Promise<boolean> => {
        setIsTyping(true)
        await sleep(pause)
        if (!aktiv()) return false
        setMessages((prev) => [
          ...prev,
          { id: uid(), role: "bot", antwort: antwortId, ...nachricht },
        ])
        return true
      }

      for (let i = 0; i < nachrichten.length; i++) {
        // Die Pause der ersten Nachricht ist oben schon vergangen.
        if (i > 0) {
          setIsTyping(true)
          await sleep(denkpause())
          if (!aktiv()) return
        }
        if (!(await ausrollen(nachrichten[i]))) return
        // Das Bild steht direkt unter dem ersten Satz ("Sehr gern. Minigolf
        // am Kurhaus:"), vor der Beschreibung. So sieht der Gast zuerst, was
        // gemeint ist.
        if (i === 0 && node.bild) {
          if (!(await anhaengen({ kind: "bild", bild: node.bild }, zufall(300, 500))))
            return
        }
      }

      // Aktuelle Hinweise: die ausdrücklich verlangten und die, die zum Thema
      // gehören und noch nicht gezeigt wurden. Sie stehen vor dem Anhang,
      // damit der Hinweis zum Ersatzverkehr über dem Fahrplan steht und
      // nicht darunter.
      const hinweise = [
        ...(node.hinweise ?? [])
          .map(meldung)
          .filter((eintrag) => eintrag !== undefined),
        ...offeneMeldungen(node, wetterRef.current.id, gezeigtRef.current),
      ].filter(
        (eintrag, index, liste) =>
          liste.findIndex((anderer) => anderer.id === eintrag.id) === index
      )
      for (const eintrag of hinweise) {
        gezeigtRef.current.add(eintrag.id)
        const ok = await anhaengen(
          { kind: "hinweis", hinweis: alsKarte(eintrag, spracheRef.current) },
          zufall(400, 700)
        )
        if (!ok) return
      }

      // Ein Vorgang, der dauert, zeigt es: die Punkte laufen weiter, bis das
      // Ergebnis da ist (M [00:58:14]).
      const erstePause = node.warten ?? zufall(600, 1000)

      if (node.card) {
        if (!(await anhaengen({ kind: "card", card: node.card }, erstePause)))
          return
      }
      if (node.table) {
        if (!(await anhaengen({ kind: "table", table: node.table }, erstePause)))
          return
      }
      if (node.zettel) {
        if (!(await anhaengen({ kind: "zettel", zettel: node.zettel }, erstePause)))
          return
      }
      if (node.qr) {
        if (
          !(await anhaengen(
            { kind: "qr", qr: { ...node.qr, title: fuellen(node.qr.title) } },
            erstePause
          ))
        )
          return
      }

      const danach = ausformulieren(node.nachher ?? [])
        .map(fuellen)
        .filter((text) => text.trim().length > 0)
      for (const text of danach) {
        setIsTyping(true)
        await sleep(denkpause())
        if (!aktiv()) return
        if (!(await ausrollen(text))) return
      }

      await sleep(250)
      if (!aktiv()) return
      setIsTyping(false)
      setLaufend(null)
      setActiveChips(node.chips ?? [])
    },
    [vorbereiten]
  )

  const selectChip = React.useCallback(
    (chip: Chip) => {
      protokolliere({ art: "chip", text: chip.label, knoten: chip.to })
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "user", kind: "text", text: chip.label },
      ])
      void runNode(chip.to)
    },
    [runNode]
  )

  const sendText = React.useCallback(
    (raw: string) => {
      const text = raw.trim()
      if (!text) return
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "user", kind: "text", text },
      ])

      // Die Antwort auf "an welche Adresse?". Sie geht an keinen Server und
      // landet nicht im Protokoll.
      const adresse = EMAIL.exec(text)?.[0]
      if (adresse && kontextRef.current.knoten === "zettel:mail") {
        protokolliere({ art: "eingabe", text: "[E-Mail-Adresse]" })
        void runNode(
          gesendetKnoten(adresse, zettelRef.current, spracheRef.current)
        )
        return
      }

      // Die Antwort folgt der Sprache der Eingabe. Bleibt sie uneindeutig,
      // etwa bei einem einzelnen Wort, gilt die bisherige weiter.
      const erkannt = erkenneSprache(text)
      if (erkannt && erkannt !== spracheRef.current) {
        spracheRef.current = erkannt
        setSprache(erkannt)
        wechselRef.current = WECHSELHINWEIS[erkannt]
      }

      const ergebnis = verstehe(text, kontextRef.current)
      protokolliere({
        art: "eingabe",
        text: ohneAdresse(text),
        treffer: ergebnis.kind,
        // Bei einem Treffer hält der Grund fest, welche Stufe gegriffen hat.
        // Ohne ihn steht in der Auswertung nur, dass es geklappt hat.
        grund: ergebnis.kind === "hit" ? ergebnis.grund : undefined,
      })

      if (ergebnis.kind === "hit") {
        void runNode(ergebnis.to)
      } else if (ergebnis.kind === "ambiguous") {
        void runNode(
          rueckfrageKnoten(
            ergebnis.candidates,
            ergebnis.term,
            spracheRef.current
          )
        )
      } else if (
        kontextRef.current.chips.length > 0 &&
        IM_ABLAUF.test(kontextRef.current.knoten ?? "")
      ) {
        // Mitten in einem Ablauf: die vorigen Möglichkeiten stehen lassen.
        void runNode(
          rueckfrageImGespraech(kontextRef.current.chips, spracheRef.current)
        )
      } else {
        void runNode(fallbackKnoten(text, spracheRef.current))
      }
    },
    [runNode]
  )

  /** Der Merken-Knopf unter einer Antwort. Ohne neue Nachricht im Chat. */
  const merkeAntwort = React.useCallback(
    (antwortId: string) => {
      const antwort = antwortenRef.current.get(antwortId)
      if (!antwort) return
      protokolliere({ art: "chip", text: "Merken", knoten: antwort.knoten })
      merkeAntwortIntern(antwort, new Date())
    },
    [merkeAntwortIntern]
  )

  /** Den Zettel zeigen, über die Schaltfläche in der Kopfzeile. */
  const zeigeZettel = React.useCallback(() => {
    protokolliere({ art: "chip", text: "Zettel", knoten: "zettel:zeigen" })
    void runNode("zettel:zeigen")
  }, [runNode])

  /**
   * Sprache umstellen und die letzte Antwort in der neuen Sprache wiederholen.
   *
   * Ohne die Wiederholung bliebe nach dem Druck alles stehen, was auf dem
   * Schirm steht, und die Umstellung wirkte folgenlos, bis jemand die nächste
   * Frage stellt. Der Verlauf wird dabei geleert: die Kurzfassung für eine
   * Wiederholung wäre hier falsch, denn in der neuen Sprache ist der Text
   * noch gar nicht dagewesen.
   *
   * Die Erkennung an der Eingabe bleibt daneben bestehen. Am Gerät im Ort
   * löst sie den Fall, dass der nächste Gast eine andere Sprache spricht als
   * der vorige und den Schalter nicht sieht.
   */
  const wechsleSprache = React.useCallback(
    (ziel: Sprache) => {
      if (ziel === spracheRef.current) return

      protokolliere({ art: "sprache", text: ziel })
      spracheRef.current = ziel
      setSprache(ziel)
      wechselRef.current = WECHSELHINWEIS[ziel]
      verlaufRef.current = neuerVerlauf()

      // Zur Laufzeit gebaute Knoten (Rückfrage, Fallback) tragen keine ID,
      // unter der sie sich neu bauen ließen. Dann bleibt der Einstieg: eine
      // unverstandene Eingabe in der neuen Sprache noch einmal vorzuhalten,
      // führt ohnehin nicht weiter. Dasselbe gilt für Knoten, die den Zettel
      // verändern: sie noch einmal auszuführen, hieße ihn noch einmal zu
      // verändern.
      const aktuell = kontextRef.current.knoten
      const erneut =
        aktuell &&
        !aktuell.startsWith("zettel:") &&
        getNode(aktuell, ziel).id === aktuell
          ? aktuell
          : "menu"
      void runNode(erneut)
    },
    [runNode]
  )

  const reset = React.useCallback(() => {
    protokolliere({ art: "reset" })
    runIdRef.current += 1
    verlaufRef.current = neuerVerlauf()
    kontextRef.current = neuerKontext()
    spracheRef.current = "de"
    wechselRef.current = null
    zettelRef.current = []
    antwortenRef.current = new Map()
    setMerkbar(new Set())
    setGemerkt(new Set())
    setLaufend(null)
    gezeigtRef.current = new Set()
    setZettelAnzahl(0)
    setSprache("de")
    setMessages([])
    setActiveChips([])
    setStreaming(null)
    setIsTyping(false)
    void runNode("start")
  }, [runNode])

  /* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
  React.useEffect(() => {
    // Startknoten nur beim ersten Mount anstoßen. Die synchronen Resets in
    // runNode entsprechen hier dem Initialzustand, der erste Tick ist ein No-op.
    void runNode("start")
  }, [])
  /* eslint-enable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */

  return {
    messages,
    activeChips,
    isTyping,
    streaming,
    sprache,
    zettelAnzahl,
    merkbar,
    gemerkt,
    laufend,
    selectChip,
    sendText,
    wechsleSprache,
    zeigeZettel,
    merkeAntwort,
    reset,
  }
}
