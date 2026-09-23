/**
 * Zipfel unten links an der Blase, neben der der Avatar steht
 * (agent-avatar.tsx). Er macht die Blase zu seiner Sprechblase. Genutzt von
 * message-item.tsx, streaming-bubble.tsx und typing-indicator.tsx, damit die
 * Blase beim Fertigwerden nicht springt.
 */
export const zipfel =
  "relative rounded-bl-none before:absolute before:bottom-0 before:-left-[7px] before:h-3.5 before:w-2 before:bg-muted before:[clip-path:polygon(100%_0,100%_100%,0_100%)]"
