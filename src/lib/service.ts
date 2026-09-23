import type { Chip, FlowNode } from "@/lib/chat-flow"
import { TOURIST_INFO } from "@/lib/daten"
import type { Sprache } from "@/lib/sprache"
import { mapsSuche, mapsSucheFrei } from "@/lib/ziele"

/**
 * Die Fragen, die am Schalter jeden Tag kommen, und die Grenzen der Auskunft.
 *
 * Grundlage ist das Interview mit der Auskunft vom 22.09.2026. Auf die Frage,
 * was sie jeden Tag hören, nennen die Mitarbeiterinnen die Toilette, den
 * Schienenersatzverkehr und ob man hier Zugtickets kaufen kann
 * (KA [00:07:59], AP [00:08:16]). Dazu kommt der Ortsplan, "eines der Dinge,
 * die wir am häufigsten ausgeben" (KA [00:29:28]).
 *
 * Die zweite Hälfte ist der Weiterverweis. Die Auskunft ist regional begrenzt
 * und sagt das auch: für Ziele weiter weg an die Tourist-Info dort, für die
 * Bahn an den Bahnschalter (KA [00:08:28], [00:10:53]). Ein Terminal, das hier
 * rät, statt weiterzuverweisen, verstößt gegen die Regel, die der Auskunft am
 * wichtigsten ist: keine falsche Antwort.
 *
 * Alle Knoten entstehen in beiden Sprachen und sind "fertig".
 */

const ANDERE_FRAGE = (en: boolean): Chip => ({
  label: en ? "Something else" : "Andere Frage",
  to: "menu",
})

const INFO_CHIP = (en: boolean): Chip => ({
  label: en ? "Tourist information" : "Tourist-Information",
  to: "info",
})

/** Der Satz, mit dem jeder Verweis an den Schalter endet. */
export function schalterSatz(sprache: Sprache): string {
  return sprache === "en"
    ? `At the tourist information desk someone will help you in person (${TOURIST_INFO.oeffnungszeitenEn}).`
    : `Am Schalter der Tourist-Information hilft Ihnen jemand persönlich weiter (${TOURIST_INFO.oeffnungszeiten}).`
}

/* ------------------------------------------------------------------ *
 * Erkennung
 * ------------------------------------------------------------------ */

type Dienst = { id: string; test: RegExp }

/**
 * Reihenfolge entscheidet. Der Ersatzverkehr steht vor dem Zugproblem, weil
 * "wann fährt der Ersatzbus" beides trifft und die spezifischere Auskunft
 * gewinnen soll.
 *
 * Geprüft wird auf dem normalisierten Text, Umlaute ausgeschrieben.
 */
const DIENSTE: Dienst[] = [
  {
    id: "dienst:sev",
    test: /\bschienenersatz\w*\b|\bersatzverkehr\b|\bersatzbus\w*\b|\bsev\b|\breplacement bus\w*\b|\brail replacement\b/,
  },
  {
    id: "dienst:zugticket",
    test: /\b(zug|bahn)(ticket|karte|fahrkarte)\w*\b|\bfahrkarte\w*\b|\bfahrschein\w*\b|\btrain tickets?\b|\bticket\w* (fuer|fur|for) (den |die |the )?(zug|bahn|train)\b/,
  },
  {
    id: "dienst:bahn",
    test: /\bzug\b[^]*\b(faellt|fiel|ausgefallen|ausfall|kommt nicht|verspaet\w*)\b|\bzugausfall\w*\b|\bverspaetung\w*\b|\bbeschwer\w*\b[^]*\b(bahn|zug|bus\w*|fahrer\w*|ersatz\w*)\b|\b(bahn|zug|bus\w*|fahrer\w*)\b[^]*\bbeschwer\w*\b|\btrain\b[^]*\b(cancel\w*|late|delayed)\b|\bcomplain\w*\b/,
  },
  {
    id: "dienst:tickets",
    test: /\bvorverkauf\w*\b|\beintrittskarte\w*\b|\b(ticket\w*|karten)\b[^]*\b(biathlon|konzert\w*|veranstaltung\w*|event\w*|weltcup|fuehrung\w*|gaestefuehrung\w*)\b|\b(biathlon|konzert\w*|veranstaltung\w*|weltcup|gaestefuehrung\w*)\b[^]*\b(ticket\w*|karten)\b/,
  },
  {
    id: "dienst:radverleih",
    test: /\b(radverleih|fahrradverleih|bikeverleih|radvermietung|bike rental\w*|bike hire)\b|\b(rad|fahrrad|fahrraeder|raeder|e ?bike\w*|bike\w*|mountainbike\w*|mtb)\b[^]*\b(leih\w*|miet\w*|ausleih\w*|verleih\w*|rent\w*|hire)\b|\b(leih\w*|miet\w*|rent\w*|hire)\b[^]*\b(rad|fahrrad|raeder|e ?bike\w*|bike\w*)\b/,
  },
  {
    id: "dienst:ortsplan",
    test: /\bortsplan\w*\b|\bortplan\w*\b|\bortskarte\b|\bstadtplan\b|\bplan vom ort\b|\bkarte vom ort\b|\borientier\w*\b|\bwo ist was\b|\bvillage map\b|\btown map\b|\bmap of (the )?(village|town)\b/,
  },
  {
    id: "dienst:toilette",
    test: /\btoilett\w*\b|\bklo\b|\bwc\b|\brestroom\w*\b|\btoilets?\b|\bbathroom\w*\b/,
  },
]

export function erkenneDienst(roh: string): string | null {
  return DIENSTE.find((dienst) => dienst.test.test(roh))?.id ?? null
}

/**
 * Ziele außerhalb von Ruhpolding.
 *
 * `immer`: der Ort wird immer weiterverwiesen, auch bei einer Wegfrage, weil
 * der Prototyp keinen Fahrplan dorthin kennt. Salzburg und München haben
 * einen, dort wird nur verwiesen, wenn es nicht ums Hinkommen geht, etwa bei
 * der Salzburger Stadttour (KA [00:02:40]).
 */
type Fernziel = {
  id: string
  woerter: RegExp
  name: string
  nameEn: string
  /** Wer dort zuständig ist, im Satz: "Genauer weiß es …". */
  stelle: string
  stelleEn: string
  /** Kartensuche nach der zuständigen Stelle. */
  suche: string
  immer: boolean
  /** Fahrplan-ID, falls der Prototyp dorthin eine Verbindung kennt. */
  fahrplan?: string
}

const FERNZIELE: Fernziel[] = [
  {
    id: "berchtesgaden",
    woerter:
      /\bkehlstein\w*\b|\bobersalzberg\b|\bberchtesgaden\w*\b|\bkoenigssee\b|\bwatzmann\b/,
    name: "Berchtesgaden",
    nameEn: "Berchtesgaden",
    stelle: "die Tourist-Information in Berchtesgaden",
    stelleEn: "the tourist information in Berchtesgaden",
    suche: "Tourist-Information Berchtesgaden",
    immer: true,
  },
  {
    id: "chiemsee",
    woerter: /\bchiemsee\b|\bherrenchiemsee\b|\bfraueninsel\b|\bprien\b/,
    name: "der Chiemsee",
    nameEn: "the Chiemsee",
    stelle: "die Tourist-Information am Chiemsee",
    stelleEn: "the tourist information at the Chiemsee",
    suche: "Chiemsee-Alpenland Tourismus",
    immer: true,
  },
  {
    id: "kitzbuehel",
    woerter: /\bkitzbuehel\b|\btirol\b/,
    name: "Kitzbühel",
    nameEn: "Kitzbühel",
    stelle: "Kitzbühel Tourismus",
    stelleEn: "Kitzbühel Tourismus",
    suche: "Kitzbühel Tourismus",
    immer: true,
  },
  {
    id: "salzburg",
    woerter: /\bsalzburg\w*\b/,
    name: "Salzburg",
    nameEn: "Salzburg",
    stelle: "Salzburg Tourismus",
    stelleEn: "Salzburg Tourismus",
    suche: "Tourist Information Salzburg Hauptbahnhof",
    immer: false,
    fahrplan: "fahrplan:salzburg",
  },
  {
    id: "muenchen",
    woerter: /\bmuenchen\b|\bmunich\b/,
    name: "München",
    nameEn: "Munich",
    stelle: "München Tourismus",
    stelleEn: "Munich tourist information",
    suche: "Tourist Information am Marienplatz München",
    immer: false,
    fahrplan: "fahrplan:muenchen",
  },
]

/** Worum es geht, wenn es nicht ums Hinkommen geht. */
const VOR_ORT =
  /\bstadt ?tour\w*\b|\bstadtfuehrung\w*\b|\bfuehrung\w*\b|\bbuch\w*\b|\blokal\w*\b|\brestaurant\w*\b|\bessen\b|\boeffnungszeit\w*\b|\bbesichtig\w*\b|\beintritt\w*\b|\bsehenswuerdig\w*\b|\bsehenswert\w*\b|\bwas (kann|soll) (man|ich)\b|\bcity tour\b|\bsightseeing\b|\bbook\w*\b/

export function erkenneFernziel(roh: string): string | null {
  for (const ort of FERNZIELE) {
    if (!ort.woerter.test(roh)) continue
    if (ort.immer || VOR_ORT.test(roh)) return `verweis:${ort.id}`
  }
  return null
}

/* ------------------------------------------------------------------ *
 * Knoten
 * ------------------------------------------------------------------ */

export function verweisKnoten(id: string, sprache: Sprache): FlowNode | null {
  const ort = FERNZIELE.find((eintrag) => eintrag.id === id)
  if (!ort) return null
  const en = sprache === "en"

  const chips: Chip[] = []
  if (ort.fahrplan) {
    chips.push({
      label: en ? `Train to ${ort.nameEn}` : `Zug nach ${ort.name}`,
      to: ort.fahrplan,
    })
  }
  chips.push(ANDERE_FRAGE(en))

  const grossName = (name: string) =>
    name.charAt(0).toUpperCase() + name.slice(1)

  return {
    id: `verweis:${id}`,
    fertig: true,
    messages: [
      en
        ? `${grossName(ort.nameEn)} is outside Ruhpolding, and I have nothing reliable on it. I would rather tell you that than guess.`
        : `${grossName(ort.name)} liegt außerhalb von Ruhpolding, und dazu habe ich nichts Verlässliches hinterlegt. Das sage ich Ihnen lieber, als zu raten.`,
      en
        ? `${grossName(ort.stelleEn)} will know more. You can take their location with you as a map search.`
        : `Genauer weiß es ${ort.stelle}. Den Weg dorthin können Sie als Kartensuche mitnehmen.`,
    ],
    qr: {
      title: ort.suche,
      hint: en
        ? "Scan the code to open the map search on your phone."
        : "Scannen Sie den Code, dann öffnet sich die Kartensuche auf Ihrem Handy.",
      url: mapsSucheFrei(ort.suche),
    },
    chips,
  }
}

/** Die Knoten der täglichen Fragen. */
export function dienstKnoten(id: string, sprache: Sprache): FlowNode | null {
  const en = sprache === "en"

  switch (id) {
    case "sev":
      return {
        id: "dienst:sev",
        fertig: true,
        topic: "anreise",
        messages: [
          en
            ? "Yes, there are replacement buses on the railway at the moment. Here is what I know about it."
            : "Ja, auf der Bahnstrecke fährt gerade Ersatzverkehr. Hier steht, was ich dazu weiß.",
        ],
        // Die Meldung erscheint hier auch dann, wenn sie schon gezeigt wurde:
        // sie ist die Antwort, nicht ein Zusatz.
        hinweise: ["sev"],
        nachher: [
          en
            ? "If a train has been cancelled, the ticket office in Traunstein can help."
            : "Fällt ein Zug aus, hilft der Bahnschalter in Traunstein weiter.",
        ],
        chips: [
          {
            label: en ? "Train timetable" : "Fahrplan",
            to: "fahrplan:traunstein",
          },
          ANDERE_FRAGE(en),
        ],
      }

    case "zugticket":
      // KA [00:08:24]: "Beim Schaffner, wir haben ja keine."
      return {
        id: "dienst:zugticket",
        fertig: true,
        topic: "anreise",
        messages: [
          en
            ? "The tourist information does not sell train tickets. You buy them on the train."
            : "Zugtickets gibt es in der Tourist-Information nicht. Die Fahrkarte bekommen Sie im Zug.",
          en
            ? "Between Ruhpolding and Traunstein the trip is free with the Chiemgau Karte."
            : "Mit der Chiemgau Karte ist die Strecke zwischen Ruhpolding und Traunstein frei.",
        ],
        chips: [
          {
            label: en ? "Next trains" : "Nächste Züge",
            to: "fahrplan:traunstein",
          },
          ANDERE_FRAGE(en),
        ],
      }

    case "bahn":
      // KA [00:08:28] Bahnschalter Traunstein, [00:24:33] Beschwerde an die
      // Bayerische Regiobahn.
      return {
        id: "dienst:bahn",
        fertig: true,
        topic: "anreise",
        messages: [
          en
            ? "I am sorry. For the railway I am the wrong place: the tourist information is not part of the railway."
            : "Das tut mir leid. Für die Bahn bin ich leider die falsche Stelle, die Tourist-Information gehört nicht zur Bahn.",
          en
            ? "If a train is cancelled, the ticket office in Traunstein can help. Complaints about trains or replacement buses go to the Bayerische Regiobahn."
            : "Fällt ein Zug aus, hilft der Bahnschalter in Traunstein weiter. Beschwerden über Züge oder Ersatzbusse nimmt die Bayerische Regiobahn entgegen.",
        ],
        chips: [
          {
            label: en ? "Replacement buses" : "Ersatzverkehr",
            to: "dienst:sev",
          },
          ANDERE_FRAGE(en),
        ],
      }

    case "tickets":
      // KA [00:04:40], [00:05:04], [00:26:13]
      return {
        id: "dienst:tickets",
        fertig: true,
        topic: "events",
        messages: [
          en
            ? "Tickets for events in Ruhpolding, the biathlon and guided walks are sold at the tourist information desk. For the biathlon you can also buy them online via Reservix."
            : "Karten für Veranstaltungen in Ruhpolding, für den Biathlon und für Gästeführungen verkauft die Tourist-Information am Schalter. Für den Biathlon gibt es sie auch online über Reservix.",
          en
            ? "Reserving by phone is not possible, as the tourist information is a presale outlet."
            : "Telefonisch reservieren geht nicht, die Tourist-Information ist Vorverkaufsstelle.",
        ],
        chips: [
          {
            label: en ? "Biathlon world cup" : "Biathlon-Weltcup",
            to: "events-biathlon",
          },
          INFO_CHIP(en),
          ANDERE_FRAGE(en),
        ],
      }

    case "ortsplan":
      // KA [00:30:17]: "Der Ortsplan ist erst einmal für die Orientierung."
      // Die Planquadrate stammen aus dem Verzeichnis des Ortsplans.
      return {
        id: "dienst:ortsplan",
        fertig: true,
        messages: [
          en
            ? "You are at {standort:kurz}. The village map is the best way to get your bearings. It shows walking and cycling paths in brown, and the paths up to the mountain pastures as dashed lines."
            : "Sie stehen {standort:kurz}. Zur Orientierung ist der Ortsplan am besten. Rad- und Wanderwege sind darauf braun eingezeichnet, die Wege zu den Almen gestrichelt.",
          en
            ? "On the map you will find, among others:\n— tourist information, station and toilets: square N9\n— St. George's church: L10\n— Vita Alpina: L7\n— Heimatmuseum: O10\n— leisure park: B11\n— Chiemgau Arena: A5"
            : "Auf dem Ortsplan finden Sie unter anderem:\n— Tourist-Information, Bahnhof und Toiletten: Feld N9\n— Kirche St. Georg: L10\n— Vita Alpina: L7\n— Heimatmuseum: O10\n— Freizeitpark: B11\n— Chiemgau Arena: A5",
          en
            ? "At the tourist information desk the staff will also mark where you are staying."
            : "Am Schalter der Tourist-Information zeichnet Ihnen das Team auch Ihre Unterkunft ein.",
        ],
        nachher: [
          en
            ? "Would you like the village map free of charge?"
            : "Möchten Sie den Ortsplan kostenlos dazu haben?",
        ],
        jaNein: true,
        nein: "flyer-nein",
        chips: [
          { label: en ? "Yes, please" : "Ja, gern", to: "flyer:ortsplan" },
          { label: en ? "No, thank you" : "Nein, danke", to: "flyer-nein" },
          {
            label: en ? "What can I do here?" : "Was kann ich hier machen?",
            to: "bedarf:",
          },
        ],
      }

    case "radverleih":
      // Flyer "Die 10 schönsten Fahrrad- & Mountainbiketouren", Drucklegung
      // 03/25. Andere Verleihe nennt keine Quelle, deshalb nur diese beiden.
      return {
        id: "dienst:radverleih",
        fertig: true,
        messages: [
          en
            ? "The cycling flyer names two bike hire shops in Ruhpolding:"
            : "Der Radflyer der Tourist-Information nennt zwei Radverleihe im Ort:",
          en
            ? "— Radl Sepp, shop & e-bikes, Bahnhofstraße 3, phone +49 8663 5607\n— Die RADgeber, shop & e-bikes, Hauptstraße 67, rentals phone +49 8663 3492454"
            : "— Radl Sepp, Shop & E-Bikes, Bahnhofstraße 3, Tel. +49 8663 5607\n— Die RADgeber, Shop & E-Bikes, Hauptstraße 67, Verleih Tel. +49 8663 3492454",
          en
            ? "I do not hold their opening times or prices. Please ask them directly by phone."
            : "Öffnungszeiten und Preise habe ich nicht hinterlegt. Die erfragen Sie bitte direkt telefonisch beim Verleih.",
          en
            ? "Source: flyer „10 most beautiful cycling & mountain bike tours“, printed 03/25"
            : "Quelle: Flyer „Die 10 schönsten Fahrrad- & Mountainbiketouren“, Drucklegung 03/25",
        ],
        nachher: [
          en
            ? "Would you like the cycling flyer free of charge, with ten tours?"
            : "Möchten Sie den Radflyer mit zehn Touren kostenlos dazu haben?",
        ],
        jaNein: true,
        nein: "flyer-nein",
        chips: [
          { label: en ? "Yes, please" : "Ja, gern", to: "flyer:rad" },
          { label: en ? "No, thank you" : "Nein, danke", to: "flyer-nein" },
          {
            label: en ? "Suggest a bike tour" : "Radtour vorschlagen",
            to: "bedarf:i=rad",
          },
        ],
      }

    case "toilette":
      // Angabe des Autors vom 23.09.2026, bestätigt durch den Ortsplan:
      // Toiletten, Tourist-Info und Bahnhof liegen im selben Planquadrat N9.
      return {
        id: "dienst:toilette",
        fertig: true,
        messages: [
          en
            ? "The toilets are in the station building, right next to the tourist information. From here it is {naehe:touristinfo}."
            : "Die Toiletten sind im Bahnhofsgebäude, direkt neben der Tourist-Information. Von hier sind es {naehe:touristinfo}.",
        ],
        ziel: "touristinfo",
        qr: {
          title: en ? "Route to the station" : "Weg zum Bahnhof",
          hint: en
            ? "Scan the code to take the route with you."
            : "Scannen Sie den Code, um den Weg mitzunehmen.",
          url: mapsSuche("Bahnhof Ruhpolding"),
        },
        chips: [ANDERE_FRAGE(en)],
      }
  }

  return null
}
