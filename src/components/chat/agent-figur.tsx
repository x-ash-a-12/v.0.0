import { cn } from "@/lib/utils"

/**
 * Die Figur des TI-Agenten, gezeichnet für den Avatar (agent-avatar.tsx).
 *
 * Dr. Matjan unterscheidet den TI-Agenten vom Chatbot zuerst über einen
 * Avatar mit Persönlichkeit, "eher ein bisschen karikaturhaft, wie einen
 * Cartoon-Agenten" (M [00:17:03]). Mori empfiehlt, den ersten Gipfel der
 * Kurve anzupeilen, also mäßige Menschenähnlichkeit (Mori 2012, S. 100).
 * Deshalb eine Zeichnung mit kindlichen Proportionen: großer Kopf, kleine
 * Nase, flache Farben. Verglichen wurden am 23.09.2026 eine Linienfigur, eine
 * Holzfigur und diese Illustration. Der Autor hat die Illustration gewählt.
 */
export type AgentZustand = "wartet" | "denkt"

type AgentFigurProps = {
  /**
   * "wartet" blinzelt gelegentlich, "denkt" neigt den Kopf und schaut zur
   * Seite, solange die Antwort gesucht wird. Mehr Bewegung gibt es bewusst
   * nicht: Bewegung vertieft das Tal, und verlangsamte Mimik kippt ins
   * Unheimliche (Mori 2012, S. 99 f.). Deshalb auch kein Mund, der zum Text
   * spricht. Ohne Zustand steht die Figur still.
   */
  zustand?: AgentZustand
  className?: string
  style?: React.CSSProperties
}

export function AgentFigur({ zustand, className, style }: AgentFigurProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      aria-hidden="true"
      data-zustand={zustand}
      className={cn("block", className)}
      style={style}
    >
      <path d="M9 64c2-11 11-16 23-16s21 5 23 16z" fill="#4f7d5a" />
      <path d="M26 48l6 6 6-6z" fill="#f4efe6" />
      {/*
       * Namensschild wie beim Personal am Schalter. Es zeigt die Rolle,
       * "virtuelle KI-Mitarbeiterin der Tourist-Info" (M [00:10:33]), ohne
       * Logo, weil der Prototyp nicht von Ruhpolding Tourismus stammt.
       */}
      <g>
        <rect
          x="37"
          y="51.5"
          width="9.5"
          height="4.6"
          rx="0.9"
          fill="#f7f4ec"
          stroke="#3d6647"
          strokeWidth="0.35"
        />
        <circle cx="39.1" cy="53.8" r="1.15" fill="#3d6647" />
        <path
          d="M39.1 53.4v1.2M39.1 52.95v.05"
          stroke="#f7f4ec"
          strokeWidth="0.35"
          strokeLinecap="round"
        />
        <text
          x="40.7"
          y="54.65"
          fontSize="2.1"
          fontWeight="700"
          fontFamily="Geist Variable, sans-serif"
          fill="#2f4f38"
        >
          Info
        </text>
      </g>
      <g className="avatar-kopf">
        <rect x="28" y="40" width="8" height="9" rx="3" fill="#e9b894" />
        <ellipse cx="18.5" cy="31" rx="2.5" ry="3.2" fill="#e9b894" />
        <ellipse cx="45.5" cy="31" rx="2.5" ry="3.2" fill="#e9b894" />
        <ellipse cx="32" cy="29" rx="13.5" ry="14.5" fill="#f1c7a5" />
        <path
          d="M18 28c-1-10 6-16 14-16 9 0 15 6 14 16-3-5-8-8-14-8-4 0-7 1-9 3-2 1-4 3-5 5z"
          fill="#5a3a26"
        />
        <path
          d="M23.5 25.5c1.5-1 3.5-1 5 0M35.5 25.5c1.5-1 3.5-1 5 0"
          fill="none"
          stroke="#5a3a26"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <g className="avatar-augen">
          <ellipse cx="26" cy="30" rx="2.8" ry="3" fill="#ffffff" />
          <ellipse cx="38" cy="30" rx="2.8" ry="3" fill="#ffffff" />
          <g className="avatar-blick">
            <circle cx="26.4" cy="30.4" r="1.6" fill="#2b2b2b" />
            <circle cx="38.4" cy="30.4" r="1.6" fill="#2b2b2b" />
          </g>
        </g>
        <path
          d="M32 32.5v2.5"
          fill="none"
          stroke="#d39a78"
          strokeWidth="1.3"
          strokeLinecap="round"
        />
        <path
          d="M28 37.5c2.4 2.2 5.6 2.2 8 0"
          fill="none"
          stroke="#8a4b3a"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}
