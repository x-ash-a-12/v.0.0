import * as React from "react"

import { BotAvatar } from "@/components/chat/bot-avatar"
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
        <div className="-mx-1 overflow-x-auto px-1">
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

type MessageItemProps = {
  message: ChatMessage
  showAvatar: boolean
}

/**
 * Memoisiert, damit die gestaffelte Ausgabe einer neuen Nachricht nicht bei
 * jedem Häppchen die gesamte bisherige Liste neu rendert.
 */
export const MessageItem = React.memo(function MessageItem({
  message,
  showAvatar,
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
      {showAvatar ? (
        <BotAvatar />
      ) : (
        <div className="size-8 shrink-0" aria-hidden="true" />
      )}
      <div className="flex max-w-[calc(100%-2.5rem)] min-w-0 flex-col @sm:max-w-[80%]">
        {message.kind === "text" ? (
          <div
            className={cn(bubbleBase, "rounded-bl-sm bg-muted text-foreground")}
          >
            {message.text}
          </div>
        ) : message.kind === "card" ? (
          <InfoCardView card={message.card} />
        ) : message.kind === "table" ? (
          <DataTableView table={message.table} />
        ) : (
          <QrCard qr={message.qr} />
        )}
      </div>
    </div>
  )
})
