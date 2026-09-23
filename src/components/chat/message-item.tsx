import * as React from "react"
import { Info, NotebookPen } from "lucide-react"

import { QrCard } from "@/components/chat/qr-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ChatMessage } from "@/hooks/use-chat"
import type { DataTable, InfoCard } from "@/lib/chat-flow"
import type { HinweisKarte } from "@/lib/meldungen"
import type { ZettelAnsicht } from "@/lib/zettel"
import { AgentAvatar } from "@/components/chat/agent-avatar"
import { BildCard } from "@/components/chat/bild-card"
import { zipfel } from "@/components/chat/zipfel"
import { cn } from "@/lib/utils"

const bubbleBase =
  "w-fit max-w-full rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere]"

function InfoCardView({ card }: { card: InfoCard }) {
  return (
    <Card size="sm" className="w-full max-w-full">
      <CardHeader>
        <CardTitle className="text-sm">{card.title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        {card.rows.map((row) => (
          <div
            key={row.label}
            className="grid gap-0.5 @md:grid-cols-[9rem_minmax(0,1fr)] @md:gap-3"
          >
            <span className="text-xs text-muted-foreground @md:text-sm">
              {row.label}
            </span>
            <span className="text-sm font-medium [overflow-wrap:anywhere]">
              {row.value}
            </span>
          </div>
        ))}
        {card.note ? (
          <p className="pt-1 text-xs [overflow-wrap:anywhere] text-muted-foreground">
            {card.note}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}

/**
 * Eine Tabelle in der Sprechblasenspalte.
 *
 * Die erste Zeile ist hervorgehoben, denn bei einem Fahrplan ist sie die
 * eigentliche Antwort: die nächste Abfahrt. Die übrigen stehen dabei, damit
 * sichtbar wird, wie viel Zeit bis zur übernächsten bleibt.
 *
 * Der eigene Scrollbereich ist nicht optional: das Chatfenster wird im Test
 * auf Mobilbreite gestellt, und eine Tabelle, die den Rahmen sprengt, würde
 * die ganze Seite seitlich verschieben.
 */
function DataTableView({ table }: { table: DataTable }) {
  return (
    <Card size="sm" className="w-full max-w-full">
      <CardHeader>
        <CardTitle className="text-sm">{table.title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-2">
        <div className="-mx-1 scrollbar-hidden overflow-x-auto px-1">
          <Table className="text-sm">
            <TableHeader>
              <TableRow>
                {table.columns.map((spalte) => (
                  <TableHead
                    key={spalte}
                    className="h-8 px-2 text-xs whitespace-nowrap"
                  >
                    {spalte}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {table.rows.map((zeile, index) => (
                <TableRow
                  key={zeile.join("|")}
                  className={cn(index === table.highlight && "bg-muted/60")}
                >
                  {zeile.map((zelle, spalte) => (
                    <TableCell
                      key={`${spalte}-${zelle}`}
                      className={cn(
                        "px-2 py-1.5 whitespace-nowrap",
                        spalte === 0 && "font-medium tabular-nums",
                        index === table.highlight && "font-medium"
                      )}
                    >
                      {zelle}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {table.note ? (
          <p className="text-xs [overflow-wrap:anywhere] text-muted-foreground">
            {table.note}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}

/**
 * Ein aktueller Hinweis, abgesetzt von der Antwort.
 *
 * Er soll als Meldung erkennbar sein und nicht als Teil des Gesprächs, denn
 * er stammt aus einer anderen Quelle als die Antwort. Deshalb trägt er ein
 * Symbol und in der Fußzeile Quelle und Stand.
 */
function HinweisView({ hinweis }: { hinweis: HinweisKarte }) {
  return (
    <Card size="sm" className="w-full max-w-full border-l-4 border-l-primary">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Info className="size-4 shrink-0 text-primary" aria-hidden="true" />
          {hinweis.titel}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-1.5">
        <p className="text-sm [overflow-wrap:anywhere]">{hinweis.text}</p>
        <p className="text-xs text-muted-foreground">{hinweis.herkunft}</p>
      </CardContent>
    </Card>
  )
}

/**
 * Der Zettel des Gasts.
 *
 * Wie ein Blatt aufgebaut: Titel, je Eintrag eine Überschrift mit den
 * Zeilen darunter, und unten der Absender. So sieht auch der Ausdruck aus,
 * den das Terminal ausgeben würde.
 */
function ZettelView({ zettel }: { zettel: ZettelAnsicht }) {
  return (
    <Card size="sm" className="w-full max-w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <NotebookPen
            className="size-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          {zettel.titel}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3">
        {zettel.eintraege.map((eintrag, index) => (
          <div key={eintrag.quelle} className="grid gap-0.5">
            <p className="text-sm font-medium">
              {index + 1}. {eintrag.titel}
            </p>
            {eintrag.zeilen.map((zeile) => (
              <p
                key={zeile}
                className="text-sm [overflow-wrap:anywhere] text-muted-foreground"
              >
                {zeile}
              </p>
            ))}
          </div>
        ))}
        <p className="border-t pt-2 text-xs text-muted-foreground">
          {zettel.fuss}
        </p>
      </CardContent>
    </Card>
  )
}

type MessageItemProps = {
  message: ChatMessage
  /**
   * Avatar neben dieser Nachricht: "lebt" an der laufenden Antwort, "still"
   * an einer älteren, null ohne. Eine Textblase mit Avatar trägt den Zipfel.
   */
  avatar?: "lebt" | "still" | null
}

/**
 * Memoisiert, damit die gestaffelte Ausgabe einer neuen Nachricht nicht bei
 * jedem Häppchen die gesamte bisherige Liste neu rendert.
 */
export const MessageItem = React.memo(function MessageItem({
  message,
  avatar = null,
}: MessageItemProps) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div
          className={cn(
            bubbleBase,
            "max-w-[85%] rounded-br-sm bg-primary text-primary-foreground @sm:max-w-[80%]"
          )}
        >
          {message.text}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-end gap-2">
      {avatar ? (
        <AgentAvatar zustand={avatar === "lebt" ? "wartet" : "still"} />
      ) : (
        <div className="size-10 shrink-0" aria-hidden="true" />
      )}
      <div className="flex max-w-[calc(100%-3rem)] min-w-0 flex-col @sm:max-w-[80%]">
        {message.kind === "text" ? (
          <div
            className={cn(
              bubbleBase,
              "rounded-bl-sm bg-muted text-foreground",
              avatar && zipfel
            )}
          >
            {message.text}
          </div>
        ) : message.kind === "card" ? (
          <InfoCardView card={message.card} />
        ) : message.kind === "table" ? (
          <DataTableView table={message.table} />
        ) : message.kind === "hinweis" ? (
          <HinweisView hinweis={message.hinweis} />
        ) : message.kind === "zettel" ? (
          <ZettelView zettel={message.zettel} />
        ) : message.kind === "bild" ? (
          <BildCard bild={message.bild} />
        ) : (
          <QrCard qr={message.qr} />
        )}
      </div>
    </div>
  )
})
