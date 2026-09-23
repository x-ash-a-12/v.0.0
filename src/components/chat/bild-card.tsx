import * as React from "react"

import type { BildAnzeige } from "@/lib/chat-flow"

/**
 * Ein Bild von ruhpolding.de mit Urheber und Herkunft.
 *
 * Das Bild wird von ruhpolding.de geladen. Lädt es nicht, etwa am Terminal
 * ohne Netz, verschwindet die Karte ganz, statt einen leeren Rahmen zu
 * zeigen: die Auskunft steht auch ohne Bild vollständig im Text.
 */
export function BildCard({ bild }: { bild: BildAnzeige }) {
  const [fehler, setFehler] = React.useState(false)
  if (fehler) return null

  return (
    <figure className="w-full max-w-sm overflow-hidden rounded-2xl rounded-bl-sm border bg-muted">
      <img
        src={bild.url}
        alt={bild.alt}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onError={() => setFehler(true)}
        className="aspect-[4/3] w-full object-cover"
      />
      <figcaption className="px-3 py-1.5 text-[11px] leading-snug text-muted-foreground">
        © {bild.urheber} ·{" "}
        <a
          href={bild.seite}
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          ruhpolding.de
        </a>
      </figcaption>
    </figure>
  )
}
