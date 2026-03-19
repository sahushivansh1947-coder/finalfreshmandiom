/**
 * MSG91 OTP Service Type Definitions
 * TypeScript interfaces and types for MSG91 integration
 */

// ============================================
// MSG91 Callback Types
// ============================================

export type MSG91SuccessCallback = (data?: any) => void;
export type MSG91ErrorCallback = (error?: any) => void;

// ============================================
// MSG91 Channels
// ============================================

export const MSG91_CHANNEL_SMS = '11' as const;
export const MSG91_CHANNEL_VOICE = '4' as const;
export const MSG91_CHANNEL_EMAIL = '3' as const;
export const MSG91_CHANNEL_WHATSAPP = '12' as const;

export type MSG91Channel = 
  | typeof MSG91_CHANNEL_SMS 
  | typeof MSG91_CHANNEL_VOICE 
  | typeof MSG91_CHANNEL_EMAIL 
  | typeof MSG91_CHANNEL_WHATSAPP 
  | null;

export interface MSG91ChannelMap {
  SMS: typeof MSG91_CHANNEL_SMS;
  VOICE: typeof MSG91_CHANNEL_VOICE;
  EMAIL: typeof MSG91_CHANNEL_EMAIL;
  WHATSAPP: typeof MSG91_CHANNEL_WHATSAPP;
}

// ============================================
// MSG91 Configuration
// ============================================

export interface MSG91Configuration {
  /**
   * Template ID for OTP messages
   */
  templateId?: string;

  /**
   * Enable/disable method exposure on window
   */
  exposeMethods?: boolean;

  /**
   * Success callback for OTP verification
   */
  success?: (data: any) => void;

  /**
   * Failure callback for OTP verification
   */
  failure?: (error: any) => void;

  /**
   * Custom configuration options
   */
  [key: string]: any;
}

// ============================================
// MSG91 Service Interface
// ============================================

export interface MSG91Service {
  /**
   * Check if MSG91 is available
   */
  isAvailable(): boolean;

  /**
   * Send OTP to identifier
   */
  sendOtp(identifier: string): Promise<any>;

  /**
   * Verify OTP
   */
  verifyOtp(otp: string | number): Promise<any>;

  /**
   * Retry OTP via channel
   */
  retryOtp(channel?: MSG91Channel): Promise<any>;

  /**
   * Get widget data
   */
  getWidgetData(): any;

  /**
   * Get current configuration
   */
  getConfig(): MSG91Configuration | undefined;

  /**
   * Update configuration
   */
  updateConfig(config: Partial<MSG91Configuration>): void;

  /**
   * Listen to OTP success event
   */
  onOtpSuccess(callback: (data: any) => void): () => void;

  /**
   * Listen to OTP failure event
   */
  onOtpFailure(callback: (error: any) => void): () => void;

  /**
   * Get channel by name
   */
  getChannel(name: keyof MSG91ChannelMap): string;
}

// ============================================
// Authentication Service Interface
// ============================================

export interface AuthService {
  /**
   * Send OTP (uses MSG91 if available, falls back to backend)
   */
  sendOTP(mobile: string, useMsg91?: boolean): Promise<any>;

  /**
   * Verify OTP (uses MSG91 if available, falls back to backend)
   */
  verifyOTP(mobile: string, otp: string, useMsg91?: boolean): Promise<any>;

  /**
   * Retry OTP (MSG91 only)
   */
  retryOTP(channel?: MSG91Channel): Promise<any>;

  /**
   * Get OTP widget data
   */
  getOTPWidgetData(): any;

  /**
   * Sign up user
   */
  signUp(email: string, phone: string, name: string): Promise<any>;

  /**
   * Sign in user
   */
  signIn(email: string): Promise<any>;

  /**
   * Sign out user
   */
  signOut(): Promise<void>;

  /**
   * Get current user
   */
  getCurrentUser(): Promise<any>;
}

// ============================================
// MSG91 Widget Data
// ============================================

export interface MSG91WidgetData {
  /**
   * Merchant ID from MSG91
   */
  merchantId?: string;

  /**
   * OTP identifier
   */
  identifier?: string;

  /**
   * Template ID
   */
  template?: string;

  /**
   * Current status
   */
  status?: 'pending' | 'verified' | 'failed' | 'expired';

  /**
   * Timestamp
   */
  timestamp?: number;

  /**
   * Additional data
   */
  [key: string]: any;
}

// ============================================
// OTP Response Types
// ============================================

export interface OTPSendResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export interface OTPVerifyResponse {
  success: boolean;
  verified: boolean;
  message?: string;
  user?: {
    id: string;
    mobile?: string;
    email?: string;
  };
  data?: any;
  error?: string;
}

export interface OTPRetryResponse {
  success: boolean;
  channel: MSG91Channel;
  message?: string;
  data?: any;
  error?: string;
}

// ============================================
// Error Types
// ============================================

export interface OTPError extends Error {
  code?: string;
  details?: any;
}

// ============================================
// Event Types
// ============================================

export interface MSG91SuccessEvent extends CustomEvent<any> {
  type: 'msg91-otp-success';
  detail: any;
}

export interface MSG91FailureEvent extends CustomEvent<any> {
  type: 'msg91-otp-failure';
  detail: any;
}

// ============================================
// Component Props Types
// ============================================

export interface OTPVerificationProps {
  /**
   * Mobile number or email to send OTP
   */
  identifier: string;

  /**
   * Callback on successful OTP verification
   */
  onSuccess: (data: OTPVerifyResponse) => void;

  /**
   * Callback on OTP verification error
   */
  onError: (error: OTPError) => void;

  /**
   * Show channel selection for retry
   */
  showChannelSelect?: boolean;

  /**
   * Label for identifier
   */
  identifierLabel?: string;

  /**
   * Placeholder for OTP input
   */
  otpPlaceholder?: string;

  /**
   * Loading state
   */
  isLoading?: boolean;

  /**
   * Custom error message
   */
  errorMessage?: string;
}

// ============================================
// Window Type Augmentation
// ============================================

// NOTE: Global interface declarations are provided by msg91Service.ts to avoid
// conflicting types. Remove duplicates here to prevent TS errors.

// ============================================
// Export all types
// ============================================

export * from './msg91Service';
