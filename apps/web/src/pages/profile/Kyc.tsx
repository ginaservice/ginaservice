export default function KycPage() {
  const levels = [
    { level: 1, title: 'تحقق أساسي', desc: 'البريد الإلكتروني + الهاتف', status: 'completed' },
    { level: 2, title: 'تحقق متوسط', desc: 'هوية وطنية / جواز سفر', status: 'pending' },
    { level: 3, title: 'تحقق متقدم', desc: 'صورة شخصية + إثبات عنوان', status: 'locked' },
    { level: 4, title: 'تحقق مؤسسي', desc: 'وثائق الشركة', status: 'locked' },
    { level: 5, title: 'تحقق كامل', desc: 'مراجعة يدوية', status: 'locked' },
  ]
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-2xl font-bold">التحقق من الهوية (KYC)</h1>
        <p className="mb-8 text-sm text-gray-500">ارفع مستوى التحقق للحصول على حدود معاملات أعلى</p>
        <div className="space-y-4">
          {levels.map(l => (
            <div key={l.level} className={`rounded-xl border p-6 transition ${l.status==='completed'?'border-green-300 bg-green-50':l.status==='pending'?'border-yellow-300 bg-yellow-50':'opacity-60 bg-gray-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">المستوى {l.level}: {l.title}</p>
                  <p className="text-sm text-gray-500">{l.desc}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{l.status==='completed'?'✅':l.status==='pending'?'⏳':'🔒'}</span>
                  {l.status==='pending'&&<button className="rounded-lg bg-yellow-500 px-4 py-2 text-xs font-semibold text-white hover:bg-yellow-600">رفع المستندات</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
