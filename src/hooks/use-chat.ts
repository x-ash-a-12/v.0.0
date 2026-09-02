import * as React from "react"

import {
  ausformulieren,
  getNode,
  matchIntent,
  rueckfrageKnoten,
  ueberbrueckung,
  type Chip,
  type FlowNode,
  type InfoCard,
  type QrPayload,
} from "@/lib/chat-flow"
import { fallbackKnoten } from "@/lib/fallback"
import { aufloesen, useStandort } from "@/lib/location"
import { type Sprache } from "@/lib/sprache"
import { protokolliere } from "@/lib/telemetry"
import {
  erkenneSprache,
  uebersetze,
  WECHSELHINWEIS,
} from "@/lib/i18n"
import {
  istWiederholung,
  merken,
  neuerVerlauf,
  zieheRueckbezug,
} from "@/lib/memory"

export type ChatMessage =
  | { id: string; role: "user"; kind: "text"; text: string }
  | { id: string; role: "bot"; kind: "text"; text: string }
  | { id: string; role: "bot"; kind: "card"; card: InfoCard }
  | { id: string; role: "bot"; kind: "qr"; qr: QrPayload }

let counter = 0
function uid() {
  counter += 1
  return `m${counter}`
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

  /** Was in diesem Gespräch schon gezeigt wurde. */
  const verlaufRef = React.useRef(neuerVerlauf())

  /** Dialogsprache. Sie folgt der Eingabe und wird beim Reset zurückgesetzt. */
  const [sprache, setSprache] = React.useState<Sprache>("de")
  const spracheRef = React.useRef<Sprache>("de")
  /** Wechselhinweis, den die nächste Antwort voranstellt. */
  const wechselRef = React.useRef<string | null>(null)

  /** Nimmt eine Knoten-ID oder einen zur Laufzeit gebauten Knoten. */
  const runNode = React.useCallback(async (ziel: string | FlowNode) => {
    const myRun = runIdRef.current + 1
    runIdRef.current = myRun
    const aktiv = () => runIdRef.current === myRun

    const roh = typeof ziel === "string" ? getNode(ziel) : ziel
    const node = uebersetze(roh, spracheRef.current)

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

    const verlauf = verlaufRef.current
    // Beim zweiten Mal die kurze Fassung, statt dieselbe Textwand noch
    // einmal auszurollen.
    const inhalt =
      istWiederholung(verlauf, node) && node.kurz ? node.kurz : node.messages
    const bezug = zieheRueckbezug(verlauf, node)
    merken(verlauf, node)

    // Karten brauchen Vorlauf, sonst pulsieren nur die Punkte. Eine kurze
    // Zwischenmeldung füllt die Wartezeit, statt sie zu verstecken.
    const wechsel = wechselRef.current
    wechselRef.current = null

    const nachrichten = [
      ...(wechsel ? [wechsel] : []),
      ...(bezug ? [bezug] : []),
      ...(node.bridge || node.card ? [ueberbrueckung()] : []),
      ...ausformulieren(inhalt),
    ].map((text) => aufloesen(text, standortRef.current, spracheRef.current))

    for (let i = 0; i < nachrichten.length; i++) {
      const text = nachrichten[i]

      // Die Pause der ersten Nachricht ist oben schon vergangen.
      if (i > 0) {
        await sleep(denkpause())
        if (!aktiv()) return
      }
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
            return
          }
          pos = Math.min(text.length, pos + haeppchen())
          setStreaming(text.slice(0, pos))
        }
        setStreaming(null)
      }

      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "bot", kind: "text", text },
      ])

      if (i < nachrichten.length - 1 || node.card || node.qr) {
        setIsTyping(true)
      }
    }

    if (node.card) {
      setIsTyping(true)
      await sleep(zufall(600, 1000))
      if (!aktiv()) return
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "bot", kind: "card", card: node.card! },
      ])
    }

    if (node.qr) {
      setIsTyping(true)
      await sleep(zufall(600, 1000))
      if (!aktiv()) return
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "bot", kind: "qr", qr: node.qr! },
      ])
    }

    await sleep(250)
    if (!aktiv()) return
    setIsTyping(false)
    setActiveChips(node.chips ?? [])
  }, [])

  const selectChip = React.useCallback(
    (chip: Chip) => {
      protokolliere({ art: "chip", text: chip.label, knoten: chip.to })
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "user", kind: "text", text: chip.label },
      ])
      void runNode(chip.to)
    },
    [runNode],
  )

  const sendText = React.useCallback(
    (raw: string) => {
      const text = raw.trim()
      if (!text) return
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "user", kind: "text", text },
      ])
      // Die Antwort folgt der Sprache der Eingabe. Bleibt sie uneindeutig,
      // etwa bei einem einzelnen Wort, gilt die bisherige weiter.
      const erkannt = erkenneSprache(text)
      if (erkannt && erkannt !== spracheRef.current) {
        spracheRef.current = erkannt
        setSprache(erkannt)
        wechselRef.current = WECHSELHINWEIS[erkannt]
      }

      const ergebnis = matchIntent(text)
      protokolliere({ art: "eingabe", text, treffer: ergebnis.kind })

      if (ergebnis.kind === "hit") {
        void runNode(ergebnis.to)
      } else if (ergebnis.kind === "ambiguous") {
        void runNode(
          rueckfrageKnoten(
            ergebnis.candidates,
            ergebnis.term,
            spracheRef.current,
          ),
        )
      } else {
        void runNode(fallbackKnoten(text, spracheRef.current))
      }
    },
    [runNode],
  )

  const reset = React.useCallback(() => {
    protokolliere({ art: "reset" })
    runIdRef.current += 1
    verlaufRef.current = neuerVerlauf()
    spracheRef.current = "de"
    wechselRef.current = null
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
    selectChip,
    sendText,
    reset,
  }
}
