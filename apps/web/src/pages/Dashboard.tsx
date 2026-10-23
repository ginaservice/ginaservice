import { useAuthStore } from '../store/auth.store'
import { Link } from '@tanstack/react-router'
export default function DashboardPage() {
  const user = useAuthStore(s => s.user)
  if (!user) return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <p className="mb-4">يجب تسجيل الدخول أولاً</p>
        <Link to="/auth/login" className="text-primary underline">تسجيل الدخول</Link>
      </div>
    </div>
  )
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-bold">لوحة التحكم — مرحباً {user.fullName} 👋</h1>
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          {[
            { label: 'الرصيد', value: `${user.walletBalance.toFixed(2)} ${user.currency}`, icon: '💰' },
            { label: 'مستوى التحقق', value: `المستوى ${user.kycLevel}/5`, icon: '✅' },
            { label: 'الباقة', value: user.tier, icon: '⭐' },
            { label: 'كود الإحالة', value: user.referralCode, icon: '🎁' },
          ].map(s => (
            <div key={s.label} className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="mb-2 text-3xl">{s.icon}</div>
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className="text-xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Link to="/wallet/send" className="flex items-center gap-3 rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition">
            <span className="text-3xl">📤</span><div><p className="font-semibold">إرسال المال</p><p className="text-sm text-muted-foreground">GinaPay</p></div>
          </Link>
          <Link to="/wallet" className="flex items-center gap-3 rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition">
            <span className="text-3xl">💳</span><div><p className="font-semibold">المحفظة</p><p className="text-sm text-muted-foreground">رصيدك وتعاملاتك</p></div>
          </Link>
          <Link to="/profile/kyc" className="flex items-center gap-3 rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition">
            <span className="text-3xl">🪪</span><div><p className="font-semibold">التحقق من الهوية</p><p className="text-sm text-muted-foreground">KYC</p></div>
          </Link>
        </div>
      </div>
    </div>
  )
}
