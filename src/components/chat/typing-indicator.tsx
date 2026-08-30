import { BotAvatar } from "@/components/chat/bot-avatar"

export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <BotAvatar />
      <div
        className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-3.5 py-3"
        role="status"
        aria-label="Assistent schreibt"
      >
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60" />
      </div>
    </div>
  )
}
