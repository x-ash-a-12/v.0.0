import * as React from "react"
import { LockKeyhole } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

/**
 * Passwortseite vor dem Prototyp.
 *
 * Der Prototyp zeigt Bilder von ruhpolding.de. Die Zustimmung von Ruhpolding
 * Tourismus dazu steht noch aus (siehe bilder.ts), der Prototyp muss aber
 * vorher für Tests erreichbar sein. Deshalb steht er hinter einem Passwort,
 * das der Autor an Testpersonen und Betreuung weitergibt (23.09.2026).
 *
 * Das ist ein Sichtschutz, keine Zugriffskontrolle. GitHub Pages liefert nur
 * statische Dateien aus, geprüft wird also im Browser. Wer den Link hat,
 * sieht ohne Passwort nichts, und Suchmaschinen finden nichts (noindex in
 * index.html). Wer den Code liest, kommt vorbei.
 *
 * Im Code steht nur der SHA-256-Hash des Passworts. Freigeschaltet wird je
 * Tab, wie beim Hinweisdialog: Am selben Gerät testen mehrere Personen
 * nacheinander.
 */
const HASH = "9af15b336e6a9619928537df30b2e6a2376569fcf9d7e773eccede65606529a0"
const SCHLUESSEL = "zugang"

async function sha256(text: string): Promise<string> {
  const daten = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest("SHA-256", daten)
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

function schonFrei(): boolean {
  try {
    return sessionStorage.getItem(SCHLUESSEL) === HASH
  } catch {
    return false
  }
}

export function Zugang({ children }: { children: React.ReactNode }) {
  const [frei, setFrei] = React.useState(schonFrei)
  const [eingabe, setEingabe] = React.useState("")
  const [falsch, setFalsch] = React.useState(false)

  if (frei) return children

  async function pruefe(event: React.FormEvent) {
    event.preventDefault()
    if ((await sha256(eingabe)) === HASH) {
      try {
        sessionStorage.setItem(SCHLUESSEL, HASH)
      } catch {
        // Ohne Speicher gilt die Freischaltung bis zum Neuladen.
      }
      setFrei(true)
    } else {
      setFalsch(true)
      setEingabe("")
    }
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-background px-4">
      <form
        onSubmit={pruefe}
        className="grid w-full max-w-xs gap-4 rounded-xl border bg-card p-6 text-card-foreground shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div
            aria-hidden
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-md bg-muted"
          >
            <LockKeyhole className="size-5 text-muted-foreground" />
          </div>
          <h1 className="text-base font-semibold">Prototyp TI-Agent</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Der Prototyp ist nur für Testpersonen freigegeben. Bitte geben Sie das
          Passwort ein.
        </p>
        <div className="grid gap-1.5">
          <label htmlFor="passwort" className="text-sm font-medium">
            Passwort
          </label>
          <Input
            id="passwort"
            type="password"
            autoComplete="off"
            autoFocus
            value={eingabe}
            aria-invalid={falsch || undefined}
            aria-describedby={falsch ? "passwort-fehler" : undefined}
            onChange={(event) => {
              setEingabe(event.target.value)
              setFalsch(false)
            }}
          />
          {falsch && (
            <p id="passwort-fehler" className="text-sm text-destructive">
              Das Passwort stimmt nicht.
            </p>
          )}
        </div>
        <Button type="submit" disabled={!eingabe}>
          Öffnen
        </Button>
      </form>
    </main>
  )
}
