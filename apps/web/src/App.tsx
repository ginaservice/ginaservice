import React, { Suspense } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { Toaster } from './components/ui/toaster'
import { routeTree } from './routeTree.gen'
import { useAuthStore } from './store/auth.store'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 min
      retry: (failureCount, error: any) => {
        if (error?.status === 401 || error?.status === 403) return false
        return failureCount < 2
      },
    },
  },
})

const router = createRouter({
  routeTree,
  context: { queryClient },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  )
}

export default function App() {
  return (
    <AppProviders>
      <Suspense fallback={<div className="flex h-screen items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full" /></div>}>
        <RouterProvider router={router} />
      </Suspense>
    </AppProviders>
  )
}
