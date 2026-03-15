import { createFileRoute, redirect } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context, location, ...rest }) => {
    // Truy cập trực tiếp auth state từ context của router
    // @ts-ignore (Giả định context có chứa auth)
    console.log("🚀 ~ context:", context)
    if (!context?.auth?.isAuthenticated) {
      const cAuth = context.auth;
      if (!cAuth.token)
        throw redirect({
          to: '/sign-in',
          search: { redirect: location.href },
        })
      const response = await cAuth.loadUser()
      if (!response) throw redirect({
        to: '/sign-in',
        search: { redirect: location.href },
      })
    }
  },
  component: AuthenticatedLayout,
})