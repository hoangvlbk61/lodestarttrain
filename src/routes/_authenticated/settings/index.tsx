import { createFileRoute } from '@tanstack/react-router'
import MessageSettings from '@/features/message-settings'

export const Route = createFileRoute('/_authenticated/settings/')({
  component: MessageSettings,
})
