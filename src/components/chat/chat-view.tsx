import * as React from "react"

import { ChatComposer } from "@/components/chat/chat-composer"
import { ChatHeader } from "@/components/chat/chat-header"
import { MessageItem } from "@/components/chat/message-item"
import { QuickReplies } from "@/components/chat/quick-replies"
import { TypingIndicator } from "@/components/chat/typing-indicator"
import { useChat } from "@/hooks/use-chat"

export function ChatView() {
  const { messages, activeChips, isTyping, selectChip, sendText, reset } =
    useChat()
  const scrollRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
  }, [messages, isTyping, activeChips])

  return (
    <div className="@container flex h-full min-h-0 w-full flex-col overflow-hidden bg-background text-foreground">
      <ChatHeader onReset={reset} />

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain"
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

          {isTyping ? <TypingIndicator /> : null}

          {!isTyping && activeChips.length > 0 ? (
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
