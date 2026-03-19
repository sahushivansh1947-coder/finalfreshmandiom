/// <reference types="vite/client" />

/**
 * MSG91 OTP Configuration
 * Store your MSG91 credentials and settings here
 * 
 * Get your credentials from: https://www.msg91.com/
 */

export const MSG91_CONFIG = {
  /**
   * MSG91 Widget ID
   * Found in MSG91 Dashboard → OTP Verification → Widget Settings
   */
  WIDGET_ID: (import.meta.env.VITE_MSG91_WIDGET_ID as string) || '36624272444f333931393831',

  /**
   * MSG91 Token Auth (Authentication token)
   * Found in MSG91 Dashboard → OTP Verification → Widget Settings
   */
  TOKEN_AUTH: (import.meta.env.VITE_MSG91_TOKEN_AUTH as string) || '497026TZDdbCze69a336a2P1',

  /**
   * MSG91 Template ID for OTP messages (optional)
   * Go to https://www.msg91.com/app/setting/sms-templates
   * Create a template for OTP with variable {#var#}
   * Copy the template ID here or use environment variable VITE_MSG91_TEMPLATE_ID
   */
  TEMPLATE_ID: (import.meta.env.VITE_MSG91_TEMPLATE_ID as string) || '',

  /**
   * Default identifier (email or mobile number - optional)
   * Can be pre-filled in OTP form
   */
  DEFAULT_IDENTIFIER: (import.meta.env.VITE_MSG91_DEFAULT_IDENTIFIER as string) || '',

  /**
   * Expose methods on window object
   * true = methods exposed (window.sendOtp, window.verifyOtp, etc.)
   * false = default widget UI shown
   */
  EXPOSE_METHODS: (import.meta.env.VITE_MSG91_EXPOSE_METHODS as string) !== 'false',

  /**
   * Enable/disable MSG91 OTP service
   * Set to false to use backend OTP service only
   */
  ENABLED: (import.meta.env.VITE_MSG91_ENABLED as string) !== 'false',

  /**
   * Use MSG91 OTP retry functionality
   */
  ENABLE_RETRY: true,

  /**
   * Default retry channel for MSG91
   * Options: 'SMS' | 'VOICE' | 'EMAIL' | 'WHATSAPP' | null (default config)
   */
  DEFAULT_RETRY_CHANNEL: null,

  /**
   * OTP timeout in seconds
   */
  OTP_TIMEOUT: 300, // 5 minutes

  /**
   * OTP resend timeout in seconds
   */
  RESEND_TIMEOUT: 30, // 30 seconds

  /**
   * Show MSG91 UI widget
   * If false, uses custom UI with exposed methods
   */
  SHOW_WIDGET_UI: false,

  /**
   * Supported channels for OTP delivery
   */
  CHANNELS: {
    SMS: '11',
    VOICE: '4',
    EMAIL: '3',
    WHATSAPP: '12'
  },

  /**
   * Default identifier type
   */
  IDENTIFIER_TYPE: 'mobile', // 'mobile' or 'email'

  /**
   * Enable console logging for debugging
   */
  DEBUG: (import.meta.env.DEV as boolean) || false,

  /**
   * Script loading URLs (with fallback)
   */
  SCRIPT_URLS: [
    'https://verify.msg91.com/otp-provider.js',
    'https://verify.phone91.com/otp-provider.js'
  ],

  /**
   * Script timeout in milliseconds
   */
  SCRIPT_TIMEOUT: 5000
};

/**
 * Environment variables needed for MSG91:
 * 
 * Add these to your .env or .env.local file:
 * 
 * # MSG91 Widget Credentials
 * VITE_MSG91_WIDGET_ID=36624272444f333931393831
 * VITE_MSG91_TOKEN_AUTH=497026TZDdbCze69a336a2P1
 * 
 * # MSG91 Template (Optional)
 * VITE_MSG91_TEMPLATE_ID=your_template_id_here
 * 
 * # Advanced Configuration (Optional)
 * VITE_MSG91_DEFAULT_IDENTIFIER=user@example.com
 * VITE_MSG91_EXPOSE_METHODS=true
 * VITE_MSG91_ENABLED=true
 * 
 * Get these values from:
 * 1. Widget ID & Token Auth: MSG91 Dashboard → OTP Verification → Widget Settings
 * 2. Template ID: MSG91 Dashboard → SMS Templates
 */

export default MSG91_CONFIG;
