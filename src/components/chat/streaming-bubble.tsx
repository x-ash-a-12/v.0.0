import { AgentAvatar } from "@/components/chat/agent-avatar"
import { zipfel } from "@/components/chat/zipfel"
import { cn } from "@/lib/utils"

/**
 * Die Klassen sind bewusst wortgleich mit der fertigen Bot-Blase in
 * message-item.tsx. Weicht hier etwas ab, springt der Text genau in dem
 * Moment, in dem die Nachricht fertig ist.
 */
const bubbleBase =
  "w-fit max-w-full rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]"

type StreamingBubbleProps = {
  text: string
}

/** Die wachsende Blase während der gestaffelten Ausgabe. */
export function StreamingBubble({ text }: StreamingBubbleProps) {
  return (
    <div className="flex items-end gap-2">
      <AgentAvatar zustand="wartet" />
      <div className="flex max-w-[calc(100%-3rem)] min-w-0 flex-col @sm:max-w-[80%]">
        <div
          className={cn(
            bubbleBase,
            "rounded-bl-sm bg-muted text-foreground",
            zipfel
          )}
          // Screenreader lesen erst die fertige Nachricht vor, nicht jedes
          // Häppchen einzeln.
          aria-live="polite"
          aria-atomic="true"
        >
          {text}
          <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-foreground align-text-bottom" />
        </div>
      </div>
    </div>
  )
}
