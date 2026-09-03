import * as React from "react"
import {
  Download,
  Expand,
  Monitor,
  MonitorSmartphone,
  Smartphone,
  Tablet,
  type LucideIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { StandortContext, STANDORTE } from "@/lib/location"
import { exportiere } from "@/lib/telemetry"
import { cn } from "@/lib/utils"

type Device = {
  id: string
  label: string
  icon: LucideIcon
  /** Feste Rahmengröße in CSS-Pixeln, oder null für die volle Fläche. */
  size: { w: number; h: number } | null
}

const DEVICES: Device[] = [
  { id: "responsive", label: "Responsiv", icon: Expand, size: null },
  { id: "mobile", label: "Mobil", icon: Smartphone, size: { w: 390, h: 844 } },
  { id: "tablet", label: "Tablet", icon: Tablet, size: { w: 834, h: 1112 } },
  { id: "desktop", label: "Desktop", icon: Monitor, size: { w: 1280, h: 800 } },
  {
    id: "terminal",
    label: "Terminal",
    icon: MonitorSmartphone,
    size: { w: 1080, h: 1920 },
  },
]

function DeviceStage({
  device,
  children,
}: {
  device: Device
  children: React.ReactNode
}) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [scale, setScale] = React.useState(1)
  const size = device.size

  React.useEffect(() => {
    if (!size) return
    const el = ref.current
    if (!el) return

    const compute = () => {
      const rect = el.getBoundingClientRect()
      const next = Math.min(
        1,
        (rect.width - 24) / size.w,
        (rect.height - 24) / size.h,
      )
      setScale(next > 0 ? next : 1)
    }

    compute()
    const observer = new ResizeObserver(compute)
    observer.observe(el)
    return () => observer.disconnect()
  }, [size])

  return (
    <div
      ref={ref}
      className={cn(
        "flex min-h-0 flex-1 items-center justify-center overflow-hidden",
        size && "p-3",
      )}
    >
      <div
        className={cn(
          size
            ? "shrink-0 overflow-hidden rounded-[2rem] border-[6px] border-neutral-800 bg-background shadow-2xl dark:border-neutral-600"
            : "h-full w-full",
        )}
        style={
          size
            ? {
                width: size.w,
                height: size.h,
                transform: `scale(${scale})`,
                transformOrigin: "center",
              }
            : undefined
        }
      >
        {children}
      </div>
    </div>
  )
}

export function DevicePreview({ children }: { children: React.ReactNode }) {
  const [activeId, setActiveId] = React.useState("responsive")
  const device = DEVICES.find((entry) => entry.id === activeId) ?? DEVICES[0]

  // Der Aufstellort ist ein Werkzeug des Versuchsleiters und gehört deshalb
  // in die Vorschauleiste, nicht in die Chat-Oberfläche.
  const [standortId, setStandortId] = React.useState(STANDORTE[0].id)
  const standort =
    STANDORTE.find((eintrag) => eintrag.id === standortId) ?? STANDORTE[0]

  return (
    <div className="flex h-svh w-full flex-col overflow-hidden bg-muted/40">
      <div className="flex flex-wrap items-center gap-1.5 border-b bg-background px-3 py-2">
        <span className="mr-1 text-xs font-medium text-muted-foreground">
          Ansicht
        </span>
        {DEVICES.map((entry) => {
          const Icon = entry.icon
          const active = entry.id === activeId
          return (
            <Button
              key={entry.id}
              type="button"
              size="sm"
              variant={active ? "default" : "ghost"}
              onClick={() => setActiveId(entry.id)}
              aria-pressed={active}
              className={cn("shrink-0 gap-1.5", !active && "text-muted-foreground")}
            >
              <Icon className="size-3.5" />
              <span className="hidden sm:inline">{entry.label}</span>
            </Button>
          )
        })}

        <span className="mr-1 ml-3 text-xs font-medium text-muted-foreground">
          Standort
        </span>
        <Select
          value={standortId}
          // Base UI meldet null, wenn die Auswahl geleert wird. Der Prototyp
          // braucht immer einen Aufstellort, deshalb bleibt der bisherige.
          onValueChange={(wert) => setStandortId(wert ?? standortId)}
        >
          <SelectTrigger size="sm" className="w-64" aria-label="Aufstellort">
            {/* Base UI kennt nur den Wert, das Label steht in STANDORTE. */}
            <SelectValue>
              {(wert) =>
                STANDORTE.find((eintrag) => eintrag.id === wert)?.label ?? ""
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STANDORTE.map((eintrag) => (
              <SelectItem key={eintrag.id} value={eintrag.id}>
                {eintrag.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Auswertung der Tests, ebenfalls Werkzeug des Versuchsleiters. */}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={exportiere}
          className="ml-auto shrink-0 gap-1.5 text-muted-foreground"
        >
          <Download className="size-3.5" />
          <span className="hidden sm:inline">Protokoll</span>
        </Button>
      </div>

      <StandortContext.Provider value={standort}>
        <DeviceStage device={device}>{children}</DeviceStage>
      </StandortContext.Provider>
    </div>
  )
}
