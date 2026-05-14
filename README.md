# Branded Invoice

نظام عربي لإدارة وإنشاء وطباعة الفواتير باسم البراند أو المحل. يدعم حفظ الفواتير والعملاء والمنتجات، ومعاينة الفاتورة، وتصديرها PDF/PNG أو طباعتها.

> ملاحظة مهمة: هذا النظام لإدارة وطباعة الفواتير بصيغ PDF/PNG/Print، وليس تكاملًا رسميًا مع منظومة الفاتورة الإلكترونية لمصلحة الضرائب المصرية.

## المتطلبات

- Node.js `20.9.0` أو أحدث
- حساب Supabase
- npm

## التقنيات

- Next.js 16 App Router
- React 19
- Tailwind CSS
- Supabase Auth + Database + Storage
- Radix UI
- jsPDF + html2canvas للتصدير

## Environment Variables

اعمل ملف `.env.local` في جذر المشروع:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Supabase SQL

1. افتح Supabase Dashboard.
2. ادخل على SQL Editor.
3. انسخ وشغّل محتوى الملف:

```text
supabase/schema.sql
```

الملف ينشئ الجداول، RLS policies، triggers، constraints، وسياسات Storage الخاصة بـ `brand-assets`.

## Storage Bucket

الـ schema يحاول إنشاء bucket باسم:

```text
brand-assets
```

لو هتعمله يدويًا من Supabase Storage:

- الاسم: `brand-assets`
- Public: `false`
- ارفع ملفات كل مستخدم داخل فولدر يبدأ بـ user id الخاص به.

## التشغيل محليًا

```bash
npm install
npm run dev
```

افتح:

```text
http://localhost:3000
```

## Production Build

```bash
npm run build
npm run start
```

## Deploy to Vercel

1. ارفع المشروع على GitHub.
2. اربطه بـ Vercel.
3. أضف نفس env vars في Vercel Project Settings.
4. شغّل Supabase SQL في مشروع Supabase.
5. Deploy.

## Flow الاختبار

راجع المسار ده بعد أي تعديل كبير:

```text
Register/Login → Brand Settings → Client → Product → Create Invoice → Save → View → Duplicate → Export PDF → Export PNG → Print
```

## ملاحظات

- تصدير PDF/PNG والطباعة يتم من صفحة تفاصيل الفاتورة لأنها تحتوي على preview حقيقي.
- زر Duplicate ينسخ الفاتورة والبنود المرتبطة بها، ويولّد رقم فاتورة جديد، والحالة تكون `draft`.
- كل مستخدم يشوف ويعدل بياناته فقط حسب RLS.
