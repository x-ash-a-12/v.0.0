import * as React from "react"

import {
  getNode,
  matchIntent,
  type Chip,
  type FlowNode,
  type InfoCard,
} from "@/lib/chat-flow"
import { fallbackKnoten } from "@/lib/fallback"

export type ChatMessage =
  | { id: string; role: "user"; kind: "text"; text: string }
  | { id: string; role: "bot"; kind: "text"; text: string }
  | { id: string; role: "bot"; kind: "card"; card: InfoCard }

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

  /** Nimmt eine Knoten-ID oder einen zur Laufzeit gebauten Knoten. */
  const runNode = React.useCallback(async (ziel: string | FlowNode) => {
    const myRun = runIdRef.current + 1
    runIdRef.current = myRun
    const aktiv = () => runIdRef.current === myRun

    const node = typeof ziel === "string" ? getNode(ziel) : ziel
    setActiveChips([])
    setStreaming(null)
    setIsTyping(true)

    const sofort = magKeineAnimation()

    for (let i = 0; i < node.messages.length; i++) {
      const text = node.messages[i]

      await sleep(denkpause())
      if (!aktiv()) return
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

      if (i < node.messages.length - 1 || node.card) {
        setIsTyping(true)
      }
    }

    if (node.card) {
      setIsTyping(true)
      await sleep(650)
      if (!aktiv()) return
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "bot", kind: "card", card: node.card! },
      ])
    }

    await sleep(250)
    if (!aktiv()) return
    setIsTyping(false)
    setActiveChips(node.chips ?? [])
  }, [])

  const selectChip = React.useCallback(
    (chip: Chip) => {
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
      const ziel = matchIntent(text)
      void runNode(ziel ?? fallbackKnoten(text))
    },
    [runNode],
  )

  const reset = React.useCallback(() => {
    runIdRef.current += 1
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
    selectChip,
    sendText,
    reset,
  }
}
