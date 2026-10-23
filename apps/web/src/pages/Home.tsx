import { Link } from '@tanstack/react-router'
export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gina-gradient px-6 py-32 text-white text-center">
        <h1 className="mb-4 text-6xl font-black">GINA<span className="text-yellow-300">AI</span></h1>
        <p className="mb-2 text-xl opacity-90">منصة الخدمات الذكية الشاملة</p>
        <p className="mb-10 text-lg opacity-70">دفع آمن · خدمات متكاملة · ذكاء اصطناعي متقدم</p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link to="/auth/register" className="rounded-full bg-white px-8 py-4 text-lg font-semibold text-purple-700 hover:bg-white/90">ابدأ مجاناً</Link>
          <Link to="/auth/login" className="rounded-full border-2 border-white px-8 py-4 text-lg font-semibold text-white hover:bg-white/10">تسجيل الدخول</Link>
        </div>
      </section>
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold">لماذا جينا؟</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: '⚡', title: 'سرعة فائقة', desc: 'معالجة المدفوعات في أقل من ثانية' },
              { icon: '🔒', title: 'أمان لا يُضاهى', desc: 'تشفير من طرف إلى طرف' },
              { icon: '🌍', title: 'عالمي', desc: 'دعم 50+ عملة و180+ دولة' },
            ].map(f => (
              <div key={f.title} className="rounded-2xl border bg-card p-8 text-center shadow-sm hover:shadow-md transition">
                <div className="mb-3 text-5xl">{f.icon}</div>
                <h3 className="mb-2 text-xl font-semibold">{f.title}</h3>
                <p className="text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
