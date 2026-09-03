import type { Oeffnung } from "@/lib/jetzt"
import {
  BERGBAHNEN,
  EVENTS,
  FAMILIE,
  GASTRONOMIE,
  LOIPEN,
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
 */
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
}

/**
 * Google-Maps-Suchabfrage für ein Ziel in Ruhpolding.
 *
 * Keine erfundene Tatsache, sondern eine Abfrage, die die Karte selbst
 * beantwortet. Deshalb darf sie im Prototyp stehen, obwohl sonst nichts
 * erfunden wird.
 */
export function mapsSuche(ziel: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${ziel} Ruhpolding`
  )}`
}

export const ZIELE: Ziel[] = [
  /* Wandern */
  {
    id: "rauschberg",
    // Belegt: Sommerbetrieb 10 bis 18 Uhr, letzte Bergfahrt 17:30.
    oeffnung: {
      von: `${BERGBAHNEN.betriebSommerVon}:00`,
      bis: `${BERGBAHNEN.betriebSommerBis}:00`,
      letzterEinlass: BERGBAHNEN.letzteBergfahrt,
    },
    suche: "Talstation Rauschbergbahn",
    name: `${BERGBAHNEN.rauschbergName} mit der ${BERGBAHNEN.rauschbergBahn}`,
    nameEn: `${BERGBAHNEN.rauschbergName} by ${BERGBAHNEN.rauschbergBahnEn}`,
    beschreibung: `Mit der ${BERGBAHNEN.rauschbergBahn} ab dem Ort hinauf, oben Gipfelwege in alle Richtungen und die Terrasse der ${GASTRONOMIE.gipfelalm}.`,
    beschreibungEn: `The ${BERGBAHNEN.rauschbergBahnEn} takes you up from the village; at the top there are summit paths in every direction and the terrace of the ${GASTRONOMIE.gipfelalm}.`,
    eckdaten: `Berg- und Talfahrt ${BERGBAHNEN.rauschbergErwachsen}, täglich ${BERGBAHNEN.betriebSommerVon} bis ${BERGBAHNEN.betriebSommerBis} Uhr`,
    eckdatenEn: `Return ticket ${BERGBAHNEN.rauschbergErwachsen}, daily ${BERGBAHNEN.betriebSommerVon} to ${BERGBAHNEN.betriebSommerBis}`,
    topic: "wandern",
    naehe: "rauschberg",
    stichwoerter: [
      "rauschberg",
      "rauschbergbahn",
      "gondelbahn",
      "gondel",
      "seilbahn",
      "bergbahn",
      "kabinenbahn",
      "gipfelalm",
      "gondola",
      "cable",
    ],
  },
  {
    id: "foerchensee",
    suche: "Förchensee",
    name: `Rundweg am ${WANDERN.foerchensee}`,
    nameEn: `Loop around the ${WANDERN.foerchensee}`,
    beschreibung: `Eine ebene Runde um den See, ganzjährig begehbar und ohne Bergausrüstung zu schaffen. Am Ufer liegt auch der ${FAMILIE.barfussweg}.`,
    beschreibungEn: `A level loop around the lake, walkable all year and without any mountain gear. The ${FAMILIE.barfusswegEn} runs along the shore.`,
    eckdaten: `${WANDERN.foerchenseeRunde}, kinderwagentauglich`,
    eckdatenEn: `About 3 km, level, suitable for pushchairs`,
    topic: "wandern",
    stichwoerter: [
      "foerchensee",
      "see",
      "rundweg",
      "barfussweg",
      "eben",
      "flach",
      "kinderwagen",
      "leicht",
      "spazier",
      "loop",
      "lake",
    ],
  },
  {
    id: "sonntagshorn",
    tagesfuellend: true,
    suche: "Wanderparkplatz Laubau",
    name: WANDERN.sonntagshorn,
    nameEn: WANDERN.sonntagshorn,
    beschreibung: `Der höchste Berg der Chiemgauer Alpen. Der Aufstieg beginnt am ${WANDERN.sonntagshornStart} und verlangt festes Schuhwerk und Trittsicherheit.`,
    beschreibungEn: `The highest mountain in the Chiemgau Alps. The climb starts at the ${WANDERN.sonntagshornStart} and calls for sturdy boots and a head for heights.`,
    eckdaten: `${WANDERN.sonntagshornHoehe}, Gehzeit ${WANDERN.sonntagshornGehzeit}`,
    eckdatenEn: `${WANDERN.sonntagshornHoehe}, about nine hours on foot`,
    topic: "wandern",
    stichwoerter: [
      "sonntagshorn",
      "gipfel",
      "hoechst",
      "anspruchsvoll",
      "bergtour",
      "schwer",
      "steil",
      "summit",
      "demanding",
    ],
  },
  {
    id: "unternberg",
    oeffnung: {
      von: `${BERGBAHNEN.betriebSommerVon}:00`,
      bis: `${BERGBAHNEN.betriebSommerBis}:00`,
      letzterEinlass: BERGBAHNEN.letzteBergfahrt,
    },
    suche: "Talstation Unternbergbahn",
    name: `${BERGBAHNEN.unternbergName} mit der ${BERGBAHNEN.unternbergBahn}`,
    nameEn: `${BERGBAHNEN.unternbergName} by ${BERGBAHNEN.unternbergBahnEn}`,
    beschreibung: `Die ruhigere der beiden Bahnen. Oben führt ein breiter Weg zum Gipfelkreuz, und die ${GASTRONOMIE.almstueberl} liegt auf dem Rückweg.`,
    beschreibungEn: `The quieter of the two lifts. A broad path leads to the summit cross, and the ${GASTRONOMIE.almstueberl} is on the way back.`,
    eckdaten: `Berg- und Talfahrt ${BERGBAHNEN.unternbergErwachsen}, täglich ${BERGBAHNEN.betriebSommerVon} bis ${BERGBAHNEN.betriebSommerBis} Uhr`,
    eckdatenEn: `Return ticket ${BERGBAHNEN.unternbergErwachsen}, daily ${BERGBAHNEN.betriebSommerVon} to ${BERGBAHNEN.betriebSommerBis}`,
    topic: "wandern",
    stichwoerter: [
      "unternberg",
      "unternbergbahn",
      "sesselbahn",
      "sessellift",
      "sessel",
      "chairlift",
      "gipfelkreuz",
    ],
  },
  {
    id: "traun",
    suche: "Uferweg an der Traun",
    name: WANDERN.uferwegTraun,
    nameEn: "Riverside path along the Traun",
    beschreibung:
      "Ein flacher Weg am Wasser entlang, direkt vom Ort aus zu gehen. Gut für einen Nachmittag ohne Planung.",
    beschreibungEn:
      "A flat path along the water, starting straight from the village. Good for an afternoon without a plan.",
    eckdaten: "Eben, ganzjährig begehbar, jederzeit abkürzbar",
    eckdatenEn: "Level, walkable all year, easy to cut short",
    topic: "wandern",
    stichwoerter: ["traun", "uferweg", "fluss", "wasser", "river", "riverside"],
  },

  /* Mit Kindern */
  {
    id: "freizeitpark",
    // Belegt ist nur der Beginn, kein Ende. Deshalb steht hier auch keins.
    oeffnung: { von: "09:30" },
    suche: "Freizeitpark Ruhpolding",
    name: FAMILIE.freizeitpark,
    nameEn: FAMILIE.freizeitpark,
    beschreibung:
      "Märchenwald und Fahrgeschäfte auf einem Gelände, das sich gut an einem halben Tag schafft. Auch bei durchwachsenem Wetter brauchbar, mehrere Bereiche sind überdacht.",
    beschreibungEn:
      "A fairytale wood and rides on a site you can do in half a day. It works in mixed weather too, several areas are covered.",
    eckdaten: `Geöffnet ${FAMILIE.freizeitparkOeffnung}`,
    eckdatenEn: `Open ${FAMILIE.freizeitparkOeffnungEn}`,
    topic: "familie",
    stichwoerter: [
      "freizeitpark",
      "maerchenwald",
      "maerchen",
      "fahrgeschaeft",
      "park",
      "rutsche",
      "kind",
      "fairytale",
    ],
  },
  {
    id: "vitalwelt",
    suche: "Vita Alpina",
    name: FAMILIE.vitalwelt,
    nameEn: FAMILIE.vitalwelt,
    beschreibung:
      "Hallenbad mit Kinderbecken und Rutsche, dazu ein Saunabereich. Der sichere Griff, wenn es regnet.",
    beschreibungEn:
      "An indoor pool with a children's area and a slide, plus a sauna. The safe choice when it rains.",
    eckdaten: "Rollstuhlgerecht, Wickelmöglichkeit vorhanden",
    eckdatenEn: "Wheelchair accessible, baby changing available",
    topic: "familie",
    naehe: "vitalwelt",
    stichwoerter: [
      "vitalwelt",
      "vita",
      "alpina",
      "schwimmbad",
      "schwimm",
      "hallenbad",
      "bad",
      "sauna",
      "rutsche",
      "baden",
      "pool",
      "swim",
    ],
  },
  {
    id: "heimatmuseum",
    suche: "Heimatmuseum Ruhpolding",
    name: FAMILIE.heimatmuseum,
    nameEn: "Ruhpolding local history museum",
    beschreibung:
      "Klein, trocken und in einer Stunde durch. Nebenan hat die Tourist-Info eine Bastelecke für Kinder.",
    beschreibungEn:
      "Small, dry and done in an hour. Next door the tourist information keeps a craft corner for children.",
    eckdaten: "Innen, für einen Regennachmittag",
    eckdatenEn: "Indoors, made for a rainy afternoon",
    topic: "familie",
    stichwoerter: ["heimatmuseum", "museum", "regen", "drinnen", "indoor"],
  },

  /* Essen */
  {
    id: "gipfelalm",
    // Erreichbar nur mit der Bahn, also gilt deren Betriebszeit.
    oeffnung: {
      von: `${BERGBAHNEN.betriebSommerVon}:00`,
      bis: `${BERGBAHNEN.betriebSommerBis}:00`,
      letzterEinlass: BERGBAHNEN.letzteBergfahrt,
    },
    suche: "Gipfelalm Rauschberg",
    name: `${GASTRONOMIE.gipfelalm} am ${BERGBAHNEN.rauschbergName}`,
    nameEn: `${GASTRONOMIE.gipfelalm} on the ${BERGBAHNEN.rauschbergName}`,
    beschreibung: `Einkehr an der Bergstation mit Panoramaterrasse. Ohne die ${BERGBAHNEN.rauschbergBahn} kommt man nicht hin, dafür sitzt man oben.`,
    beschreibungEn: `A stop at the top station with a panoramic terrace. You need the ${BERGBAHNEN.rauschbergBahnEn} to get there, but then you are up on the mountain.`,
    eckdaten: "Im Sommer durchgehend geöffnet, kein Ruhetag",
    eckdatenEn: "Open throughout the summer, no closing day",
    topic: "essen",
    naehe: "rauschberg",
    stichwoerter: [
      "gipfelalm",
      "alm",
      "berghuett",
      "huett",
      "panorama",
      "terrasse",
      "bergstation",
      "oben",
    ],
  },
  {
    id: "post",
    suche: "Hotel zur Post",
    name: GASTRONOMIE.gasthausPost,
    nameEn: GASTRONOMIE.gasthausPost,
    beschreibung:
      "Bayerische Küche mitten im Ort, ohne Voranmeldung machbar. Der naheliegende Griff für ein Abendessen.",
    beschreibungEn:
      "Bavarian cooking in the middle of the village, no booking needed. The obvious choice for dinner.",
    eckdaten: `Ruhetag beachten: viele Häuser im Ort schließen ${GASTRONOMIE.ruhetage}`,
    eckdatenEn:
      "Mind the closing day: many places in the village shut on Monday or Tuesday",
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
    id: "unternbergalm",
    suche: "Unternberg Alm",
    name: GASTRONOMIE.almstueberl,
    nameEn: GASTRONOMIE.almstueberl,
    beschreibung:
      "Einkehr mit Spielplatz direkt daneben, gut mit dem Kinderwagen erreichbar. Wer mit Kindern unterwegs ist, sitzt hier am entspanntesten.",
    beschreibungEn:
      "A stop with a playground right beside it, easy to reach with a pushchair. The most relaxed option if you have children along.",
    eckdaten: "Spielplatz an der Hütte, kinderwagentauglicher Zugang",
    eckdatenEn: "Playground at the hut, pushchair-friendly access",
    topic: "essen",
    stichwoerter: [
      "unternbergalm",
      "almstueberl",
      "spielplatz",
      "kinder",
      "playground",
    ],
  },
  {
    id: "pizzeria",
    suche: "Made in Italy Ruhpolding",
    name: GASTRONOMIE.pizzeria,
    nameEn: GASTRONOMIE.pizzeria,
    beschreibung:
      "Pizza und Eis im Ortskern. Funktioniert auch spät und auch mit müden Kindern.",
    beschreibungEn:
      "Pizza and ice cream in the village centre. Works late in the day and with tired children.",
    eckdaten: "Im Ortskern, keine Reservierung nötig",
    eckdatenEn: "In the village centre, no booking needed",
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

  /* Winter */
  {
    id: "arena",
    suche: "Chiemgau Arena",
    name: `${EVENTS.chiemgauArena}, Loipen und Stadion`,
    nameEn: `${EVENTS.chiemgauArena}, trails and stadium`,
    beschreibung: `Das Wettkampfstadion des ${EVENTS.biathlonKurz} ist außerhalb der Rennen öffentlich nutzbar, die Loipen starten direkt dort.`,
    beschreibungEn: `The competition stadium of the ${EVENTS.biathlonKurzEn} is open to the public outside race days, and the trails start right there.`,
    eckdaten: `Loipennetz ${LOIPEN.netz}, Loipenpass ${LOIPEN.passTag} am Tag, ${LOIPEN.gaestekarte} mit Gästekarte`,
    eckdatenEn: `${LOIPEN.netz} of trails, day pass ${LOIPEN.passTag}, free with the guest card`,
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
      "Das kleine Alpingebiet am Ort. Überschaubar, kurze Wege, gut für einen halben Tag oder für Anfänger.",
    beschreibungEn:
      "The small downhill area by the village. Compact, short distances, good for half a day or for beginners.",
    eckdaten: "Alpin, klein, direkt am Ort",
    eckdatenEn: "Downhill, small, right by the village",
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
  {
    id: "sportamort",
    suche: "Sport Amort",
    name: `${WINTER.sportgeschaeft}, Verleih am Dorfplatz`,
    nameEn: `${WINTER.sportgeschaeft}, hire on the village square`,
    beschreibung:
      "Ausrüstung für Langlauf und Alpin. In der Ferienzeit lohnt sich eine Reservierung vorab.",
    beschreibungEn:
      "Equipment for cross-country and downhill. Worth reserving ahead during the holidays.",
    eckdaten: "Verleih und Service, am Dorfplatz",
    eckdatenEn: "Hire and servicing, on the village square",
    topic: "winter",
    stichwoerter: [
      "sportamort",
      "amort",
      "verleih",
      "ausruestung",
      "leihen",
      "mieten",
      "hire",
    ],
  },

  /* Veranstaltungen */
  {
    id: "kurpark",
    suche: "Kurpark Ruhpolding",
    name: EVENTS.kurpark,
    nameEn: EVENTS.kurpark,
    beschreibung: `Bühne der ${EVENTS.sommerkonzerte}. Zwischen den Konzerten einfach ein Park mitten im Ort.`,
    beschreibungEn: `Stage of the ${EVENTS.sommerkonzerteEn}. Between concerts simply a park in the middle of the village.`,
    eckdaten: EVENTS.sommerkonzerteZeit,
    eckdatenEn: EVENTS.sommerkonzerteZeitEn,
    topic: "events",
    stichwoerter: [
      "kurpark",
      "konzert",
      "standkonzert",
      "sommerkonzert",
      "buehne",
      "park",
    ],
  },
  {
    id: "rathausplatz",
    suche: "Rathausplatz Ruhpolding",
    name: EVENTS.rathausplatz,
    nameEn: EVENTS.rathausplatz,
    beschreibung: `Hier steht der ${EVENTS.wochenmarkt}, und hier liegt auch die Tiefgarage unter dem Rathaus.`,
    beschreibungEn: `Home of the ${EVENTS.wochenmarktEn}, and the underground car park sits below the town hall.`,
    eckdaten: EVENTS.wochenmarktZeit,
    eckdatenEn: EVENTS.wochenmarktZeitEn,
    topic: "events",
    // "Markt" ist bewusst nicht dabei: über die Kompositum-Regel träfe das
    // Wort jeden Supermarkt. Der Wochenmarkt ist ohnehin eine Veranstaltung
    // und keine Ortsangabe.
    stichwoerter: ["rathausplatz", "dorfplatz", "marktplatz"],
  },

  /* Anreise */
  {
    id: "bahnhof",
    suche: "Bahnhof Ruhpolding",
    name: "Bahnhof Ruhpolding",
    nameEn: "Ruhpolding station",
    beschreibung:
      "Endpunkt der Linie RB 53 aus Traunstein. Von hier fährt auch die Dorflinie 9533 in den Ort und zur Chiemgau Arena.",
    beschreibungEn:
      "Terminus of line RB 53 from Traunstein. The 9533 village bus also runs from here into the village and to the Chiemgau Arena.",
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
      "Die zentrale Garage, von hier ist alles im Ort zu Fuß erreichbar.",
    beschreibungEn:
      "The central garage; everything in the village is walkable from here.",
    eckdaten: `${PARKEN.rathausTarif}, ${PARKEN.gaestekarteHinweis}`,
    eckdatenEn: `${PARKEN.rathausTarif} per hour, free with the guest card`,
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
    nameEn: "Laubau hiking car park",
    beschreibung: `Ausgangspunkt für die Touren im Süden, unter anderem für den Aufstieg auf das ${WANDERN.sonntagshorn}.`,
    beschreibungEn: `Starting point for the tours in the south, among them the climb up the ${WANDERN.sonntagshorn}.`,
    eckdaten: PARKEN.laubauTarif,
    eckdatenEn: `Day ticket ${PARKEN.laubauTarif.replace("Tagesticket ", "")}`,
    topic: "anreise",
    stichwoerter: [
      "laubau",
      "wanderparkplatz",
      "holzknechtmuseum",
      "ausgangspunkt",
    ],
  },
]

export function ziel(id: string): Ziel | undefined {
  return ZIELE.find((eintrag) => eintrag.id === id)
}

/**
 * Eine Auswahl von Zielen, aus der der Prototyp Vorschläge macht.
 *
 * Die Reihenfolge ist die Reihenfolge der Vorschläge: die ersten drei kommen
 * zuerst, wer nach anderen fragt, bekommt die nächsten. Der Favorit steht
 * nicht zwingend vorn, sonst wäre die Hervorhebung keine Information.
 */
export type Gruppe = {
  id: string
  /** Einleitungen zur Vorschlagsliste, eine wird gezogen. */
  einleitung: string[]
  einleitungEn: string[]
  /** Ziel-IDs in Vorschlagsreihenfolge. */
  ziele: string[]
  /**
   * Das Ziel, das als beliebtestes hervorgehoben wird.
   *
   * SIMULIERT: Der Prototyp erhebt keine Beliebtheit. In der echten Anwendung
   * käme die Angabe aus den Aufrufzahlen des Systems. In Abschnitt 4.4 der
   * Arbeit als Grenze auszuweisen.
   */
  favorit: string
}

export const GRUPPEN: Record<string, Gruppe> = {
  hier: {
    id: "hier",
    einleitung: [
      "Du stehst {standort:kurz}. Drei Dinge, die von hier aus gut funktionieren:",
      "Von hier, {standort:kurz}, würde ich dir das hier vorschlagen:",
      "{standort:angebot}\nDrei Vorschläge, die von hier aus naheliegen:",
    ],
    einleitungEn: [
      "You are at {standort:kurz}. Three things that work well from here:",
      "From here, at {standort:kurz}, I would suggest these three:",
    ],
    ziele: [
      "rauschberg",
      "freizeitpark",
      "foerchensee",
      "vitalwelt",
      "gipfelalm",
      "arena",
    ],
    favorit: "rauschberg",
  },
  wandern: {
    id: "wandern",
    einleitung: [
      `Bei rund ${WANDERN.wegenetzKm} markierten Wegen lohnt sich eine Vorauswahl. Drei Touren, die sehr unterschiedlich sind:`,
      "Drei Touren, die für verschiedene Ansprüche stehen:",
      "Ich schlage dir drei Touren vor, von flach bis fordernd:",
    ],
    einleitungEn: [
      `With about ${WANDERN.wegenetzKm} of waymarked paths a shortlist helps. Three quite different tours:`,
      "Three tours covering rather different demands:",
    ],
    ziele: ["foerchensee", "rauschberg", "sonntagshorn", "unternberg", "traun"],
    favorit: "rauschberg",
  },
  familie: {
    id: "familie",
    einleitung: [
      "Drei Ziele, die mit Kindern erfahrungsgemäß gut laufen:",
      "Mit Kindern würde ich dir diese drei vorschlagen:",
    ],
    einleitungEn: [
      "Three places that tend to work well with children:",
      "With children I would suggest these three:",
    ],
    ziele: [
      "freizeitpark",
      "vitalwelt",
      "foerchensee",
      "unternbergalm",
      "heimatmuseum",
    ],
    favorit: "freizeitpark",
  },
  essen: {
    id: "essen",
    einleitung: [
      "Drei Lokale, die für verschiedene Gelegenheiten stehen:",
      "Je nachdem, worauf du Lust hast, kommen diese drei infrage:",
    ],
    einleitungEn: [
      "Three places for rather different occasions:",
      "Depending on what you feel like, these three come to mind:",
    ],
    ziele: ["gipfelalm", "post", "pizzeria", "unternbergalm"],
    favorit: "gipfelalm",
  },
  winter: {
    id: "winter",
    einleitung: [
      "Drei Ziele für den Winter, vom Langlauf bis zur Ausrüstung:",
      "Im Winter kommen vor allem diese drei infrage:",
    ],
    einleitungEn: [
      "Three winter options, from cross-country to equipment:",
      "In winter these three are the main options:",
    ],
    ziele: ["arena", "westernberg", "sportamort"],
    favorit: "arena",
  },
  events: {
    id: "events",
    einleitung: [
      "Drei Orte, an denen im Ort etwas stattfindet:",
      "Veranstaltungen finden vor allem an diesen drei Orten statt:",
    ],
    einleitungEn: [
      "Three places where things happen in the village:",
      "Events here mostly take place at these three:",
    ],
    ziele: ["arena", "kurpark", "rathausplatz"],
    favorit: "arena",
  },
  anreise: {
    id: "anreise",
    einleitung: [
      "Zwei Stellplätze, die je nach Vorhaben passen:",
      "Beim Parken kommt es darauf an, was du vorhast:",
    ],
    einleitungEn: [
      "Two car parks, depending on your plans:",
      "Where to park depends on what you have in mind:",
    ],
    ziele: ["rathausgarage", "laubau"],
    favorit: "rathausgarage",
  },
}

/** Wie viele Ziele ein Vorschlag umfasst. */
export const VORSCHLAEGE = 3
