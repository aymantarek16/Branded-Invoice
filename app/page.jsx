import Link from 'next/link'
import {
  ArrowLeft,
  FileText,
  FolderKanban,
  LayoutDashboard,
  LogIn,
  Palette,
  Plus,
  ReceiptText,
  Users,
} from 'lucide-react'

const actions = [
  {
    icon: ReceiptText,
    title: 'إنشاء فاتورة',
    text: 'أضف العميل والبنود واعرض المعاينة فورًا.',
  },
  {
    icon: Users,
    title: 'نظّم العملاء',
    text: 'احفظ بيانات العملاء واستخدمها في أي فاتورة.',
  },
  {
    icon: FolderKanban,
    title: 'احفظ المنتجات',
    text: 'سجّل الخدمات والأسعار التي تستخدمها كثيرًا.',
  },
  {
    icon: Palette,
    title: 'اختر التصميم',
    text: 'بدّل بين أكثر من تصميم للفاتورة حسب طبيعة عملك.',
  },
]

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded-2xl bg-lime-300 text-slate-950">
        <FileText className="h-5 w-5" />
      </div>
      <div>
        <p className="text-lg font-black leading-none">فاتورتي</p>
        <p className="mt-1 text-xs text-slate-400">Branded Invoice</p>
      </div>
    </Link>
  )
}

export default function HomePage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#071018] text-white">
      <header className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />

        <div className="flex items-center gap-2">
          {/* <Link
            href="/login"
            className="hidden items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm font-bold text-white/80 hover:bg-white/10 sm:inline-flex"
          >
            <LogIn className="h-4 w-4" />
            دخول
          </Link> */}
          {/* <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-2xl bg-lime-300 px-5 py-3 text-sm font-black text-slate-950 hover:bg-lime-200"
          >
            <Plus className="h-4 w-4" />
            حساب جديد
          </Link> */}
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-10 px-4 pb-16 pt-10 sm:px-6 lg:grid-cols-[1fr_.85fr] lg:items-center lg:pt-20">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-4 py-2 text-sm font-bold text-slate-300">
            <LayoutDashboard className="h-4 w-4 text-lime-300" />
            لوحة بسيطة لإدارة الفواتير
          </div>

          <h1 className="max-w-3xl text-5xl font-black leading-tight sm:text-6xl">
            أنشئ فواتيرك بسرعة وبشكل منظم.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            ادخل إلى حسابك، عدّل بيانات البراند، أضف العملاء والبنود، وصدّر الفاتورة PDF أو PNG.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {/* <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-lime-300 px-7 py-4 text-base font-black text-slate-950 hover:bg-lime-200"
            >
              ابدأ الآن
              <ArrowLeft className="h-5 w-5" />
            </Link> */}
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 px-7 py-4 text-base font-bold text-white/85 hover:bg-white/10"
            >
            تسجيل دخول بحساب ديمو
            </Link>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/10 bg-white/[.05] p-4">
          <div className="rounded-[1.5rem] bg-white p-6 text-slate-950">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-5">
              <div>
                <p className="text-sm font-bold text-slate-500">فاتورة</p>
                <h2 className="mt-1 text-3xl font-black">INV-2026-0001</h2>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-950 text-white">
                <ReceiptText className="h-6 w-6" />
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {[
                ['العميل', 'شركة النيل'],
                ['التاريخ', '١٢ مايو ٢٠٢٦'],
                ['الإجمالي', '١٣,٠٠٠ ج.م'],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between rounded-2xl bg-slate-100 px-4 py-3">
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className="font-black">{value}</span>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-2xl bg-slate-950 p-4 text-white">
              <p className="text-sm text-white/60">الخطوة التالية</p>
              <p className="mt-1 font-black">صدّر PDF أو PNG</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {actions.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-white/10 bg-white/[.04] p-5"
            >
              <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-lime-300 text-slate-950">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black">{item.title}</h3>
              <p className="mt-2 leading-7 text-slate-400">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
