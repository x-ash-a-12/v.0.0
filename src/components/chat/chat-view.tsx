import * as React from "react"

import { ChatComposer } from "@/components/chat/chat-composer"
import { ChatHeader } from "@/components/chat/chat-header"
import { MerkenKnopf } from "@/components/chat/merken-knopf"
import { MessageItem } from "@/components/chat/message-item"
import { QuickReplies } from "@/components/chat/quick-replies"
import { StreamingBubble } from "@/components/chat/streaming-bubble"
import { TypingIndicator } from "@/components/chat/typing-indicator"
import { useChat, type ChatMessage } from "@/hooks/use-chat"

/**
 * Wo der Avatar steht: an der letzten Blase einer Folge des Assistenten.
 *
 * "lebt" heißt, die Folge ist die laufende Antwort und nichts folgt mehr.
 * Dann blinzelt der Avatar. Ältere Folgen behalten ihren Avatar, aber still.
 * Läuft schon die nächste Blase an oder tippt der Assistent, sitzt der Avatar
 * dort, und die Folge darüber gibt ihn ab.
 */
function avatarAn(
  messages: ChatMessage[],
  index: number,
  folgtNoch: boolean
): "lebt" | "still" | null {
  if (messages[index].role !== "bot") return null
  const naechste = messages[index + 1]
  if (!naechste) return folgtNoch ? null : "lebt"
  return naechste.role === "user" ? "still" : null
}

/**
 * Die Kennung der Antwort, unter deren letzter Nachricht der Merken-Knopf
 * steht, oder null. Die letzte Nachricht einer Antwort ist die, nach der
 * eine andere Antwort oder eine Eingabe des Gasts folgt.
 */
function antwortEndetHier(
  messages: ChatMessage[],
  index: number
): string | null {
  const message = messages[index]
  if (message.role !== "bot" || !message.antwort) return null
  const naechste = messages[index + 1]
  if (
    naechste &&
    naechste.role === "bot" &&
    naechste.antwort === message.antwort
  )
    return null
  return message.antwort
}

export function ChatView() {
  const {
    messages,
    activeChips,
    isTyping,
    streaming,
    sprache,
    zettelAnzahl,
    merkbar,
    gemerkt,
    laufend,
    merkeAntwort,
    selectChip,
    sendText,
    wechsleSprache,
    zeigeZettel,
    reset,
  } = useChat()
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    // Während des Streamings hart nachziehen. Eine weiche Animation je
    // Häppchen käme nie hinterher und würde sichtbar zittern.
    el.scrollTo({
      top: el.scrollHeight,
      behavior: streaming === null ? "smooth" : "auto",
    })
  }, [messages, isTyping, activeChips, streaming])

  return (
    <div className="@container flex h-full min-h-0 w-full flex-col overflow-hidden bg-background text-foreground">
      <ChatHeader
        onReset={reset}
        sprache={sprache}
        onSprache={wechsleSprache}
        zettelAnzahl={zettelAnzahl}
        onZettel={zeigeZettel}
      />

      <div
        ref={scrollRef}
        className="scrollbar-hidden min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain"
      >
        <div className="mx-auto flex w-full max-w-[46rem] flex-col gap-3 px-3 py-4 @sm:px-4">
          {messages.map((message, index) => {
            const antwort = antwortEndetHier(messages, index)
            const knopf =
              antwort !== null && antwort !== laufend && merkbar.has(antwort)
            return (
              <React.Fragment key={message.id}>
                <MessageItem
                  message={message}
                  avatar={avatarAn(
                    messages,
                    index,
                    isTyping || streaming !== null
                  )}
                />
                {knopf ? (
                  <div className="-mt-2 pl-12">
                    <MerkenKnopf
                      gemerkt={gemerkt.has(antwort)}
                      sprache={sprache}
                      onMerken={() => merkeAntwort(antwort)}
                    />
                  </div>
                ) : null}
              </React.Fragment>
            )
          })}

          {streaming !== null ? <StreamingBubble text={streaming} /> : null}

          {isTyping ? <TypingIndicator /> : null}

          {!isTyping && streaming === null && activeChips.length > 0 ? (
            <div className="pl-12">
              <QuickReplies chips={activeChips} onSelect={selectChip} />
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-t bg-background px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] @sm:px-4">
        <div className="mx-auto w-full max-w-[46rem]">
          <ChatComposer onSend={sendText} />
          <p className="mt-2 text-center text-[11px] leading-snug text-muted-foreground">
            Prototyp für Forschungszwecke, nicht von Ruhpolding Tourismus. Die
            Antworten sind vordefiniert und können von der Realität abweichen.
          </p>
        </div>
      </div>
    </div>
  )
}
