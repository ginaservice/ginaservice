import { Link } from '@tanstack/react-router'
export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-gina-gradient px-6 py-32 text-white text-center">
        <h1 className="mb-4 text-6xl font-black">GINA<span className="text-yellow-300">AI</span></h1>
        <p className="mb-2 text-xl opacity-90">منصة الخدمات الذكية والتجارة الرقمية الشاملة</p>
        <p className="mb-10 text-lg opacity-70">سوق GINA MARKET · دفع GinaPay آمن (0.5%) · نواة الحرباء Chameleon AI</p>
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link to="/market" className="rounded-full bg-[#ffd814] px-8 py-4 text-lg font-extrabold text-slate-950 hover:bg-[#f7ca00] shadow-lg">
            🛒 تصفح متجر GINA MARKET
          </Link>
          <Link to="/auth/register" className="rounded-full bg-white px-8 py-4 text-lg font-semibold text-purple-700 hover:bg-white/90">
            ابدأ مجاناً
          </Link>
          <Link to="/auth/login" className="rounded-full border-2 border-white px-8 py-4 text-lg font-semibold text-white hover:bg-white/10">
            تسجيل الدخول
          </Link>
        </div>
      </section>
      <section className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold">لماذا جينا؟</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: '🛒', title: 'سوق GINA MARKET المتكامل', desc: 'منتجات عالمية وخدمات ذكاء اصطناعي بتجربة أمازون المتكاملة' },
              { icon: '💜', title: 'محفظة GinaPay (0.5%)', desc: 'أقل رسوم دفع رقمي مع حماية المشتري وكشف الاحتيال الفوري' },
              { icon: '🦎', title: 'نواة الحرباء Chameleon AI', desc: '5 أوضاع تشغيل ذكية و25+ مهارة سحابية جاهزة للأعمال' },
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
