import { AgentFigur, type AgentZustand } from "@/components/chat/agent-figur"
import { cn } from "@/lib/utils"

/**
 * Die Figur des Assistenten im Kreis, neben der letzten Blase einer Antwort.
 *
 * Wie in gängigen Chat-Oberflächen steht der Avatar an der untersten Blase
 * einer Folge. Kommt eine neue Blase dazu, wandert er mit nach unten. Nur der
 * Avatar der laufenden Antwort bewegt sich (Blinzeln, beim Nachdenken ein
 * Seitenblick). Blinzelten alle im Verlauf gleichzeitig, wirkte das wie eine
 * Reihe Puppen.
 *
 * Verworfen am 23.09.2026, in dieser Reihenfolge: eine Bühne über dem Chat
 * mit eigener Sprechblase, eine Spalte mit Himmel, Bergen und Theke, und eine
 * freigestellte große Figur links, die neben die sprechende Blase fährt. Der
 * Autor wollte die Figur zurück im Kreis, etwas größer als das frühere
 * Robotersymbol (32 px).
 */
export function AgentAvatar({
  zustand = "still",
  className,
}: {
  zustand?: AgentZustand | "still"
  className?: string
}) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "size-10 shrink-0 overflow-hidden rounded-full bg-[var(--agent-grund)] ring-1 ring-border",
        className
      )}
    >
      <AgentFigur
        zustand={zustand === "still" ? undefined : zustand}
        className="size-full"
      />
    </div>
  )
}
