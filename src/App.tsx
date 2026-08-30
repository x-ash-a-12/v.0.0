import { ChatView } from "@/components/chat/chat-view"
import { DevicePreview } from "@/components/device-preview"

export function App() {
  return (
    <DevicePreview>
      <ChatView />
    </DevicePreview>
  )
}

export default App
