import { AgentAvatar } from "@/components/chat/agent-avatar"
import { zipfel } from "@/components/chat/zipfel"
import { cn } from "@/lib/utils"

export function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <AgentAvatar zustand="denkt" />
      <div
        className={cn(
          "flex items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-3.5 py-3",
          zipfel
        )}
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
