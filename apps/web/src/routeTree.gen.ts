// GinaService Route Tree — Manual TanStack Router routes
import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'

const HomePage = lazy(() => import('./pages/Home'))
const DashboardPage = lazy(() => import('./pages/Dashboard'))
const LoginPage = lazy(() => import('./pages/auth/Login'))
const RegisterPage = lazy(() => import('./pages/auth/Register'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPassword'))
const WalletPage = lazy(() => import('./pages/wallet/Wallet'))
const SendMoneyPage = lazy(() => import('./pages/wallet/SendMoney'))
const TransactionsPage = lazy(() => import('./pages/wallet/Transactions'))
const ProfilePage = lazy(() => import('./pages/profile/Profile'))
const KycPage = lazy(() => import('./pages/profile/Kyc'))
const SettingsPage = lazy(() => import('./pages/settings/Settings'))
const NotFoundPage = lazy(() => import('./pages/NotFound'))

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  )
}

function withSuspense(C: React.LazyExoticComponent<() => JSX.Element>) {
  return () => <Suspense fallback={<PageLoader />}><C /></Suspense>
}

export const rootRoute = createRootRoute({ component: () => <Outlet /> })

const routeTree = rootRoute.addChildren([
  createRoute({ getParentRoute: () => rootRoute, path: '/', component: withSuspense(HomePage) }),
  createRoute({ getParentRoute: () => rootRoute, path: '/dashboard', component: withSuspense(DashboardPage) }),
  createRoute({ getParentRoute: () => rootRoute, path: '/auth/login', component: withSuspense(LoginPage) }),
  createRoute({ getParentRoute: () => rootRoute, path: '/auth/register', component: withSuspense(RegisterPage) }),
  createRoute({ getParentRoute: () => rootRoute, path: '/auth/forgot-password', component: withSuspense(ForgotPasswordPage) }),
  createRoute({ getParentRoute: () => rootRoute, path: '/wallet', component: withSuspense(WalletPage) }),
  createRoute({ getParentRoute: () => rootRoute, path: '/wallet/send', component: withSuspense(SendMoneyPage) }),
  createRoute({ getParentRoute: () => rootRoute, path: '/wallet/transactions', component: withSuspense(TransactionsPage) }),
  createRoute({ getParentRoute: () => rootRoute, path: '/profile', component: withSuspense(ProfilePage) }),
  createRoute({ getParentRoute: () => rootRoute, path: '/profile/kyc', component: withSuspense(KycPage) }),
  createRoute({ getParentRoute: () => rootRoute, path: '/settings', component: withSuspense(SettingsPage) }),
  createRoute({ getParentRoute: () => rootRoute, path: '*', component: withSuspense(NotFoundPage) }),
])

export const router = createRouter({ routeTree, defaultPreload: 'intent' })

declare module '@tanstack/react-router' {
  interface Register { router: typeof router }
}

export default router
