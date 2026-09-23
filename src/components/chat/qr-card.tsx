import * as React from "react"
import QRCode from "qrcode"

import { FileText, MapPin } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { QrPayload } from "@/lib/chat-flow"
import { cn } from "@/lib/utils"

/**
 * Der Code entsteht im Browser, nicht über einen Bilddienst. Das Terminal
 * muss auch ohne Netz funktionieren.
 */
export function QrCard({ qr }: { qr: QrPayload }) {
  const [svg, setSvg] = React.useState<string | null>(null)

  React.useEffect(() => {
    let abgebrochen = false
    QRCode.toString(qr.url, {
      type: "svg",
      margin: 1,
      errorCorrectionLevel: "M",
    })
      .then((ergebnis) => {
        if (!abgebrochen) setSvg(ergebnis)
      })
      .catch(() => {
        if (!abgebrochen) setSvg(null)
      })
    return () => {
      abgebrochen = true
    }
  }, [qr.url])

  // Zwei Arten von Codes stehen oft direkt untereinander: der Weg zum
  // Ausgangspunkt und der Flyer dazu. Rahmen und Symbol unterscheiden sie,
  // damit niemand den falschen scannt.
  const flyer = qr.art === "flyer"
  const Symbol = flyer ? FileText : MapPin

  return (
    <Card
      size="sm"
      className={cn(
        "w-full max-w-full",
        flyer && "border-2 border-primary bg-muted/40"
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Symbol
            className={cn(
              "size-4 shrink-0",
              flyer ? "text-primary" : "text-muted-foreground"
            )}
            aria-hidden="true"
          />
          {qr.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid justify-items-center gap-2">
        {/*
          Fester weißer Grund mit dunklen Modulen: ein QR-Code auf dunklem
          Grund wird von vielen Kameras nicht gelesen. Das ist die einzige
          Stelle im Projekt, an der eine feste Farbe richtig ist.
        */}
        <div
          // 176 px minus 2x8 px Innenabstand: der Code selbst bleibt bei 160 px.
          className={cn(
            "size-44 rounded-lg bg-white p-2 [&>svg]:size-full",
            flyer && "ring-4 ring-primary"
          )}
          role="img"
          aria-label={qr.title}
          dangerouslySetInnerHTML={svg ? { __html: svg } : undefined}
        />
        <p className="text-center text-xs text-muted-foreground [overflow-wrap:anywhere]">
          {qr.hint}
        </p>
      </CardContent>
    </Card>
  )
}
