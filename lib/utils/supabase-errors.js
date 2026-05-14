export function getSupabaseErrorMessage(error, fallback = 'حصل خطأ غير متوقع') {
  const message = error?.message || ''

  if (message.includes('permission denied for table')) {
    return 'صلاحيات قاعدة البيانات ناقصة. شغّل ملف إصلاح الصلاحيات من لوحة قاعدة البيانات.'
  }

  if (message.includes('new row violates row-level security policy')) {
    return 'قاعدة الحماية رفضت العملية. اتأكد إنك مسجل دخول وإن البيانات مربوطة بحسابك.'
  }

  if (message.includes('JWT') || message.includes('Auth session missing')) {
    return 'الجلسة انتهت. سجل دخول تاني وجرب.'
  }

  return message || fallback
}
