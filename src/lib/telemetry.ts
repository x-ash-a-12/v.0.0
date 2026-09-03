/**
 * Interaktionsprotokoll für die Think-Aloud-Tests.
 *
 * Ohne dieses Protokoll beruht die Auswertung auf Erinnerung. Es hält fest,
 * was eingegeben wurde, wie der Prototyp es eingeordnet hat und welchen Weg
 * das Gespräch genommen hat.
 *
 * Alles nur im Speicher: kein Netzwerkaufruf, kein localStorage, kein
 * personenbezogenes Datum. Das Protokoll lebt so lange wie die Seite offen
 * ist.
 */
export type LogEintrag = {
  /** Millisekunden seit Sitzungsbeginn. */
  t: number
  art: "eingabe" | "chip" | "antwort" | "reset"
  /** Roheingabe bei "eingabe", Beschriftung bei "chip". */
  text?: string
  treffer?: "hit" | "ambiguous" | "miss"
  /**
   * Bei einem Treffer die Stufe, die ihn erzeugt hat. In der Auswertung
   * unterscheidbar zu machen, ob eine Eingabe am Wortschatz hing oder am
   * Gesprächszustand, ist der Unterschied zwischen "es hat funktioniert" und
   * einer Aussage darüber, warum.
   */
  grund?:
    | "meta"
    | "auswahl"
    | "lexikon"
    | "anapher"
    | "wiederholung"
    | "navigation"
    | "zielwahl"
    | "empfehlung"
    | "fahrplan"
  knoten?: string
  standort?: string
}

const beginn = Date.now()
const eintraege: LogEintrag[] = []

export function protokolliere(eintrag: Omit<LogEintrag, "t">): void {
  eintraege.push({ t: Date.now() - beginn, ...eintrag })
}

/** Kopie des bisherigen Protokolls. */
export function protokoll(): LogEintrag[] {
  return [...eintraege]
}

function zeitstempel(): string {
  const jetzt = new Date()
  const zahl = (wert: number) => String(wert).padStart(2, "0")
  return [
    jetzt.getFullYear(),
    zahl(jetzt.getMonth() + 1),
    zahl(jetzt.getDate()),
    `${zahl(jetzt.getHours())}${zahl(jetzt.getMinutes())}`,
  ].join("-")
}

/**
 * Lädt das Protokoll als JSON herunter.
 *
 * Der Blob entsteht im Browser, es geht nichts an einen Server.
 */
export function exportiere(): void {
  const inhalt = JSON.stringify(
    {
      erzeugt: new Date().toISOString(),
      dauerMs: Date.now() - beginn,
      eintraege,
    },
    null,
    2
  )

  const blob = new Blob([inhalt], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `protokoll-${zeitstempel()}.json`
  link.click()
  URL.revokeObjectURL(url)
}
