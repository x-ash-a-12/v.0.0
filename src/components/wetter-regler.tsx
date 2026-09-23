import { CloudRain, Sun } from "lucide-react"

import { WETTER, type WetterId } from "@/lib/wetter"
import { cn } from "@/lib/utils"

/**
 * Wetter als Schieberegler statt Dropdown (Wunsch des Autors, 23.09.2026).
 *
 * Zwei Stellungen, beide immer beschriftet. Der Grund des Reglers zeigt die
 * eingestellte Lage: warmer Himmel mit Sonne oder graublauer Himmel mit
 * Regenstreifen. So sieht der Versuchsleiter mit einem Blick, unter welcher
 * Bedingung der Test gerade läuft. SIMULIERT, siehe wetter.ts.
 */
export function WetterRegler({
  wert,
  onWechsel,
}: {
  wert: WetterId
  onWechsel: (wert: WetterId) => void
}) {
  const regen = wert === "regen"
  const label = (id: WetterId) =>
    WETTER.find((eintrag) => eintrag.id === id)?.label ?? id

  return (
    <button
      type="button"
      role="switch"
      aria-checked={regen}
      aria-label={`Wetter: ${label(wert)}. Umschalten auf ${label(regen ? "sonne" : "regen")}`}
      onClick={() => onWechsel(regen ? "sonne" : "regen")}
      className={cn(
        "relative grid h-8 w-40 shrink-0 grid-cols-2 items-center overflow-hidden rounded-full border text-xs font-medium transition-colors duration-300 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        regen
          ? "wetter-regen border-slate-500/60 bg-gradient-to-r from-slate-600 to-slate-500 text-white"
          : "border-amber-400/70 bg-gradient-to-r from-sky-300 to-amber-200 text-slate-900"
      )}
    >
      {/* Der Schieber liegt unter der gewählten Hälfte. */}
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-0.5 w-[calc(50%-2px)] rounded-full shadow-sm transition-all duration-300 ease-out",
          regen
            ? "left-[calc(50%+1px)] bg-slate-800/70"
            : "left-0.5 bg-white/80"
        )}
      />
      <span
        className={cn(
          "relative flex items-center justify-center gap-1 transition-opacity",
          regen && "opacity-70"
        )}
      >
        <Sun className="size-3.5" aria-hidden="true" />
        {label("sonne")}
      </span>
      <span
        className={cn(
          "relative flex items-center justify-center gap-1 transition-opacity",
          !regen && "opacity-60"
        )}
      >
        <CloudRain className="size-3.5" aria-hidden="true" />
        {label("regen")}
      </span>
    </button>
  )
}
