import { BotAvatar } from "@/components/chat/bot-avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ChatMessage } from "@/hooks/use-chat"
import type { InfoCard } from "@/lib/chat-flow"
import { cn } from "@/lib/utils"

const bubbleBase =
  "w-fit max-w-full rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]"

function InfoCardView({ card }: { card: InfoCard }) {
  return (
    <Card size="sm" className="w-full max-w-full">
      <CardHeader>
        <CardTitle className="text-sm">{card.title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {card.rows.map((row) => (
          <div
            key={row.label}
            className="grid gap-0.5 @md:grid-cols-[9rem_minmax(0,1fr)] @md:gap-3"
          >
            <span className="text-xs text-muted-foreground @md:text-sm">
              {row.label}
            </span>
            <span className="text-sm font-medium [overflow-wrap:anywhere]">
              {row.value}
            </span>
          </div>
        ))}
        {card.note ? (
          <p className="pt-1 text-xs text-muted-foreground [overflow-wrap:anywhere]">
            {card.note}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}

type MessageItemProps = {
  message: ChatMessage
  showAvatar: boolean
}

export function MessageItem({ message, showAvatar }: MessageItemProps) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div
          className={cn(
            bubbleBase,
            "max-w-[85%] rounded-br-sm bg-primary text-primary-foreground @sm:max-w-[80%]",
          )}
        >
          {message.text}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-end gap-2">
      {showAvatar ? (
        <BotAvatar />
      ) : (
        <div className="size-8 shrink-0" aria-hidden="true" />
      )}
      <div className="flex min-w-0 max-w-[calc(100%-2.5rem)] flex-col @sm:max-w-[80%]">
        {message.kind === "text" ? (
          <div className={cn(bubbleBase, "rounded-bl-sm bg-muted text-foreground")}>
            {message.text}
          </div>
        ) : (
          <InfoCardView card={message.card} />
        )}
      </div>
    </div>
  )
}
