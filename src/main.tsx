import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { Zugang } from "@/components/zugang.tsx"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <Zugang>
        <App />
      </Zugang>
    </ThemeProvider>
  </StrictMode>
)
