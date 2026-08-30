import * as React from "react"
import { Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type ChatComposerProps = {
  onSend: (text: string) => void
}

export function ChatComposer({ onSend }: ChatComposerProps) {
  const [value, setValue] = React.useState("")

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const text = value.trim()
    if (!text) return
    onSend(text)
    setValue("")
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <Input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Frage eingeben …"
        aria-label="Nachricht an den Assistenten"
        enterKeyHint="send"
        autoComplete="off"
        className="h-10 flex-1 rounded-full px-4"
      />
      <Button
        type="submit"
        size="icon"
        aria-label="Senden"
        disabled={value.trim().length === 0}
        className="size-10 shrink-0 rounded-full"
      >
        <Send />
      </Button>
    </form>
  )
}
