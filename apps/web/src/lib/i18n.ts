import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

const ar = {
  nav: {
    home: 'الرئيسية', dashboard: 'لوحة التحكم', payments: 'المدفوعات',
    wallet: 'المحفظة', profile: 'الملف الشخصي', settings: 'الإعدادات',
    logout: 'تسجيل الخروج', login: 'تسجيل الدخول', register: 'إنشاء حساب',
  },
  auth: {
    welcome: 'مرحباً بك في جينا', welcomeBack: 'مرحباً بعودتك',
    signIn: 'تسجيل الدخول', signUp: 'إنشاء حساب جديد',
    email: 'البريد الإلكتروني', password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور', fullName: 'الاسم الكامل',
    phone: 'رقم الهاتف', forgotPassword: 'نسيت كلمة المرور؟',
    noAccount: 'ليس لديك حساب؟', hasAccount: 'لديك حساب بالفعل؟',
    orContinueWith: 'أو تابع باستخدام', agreeToTerms: 'أوافق على شروط الخدمة',
  },
  pay: {
    title: 'جينا باي', sendMoney: 'إرسال المال', receiveMoney: 'استلام المال',
    topUp: 'إضافة رصيد', withdraw: 'سحب', balance: 'الرصيد المتاح',
    totalBalance: 'الرصيد الإجمالي', transactions: 'المعاملات',
    recentTransactions: 'المعاملات الأخيرة', amount: 'المبلغ', currency: 'العملة',
    recipient: 'المستلم', fee: 'الرسوم', total: 'المجموع',
    confirm: 'تأكيد الدفع', cancel: 'إلغاء', success: 'تم الدفع بنجاح!',
    failed: 'فشل في الدفع', pending: 'قيد المعالجة',
  },
  dashboard: {
    title: 'لوحة التحكم', overview: 'نظرة عامة',
    totalEarnings: 'إجمالي الأرباح', activeServices: 'الخدمات النشطة',
    quickActions: 'إجراءات سريعة',
  },
  common: {
    loading: 'جارٍ التحميل...', error: 'حدث خطأ', success: 'تمت العملية بنجاح',
    cancel: 'إلغاء', confirm: 'تأكيد', save: 'حفظ', edit: 'تعديل',
    delete: 'حذف', back: 'رجوع', next: 'التالي', search: 'بحث',
    noData: 'لا توجد بيانات', retry: 'إعادة المحاولة', close: 'إغلاق',
    copy: 'نسخ', copied: 'تم النسخ!',
  },
  status: {
    active: 'نشط', inactive: 'غير نشط', pending: 'معلق',
    completed: 'مكتمل', failed: 'فاشل', cancelled: 'ملغى', processing: 'قيد المعالجة',
  },
  errors: {
    required: 'هذا الحقل مطلوب', invalidEmail: 'البريد الإلكتروني غير صحيح',
    passwordTooShort: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل',
    passwordsNotMatch: 'كلمتا المرور غير متطابقتين',
    networkError: 'خطأ في الشبكة، يرجى المحاولة مجدداً',
    insufficientBalance: 'الرصيد غير كافٍ',
  },
}

const en: typeof ar = {
  nav: {
    home: 'Home', dashboard: 'Dashboard', payments: 'Payments',
    wallet: 'Wallet', profile: 'Profile', settings: 'Settings',
    logout: 'Sign Out', login: 'Sign In', register: 'Sign Up',
  },
  auth: {
    welcome: 'Welcome to GINA', welcomeBack: 'Welcome Back',
    signIn: 'Sign In', signUp: 'Create Account',
    email: 'Email', password: 'Password',
    confirmPassword: 'Confirm Password', fullName: 'Full Name',
    phone: 'Phone Number', forgotPassword: 'Forgot Password?',
    noAccount: "Don't have an account?", hasAccount: 'Already have an account?',
    orContinueWith: 'Or continue with', agreeToTerms: 'I agree to the Terms of Service',
  },
  pay: {
    title: 'GinaPay', sendMoney: 'Send Money', receiveMoney: 'Receive Money',
    topUp: 'Top Up', withdraw: 'Withdraw', balance: 'Available Balance',
    totalBalance: 'Total Balance', transactions: 'Transactions',
    recentTransactions: 'Recent Transactions', amount: 'Amount', currency: 'Currency',
    recipient: 'Recipient', fee: 'Fee', total: 'Total',
    confirm: 'Confirm Payment', cancel: 'Cancel', success: 'Payment Successful!',
    failed: 'Payment Failed', pending: 'Processing',
  },
  dashboard: {
    title: 'Dashboard', overview: 'Overview',
    totalEarnings: 'Total Earnings', activeServices: 'Active Services',
    quickActions: 'Quick Actions',
  },
  common: {
    loading: 'Loading...', error: 'An error occurred', success: 'Operation successful',
    cancel: 'Cancel', confirm: 'Confirm', save: 'Save', edit: 'Edit',
    delete: 'Delete', back: 'Back', next: 'Next', search: 'Search',
    noData: 'No data available', retry: 'Retry', close: 'Close',
    copy: 'Copy', copied: 'Copied!',
  },
  status: {
    active: 'Active', inactive: 'Inactive', pending: 'Pending',
    completed: 'Completed', failed: 'Failed', cancelled: 'Cancelled', processing: 'Processing',
  },
  errors: {
    required: 'This field is required', invalidEmail: 'Invalid email address',
    passwordTooShort: 'Password must be at least 8 characters',
    passwordsNotMatch: 'Passwords do not match',
    networkError: 'Network error, please try again',
    insufficientBalance: 'Insufficient balance',
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { ar: { translation: ar }, en: { translation: en } },
    fallbackLng: 'ar',
    defaultNS: 'translation',
    interpolation: { escapeValue: false },
    detection: { order: ['localStorage', 'navigator', 'htmlTag'], caches: ['localStorage'] },
  })

export default i18n
export type SupportedLanguage = 'ar' | 'en'
