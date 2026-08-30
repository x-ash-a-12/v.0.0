import { Button } from "@/components/ui/button"
import type { Chip } from "@/lib/chat-flow"

type QuickRepliesProps = {
  chips: Chip[]
  onSelect: (chip: Chip) => void
}

export function QuickReplies({ chips, onSelect }: QuickRepliesProps) {
  if (chips.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Vorschläge">
      {chips.map((chip) => (
        <Button
          key={`${chip.to}:${chip.label}`}
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onSelect(chip)}
          className="h-auto max-w-full min-h-9 rounded-full py-1.5 text-left leading-snug whitespace-normal [overflow-wrap:anywhere]"
        >
          {chip.label}
        </Button>
      ))}
    </div>
  )
}
