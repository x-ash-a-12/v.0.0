/**
 * Bilder von ruhpolding.de.
 *
 * Wenige und nur an einer Stelle: in der Detailauskunft zu einem Ziel, das
 * der Gast selbst gewählt hat, genau ein Bild. In Vorschlagslisten und
 * Themenantworten stehen keine, damit drei Vorschläge nicht zu drei Bildern
 * werden (Vorgabe des Autors, 23.09.2026: "nicht zu viele").
 *
 * Die Bilder werden von ruhpolding.de geladen, nicht kopiert. Sie gehören
 * den genannten Rechteinhabern. Jedes Bild trägt deshalb den Urheber so, wie
 * ruhpolding.de ihn an dem Bild nennt, und die Seite, auf der es steht.
 * Abgerufen am 23.09.2026. Die Adressen sind signiert: eine andere Größe als
 * die, die die Seite selbst einbindet, liefert der Bildserver nicht (403).
 *
 * VOR DER VERÖFFENTLICHUNG KLÄREN: Der Prototyp liegt öffentlich auf GitHub
 * Pages. Für die Nutzung der Bilder dort braucht es die Zustimmung von
 * Ruhpolding Tourismus.
 */
export type Bild = {
  url: string
  alt: string
  altEn: string
  /** Urheber, wie ruhpolding.de ihn am Bild angibt. */
  urheber: string
  /** Seite auf ruhpolding.de, auf der das Bild steht. */
  seite: string
}

const B = "https://www.ruhpolding.de/images"

export const BILDER = {
  tandemflug: {
    url: `${B}/UH5PmRb-n98/rs:fill:1100:800/cb:/crop:4200:2800:nowe:0:0/gravity:fp:0.5:0.5/aHR0cHM6Ly93d3cucnVocG9sZGluZy5kZS9maWxlYWRtaW4vcnVocG9sZGluZy9KYWhyZXN6ZWl0ZW4vU29tbWVyL0dsZWl0c2NoaXJtZmxpZWdlbi9HbGVpdHNjaGlybWZsaWVnZW5fXzEzXy5qcGc`,
    alt: "Tandem-Gleitschirmflug über Ruhpolding",
    altEn: "Tandem paragliding flight above Ruhpolding",
    urheber: "Ruhpolding Tourismus/Andreas Plenk",
    seite: "https://www.ruhpolding.de/der-traum-vom-fliegen",
  },
  flyline: {
    url: `${B}/B2YE4JO18kA/rs:fill:1100:0/cb:/g:ce/aHR0cHM6Ly9pbXhwbGF0Zm9ybS1jdXN0LWN0LmZzbjEueW91ci1vYmplY3RzdG9yYWdlLmNvbS9tZWRpYS9GbHklMjBMaW5lLTY0LmpwZw`,
    alt: "Fahrt mit der Fly-Line am Unternberg",
    altEn: "A ride on the Fly-Line at the Unternberg",
    urheber: "meine Bergwelt GmbH",
    seite: "https://www.ruhpolding.de/meine-bergwelt-fly-line-am-unternberg",
  },
  golf: {
    url: `${B}/CcwuaEarDNY/rs:fill:1100:0/cb:/crop:1920:1280:nowe:0:0/gravity:fp:0.5:0.5/aHR0cHM6Ly93d3cucnVocG9sZGluZy5kZS9maWxlYWRtaW4vcnVocG9sZGluZy9GcmVpemVpdGFrdGl2aXRhZXRlbi9Hb2xmX0NsdWJfUnVocG9sZGluZy9OUThBMjA3NS5qcGc`,
    alt: "Golfplatz in Ruhpolding mit Blick auf die Berge",
    altEn: "Golf course in Ruhpolding with a view of the mountains",
    urheber: "Ruhpolding Tourismus/Andreas Plenk",
    seite: "https://www.ruhpolding.de/golf",
  },
  adventuregolf: {
    url: `${B}/B1xoPF-CCwY/rs:fill:1100:0/cb:/g:ce/aHR0cHM6Ly9pbXhwbGF0Zm9ybS1jdXN0LWN0LmZzbjEueW91ci1vYmplY3RzdG9yYWdlLmNvbS9tZWRpYS9hZHZlbnR1cmVfZ29sZl9wYXJrX3J1aHBvbGRpbmctMS5qcGc`,
    alt: "Adventure Golf Park Ruhpolding",
    altEn: "Adventure Golf Park Ruhpolding",
    urheber: "Ruhpolding Tourismus/Andreas Plenk",
    seite: "https://www.ruhpolding.de/adventure-golf-park-ruhpolding-1",
  },
  minigolf: {
    url: `${B}/u9eC3KuaRc4/rs:fill:1100:0/cb:/g:ce/aHR0cHM6Ly9kYW0uZGVzdGluYXRpb24ub25lLzEwNDY1OC9hY2Q4MmM5ZTE3ODc0MDk5NTBkNzZiZjBjZDdmNDU5ZGM0NTRiZThjNTZlMjE2ZmFmYTk1ODdmZDkwOTg2Mzg3L21pbmlnb2xmLmpwZw`,
    alt: "Minigolf am Kurhaus",
    altEn: "Minigolf at the Kurhaus",
    urheber: "Ruhpolding Tourismus GmbH",
    seite: "https://www.ruhpolding.de/minigolf-1",
  },
  bergfit: {
    url: `${B}/6fmK1AJ4FWU/rs:fill:551:0/cb:/g:ce/aHR0cHM6Ly9pbWcudG91cmluZnJhLmNvbS90b3VyaW5mcmEvdG91cnMvNjExMTUzL2ltYWdlcy9DYVBUajBTTW85RHRQbURVMkMza0JBWG1ySThqd3JkV2xnS0lsdjBlLmpwZw`,
    alt: "Wiegeliege am Adlerhügel mit Blick auf Ruhpolding",
    altEn: "Swing lounger on the Adlerhügel overlooking Ruhpolding",
    urheber: "Ruhpolding Tourismus/Andreas Plenk",
    seite: "https://www.ruhpolding.de/bergfit",
  },
  holzknechtmuseum: {
    url: `${B}/inVIm4l4xa0/rs:fill:1100:0/cb:/g:ce/aHR0cHM6Ly9pbXhwbGF0Zm9ybS1jdXN0LWN0LmZzbjEueW91ci1vYmplY3RzdG9yYWdlLmNvbS9tZWRpYS9ob2x6a25lY2h0bXVzZXVtX2F1c3Nlbi0zLmpwZw`,
    alt: "Holzknechtmuseum von außen",
    altEn: "The woodcutters' museum from outside",
    urheber: "Ruhpolding Tourismus/Andreas Plenk",
    seite: "https://www.ruhpolding.de/holzknechtmuseum-chiemgau",
  },
  heimatmuseum: {
    url: `${B}/P53nGkTKyPM/rs:fill:1100:0/cb:/g:ce/aHR0cHM6Ly9kYW0uZGVzdGluYXRpb24ub25lLzEwNDY1MS8yMWNiMTdhNTZmOTdiZGQwYTMwZmIxYTE0OGVmOTY0MWM3ODczNzBhNWVlOWIzMWZlYzQ1OWY5MTliYjNlYjhkL2hlaW1hdG11c2V1bS1ydWhwb2xkaW5nLmpwZw`,
    alt: "Heimatmuseum Ruhpolding",
    altEn: "Ruhpolding local history museum",
    urheber: "Ruhpolding Tourismus",
    seite: "https://www.ruhpolding.de/heimatmuseum-ruhpolding-1",
  },
  hoerndlwand: {
    url: `${B}/4InwZ2LwwxE/rs:fill:605:0/cb:/crop:3603:1400:nowe:0:0/gravity:fp:0.74576741604219:0.51785714285714/aHR0cHM6Ly93d3cucnVocG9sZGluZy5kZS9maWxlYWRtaW4vcnVocG9sZGluZy9KYWhyZXN6ZWl0ZW4vU29tbWVyL0dpcGZlbC9QYW5vcmFtYV9Ib2VybmRsd2FuZC5qcGc`,
    alt: "Gipfelkreuz der Hörndlwand mit Bergdohlen",
    altEn: "Summit cross of the Hörndlwand with alpine choughs",
    urheber: "Ruhpolding Tourismus GmbH/Andreas Plenk",
    seite: "https://www.ruhpolding.de/wandern",
  },
  coaster: {
    url: `${B}/lwf2ond-OOM/rs:fill:1100:0/cb:/g:ce/aHR0cHM6Ly9pbXhwbGF0Zm9ybS1jdXN0LWN0LmZzbjEueW91ci1vYmplY3RzdG9yYWdlLmNvbS9tZWRpYS9tZ18zNzc4LmpwZw`,
    alt: "Rodelspaß mit Kind auf dem Chiemgau Coaster",
    altEn: "Tobogganing with a child on the Chiemgau Coaster",
    urheber: "Chiemgau Coaster Ruhpolding",
    seite: "https://www.ruhpolding.de/chiemgau-coaster-ruhpolding",
  },
} satisfies Record<string, Bild>

export type BildId = keyof typeof BILDER
