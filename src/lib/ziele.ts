import type { FlyerId } from "@/lib/flyer"
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
export type Interesse = "berge" | "rad" | "familie" | "kultur" | "gemuetlich"

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
  return mapsSucheFrei(`${ziel} Ruhpolding`)
}

/** Dieselbe Abfrage ohne den Ortszusatz, für Ziele außerhalb. */
export function mapsSucheFrei(anfrage: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    anfrage
  )}`
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
    suche: "Wanderparkplatz Wildbachfurt",
    name: "Drei-Seen-Gebiet",
    nameEn: "Three-lakes area",
    beschreibung:
      "Eine Runde an Löden-, Mitter- und Weitsee im Naturschutzgebiet. Start ist an der Wildbachfurt.",
    beschreibungEn:
      "A walk past the Lödensee, Mittersee and Weitsee in the nature reserve. It starts at Wildbachfurt.",
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
    suche: "Wanderparkplatz Laubau",
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
    // Belegt: kein Fahrbetrieb wegen des geplanten Neubaus, siehe daten.ts.
    ausserBetrieb: {
      de: "Die Rauschbergbahn fährt derzeit nicht, weil sie neu gebaut wird. Ein Termin für die Wiederaufnahme ist nicht bekannt.",
      en: "The Rauschberg lift is not running at present because it is being rebuilt. No date for reopening is known.",
    },
    suche: "Talstation Rauschbergbahn",
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
    flyer: "almsommer",
    suche: "Talstation Unternbergbahn",
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
    interessen: ["familie", "gemuetlich"],
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
    flyer: "ortsplan",
    suche: "Glockenschmiede",
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
    suche: "Hotel zur Post",
    name: GASTRONOMIE.gasthausPost,
    nameEn: GASTRONOMIE.gasthausPost,
    beschreibung:
      "Restaurant mitten im Ort, in der Gastronomieliste von Ruhpolding Tourismus geführt.",
    beschreibungEn:
      "A restaurant in the middle of the village, listed by Ruhpolding Tourismus.",
    eckdaten: "Im Ortszentrum",
    eckdatenEn: "In the village centre",
    zeitenErfragen: true,
    topic: "essen",
    stichwoerter: [
      "post",
      "gasthaus",
      "gasthof",
      "bayerisch",
      "wirtshaus",
      "abendessen",
    ],
  },
  {
    id: "pizzeria",
    suche: "Made in Italy Ruhpolding",
    name: GASTRONOMIE.pizzeria,
    nameEn: GASTRONOMIE.pizzeria,
    beschreibung:
      "Pizzeria und Eiscafé, in der Gastronomieliste von Ruhpolding Tourismus geführt.",
    beschreibungEn:
      "Pizzeria and ice cream café, listed by Ruhpolding Tourismus.",
    eckdaten: "Im Ortszentrum",
    eckdatenEn: "In the village centre",
    zeitenErfragen: true,
    topic: "essen",
    stichwoerter: [
      "pizzeria",
      "pizza",
      "eis",
      "italien",
      "eiscafe",
      "icecream",
    ],
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
    id: "gipfelalm",
    ungesichert:
      "keine Gipfelalm in der Gastronomieliste, und die Bahn dorthin fährt nicht",
    suche: "Gipfelalm Rauschberg",
    name: GASTRONOMIE.gipfelalm,
    nameEn: GASTRONOMIE.gipfelalm,
    beschreibung: "",
    beschreibungEn: "",
    eckdaten: "",
    eckdatenEn: "",
    topic: "essen",
    stichwoerter: ["gipfelalm", "berghuett", "bergstation"],
  },
  {
    id: "sportamort",
    ungesichert: "kein Verleihbetrieb dieses Namens in einer Quelle genannt",
    suche: "Sport Amort",
    name: WINTER.sportgeschaeft,
    nameEn: WINTER.sportgeschaeft,
    beschreibung: "",
    beschreibungEn: "",
    eckdaten: "",
    eckdatenEn: "",
    topic: "winter",
    stichwoerter: ["sportamort", "skiverleih"],
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
    suche: "Wanderparkplatz Laubau",
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
  essen: {
    id: "essen",
    einleitung: [
      "Diese Almen und Lokale nennen der Almflyer und die Gastronomieliste von Ruhpolding Tourismus:",
    ],
    einleitungEn: [
      "These mountain inns and restaurants are in the alpine flyer and the Ruhpolding Tourismus list:",
    ],
    ziele: [
      "unternbergalm",
      "langerbauer",
      "brander",
      "post",
      "pizzeria",
      "gipfelalm",
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
    ziele: ["arena", "westernberg", "coaster", "sportamort"],
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
