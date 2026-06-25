import { createFileRoute } from '@tanstack/react-router'
import { PublicLayout } from '@/pages/_public/_layout'

export const Route = createFileRoute('/_public')({
  component: PublicLayout,
})

