import { RotateCcw } from "lucide-react"

import { BotAvatar } from "@/components/chat/bot-avatar"
import { LanguageToggle } from "@/components/chat/language-toggle"
import { ThemeToggle } from "@/components/chat/theme-toggle"
import { Button } from "@/components/ui/button"
import { type Sprache } from "@/lib/sprache"

type ChatHeaderProps = {
  onReset: () => void
  /** Aktive Dialogsprache. */
  sprache: Sprache
  onSprache: (sprache: Sprache) => void
}

export function ChatHeader({ onReset, sprache, onSprache }: ChatHeaderProps) {
  return (
    <header className="flex items-center gap-3 border-b bg-background/95 px-3 py-2.5 backdrop-blur @sm:px-4">
      <BotAvatar className="size-9" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">Tourist-Info Ruhpolding</p>
        <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
          <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
          Digitaler Assistent
        </p>
      </div>
      <LanguageToggle sprache={sprache} onWechsel={onSprache} />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Gespräch neu starten"
        onClick={onReset}
      >
        <RotateCcw />
      </Button>
      <ThemeToggle />
    </header>
  )
}
