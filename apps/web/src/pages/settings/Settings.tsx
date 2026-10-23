import { useState } from 'react'
import { useAuthStore } from '../../store/auth.store'
export default function SettingsPage() {
  const { logout } = useAuthStore()
  const [lang, setLang] = useState<'ar'|'en'>('ar')
  const changeLang = (l: 'ar'|'en') => {
    setLang(l)
    document.documentElement.dir = l==='ar'?'rtl':'ltr'
    document.documentElement.lang = l
    localStorage.setItem('i18nextLng', l)
  }
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        <h1 className="text-2xl font-bold">الإعدادات</h1>
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 font-semibold">اللغة</h2>
          <div className="flex gap-3">
            {([['ar','العربية'],['en','English']] as const).map(([code,label]) => (
              <button key={code} onClick={() => changeLang(code)} className={`rounded-lg px-6 py-2 text-sm font-medium transition ${lang===code?'bg-purple-600 text-white':'border hover:bg-gray-50'}`}>{label}</button>
            ))}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 font-semibold text-red-600">الحساب</h2>
          <button onClick={() => logout()} className="rounded-lg border border-red-300 px-6 py-2 text-sm text-red-600 hover:bg-red-50 transition">تسجيل الخروج</button>
        </div>
      </div>
    </div>
  )
}
