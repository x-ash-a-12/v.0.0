import { Languages } from "lucide-react"

import { Button } from "@/components/ui/button"
import { type Sprache } from "@/lib/sprache"

type LanguageToggleProps = {
  sprache: Sprache
  onWechsel: (sprache: Sprache) => void
}

/** Beschriftung des Schalters: immer die Sprache, die er einstellt. */
const ANDERE: Record<Sprache, Sprache> = { de: "en", en: "de" }

const BESCHRIFTUNG: Record<Sprache, string> = {
  de: "Auf Deutsch wechseln",
  en: "Switch to English",
}

/**
 * Umschalter für die Dialogsprache.
 *
 * Der Prototyp erkennt die Sprache auch an der Eingabe, aber darauf kann sich
 * niemand verlassen, der vor dem Gerät steht: die Begrüßung ist deutsch, und
 * wer kein Deutsch liest, hat keinen Anlass, es trotzdem auf Englisch zu
 * versuchen. Bis hierher stand an dieser Stelle nur ein Kürzel ohne Funktion.
 *
 * Der Schalter zeigt die Sprache, in die er wechselt, nicht die aktive. Ein
 * Schalter, der seinen eigenen Zustand anzeigt, lässt offen, ob ein Druck ihn
 * bestätigt oder umstellt.
 */
export function LanguageToggle({ sprache, onWechsel }: LanguageToggleProps) {
  const ziel = ANDERE[sprache]

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={BESCHRIFTUNG[ziel]}
      title={BESCHRIFTUNG[ziel]}
      onClick={() => onWechsel(ziel)}
      className="shrink-0 gap-1.5 px-2 font-mono text-[11px] tracking-wider uppercase"
    >
      <Languages className="size-4" aria-hidden="true" />
      {ziel}
    </Button>
  )
}
