/**
 * @gina/types — Shared TypeScript Types Across All GinaService Platform
 * مركز أنواع البيانات المشتركة عبر كامل المنصة
 */

// =============================================
// PLATFORM CORE ENTITIES
// =============================================

export interface GinaUser {
  id: string;
  uid: string;               // Firebase UID
  email: string;
  phone?: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  tier: UserTier;
  status: UserStatus;
  kyc: KYCRecord;
  wallet: WalletSummary;
  metadata: UserMetadata;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  MERCHANT = 'merchant',
  DEVELOPER = 'developer',
  USER = 'user',
  GUEST = 'guest',
}

export enum UserTier {
  FREE = 'free',
  STARTER = 'starter',
  PRO = 'pro',
  ENTERPRISE = 'enterprise',
  CUSTOM = 'custom',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
  BANNED = 'banned',
}

export interface KYCRecord {
  status: KYCStatus;
  level: KYCLevel;
  verifiedAt?: Date;
  expiresAt?: Date;
  documents: KYCDocument[];
  rejectionReason?: string;
}

export enum KYCStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum KYCLevel {
  NONE = 0,
  BASIC = 1,     // email + phone
  STANDARD = 2,  // ID document
  ENHANCED = 3,  // ID + selfie + address
  FULL = 4,      // full AML/KYC suite
}

export interface KYCDocument {
  type: 'passport' | 'national_id' | 'drivers_license' | 'utility_bill' | 'bank_statement';
  url: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: Date;
}

export interface WalletSummary {
  id: string;
  balances: Record<Currency, number>;
  frozenBalances: Record<Currency, number>;
  tier: WalletTier;
  isActive: boolean;
}

export enum WalletTier {
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise',
}

export interface UserMetadata {
  locale: string;
  timezone: string;
  currency: Currency;
  country: string;
  referralCode?: string;
  referredBy?: string;
  tags: string[];
  flags: Record<string, boolean>;
}

// =============================================
// GINA PAY TYPES
// =============================================

export enum Currency {
  USD = 'USD', EUR = 'EUR', GBP = 'GBP',
  SAR = 'SAR', AED = 'AED', EGP = 'EGP',
  BTC = 'BTC', ETH = 'ETH', USDT = 'USDT',
  USDC = 'USDC', BNB = 'BNB',
}

export enum PaymentMethod {
  CARD = 'card',
  BANK_TRANSFER = 'bank_transfer',
  GINA_WALLET = 'gina_wallet',
  CRYPTO = 'crypto',
  APPLE_PAY = 'apple_pay',
  GOOGLE_PAY = 'google_pay',
  PAYPAL = 'paypal',
  STRIPE = 'stripe',
}

export enum TransactionStatus {
  INITIATED = 'initiated',
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
  ON_HOLD = 'on_hold',
}

export enum TransactionType {
  PAYMENT = 'payment',
  REFUND = 'refund',
  TRANSFER = 'transfer',
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  FEE = 'fee',
  REWARD = 'reward',
}

export interface GinaTransaction {
  id: string;
  referenceId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: Currency;
  method: PaymentMethod;
  senderId?: string;
  recipientId?: string;
  merchantId?: string;
  description: string;
  fees: TransactionFees;
  metadata: Record<string, unknown>;
  ipAddress?: string;
  deviceFingerprint?: string;
  riskScore: number;           // 0-100
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  auditTrail: AuditEntry[];
}

export interface TransactionFees {
  processingFee: number;
  platformFee: number;
  networkFee: number;
  exchangeFee: number;
  total: number;
  currency: Currency;
  breakdown: FeeBreakdown[];
}

export interface FeeBreakdown {
  type: string;
  amount: number;
  percentage?: number;
  fixed?: number;
}

export interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  actorType: 'user' | 'system' | 'admin';
  timestamp: Date;
  details: Record<string, unknown>;
  ipAddress?: string;
}

// =============================================
// SERVICE TYPES
// =============================================

export interface GinaService {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: ServiceCategory;
  pricing: ServicePricing;
  features: string[];
  isActive: boolean;
  metadata: Record<string, unknown>;
}

export enum ServiceCategory {
  PAYMENT = 'payment',
  COMMUNICATION = 'communication',
  ANALYTICS = 'analytics',
  AI = 'ai',
  STORAGE = 'storage',
  SECURITY = 'security',
  MARKETPLACE = 'marketplace',
}

export interface ServicePricing {
  model: 'free' | 'freemium' | 'subscription' | 'usage' | 'custom';
  plans: PricingPlan[];
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  currency: Currency;
  interval: 'monthly' | 'yearly' | 'once';
  limits: Record<string, number>;
  features: string[];
}

// =============================================
// API TYPES
// =============================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
  requestId: string;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  stack?: string;
}

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
  orderBy?: string;
  order?: 'asc' | 'desc';
}

export interface FilterParams {
  search?: string;
  status?: string;
  from?: string;
  to?: string;
  [key: string]: string | undefined;
}

// =============================================
// AUTH TYPES
// =============================================

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  scope: string[];
}

export interface AuthSession {
  userId: string;
  sessionId: string;
  deviceId: string;
  ip: string;
  userAgent: string;
  issuedAt: Date;
  expiresAt: Date;
  lastActivityAt: Date;
}

export interface OAuthProvider {
  provider: 'google' | 'apple' | 'github' | 'twitter';
  providerId: string;
  accessToken: string;
  refreshToken?: string;
  profile: Record<string, unknown>;
}

// =============================================
// CHAMELEON SKILLS TYPES
// =============================================

export enum SkillMode {
  STEALTH = 'stealth',
  EXECUTION = 'execution',
  DEFENSIVE = 'defensive',
  LEARNING = 'learning',
  ADAPTIVE = 'adaptive',
}

export enum SkillCategory {
  COGNITIVE = 'cognitive',
  ADAPTIVE = 'adaptive',
  SECURITY = 'security',
  PAYMENT = 'payment',
  INTEGRATION = 'integration',
  ANALYTICS = 'analytics',
}

export interface ChameleonSkill {
  id: string;
  name: string;
  version: string;
  category: SkillCategory;
  mode: SkillMode;
  priority: number;
  description: string;
  author: string;
  tags: string[];
  dependencies: string[];
  config: Record<string, unknown>;
}

export interface SkillExecution {
  skillId: string;
  input: unknown;
  context: ExecutionContext;
  output?: unknown;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  error?: string;
}

export interface ExecutionContext {
  userId: string;
  sessionId: string;
  environment: string;
  locale: string;
  features: Record<string, boolean>;
  metadata: Record<string, unknown>;
}

// =============================================
// NOTIFICATION TYPES
// =============================================

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
  WEBHOOK = 'webhook',
  WHATSAPP = 'whatsapp',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export interface Notification {
  id: string;
  userId: string;
  channel: NotificationChannel;
  priority: NotificationPriority;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  imageUrl?: string;
  actionUrl?: string;
  isRead: boolean;
  readAt?: Date;
  sentAt?: Date;
  createdAt: Date;
}

// =============================================
// EVENTS (Event-Driven Architecture)
// =============================================

export interface DomainEvent<T = unknown> {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  version: number;
  payload: T;
  metadata: EventMetadata;
  occurredAt: Date;
}

export interface EventMetadata {
  correlationId: string;
  causationId?: string;
  userId?: string;
  sessionId?: string;
  ip?: string;
  userAgent?: string;
  traceId: string;
  spanId: string;
}

// Common Domain Events
export type UserRegisteredEvent = DomainEvent<{ userId: string; email: string; tier: UserTier }>;
export type PaymentCompletedEvent = DomainEvent<{ transactionId: string; amount: number; currency: Currency }>;
export type KYCApprovedEvent = DomainEvent<{ userId: string; level: KYCLevel }>;
export type SkillExecutedEvent = DomainEvent<{ skillId: string; userId: string; duration: number }>;
