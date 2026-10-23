import { useAuthStore } from '../../store/auth.store'
import { Link } from '@tanstack/react-router'
export default function WalletPage() {
  const user = useAuthStore(s => s.user)
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-2xl font-bold">المحفظة</h1>
        <div className="mb-6 rounded-2xl bg-gina-gradient p-8 text-white shadow-lg">
          <p className="mb-1 text-sm opacity-80">الرصيد الإجمالي</p>
          <p className="text-4xl font-black">{user?.walletBalance.toFixed(2) ?? '0.00'} <span className="text-xl">{user?.currency ?? 'SAR'}</span></p>
          <div className="mt-6 flex gap-3">
            <Link to="/wallet/send" className="rounded-full bg-white/20 px-6 py-2 text-sm font-semibold backdrop-blur hover:bg-white/30 transition">إرسال</Link>
            <button className="rounded-full bg-white/20 px-6 py-2 text-sm font-semibold backdrop-blur hover:bg-white/30 transition">إضافة رصيد</button>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 font-semibold">المعاملات الأخيرة</h2>
          <p className="text-center py-8 text-muted-foreground">لا توجد معاملات حتى الآن</p>
        </div>
      </div>
    </div>
  )
}
