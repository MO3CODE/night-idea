# 🧠 MindBase

مساحة فريق ذكية — محادثة AI مع ذاكرة، خاصة ومشتركة.

## المتطلبات
- Node.js 20.9+
- حساب Supabase (مجاني)
- حساب OpenRouter (مجاني)
- حساب Vercel (مجاني)

---

## خطوات الإعداد

### 1. Supabase
1. سجّل على [supabase.com](https://supabase.com) وأنشئ مشروعاً جديداً
2. اذهب إلى **SQL Editor** والصق محتوى `supabase-schema.sql` واضغط Run
   - إذا سبق أن شغّلت نسخة أقدم من المخطط، أعد تشغيل الملف لتطبيق سياسات الوصول المحدّثة.
3. من **Settings → API** احفظ:
   - `Project URL`
   - `anon public` key

### 2. OpenRouter
1. سجّل على [openrouter.ai](https://openrouter.ai)
2. اذهب إلى **Keys** وأنشئ مفتاحاً جديداً
3. احفظ المفتاح

### 3. التشغيل المحلي
```bash
# انسخ المشروع
git clone <your-repo>
cd mindbase

# ثبّت المكتبات
npm install

# أنشئ ملف البيئة
cp .env.local.example .env.local
# عدّل .env.local وأضف مفاتيحك

# شغّل المشروع
npm run dev
```

### 4. النشر على Vercel
1. ارفع الكود على GitHub
2. اذهب إلى [vercel.com](https://vercel.com) → Import Project
3. في **Environment Variables** أضف:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENROUTER_API_KEY`
4. اضغط Deploy ✅

---

## الميزات
- ✅ تسجيل دخول بالبريد وكلمة المرور
- ✅ محادثات خاصة لكل مستخدم
- ✅ غرف مشتركة للفريق
- ✅ ذاكرة كاملة (يتذكر كل المحادثة)
- ✅ يعمل بموجّه النماذج المجانية في OpenRouter
- ✅ واجهة عربية كاملة

## تغيير النموذج
في `lib/openrouter.ts` غيّر:
```ts
model = 'openrouter/free'
// أو إلى أي نموذج متاح من openrouter.ai/models
```
