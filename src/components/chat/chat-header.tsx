import { NotebookPen, RotateCcw } from "lucide-react"

import { LanguageToggle } from "@/components/chat/language-toggle"
import { ThemeToggle } from "@/components/chat/theme-toggle"
import { Button } from "@/components/ui/button"
import { type Sprache } from "@/lib/sprache"

type ChatHeaderProps = {
  onReset: () => void
  /** Aktive Dialogsprache. */
  sprache: Sprache
  onSprache: (sprache: Sprache) => void
  /** Einträge auf dem Zettel des Gasts. */
  zettelAnzahl: number
  onZettel: () => void
}

export function ChatHeader({
  onReset,
  sprache,
  onSprache,
  zettelAnzahl,
  onZettel,
}: ChatHeaderProps) {
  return (
    <header className="flex items-center gap-3 border-b bg-background/95 px-3 py-2.5 backdrop-blur @sm:px-4">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">Tourist-Info Ruhpolding</p>
        <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
          <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
          Digitaler Assistent
        </p>
      </div>
      {/*
       * Der Zettel steht immer in der Kopfzeile, beschriftet, auch leer.
       * Bis 24.09.2026 erschien er erst mit dem ersten Eintrag, und damit
       * blieben Drucken, E-Mail und Handy versteckt. Leer erklärt er, wie
       * man etwas daraufbekommt.
       */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onZettel}
        aria-label={
          sprache === "en"
            ? `My notes, ${zettelAnzahl} entries`
            : `Mein Zettel, ${zettelAnzahl} Einträge`
        }
        className="shrink-0 gap-1.5 px-2"
      >
        <NotebookPen className="size-4" aria-hidden="true" />
        <span>{sprache === "en" ? "Notes" : "Zettel"}</span>
        <span className="rounded-full bg-muted px-1.5 text-xs tabular-nums">
          {zettelAnzahl}
        </span>
      </Button>
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
