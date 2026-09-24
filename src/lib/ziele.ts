import type { FlyerId } from "@/lib/flyer"
import type { WebId } from "@/lib/web"
import type { BildId } from "@/lib/bilder"
import type { Oeffnung } from "@/lib/jetzt"
import {
  BERGBAHNEN,
  EVENTS,
  FAMILIE,
  GASTRONOMIE,
  KULTUR,
  PARKEN,
  WANDERN,
  WINTER,
} from "@/lib/daten"

/**
 * Die Orte, zu denen der Prototyp hinführen kann.
 *
 * Bisher kannte er nur Knoten, also Antworten. Ein Knoten kann erzählen, dass
 * es eine Gondelbahn gibt, aber er ist kein Ort, und deshalb ließ sich "wie
 * komme ich da hin" nicht beantworten. Im Testlauf vom 03.09. um 11:57 hat
 * genau das dreimal hintereinander dieselbe Antwort erzeugt.
 *
 * Ein Ziel ist ein Ort mit Namen, einer Beschreibung und einer Kartenabfrage.
 * Damit lassen sich drei Dinge tun, die vorher nicht gingen: Ziele
 * vorschlagen, eines davon per Freitext auswählen und den Weg dorthin als
 * QR-Code ausgeben.
 *
 * Seit dem Interview mit der Auskunft am 22.09.2026 gilt dabei deren Regel:
 * "Bevor ich falsche Informationen herausgebe, gebe ich lieber keine heraus"
 * (KA [00:23:34]). Ein Ziel, dessen Angaben nicht belegt sind, bleibt im
 * Register, damit es gefunden und hingeführt werden kann. Vorgeschlagen wird
 * es nicht mehr, und beschrieben nur mit dem, was belegt ist.
 */

/** Wofür sich jemand interessiert, gefragt wie am Schalter. */
export type Interesse =
  "berge" | "rad" | "familie" | "kultur" | "gemuetlich" | "sport"

/** Wer mitkommt. Frau Amort fragt nach Kindern, Kinderwagen und Älteren. */
export type Begleitung = "kinder" | "senioren" | "erwachsene"

/**
 * Wie jemand auf den Berg will, zusammen mit der Kondition.
 *
 * Die beiden Fragen stellt die Auskunft direkt hintereinander: "Wollen Sie
 * hinauflaufen oder hinauffahren?" und "Sind Sie schon einmal in den Bergen
 * gegangen?" (KA [00:11:53], [00:11:57]). Deshalb stehen sie hier als ein
 * Merkmal.
 */
export type Aufstieg = "bahn" | "geuebt" | "gemuetlich"

export type Ziel = {
  id: string
  /** Anzeigename, so wie er in der Empfehlung und über dem QR-Code steht. */
  name: string
  nameEn: string
  /**
   * Der Suchbegriff für die Karte, und zugleich die Überschrift über dem
   * QR-Code.
   *
   * Getrennt vom Anzeigenamen, weil beide unterschiedliche Aufgaben haben:
   * "Rauschberg mit der Gondelbahn" liest sich im Vorschlag gut und findet
   * auf der Karte nichts. Gesucht wird der Ort, an den man tatsächlich fährt,
   * bei einer Bergtour also der Parkplatz am Einstieg und nicht der Gipfel.
   */
  suche: string
  /** Was dort ist, ein Satz. */
  beschreibung: string
  beschreibungEn: string
  /**
   * Die harte Angabe darunter: Länge, Gehzeit, Preis, Öffnung. Steht in der
   * Empfehlung als eigene Zeile, damit die drei Vorschläge vergleichbar sind.
   */
  eckdaten: string
  eckdatenEn: string
  /** Thema, unter dem das Ziel im Gesprächsbaum hängt. */
  topic: string
  /**
   * Schlüssel für {naehe:...}, wenn der Aufstellort eine Wegangabe dorthin
   * kennt. Fehlt er, entfällt die Entfernungsangabe.
   */
  naehe?: string
  /**
   * Das Ziel braucht einen ganzen Tag.
   *
   * Öffnungszeiten allein reichen nicht, um sinnvoll vorzuschlagen: Das
   * Sonntagshorn hat keine Öffnungszeit und ist trotzdem der falsche
   * Vorschlag um acht Uhr abends. Neun Stunden Gehzeit passen nicht mehr in
   * den Tag, und das weiß jeder außer einem Prototyp, dem man es nicht sagt.
   */
  tagesfuellend?: boolean
  /**
   * Öffnungszeiten, soweit belegt.
   *
   * Fehlt das Feld, macht der Prototyp keine Aussage darüber, ob gerade offen
   * ist. Das ist der Normalfall: für die meisten Gasthäuser im Ort ist keine
   * offizielle Angabe zu finden, und eine geratene Öffnungszeit wäre die
   * schädlichste Sorte Falschauskunft, weil jemand danach losgeht.
   */
  oeffnung?: Oeffnung
  /**
   * Wonach jemand sucht, der dieses Ziel meint. Wird gegen die Eingabe
   * geprüft, wenn ein Ziel gewählt oder angesteuert wird.
   */
  stichwoerter: string[]
  /**
   * Warum die Angaben zu diesem Ziel nicht belegt sind.
   *
   * Ein solches Ziel wird nie vorgeschlagen. Fragt jemand direkt danach, gibt
   * es den Kartenlink und den offenen Satz, dass nichts Gesichertes vorliegt.
   * Die Auskunft nimmt Betriebe ohne aktuelle Angaben aus ihrer Liste
   * (KA [00:23:24]), das hier ist dieselbe Regel.
   */
  ungesichert?: string
  /**
   * Das Ziel ist belegt außer Betrieb. Anders als bei `ungesichert` ist das
   * eine gesicherte Aussage und wird genau so ausgegeben.
   */
  ausserBetrieb?: { de: string; en: string }
  /* Merkmale für die Bedarfsklärung (bedarf.ts). */
  interessen?: Interesse[]
  /** Bei Regen die richtige Wahl, laut ruhpolding.de/bei-regen. */
  drinnen?: boolean
  /** Bei Regen kein Betrieb oder nicht zu empfehlen. */
  beiRegenNicht?: boolean
  aufstieg?: Aufstieg
  /** Für wen das Ziel nicht passt. */
  nichtFuer?: Begleitung[]
  /** Passt auch, wenn nur ein Tag oder wenig Zeit bleibt. */
  kurz?: boolean
  /*
   * Die Angaben für die Detailauskunft. Der Gast soll erfahren, für wen sich
   * ein Ziel eignet und worauf er achten muss, bevor er losgeht. Alles hier
   * stammt aus dem genannten Flyer oder einer anderen belegten Quelle.
   */
  /** Der Flyer, aus dem die Angaben stammen und der dazu angeboten wird. */
  flyer?: FlyerId
  /**
   * Die Seite auf ruhpolding.de, die der Gast zu diesem Ziel mitnehmen kann.
   * Fehlt sie, gilt die Seite, die zum Flyer gehört (webVon).
   */
  web?: WebId
  /**
   * Ein Bild von ruhpolding.de für die Detailauskunft (bilder.ts). Nur dort,
   * nie in Vorschlagslisten.
   */
  bild?: BildId
  /** Einstufung laut Flyer, nur wo der Flyer eine nennt. */
  schwierigkeit?: "leicht" | "mittel" | "schwer"
  /** Für wen sich das Ziel eignet. */
  geeignet?: { de: string; en: string }
  /** Worauf man achten muss, Grenzen und Anforderungen. */
  achtung?: { de: string; en: string }
  /**
   * Öffnungszeiten spielen eine Rolle, sind aber nicht verlässlich
   * hinterlegt. Die Detailauskunft verweist dann an die Tourist-Information,
   * die sie nachfragt, statt eine zu nennen (KA [00:06:11], [00:21:28]).
   */
  zeitenErfragen?: boolean
  /**
   * Der Flyer nennt den Weg ausdrücklich als kinderwagentauglich. Wer mit
   * Kinderwagen fragt, bekommt nur solche Wege vorgeschlagen.
   */
  kinderwagen?: boolean
}

/**
 * Google-Maps-Suchabfrage für ein Ziel in Ruhpolding.
 *
 * Keine erfundene Tatsache, sondern eine Abfrage, die die Karte selbst
 * beantwortet. Deshalb darf sie im Prototyp stehen, obwohl sonst nichts
 * erfunden wird.
 */
export function mapsSuche(ziel: string): string {
  return ORTE[ziel] ?? mapsSucheFrei(`${ziel} Ruhpolding`)
}

/** Dieselbe Abfrage ohne den Ortszusatz, für Ziele außerhalb. */
export function mapsSucheFrei(anfrage: string): string {
  return (
    ORTE[anfrage] ??
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      anfrage
    )}`
  )
}

/**
 * Feste Orte statt Suche, dort, wo die Suche ins Leere lief.
 *
 * Am 23.09.2026 lieferten zwölf Suchen "Kein Ergebnis" oder einen falschen
 * Ort, unter anderem die Talstationen beider Bergbahnen und der Bahnhof. Der
 * Autor hat die richtigen Orte in Google Maps herausgesucht. Verlinkt ist
 * jeweils die Orts-ID (cid) aus seinem Link: Sie trifft genau diesen Ort und
 * hält die Adresse kurz, der QR-Code wird dadurch gröber und leichter lesbar.
 * Alle am selben Tag geöffnet und mit Name und Adresse geprüft.
 */
const ORTE: Record<string, string> = Object.fromEntries(
  (
    [
      ["Unternbergbahn", "1010664599588463926"],
      ["Rauschbergbahn Talstation", "1413801206378716248"],
      ["Parkplatz Holzknechtmuseum", "10905605612371705295"],
      ["Glockenschmiede Museum", "13491746658430805616"],
      ["Parkplatz Langer Sand", "10367882696966016406"],
      ["Naturschutzgebiet Drei-Seen-Gebiet", "3268017886805810999"],
      ["Egglbrücke", "14539272316207013853"],
      ["Bahnhof Ruhpolding", "6171278910785915893"],
      ["Chiemsee-Alpenland Tourismus", "8813448434298382846"],
      ["Tourist Information Salzburg Hauptbahnhof", "11764306211466983839"],
      ["Tourist Information am Marienplatz München", "4791345877669129070"],
    ] as const
  ).map(([ort, cid]) => [ort, `https://www.google.com/maps?cid=${cid}`])
)

/** Die Seite auf ruhpolding.de, die zu einem Flyer gehört. */
const FLYER_WEB: Partial<Record<FlyerId, WebId>> = {
  wandern: "wanderwege",
  gipfel: "gipfeltouren",
  rad: "biketouren",
  almsommer: "almen",
}

/** Die Seite zu einem Ziel: die eigene, sonst die seines Flyers. */
export function webVon(eintrag: Ziel): WebId | undefined {
  return eintrag.web ?? (eintrag.flyer ? FLYER_WEB[eintrag.flyer] : undefined)
}

/** Darf das Ziel in einer Vorschlagsliste auftauchen? */
export function vorschlagbar(eintrag: Ziel): boolean {
  return !eintrag.ungesichert && !eintrag.ausserBetrieb
}

/*
 * Die Tourenangaben (Länge, Gehzeit, Höhenmeter, Schwierigkeit, Hinweise)
 * stammen aus den Flyern in flyer.ts, Drucklegung 03/25, abgerufen
 * 2026-09-23. Wo ein Flyer etwas nicht nennt, steht es hier auch nicht.
 */

/** Rad: gilt laut Flyer für jede Tour. */
const RAD_ACHTUNG = {
  de: "Der Helm ist laut Flyer Pflicht, bergauf wie bergab.",
  en: "According to the flyer a helmet is mandatory, uphill and downhill.",
}

/** Die beiden Radverleihe, die der Radflyer mit Telefonnummer nennt. */
export const RADVERLEIH = {
  de: "Räder leihen laut Flyer: Radl Sepp, Bahnhofstraße 3, Tel. +49 8663 5607, und Die RADgeber, Hauptstraße 67, Verleih Tel. +49 8663 3492454.",
  en: "Bike hire according to the flyer: Radl Sepp, Bahnhofstraße 3, phone +49 8663 5607, and Die RADgeber, Hauptstraße 67, rentals phone +49 8663 3492454.",
}

export const ZIELE: Ziel[] = [
  /* ---------------------------------------------------------------- *
   * Wander- und Spazierwege, Flyer "Die 10 schönsten Wander- &
   * Spazierwege"
   * ---------------------------------------------------------------- */
  {
    id: "sagenweg",
    kinderwagen: true,
    flyer: "wandern",
    suche: "Egglbrücke",
    name: "Ruhpoldinger Sagenweg",
    nameEn: "Ruhpolding legends trail",
    beschreibung:
      "Ein Rundweg mit acht großen Bildtafeln zu den Sagen des Ortes. Start ist an der Egglbrücke.",
    beschreibungEn:
      "A circular trail with eight large picture boards about local legends. It starts at the Egglbrücke.",
    eckdaten: "3,6 km · 1:25 h · 45 Höhenmeter",
    eckdatenEn: "3.6 km · 1:25 h · 45 m ascent",
    geeignet: {
      de: "Familien, auch mit Kinderwagen, und alle, die es eben mögen. Der Weg ist laut Flyer barrierefrei.",
      en: "Families, including those with pushchairs, and anyone who likes it level. According to the flyer the trail is accessible.",
    },
    topic: "wandern",
    interessen: ["familie", "gemuetlich", "berge"],
    aufstieg: "gemuetlich",
    kurz: true,
    stichwoerter: ["sagenweg", "sagen", "sage", "bildtafeln", "legends"],
  },
  {
    id: "maerchenwald",
    flyer: "wandern",
    suche: "Staudigl Hütte",
    name: "Märchenwaldwanderung",
    nameEn: "Fairytale forest walk",
    beschreibung:
      "Durch den Märchenwald mit Grotten und kleinen Höhlen. Am Weg liegt der Freizeitpark. Start ist an der Staudigl Hütte.",
    beschreibungEn:
      "Through the fairytale forest with grottos and small caves. The leisure park lies on the way. It starts at the Staudigl hut.",
    eckdaten: "3,9 km · 1:10 h · 60 Höhenmeter",
    eckdatenEn: "3.9 km · 1:10 h · 60 m ascent",
    geeignet: {
      de: "Familien mit Kindern. Der Freizeitpark mit 60 Attraktionen liegt direkt am Weg.",
      en: "Families with children. The leisure park with 60 attractions lies right on the way.",
    },
    topic: "familie",
    interessen: ["familie"],
    kurz: true,
    stichwoerter: ["maerchenwald", "maerchenwaldwanderung", "grotte", "hoehle"],
  },
  {
    id: "bergwald",
    flyer: "wandern",
    suche: "Wanderparkplatz Urschlau",
    name: "Bergwald-Erlebnispfad Röthelmoos",
    nameEn: "Röthelmoos mountain forest adventure trail",
    beschreibung:
      "Ein Rundweg über das Hochtal der Röthelmoosalmen mit 16 Stationen zum Mitmachen. Start ist am Wanderparkplatz Urschlau.",
    beschreibungEn:
      "A circular trail across the high valley of the Röthelmoos pastures with 16 hands-on stations. It starts at the Urschlau hiking car park.",
    eckdaten: "7,6 km · 2:45 h · 290 Höhenmeter",
    eckdatenEn: "7.6 km · 2:45 h · 290 m ascent",
    geeignet: {
      de: "Familien mit Kindern. Wer an den Stationen alle Fragen richtig beantwortet, bekommt eine Urkunde und einen Stempel.",
      en: "Families with children. Anyone who answers all the questions at the stations gets a certificate and a stamp.",
    },
    achtung: {
      de: "Mit 290 Höhenmetern geht es spürbar bergauf.",
      en: "With 290 metres of ascent it is noticeably uphill.",
    },
    topic: "wandern",
    interessen: ["familie", "berge"],
    aufstieg: "gemuetlich",
    stichwoerter: ["bergwald", "erlebnispfad", "roethelmoos", "urschlau"],
  },
  {
    id: "dreiseen",
    flyer: "wandern",
    suche: "Parkplatz Langer Sand",
    name: "Drei-Seen-Gebiet",
    nameEn: "Three-lakes area",
    beschreibung:
      "Eine Runde an Löden-, Mitter- und Weitsee im Naturschutzgebiet. Start ist am Parkplatz Langer Sand.",
    beschreibungEn:
      "A walk past the Lödensee, Mittersee and Weitsee in the nature reserve. It starts at the Langer Sand car park.",
    eckdaten: "6,6 km · 2:00 h · 100 Höhenmeter",
    eckdatenEn: "6.6 km · 2:00 h · 100 m ascent",
    geeignet: {
      de: "Alle, die es ruhig und ohne große Steigung mögen.",
      en: "Anyone who likes it quiet and without big climbs.",
    },
    topic: "wandern",
    interessen: ["gemuetlich", "berge"],
    aufstieg: "gemuetlich",
    stichwoerter: ["dreiseen", "seen", "weitsee", "loedensee", "mittersee"],
  },
  {
    id: "taubensee",
    kinderwagen: true,
    flyer: "wandern",
    suche: "Egglbrücke",
    name: WANDERN.taubensee,
    nameEn: WANDERN.taubenseeEn,
    beschreibung:
      "Entlang der Weißen Traun zum Taubensee und über den Golfplatz zurück. Start ist an der Egglbrücke.",
    beschreibungEn:
      "Along the Weiße Traun river to the Taubensee and back past the golf course. It starts at the Egglbrücke.",
    eckdaten: `${WANDERN.taubenseeLaenge} · ${WANDERN.taubenseeGehzeit} · 80 Höhenmeter`,
    eckdatenEn: `${WANDERN.taubenseeLaenge} · ${WANDERN.taubenseeGehzeit} · 80 m ascent`,
    geeignet: {
      de: "Familien, auch mit geländegängigem Kinderwagen. Die Uferwege verlaufen laut Flyer ohne große Steigungen.",
      en: "Families, including those with an off-road pushchair. According to the flyer the riverside paths have no big climbs.",
    },
    topic: "wandern",
    interessen: ["familie", "gemuetlich", "berge"],
    aufstieg: "gemuetlich",
    stichwoerter: ["taubensee", "traunauen", "auen", "traun", "see"],
  },
  {
    id: "kapellenweg",
    flyer: "wandern",
    suche: "Tourist Information",
    name: "Kapellen- & Marterlweg",
    nameEn: "Chapels and wayside shrines trail",
    beschreibung: `Ein Weg mit 18 Stationen, darunter Kapellen, Marterl und die ${KULTUR.kirche}. Start ist an der Tourist-Information.`,
    beschreibungEn:
      "A trail with 18 stations, among them chapels, wayside shrines and St. George's parish church. It starts at the tourist information.",
    eckdaten: "4,9 km · 2:00 h · 80 Höhenmeter",
    eckdatenEn: "4.9 km · 2:00 h · 80 m ascent",
    geeignet: {
      de: "Alle, die es beschaulich mögen. Wem der Weg zu lang ist, kann laut Flyer jederzeit abkürzen und ins Ortszentrum zurückkehren.",
      en: "Anyone who likes it peaceful. According to the flyer you can cut it short at any point and return to the village centre.",
    },
    topic: "wandern",
    interessen: ["kultur", "gemuetlich"],
    kurz: true,
    naehe: "touristinfo",
    stichwoerter: ["kapellenweg", "kapelle", "marterl", "marterlweg"],
  },
  {
    id: "schwarzachen",
    kinderwagen: true,
    flyer: "wandern",
    suche: "Holzknechtmuseum",
    name: "Schwarzachen Alm",
    nameEn: "Schwarzachen Alm",
    beschreibung:
      "Über eine breite Forststraße zur Schwarzachen Alm, mit Blick auf Rauschberg und Sonntagshorn. Start ist am Holzknechtmuseum in der Laubau.",
    beschreibungEn:
      "Along a wide forest road to the Schwarzachen Alm, with views of the Rauschberg and Sonntagshorn. It starts at the Holzknechtmuseum in Laubau.",
    eckdaten: "7,1 km · 2:00 h · 150 Höhenmeter",
    eckdatenEn: "7.1 km · 2:00 h · 150 m ascent",
    geeignet: {
      de: "Familien. Die Forststraße ist laut Flyer kaum steigend und auch mit Kinderwagen gut befahrbar.",
      en: "Families. According to the flyer the forest road is hardly steep and easy with a pushchair.",
    },
    zeitenErfragen: true,
    topic: "wandern",
    interessen: ["familie", "gemuetlich", "berge"],
    aufstieg: "gemuetlich",
    stichwoerter: ["schwarzachen", "schwarzachenalm"],
  },
  {
    id: "jubilaeumsweg",
    flyer: "wandern",
    suche: "Egglbrücke",
    name: "Jubiläumsweg zur Wittelsbacher Höhe",
    nameEn: "Jubilee trail to the Wittelsbacher Höhe",
    beschreibung:
      "Durch dichten Bergwald hinauf zur Brandler Alm und zur Panoramabank auf der Wittelsbacher Höhe. Start ist an der Egglbrücke.",
    beschreibungEn:
      "Up through dense mountain forest to the Brandler Alm and the panorama bench on the Wittelsbacher Höhe. It starts at the Egglbrücke.",
    eckdaten: "8 km · 3:00 h · 320 Höhenmeter",
    eckdatenEn: "8 km · 3:00 h · 320 m ascent",
    geeignet: {
      de: "Alle, die gern im Wald gehen und einen weiten Blick über den Talkessel suchen.",
      en: "Anyone who enjoys forest walks and a wide view over the valley basin.",
    },
    achtung: {
      de: "Mit 320 Höhenmetern geht es spürbar bergauf.",
      en: "With 320 metres of ascent it is noticeably uphill.",
    },
    topic: "wandern",
    interessen: ["berge"],
    aufstieg: "gemuetlich",
    stichwoerter: ["jubilaeumsweg", "wittelsbacher", "brandler"],
  },
  {
    id: "staubfall",
    flyer: "wandern",
    suche: "Holzknechtmuseum",
    name: "Schmugglerweg zum Staubfall",
    nameEn: "Smugglers' trail to the Staubfall",
    beschreibung:
      "Zum Staubfall an der Grenze zu Österreich. Stufen führen direkt hinter dem Wasserfall hindurch. Start ist am Holzknechtmuseum.",
    beschreibungEn:
      "To the Staubfall waterfall on the Austrian border. Steps lead right behind the waterfall. It starts at the Holzknechtmuseum.",
    eckdaten: "16,5 km · 5:00 h · 360 Höhenmeter",
    eckdatenEn: "16.5 km · 5:00 h · 360 m ascent",
    geeignet: {
      de: "Geübte Wanderer mit Zeit für einen langen Tag.",
      en: "Experienced walkers with time for a long day.",
    },
    achtung: {
      de: "Die Tour ist laut Flyer an einigen Stellen steiler, mit vielen Serpentinen. Man sollte trittsicher sein.",
      en: "According to the flyer the tour is steeper in places, with many hairpin bends. You should be sure-footed.",
    },
    tagesfuellend: true,
    beiRegenNicht: true,
    // Nicht mit Kindern: 16,5 km, fünf Stunden und laut Flyer Trittsicherheit.
    // Einschätzung des Autors nach dem Testlauf vom 23.09.2026, dort war die
    // Tour für "mit Kindern, nur heute" der erste Vorschlag.
    nichtFuer: ["kinder"],
    topic: "wandern",
    interessen: ["berge"],
    aufstieg: "geuebt",
    stichwoerter: ["staubfall", "schmugglerweg", "wasserfall", "heutal"],
  },

  /* ---------------------------------------------------------------- *
   * Gipfeltouren, Flyer "Die 10 schönsten Gipfeltouren"
   * ---------------------------------------------------------------- */
  {
    id: "zinnkopf",
    flyer: "gipfel",
    schwierigkeit: "leicht",
    suche: "Egglbrücke",
    name: "Zinnkopf (1.227 m)",
    nameEn: "Zinnkopf (1,227 m)",
    beschreibung:
      "Durch ruhigen Bergwald auf den Zinnkopf. Start ist an der Egglbrücke.",
    beschreibungEn:
      "Through quiet mountain forest up the Zinnkopf. It starts at the Egglbrücke.",
    eckdaten: "11,2 km · 4:15 h · 620 Höhenmeter · leicht",
    eckdatenEn: "11.2 km · 4:15 h · 620 m ascent · easy",
    geeignet: {
      de: "Wer eine Gipfeltour ohne schwierige Stellen sucht. Der Flyer stuft sie als leicht ein.",
      en: "Anyone looking for a summit hike without difficult sections. The flyer rates it as easy.",
    },
    achtung: {
      de: "Im Gipfelbereich lebt der geschützte Auerhahn. Bitte nehmen Sie Rücksicht.",
      en: "The protected capercaillie lives near the summit. Please be considerate.",
    },
    beiRegenNicht: true,
    topic: "wandern",
    interessen: ["berge"],
    aufstieg: "geuebt",
    stichwoerter: ["zinnkopf"],
  },
  {
    id: "haaralmschneid",
    flyer: "gipfel",
    schwierigkeit: "mittel",
    suche: "Wanderparkplatz Urschlau",
    name: "Haaralmschneid (1.594 m)",
    nameEn: "Haaralmschneid (1,594 m)",
    beschreibung:
      "Vorbei am Kirchlein Maria Schnee und über die Haaralmen zum Gipfel mit Rundumblick. Start ist in der Urschlau.",
    beschreibungEn:
      "Past the little Maria Schnee church and over the Haaralm pastures to a summit with an all-round view. It starts in Urschlau.",
    eckdaten: "8,5 km · 3:30 h · 830 Höhenmeter · mittel",
    eckdatenEn: "8.5 km · 3:30 h · 830 m ascent · medium",
    geeignet: {
      de: "Bergerfahrene mit guter Kondition.",
      en: "Experienced hikers with good fitness.",
    },
    achtung: {
      de: "Die Forststraße zu den Haaralmen ist laut Flyer steil, der Steig zum Gipfel noch steiler.",
      en: "According to the flyer the forest road to the Haaralm pastures is steep, and the path to the summit steeper still.",
    },
    beiRegenNicht: true,
    topic: "wandern",
    interessen: ["berge"],
    aufstieg: "geuebt",
    stichwoerter: ["haaralmschneid", "haaralm"],
  },
  {
    id: "unternberg-tour",
    flyer: "gipfel",
    schwierigkeit: "mittel",
    suche: "Chiemgau Arena",
    name: "Unternberg-Überschreitung (1.425 m)",
    nameEn: "Unternberg traverse (1,425 m)",
    beschreibung:
      "Über die ruhige Seite des Unternbergs zum Gipfelkreuz, vorbei an Boider Alm und Unternberg Alm. Start ist an der Chiemgau Arena.",
    beschreibungEn:
      "Over the quiet side of the Unternberg to the summit cross, past the Boider Alm and Unternberg Alm. It starts at the Chiemgau Arena.",
    eckdaten: "13,1 km · 5:00 h · 890 Höhenmeter · mittel",
    eckdatenEn: "13.1 km · 5:00 h · 890 m ascent · medium",
    geeignet: {
      de: "Bergerfahrene mit guter Kondition. Den Abstieg können Sie sich laut Flyer mit der Sesselbahn sparen.",
      en: "Experienced hikers with good fitness. According to the flyer you can skip the descent by taking the chairlift.",
    },
    achtung: {
      de: "Die Sesselbahn fährt bei Regen nicht. Dann bleibt nur der Abstieg zu Fuß.",
      en: "The chairlift does not run in the rain. Then the only way down is on foot.",
    },
    tagesfuellend: true,
    beiRegenNicht: true,
    topic: "wandern",
    interessen: ["berge"],
    aufstieg: "geuebt",
    stichwoerter: ["ueberschreitung", "boider", "unternbergtour"],
  },
  {
    id: "hochfelln",
    flyer: "gipfel",
    schwierigkeit: "mittel",
    suche: "Staudigl Hütte",
    // Keine Höhe: der Flyer nennt 1.674 m in der Überschrift und 1.664 m im
    // Text. Welche stimmt, ist ohne weitere Quelle nicht zu entscheiden.
    name: "Hochfelln",
    nameEn: "Hochfelln",
    beschreibung:
      "Vorbei an der Glockenschmiede und über die Farnbödenalmen zum Gipfelkreuz mit Blick auf den Chiemsee. Start ist an der Staudigl Hütte.",
    beschreibungEn:
      "Past the bell forge and over the Farnbödenalmen pastures to the summit cross overlooking the Chiemsee. It starts at the Staudigl hut.",
    eckdaten: "13,5 km · 6:00 h · 960 Höhenmeter · mittel",
    eckdatenEn: "13.5 km · 6:00 h · 960 m ascent · medium",
    geeignet: {
      de: "Bergerfahrene mit guter Kondition und Zeit für einen ganzen Tag.",
      en: "Experienced hikers with good fitness and time for a whole day.",
    },
    achtung: {
      de: "Bei Regen würde ich auf den Hochfelln niemanden schicken, das rät auch die Tourist-Information.",
      en: "In the rain I would not send anyone up the Hochfelln, and neither would the tourist information.",
    },
    tagesfuellend: true,
    beiRegenNicht: true,
    topic: "wandern",
    interessen: ["berge"],
    aufstieg: "geuebt",
    stichwoerter: ["hochfelln", "farnboden", "thorau"],
  },
  {
    id: "hoerndlwand",
    bild: "hoerndlwand",
    flyer: "gipfel",
    schwierigkeit: "schwer",
    suche: "Seehaus",
    name: "Hörndlwand (1.684 m)",
    nameEn: "Hörndlwand (1,684 m)",
    beschreibung:
      "Über den Jägersteig zu drei Gipfelkreuzen, zurück durch das Ostertal. Start ist am Seehaus.",
    beschreibungEn:
      "Via the Jägersteig to three summit crosses, back through the Ostertal. It starts at the Seehaus.",
    eckdaten: "9,6 km · 5:00 h · 920 Höhenmeter · schwer",
    eckdatenEn: "9.6 km · 5:00 h · 920 m ascent · difficult",
    geeignet: {
      de: "Erfahrene Bergsteiger.",
      en: "Experienced mountaineers.",
    },
    achtung: {
      de: "Laut Flyer nur für Trittsichere und Schwindelfreie.",
      en: "According to the flyer only for the sure-footed with a head for heights.",
    },
    beiRegenNicht: true,
    // Nicht mit Kindern: der Flyer verlangt Trittsicherheit und
    // Schwindelfreiheit. Das ist eine Einschätzung des Autors, keine Angabe
    // des Flyers.
    nichtFuer: ["kinder"],
    topic: "wandern",
    interessen: ["berge"],
    aufstieg: "geuebt",
    stichwoerter: ["hoerndlwand", "hoerndl", "jaegersteig"],
  },
  {
    id: "rauschberg-gipfel",
    flyer: "gipfel",
    schwierigkeit: "schwer",
    suche: "Parkplatz Rauschbergbahn",
    name: "Rauschberg zu Fuß (1.671 m)",
    nameEn: "Rauschberg on foot (1,671 m)",
    beschreibung:
      "Über den Hutzenauer Steig auf den Vorderen und Hinteren Rauschberg, zurück auf der Nordseite. Start ist am Parkplatz der Rauschbergbahn.",
    beschreibungEn:
      "Via the Hutzenauer Steig up the front and rear Rauschberg, back along the north side. It starts at the Rauschberg lift car park.",
    eckdaten: "17,2 km · 6:30 h · 1.330 Höhenmeter · schwer",
    eckdatenEn: "17.2 km · 6:30 h · 1,330 m ascent · difficult",
    geeignet: {
      de: "Erfahrene Bergsteiger mit sehr guter Kondition.",
      en: "Experienced mountaineers with very good fitness.",
    },
    achtung: {
      de: "Beim Aufstieg muss laut Flyer jeder Tritt sitzen, einige Stellen sind mit Stahlseil gesichert. Der Rückweg ist lang. Die Rauschbergbahn fährt derzeit nicht, hinunter geht es also nur zu Fuß.",
      en: "According to the flyer every step must be sure on the ascent, and some sections are secured with steel cables. The way back is long. The Rauschberg lift is not running at present, so the only way down is on foot.",
    },
    tagesfuellend: true,
    beiRegenNicht: true,
    nichtFuer: ["kinder"],
    topic: "wandern",
    interessen: ["berge"],
    aufstieg: "geuebt",
    stichwoerter: ["hutzenauer", "rauschberggipfel", "vorderer", "hinterer"],
  },
  {
    id: "sonntagshorn",
    flyer: "gipfel",
    schwierigkeit: "schwer",
    tagesfuellend: true,
    suche: "Parkplatz Holzknechtmuseum",
    name: `${WANDERN.sonntagshorn} (${WANDERN.sonntagshornHoehe})`,
    nameEn: `${WANDERN.sonntagshorn} (1,961 m)`,
    beschreibung:
      "Auf den höchsten Berg des Chiemgaus, über die Schwarzachen Alm und zurück über den Ostgrat. Start ist in der Laubau.",
    beschreibungEn:
      "Up the highest mountain in the Chiemgau, via the Schwarzachen Alm and back along the east ridge. It starts in Laubau.",
    eckdaten: "16,9 km · 9:00 h · 1.340 Höhenmeter · schwer",
    eckdatenEn: "16.9 km · 9:00 h · 1,340 m ascent · difficult",
    geeignet: {
      de: "Nur für erfahrene Bergsteiger.",
      en: "Only for experienced mountaineers.",
    },
    achtung: {
      de: "Die Tour erfordert laut Flyer alpine Erfahrung, Trittsicherheit, Schwindelfreiheit und Kletterkönnen im I. bis II. Schwierigkeitsgrad.",
      en: "According to the flyer the tour requires alpine experience, sure-footedness, a head for heights and climbing ability at grade I to II.",
    },
    beiRegenNicht: true,
    nichtFuer: ["kinder"],
    topic: "wandern",
    interessen: ["berge"],
    aufstieg: "geuebt",
    stichwoerter: [
      "sonntagshorn",
      "hoechst",
      "anspruchsvoll",
      "schwer",
      "summit",
      "demanding",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Bergbahnen
   * ---------------------------------------------------------------- */
  {
    id: "rauschberg",
    web: "bergbahnen",
    // Belegt: kein Fahrbetrieb wegen des geplanten Neubaus, siehe daten.ts.
    ausserBetrieb: {
      de: "Die Rauschbergbahn fährt derzeit nicht, weil sie neu gebaut wird. Ein Termin für die Wiederaufnahme ist nicht bekannt.",
      en: "The Rauschberg lift is not running at present because it is being rebuilt. No date for reopening is known.",
    },
    suche: "Rauschbergbahn Talstation",
    name: BERGBAHNEN.rauschbergName,
    nameEn: BERGBAHNEN.rauschbergName,
    beschreibung: "Die Talstation der Rauschbergbahn im Ort.",
    beschreibungEn: "The valley station of the Rauschberg lift in the village.",
    eckdaten: "Kein Fahrbetrieb, Stand 3. September 2026",
    eckdatenEn: "Not running, as of 3 September 2026",
    topic: "wandern",
    naehe: "rauschberg",
    stichwoerter: [
      "rauschberg",
      "rauschbergbahn",
      "gondelbahn",
      "gondel",
      "seilbahn",
      "kabinenbahn",
      "gondola",
      "cable",
    ],
  },
  {
    id: "unternberg",
    web: "unternberg",
    flyer: "almsommer",
    suche: "Unternbergbahn",
    name: `${BERGBAHNEN.unternbergName} mit der ${BERGBAHNEN.unternbergBahn}`,
    nameEn: `${BERGBAHNEN.unternbergName} by ${BERGBAHNEN.unternbergBahnEn}`,
    beschreibung: `Mit der ${BERGBAHNEN.unternbergBahn} auf den ${BERGBAHNEN.unternbergName}, ohne selbst aufzusteigen. Oben liegen die Unternberg Alm und die Boider Alm.`,
    beschreibungEn: `Up the ${BERGBAHNEN.unternbergName} by ${BERGBAHNEN.unternbergBahnEn}, without climbing yourself. The Unternberg Alm and the Boider Alm are at the top.`,
    eckdaten: `Berg- und Talfahrt ${BERGBAHNEN.unternbergErwachsen}, Kinder ${BERGBAHNEN.ermaessigungKinder} (Stand 3. September 2026)`,
    eckdatenEn: `Return ticket ${BERGBAHNEN.unternbergErwachsen}, children ${BERGBAHNEN.ermaessigungKinder} (as of 3 September 2026)`,
    geeignet: {
      de: "Alle, die ohne Aufstieg auf den Berg wollen.",
      en: "Anyone who wants to get up the mountain without climbing.",
    },
    achtung: {
      de: "Bei Regen fährt die Sesselbahn nicht.",
      en: "The chairlift does not run in the rain.",
    },
    zeitenErfragen: true,
    beiRegenNicht: true,
    topic: "wandern",
    interessen: ["berge"],
    aufstieg: "bahn",
    stichwoerter: [
      "unternberg",
      "unternbergbahn",
      "sesselbahn",
      "sessellift",
      "sessel",
      "bergbahn",
      "chairlift",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Radtouren, Flyer "Die 10 schönsten Fahrrad- & Mountainbiketouren"
   * ---------------------------------------------------------------- */
  {
    id: "rad-tal",
    flyer: "rad",
    schwierigkeit: "leicht",
    suche: "Tourist Information",
    name: "Radrunde ums Tal",
    nameEn: "Cycle loop around the valley",
    beschreibung:
      "Auf ruhigen Straßen und Wegen rund um das Miesenbacher Tal, vorbei am Taubensee, am Holzknechtmuseum und am Freizeitpark. Start ist an der Tourist-Information.",
    beschreibungEn:
      "On quiet roads and paths around the Miesenbach valley, past the Taubensee, the Holzknechtmuseum and the leisure park. It starts at the tourist information.",
    eckdaten: "21 km · 2:00 h · 250 Höhenmeter · leicht",
    eckdatenEn: "21 km · 2:00 h · 250 m ascent · easy",
    geeignet: {
      de: "Familien. Laut Flyer ist die Runde auch für Kinder ein Kinderspiel.",
      en: "Families. According to the flyer the loop is child's play for children too.",
    },
    achtung: RAD_ACHTUNG,
    topic: "wandern",
    interessen: ["rad", "familie"],
    naehe: "touristinfo",
    stichwoerter: ["radrunde", "radtour", "rad", "fahrrad", "radeln"],
  },
  {
    id: "rad-staubfall",
    flyer: "rad",
    schwierigkeit: "leicht",
    suche: "Tourist Information",
    name: "Mit dem Rad zum Staubfall",
    nameEn: "By bike to the Staubfall",
    beschreibung:
      "Durch die Laubau und das Fischbachtal bis zu einer Unterstandshütte, von dort zu Fuß zum Wasserfall. Start ist an der Tourist-Information.",
    beschreibungEn:
      "Through Laubau and the Fischbach valley to a shelter, from there on foot to the waterfall. It starts at the tourist information.",
    eckdaten: "27,6 km · 2:45 h · 360 Höhenmeter · leicht",
    eckdatenEn: "27.6 km · 2:45 h · 360 m ascent · easy",
    geeignet: {
      de: "Wer Radfahren und ein Stück Wandern verbinden will.",
      en: "Anyone who wants to combine cycling with a short walk.",
    },
    achtung: {
      de: "Ab der Unterstandshütte geht es zu Fuß auf einem schmalen Weg in Serpentinen weiter. Der Helm ist laut Flyer Pflicht.",
      en: "From the shelter you continue on foot on a narrow path with hairpin bends. According to the flyer a helmet is mandatory.",
    },
    topic: "wandern",
    interessen: ["rad"],
    naehe: "touristinfo",
    stichwoerter: ["staubfall", "fischbachtal"],
  },
  {
    id: "rad-roethelmoos",
    flyer: "rad",
    schwierigkeit: "leicht",
    suche: "Tourist Information",
    name: "Röthelmoos-Runde mit dem Rad",
    nameEn: "Röthelmoos cycle loop",
    beschreibung:
      "Über die Röthelmoos Almen hinunter ins Drei-Seen-Gebiet. Start ist an der Tourist-Information.",
    beschreibungEn:
      "Over the Röthelmoos pastures and down into the three-lakes area. It starts at the tourist information.",
    eckdaten: "32,5 km · 3:15 h · 370 Höhenmeter · leicht",
    eckdatenEn: "32.5 km · 3:15 h · 370 m ascent · easy",
    geeignet: {
      de: "Wer eine längere Tour mit Almeinkehr sucht.",
      en: "Anyone looking for a longer ride with a stop at a mountain inn.",
    },
    achtung: {
      de: "Die Forststraße hinauf zur Alm steigt laut Flyer kurz steiler an. Der Helm ist Pflicht.",
      en: "According to the flyer the forest road up to the pasture briefly gets steeper. A helmet is mandatory.",
    },
    topic: "wandern",
    interessen: ["rad"],
    naehe: "touristinfo",
    stichwoerter: ["roethelmoos", "roethelmoosrunde"],
  },
  {
    id: "rad-zinnkopf",
    flyer: "rad",
    schwierigkeit: "leicht",
    suche: "Tourist Information",
    name: "Zinnkopf-Umrundung mit dem Rad",
    nameEn: "Cycling around the Zinnkopf",
    beschreibung:
      "Auf breiten Forststraßen durch Bergwald rund um den Zinnkopf. Start ist an der Tourist-Information.",
    beschreibungEn:
      "On wide forest roads through mountain forest around the Zinnkopf. It starts at the tourist information.",
    eckdaten: "26 km · 3:00 h · 600 Höhenmeter · leicht",
    eckdatenEn: "26 km · 3:00 h · 600 m ascent · easy",
    geeignet: {
      de: "Laut Flyer ideal an heißen Tagen, der Wald spendet Schatten.",
      en: "According to the flyer ideal on hot days, as the forest gives shade.",
    },
    achtung: {
      de: "Längere und kürzere Anstiege wechseln sich ab. Der Helm ist laut Flyer Pflicht.",
      en: "Longer and shorter climbs alternate. According to the flyer a helmet is mandatory.",
    },
    topic: "wandern",
    interessen: ["rad"],
    naehe: "touristinfo",
    stichwoerter: ["zinnkopfumrundung"],
  },

  /* ---------------------------------------------------------------- *
   * Im Ort, Flyer "Ortsplan für Ruhpolding"
   * ---------------------------------------------------------------- */
  {
    id: "vitalwelt",
    web: "baeder",
    flyer: "ortsplan",
    suche: "Vita Alpina",
    name: FAMILIE.vitalwelt,
    nameEn: FAMILIE.vitalwelt,
    beschreibung:
      "Das Erlebnis- und Wellnessbad von Ruhpolding. Laut Ortsplan Badevergnügen bei jedem Wetter.",
    beschreibungEn:
      "Ruhpolding's leisure and spa pool. According to the village map, bathing fun whatever the weather.",
    eckdaten: "Drinnen, bei jedem Wetter",
    eckdatenEn: "Indoors, whatever the weather",
    geeignet: {
      de: "Familien und alle, die bei Regen etwas drinnen suchen.",
      en: "Families and anyone looking for something indoors when it rains.",
    },
    zeitenErfragen: true,
    topic: "familie",
    naehe: "vitalwelt",
    // Sport seit dem 23.09.2026: ruhpolding.de/baeder-und-seen nennt
    // Wellenbad und Wasserrutsche "zum Austoben". Bei Regen die Wahl drinnen.
    interessen: ["familie", "gemuetlich", "sport"],
    drinnen: true,
    kurz: true,
    stichwoerter: [
      "vitalwelt",
      "vita",
      "alpina",
      "schwimmbad",
      "schwimm",
      "hallenbad",
      "bad",
      "sauna",
      "wellness",
      "baden",
      "pool",
      "swim",
    ],
  },
  {
    id: "freizeitpark",
    web: "freizeit",
    flyer: "ortsplan",
    suche: "Freizeitpark Ruhpolding",
    name: FAMILIE.freizeitpark,
    nameEn: FAMILIE.freizeitpark,
    beschreibung:
      "Ein Freizeitpark mit 60 Attraktionen, vom Karussell bis zur Bergachterbahn, im Ortsteil Brand.",
    beschreibungEn:
      "A leisure park with 60 attractions, from the carousel to the mountain roller coaster, in the Brand district.",
    eckdaten: "Laut Ortsplan für jedes Alter und bei jeder Witterung",
    eckdatenEn: "According to the village map for all ages and in any weather",
    geeignet: {
      de: "Familien mit Kindern jeden Alters.",
      en: "Families with children of all ages.",
    },
    zeitenErfragen: true,
    topic: "familie",
    interessen: ["familie"],
    stichwoerter: [
      "freizeitpark",
      "maerchenpark",
      "fahrgeschaeft",
      "achterbahn",
      "karussell",
      "fairytale",
    ],
  },
  {
    id: "coaster",
    bild: "coaster",
    web: "coaster",
    flyer: "ortsplan",
    suche: "Chiemgau Coaster",
    name: "Chiemgau Coaster",
    nameEn: "Chiemgau Coaster",
    beschreibung:
      "Eine Rodelbahn, die laut Ortsplan im Sommer wie im Winter fährt.",
    beschreibungEn:
      "A toboggan run which according to the village map runs in summer and winter.",
    eckdaten: "Für Kinder und Erwachsene",
    eckdatenEn: "For children and adults",
    geeignet: {
      de: "Kinder und Erwachsene.",
      en: "Children and adults.",
    },
    zeitenErfragen: true,
    topic: "familie",
    interessen: ["familie"],
    stichwoerter: ["coaster", "rodelbahn", "sommerrodel", "rodeln", "toboggan"],
  },
  {
    id: "heimatmuseum",
    bild: "heimatmuseum",
    web: "heimatmuseum",
    flyer: "ortsplan",
    suche: "Heimatmuseum Ruhpolding",
    name: FAMILIE.heimatmuseum,
    nameEn: FAMILIE.heimatmuseumEn,
    beschreibung: `Eines der drei Museen im Ort, neben ${KULTUR.holzknechtmuseum} und ${KULTUR.glockenschmiede}.`,
    beschreibungEn: `One of the three museums in the village, alongside the ${KULTUR.holzknechtmuseum} and the ${KULTUR.glockenschmiede}.`,
    eckdaten: "Drinnen",
    eckdatenEn: "Indoors",
    geeignet: {
      de: "Alle, die sich für die Geschichte des Ortes interessieren, auch bei Regen.",
      en: "Anyone interested in the village's history, also when it rains.",
    },
    zeitenErfragen: true,
    topic: "familie",
    interessen: ["kultur"],
    drinnen: true,
    kurz: true,
    stichwoerter: ["heimatmuseum", "heimat", "museum", "drinnen", "indoor"],
  },
  {
    id: "holzknechtmuseum",
    bild: "holzknechtmuseum",
    web: "holzknechtmuseum",
    flyer: "ortsplan",
    suche: "Holzknechtmuseum",
    name: KULTUR.holzknechtmuseum,
    nameEn: KULTUR.holzknechtmuseumEn,
    beschreibung:
      "Eine multimediale, interaktive Ausstellung über Leben und Arbeit der Holzknechte, in der Laubau.",
    beschreibungEn:
      "A multimedia, interactive exhibition on the life and work of the woodcutters, in Laubau.",
    eckdaten: "Dorflinie 9533, Halt Laubau",
    eckdatenEn: "Village bus 9533, stop Laubau",
    geeignet: {
      de: "Familien und alle, die sich für Geschichte interessieren.",
      en: "Families and anyone interested in history.",
    },
    zeitenErfragen: true,
    topic: "familie",
    interessen: ["kultur", "familie"],
    drinnen: true,
    stichwoerter: ["holzknechtmuseum", "holzknecht", "holzfaeller"],
  },
  {
    id: "glockenschmiede",
    web: "museen",
    flyer: "ortsplan",
    suche: "Glockenschmiede Museum",
    name: KULTUR.glockenschmiede,
    nameEn: KULTUR.glockenschmiedeEn,
    beschreibung:
      "Die alte Hammerschmiede von 1646, in der früher Kuhglocken und Werkzeuge gefertigt wurden.",
    beschreibungEn:
      "The old hammer mill from 1646, where cowbells and tools used to be made.",
    eckdaten: "Museum, steht unter Denkmalschutz",
    eckdatenEn: "Museum, listed building",
    geeignet: {
      de: "Alle, die sich für altes Handwerk interessieren.",
      en: "Anyone interested in traditional crafts.",
    },
    zeitenErfragen: true,
    topic: "familie",
    interessen: ["kultur"],
    drinnen: true,
    kurz: true,
    stichwoerter: ["glockenschmiede", "glocke", "schmiede", "hammerschmiede"],
  },
  {
    id: "kirche",
    web: "kirchen",
    flyer: "ortsplan",
    suche: KULTUR.kirche,
    name: KULTUR.kirche,
    nameEn: KULTUR.kircheEn,
    beschreibung:
      "Von der Kirche oben haben Sie einen schönen Überblick über den Ort. Das empfiehlt die Tourist-Information, wenn nur ein Tag bleibt.",
    beschreibungEn:
      "From the church up the hill you get a fine view over the village. The tourist information suggests it when you only have one day.",
    eckdaten: "Kurzer Weg im Ort",
    eckdatenEn: "A short walk in the village",
    geeignet: {
      de: "Alle, die wenig Zeit haben und sich zuerst einen Überblick verschaffen wollen.",
      en: "Anyone short of time who wants to get their bearings first.",
    },
    topic: "familie",
    interessen: ["kultur", "gemuetlich"],
    kurz: true,
    stichwoerter: ["kirche", "pfarrkirche", "georg", "ueberblick", "church"],
  },

  /* ---------------------------------------------------------------- *
   * Almen, Flyer "Ruhpoldinger Almsommer"
   * ---------------------------------------------------------------- */
  {
    id: "unternbergalm",
    flyer: "almsommer",
    suche: "Unternberg Alm",
    name: "Unternberg Alm (1.425 m)",
    nameEn: "Unternberg Alm (1,425 m)",
    beschreibung:
      "Bayerisch-moderne Küche mit Panoramablick auf die Chiemgauer Berge, die Loferer Steinberge und den Wilden Kaiser.",
    beschreibungEn:
      "Modern Bavarian cooking with a panoramic view of the Chiemgau mountains, the Loferer Steinberge and the Wilder Kaiser.",
    eckdaten: "Auf dem Unternberg, mit der Sesselbahn erreichbar",
    eckdatenEn: "On the Unternberg, reachable by chairlift",
    geeignet: {
      de: "Alle, die oben einkehren wollen. Mit der Sesselbahn auch ohne Aufstieg.",
      en: "Anyone who wants to stop for food up top. By chairlift even without climbing.",
    },
    achtung: {
      de: "Bei Regen fährt die Sesselbahn nicht.",
      en: "The chairlift does not run in the rain.",
    },
    zeitenErfragen: true,
    beiRegenNicht: true,
    topic: "essen",
    stichwoerter: ["unternbergalm", "almstueberl"],
  },
  {
    id: "langerbauer",
    flyer: "almsommer",
    suche: "Langerbauer Alm",
    name: "Langerbauer Alm (880 m)",
    nameEn: "Langerbauer Alm (880 m)",
    beschreibung:
      "Alm am Hochmoor Röthelmoos. Oben warten laut Flyer ein Pony, Ziegen und Hühner.",
    beschreibungEn:
      "A mountain inn by the Röthelmoos high moor. According to the flyer a pony, goats and chickens are waiting at the top.",
    eckdaten: "Im Röthelmoos, am Weg des Bergwald-Erlebnispfads",
    eckdatenEn: "In the Röthelmoos, on the mountain forest adventure trail",
    geeignet: {
      de: "Familien mit Kindern.",
      en: "Families with children.",
    },
    zeitenErfragen: true,
    topic: "essen",
    interessen: ["familie"],
    stichwoerter: ["langerbauer", "pony", "ziegen"],
  },
  {
    id: "brander",
    flyer: "almsommer",
    suche: "Brander Alm",
    name: "Brander Alm (1.135 m)",
    nameEn: "Brander Alm (1,135 m)",
    beschreibung:
      "Alm direkt unterhalb der Hörndlwand, laut Flyer mit Kaiserschmarrn und selbstgemachtem Weichkäse.",
    beschreibungEn:
      "A mountain inn right below the Hörndlwand, according to the flyer with Kaiserschmarrn and homemade soft cheese.",
    eckdaten: "Unterhalb der Hörndlwand",
    eckdatenEn: "Below the Hörndlwand",
    geeignet: {
      de: "Wanderer, die eine Einkehr am Berg suchen.",
      en: "Walkers looking for a stop on the mountain.",
    },
    zeitenErfragen: true,
    topic: "essen",
    stichwoerter: ["brander", "branderalm", "kaiserschmarrn"],
  },

  /* ---------------------------------------------------------------- *
   * Gastronomie im Ort, Quelle ruhpolding.de (daten.ts)
   * ---------------------------------------------------------------- */
  {
    id: "post",
    // ruhpolding.de/hotel-post-1, abgerufen 2026-09-23
    web: "restaurant-post",
    suche: "Hotel zur Post",
    name: GASTRONOMIE.gasthausPost,
    nameEn: GASTRONOMIE.gasthausPost,
    beschreibung:
      "Mitten im Ort. Auf der Karte stehen typisch bayerische Gerichte ebenso wie ein veganes Gemüsecurry, dazu gibt es einen Biergarten.",
    beschreibungEn:
      "In the middle of the village. The menu has typical Bavarian dishes as well as a vegan vegetable curry, and there is a beer garden.",
    eckdaten: "Regionale Küche, auch vegetarisch · Hauptstraße 35",
    eckdatenEn: "Regional cooking, vegetarian dishes too · Hauptstraße 35",
    geeignet: {
      de: "Familien, Ruhpolding Tourismus führt das Haus als kinderfreundlich und barrierefrei.",
      en: "Families, Ruhpolding Tourismus lists it as child-friendly and barrier-free.",
    },
    zeitenErfragen: true,
    topic: "essen",
    // Nicht "bayerisch": das Wort führt zur Auswahl nach Küche.
    stichwoerter: ["post", "gasthaus", "gasthof", "wirtshaus", "abendessen"],
  },
  {
    id: "pizzeria",
    // ruhpolding.de/pizzeria-eiscafe-made-in-italy, abgerufen 2026-09-23
    web: "restaurant-made-in-italy",
    suche: "Made in Italy Ruhpolding",
    name: GASTRONOMIE.pizzeria,
    nameEn: GASTRONOMIE.pizzeria,
    beschreibung: "Pizzeria und Eiscafé mit Terrasse.",
    beschreibungEn: "Pizzeria and ice cream café with a terrace.",
    eckdaten: "Mediterrane Küche, auch vegetarisch · Hauptstraße 28",
    eckdatenEn: "Mediterranean cooking, vegetarian dishes too · Hauptstraße 28",
    zeitenErfragen: true,
    topic: "essen",
    // Google Maps führt den Betrieb unter Hauptstraße 28 als "Dauerhaft
    // geschlossen" (geprüft 24.09.2026), ruhpolding.de noch mit
    // Öffnungszeiten. Solange das nicht geklärt ist, wird er nicht
    // vorgeschlagen (Entscheidung des Autors vom 24.09.2026).
    ungesichert:
      "Laut Google Maps dauerhaft geschlossen, laut ruhpolding.de geöffnet",
    // Nicht "italien": das träfe auch "italienisch", und das führt zur
    // Auswahl nach Küche. "pizza" allein führt zu Pizza & Co.
    stichwoerter: ["pizzeria", "made", "italy", "eis", "eiscafe", "icecream"],
  },

  /*
   * Die folgenden zehn stammen jeweils von der Detailseite des Betriebs auf
   * ruhpolding.de (siehe `web`), abgerufen 2026-09-23. Beschreibung,
   * Küche und Adresse sind dort so angegeben. Öffnungszeiten und Ruhetage
   * stehen ebenfalls dort, werden hier aber nicht genannt: die Seite
   * schreibt selbst "Alle Angaben ohne Gewähr".
   */
  {
    id: "maiers",
    web: "restaurant-maiers",
    // "Restaurant Maiers" findet Google Maps nicht (geprüft 24.09.2026). Das
    // Restaurant gehört zum Landhotel Maiergschwendt, Maiergschwendt 1.
    suche: "Landhotel Maiergschwendt",
    name: GASTRONOMIE.maiers,
    nameEn: GASTRONOMIE.maiers,
    beschreibung:
      "Bekannt für moderne bayerische Küche mit Produkten aus der Region, dazu ein Biergarten und eine Weinkarte mit Weinen aus Deutschland und Österreich.",
    beschreibungEn:
      "Known for modern Bavarian cooking with produce from the region, with a beer garden and a wine list from Germany and Austria.",
    eckdaten: "Regionale Küche, auch vegetarisch · Maiergschwendt 1",
    eckdatenEn: "Regional cooking, vegetarian dishes too · Maiergschwendt 1",
    zeitenErfragen: true,
    topic: "essen",
    stichwoerter: ["maiers", "maier", "maiergschwendt"],
  },
  {
    id: "haeusler",
    web: "restaurant-haeusler",
    suche: GASTRONOMIE.haeusler,
    name: GASTRONOMIE.haeusler,
    nameEn: GASTRONOMIE.haeusler,
    beschreibung:
      "Gemütlich umgebautes Bauernhaus mit traditionell bayerischer Speisekarte und einem Biergarten mit Blick über den Golfplatz zum Rauschberg.",
    beschreibungEn:
      "A cosily converted farmhouse with a traditional Bavarian menu and a beer garden looking across the golf course to the Rauschberg.",
    eckdaten: "Regionale Küche · Zell 37 a",
    eckdatenEn: "Regional cooking · Zell 37 a",
    geeignet: {
      de: "Familien, Ruhpolding Tourismus führt das Lokal als kinderfreundlich.",
      en: "Families, Ruhpolding Tourismus lists it as child-friendly.",
    },
    zeitenErfragen: true,
    topic: "essen",
    interessen: ["familie", "gemuetlich"],
    stichwoerter: ["haeusler", "bauernhaus"],
  },
  {
    id: "ruhpoldinger-hof",
    web: "restaurant-ruhpoldinger-hof",
    suche: GASTRONOMIE.ruhpoldingerHof,
    name: GASTRONOMIE.ruhpoldingerHof,
    nameEn: GASTRONOMIE.ruhpoldingerHof,
    beschreibung:
      "Hotel mit Speisesaal, Stuben und großem Biergarten. Am Abend gibt es à la carte Gerichte aus der bayerischen Küche.",
    beschreibungEn:
      "A hotel with a dining hall, parlours and a large beer garden. In the evening Bavarian dishes are served à la carte.",
    eckdaten: "Regionale Küche · Hauptstraße 30",
    eckdatenEn: "Regional cooking · Hauptstraße 30",
    geeignet: {
      de: "Gäste, die auf Barrierefreiheit achten: Ruhpolding Tourismus führt das Haus als barrierefrei.",
      en: "Guests who need step-free access: Ruhpolding Tourismus lists it as barrier-free.",
    },
    zeitenErfragen: true,
    topic: "essen",
    stichwoerter: ["ruhpoldingerhof", "braustueberl", "stuben"],
  },
  {
    id: "fischerwirt",
    web: "restaurant-fischerwirt",
    suche: GASTRONOMIE.fischerwirt,
    name: GASTRONOMIE.fischerwirt,
    nameEn: GASTRONOMIE.fischerwirt,
    beschreibung:
      "Am Rand des Ruhpoldinger Talkessels mit Blick auf die Berge. Regionale und internationale Küche mit saisonalen Produkten, dazu Fischgerichte und eine große Sonnenterrasse.",
    beschreibungEn:
      "On the edge of the Ruhpolding valley with a view of the mountains. Regional and international cooking with seasonal produce, fish dishes and a large sun terrace.",
    eckdaten: "Regionale und internationale Küche · Rauschbergstraße 1",
    eckdatenEn: "Regional and international cooking · Rauschbergstraße 1",
    zeitenErfragen: true,
    topic: "essen",
    stichwoerter: ["fischerwirt", "fisch", "fischgericht", "sonnenterrasse"],
  },
  {
    id: "weingarten",
    web: "restaurant-weingarten",
    suche: GASTRONOMIE.weingarten,
    name: GASTRONOMIE.weingarten,
    nameEn: GASTRONOMIE.weingarten,
    beschreibung:
      "Berggasthof mit gutbürgerlicher bayerischer Küche, etwa Schweinshaxe und Topfenstrudel, und einer Terrasse mit Blick über das Ruhpoldinger Tal.",
    beschreibungEn:
      "A mountain inn with traditional Bavarian cooking, such as pork knuckle and curd strudel, and a terrace looking over the Ruhpolding valley.",
    eckdaten: "Bayerische Küche · Weingarten 1",
    eckdatenEn: "Bavarian cooking · Weingarten 1",
    geeignet: {
      de: "Auch größere Gruppen, mit 120 Plätzen drinnen.",
      en: "Larger groups too, with 120 seats inside.",
    },
    zeitenErfragen: true,
    topic: "essen",
    interessen: ["gemuetlich"],
    stichwoerter: ["weingarten", "schweinshaxe", "haxe", "topfenstrudel"],
  },
  {
    id: "butznwirt",
    web: "restaurant-butznwirt",
    suche: GASTRONOMIE.butznwirt,
    name: GASTRONOMIE.butznwirt,
    nameEn: GASTRONOMIE.butznwirt,
    beschreibung:
      "Traditioneller Berggasthof in Brand auf 850 m, einen Kilometer südwestlich des Freizeitparks. Der Wirt kocht selbst, europäische und deutsche Küche.",
    beschreibungEn:
      "A traditional mountain inn in Brand at 850 m, one kilometre south-west of the leisure park. The landlord cooks himself, European and German cuisine.",
    eckdaten: "Europäische und deutsche Küche · Brand 18",
    eckdatenEn: "European and German cuisine · Brand 18",
    zeitenErfragen: true,
    topic: "essen",
    interessen: ["gemuetlich"],
    stichwoerter: ["butz", "butzn", "butznwirt"],
  },
  {
    id: "holzstube",
    web: "restaurant-holzstube",
    suche: GASTRONOMIE.holzstube,
    name: GASTRONOMIE.holzstube,
    nameEn: GASTRONOMIE.holzstube,
    beschreibung:
      "Kleines Steakhouse-Pub an großen gemeinsamen Tischen, mit Steaks, Ribs und Burgern. Das Fleisch kommt von Bauern aus der Region.",
    beschreibungEn:
      "A small steakhouse pub with large shared tables, serving steaks, ribs and burgers. The meat comes from farmers in the region.",
    eckdaten: "Steakhouse · Hauptstraße 34",
    eckdatenEn: "Steakhouse · Hauptstraße 34",
    zeitenErfragen: true,
    topic: "essen",
    stichwoerter: ["holzstube", "steak", "steakhouse", "burger", "ribs", "pub"],
  },
  {
    id: "pizza-co",
    web: "restaurant-pizza-co",
    suche: GASTRONOMIE.pizzaCo,
    name: GASTRONOMIE.pizzaCo,
    nameEn: GASTRONOMIE.pizzaCo,
    beschreibung:
      "Italienisches Restaurant mit Biergarten. Ruhpolding Tourismus empfiehlt besonders die Pesto-Pizza.",
    beschreibungEn:
      "An Italian restaurant with a beer garden. Ruhpolding Tourismus particularly recommends the pesto pizza.",
    eckdaten: "Mediterrane Küche, auch vegetarisch · Hauptstraße 47",
    eckdatenEn: "Mediterranean cooking, vegetarian dishes too · Hauptstraße 47",
    geeignet: {
      de: "Auch mit Hund, das Lokal ist als hundefreundlich geführt.",
      en: "Dog owners too, it is listed as dog-friendly.",
    },
    zeitenErfragen: true,
    topic: "essen",
    stichwoerter: ["pizza", "pizzaco", "pesto"],
  },
  {
    id: "bell-ponte",
    web: "restaurant-bell-ponte",
    suche: GASTRONOMIE.bellPonte,
    name: GASTRONOMIE.bellPonte,
    nameEn: GASTRONOMIE.bellPonte,
    beschreibung: "Restaurant und Bar mit Pizza und Pasta, auch auf ein Bier.",
    beschreibungEn:
      "A restaurant and bar with pizza and pasta, also for a beer.",
    eckdaten: "Mediterrane Küche, auch vegetarisch · Waldbahnstraße 2",
    eckdatenEn:
      "Mediterranean cooking, vegetarian dishes too · Waldbahnstraße 2",
    zeitenErfragen: true,
    topic: "essen",
    stichwoerter: ["bellponte", "ponte", "pasta", "nudeln"],
  },
  {
    id: "safran",
    web: "restaurant-safran",
    suche: GASTRONOMIE.safran,
    name: GASTRONOMIE.safran,
    nameEn: "Safran Indian restaurant",
    beschreibung:
      "Indisches Restaurant mit Terrasse, auch mit vegetarischen Gerichten.",
    beschreibungEn:
      "An Indian restaurant with a terrace, with vegetarian dishes too.",
    eckdaten: "Indische Küche · Hauptstraße 25 a",
    eckdatenEn: "Indian cuisine · Hauptstraße 25 a",
    zeitenErfragen: true,
    topic: "essen",
    stichwoerter: ["safran", "indisch", "indien", "indian", "curry"],
  },

  /* ---------------------------------------------------------------- *
   * Sport, Quelle ruhpolding.de/zeit-fuer-bewegung und die dort verlinkten
   * Seiten, abgerufen 2026-09-23. Rad und Mountainbike stehen oben bei den
   * Radtouren, Wintersport unter "Winter".
   * ---------------------------------------------------------------- */
  {
    id: "tandemflug",
    web: "paragleiten",
    bild: "tandemflug",
    suche: "Unternbergbahn",
    name: "Tandem-Gleitschirmflug am Unternberg",
    nameEn: "Tandem paragliding at the Unternberg",
    // ruhpolding.de/der-traum-vom-fliegen: "Mit einem Tandempiloten kann
    // hier jeder abheben." Die Flugschule Freiraum sitzt am Fuß des
    // Unternbergs. ruhpolding.de/fliegen-und-paragleiten: Landeplatz in
    // Bärngschwendt.
    beschreibung:
      "Der Unternberg ist ein Lieblingsrevier der Gleitschirmflieger. Mit einem Tandempiloten kann dort jeder abheben, auch ohne eigene Flugerfahrung. Tandemflüge bietet die Flugschule Freiraum am Fuß des Unternbergs an.",
    beschreibungEn:
      "The Unternberg is a favourite spot for paragliders. With a tandem pilot anyone can take off there, even without flying experience. Tandem flights are offered by the Freiraum flying school at the foot of the Unternberg.",
    eckdaten: "Tandemflug mit Pilot · Start am Unternberg · Landeplatz in Bärngschwendt",
    eckdatenEn: "Tandem flight with a pilot · take-off at the Unternberg · landing field in Bärngschwendt",
    geeignet: {
      de: "Alle, die einmal fliegen möchten. Im Bericht auf ruhpolding.de war der jüngste Passagier des Piloten vier Jahre alt, der älteste über 80.",
      en: "Anyone who would like to fly once. In the report on ruhpolding.de the pilot's youngest passenger was four years old, the oldest over 80.",
    },
    achtung: {
      de: "Ob geflogen wird, entscheiden Wetter und Wind. Einen Termin vereinbaren Sie mit der Flugschule.",
      en: "Whether you fly depends on the weather and the wind. You arrange a date with the flying school.",
    },
    topic: "sport",
    interessen: ["sport"],
    beiRegenNicht: true,
    stichwoerter: [
      "tandemflug",
      "tandem",
      "gleitschirm",
      "gleitschirmflug",
      "gleitschirmfliegen",
      "paragliding",
      "paraglider",
      "fliegen",
      "freiraum",
    ],
  },
  {
    id: "flyline",
    web: "fly-line",
    bild: "flyline",
    suche: "Unternbergbahn",
    name: "Fly-Line am Unternberg",
    nameEn: "Fly-Line at the Unternberg",
    beschreibung:
      "Eine sanfte Fahrt im Sitzgurt durch den Wald, mit Blick auf das Bergpanorama. Ein geschultes Trainerteam begleitet die Fahrt. Mit der Chiemgau Karte ist pro angefangener Urlaubswoche eine Einzelfahrt inklusive.",
    beschreibungEn:
      "A gentle ride in a harness through the forest, with a view of the mountain panorama. A trained team accompanies the ride. With the Chiemgau Karte one single ride per started holiday week is included.",
    eckdaten: "rund 600 m · Fahrt etwa 11 Minuten, davon 4:30 Minuten Abfahrt",
    eckdatenEn: "about 600 m · ride about 11 minutes, 4:30 minutes of it downhill",
    geeignet: {
      de: "Familien, Freundeskreise und Gruppen.",
      en: "Families, friends and groups.",
    },
    achtung: {
      de: "Geöffnet in der Sommersaison. Laut ruhpolding.de können die Zeiten am Unternberg je nach Wetter abweichen.",
      en: "Open in the summer season. According to ruhpolding.de the times at the Unternberg can vary with the weather.",
    },
    zeitenErfragen: true,
    topic: "sport",
    interessen: ["sport", "familie"],
    kurz: true,
    stichwoerter: ["flyline", "fly", "line", "zipline"],
  },
  {
    id: "bergfit",
    web: "bergfit",
    bild: "bergfit",
    suche: "Rathaus Ruhpolding",
    name: "BergFit-Weg",
    nameEn: "BergFit trail",
    beschreibung:
      "Ein Fitnesstest im Gehen, vom Rathaus hinauf zum Adlerhügel. Oben zeigt die Auswertung, welche Tourenschwierigkeit gerade zu Ihrer Kondition passt: leicht, mittel oder schwer.",
    beschreibungEn:
      "A fitness test on foot, from the town hall up to the Adlerhügel. At the top the evaluation shows which tour difficulty currently suits your fitness: easy, medium or hard.",
    eckdaten: "1,4 km · 0:25 h · 92 Höhenmeter · leicht",
    eckdatenEn: "1.4 km · 0:25 h · 92 m ascent · easy",
    schwierigkeit: "leicht",
    geeignet: {
      de: "Alle, die vor einer Bergtour wissen wollen, was sie sich zutrauen können.",
      en: "Anyone who wants to know before a mountain tour what they can take on.",
    },
    achtung: {
      de: "Mitnehmen: Pulsmessung mit Brust- oder Oberarmgurt (Verleih bei Sport Plenk, Hauptstraße 55), eine Uhr und festes Schuhwerk. Der Test wird gegangen, nicht gelaufen.",
      en: "Bring: heart rate measurement with a chest or arm strap (hire at Sport Plenk, Hauptstraße 55), a watch and sturdy shoes. The test is walked, not run.",
    },
    topic: "sport",
    interessen: ["sport"],
    kurz: true,
    stichwoerter: ["bergfit", "fitnesstest", "fitness", "kondition", "adlerhuegel"],
  },
  {
    id: "terrainkur",
    web: "terrainkur",
    suche: "Naturschutzgebiet Drei-Seen-Gebiet",
    name: "Terrainkurweg Klein Kanada",
    nameEn: "Klein Kanada terrain cure trail",
    beschreibung:
      "Ein ausgeschilderter Gesundheitsweg für dosiertes Ausdauertraining, auf 750 bis 780 Metern Höhe. Unterwegs gibt es Ruhemöglichkeiten.",
    beschreibungEn:
      "A signposted health trail for measured endurance training, at 750 to 780 metres altitude. There are places to rest along the way.",
    eckdaten: "6,6 km · 2:00 h · 30 Höhenmeter · leicht",
    eckdatenEn: "6.6 km · 2:00 h · 30 m ascent · easy",
    schwierigkeit: "leicht",
    geeignet: {
      de: "Laut ruhpolding.de für Menschen mit unterschiedlicher Leistungsfähigkeit, im eigenen Tempo.",
      en: "According to ruhpolding.de for people of differing fitness, at their own pace.",
    },
    topic: "sport",
    interessen: ["sport", "gemuetlich"],
    stichwoerter: ["terrainkur", "terrainkurweg", "kanada", "gesundheitsweg", "walking"],
  },
  {
    id: "golfclub",
    web: "golf",
    bild: "golf",
    suche: "Golfclub Ruhpolding",
    name: "Golfclub Ruhpolding",
    nameEn: "Ruhpolding golf club",
    beschreibung:
      "Golf mit Bergpanorama, mit großer Übungsanlage und Schnupperangeboten. Laut ruhpolding.de geeignet vom Anfänger bis zum Profi.",
    beschreibungEn:
      "Golf with a mountain panorama, a large practice area and taster offers. According to ruhpolding.de suitable from beginner to pro.",
    eckdaten: "Rauschbergstraße 1a · Tel. +49 8663 2461",
    eckdatenEn: "Rauschbergstraße 1a · phone +49 8663 2461",
    geeignet: {
      de: "Geübte Golfer und Einsteiger. Wer es ausprobieren will, fängt am besten mit einem Schnupperkurs an.",
      en: "Experienced golfers and beginners. Anyone who wants to try it is best off starting with a taster course.",
    },
    achtung: {
      de: "Ein Polohemd reicht, Jogginghose und ärmelloses Shirt gehen nicht.",
      en: "A polo shirt is fine, tracksuit bottoms and sleeveless shirts are not.",
    },
    zeitenErfragen: true,
    topic: "sport",
    interessen: ["sport"],
    stichwoerter: ["golf", "golfen", "golfclub", "golfplatz", "abschlag", "platzreife"],
  },
  {
    id: "adventuregolf",
    web: "adventure-golf",
    bild: "adventuregolf",
    suche: "Adventure Golf Park Ruhpolding",
    name: "Adventure Golf Park",
    nameEn: "Adventure Golf Park",
    beschreibung:
      "18 Themenbahnen, dazu 5 Bahnen Kleingolf, die echtes Golfspiel nachahmen. Mit der Chiemgau Karte einmal pro angefangener Urlaubswoche frei.",
    beschreibungEn:
      "18 themed holes plus 5 short-golf holes that imitate real golf. Free once per started holiday week with the Chiemgau Karte.",
    eckdaten: "je nach Witterung Mitte/Ende März bis Ende November · Tel. +49 8663 2461",
    eckdatenEn: "depending on the weather mid/late March to end of November · phone +49 8663 2461",
    geeignet: {
      de: "Familien, Freundeskreise und Gruppen.",
      en: "Families, friends and groups.",
    },
    achtung: {
      de: "Bei Regen können die Öffnungszeiten abweichen. Im Zweifel vorher anrufen.",
      en: "In the rain the opening hours may differ. If in doubt, call ahead.",
    },
    topic: "sport",
    interessen: ["sport", "familie"],
    beiRegenNicht: true,
    kurz: true,
    stichwoerter: ["adventuregolf", "adventure", "themenbahn", "kleingolf"],
  },
  {
    id: "minigolf",
    web: "minigolf",
    bild: "minigolf",
    suche: "Minigolf am Kurhaus",
    name: "Minigolf am Kurhaus",
    nameEn: "Minigolf at the Kurhaus",
    beschreibung:
      "Minigolf, Jetgolf, PitPat, Tischtennis, Tischfußball und Billard, etwa 50 Meter südlich des Kurparks. Bei Dunkelheit wird mit Flutlicht gespielt.",
    beschreibungEn:
      "Minigolf, jet golf, PitPat, table tennis, table football and billiards, about 50 metres south of the spa park. After dark they play under floodlights.",
    eckdaten: "Kurhausstraße 7a · Tel. +49 8663 5663",
    eckdatenEn: "Kurhausstraße 7a · phone +49 8663 5663",
    geeignet: {
      de: "Familien und alle, die es gesellig mögen.",
      en: "Families and anyone who likes it sociable.",
    },
    achtung: {
      de: "Geöffnet bei trockener Witterung.",
      en: "Open in dry weather.",
    },
    topic: "sport",
    interessen: ["sport", "familie", "gemuetlich"],
    beiRegenNicht: true,
    kurz: true,
    stichwoerter: ["minigolf", "jetgolf", "pitpat", "tischtennis", "billard"],
  },

  /* ---------------------------------------------------------------- *
   * Nicht belegt: werden gefunden, aber nicht beschrieben
   * ---------------------------------------------------------------- */
  {
    id: "foerchensee",
    ungesichert: "Rundweg, Länge und Barfußweg auf keiner geprüften Seite belegt",
    suche: "Förchensee",
    name: WANDERN.foerchensee,
    nameEn: WANDERN.foerchensee,
    beschreibung: "",
    beschreibungEn: "",
    eckdaten: "",
    eckdatenEn: "",
    topic: "wandern",
    stichwoerter: ["foerchensee", "barfussweg"],
  },
  {
    id: "kurpark",
    ungesichert: "Kurpark und Sommerkonzerte nicht belegt",
    suche: "Kurpark Ruhpolding",
    name: EVENTS.kurpark,
    nameEn: EVENTS.kurpark,
    beschreibung: "",
    beschreibungEn: "",
    eckdaten: "",
    eckdatenEn: "",
    topic: "events",
    stichwoerter: ["kurpark", "konzert", "standkonzert", "sommerkonzert"],
  },
  {
    id: "rathausplatz",
    ungesichert: "Rathausplatz und Wochenmarkt nicht belegt",
    suche: "Rathausplatz Ruhpolding",
    name: EVENTS.rathausplatz,
    nameEn: EVENTS.rathausplatz,
    beschreibung: "",
    beschreibungEn: "",
    eckdaten: "",
    eckdatenEn: "",
    topic: "events",
    // "Markt" ist bewusst nicht dabei: über die Kompositum-Regel träfe das
    // Wort jeden Supermarkt.
    stichwoerter: ["rathausplatz", "dorfplatz", "marktplatz"],
  },

  /* ---------------------------------------------------------------- *
   * Winter und Veranstaltungen
   * ---------------------------------------------------------------- */
  {
    id: "arena",
    flyer: "ortsplan",
    suche: "Chiemgau Arena",
    name: EVENTS.chiemgauArena,
    nameEn: EVENTS.chiemgauArena,
    beschreibung: `Das sportliche Herzstück des Biathlons in Ruhpolding. Der nächste ${EVENTS.biathlonKurz} ist ${EVENTS.biathlonTermin}.`,
    beschreibungEn: `The sporting heart of biathlon in Ruhpolding. The next ${EVENTS.biathlonKurzEn} is ${EVENTS.biathlonTerminEn}.`,
    eckdaten: "Dorflinie 9533 hält an der Arena",
    eckdatenEn: "Village bus 9533 stops at the arena",
    topic: "winter",
    naehe: "arena",
    stichwoerter: [
      "arena",
      "chiemgauarena",
      "stadion",
      "loipe",
      "langlauf",
      "biathlon",
      "skating",
      "crosscountry",
    ],
  },
  {
    id: "westernberg",
    web: "ski-alpin",
    suche: "Skigebiet Westernberg",
    name: `Skigebiet ${WINTER.skigebiet}`,
    nameEn: `${WINTER.skigebiet} ski area`,
    beschreibung:
      "Eines der drei Skigebiete im Ort, neben Unternberg und Maiergschwendt.",
    beschreibungEn:
      "One of the three ski areas in the village, alongside Unternberg and Maiergschwendt.",
    eckdaten: "Alpin, im Winter",
    eckdatenEn: "Downhill, in winter",
    topic: "winter",
    stichwoerter: [
      "westernberg",
      "skigebiet",
      "abfahrt",
      "piste",
      "alpin",
      "skifahren",
    ],
  },

  /* ---------------------------------------------------------------- *
   * Anreise
   * ---------------------------------------------------------------- */
  {
    id: "touristinfo",
    web: "kontakt",
    flyer: "ortsplan",
    suche: "Tourist Information",
    name: "Tourist-Information Ruhpolding",
    nameEn: "Ruhpolding tourist information",
    beschreibung:
      "Am Bahnhof, Bahnhofstraße 8. Im Eingangsbereich liegen die Flyer aus, er ist auch außerhalb der Öffnungszeiten zugänglich.",
    beschreibungEn:
      "At the station, Bahnhofstraße 8. The flyers are laid out in the entrance area, which is open outside opening hours too.",
    eckdaten: "Mo bis Fr 9 bis 17 Uhr, Sa 9 bis 12 Uhr",
    eckdatenEn: "Mon to Fri 9 to 17, Sat 9 to 12",
    topic: "info",
    naehe: "touristinfo",
    stichwoerter: ["touristinfo", "touristinformation", "auskunft"],
  },
  {
    id: "bahnhof",
    suche: "Bahnhof Ruhpolding",
    name: "Bahnhof Ruhpolding",
    nameEn: "Ruhpolding station",
    beschreibung:
      "Endpunkt der Linie RB 53 aus Traunstein. Von hier fährt auch die Dorflinie 9533 in den Ort und zur Chiemgau Arena. Am Bahnhof gibt es laut Ortsplan einen kostenlosen Park-&-Ride-Parkplatz.",
    beschreibungEn:
      "Terminus of line RB 53 from Traunstein. The 9533 village bus also runs from here into the village and to the Chiemgau Arena. According to the village map there is a free park and ride car park at the station.",
    eckdaten: "Bahn nach Traunstein, mit der Chiemgau Karte kostenlos",
    eckdatenEn: "Trains to Traunstein, free with the Chiemgau Karte",
    topic: "anreise",
    naehe: "bahnhof",
    stichwoerter: ["bahnhof", "gleis", "bahnsteig", "haltestelle"],
  },
  {
    id: "rathausgarage",
    suche: "Rathaus Tiefgarage",
    name: PARKEN.rathaus,
    nameEn: "Town hall underground car park",
    beschreibung:
      "Die Tiefgarage im Zentrum. Im übrigen Ortszentrum parken Sie laut Flyer kostenfrei, Parkzeitbegrenzungen und Parkscheibe gelten weiterhin.",
    beschreibungEn:
      "The underground car park in the centre. Elsewhere in the village centre parking is free according to the flyer, but time limits and parking discs still apply.",
    eckdaten: PARKEN.rathausTarif,
    eckdatenEn: PARKEN.rathausTarifEn,
    topic: "anreise",
    stichwoerter: [
      "rathaus",
      "tiefgarage",
      "garage",
      "parkhaus",
      "parken",
      "parkplatz",
    ],
  },
  {
    id: "laubau",
    suche: "Parkplatz Holzknechtmuseum",
    name: PARKEN.laubau,
    nameEn: PARKEN.laubauEn,
    beschreibung: `Ausgangspunkt für die Touren im Süden, unter anderem für den Aufstieg auf das ${WANDERN.sonntagshorn}.`,
    beschreibungEn: `Starting point for the tours in the south, among them the climb up the ${WANDERN.sonntagshorn}.`,
    eckdaten: PARKEN.laubauTarif,
    eckdatenEn: PARKEN.laubauTarifEn,
    topic: "anreise",
    stichwoerter: ["laubau", "wanderparkplatz", "ausgangspunkt"],
  },
]

export function ziel(id: string): Ziel | undefined {
  return ZIELE.find((eintrag) => eintrag.id === id)
}

/**
 * Eine Auswahl von Zielen, aus der der Prototyp Vorschläge macht.
 *
 * Die Reihenfolge ist die Reihenfolge der Vorschläge: die ersten drei kommen
 * zuerst, wer nach anderen fragt, bekommt die nächsten.
 *
 * Eine Hervorhebung als "beliebtester" gibt es nicht. Sie wäre erfunden und
 * stellte ein Angebot über ein anderes (M [00:43:01]).
 *
 * Ungesicherte Ziele dürfen hier stehen, sie werden beim Vorschlagen
 * herausgefiltert.
 */
export type Gruppe = {
  id: string
  /** Einleitungen zur Vorschlagsliste, eine wird gezogen. */
  einleitung: string[]
  einleitungEn: string[]
  /** Ziel-IDs in Vorschlagsreihenfolge. */
  ziele: string[]
  /**
   * Ein Satz, der in der ersten Runde und am Ende der Liste mitkommt, etwa
   * dass die Auswahl nicht vollständig ist.
   */
  hinweis?: { de: string; en: string }
}

/*
 * Vorgabe des Autors vom 23.09.2026: Wer nach Restaurants fragt, soll
 * erfahren, dass der Prototyp nur einen Teil der Lokale kennt. Die Liste auf
 * ruhpolding.de führt 62 Betriebe.
 */
const HINWEIS_RESTAURANTS = {
  de: "Mein Wissensstand umfasst nicht alle Restaurants in Ruhpolding. Die vollständige Liste finden Sie unter ruhpolding.de/gaststaetten-und-restaurants.",
  en: "My knowledge does not cover every restaurant in Ruhpolding. You will find the full list at ruhpolding.de/gaststaetten-und-restaurants.",
}

export const GRUPPEN: Record<string, Gruppe> = {
  hier: {
    id: "hier",
    einleitung: [
      "Sie stehen {standort:kurz}. Das funktioniert von hier aus gut:",
      "Von hier, {standort:kurz}, würde ich Ihnen das vorschlagen:",
    ],
    einleitungEn: [
      "You are at {standort:kurz}. These work well from here:",
      "From here, at {standort:kurz}, I would suggest these:",
    ],
    ziele: [
      "kirche",
      "kapellenweg",
      "vitalwelt",
      "freizeitpark",
      "sagenweg",
      "heimatmuseum",
    ],
  },
  wandern: {
    id: "wandern",
    einleitung: [
      "Aus dem Wanderflyer der Tourist-Information:",
      "Diese Wege nennt der Flyer mit den schönsten Wander- und Spazierwegen:",
    ],
    einleitungEn: [
      "From the tourist information's walking flyer:",
      "These trails are in the flyer with the most beautiful walks:",
    ],
    ziele: [
      "sagenweg",
      "taubensee",
      "schwarzachen",
      "dreiseen",
      "bergwald",
      "kapellenweg",
      "jubilaeumsweg",
      "staubfall",
    ],
  },
  gipfel: {
    id: "gipfel",
    einleitung: [
      "Aus dem Flyer mit den schönsten Gipfeltouren, von leicht bis schwer:",
    ],
    einleitungEn: ["From the summit hikes flyer, from easy to difficult:"],
    ziele: [
      "zinnkopf",
      "haaralmschneid",
      "unternberg-tour",
      "hochfelln",
      "hoerndlwand",
      "rauschberg-gipfel",
      "sonntagshorn",
    ],
  },
  rad: {
    id: "rad",
    einleitung: ["Aus dem Radflyer der Tourist-Information:"],
    einleitungEn: ["From the tourist information's cycling flyer:"],
    ziele: ["rad-tal", "rad-staubfall", "rad-roethelmoos", "rad-zinnkopf"],
  },
  familie: {
    id: "familie",
    einleitung: [
      "Mit Kindern kommen diese Ziele infrage:",
      "Mit Kindern würde ich Ihnen diese vorschlagen:",
    ],
    einleitungEn: [
      "With children these places come into question:",
      "With children I would suggest these:",
    ],
    ziele: [
      "freizeitpark",
      "vitalwelt",
      "sagenweg",
      "maerchenwald",
      "bergwald",
      "schwarzachen",
      "coaster",
      "holzknechtmuseum",
      "foerchensee",
    ],
  },
  // Wer nach Museen fragt, bekam die Kulturliste mit Kirche und Kapellenweg
  // vorneweg (Browsertest vom 24.09.2026). Hier stehen nur die Museen.
  museen: {
    id: "museen",
    einleitung: ["Im Ort gibt es drei Museen:"],
    einleitungEn: ["There are three museums in the village:"],
    ziele: ["heimatmuseum", "holzknechtmuseum", "glockenschmiede"],
  },
  kultur: {
    id: "kultur",
    einleitung: [
      "Für Kultur im Ort kommen diese infrage:",
      "Wenn es Ihnen um Kultur geht, dann diese:",
    ],
    einleitungEn: [
      "For culture in the village, these come into question:",
      "If culture is what you are after, then these:",
    ],
    ziele: [
      "kirche",
      "kapellenweg",
      "heimatmuseum",
      "holzknechtmuseum",
      "glockenschmiede",
    ],
  },
  /*
   * Essen ist nach Ort getrennt: die Restaurants im Ort und die Almen am
   * Berg. Wer im Ort essen will, bekommt keine Alm vorgeschlagen (Vorgabe
   * des Autors vom 23.09.2026).
   *
   * Die Küchen folgen dem Feld "Art der Küche" auf der Detailseite jedes
   * Lokals bei ruhpolding.de, abgerufen 2026-09-23. Drei Seiten haben das
   * Feld nicht, dort gilt die Beschreibung: Weingarten ("typisch bayerischen
   * Schmankerln"), Butz'n Wirt ("Europäische/Deutsche Küche", deshalb bei
   * den regionalen) und die Holzstube ("Steakhouse Pub", deshalb
   * international).
   */
  essen: {
    id: "essen",
    einleitung: [
      "Diese Restaurants im Ort führt Ruhpolding Tourismus in seiner Gastronomieliste:",
    ],
    einleitungEn: [
      "These restaurants in the village are on the Ruhpolding Tourismus list:",
    ],
    ziele: [
      "post",
      "maiers",
      "pizzeria",
      "haeusler",
      "safran",
      "fischerwirt",
      "ruhpoldinger-hof",
      "pizza-co",
      "holzstube",
      "weingarten",
      "bell-ponte",
      "butznwirt",
    ],
    hinweis: HINWEIS_RESTAURANTS,
  },
  "essen-regional": {
    id: "essen-regional",
    einleitung: ["Bayerische und regionale Küche gibt es zum Beispiel hier:"],
    einleitungEn: ["For Bavarian and regional cooking, for example:"],
    ziele: [
      "post",
      "maiers",
      "haeusler",
      "ruhpoldinger-hof",
      "fischerwirt",
      "weingarten",
      "butznwirt",
    ],
    hinweis: HINWEIS_RESTAURANTS,
  },
  "essen-italienisch": {
    id: "essen-italienisch",
    einleitung: ["Italienisch und mediterran essen Sie hier:"],
    einleitungEn: ["For Italian and Mediterranean food:"],
    ziele: ["pizzeria", "pizza-co", "bell-ponte"],
    hinweis: HINWEIS_RESTAURANTS,
  },
  "essen-international": {
    id: "essen-international",
    einleitung: ["Internationale Küche gibt es hier:"],
    einleitungEn: ["For international cooking:"],
    ziele: ["safran", "holzstube", "fischerwirt"],
    hinweis: HINWEIS_RESTAURANTS,
  },
  "essen-vegetarisch": {
    id: "essen-vegetarisch",
    einleitung: [
      "Vegetarische Gerichte führen laut Ruhpolding Tourismus diese Lokale:",
    ],
    einleitungEn: [
      "According to Ruhpolding Tourismus these places have vegetarian dishes:",
    ],
    ziele: ["post", "maiers", "pizzeria", "pizza-co", "bell-ponte", "safran"],
    hinweis: HINWEIS_RESTAURANTS,
  },
  almen: {
    id: "almen",
    einleitung: ["Zum Einkehren am Berg nennt der Almflyer diese Almen:"],
    einleitungEn: ["For a stop on the mountain, the alpine flyer names these:"],
    ziele: ["unternbergalm", "langerbauer", "brander"],
  },
  sport: {
    id: "sport",
    einleitung: [
      "Sportlich hat Ruhpolding einiges zu bieten. Zum Beispiel:",
      "Wer sich bewegen will, ist hier richtig. Ein paar Ideen:",
    ],
    einleitungEn: [
      "Ruhpolding has plenty to offer for sport. For example:",
      "If you want to get moving, you are in the right place. A few ideas:",
    ],
    ziele: [
      "tandemflug",
      "flyline",
      "golfclub",
      "bergfit",
      "adventuregolf",
      "terrainkur",
      "minigolf",
      "vitalwelt",
    ],
  },
  winter: {
    id: "winter",
    einleitung: [
      "Für den Winter kommen diese infrage:",
      "Im Winter vor allem diese:",
    ],
    einleitungEn: [
      "For winter, these come into question:",
      "In winter mainly these:",
    ],
    ziele: ["arena", "westernberg", "coaster"],
  },
  events: {
    id: "events",
    einleitung: [
      "Veranstaltungen finden unter anderem hier statt:",
      "Ein fester Ort für Veranstaltungen ist dieser:",
    ],
    einleitungEn: [
      "Events take place here, among other places:",
      "One fixed venue for events is this:",
    ],
    ziele: ["arena", "kurpark", "rathausplatz"],
  },
  anreise: {
    id: "anreise",
    einleitung: [
      "Zwei Stellplätze, die je nach Vorhaben passen:",
      "Beim Parken kommt es darauf an, was Sie vorhaben:",
    ],
    einleitungEn: [
      "Two car parks, depending on your plans:",
      "Where to park depends on what you have in mind:",
    ],
    ziele: ["rathausgarage", "laubau"],
  },
}

/** Wie viele Ziele ein Vorschlag umfasst. */
export const VORSCHLAEGE = 3
