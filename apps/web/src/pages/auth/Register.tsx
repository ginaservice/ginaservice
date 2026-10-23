import { useState } from 'react'
import { useAuthStore, type RegisterData } from '../../store/auth.store'
import { Link, useNavigate } from '@tanstack/react-router'
export default function RegisterPage() {
  const { register, isLoading, error, clearError } = useAuthStore()
  const navigate = useNavigate()
  const [form, setForm] = useState<RegisterData & { confirmPassword: string }>({ fullName: '', email: '', password: '', confirmPassword: '', language: 'ar' })
  const [agreed, setAgreed] = useState(false)
  const f = (k: keyof typeof form) => ({ value: form[k] || '', onChange: (e: React.ChangeEvent<HTMLInputElement>) => setForm(p => ({ ...p, [k]: e.target.value })) })
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); clearError()
    if (form.password !== form.confirmPassword) return
    try { const { confirmPassword: _, ...data } = form; await register(data); navigate({ to: '/dashboard' }) } catch {}
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-900 to-purple-700 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center"><div className="mb-2 text-5xl font-black text-purple-600">GINA</div><p className="text-sm text-gray-500">إنشاء حساب جديد</p></div>
        {error && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="text" placeholder="الاسم الكامل" required className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-400" {...f('fullName')} />
          <input type="email" placeholder="البريد الإلكتروني" required dir="ltr" className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-400" {...f('email')} />
          <input type="tel" placeholder="رقم الهاتف (اختياري)" dir="ltr" className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-400" {...f('phone')} />
          <input type="password" placeholder="كلمة المرور" required dir="ltr" className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-400" {...f('password')} />
          <input type="password" placeholder="تأكيد كلمة المرور" required dir="ltr" className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-400" {...f('confirmPassword')} />
          <label className="flex items-start gap-2 text-sm cursor-pointer"><input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} required className="mt-0.5"/><span className="text-gray-500">أوافق على شروط الخدمة وسياسة الخصوصية</span></label>
          <button type="submit" disabled={isLoading || !agreed} className="w-full rounded-lg bg-purple-600 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50">{isLoading ? 'جارٍ التحميل...' : 'إنشاء حساب'}</button>
        </form>
        <p className="mt-5 text-center text-sm text-gray-500">لديك حساب؟{' '}<Link to="/auth/login" className="font-semibold text-purple-600 hover:underline">تسجيل الدخول</Link></p>
      </div>
    </div>
  )
}
