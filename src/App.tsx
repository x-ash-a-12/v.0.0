import { ChatView } from "@/components/chat/chat-view"
import { DevicePreview } from "@/components/device-preview"
import { HinweisDialog } from "@/components/hinweis-dialog"

export function App() {
  return (
    <DevicePreview>
      {/*
       * Der Hinweis deckt das simulierte Gerät ab, nicht die Vorschauleiste
       * darüber. Er gehört zum Rahmen des Tests und nicht zum System, das
       * getestet wird, steht aber vor jeder Eingabe.
       */}
      <HinweisDialog />
      <ChatView />
    </DevicePreview>
  )
}

export default App
