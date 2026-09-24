import { FOLGEN, TOPICS, type Chip } from "@/lib/chat-flow"
import { leitbegriff } from "@/lib/sprache"
import { GRUPPEN, VORSCHLAEGE, ZIELE } from "@/lib/ziele"
import { VERBINDUNGEN } from "@/lib/fahrplan"
import {
  GLEICH_ZEIGEN,
  UEBERSPRINGEN,
  bedarfAusText,
  dekodiere,
  ergaenze,
  kodiere,
  naechsteFrage,
  type Profil,
} from "@/lib/bedarf"
import { erkenneDienst, erkenneFernziel } from "@/lib/service"
import { merkbarerKnoten } from "@/lib/zettel"
import { THEMA_WEB } from "@/lib/web"

/**
 * Der Verstehens-Kern: er ordnet freien Text einem Knoten des Antwortpfads zu.
 *
 * Der frühere Ansatz war eine Liste regulärer Ausdrücke, die der Reihe nach
 * geprüft wurden. Der Testlauf vom 03.09. hat drei Schwächen gezeigt, die
 * daraus folgen:
 *
 * 1. Es gab keinen Gesprächszustand. "Ja welche genau" nach einer Antwort
 *    über die Bergbahnen enthält kein einziges Themenwort und fiel deshalb
 *    durch, obwohl der Bezug für einen Menschen offensichtlich ist.
 * 2. Fragen an das Gerät statt an den Ort ("wo bin ich", "was kannst du",
 *    "gib mir einen QR-Code") kamen in keinem Muster vor.
 * 3. Ein Muster traf oder traf nicht. Zwei schwache Hinweise konnten sich
 *    nicht zu einem Treffer summieren, ein starker Hinweis nicht gegen einen
 *    zufälligen Nebentreffer gewinnen.
 *
 * Die Antwort darauf ist ein Durchlauf in vier Stufen. Er bleibt vollständig
 * deterministisch: dieselbe Eingabe im selben Zustand ergibt immer dasselbe
 * Ziel. Das ist die Bedingung dafür, dass Testläufe untereinander vergleichbar
 * bleiben; ein echtes Sprachmodell an dieser Stelle würde das aufgeben.
 *
 *   Stufe 1  Meta-Absichten. Fragen über das Gerät, den Aufstellort oder das
 *            Gespräch selbst. Eng gefasst, deshalb dürfen sie zuerst greifen.
 *   Stufe 2  Auswahl aus dem zuletzt Angebotenen. "Ja", "das erste", oder das
 *            Wort eines Chips.
 *   Stufe 3  Themenlexikon mit Gewichten. Statt erstes Muster gewinnt: bester
 *            Punktestand gewinnt, bei Gleichstand über Themengrenzen hinweg
 *            entsteht eine Rückfrage.
 *   Stufe 4  Rückbezug auf das laufende Thema. "Wie teuer", "welche genau",
 *            "wie komme ich hin" tragen kein eigenes Thema und werden auf das
 *            zuletzt behandelte bezogen.
 *
 * Erst wenn alle vier nichts finden, geht es in den weichen Fallback.
 */

/* ------------------------------------------------------------------ *
 * Normalisierung
 * ------------------------------------------------------------------ */

/**
 * Vereinheitlicht eine Eingabe: Kleinschreibung, Umlaute ausgeschrieben,
 * alles Nichtalphabetische zu Leerzeichen.
 *
 * Umlaute werden aufgelöst, weil an einem Terminal mit Bildschirmtastatur
 * "grusse", "grüße" und "gruesse" gleich wahrscheinlich sind. Sämtliche
 * Stichwörter unten stehen deshalb ebenfalls in dieser Schreibweise.
 */
export function normalisiere(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

/**
 * Schneidet gängige deutsche Flexionsendungen ab.
 *
 * Kein vollwertiger Stemmer, sondern die kürzeste Regel, die "bergbahnen" auf
 * "bergbahn" und "wandern" auf "wander" bringt. Der Rest muss mindestens vier
 * Zeichen behalten, sonst würde aus "bus" ein "bu".
 */
export function stamm(wort: string): string {
  for (const endung of [
    "ungen",
    "est",
    "en",
    "er",
    "es",
    "em",
    "e",
    "n",
    "s",
  ]) {
    if (wort.length - endung.length >= 4 && wort.endsWith(endung)) {
      return wort.slice(0, wort.length - endung.length)
    }
  }
  return wort
}

/**
 * Editierabstand nach Damerau-Levenshtein, abgebrochen sobald er das Limit
 * überschreitet.
 *
 * Die Vertauschung zweier Nachbarzeichen zählt als ein Schritt, nicht als
 * zwei. Das ist keine Feinheit: "wandren" statt "wandern" ist an einer
 * Bildschirmtastatur der häufigste Tippfehler überhaupt, und mit reinem
 * Levenshtein liegt er bereits außerhalb jeder vertretbaren Toleranz.
 */
function abstand(a: string, b: string, limit: number): number {
  if (Math.abs(a.length - b.length) > limit) return limit + 1

  const zeilen: number[][] = [Array.from({ length: b.length + 1 }, (_, i) => i)]
  for (let i = 1; i <= a.length; i++) {
    const aktuelle = [i]
    let zeilenMinimum = i
    for (let j = 1; j <= b.length; j++) {
      const kosten = a[i - 1] === b[j - 1] ? 0 : 1
      let wert = Math.min(
        zeilen[i - 1][j] + 1,
        aktuelle[j - 1] + 1,
        zeilen[i - 1][j - 1] + kosten
      )
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        wert = Math.min(wert, zeilen[i - 2][j - 2] + 1)
      }
      aktuelle.push(wert)
      if (wert < zeilenMinimum) zeilenMinimum = wert
    }
    // Steht die ganze Zeile schon über dem Limit, kann es nur schlechter
    // werden. Das spart bei langen Wörtern den Rest der Matrix.
    if (zeilenMinimum > limit) return limit + 1
    zeilen.push(aktuelle)
  }
  return zeilen[a.length][b.length]
}

/**
 * Wie viele Vertipper ein Wort dieser Länge verträgt.
 *
 * Kurze Wörter bekommen keine Toleranz: bei drei Zeichen liegt fast jedes
 * andere Wort in Distanz eins, und aus "bus" würde "bad".
 */
function toleranz(laenge: number): number {
  if (laenge >= 9) return 2
  if (laenge >= 6) return 1
  return 0
}

/* ------------------------------------------------------------------ *
 * Stufe 1: Meta-Absichten
 * ------------------------------------------------------------------ */

/**
 * Absichten, die kein Thema betreffen, sondern das Gerät, den Aufstellort
 * oder das Gespräch. Sie werden auf dem normalisierten Text geprüft und sind
 * bewusst eng gefasst: sie dürfen vor dem Lexikon greifen, also darf keine
 * von ihnen versehentlich auf eine Sachfrage passen.
 *
 * Die Reihenfolge entscheidet. "Was kannst du" und "was kann ich hier machen"
 * liegen sprachlich dicht beieinander, deshalb steht die Frage nach dem Gerät
 * vor der Frage nach dem Ort.
 */
const META: {
  name: string
  test: RegExp
  to: string
  /**
   * Weicht, sobald ein Thema deutlich genug angesprochen ist.
   *
   * Gilt für die weit gefassten Formen: "was kannst du" und "was gibt es
   * hier" sind Meta-Fragen, solange nichts danebensteht. "Was kannst du
   * empfehlen zum Essen" und "was gibt es für Familien zu tun" sind es nicht,
   * und dort wäre die Auskunft über das Gerät die falsche Antwort.
   */
  weichtThema?: boolean
}[] = [
  {
    name: "standort",
    test: /\bwo (bin|steh|stehe|befinde) ich\b|\bwo sind wir\b|\bwo stehen wir\b|\bwo ist das hier\b|\bwo genau bin ich\b|\bwelcher (ort|standort)\b|\bwie heisst (der ort|dieser ort)\b|\bwhere am i\b|\bwhere are we\b/,
    to: "standort",
  },
  {
    name: "faehigkeit",
    weichtThema: true,
    test: /\bwas kannst du\b|\bwas koennen sie\b|\bwer sind sie\b|\bwas sind sie\b|\bsind sie (ein |eine )?(mensch|computer|bot|roboter|ki|programm|maschine)\b|\bwas kannst du alles\b|\bwer bist du\b|\bwas bist du\b|\bbist du (ein |eine )?(mensch|computer|bot|roboter|ki|programm|maschine)\b|\bwie funktionierst du\b|\bwomit kannst du helfen\b|\bwobei kannst du helfen\b|\bwhat can you do\b|\bwho are you\b|\bare you (a |an )?(human|bot|robot|ai)\b/,
    to: "ueber-mich",
  },
  {
    name: "umgebung",
    weichtThema: true,
    test: /\bwas (kann\w*|koenn\w*|gib\w*|gaeb\w*|soll\w*|laesst|liess\w*|mach\w*|wuerde\w*)\b[^]*\b(hier|umgebung|naehe|ruhpolding|machen|unternehmen|tun|erleben|anschauen|ansehen|sehen|los)\b|\bwas ist hier\b|\blohnt sich hier\b|\bwhat (can|could|should|would)( i| we| one)?\b[^]*\b(do|here|see)\b|\bwhat is there\b[^]*\b(do|here|see)\b|\bthings to do\b/,
    to: "empfehlung:hier:0",
  },
  {
    name: "wiederholung",
    test: /\bnoch ?mal\b|\bnochmals\b|\bwiederhol\w*\b|\bwas hast du gesagt\b|\bhab (das )?nicht verstanden\b|\bnicht verstanden\b|\bsay that again\b|\brepeat\b/,
    to: "@wiederholung",
  },
  {
    name: "menue",
    test: /\bmenue\b|\bmenu\b|\bthemen\b|\buebersicht\b|\bandere frage\b|\bvon vorne\b|\bzurueck zum (menue|anfang|start)\b|\bwas gibt es fuer themen\b|\btopics\b|\bstart over\b/,
    to: "menu",
  },
  {
    name: "danke",
    weichtThema: true,
    test: /\bdanke\b|\bdank\w*\b|\bvielen dank\b|\bpasst\b|\bsuper\b|\bklasse\b|\bperfekt\b|\bthanks\b|\bthank you\b|\bperfect\b|\bcheers\b/,
    to: "danke",
  },
  {
    name: "abschied",
    weichtThema: true,
    test: /\btschuess\w*\b|\bauf wiedersehen\b|\bauf wiederschauen\b|\bpfiat\w*\b|\bbis bald\b|\bciao\b|\bbye\b|\bgoodbye\b|\bsee you\b/,
    to: "abschied",
  },
  {
    name: "gruss",
    weichtThema: true,
    test: /\bhallo\b|\bhallihallo\b|\bgruess\w*\b|\bservus\b|\bmoin\b|\bguten (tag|morgen|abend)\b|\bhi\b|\bhey\b|\bhello\b|\bgood (morning|afternoon|evening)\b/,
    to: "menu",
  },
]

/* ------------------------------------------------------------------ *
 * Stufe 2: Auswahl aus dem zuletzt Angebotenen
 * ------------------------------------------------------------------ */

const JA =
  /^(ja|jo|jep|joa|genau|richtig|stimmt|passt|gerne|gern|klar|okay|ok|sicher|bitte|yes|yeah|yep|sure|exactly)\b/
const NEIN = /^(nein|ne|nee|noe|nope|no|nicht ganz|eher nicht|falsch)\b/

/**
 * Ordnungswörter für die Auswahl per Position: "das zweite", "die vierte".
 *
 * Sie zählen ab dem, was gerade auf dem Schirm steht: "das erste" ist der
 * oberste Vorschlag, auch wenn er in der Liste als "4 ·" geführt wird.
 */
const ORDINAL: [RegExp, number][] = [
  [/\b(erste[rsn]?|erstes|first)\b/, 1],
  [/\b(zweite[rsn]?|zweites|zwei|second)\b/, 2],
  [/\b(dritte[rsn]?|drittes|drei|third)\b/, 3],
  [/\b(vierte[rsn]?|viertes|vier|fourth)\b/, 4],
  [/\b(fuenfte[rsn]?|fuenftes|fuenf|fifth)\b/, 5],
  [/\b(sechste[rsn]?|sechstes|sechs|sixth)\b/, 6],
]

/**
 * Eine blanke Zahl, mit oder ohne "nummer" davor.
 *
 * Sie meint die gedruckte Nummer im Vorschlag, nicht die Stelle auf dem
 * Schirm. Das ist der Unterschied zu den Ordnungswörtern oben und der Grund,
 * warum beide getrennt gelesen werden: auf der zweiten Seite einer
 * Vorschlagsliste steht "4 · Vita Alpina" ganz oben, und wer "4" tippt,
 * meint dieses Ziel. Im Testlauf vom 17.09. blieb genau das ohne Treffer.
 *
 * Bewusst auf die ganze Eingabe verankert: "wir sind 4 Personen" nennt eine
 * Zahl, wählt aber nichts aus. Gelesen wird sie ausserdem nur, wo etwas zur
 * Auswahl steht: in einer Vorschlagsliste oder nach einer Rückfrage. Die
 * Kacheln eines Themenmenues sind Wegweiser und tragen keine Nummern, dort
 * wäre jede Zahl geraten.
 */
const ZIFFER =
  /^(?:(?:ich )?(?:nehme|nimm|moechte|will|waehle|haette gern)\s+)?(?:die\s|das\s|der\s|den\s|nr\.?\s*|nummer\s*)?([1-9])$/

/* ------------------------------------------------------------------ *
 * Ziele: Wegführung und Auswahl
 * ------------------------------------------------------------------ */

/**
 * Die Frage nach dem Weg, in allen Formen, in denen sie am Terminal gestellt
 * wird.
 *
 * Sie steht vor dem Themenlexikon, weil sie sonst untergeht: "wie komme ich
 * zum Rauschberg" enthält das Wort Rauschberg, und das Lexikon ordnet es dem
 * Thema Wandern zu. Im Testlauf vom 03.09. um 11:57 kam deshalb dreimal
 * dieselbe Beschreibung der Bergbahnen, obwohl dreimal nach dem Weg gefragt
 * wurde. Wer nach dem Weg fragt, will den Weg.
 */
const NAVIGATION =
  /\bnavigier\w*\b|\bnavigation\b|\bgoogle ?maps\b|\bmaps\b|\bkarte\b|\bwegbeschreibung\b|\broute\b|\brouting\b|\bzeig mir den weg\b|\bwie komme ich\b|\bwie finde ich\b|\bwie gehe ich\b|\bwo geht es zu\b|\bbring mich\b|\bfuehr(e)? mich\b|\bhin ?fuehren\b|\bda ?hin\b|\bdort ?hin\b|\bqr\b|\bqrcode\b|\bcode\b|\bscannen?\b|\bscan\b|\baufs handy\b|\bauf mein handy\b|\baufs telefon\b|\bmitnehmen\b|\bdirections?\b|\bhow do i get\b|\btake me\b|\bguide me\b/

/**
 * Fragen, deren Antwort nur ein QR-Code sein kann, auch ohne genanntes Ziel.
 * Enger gefasst als NAVIGATION, weil daraus eine Antwort ohne Ziel folgt.
 */
const NUR_QR =
  /\bqr\b|\bqrcode\b|\bqr code\b|\bgoogle ?maps\b|\bscannen?\b|\bscan\b/

/**
 * Die Bitte um andere Vorschläge, wenn keiner der drei gepasst hat.
 *
 * "Gibt es mehr?" fehlte bis 24.09.2026 und lief nach einer Vorschlagsliste
 * zweimal ins Leere (Testlauf vor dem Interview).
 */
const ANDERE =
  /\b(andere|weitere|mehr)\b[^]*\b(vorschlaeg\w*|optionen|moeglichkeit\w*|ziele|touren|ideen|tipps)\b|\b(gibt es|gibts|hast du|haben sie|kennst du) (noch |auch )?(was |etwas )?(andere|anderes|weitere|mehr)\b|\bmehr davon\b|\b(any|some) more\b|\bmore (suggestions|options|places|restaurants)\b|\bnichts dabei\b|\bgefaellt mir nicht\b|\bnichts fuer mich\b|\bwas anderes\b|\bnoch mehr\b|\bandere vorschlaege\b|\bwas sonst\b|\bsonst was\b|\bsonst noch\b|\bund sonst\b|\bwas noch\b|\bwas gibt es noch\b|\bzeig mir mehr\b|\bgib mir mehr\b|\bother (suggestions|options)\b|\banything else\b|\bwhat else\b|\bnone of (them|these)\b/

/**
 * Eine Frage, die nach Auswahl verlangt statt nach Auskunft.
 *
 * "Welche Wandertouren kann ich machen" und "was kannst du empfehlen" sind
 * keine Wissensfragen, sondern die Bitte um eine Vorauswahl. Der Unterschied
 * ist bedienbar: auf eine Wissensfrage folgt ein Text, auf diese hier folgen
 * drei Vorschläge, aus denen sich einer wählen lässt.
 */
const EMPFEHLUNGSFRAGE =
  /\bempfehl\w*\b|\bvorschlag\w*\b|\bvorschlaeg\w*\b|\btipp\w*\b|\bidee\w*\b|\bwas (kann|koennen|koennte|koennten|soll|sollen|sollte) (ich|man|wir)\b|\bwo (kann|koennen|koennte|koennten|soll|sollen|sollte) (ich|man|wir)\b|\bwas gibt es\b|\bwas gibts\b|\bwas lohnt sich\b|\bwohin\b|\bwas ist zu empfehlen\b|\bwelche\w*\b[^]*\b(gibt es|gibts|kann ich|kann man|sind|lohnen|empfiehlst)\b|\brecommend\w*\b|\bsuggestion\w*\b|\bwh(at|ere) (can|should) (i|we)\b|\bwhat is there\b/

/** Die Frage bezieht sich auf den Ort selbst, nicht auf den Berg. */
const IM_ORT =
  /\b(im|in dem) (ort|dorf|zentrum|ortskern|ortszentrum)\b|\bin ruhpolding\b|\bhier\b|\bin the village\b|\bin town\b/

/**
 * Die Bekundung eines Vorhabens, im Unterschied zu einer Wissensfrage.
 *
 * "Ich würde gern auf den Rauschberg" ist keine Frage nach den Bergbahnen,
 * sondern eine Entscheidung. Steht ein Ziel dabei, folgt daraus die
 * Wegführung und nicht noch eine Beschreibung. Steht keines dabei, greift die
 * Regel nicht, und "ich möchte wandern gehen" bleibt eine Themenfrage.
 */
const WUNSCH =
  /\bich (moechte|will|wuerde|haette|nehme|waehle)\b|\bwir (moechten|wollen|wuerden|nehmen)\b|\blass uns\b|\bam liebsten\b|\bklingt gut\b|\bhoert sich gut an\b|\bdas nehme ich\b|\bentscheide mich fuer\b|\bi (would like|want|will take|choose)\b|\bwe (would like|want)\b|\bsounds good\b/

/**
 * Die Frage nach einer Fahrverbindung.
 *
 * Sie unterscheidet sich von der Frage nach dem Weg dadurch, dass die Antwort
 * eine Uhrzeit ist und kein Ort. "Wie komme ich nach Traunstein" will keinen
 * QR-Code zu einem Parkplatz, sondern wissen, wann der nächste Zug fährt.
 */
const FAHRPLANFRAGE =
  /\bfahrplan\w*\b|\babfahrt\w*\b|\bankunft\w*\b|\bwann (faehrt|geht|kommt|ist)\b|\bnaechste\w* (zug|bahn|bus|verbindung)\b|\bwie (komme|fahre|gelange) ich\b|\bverbindung\w*\b|\bzug\b|\bbahn\b|\bumstieg\b|\bumsteigen\b|\btimetable\b|\bdeparture\w*\b|\bnext train\b|\bconnection\w*\b|\bwhen does\b/

/**
 * Sucht die Fahrverbindung, die in der Eingabe genannt wird.
 *
 * Anders als bei den Zielen im Ort zählt hier nur ein klarer Treffer: ein
 * Fernziel wird beim Namen genannt, und wer keines nennt, meint auch keines.
 */
function findeVerbindungImText(text: string): string | null {
  const woerter = text.split(" ").filter(Boolean)
  const staemme = woerter.map(stamm)

  for (const eintrag of VERBINDUNGEN) {
    // Nur die Ortsnamen zählen, nicht die allgemeinen Begriffe: "zug" steht
    // bei mehreren Verbindungen und entscheidet nichts.
    for (const stichwort of eintrag.stichwoerter) {
      if (stichwort.length < 6) continue
      if (trifft(stichwort, woerter, staemme, 3)) return eintrag.id
    }
  }
  return null
}

/**
 * Sucht das Ziel, das in der Eingabe genannt wird.
 *
 * Geprüft wird gegen die Stichwörter der Ziele, nicht gegen ihre Namen: der
 * Name "Rauschberg mit der Gondelbahn" hilft nicht, wenn jemand nur
 * "Gondelbahn" schreibt. `nur` schränkt die Suche auf eine Auswahl ein, etwa
 * auf die drei gerade vorgeschlagenen.
 */
function findeZielImText(text: string, nur?: string[]): string | null {
  const woerter = text.split(" ").filter(Boolean)
  const staemme = woerter.map(stamm)

  let bestes: string | null = null
  let besteTreffer = 0

  for (const eintrag of ZIELE) {
    if (nur && !nur.includes(eintrag.id)) continue

    let treffer = 0
    for (const stichwort of eintrag.stichwoerter) {
      // Gewicht 2, damit der Vertipper-Vergleich mitläuft: gerade Eigennamen
      // wie "Sonntagshorn" schreibt kaum jemand auf Anhieb richtig.
      if (trifft(stichwort, woerter, staemme, 2)) treffer++
    }

    if (treffer > besteTreffer) {
      besteTreffer = treffer
      bestes = eintrag.id
    }
  }

  return bestes
}

/* ------------------------------------------------------------------ *
 * Stufe 3: Themenlexikon
 * ------------------------------------------------------------------ */

/**
 * Ein Eintrag verbindet Stichwörter mit einem Zielknoten.
 *
 * Das Gewicht sagt, wie viel ein Treffer über die Absicht aussagt:
 *
 *   3  eindeutig, kommt in keinem anderen Zusammenhang vor ("biathlon")
 *   2  klar, aber denkbar auch anders gemeint ("hotel", "wander")
 *   1  schwach, trägt nur zusammen mit einem zweiten Hinweis ("tour", "bahn")
 *
 * Ein einzelnes schwaches Wort bleibt damit unter der Schwelle und führt zur
 * Rückfrage, statt eine Antwort zu raten. Innerhalb eines Themas dürfen
 * mehrere Einträge konkurrieren: "was kostet die bergbahn" soll bei den
 * Preisen landen und nicht beim Themeneinstieg.
 */
type Eintrag = {
  to: string
  topic: string
  gewicht: number
  /** Wortstämme, ohne Umlaute. Verglichen wird gegen den Stamm der Eingabe. */
  woerter: string[]
  /** Wendungen, die als Ganzes im Text stehen müssen. Zählen doppelt. */
  phrasen?: string[]
}

const LEXIKON: Eintrag[] = [
  /* Sport, seit dem 23.09.2026 */
  {
    to: "sport",
    topic: "sport",
    gewicht: 3,
    woerter: [
      "sport",
      "sportart",
      "sportangebot",
      "aktivitaet",
      "bewegung",
      "auspowern",
      "fitness",
      "training",
      "sports",
      "activity",
      "workout",
    ],
    phrasen: ["was sportliches", "etwas sportliches", "sportlich betaetigen", "sport machen"],
  },

  /* Wandern und Bergbahnen */
  {
    to: "wandern",
    topic: "wandern",
    gewicht: 2,
    woerter: [
      "wander",
      "wanderweg",
      "wanderung",
      "spaziergang",
      "spazier",
      "rundweg",
      "gipfel",
      "steig",
      "aussicht",
      "panorama",
      "hoehenmeter",
      "wegenetz",
      "bergtour",
      "hik",
      "hike",
      "hiking",
      "trail",
      "summit",
      "walk",
      "foerchensee",
      "traun",
      "berg",
    ],
    phrasen: ["zu fuss", "auf den berg"],
  },
  {
    to: "wandern",
    topic: "wandern",
    gewicht: 1,
    woerter: ["tour", "route", "weg", "alm", "huett"],
  },
  {
    to: "bergbahnen",
    topic: "wandern",
    gewicht: 3,
    woerter: [
      "bergbahn",
      "seilbahn",
      "gondelbahn",
      "gondel",
      "sesselbahn",
      "sessellift",
      "kabinenbahn",
      "rauschbergbahn",
      "unternbergbahn",
      "rauschberg",
      "unternberg",
      "cablecar",
      "gondola",
    ],
    phrasen: ["cable car", "mountain lift", "welche bahnen"],
  },
  {
    to: "bergbahnen",
    topic: "wandern",
    gewicht: 1,
    woerter: [
      "bahn",
      "lift",
      "bergfahrt",
      "talfahrt",
      "talstation",
      "bergstation",
    ],
  },
  {
    to: "wandern-leicht",
    topic: "wandern",
    gewicht: 3,
    woerter: ["kinderwagen", "buggy", "barrierearm", "stroller", "pram"],
    phrasen: ["leichte tour", "leichte wanderung", "flache runde", "easy walk"],
  },
  {
    to: "wandern-leicht",
    topic: "wandern",
    gewicht: 1,
    woerter: ["leicht", "flach", "eben", "gemuetlich", "kurz", "easy", "flat"],
  },
  {
    to: "wandern-schwer",
    topic: "wandern",
    gewicht: 3,
    woerter: [
      "anspruchsvoll",
      "sonntagshorn",
      "herausfordernd",
      "trittsicher",
      "demanding",
      "strenuous",
    ],
    phrasen: ["schwere tour", "hoechster berg", "grosse tour"],
  },
  {
    to: "wandern-schwer",
    topic: "wandern",
    gewicht: 1,
    woerter: ["schwer", "schwierig", "steil", "kondition", "hoechst", "hard"],
  },
  {
    to: "bergbahn-preise",
    topic: "wandern",
    gewicht: 2,
    woerter: [
      "bergbahn",
      "seilbahn",
      "gondel",
      "rauschbergbahn",
      "unternbergbahn",
      "bergfahrt",
      "talfahrt",
    ],
  },
  // Gewicht 1 mit Absicht: "was kostet das" soll nicht bei den Bergbahnen
  // landen, nur weil dort Preise stehen. Erst zusammen mit einem Themenwort
  // trägt die Preisfrage, allein wird sie zum Rückbezug auf das laufende
  // Thema.
  {
    to: "bergbahn-preise",
    topic: "wandern",
    gewicht: 1,
    woerter: [
      "preis",
      "kostet",
      "kosten",
      "teuer",
      "tarif",
      "fahrpreis",
      "eintritt",
      "price",
      "cost",
      "fare",
    ],
  },

  /* Veranstaltungen */
  {
    to: "events",
    topic: "events",
    gewicht: 2,
    woerter: [
      "event",
      "veranstaltung",
      "konzert",
      "programm",
      "buehn",
      "termin",
      "fest",
      "brauchtum",
      "tracht",
      "festival",
      "concert",
    ],
    phrasen: ["was ist los", "was geht", "whats on", "what is on"],
  },
  {
    to: "events",
    topic: "events",
    gewicht: 1,
    woerter: ["musik", "abend", "kultur"],
  },
  {
    to: "events-biathlon",
    topic: "events",
    gewicht: 3,
    woerter: [
      "biathlon",
      "weltcup",
      "worldcup",
      "chiemgauarena",
      "schiessstand",
      "skibus",
    ],
    phrasen: ["chiemgau arena", "world cup"],
  },
  {
    to: "events-biathlon",
    topic: "events",
    gewicht: 2,
    woerter: ["arena", "stadion"],
  },
  {
    to: "events-woche",
    topic: "events",
    gewicht: 2,
    woerter: ["wochenprogramm", "wochenmarkt"],
    phrasen: [
      "diese woche",
      "heute abend",
      "am wochenende",
      "diese tage",
      "this week",
      "heute los",
      "morgen los",
      "was ist los",
    ],
  },

  /* Anreise und Parken */
  {
    to: "anreise",
    topic: "anreise",
    gewicht: 3,
    woerter: [
      "anreise",
      "anfahrt",
      "autobahn",
      "a8",
      "bahnhof",
      "zug",
      "train",
      "motorway",
    ],
    phrasen: ["wie komme ich nach", "wie komme ich hierher", "how do i get to"],
  },
  {
    to: "anreise",
    topic: "anreise",
    gewicht: 1,
    woerter: [
      "auto",
      "fahren",
      "muenchen",
      "salzburg",
      "traunstein",
      "navigation",
      "kilometer",
      "station",
    ],
  },
  {
    to: "anreise-parken",
    topic: "anreise",
    gewicht: 3,
    woerter: [
      "park",
      "parkplatz",
      "parkhaus",
      "parkgebuehr",
      "stellplatz",
      "wohnmobil",
      "camper",
      "parking",
      "wohnwagen",
    ],
  },
  {
    to: "anreise-bus",
    topic: "anreise",
    gewicht: 3,
    woerter: [
      "bus",
      "buslinie",
      "busverbindung",
      "ortsbus",
      "oepnv",
      "gaestekart",
      "gastkart",
      "haltestell",
      "linienbus",
      "guestcard",
    ],
    phrasen: ["guest card", "public transport", "oeffentliche verkehrsmittel"],
  },

  /* Wetter */
  {
    to: "wetter",
    topic: "wetter",
    gewicht: 3,
    woerter: [
      "wetter",
      "bergwetter",
      "gewitter",
      "prognose",
      "vorhersage",
      "weather",
      "forecast",
      "nullgradgrenz",
    ],
  },
  {
    to: "wetter",
    topic: "wetter",
    gewicht: 1,
    woerter: [
      "regen",
      "sonne",
      "temperatur",
      "wind",
      "kalt",
      "warm",
      "nebel",
      "grad",
      "rain",
      "sunny",
      "temperature",
    ],
  },
  {
    to: "wetter-webcam",
    topic: "wetter",
    gewicht: 3,
    woerter: ["webcam", "livebild", "livecam", "kamera", "camera"],
  },
  {
    to: "wetter-3tage",
    topic: "wetter",
    gewicht: 2,
    woerter: ["dreitag", "wochenprognose"],
    phrasen: ["naechste tage", "kommende tage", "drei tage", "next days"],
  },

  /* Essen */
  {
    to: "essen",
    topic: "essen",
    gewicht: 3,
    woerter: [
      "essen",
      "restaurant",
      "gasthaus",
      "gasthof",
      "einkehr",
      "hunger",
      "hungrig",
      "fruehstueck",
      "abendessen",
      "mittagessen",
      "imbiss",
      "speisekart",
      "wirtshaus",
      "food",
      "dinner",
      "lunch",
      "breakfast",
      "hungry",
    ],
    phrasen: ["etwas essen", "was essen", "essen gehen"],
  },
  {
    to: "essen",
    topic: "essen",
    gewicht: 2,
    woerter: ["kaffee", "cafe", "bier", "trinken", "eat", "drink"],
  },
  {
    to: "essen",
    topic: "essen",
    gewicht: 1,
    woerter: ["kueche", "lokal", "wirt", "mittag", "kulinar"],
  },
  {
    to: "essen-huette",
    topic: "essen",
    gewicht: 3,
    woerter: ["weitseealm", "laubaualm"],
    phrasen: ["huette mit spielplatz", "einkehr mit kindern"],
  },
  {
    to: "essen-huette",
    topic: "essen",
    gewicht: 2,
    woerter: ["huett", "berggasthaus", "almhuett", "berghuett"],
  },
  {
    to: "essen-ruhetag",
    topic: "essen",
    gewicht: 3,
    woerter: ["ruhetag", "geschlossen", "closed"],
  },
  // Die Küchen führen zur Liste dieser Küche, ohne erst nachzufragen. Welche
  // Lokale dazugehören, steht in GRUPPEN (ziele.ts). Gewicht 5, damit die
  // Küche gegen "Restaurant" und "Küche" im selben Satz gewinnt: "gibt es
  // ein Restaurant mit bayerischer Küche" meint die bayerischen.
  {
    to: "empfehlung:essen-regional:0",
    topic: "essen",
    gewicht: 5,
    woerter: ["bayerisch", "regional", "schmankerl", "bavarian"],
  },
  {
    to: "empfehlung:essen-italienisch:0",
    topic: "essen",
    gewicht: 5,
    woerter: ["italienisch", "italiener", "mediterran", "italian"],
  },
  {
    to: "empfehlung:essen-international:0",
    topic: "essen",
    gewicht: 5,
    woerter: ["international"],
  },
  {
    to: "empfehlung:essen-vegetarisch:0",
    topic: "essen",
    gewicht: 5,
    woerter: ["vegetarisch", "vegan", "veggie", "vegetarian"],
  },
  {
    to: "empfehlung:almen:0",
    topic: "essen",
    gewicht: 3,
    woerter: [],
    phrasen: [
      "auf der alm",
      "auf einer alm",
      "am berg essen",
      "almen zum essen",
    ],
  },
  // Die vollen Namen der Lokale. Ohne sie gewinnt ein Allgemeinwort im Namen:
  // "Restaurant Maiers" landete beim Thema Essen, "Ruhpoldinger Hof" bei den
  // Bauernhöfen und "Pizza & Co" bei der Pizzeria Made in Italy.
  {
    to: "ziel:maiers",
    topic: "essen",
    gewicht: 3,
    woerter: [],
    phrasen: ["restaurant maiers"],
  },
  {
    to: "ziel:ruhpoldinger-hof",
    topic: "essen",
    gewicht: 3,
    woerter: [],
    phrasen: ["ruhpoldinger hof"],
  },
  {
    to: "ziel:weingarten",
    topic: "essen",
    gewicht: 3,
    woerter: [],
    phrasen: ["gasthaus weingarten", "gasthof weingarten"],
  },
  {
    to: "ziel:holzstube",
    topic: "essen",
    gewicht: 3,
    woerter: [],
    phrasen: ["am maibaum"],
  },
  {
    to: "ziel:pizza-co",
    topic: "essen",
    gewicht: 3,
    woerter: [],
    phrasen: ["pizza co", "pizza und co"],
  },
  {
    to: "ziel:safran",
    topic: "essen",
    gewicht: 3,
    woerter: [],
    phrasen: ["indisches restaurant", "indisch essen"],
  },

  /* Familie */
  {
    to: "familie",
    topic: "familie",
    gewicht: 3,
    woerter: [
      "kind",
      "famili",
      "schwimmbad",
      "maerchenwald",
      "barfussweg",
      "family",
      "children",
      "kid",
      "kids",
    ],
    phrasen: ["mit kindern", "mit den kleinen", "with children"],
  },
  {
    to: "familie",
    topic: "familie",
    gewicht: 1,
    woerter: ["schwimm", "spielen", "rutsch", "badesee", "swimming"],
  },
  // "museum" allein ergab eine Rückfrage mit einer einzigen Möglichkeit,
  // "welche museen gibt es" gar nichts.
  {
    to: "empfehlung:museen:0",
    topic: "familie",
    gewicht: 3,
    woerter: ["museum", "museen", "ausstellung", "museums"],
  },
  {
    to: "familie-regen",
    topic: "familie",
    gewicht: 3,
    woerter: [
      "schlechtwetter",
      "hallenbad",
      "kletterhalle",
      "heimatmuseum",
      "indoor",
    ],
    phrasen: ["bei regen", "wenn es regnet", "rainy day"],
  },
  {
    to: "familie-baby",
    topic: "familie",
    gewicht: 3,
    woerter: [
      "wickel",
      "wickeltisch",
      "stillen",
      "windel",
      "baby",
      "saeugling",
      "nappy",
      "nappies",
      "breastfeed",
    ],
  },

  /* Winter */
  {
    to: "winter",
    topic: "winter",
    gewicht: 3,
    woerter: [
      "winter",
      "langlauf",
      "skifahren",
      "rodel",
      "schlitten",
      "eislauf",
      "snowboard",
      "skigebiet",
      "skiing",
      "sledge",
      "toboggan",
    ],
  },
  {
    to: "winter",
    topic: "winter",
    gewicht: 1,
    woerter: ["ski", "schnee", "piste", "skating", "abfahrt", "snow"],
  },
  {
    to: "winter-loipe",
    topic: "winter",
    gewicht: 3,
    woerter: ["loipe", "loipenpass", "loipennetz", "skating", "crosscountry"],
    phrasen: ["cross country", "trail pass"],
  },
  {
    to: "winter-verleih",
    topic: "winter",
    gewicht: 3,
    woerter: ["verleih", "skiverleih", "ausruestung", "rental"],
  },
  // "Leihen" allein sagt noch nichts über den Winter: nach einem Fahrrad
  // wird hier genauso gefragt, und darauf hat der Prototyp keine Antwort.
  // Zusammen mit "Ski" trägt es, allein nicht.
  {
    to: "winter-verleih",
    topic: "winter",
    gewicht: 1,
    woerter: ["ausleih", "leihen", "mieten", "hire", "rent"],
  },

  /* Unterkunft */
  {
    to: "unterkunft",
    topic: "unterkunft",
    gewicht: 3,
    woerter: [
      "uebernacht",
      "unterkunft",
      "hotel",
      "ferienwohnung",
      "ferienzimmer",
      "pension",
      "apartment",
      "gastgeber",
      "campingplatz",
      "accommodation",
      "hostel",
      "guesthouse",
    ],
    phrasen: ["wo kann ich schlafen", "guest house", "place to stay"],
  },
  {
    to: "unterkunft",
    topic: "unterkunft",
    gewicht: 1,
    woerter: [
      "zimmer",
      "schlafen",
      "buchen",
      "camping",
      "bett",
      "stay",
      "room",
      "sleep",
      "book",
    ],
  },
  {
    to: "unterkunft-hof",
    topic: "unterkunft",
    gewicht: 3,
    woerter: ["bauernhof", "landwirtschaft"],
    phrasen: ["urlaub am bauernhof", "auf dem hof", "on a farm"],
  },
  {
    to: "unterkunft-hof",
    topic: "unterkunft",
    gewicht: 2,
    woerter: ["hof", "farm", "tiere", "kuehe"],
  },
  {
    to: "unterkunft-barrierefrei",
    topic: "unterkunft",
    gewicht: 3,
    woerter: [
      "barrierefrei",
      "rollstuhl",
      "rollstuhlgerecht",
      "behindertengerecht",
      "accessible",
      "wheelchair",
      "stufenlos",
    ],
    phrasen: ["reisen fuer alle"],
  },

  /* Tourist-Information */
  {
    to: "info",
    topic: "info",
    gewicht: 3,
    woerter: [
      "oeffnungszeit",
      "touristinfo",
      "touristinformation",
      "anschrift",
      "telefonnummer",
      "ansprechpartner",
      "beratung",
    ],
    phrasen: ["tourist info", "tourist information", "opening hours"],
  },
  {
    to: "info",
    topic: "info",
    gewicht: 2,
    woerter: [
      "kontakt",
      "telefon",
      "adresse",
      "email",
      "buero",
      "contact",
      "phone",
      "address",
    ],
  },
  {
    to: "info",
    topic: "info",
    gewicht: 1,
    woerter: ["erreichen", "anrufen", "mail", "schalter"],
  },
]

/**
 * Die Ziele als Lexikoneinträge.
 *
 * Erzeugt statt geschrieben: jedes Ziel bringt seine Stichwörter mit, und sie
 * hier ein zweites Mal zu pflegen hieße, sie auseinanderlaufen zu lassen.
 *
 * Das Gewicht liegt unter dem der Themen-Einträge. Ein Ziel ist die
 * speziellere Antwort und soll sie geben, wenn es beim Namen genannt wird
 * ("Pizza" meint die Pizzeria), aber nicht die Übersicht verdrängen, wenn
 * jemand allgemein fragt ("welche Bergbahnen gibt es" meint beide).
 */
const THEMENWOERTER = LEXIKON.flatMap((eintrag) => eintrag.woerter)

/**
 * Verglichen wird über den Wortanfang, nicht auf Gleichheit: "kinder" bei der
 * Almhütte und "kind" beim Thema Familie sind dasselbe Signal, und ohne
 * diesen Vergleich zöge die Hütte jede Familienfrage zur Hälfte an sich.
 */
function gehoertZumThema(wort: string): boolean {
  return THEMENWOERTER.some(
    (thema) => wort.startsWith(thema) || thema.startsWith(wort)
  )
}

const ZIEL_EINTRAEGE: Eintrag[] = ZIELE.map((eintrag) => ({
  to: `ziel:${eintrag.id}`,
  topic: eintrag.topic,
  gewicht: 2,
  // Ein Wort, das schon ein Thema kennzeichnet, bleibt beim Thema.
  //
  // Die Stichwortliste eines Ziels darf breit sein, denn beim Auswählen aus
  // drei Vorschlägen genügt "das mit dem See". Global angewandt richtet
  // dieselbe Breite Schaden an: "Park" träfe den Freizeitpark statt der
  // Parkplätze, "leihen" den Skiverleih statt gar nichts. Was hier
  // durchfällt, bleibt über die Wegfrage und die Auswahl erreichbar.
  woerter: eintrag.stichwoerter.filter((wort) => !gehoertZumThema(wort)),
})).filter((eintrag) => eintrag.woerter.length > 0)

/** Wie viele Punkte ein Ziel braucht, damit es ohne Rückfrage gilt. */
const SCHWELLE = 2

/**
 * Ab welchem Anteil am Spitzenwert ein zweites Thema als gleich stark gilt.
 *
 * Bei 0,66 wird aus 2 gegen 3 noch eine Rückfrage, aus 1 gegen 3 nicht mehr.
 * Ein klar stärkerer Hinweis setzt sich also durch, zwei ähnlich starke führen
 * zur Nachfrage.
 */
const NAEHE = 0.66

/**
 * Zuschlag für ein Ziel, auf das mehr als ein Stichwort zeigt.
 *
 * Zwei unabhängige Hinweise auf dasselbe Ziel wiegen mehr als die Summe ihrer
 * Einzelgewichte vermuten lässt. Das entscheidet den Fall, der ohne Zuschlag
 * unentschieden bliebe: "was kostet die Bergbahn" trifft bei den Preisen zwei
 * Stichwörter, beim Themeneinstieg nur eines.
 */
const KOMBINATIONSBONUS = 1

/**
 * Ein Kompositum-Grundwort muss mindestens so lang sein, um am Wortende
 * erkannt zu werden. Unterhalb davon würde "bahn" jedes Wort auf -bahn an
 * sich ziehen, auch die Autobahn.
 */
const MINDESTLAENGE_GRUNDWORT = 5

/**
 * Wie viele Zeichen ein Stichwort am Wortanfang noch übrig lassen darf.
 *
 * Eine Flexionsendung ist kurz ("kinder" zu "kind"), ein zweites Wort im
 * Kompositum lang ("kinderwagen" zu "kind"). Ohne diese Grenze zieht das
 * Thema Familie jede Wanderfrage mit Kinderwagen an sich, und die Frage wird
 * künstlich mehrdeutig.
 */
const MAXIMALER_FLEXIONSREST = 3

/**
 * Ab dieser Länge gilt ein Stichwort als selbst schon eindeutig.
 *
 * "Wander" kann am Wortanfang nichts anderes einleiten als eine Wanderung,
 * eine Wandertour, einen Wanderweg oder Wanderschuhe: die Flexionsgrenze
 * darüber wäre hier nur im Weg. "Kind" mit vier Zeichen ist dagegen nicht
 * eindeutig, dort steht der Kinderwagen daneben, und die Grenze bleibt.
 */
const EINDEUTIGE_LAENGE = 6

type Punktestand = {
  to: string
  topic: string
  punkte: number
  treffer: number
}

/**
 * Bewertet die Eingabe gegen das gesamte Lexikon.
 *
 * Jedes Stichwort zählt je Eintrag nur einmal, sonst würde "wandern wandern
 * wandern" zum stärksten Signal des Gesprächs.
 */
/**
 * Steht dieses Stichwort in der Eingabe?
 *
 * Vier Wege gelten als Treffer, in dieser Reihenfolge geprüft:
 *
 *   Gleichheit          "hotel" auf "hotel"
 *   Wortanfang          "kinder" auf "kind", solange der Rest kurz bleibt
 *   Wortende            "skiverleih" auf "verleih", das Grundwort im Kompositum
 *   Vertipper           "bergbahen" auf "bergbahn"
 *
 * Die umgekehrte Richtung, ein Stichwort das mit der Eingabe beginnt, fehlt
 * bewusst. Sie klingt harmlos, führt aber dazu, dass "Bahn" das Stichwort
 * "Bahnhof" trifft und eine Frage nach der Bergbahn im Thema Anreise landet.
 * Das Lexikon führt stattdessen kurze Stämme, damit die Richtung oben genügt.
 *
 * Der Vertipper-Vergleich bleibt starken Stichwörtern vorbehalten. Bei einem
 * schwachen Wort wie "tour" oder "bahn" wäre er die schlechteste Kombination
 * aus beidem: ein Signal, das für sich genommen wenig aussagt, und dazu noch
 * geraten. Bei einem starken Wort dagegen zählt er voll, denn eine verrutschte
 * Taste macht aus "Bergbahn" kein schwächeres Signal.
 */
function trifft(
  stichwort: string,
  woerter: string[],
  staemme: string[],
  gewicht: number
): boolean {
  for (let i = 0; i < staemme.length; i++) {
    const wort = staemme[i]
    const voll = woerter[i]

    if (wort === stichwort || voll === stichwort) return true

    for (const form of [wort, voll]) {
      if (
        form.startsWith(stichwort) &&
        (stichwort.length >= EINDEUTIGE_LAENGE ||
          form.length - stichwort.length <= MAXIMALER_FLEXIONSREST)
      ) {
        return true
      }
      if (
        stichwort.length >= MINDESTLAENGE_GRUNDWORT &&
        form.endsWith(stichwort)
      ) {
        return true
      }
    }

    if (gewicht >= 2) {
      const grenze = toleranz(Math.max(wort.length, stichwort.length))
      if (grenze > 0 && abstand(wort, stichwort, grenze) <= grenze) return true
    }
  }
  return false
}

function bewerte(text: string): Punktestand[] {
  const roh = normalisiere(text)
  const woerter = roh.split(" ").filter(Boolean)
  const staemme = woerter.map(stamm)
  const punkte = new Map<string, Punktestand>()

  const addiere = (eintrag: Eintrag, wert: number) => {
    const vorhanden = punkte.get(eintrag.to)
    if (vorhanden) {
      vorhanden.punkte += wert
      vorhanden.treffer += 1
    } else {
      punkte.set(eintrag.to, {
        to: eintrag.to,
        topic: eintrag.topic,
        punkte: wert,
        treffer: 1,
      })
    }
  }

  for (const eintrag of [...LEXIKON, ...ZIEL_EINTRAEGE]) {
    for (const phrase of eintrag.phrasen ?? []) {
      // Eine Wendung ist ein viel stärkeres Signal als ein Einzelwort, weil
      // sie kaum zufällig entsteht.
      if (roh.includes(phrase)) addiere(eintrag, eintrag.gewicht * 2)
    }

    // Gezählt wird je Wort der Eingabe, nicht je Stichwort. Sonst trifft
    // "restaurants" beim Essen sowohl "restaurant" als auch "restaurants"
    // und zählt doppelt, und das Thema überstimmt jede speziellere Antwort:
    // "welche Restaurants haben Ruhetag" landete beim Essen statt bei den
    // Ruhetagen.
    for (let i = 0; i < woerter.length; i++) {
      const getroffen = eintrag.woerter.some((stichwort) =>
        trifft(stichwort, [woerter[i]], [staemme[i]], eintrag.gewicht)
      )
      if (getroffen) addiere(eintrag, eintrag.gewicht)
    }
  }

  for (const stand of punkte.values()) {
    if (stand.treffer >= 2) stand.punkte += KOMBINATIONSBONUS
  }

  // Bei Gleichstand gewinnt der speziellere Knoten. Wer "barrierefreie
  // Unterkunft" tippt, hat mehr gesagt als wer nur "Unterkunft" tippt, und
  // soll nicht auf dem Themeneinstieg landen.
  return [...punkte.values()].sort((a, b) => {
    if (b.punkte !== a.punkte) return b.punkte - a.punkte
    const aEinstieg = a.to === a.topic ? 1 : 0
    const bEinstieg = b.to === b.topic ? 1 : 0
    return aEinstieg - bEinstieg
  })
}

type Themenstand = { topic: string; punkte: number; bestesZiel: string }

/**
 * Fasst die Ziele zu Themen zusammen.
 *
 * Die Punkte eines Themas sind die Summe seiner Ziele, nicht deren Maximum.
 * Zwei schwache Hinweise auf dasselbe Thema sollen sich verstärken dürfen:
 * "Ski" und "leihen" sagen einzeln wenig, zusammen sagen sie genug. Welcher
 * Knoten die Antwort gibt, entscheidet dagegen der beste einzelne Wert, sonst
 * gewönne das Thema mit den meisten Unterknoten.
 */
function themenstaende(staende: Punktestand[]): Themenstand[] {
  const themen = new Map<string, Themenstand & { bestes: number }>()
  for (const stand of staende) {
    const bisher = themen.get(stand.topic)
    if (!bisher) {
      themen.set(stand.topic, {
        topic: stand.topic,
        punkte: stand.punkte,
        bestesZiel: stand.to,
        bestes: stand.punkte,
      })
      continue
    }
    bisher.punkte += stand.punkte
    // staende ist bereits sortiert, das erste Ziel eines Themas ist sein
    // stärkstes. Ein späteres übernimmt nur bei echtem Vorsprung.
    if (stand.punkte > bisher.bestes) {
      bisher.bestes = stand.punkte
      bisher.bestesZiel = stand.to
    }
  }
  return [...themen.values()].sort((a, b) => b.punkte - a.punkte)
}

/**
 * Die Themen der Eingabe, nach Punkten sortiert.
 *
 * Der weiche Fallback braucht dieselbe Einschätzung wie der Hauptdurchlauf,
 * nur ohne Schwelle: er soll auch aus schwachen Hinweisen noch einen
 * Vorschlag machen. Beide aus derselben Quelle zu speisen hält die Rückfrage
 * mit der Zuordnung im Einklang.
 */
export function themenRangfolge(
  text: string
): { topic: string; label: string; punkte: number }[] {
  return themenstaende(bewerte(text)).map((stand) => ({
    topic: stand.topic,
    label:
      TOPICS.find((topic) => topic.id === stand.topic)?.label ?? stand.topic,
    punkte: stand.punkte,
  }))
}

/* ------------------------------------------------------------------ *
 * Stufe 4: Rückbezug auf das laufende Thema
 * ------------------------------------------------------------------ */

/**
 * Anaphern: Fragen, die ihr Thema aus dem Gesagten beziehen.
 *
 * Sie werden erst geprüft, nachdem das Lexikon nichts Starkes gefunden hat.
 * "Was kostet die Bergbahn" trägt sein Thema selbst und soll nicht als bloßer
 * Rückbezug enden, "was kostet das" dagegen schon.
 */
const ANAPHERN: { art: keyof Folge; test: RegExp }[] = [
  {
    art: "preis",
    test: /\bwas kostet\b|\bwie teuer\b|\bpreis\w*\b|\bkosten\b|\beintritt\w*\b|\bgebuehr\w*\b|\bhow much\b|\bprice\b|\bcost\b/,
  },
  {
    art: "weg",
    test: /\bwie komme ich (da ?hin|dort ?hin|hin)\b|\bwo ist das\b|\bwo finde ich das\b|\bwie weit ist\b|\bwie weit\b|\bwie lange (brauche|dauert|laufe)\b|\bentfernung\b|\bwie komme ich dahin\b|\bhow far\b|\bhow do i get there\b/,
  },
  {
    art: "zeit",
    test: /\bwann\b|\bab wann\b|\bbis wann\b|\bwie lange (offen|geoeffnet)\b|\boeffnungszeit\w*\b|\buhrzeit\b|\bfahrplan\w*\b|\babfahrt\w*\b|\btakt\b|\bwhen\b|\bwhat time\b|\btimetable\b/,
  },
  {
    art: "vertiefung",
    test: /\bwelche\w*\b|\bwas genau\b|\bgenauer\b|\bgenau\b|\bmehr (dazu|davon|infos?|details|darueber)\b|\berzaehl\w*\b|\bdetails\b|\bnaeheres\b|\bund weiter\b|\bwas noch\b|\bsonst noch\b|\bbeispiel\w*\b|\bkonkret\w*\b|\btell me more\b|\bmore details\b|\bwhich ones?\b/,
  },
]

/** Die Ziele, auf die ein Rückbezug innerhalb eines Themas führt. */
export type Folge = {
  vertiefung?: string
  preis?: string
  weg?: string
  zeit?: string
}

/* ------------------------------------------------------------------ *
 * Gesprächszustand
 * ------------------------------------------------------------------ */

/**
 * Was der Verstehens-Kern über das laufende Gespräch wissen muss.
 *
 * Bewusst klein gehalten: der zuletzt gezeigte Knoten, sein Thema und die
 * Schaltflächen, die gerade unter der Antwort stehen. Mehr braucht keine der
 * vier Stufen, und was nicht gespeichert wird, kann auch nicht veralten.
 */
export type Kontext = {
  knoten: string | null
  topic: string | null
  chips: Chip[]
  /** Stand zuletzt eine Rückfrage, ist ein blankes "ja" eine Zustimmung. */
  istRueckfrage: boolean
  /**
   * Die Ziele, die gerade zur Auswahl stehen.
   *
   * Sie sind der Grund, warum "ich würde gern auf den Rauschberg" ohne
   * Schaltfläche funktioniert: gesucht wird zuerst in dieser kurzen Liste,
   * nicht im gesamten Register.
   */
  angebot: string[]
  /** Aus welcher Vorschlagsgruppe das Angebot stammt, und ab welcher Stelle. */
  gruppe: { id: string; ab: number } | null
  /**
   * Das zuletzt behandelte Ziel.
   *
   * Es überlebt die einzelne Antwort, damit "navigiere mich da hin" noch
   * greift, wenn zwischendurch etwas anderes gesagt wurde.
   */
  ziel: string | null
  /** Der nächste Ausschnitt einer Vorschlagsliste aus der Bedarfsklärung. */
  weiter?: string | null
  /** Wohin ein "nein" auf eine Ja-Nein-Frage führt. */
  nein?: string | null
  /**
   * Der zuletzt angebotene oder gezeigte Flyer. Er überlebt die einzelne
   * Antwort, damit "ich will den Flyer doch ausgedruckt" auch zwei Schritte
   * später noch weiß, welcher gemeint ist (Testlauf vom 23.09.2026).
   */
  flyer?: string | null
}

export function neuerKontext(): Kontext {
  return {
    knoten: null,
    topic: null,
    chips: [],
    istRueckfrage: false,
    angebot: [],
    gruppe: null,
    ziel: null,
  }
}

/* ------------------------------------------------------------------ *
 * Ergebnis
 * ------------------------------------------------------------------ */

/**
 * Woher der Treffer kam. Steht so im Interaktionsprotokoll und macht in der
 * Auswertung unterscheidbar, ob eine Eingabe am Wortschatz, am Gesprächs-
 * zustand oder an einer Meta-Frage hing.
 */
export type Grund =
  | "fahrplan"
  | "meta"
  | "auswahl"
  | "lexikon"
  | "anapher"
  | "wiederholung"
  | "navigation"
  | "zielwahl"
  | "empfehlung"
  | "bedarf"
  | "dienst"
  | "zettel"

export type MatchResult =
  | { kind: "hit"; to: string; grund: Grund }
  | { kind: "ambiguous"; candidates: Chip[]; term: string | null }
  | { kind: "miss"; term: string | null }

/**
 * Ordnet freien Text einem Zielknoten zu.
 *
 * `kontext` darf fehlen; dann entfallen die Stufen, die auf das Gespräch
 * zurückgreifen, und übrig bleibt die reine Wortzuordnung. Die Tests nutzen
 * beides, um den Beitrag des Zustands sichtbar zu machen.
 */
export function verstehe(
  text: string,
  kontext: Kontext = neuerKontext()
): MatchResult {
  const roh = normalisiere(text)
  const term = leitbegriff(text)
  if (!roh) return { kind: "miss", term }

  const staende = bewerte(text)
  const spitze = staende[0]?.punkte ?? 0

  /* Stufe 0: Antwort auf eine Ja-Nein-Frage, etwa nach dem Flyer. Vor den
     Meta-Absichten, sonst landet "nein danke" beim Dank. */
  if (kontext.nein && kontext.chips.length > 0) {
    if (NEIN.test(roh)) return { kind: "hit", to: kontext.nein, grund: "auswahl" }
    if (JA.test(roh)) {
      return { kind: "hit", to: kontext.chips[0].to, grund: "auswahl" }
    }
  }

  /* Stufe 0: die angebotene Seite auf ruhpolding.de. Vor dem Flyer, denn
     "online" heißt dort "digital". */
  const website = zurWebsite(roh, kontext)
  if (website) return { kind: "hit", to: website, grund: "auswahl" }

  /* Stufe 0: alles rund um den Flyer. */
  const flyer = zumFlyer(roh, kontext)
  if (flyer) return { kind: "hit", to: flyer, grund: "auswahl" }

  /* Stufe 0: Antwort auf eine Frage der Bedarfsklärung. */
  const bedarf = zurBedarfsklaerung(roh, kontext)
  if (bedarf) return bedarf

  /* Stufe 1: Meta-Absichten. */
  for (const meta of META) {
    if (!meta.test.test(roh)) continue

    // "Was kann ich hier machen" beantwortet die Auskunft nicht mit einer
    // Liste, sondern mit einer Gegenfrage (KA [00:13:11]). Was die Eingabe
    // schon verrät, etwa "mit Kinderwagen", muss nicht noch einmal gefragt
    // werden. Das gilt auch dann, wenn ein Wort wie "Kinderwagen" im Lexikon
    // stark ist: die Frage bleibt eine nach Unternehmungen.
    if (meta.name === "umgebung") {
      const profil = bedarfAusText(roh)
      if (Object.keys(profil).length > 0 || spitze < SCHWELLE) {
        return { kind: "hit", to: `bedarf:${kodiere(profil)}`, grund: "bedarf" }
      }
    }

    // Steht neben der allgemeinen Form eine echte Sachfrage, gewinnt die
    // Sachfrage: "Danke, und wo kann ich parken?"
    if (meta.weichtThema && spitze >= SCHWELLE) break

    // "Nochmal" ohne vorherige Antwort ist gegenstandslos.
    if (meta.to === "@wiederholung") {
      if (!kontext.knoten) break
      return { kind: "hit", to: kontext.knoten, grund: "wiederholung" }
    }

    return { kind: "hit", to: meta.to, grund: "meta" }
  }

  /* Stufe 1b: Zettel, tägliche Fragen und Ziele außerhalb. */
  const zettel = zumZettel(roh, kontext)
  if (zettel) return { kind: "hit", to: zettel, grund: "zettel" }

  if (HINWEISE.test(roh)) return { kind: "hit", to: "hinweise", grund: "dienst" }

  const dienst = erkenneDienst(roh)
  if (dienst) return { kind: "hit", to: dienst, grund: "dienst" }

  const fernziel = erkenneFernziel(roh)
  if (fernziel) return { kind: "hit", to: fernziel, grund: "dienst" }

  // Radfahren hat kein eigenes Thema im Lexikon. Wer davon spricht, kommt
  // in die Bedarfsklärung mit dem Interesse Rad.
  if (RADWUNSCH.test(roh)) {
    const profil = ergaenze(bedarfAusText(roh), { i: "rad" })
    return { kind: "hit", to: `bedarf:${kodiere(profil)}`, grund: "bedarf" }
  }

  /* Stufe 2: Fahrverbindung zu einem Ort außerhalb. */
  const verbindung = findeVerbindungImText(roh)
  if (verbindung && willFahren(roh, kontext, spitze)) {
    return { kind: "hit", to: `fahrplan:${verbindung}`, grund: "fahrplan" }
  }

  /* Stufe 3: Wegführung zu einem Ziel im Ort. */
  const weg = zurNavigation(roh, kontext)
  if (weg) return weg

  /* Stufe 4: andere Vorschläge aus derselben Liste. */
  if (kontext.weiter && ANDERE.test(roh)) {
    return { kind: "hit", to: kontext.weiter, grund: "empfehlung" }
  }
  if (kontext.gruppe && ANDERE.test(roh)) {
    const naechste = kontext.gruppe.ab + VORSCHLAEGE
    return {
      kind: "hit",
      to: `empfehlung:${kontext.gruppe.id}:${naechste}`,
      grund: "empfehlung",
    }
  }

  /* Stufe 5: eines der vorgeschlagenen Ziele auswählen. */
  if (kontext.angebot.length > 0) {
    const gewaehlt = findeZielImText(roh, kontext.angebot)
    if (gewaehlt)
      return { kind: "hit", to: `ziel:${gewaehlt}`, grund: "zielwahl" }
  }

  /* Stufe 5b: ein Vorhaben mit genanntem Ziel, auch ohne Vorschlagsliste. */
  if (WUNSCH.test(roh)) {
    const gewuenscht = findeZielImText(roh)
    if (gewuenscht)
      return { kind: "hit", to: `ziel:${gewuenscht}`, grund: "zielwahl" }
  }

  /* Stufe 6: Auswahl aus dem, was gerade angeboten wird. */
  const auswahl = waehleAusChips(roh, kontext)
  if (auswahl) return { kind: "hit", to: auswahl, grund: "auswahl" }

  /* Stufe 7: Themenlexikon. */
  const rang = themenstaende(staende)
  if (rang.length > 0 && rang[0].punkte >= SCHWELLE) {
    // Mehrdeutig ist eine Eingabe nur über Themengrenzen hinweg. Innerhalb
    // eines Themas ist Konkurrenz erwünscht, dort gewinnt der speziellere
    // Knoten und niemand muss etwas bestätigen.
    const knapp = rang.filter((stand) => stand.punkte >= rang[0].punkte * NAEHE)
    if (knapp.length >= 2) {
      return {
        kind: "ambiguous",
        candidates: alsChips(knapp.slice(0, 3)),
        term,
      }
    }

    // Eine allgemein gehaltene Frage, die nur das Thema trifft, wird zur
    // Vorschlagsliste. Trifft sie dagegen einen bestimmten Knoten, ist sie
    // konkret genug für eine Antwort: "welche Bergbahnen gibt es" will die
    // Bahnen wissen, "welche Wandertouren kann ich machen" will auswählen.
    const thema = rang[0].topic
    if (
      rang[0].bestesZiel === thema &&
      GRUPPEN[thema] &&
      EMPFEHLUNGSFRAGE.test(roh)
    ) {
      // Bei Touren und bei Kindern hängt die richtige Antwort an Kondition,
      // Begleitung und Wetter. Dort fragt die Auskunft erst nach
      // (KA [00:12:01], [00:12:47]), statt eine feste Liste zu nennen.
      const vorbelegt: Record<string, Profil> = {
        wandern: { i: "berge" },
        familie: { i: "familie", b: "kinder" },
      }
      // Beim Essen fragt die Auskunft nach der Küche. Wer ausdrücklich im Ort
      // essen will, bekommt dabei keine Alm angeboten.
      if (thema === "essen") {
        const imOrt = IM_ORT.test(roh)
        return {
          kind: "hit",
          to: imOrt ? "essen-wahl-ort" : "essen-wahl",
          grund: "empfehlung",
        }
      }
      const start = vorbelegt[thema]
      if (start) {
        const profil = ergaenze(bedarfAusText(roh), start)
        return { kind: "hit", to: `bedarf:${kodiere(profil)}`, grund: "bedarf" }
      }
      return { kind: "hit", to: `empfehlung:${thema}:0`, grund: "empfehlung" }
    }

    return { kind: "hit", to: rang[0].bestesZiel, grund: "lexikon" }
  }

  /* Stufe 8: Rückbezug auf das laufende Thema. */
  if (kontext.topic) {
    const folge = FOLGEN[kontext.topic]
    for (const anapher of ANAPHERN) {
      if (!anapher.test.test(roh)) continue

      const ziel = folge?.[anapher.art]
      if (ziel && ziel !== kontext.knoten) {
        return { kind: "hit", to: ziel, grund: "anapher" }
      }

      // Führt der Rückbezug auf den Knoten, der gerade auf dem Schirm steht,
      // ist die Frage dort schon beantwortet und trotzdem gestellt worden.
      // Dann geht es einen Schritt weiter statt dieselbe Antwort noch einmal
      // auszurollen. Genau das passiert bei "ja welche genau", nachdem die
      // Aufzählung bereits gelaufen ist.
      const weiter = naechsterSchritt(kontext)
      if (weiter) return { kind: "hit", to: weiter, grund: "anapher" }

      // Passt die Art nicht, kann eine andere noch greifen: "wie lange
      // dauert das" trifft erst "weg", dann "zeit".
    }
  }

  /* Ein schwacher Hinweis reicht nicht für eine Antwort, aber für einen
     Vorschlag. Statt sofort in den Fallback zu fallen, wird gefragt. */
  if (rang.length > 0) {
    return { kind: "ambiguous", candidates: alsChips(rang.slice(0, 2)), term }
  }

  return { kind: "miss", term }
}

/** Themen als Schaltflächen, beschriftet und auf ihren besten Knoten gerichtet. */
function alsChips(staende: Themenstand[]): Chip[] {
  return staende.map((stand) => ({
    label:
      TOPICS.find((topic) => topic.id === stand.topic)?.label ?? stand.topic,
    to: stand.bestesZiel,
    // Das Ziel führt oft auf einen Unterknoten, dessen ID das Thema nicht
    // nennt. Die Rückfrage braucht es aber, um auf Englisch den englischen
    // Themennamen einzusetzen.
    topic: stand.topic,
  }))
}

/**
 * Bezieht sich die Eingabe auf eine der Schaltflächen, die gerade unter der
 * letzten Antwort stehen?
 *
 * Drei Wege führen dorthin: Zustimmung nach einer Rückfrage, eine Position
 * ("das zweite") und die Beschriftung selbst, auch nur teilweise getippt.
 */
/**
 * Die Schaltfläche an dieser Stelle, sofern es sie gibt.
 *
 * Steht eine Vorschlagsliste, endet die Zählung bei deren letztem Ziel.
 * Sonst würde eine zu hohe Zahl auf "Andere Frage" zeigen und die Auswahl
 * hätte scheinbar geklappt, nur eben die falsche.
 */
function chipAnStelle(kontext: Kontext, index: number): string | null {
  if (index < 0) return null
  const grenze =
    kontext.angebot.length > 0 ? kontext.angebot.length : kontext.chips.length
  if (index >= grenze) return null
  return kontext.chips[index]?.to ?? null
}

function waehleAusChips(roh: string, kontext: Kontext): string | null {
  if (kontext.chips.length === 0) return null

  // Ein blankes "ja" bestätigt den ersten Vorschlag. Nur nach einer
  // Rückfrage: sonst wäre es eine Antwort auf eine Frage, die keiner gestellt
  // hat, und würde in ein zufälliges Thema führen.
  if (kontext.istRueckfrage && JA.test(roh)) return kontext.chips[0].to
  if (kontext.istRueckfrage && NEIN.test(roh)) return kontext.nein ?? "menu"

  // Ein Ordnungswort zählt ab dem obersten Vorschlag, eine blanke Zahl meint
  // die gedruckte Nummer. Auf der ersten Seite fällt beides zusammen, ab der
  // zweiten nicht mehr: dort steht "4 ·" oben.
  const versatz = kontext.gruppe?.ab ?? 0
  for (const [muster, stelle] of ORDINAL) {
    if (!muster.test(roh)) continue
    const gewaehlt = chipAnStelle(kontext, stelle - 1)
    if (gewaehlt) return gewaehlt
  }
  // Gezählt wird nur, wo etwas zur Auswahl steht: eine Vorschlagsliste oder
  // eine Rückfrage. Die Kacheln eines Themenmenues sind Wegweiser, keine
  // Auswahl, und tragen keine Nummern.
  const zaehlbar = kontext.angebot.length > 0 || kontext.istRueckfrage
  const ziffer = zaehlbar ? ZIFFER.exec(roh) : null
  if (ziffer) {
    const gewaehlt = chipAnStelle(kontext, Number(ziffer[1]) - 1 - versatz)
    if (gewaehlt) return gewaehlt
  }

  // Deckt sich die Eingabe weitgehend mit einer Beschriftung, ist sie als
  // Klick auf diese Schaltfläche gemeint. Ein einzelnes gemeinsames Wort
  // genügt nicht, sonst zieht "Andere Frage" jede Frage an sich.
  const eingabe = new Set(
    roh
      .split(" ")
      .filter((wort) => wort.length >= 4)
      .map(stamm)
  )
  if (eingabe.size === 0) return null

  for (const chip of kontext.chips) {
    const label = new Set(
      normalisiere(chip.label)
        .split(" ")
        .filter((wort) => wort.length >= 4)
        .map(stamm)
    )
    if (label.size === 0) continue
    let gleich = 0
    for (const wort of eingabe) if (label.has(wort)) gleich++
    // Nennt die Eingabe ein Thema, das auf der Schaltfläche nicht steht, ist
    // sie kein Klick darauf. Testlauf vom 23.09.2026: "was kann ich hier im
    // Ort essen" teilte "kann" und "hier" mit "Was kann ich hier
    // unternehmen?" und landete in der Bedarfsklärung statt beim Essen.
    const mehr = [...eingabe].some(
      (wort) => !label.has(wort) && gehoertZumThema(wort)
    )
    if (mehr) continue
    if (
      gleich >= 2 ||
      (gleich === 1 && gleich === label.size && eingabe.size <= 2)
    ) {
      return chip.to
    }
  }

  return null
}

/**
 * Der nächste weiterführende Knoten unter der aktuellen Antwort.
 *
 * Genommen wird die erste Schaltfläche, die weder ins Menü noch auf den
 * Themeneinstieg zurückführt: das sind die beiden, die jeder Knoten am Ende
 * trägt, und beide wären als Antwort auf ein "erzähl mehr" eine Enttäuschung.
 */
function naechsterSchritt(kontext: Kontext): string | null {
  for (const chip of kontext.chips) {
    if (chip.to === "menu" || chip.to === "start") continue
    if (chip.to === kontext.topic) continue
    if (chip.to === kontext.knoten) continue
    return chip.to
  }
  return null
}

/**
 * Beantwortet eine Wegfrage, wenn sich ein Ziel dazu finden lässt.
 *
 * Drei Quellen, in dieser Reihenfolge: das Ziel in der Frage selbst, das
 * zuletzt behandelte Ziel, und die gerade vorgeschlagenen. Findet sich keins,
 * gibt die Funktion null zurück und der Durchlauf geht weiter. Das ist
 * wichtig, denn "wie komme ich nach Ruhpolding" ist auch eine Wegfrage, meint
 * aber die Anreise und kein Ziel im Ort.
 */
function zurNavigation(roh: string, kontext: Kontext): MatchResult | null {
  if (!NAVIGATION.test(roh)) return null

  const genannt = findeZielImText(roh)
  if (genannt)
    return { kind: "hit", to: `ziel:${genannt}`, grund: "navigation" }

  // "Navigiere mich da hin" nennt kein Ziel, sondern setzt es voraus.
  if (kontext.ziel) {
    return { kind: "hit", to: `ziel:${kontext.ziel}`, grund: "navigation" }
  }

  // Stehen mehrere zur Auswahl, ist die Frage nach dem Weg mehrdeutig. Dann
  // wird gefragt, statt eines der drei zu greifen.
  if (kontext.angebot.length > 1) {
    return {
      kind: "ambiguous",
      candidates: kontext.angebot.slice(0, 3).map((id) => ({
        label: ZIELE.find((eintrag) => eintrag.id === id)?.name ?? id,
        to: `ziel:${id}`,
      })),
      term: null,
    }
  }
  if (kontext.angebot.length === 1) {
    return {
      kind: "hit",
      to: `ziel:${kontext.angebot[0]}`,
      grund: "navigation",
    }
  }

  // Ohne jeden Anhaltspunkt: nur wenn ausdrücklich nach dem Code gefragt
  // wurde, sonst soll das Themenlexikon seine Chance bekommen.
  if (NUR_QR.test(roh)) {
    return { kind: "hit", to: "qr-hinweis", grund: "navigation" }
  }

  return null
}

/**
 * Ist die Nennung eines Fernziels als Fahrfrage gemeint?
 *
 * Drei Fälle sprechen dafür. Der erste ist die ausgesprochene Frage nach dem
 * Weg oder dem Fahrplan. Der zweite ist die Ellipse nach einer Fahrplan-
 * auskunft: auf eine Tabelle nach Traunstein folgt "und nach Salzburg", und
 * dort steht kein einziges Fragewort mehr. Der dritte ist die bloße Nennung
 * ohne konkurrierendes Thema, denn ein Ort zwei Landkreise weiter wird nur
 * genannt, wenn jemand hinwill.
 *
 * Bleibt daneben ein Thema stark, gewinnt das Thema: "Biathlon" schlägt jede
 * Ortsnennung, weil die Frage dann nicht vom Fahren handelt.
 */
function willFahren(roh: string, kontext: Kontext, spitze: number): boolean {
  if (FAHRPLANFRAGE.test(roh) || NAVIGATION.test(roh)) return true
  if (kontext.knoten?.startsWith("fahrplan:")) return true
  return spitze < SCHWELLE
}

/* ------------------------------------------------------------------ *
 * Bedarfsklärung, Zettel und Hinweise
 * ------------------------------------------------------------------ */

/**
 * Eine freie Antwort, während die Bedarfsklärung läuft.
 *
 * Sie darf mehrere Fragen auf einmal beantworten. Findet sich darin nichts
 * zum Bedarf, geht der Durchlauf normal weiter: wer mitten in der Klärung
 * nach der Toilette fragt, bekommt die Antwort auf diese Frage.
 */
function zurBedarfsklaerung(roh: string, kontext: Kontext): MatchResult | null {
  if (!kontext.knoten?.startsWith("bedarf:")) return null
  const bisher = dekodiere(kontext.knoten.slice(7))

  if (GLEICH_ZEIGEN.test(roh)) {
    return {
      kind: "hit",
      to: `vorschlag:${kodiere(bisher)}:0`,
      grund: "bedarf",
    }
  }

  const offen = naechsteFrage(bisher)
  if (offen && UEBERSPRINGEN.test(roh)) {
    return {
      kind: "hit",
      to: `bedarf:${kodiere(ergaenze(bisher, { [offen]: "x" } as Profil))}`,
      grund: "bedarf",
    }
  }

  const neu = bedarfAusText(roh)
  // Was schon feststeht, überschreibt eine Nebenbemerkung nicht: "Berge"
  // in "wir sind nur heute in den Bergen" soll das Interesse nicht ändern,
  // wenn es schon "Kultur" war.
  const nurNeues = Object.fromEntries(
    Object.entries(neu).filter(
      ([schluessel]) => !bisher[schluessel as keyof Profil] || schluessel === offen
    )
  ) as Profil
  // Findet die Bedarfserkennung nichts, hilft das Themenlexikon bei der
  // offenen Frage nach dem Interesse. Sonst verlässt eine Antwort wie
  // "spazierengehen" die Klärung und landet im Themeneinstieg.
  if (Object.keys(nurNeues).length === 0 && offen === "i") {
    const thema = themenstaende(bewerte(roh))[0]
    const interesse: Record<string, Profil["i"]> = {
      wandern: "berge",
      familie: "familie",
      winter: "berge",
    }
    if (thema && thema.punkte >= SCHWELLE && interesse[thema.topic]) {
      nurNeues.i = interesse[thema.topic]
    }
  }
  if (Object.keys(nurNeues).length === 0) return null

  return {
    kind: "hit",
    to: `bedarf:${kodiere(ergaenze(bisher, nurNeues))}`,
    grund: "bedarf",
  }
}

const DRUCKEN = /\b(aus)?druck\w*\b|\bprint\w*\b/
const MAILEN =
  /\bper (e ?)?mail\b|\b(schick|send|mail)\w*\b[^]*\b(mir|uns|me|us)\b|\bby e ?mail\b|\bemail me\b/
const MERKEN =
  /\bmerk\w*\b|\bnotier\w*\b|\baufschreib\w*\b|\bschreib\w* (mir |uns )?(das |es )?auf\b|\bauf (den|meinen) zettel\b|\bwrite (it|that) down\b|\badd (it|that|this) to my notes\b/
const ZETTEL = /\bzettel\b|\bmy notes\b/

/**
 * Wünsche rund um den Zettel.
 *
 * "Druck mir das aus" meint das, was gerade auf dem Schirm steht. Ist das
 * merkbar und noch nicht darauf, legt use-chat.ts es vor dem Druck dazu.
 * "Merk dir das" gilt für jede Antwort, die auch den Merken-Knopf trägt.
 */
function zumZettel(roh: string, kontext: Kontext): string | null {
  if (MERKEN.test(roh)) {
    return merkbarerKnoten(kontext.knoten)
      ? `zettel:neu:${kontext.knoten}`
      : "zettel:zeigen"
  }
  if (DRUCKEN.test(roh)) return "zettel:drucken"
  if (MAILEN.test(roh)) return "zettel:mail"
  if (ZETTEL.test(roh)) return "zettel:zeigen"
  return null
}

/** Die Frage nach Neuigkeiten, Sperrungen und aktuellen Hinweisen. */
const HINWEISE =
  /\baktuell\w*\b[^]*\b(hinweis\w*|meldung\w*|info\w*|neuigkeit\w*|lage)\b|\bhinweise\b|\bsperrung\w*\b|\bgesperrt\b|\bneuigkeit\w*\b|\bwas gibt es neues\b|\bnews\b|\bclosures?\b|\bnotices?\b/

const DIGITAL =
  /\bdigital\w*\b|\bhandy\b|\bsmartphone\b|\btelefon\b|\bqr\b|\bpdf\b|\bscan\w*\b|\bonline\b|\bphone\b|\bdownload\w*\b/
/**
 * Gedruckt, auch mit Tippfehler: "ausgedruck" blieb im Testlauf vom
 * 23.09.2026 ohne Treffer.
 */
const GEDRUCKT =
  /\bgedruck\w*\b|\bausgedruck\w*\b|\bausdruck\w*\b|\bdruck\w*\b|\bpapier\w*\b|\bphysisch\w*\b|\bschriftlich\w*\b|\bin der hand\b|\bzum mitnehmen\b|\banalog\w*\b|\bprint\w*\b|\bpaper\b/
const FLYERWORT =
  /\bflyer\w*\b|\bflier\w*\b|\bprospekt\w*\b|\bbroschuer\w*\b|\bfaltblatt\b|\bheft\w*\b|\bleaflet\w*\b|\bbrochure\w*\b/

/**
 * Wünsche zum Flyer, im Flyerdialog und außerhalb.
 *
 * Im Flyerdialog genügt ein Wort ("gedruckt", "digital"), auch wenn der Gast
 * nach der digitalen Ausgabe doch noch den gedruckten will. Außerhalb muss
 * das Wort "Flyer" fallen. Welcher gemeint ist, sagt der zuletzt angebotene;
 * gibt es keinen, zeigt der Prototyp die Auswahl.
 */
function zumFlyer(roh: string, kontext: Kontext): string | null {
  const imDialog =
    Boolean(kontext.knoten?.startsWith("flyer")) ||
    kontext.knoten === "dienst:ortsplan"
  const erwaehnt = FLYERWORT.test(roh)
  const genannt = flyerImText(roh, imDialog || erwaehnt)
  if (!imDialog && !erwaehnt) return null

  const form = GEDRUCKT.test(roh)
    ? "gedruckt"
    : DIGITAL.test(roh)
      ? "digital"
      : null

  // 1. Ein Flyer beim Namen, auch mit Tippfehler: "Ortplan".
  if (genannt) return form ? `flyer:${genannt}:${form}` : `flyer:${genannt}`

  // 2. Die Frage nach der Auswahl gewinnt gegen den gemerkten Flyer.
  //    "welche flyer gibt es" und "nein, ich will einen anderen" führten im
  //    Testlauf vom 23.09.2026 immer wieder zum Ortsplan.
  if (FLYER_AUSWAHL.test(roh)) return "flyer-liste"

  // 3. Nur die Form: gilt für den zuletzt angebotenen Flyer.
  const id = kontext.flyer
  if (id && form) return `flyer:${id}:${form}`
  if (id && erwaehnt) return `flyer:${id}`
  if (erwaehnt) return "flyer-liste"
  return null
}

/**
 * Die Seite auf ruhpolding.de, auch getippt: "die Website bitte", "lieber
 * online". Steht eine Web-Schaltfläche zur Auswahl, gilt sie. Sonst nur bei
 * einem eindeutigen Wort wie "Website", und dann die Seite zum laufenden
 * Thema, soweit es eine gibt.
 */
const WEBWORT =
  /\bweb\w*\b|\binternet\w*\b|\bonline\b|\bhomepage\b|\bruhpolding de\b|\blink\w*\b|\bseite\b/
const WEBWORT_EINDEUTIG =
  /\bwebsite\b|\bwebseite\w*\b|\binternetseite\w*\b|\bhomepage\b|\bruhpolding de\b/

function zurWebsite(roh: string, kontext: Kontext): string | null {
  const angeboten = kontext.chips.find((chip) => chip.to.startsWith("web:"))
  if (angeboten && WEBWORT.test(roh)) return angeboten.to
  if (!WEBWORT_EINDEUTIG.test(roh)) return null
  const seite = kontext.topic ? THEMA_WEB[kontext.topic] : undefined
  return seite ? `web:${seite}` : null
}

/** Die Bitte um eine Auswahl statt um den gemerkten Flyer. */
const FLYER_AUSWAHL =
  /\bwelche\w*\b|\bander\w*\b|\balle\b|\bweitere\w*\b|\bnoch (mehr|einen|was)\b|\bgibt es\b|\bgibts\b|\bauswahl\b|\bliste\b|\bwhich\b|\bother\b|\ball\b/

/**
 * Welcher Flyer beim Namen genannt wird. Mit Vertipper-Toleranz, denn im
 * Testlauf blieb "Ortplan" ohne Treffer.
 *
 * `offen` erlaubt auch allgemeine Wörter wie "Rad" oder "Gipfel". Das gilt
 * nur, wenn ohnehin von Flyern die Rede ist; sonst wäre jede Frage nach
 * einer Radtour eine Frage nach dem Radflyer.
 */
const FLYER_NAMEN: [string, string[], string[]][] = [
  ["ortsplan", ["ortsplan", "ortskarte", "stadtplan"], ["plan", "karte", "orientierung"]],
  ["almsommer", ["almsommer", "almflyer", "almenflyer"], ["alm", "almen", "almhuett", "huett"]],
  ["rad", ["radflyer", "fahrradflyer", "mountainbikeflyer", "radtouren"], ["rad", "fahrrad", "radl", "bike", "mountainbike", "mtb"]],
  ["gipfel", ["gipfelflyer", "gipfeltouren", "gipfeltour"], ["gipfel", "berg", "bergtour", "summit"]],
  ["wandern", ["wanderflyer", "wanderwege", "spazierwege"], ["wander", "wanderung", "spazier", "spaziergang", "walk"]],
]

function flyerImText(roh: string, offen: boolean): string | null {
  const woerter = roh.split(" ").filter(Boolean)
  const staemme = woerter.map(stamm)
  for (const [id, eindeutig, allgemein] of FLYER_NAMEN) {
    // Eindeutige Namen mit Vertipper-Toleranz, verglichen am ungekürzten
    // Wort: die Stammbildung macht aus "ortplan" sonst "ortpla".
    const vertippt = eindeutig.some((name) =>
      woerter.some((wort) => {
        const grenze = toleranz(Math.max(wort.length, name.length))
        return grenze > 0 && abstand(wort, name, grenze) <= grenze
      })
    )
    if (vertippt || eindeutig.some((name) => trifft(name, woerter, staemme, 1))) {
      return id
    }
    // Allgemeine Wörter nur exakt: mit Toleranz würde "andere" zu "wander".
    if (offen && allgemein.some((wort) => trifft(wort, woerter, staemme, 1))) {
      return id
    }
  }
  return null
}

const RADWUNSCH =
  /\bradfahren\b|\brad fahren\b|\bradeln\b|\bradtour\w*\b|\bfahrradtour\w*\b|\bfahrrad fahren\b|\bmountainbik\w*\b|\bbiken\b|\bcycling\b|\bbike (ride|tour)\w*\b/
