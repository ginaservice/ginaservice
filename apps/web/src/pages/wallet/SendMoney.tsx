import { useState } from 'react'
const METHODS = [
  { id: 'wallet', label: 'محفظة جينا', fee: '0.5%', icon: '💜', best: true },
  { id: 'card', label: 'بطاقة بنكية', fee: '2.9% + 0.30$', icon: '💳', best: false },
  { id: 'bank', label: 'تحويل بنكي', fee: '1%', icon: '🏦', best: false },
  { id: 'crypto', label: 'عملات مشفرة', fee: '1.5%', icon: '₿', best: false },
]
export default function SendMoneyPage() {
  const [amount, setAmount] = useState('')
  const [recipient, setRecipient] = useState('')
  const [method, setMethod] = useState('wallet')
  const [step, setStep] = useState<'form'|'confirm'|'success'>('form')
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-8 text-2xl font-bold">إرسال المال</h1>
        {step === 'form' && (
          <div className="space-y-5">
            <div><label className="mb-1.5 block text-sm font-medium">المستلم</label><input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="البريد / الهاتف / معرّف جينا" dir="ltr" className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-400"/></div>
            <div><label className="mb-1.5 block text-sm font-medium">المبلغ</label>
              <div className="flex gap-2">
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" dir="ltr" className="flex-1 rounded-lg border px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-purple-400"/>
                <select className="rounded-lg border px-3 text-sm"><option>SAR</option><option>USD</option><option>EUR</option><option>AED</option></select>
              </div>
            </div>
            <div><label className="mb-2 block text-sm font-medium">طريقة الدفع</label>
              <div className="space-y-2">
                {METHODS.map(m => (
                  <button key={m.id} onClick={() => setMethod(m.id)} className={`flex w-full items-center justify-between rounded-xl border p-4 text-sm transition ${method===m.id?'border-purple-500 bg-purple-50':'hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-3"><span className="text-2xl">{m.icon}</span><div className="text-right"><p className="font-medium">{m.label}</p><p className="text-xs text-gray-500">الرسوم: {m.fee}</p></div></div>
                    {m.best && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">الأفضل ✓</span>}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => setStep('confirm')} disabled={!amount||!recipient} className="w-full rounded-lg bg-purple-600 py-3 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50">التالي</button>
          </div>
        )}
        {step === 'confirm' && (
          <div className="rounded-2xl border bg-card p-8 text-center">
            <p className="mb-2 text-lg font-semibold">تأكيد التحويل</p>
            <p className="mb-1 text-3xl font-black">{amount} SAR</p>
            <p className="mb-6 text-gray-500">إلى: {recipient}</p>
            <div className="mb-6 flex justify-between rounded-lg bg-gray-50 p-4 text-sm"><span>الرسوم</span><span>{METHODS.find(m=>m.id===method)?.fee}</span></div>
            <div className="flex gap-3">
              <button onClick={() => setStep('form')} className="flex-1 rounded-lg border py-3 text-sm">رجوع</button>
              <button onClick={() => setStep('success')} className="flex-1 rounded-lg bg-purple-600 py-3 text-sm font-semibold text-white hover:bg-purple-700">تأكيد الدفع</button>
            </div>
          </div>
        )}
        {step === 'success' && (
          <div className="rounded-2xl border bg-card p-12 text-center">
            <div className="mb-4 text-6xl">🎉</div>
            <p className="mb-2 text-xl font-bold text-green-600">تم الدفع بنجاح!</p>
            <p className="mb-6 text-gray-500">تم تحويل {amount} SAR إلى {recipient}</p>
            <button onClick={() => { setStep('form'); setAmount(''); setRecipient('') }} className="rounded-lg bg-purple-600 px-8 py-3 text-sm font-semibold text-white hover:bg-purple-700">تحويل آخر</button>
          </div>
        )}
      </div>
    </div>
  )
}
