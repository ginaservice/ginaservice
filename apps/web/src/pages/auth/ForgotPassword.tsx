import { useState } from 'react'
import { Link } from '@tanstack/react-router'
export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-900 to-purple-700 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center"><div className="mb-2 text-5xl font-black text-purple-600">GINA</div></div>
        {sent ? (
          <div className="text-center"><div className="mb-4 text-5xl">📧</div><p className="mb-2 font-semibold">تم إرسال رابط إعادة التعيين</p><p className="mb-6 text-sm text-gray-500">تحقق من بريدك الإلكتروني</p><Link to="/auth/login" className="text-purple-600 hover:underline text-sm">العودة لتسجيل الدخول</Link></div>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); setSent(true) }} className="space-y-4">
            <p className="text-center font-semibold">نسيت كلمة المرور؟</p>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="البريد الإلكتروني" required dir="ltr" className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-400"/>
            <button type="submit" className="w-full rounded-lg bg-purple-600 py-3 text-sm font-semibold text-white hover:bg-purple-700">إرسال رابط إعادة التعيين</button>
            <Link to="/auth/login" className="block text-center text-sm text-purple-600 hover:underline">رجوع</Link>
          </form>
        )}
      </div>
    </div>
  )
}
