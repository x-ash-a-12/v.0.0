import { Bot } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export function BotAvatar({ className }: { className?: string }) {
  return (
    <Avatar className={cn("shrink-0", className)}>
      <AvatarFallback className="bg-primary text-primary-foreground">
        <Bot className="size-4" />
      </AvatarFallback>
    </Avatar>
  )
}
