import * as React from "react"
import { Moon, Sun } from "lucide-react"

import { useTheme } from "@/components/theme-provider"
import { Button } from "@/components/ui/button"

function prefersDark() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  )
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [systemDark, setSystemDark] = React.useState(prefersDark)

  React.useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const handler = () => setSystemDark(media.matches)
    media.addEventListener("change", handler)
    return () => media.removeEventListener("change", handler)
  }, [])

  const isDark = theme === "dark" || (theme === "system" && systemDark)

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Farbmodus wechseln"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun /> : <Moon />}
    </Button>
  )
}
