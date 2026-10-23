import { Link } from '@tanstack/react-router'
export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background">
      <div className="text-8xl font-black text-purple-200">404</div>
      <h1 className="text-2xl font-bold">الصفحة غير موجودة</h1>
      <p className="text-muted-foreground">عذراً، لم نتمكن من العثور على هذه الصفحة</p>
      <Link to="/" className="rounded-lg bg-purple-600 px-8 py-3 text-sm font-semibold text-white hover:bg-purple-700">العودة للرئيسية</Link>
    </div>
  )
}
