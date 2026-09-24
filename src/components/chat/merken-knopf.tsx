import { Check, NotebookPen } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Sprache } from "@/lib/sprache"

type MerkenKnopfProps = {
  gemerkt: boolean
  sprache: Sprache
  onMerken: () => void
}

/**
 * Der Knopf unter einer Antwort, der sie auf den Zettel legt.
 *
 * Bewusst klein und ohne neue Nachricht im Chat: das Merken soll das
 * Gespräch nicht unterbrechen. Dass es angekommen ist, zeigen der Knopf
 * selbst und der Zähler am Zettel in der Kopfzeile.
 */
export function MerkenKnopf({ gemerkt, sprache, onMerken }: MerkenKnopfProps) {
  const en = sprache === "en"

  if (gemerkt) {
    return (
      <span className="inline-flex h-7 items-center gap-1.5 px-2 text-xs text-muted-foreground">
        <Check className="size-3.5" aria-hidden="true" />
        {en ? "On your notes" : "Auf Ihrem Zettel"}
      </span>
    )
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onMerken}
      className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
    >
      <NotebookPen className="size-3.5" aria-hidden="true" />
      {en ? "Save to notes" : "Merken"}
    </Button>
  )
}
