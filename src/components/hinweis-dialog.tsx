import * as React from "react"
import { Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { BuehneContext } from "@/lib/buehne"

/**
 * Hinweis vor der ersten Eingabe.
 *
 * Ruhpolding Tourismus ist an diesem Prototyp nicht beteiligt. Im Interview
 * am 18.09.2026 hat der Vorstand deutlich gemacht, dass ein unfertiges
 * System nicht mit dem Ort in Verbindung gebracht werden soll, nachdem ihm
 * zwei falsche Auskünfte begegnet sind. Deshalb steht die Einordnung vor dem
 * Gespräch und nicht nur klein in der Fußzeile. Wer den Prototyp bedient,
 * soll vorher wissen, von wem er stammt und dass die Antworten falsch sein
 * können.
 *
 * Der Hinweis ist nicht überspringbar. "open" wird kontrolliert und
 * "onOpenChange" tut nichts, deshalb schließen ihn weder die Escape-Taste
 * noch ein Klick daneben. Der einzige Weg weiter ist die Schaltfläche.
 *
 * Er deckt das simulierte Gerät ab, nicht die ganze Seite. Die Vorschauleiste
 * gehört dem Versuchsleiter, der Ansicht und Aufstellort noch einstellt,
 * während die Testperson den Hinweis vor sich hat. Dafür hängt der Dialog im
 * Geräterahmen statt am <body>, und modal="trap-focus" hält den Tastaturfokus
 * im Hinweis, ohne den Rest der Seite stillzulegen.
 *
 * Bestätigt wird je Sitzung, nicht dauerhaft im Browser. Am selben Gerät
 * testen mehrere Personen nacheinander, und jede soll den Hinweis sehen.
 */
export function HinweisDialog() {
  const [bestaetigt, setBestaetigt] = React.useState(false)
  const buehne = React.useContext(BuehneContext)

  // Vor dem ersten Layout steht das Portalziel noch nicht fest. Ohne diese
  // Bremse erschiene der Hinweis für einen Frame über der ganzen Seite.
  if (!buehne) return null

  return (
    <Dialog open={!bestaetigt} onOpenChange={() => {}} modal="trap-focus">
      <DialogContent
        container={buehne}
        showCloseButton={false}
        overlayClassName="absolute z-40"
        className="absolute z-40 sm:max-w-md"
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              aria-hidden
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-muted"
            >
              <Info className="size-5 text-muted-foreground" />
            </div>
            <DialogTitle>Bitte kurz lesen</DialogTitle>
          </div>
          {/*
           * Die Beschreibung rendert sonst ein <p>. Zwei Absätze darin wären
           * ungültiges HTML, deshalb das div.
           */}
          <DialogDescription render={<div />} className="space-y-2">
            <p>
              Dieser Prototyp ist eine studentische Arbeit. Ruhpolding
              Tourismus und die Tourist Information Ruhpolding sind daran
              nicht beteiligt.
            </p>
            <p>
              Die Antworten sind fest eingetragen und können falsch oder
              veraltet sein. Bitte planen Sie Ihren Aufenthalt nicht danach.
            </p>
            <p className="text-xs">
              Student project, not affiliated with Ruhpolding Tourismus. All
              answers are pre-written and may be inaccurate.
            </p>
          </DialogDescription>
        </DialogHeader>

        {/*
         * Der Bestätigungsknopf nimmt die volle Breite. Er ist der einzige
         * Weg weiter, und ein Teil der Testpersonen ist über 60. Ein kleiner
         * Knopf in der Ecke wäre dafür die falsche Größe.
         */}
        <DialogFooter className="sm:justify-stretch">
          <Button
            autoFocus
            onClick={() => setBestaetigt(true)}
            className="w-full"
          >
            Verstanden
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
