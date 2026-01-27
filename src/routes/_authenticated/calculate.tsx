import { createFileRoute } from '@tanstack/react-router'
import Calculate from '@/features/calculate'

export const Route = createFileRoute('/_authenticated/calculate')({
  component: Calculate,
})
