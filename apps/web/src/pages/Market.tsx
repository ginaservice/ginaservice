/**
 * GINA MARKET — Amazon-Grade Digital Commerce & Services Marketplace Page
 * Exact Amazon Layout: Top Header (#131921), 3-Part Search Bar, Sub-Nav (#232f3e),
 * Non-Overlapping 4-Column Category Quad Cards, Sidebar Filters, Prime & GinaPay Cards,
 * and Integrated GinaPay Checkout Drawer (0.5% GinaWallet Best Rate).
 */

import { useState, useMemo } from 'react'
import { Link } from '@tanstack/react-router'

export interface MarketItem {
  id: string
  type: 'product' | 'service'
  category: 'ai-services' | 'electronics' | 'cloud-saas' | 'freelance' | 'smart-home'
  title: string
  badge: string
  badgeColor: string
  icon: string
  bgTone: string
  price: number
  oldPrice: number
  rating: number
  reviews: number
  soldLastMonth: string
  prime: boolean
  deliveryText: string
  specs: string[]
}

const MARKET_ITEMS: MarketItem[] = [
  {
    id: 'gm-1',
    type: 'service',
    category: 'ai-services',
    title: 'حزمة نواة الحرباء Chameleon AI Enterprise — أتمتة ذكية بـ 5 أوضاع تشغيل و25 مهارة',
    badge: 'الأكثر مبيعاً #1',
    badgeColor: 'bg-[#e47911] text-white',
    icon: '🦎',
    bgTone: 'bg-purple-50',
    price: 499,
    oldPrice: 899,
    rating: 4.9,
    reviews: 3420,
    soldLastMonth: '+2,100 اشتراك هذا الشهر',
    prime: true,
    deliveryText: 'تفعيل سحابي فوري خلال ثوانٍ',
    specs: ['5 أوضاع: Stealth, Execution, Defensive, Learning, Adaptive', 'ربط مباشر عبر @gina/sdk', 'حماية ومراقبة على مدار الساعة'],
  },
  {
    id: 'gm-2',
    type: 'product',
    category: 'electronics',
    title: 'حاسوب محمول احترافي للمطورين والذكاء الاصطناعي — معالج M3 Max، ذاكرة 64GB، شاشة 16 بوصة',
    badge: "اختيار جينا Gina's Choice",
    badgeColor: 'bg-[#232f3e] text-white',
    icon: '💻',
    bgTone: 'bg-slate-100',
    price: 8499,
    oldPrice: 9699,
    rating: 4.9,
    reviews: 1290,
    soldLastMonth: '+600 تم شراؤها الشهر الماضي',
    prime: true,
    deliveryText: 'توصيل مجاني غداً إلى الرياض',
    specs: ['معالج فائق السرعة لتدريب نماذج الذكاء الاصطناعي', 'ضمان رسمي لمدة سنتين', 'تقسيط بسعر الكاش عبر GinaPay'],
  },
  {
    id: 'gm-3',
    type: 'service',
    category: 'cloud-saas',
    title: 'بوابة الدفع المؤسسية GinaPay Merchant API — ربط متجرك مع 7 طرق دفع ورسوم 0.5%',
    badge: 'أفضل قيمة',
    badgeColor: 'bg-emerald-600 text-white',
    icon: '💜',
    bgTone: 'bg-fuchsia-50',
    price: 199,
    oldPrice: 399,
    rating: 5.0,
    reviews: 4150,
    soldLastMonth: '+3,800 متجر مشترك',
    prime: true,
    deliveryText: 'تفعيل مفتاح API فوري',
    specs: ['محرك كشف الاحتيال بالذكاء الاصطناعي (0-100)', 'دعم SAR, USD, EUR, AED, BTC, USDT', 'سجل تدقيق موقع بتشفير HMAC-SHA256'],
  },
  {
    id: 'gm-4',
    type: 'product',
    category: 'electronics',
    title: 'هاتف ذكي رائد 5G — سعة 512GB، كاميرا احترافية 200MP، شاشة AMOLED 120Hz',
    badge: 'عرض محدود -18%',
    badgeColor: 'bg-[#cc0c39] text-white',
    icon: '📱',
    bgTone: 'bg-blue-50',
    price: 3899,
    oldPrice: 4750,
    rating: 4.8,
    reviews: 2890,
    soldLastMonth: '+1,900 تم شراؤها الشهر الماضي',
    prime: true,
    deliveryText: 'توصيل مجاني بنفس اليوم',
    specs: ['يدعم الدفع اللاتلامسي GinaPay NFC', 'بطارية 5000mAh مع شحن فائق 100W', 'مقاوم للماء والغبار IP68'],
  },
  {
    id: 'gm-5',
    type: 'service',
    category: 'freelance',
    title: 'خدمة بناء منصة ويب متكاملة بمواصفات أمازون وLovable (React 18 + Fastify + Docker)',
    badge: 'خدمة معتمدة PRO',
    badgeColor: 'bg-indigo-700 text-white',
    icon: '🚀',
    bgTone: 'bg-indigo-50',
    price: 2450,
    oldPrice: 3500,
    rating: 4.9,
    reviews: 640,
    soldLastMonth: '+180 مشروع مكتمل',
    prime: true,
    deliveryText: 'تسليم الكود المصدري عبر GitHub',
    specs: ['مونو-ريبو Turborepo + pnpm متكامل', 'دعم كامل للغتين العربية والإنجليزية RTL/LTR', 'ضمان جودة الكود عبر أنبوب CI/CD'],
  },
  {
    id: 'gm-6',
    type: 'product',
    category: 'electronics',
    title: 'سماعة رأس لاسلكية عازلة للضوضاء ANC Pro — صوت محيطي، بطارية 40 ساعة للمؤتمرات',
    badge: 'الأكثر مبيعاً',
    badgeColor: 'bg-[#e47911] text-white',
    icon: '🎧',
    bgTone: 'bg-amber-50',
    price: 749,
    oldPrice: 1099,
    rating: 4.7,
    reviews: 5120,
    soldLastMonth: '+4,200 تم شراؤها الشهر الماضي',
    prime: true,
    deliveryText: 'توصيل مجاني غداً',
    specs: ['عزل ذكي للضجيج بالذكاء الاصطناعي', 'ميكروفون مزدوج عالي النقاء', 'اقتران فوري متعدد الأجهزة'],
  },
  {
    id: 'gm-7',
    type: 'service',
    category: 'cloud-saas',
    title: 'إعداد بنية سحابية AWS EKS + RDS Multi-AZ + Prometheus & Grafana جاهزة للإنتاج',
    badge: 'اختيار المهندسين',
    badgeColor: 'bg-[#232f3e] text-white',
    icon: '☁️',
    bgTone: 'bg-cyan-50',
    price: 1290,
    oldPrice: 1850,
    rating: 4.9,
    reviews: 490,
    soldLastMonth: '+310 عملية نشر سحابية',
    prime: true,
    deliveryText: 'تنفيذ فوري عبر قوالب Terraform وHelm',
    specs: ['توازن أحمال تلقائي Auto-Scaling', 'نسخ احتياطي مشفر Multi-AZ', 'لوحات مراقبة وتنبيهات لحظية'],
  },
  {
    id: 'gm-8',
    type: 'product',
    category: 'smart-home',
    title: 'شاشة مكتبية منحنية 34 بوصة UltraWide 4K — دقة ألوان 99% sRGB ومنفذ USB-C 90W',
    badge: 'خصم حصري',
    badgeColor: 'bg-[#cc0c39] text-white',
    icon: '🖥️',
    bgTone: 'bg-emerald-50',
    price: 1699,
    oldPrice: 2199,
    rating: 4.8,
    reviews: 980,
    soldLastMonth: '+750 تم شراؤها الشهر الماضي',
    prime: true,
    deliveryText: 'توصيل مجاني خلال 24 ساعة',
    specs: ['مثالية لغرف العمليات ولوحات تحكم GinaService', 'معدل تحديث 144Hz سلس', 'حامل هيدروليكي قابل للتعديل'],
  },
]

export default function MarketPage() {
  const [category, setCategory] = useState<string>('all')
  const [itemType, setItemType] = useState<'all' | 'product' | 'service'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured')
  const [cart, setCart] = useState<Array<{ id: string; qty: number }>>([
    { id: 'gm-1', qty: 1 },
    { id: 'gm-3', qty: 1 },
  ])
  const [cartOpen, setCartOpen] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'bank' | 'crypto' | 'card'>('wallet')
  const [checkoutSuccess, setCheckoutSuccess] = useState(false)

  const filteredItems = useMemo(() => {
    const list = MARKET_ITEMS.filter((item) => {
      if (category !== 'all' && item.category !== category) return false
      if (itemType !== 'all' && item.type !== itemType) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        if (!item.title.toLowerCase().includes(q) && !item.category.toLowerCase().includes(q)) return false
      }
      return true
    })

    if (sortBy === 'price-asc') list.sort((a, b) => a.price - b.price)
    if (sortBy === 'price-desc') list.sort((a, b) => b.price - a.price)
    if (sortBy === 'rating') list.sort((a, b) => b.rating - a.rating)
    return list
  }, [category, itemType, searchQuery, sortBy])

  const totalCartQty = cart.reduce((acc, c) => acc + c.qty, 0)
  const subtotal = cart.reduce((acc, c) => {
    const item = MARKET_ITEMS.find((i) => i.id === c.id)
    return acc + (item ? item.price * c.qty : 0)
  }, 0)

  const feeRates: Record<typeof paymentMethod, number> = {
    wallet: 0.005,
    bank: 0.01,
    crypto: 0.015,
    card: 0.029,
  }
  const feeAmount = subtotal * feeRates[paymentMethod]
  const grandTotal = subtotal + feeAmount

  const addToCart = (id: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === id)
      if (existing) return prev.map((c) => (c.id === id ? { ...c, qty: c.qty + 1 } : c))
      return [...prev, { id, qty: 1 }]
    })
    setCartOpen(true)
  }

  return (
    <div dir="rtl" className="min-h-screen flex flex-col bg-[#e3e6e6] text-[#0f1111]">
      {/* 1. Amazon Primary Top Header (#131921) */}
      <header className="bg-[#131921] text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-[1600px] mx-auto px-3 py-2 flex items-center justify-between gap-2 flex-wrap lg:flex-nowrap">
          {/* Logo */}
          <Link to="/market" className="flex flex-col items-start justify-center py-1 px-2 border border-transparent hover:border-white rounded">
            <div className="flex items-baseline gap-1 leading-none">
              <span className="text-xl md:text-2xl font-black text-white">GINA</span>
              <span className="text-lg md:text-xl font-extrabold text-[#ff9900]">MARKET</span>
              <span className="text-xs text-gray-300 font-semibold">.sa</span>
            </div>
            <span className="text-xs text-[#ff9900] font-bold">من أ إلى ي · للتجارة والخدمات</span>
          </Link>

          {/* Deliver To */}
          <div className="hidden sm:flex items-center gap-1.5 text-xs px-2 py-1 border border-transparent hover:border-white rounded">
            <span>📍</span>
            <div className="leading-tight">
              <div className="text-gray-300 text-xs">التوصيل إلى</div>
              <div className="font-bold text-white text-xs md:text-sm">الرياض 11564 🇸🇦</div>
            </div>
          </div>

          {/* 3-Part Integrated Search Bar */}
          <div className="order-last lg:order-none w-full lg:flex-1 flex h-10 rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-[#ff9900] bg-white">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-[#e6e6e6] text-[#0f1111] text-xs font-medium px-2.5 border-e border-gray-300 outline-none shrink-0"
            >
              <option value="all">الكل</option>
              <option value="ai-services">خدمات جينا الذكية</option>
              <option value="electronics">الإلكترونيات</option>
              <option value="cloud-saas">البرمجيات والسحابة</option>
              <option value="freelance">أعمال وخدمات B2B</option>
              <option value="smart-home">الأجهزة الذكية</option>
            </select>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث في GINA MARKET عن منتجات، خدمات ذكاء اصطناعي، أو حلول سحابية..."
              className="flex-1 px-3 text-sm text-[#0f1111] bg-white outline-none min-w-0"
            />
            <button className="bg-[#febd69] hover:bg-[#f3a847] text-[#131921] px-4 flex items-center justify-center shrink-0 font-bold">
              🔍
            </button>
          </div>

          {/* Right Cluster */}
          <div className="flex items-center gap-2">
            <Link to="/wallet/send" className="hidden xl:flex items-center gap-2 bg-purple-900/70 border border-fuchsia-400/40 rounded-md px-2.5 py-1 text-xs">
              <span>💜</span>
              <div>
                <div className="text-fuchsia-200 font-bold">GinaWallet (0.5%)</div>
                <div className="text-amber-300 font-black">24,850.50 ر.س</div>
              </div>
            </Link>

            <Link to="/dashboard" className="hidden md:flex flex-col leading-tight px-2 py-1 border border-transparent hover:border-white rounded">
              <span className="text-xs text-gray-300">مرحباً، الحساب</span>
              <span className="text-xs font-bold">لوحة التحكم وKYC</span>
            </Link>

            <button
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 border border-transparent hover:border-white rounded relative"
            >
              <span className="text-2xl">🛒</span>
              <span className="bg-[#f08804] text-[#131921] font-extrabold text-xs px-1.5 py-0.5 rounded-full">
                {totalCartQty}
              </span>
              <span className="hidden sm:inline text-xs font-bold">العربة</span>
            </button>
          </div>
        </div>

        {/* 2. Amazon Secondary Sub-Nav (#232f3e) */}
        <nav className="bg-[#232f3e] text-white text-xs md:text-sm border-t border-white/10">
          <div className="max-w-[1600px] mx-auto px-3 h-10 flex items-center gap-3 overflow-x-auto whitespace-nowrap">
            <button onClick={() => { setCategory('all'); setItemType('all') }} className="font-bold hover:text-amber-300">☰ الكل</button>
            <button onClick={() => setCategory('all')} className="hover:text-amber-300">🔥 عروض اليوم</button>
            <button onClick={() => setCategory('ai-services')} className="text-amber-300 font-semibold">🦎 متجر مهارات الحرباء AI</button>
            <button onClick={() => setCategory('cloud-saas')} className="hover:text-amber-300">☁️ الخدمات السحابية</button>
            <button onClick={() => setCategory('electronics')} className="hover:text-amber-300">💻 الإلكترونيات</button>
            <button onClick={() => setCategory('freelance')} className="hover:text-amber-300">🤝 خدمات الشركات B2B</button>
            <Link to="/wallet" className="text-fuchsia-300 font-semibold">💜 محفظة GinaPay (0.5%)</Link>
          </div>
        </nav>
      </header>

      {/* 3. Hero Banner + Non-Overlapping 4-Column Quad Cards */}
      <section className="max-w-[1600px] w-full mx-auto relative">
        <div className="relative pt-6 pb-28 md:pb-32 px-6 md:px-14 bg-gradient-to-br from-[#1a103c] via-[#3b0764] to-[#0f172a] text-white">
          <div className="max-w-4xl space-y-3">
            <span className="inline-block bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full">
              ⚡ مهرجان GINA MARKET الكبير
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black">
              منتجات عالمية وخدمات ذكاء اصطناعي فورية في منصة واحدة
            </h1>
            <p className="text-sm md:text-base text-gray-200">
              وفّر حتى 40% على الإلكترونيات وخدمات Chameleon AI السحابية — وادفع عبر محفظة GinaWallet برسوم 0.5% فقط.
            </p>
          </div>
        </div>

        {/* 4 Quad Cards */}
        <div className="px-4 -mt-20 relative z-20 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { title: 'خدمات جينا الذكية (AI & Cloud)', cat: 'ai-services', icons: ['🦎', '🤖', '☁️', '🛡️'] },
            { title: 'الإلكترونيات والأجهزة الاحترافية', cat: 'electronics', icons: ['💻', '📱', '🎧', '🖥️'] },
            { title: 'خدمات الأعمال والبرمجة B2B', cat: 'freelance', icons: ['⚡', '🎨', '📊', '🚀'] },
            { title: 'مزايا الدفع عبر GinaPay (0.5%)', cat: 'cloud-saas', icons: ['💜', '💳', '🏦', '₿'] },
          ].map((quad) => (
            <div key={quad.title} className="bg-white rounded-lg p-5 shadow-sm border border-gray-200 flex flex-col justify-between">
              <div>
                <h2 className="text-base font-bold mb-3">{quad.title}</h2>
                <div className="grid grid-cols-2 gap-2.5">
                  {quad.icons.map((ic, idx) => (
                    <div
                      key={idx}
                      onClick={() => setCategory(quad.cat)}
                      className="h-20 rounded-md bg-gray-50 border border-gray-200 flex items-center justify-center text-3xl cursor-pointer hover:bg-purple-50 transition"
                    >
                      {ic}
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={() => setCategory(quad.cat)} className="mt-3 text-xs font-semibold text-[#007185] hover:text-[#c45500] text-start">
                استكشف القسم ←
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Main Catalog Grid + Sidebar Filters */}
      <main className="max-w-[1600px] w-full mx-auto px-4 my-6 flex-1">
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          {/* Sidebar */}
          <aside className="w-full lg:w-60 shrink-0 bg-white rounded-lg p-4 shadow-sm border border-gray-200 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <span className="font-bold text-sm">تصفية النتائج</span>
              <button onClick={() => { setCategory('all'); setItemType('all'); setSearchQuery('') }} className="text-[#007185] hover:underline">
                إعادة ضبط
              </button>
            </div>
            <div className="space-y-1.5">
              <div className="font-bold text-gray-700 mb-1">نوع العنصر</div>
              {(['all', 'product', 'service'] as const).map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" checked={itemType === t} onChange={() => setItemType(t)} />
                  <span>{t === 'all' ? 'الكل (منتجات + خدمات)' : t === 'product' ? '📦 منتجات مادية' : '⚡ خدمات رقمية وAI'}</span>
                </label>
              ))}
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1 w-full">
            <div className="bg-white rounded-lg px-4 py-3 mb-4 shadow-sm border border-gray-200 flex items-center justify-between flex-wrap gap-2 text-xs">
              <span>عرض <b>{filteredItems.length}</b> نتيجة في <b>GINA MARKET</b></span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="border border-gray-300 rounded px-2.5 py-1 bg-gray-50"
              >
                <option value="featured">الأكثر تميزاً</option>
                <option value="price-asc">السعر: من الأقل إلى الأعلى</option>
                <option value="price-desc">السعر: من الأعلى إلى الأقل</option>
                <option value="rating">الأعلى تقييماً</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
              {filteredItems.map((item) => {
                const discount = Math.round((1 - item.price / item.oldPrice) * 100)
                return (
                  <article key={item.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden flex flex-col justify-between hover:shadow-lg transition">
                    <div>
                      <div className={`h-44 ${item.bgTone} flex items-center justify-center text-6xl relative`}>
                        <span>{item.icon}</span>
                        <span className={`absolute top-2.5 start-2.5 ${item.badgeColor} text-xs font-bold px-2.5 py-0.5 rounded`}>
                          {item.badge}
                        </span>
                      </div>
                      <div className="p-4">
                        <h3 className="text-sm font-semibold line-clamp-2">{item.title}</h3>
                        <div className="flex items-center gap-1 mt-1.5 text-xs">
                          <span className="text-[#ffa41c] font-bold">★★★★★</span>
                          <span className="font-bold">{item.rating}</span>
                          <span className="text-[#007185]">({item.reviews})</span>
                        </div>
                        <div className="mt-2 flex items-baseline gap-2">
                          <span className="bg-[#cc0c39] text-white text-xs font-bold px-1.5 py-0.5 rounded">-{discount}%</span>
                          <span className="text-2xl font-black">{item.price.toLocaleString()} <small className="text-xs">ر.س</small></span>
                          <span className="text-xs text-gray-500 line-through">{item.oldPrice.toLocaleString()} ر.س</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-700">
                          <span className="font-black text-[#00a8e1]">⚡prime</span> {item.deliveryText}
                        </div>
                        <div className="mt-1 inline-block bg-purple-50 text-purple-800 border border-purple-200 px-2 py-0.5 rounded text-xs font-medium">
                          💜 GinaWallet: رسوم 0.5% فقط
                        </div>
                      </div>
                    </div>
                    <div className="px-4 pb-4 space-y-2">
                      <button
                        onClick={() => addToCart(item.id)}
                        className="w-full bg-[#ffd814] hover:bg-[#f7ca00] text-[#0f1111] text-xs font-bold py-2 rounded-full"
                      >
                        إضافة إلى العربة
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Cart & GinaPay Checkout Drawer */}
      {cartOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-end">
          <aside className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl">
            <div className="bg-[#131921] text-white px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">🛒 عربة تسوق GINA MARKET</h3>
              <button onClick={() => setCartOpen(false)} className="text-lg font-bold">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.map((c) => {
                const prod = MARKET_ITEMS.find((i) => i.id === c.id)
                if (!prod) return null
                return (
                  <div key={c.id} className="flex gap-3 border rounded-lg p-3">
                    <div className={`w-14 h-14 rounded ${prod.bgTone} flex items-center justify-center text-2xl`}>{prod.icon}</div>
                    <div className="flex-1 text-xs">
                      <p className="font-bold">{prod.title}</p>
                      <p className="text-[#b12704] font-extrabold mt-1">{(prod.price * c.qty).toLocaleString()} ر.س (الكمية: {c.qty})</p>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="border-t bg-gray-50 p-4 space-y-3 text-xs">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
                className="w-full border border-purple-300 rounded px-2.5 py-2 bg-white"
              >
                <option value="wallet">محفظة GinaWallet — رسوم 0.5% فقط (الأفضل ⭐)</option>
                <option value="bank">تحويل بنكي — رسوم 1.0%</option>
                <option value="crypto">عملات رقمية — رسوم 1.5%</option>
                <option value="card">بطاقة بنكية — رسوم 2.9%</option>
              </select>
              <div className="flex justify-between"><span>المجموع الفرعي:</span><b>{subtotal.toFixed(2)} ر.س</b></div>
              <div className="flex justify-between text-emerald-700"><span>رسوم GinaPay:</span><b>{feeAmount.toFixed(2)} ر.س</b></div>
              <div className="flex justify-between text-sm font-black border-t pt-2"><span>الإجمالي:</span><span className="text-[#b12704]">{grandTotal.toFixed(2)} ر.س</span></div>
              <button
                onClick={() => setCheckoutSuccess(true)}
                className="w-full bg-[#ffd814] hover:bg-[#f7ca00] font-bold py-2.5 rounded-full"
              >
                تأكيد الطلب والدفع عبر GinaPay
              </button>
              {checkoutSuccess && (
                <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-2 rounded text-center font-bold">
                  ✅ تم تنفيذ الطلب بنجاح عبر GinaPay!
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
