import { useAuthStore } from '../../store/auth.store'
export default function ProfilePage() {
  const user = useAuthStore(s => s.user)
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-8 text-2xl font-bold">الملف الشخصي</h1>
        {user && (
          <div className="rounded-xl border bg-card p-8 space-y-4">
            <div className="mb-6 flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center text-2xl font-bold text-purple-600">{user.fullName.charAt(0)}</div>
              <div><p className="text-xl font-bold">{user.fullName}</p><p className="text-sm text-gray-500">{user.email}</p></div>
            </div>
            {[['الهاتف', user.phone || '—'], ['مستوى KYC', `${user.kycLevel}/5`], ['الباقة', user.tier], ['الرصيد', `${user.walletBalance} ${user.currency}`], ['كود الإحالة', user.referralCode]].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b pb-3 last:border-0">
                <span className="text-sm font-medium text-gray-600">{k}</span>
                <span className="text-sm font-semibold">{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
