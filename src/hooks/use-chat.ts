import * as React from "react"

import { getNode, matchIntent, type Chip, type InfoCard } from "@/lib/chat-flow"

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

/** Tippdauer grob an die Textlänge koppeln, damit es echt wirkt. */
function typingDelay(text: string) {
  return Math.min(1600, 450 + text.length * 12)
}

export function useChat() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [activeChips, setActiveChips] = React.useState<Chip[]>([])
  const [isTyping, setIsTyping] = React.useState(true)
  const runIdRef = React.useRef(0)

  const runNode = React.useCallback(async (id: string) => {
    const myRun = runIdRef.current + 1
    runIdRef.current = myRun

    const node = getNode(id)
    setActiveChips([])
    setIsTyping(true)

    for (const text of node.messages) {
      await sleep(typingDelay(text))
      if (runIdRef.current !== myRun) return
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "bot", kind: "text", text },
      ])
    }

    if (node.card) {
      await sleep(650)
      if (runIdRef.current !== myRun) return
      setMessages((prev) => [
        ...prev,
        { id: uid(), role: "bot", kind: "card", card: node.card! },
      ])
    }

    await sleep(250)
    if (runIdRef.current !== myRun) return
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
      void runNode(matchIntent(text))
    },
    [runNode],
  )

  const reset = React.useCallback(() => {
    runIdRef.current += 1
    setMessages([])
    setActiveChips([])
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

  return { messages, activeChips, isTyping, selectChip, sendText, reset }
}
