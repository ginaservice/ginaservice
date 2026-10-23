/**
 * @gina/config — Shared Platform Configuration, Constants, ESLint & Prettier Presets
 */

export const GINA_PLATFORM_CONFIG = {
  platformName: 'GinaService',
  brandName: 'GINA',
  version: '1.0.0',
  defaultLocale: 'ar' as const,
  supportedLocales: ['ar', 'en'] as const,
  defaultCurrency: 'SAR' as const,
  supportedCurrencies: ['SAR', 'USD', 'EUR', 'AED', 'EGP', 'GBP', 'BTC', 'ETH', 'USDT'] as const,
  referralBonusSAR: 10,

  services: {
    apiGateway:          { name: 'api-gateway',          port: 3000, prefix: '/api/v1' },
    authService:         { name: 'auth-service',         port: 3001, prefix: '/api/v1/auth' },
    userService:         { name: 'user-service',         port: 3002, prefix: '/api/v1/users' },
    ginaPay:             { name: 'gina-pay',             port: 3003, prefix: '/api/v1/pay' },
    notificationService: { name: 'notification-service', port: 3004, prefix: '/api/v1/notifications' },
    analyticsService:    { name: 'analytics-service',    port: 3005, prefix: '/api/v1/analytics' },
    chameleonCore:       { name: 'chameleon-core',       port: 3006, prefix: '/api/v1/chameleon' },
  },

  kycLimitsSAR: {
    0: { daily: 1_000,   monthly: 3_000,     labelAr: 'غير مفعّل',    labelEn: 'Unverified' },
    1: { daily: 10_000,  monthly: 30_000,    labelAr: 'تحقق أساسي',   labelEn: 'Basic' },
    2: { daily: 50_000,  monthly: 200_000,   labelAr: 'تحقق متوسط',   labelEn: 'Intermediate' },
    3: { daily: 200_000, monthly: 1_000_000, labelAr: 'تحقق متقدم',   labelEn: 'Advanced' },
    4: { daily: -1,      monthly: -1,        labelAr: 'تحقق مؤسسي',   labelEn: 'Institutional' },
    5: { daily: -1,      monthly: -1,        labelAr: 'تحقق كامل',    labelEn: 'Full Verification' },
  },

  chameleonModes: ['stealth', 'execution', 'defensive', 'learning', 'adaptive'] as const,

  resilience: {
    circuitBreakerFailureThreshold: 5,
    circuitBreakerResetTimeoutMs: 30_000,
    rateLimitPerMinute: 200,
    jwtAccessTtlSeconds: 900,
    jwtRefreshTtlSeconds: 604_800,
  },
} as const

export const eslintPreset = {
  parser: '@typescript-eslint/parser',
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
  env: { node: true, browser: true, es2022: true },
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
  },
}

export const prettierPreset = {
  semi: false,
  singleQuote: true,
  trailingComma: 'es5' as const,
  printWidth: 100,
  tabWidth: 2,
}

export default GINA_PLATFORM_CONFIG
