import * as React from "react"
import QRCode from "qrcode"

import { ExternalLink, FileText, Globe, MapPin } from "lucide-react"

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

  // Bis zu drei Arten von Codes stehen oft direkt untereinander: der Weg zum
  // Ausgangspunkt, der Flyer und die Seite auf ruhpolding.de. Rahmen und
  // Symbol unterscheiden sie, damit niemand den falschen scannt.
  const flyer = qr.art === "flyer"
  const web = qr.art === "web"
  const Symbol = flyer ? FileText : web ? Globe : MapPin

  return (
    <Card
      size="sm"
      className={cn(
        "w-full max-w-full",
        flyer && "border-2 border-primary bg-muted/40",
        web && "border-2 border-dashed border-sky-600/70 dark:border-sky-400/70"
      )}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Symbol
            className={cn(
              "size-4 shrink-0",
              flyer
                ? "text-primary"
                : web
                  ? "text-sky-700 dark:text-sky-400"
                  : "text-muted-foreground"
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
        {/*
          Derselbe Link zum Anklicken. Am Terminal scannt der Gast den Code,
          im Browser-Test führt der Link direkt dorthin (Wunsch des Autors,
          23.09.2026). Lange Adressen werden nach zwei Zeilen gekürzt, das
          Ziel des Links bleibt vollständig.
        */}
        <a
          href={qr.url}
          target="_blank"
          rel="noopener noreferrer"
          title={qr.url}
          className="flex max-w-full items-start gap-1 text-xs text-sky-700 underline underline-offset-2 hover:text-sky-900 dark:text-sky-400 dark:hover:text-sky-300"
        >
          <ExternalLink className="mt-0.5 size-3 shrink-0" aria-hidden="true" />
          <span className="line-clamp-2 break-all">{qr.url}</span>
        </a>
      </CardContent>
    </Card>
  )
}
