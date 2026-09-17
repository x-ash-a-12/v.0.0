import * as React from "react"

import { ChatComposer } from "@/components/chat/chat-composer"
import { ChatHeader } from "@/components/chat/chat-header"
import { MessageItem } from "@/components/chat/message-item"
import { QuickReplies } from "@/components/chat/quick-replies"
import { StreamingBubble } from "@/components/chat/streaming-bubble"
import { TypingIndicator } from "@/components/chat/typing-indicator"
import { useChat } from "@/hooks/use-chat"

export function ChatView() {
  const {
    messages,
    activeChips,
    isTyping,
    streaming,
    sprache,
    selectChip,
    sendText,
    wechsleSprache,
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
      />

      <div
        ref={scrollRef}
        className="scrollbar-hidden min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain"
      >
        <div className="mx-auto flex w-full max-w-[46rem] flex-col gap-3 px-3 py-4 @sm:px-4">
          {messages.map((message, index) => (
            <MessageItem
              key={message.id}
              message={message}
              showAvatar={
                message.role === "bot" && messages[index - 1]?.role !== "bot"
              }
            />
          ))}

          {streaming !== null ? (
            <StreamingBubble
              text={streaming}
              showAvatar={messages[messages.length - 1]?.role !== "bot"}
            />
          ) : null}

          {isTyping ? <TypingIndicator /> : null}

          {!isTyping && streaming === null && activeChips.length > 0 ? (
            <div className="pl-10">
              <QuickReplies chips={activeChips} onSelect={selectChip} />
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-t bg-background px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] @sm:px-4">
        <div className="mx-auto w-full max-w-[46rem]">
          <ChatComposer onSend={sendText} />
          <p className="mt-2 text-center text-[11px] leading-snug text-muted-foreground">
            Prototyp für Forschungszwecke. Die Antworten sind vordefiniert und
            können von der Realität abweichen.
          </p>
        </div>
      </div>
    </div>
  )
}
