import { createFileRoute } from '@tanstack/react-router'
import PushDataPage from '@/features/pushData'

export const Route = createFileRoute('/_authenticated/push-data')({
  component: PushDataPage,
})
