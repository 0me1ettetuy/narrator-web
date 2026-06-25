import { LoginPage } from '@/pages/_public/login'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_public/login')({
  component: LoginPage,
})
