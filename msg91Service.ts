/**
 * MSG91 OTP Service
 * Wrapper for MSG91's window methods: sendOtp, retryOtp, verifyOtp, getWidgetData
 * Documentation: https://msg91.com/help/otp-verification
 */

// Type definitions for MSG91 callbacks
type MSG91Callback = (data?: any) => void;
type MSG91ErrorCallback = (error?: any) => void;

/**
 * Interface for MSG91 exposed methods on window object
 */
declare global {
  interface Window {
    sendOtp?: (
      identifier: string,
      successCallback?: MSG91Callback,
      failureCallback?: MSG91ErrorCallback
    ) => void;

    retryOtp?: (
      channel: string | null,
      successCallback?: MSG91Callback,
      failureCallback?: MSG91ErrorCallback,
      merchantId?: string
    ) => void;

    verifyOtp?: (
      otp: number | string,
      successCallback?: MSG91Callback,
      failureCallback?: MSG91ErrorCallback,
      merchantId?: string
    ) => void;

    getWidgetData?: () => any;

    msg91Config?: {
      exposeMethods: boolean;
      templateId?: string;
      success?: (data: any) => void;
      failure?: (error: any) => void;
    };
  }
}

// Channel constants for retryOtp
export const MSG91_CHANNELS = {
  SMS: '11',
  VOICE: '4',
  EMAIL: '3',
  WHATSAPP: '12'
} as const;

export type MSG91Channel = typeof MSG91_CHANNELS[keyof typeof MSG91_CHANNELS] | null;

/**
 * MSG91 OTP Service - Promise-based wrapper for MSG91 methods
 */
export const msg91Service = {
  /**
   * Check if MSG91 OTP provider is loaded and available
   */
  isAvailable(): boolean {
    return typeof window !== 'undefined' && typeof window.sendOtp === 'function';
  },

  /**
   * Send OTP to email or mobile number
   * @param identifier - Email address or mobile number (with country code, no +)
   * @returns Promise that resolves with success data or rejects with error
   * 
   * @example
   * // Send OTP to email
   * await msg91Service.sendOtp('user@example.com');
   * 
   * // Send OTP to mobile (with country code)
   * await msg91Service.sendOtp('919999999999');
   */
  async sendOtp(identifier: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.isAvailable()) {
        reject(new Error('MSG91 OTP service is not available'));
        return;
      }

      if (!identifier) {
        reject(new Error('Identifier (email or mobile) is required'));
        return;
      }

      // Remove any '+' from the identifier if provided for mobile
      const cleanIdentifier = identifier.replace(/^\+/, '');

      try {
        window.sendOtp?.(
          cleanIdentifier,
          (data: any) => {
            console.log('MSG91 SendOTP Success:', data);
            resolve(data);
          },
          (error: any) => {
            console.error('MSG91 SendOTP Error:', error);
            reject(error || new Error('Failed to send OTP'));
          }
        );
      } catch (error) {
        console.error('MSG91 SendOTP Exception:', error);
        reject(error);
      }
    });
  },

  /**
   * Verify OTP entered by user
   * @param otp - The OTP code to verify
   * @returns Promise that resolves with verification data or rejects with error
   * 
   * @example
   * await msg91Service.verifyOtp('123456');
   */
  async verifyOtp(otp: string | number): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.isAvailable()) {
        reject(new Error('MSG91 OTP service is not available'));
        return;
      }

      if (!otp) {
        reject(new Error('OTP is required'));
        return;
      }

      const otpValue = typeof otp === 'string' ? parseInt(otp, 10) : otp;

      if (isNaN(otpValue)) {
        reject(new Error('Invalid OTP format'));
        return;
      }

      try {
        window.verifyOtp?.(
          otpValue,
          (data: any) => {
            console.log('MSG91 VerifyOTP Success:', data);
            resolve(data);
          },
          (error: any) => {
            console.error('MSG91 VerifyOTP Error:', error);
            reject(error || new Error('OTP verification failed'));
          }
        );
      } catch (error) {
        console.error('MSG91 VerifyOTP Exception:', error);
        reject(error);
      }
    });
  },

  /**
   * Retry OTP delivery via specified channel
   * @param channel - Channel to use: SMS ('11'), VOICE ('4'), EMAIL ('3'), WHATSAPP ('12'), or null for default
   * @returns Promise that resolves with retry data or rejects with error
   * 
   * @example
   * // Retry via SMS
   * await msg91Service.retryOtp(msg91Service.CHANNELS.SMS);
   * 
   * // Retry via default configuration
   * await msg91Service.retryOtp(null);
   * 
   * // Retry via Email
   * await msg91Service.retryOtp(msg91Service.CHANNELS.EMAIL);
   */
  async retryOtp(channel: MSG91Channel = null): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.isAvailable()) {
        reject(new Error('MSG91 OTP service is not available'));
        return;
      }

      try {
        window.retryOtp?.(
          channel,
          (data: any) => {
            console.log('MSG91 RetryOTP Success:', data);
            resolve(data);
          },
          (error: any) => {
            console.error('MSG91 RetryOTP Error:', error);
            reject(error || new Error('Failed to retry OTP'));
          }
        );
      } catch (error) {
        console.error('MSG91 RetryOTP Exception:', error);
        reject(error);
      }
    });
  },

  /**
   * Get current widget configuration data
   * @returns Current widget data or null if not available
   * 
   * @example
   * const widgetData = msg91Service.getWidgetData();
   * console.log('Widget configuration:', widgetData);
   */
  getWidgetData(): any {
    if (!this.isAvailable()) {
      console.warn('MSG91 OTP service is not available');
      return null;
    }

    try {
      return window.getWidgetData?.();
    } catch (error) {
      console.error('MSG91 GetWidgetData Exception:', error);
      return null;
    }
  },

  /**
   * Get current MSG91 configuration
   */
  getConfig() {
    return window.msg91Config;
  },

  /**
   * Update MSG91 configuration
   * @param config - Partial configuration to update
   */
  updateConfig(config: Partial<Window['msg91Config']>) {
    if (window.msg91Config) {
      Object.assign(window.msg91Config, config);
      console.log('MSG91 Config updated:', window.msg91Config);
    }
  },

  /**
   * Listen to MSG91 OTP success event
   * @param callback - Function to call on success
   */
  onOtpSuccess(callback: (data: any) => void): (() => void) {
    const handler = (event: CustomEvent) => {
      callback(event.detail);
    };
    window.addEventListener('msg91-otp-success', handler as EventListener);
    
    // Return unsubscribe function
    return () => {
      window.removeEventListener('msg91-otp-success', handler as EventListener);
    };
  },

  /**
   * Listen to MSG91 OTP failure event
   * @param callback - Function to call on failure
   */
  onOtpFailure(callback: (error: any) => void): (() => void) {
    const handler = (event: CustomEvent) => {
      callback(event.detail);
    };
    window.addEventListener('msg91-otp-failure', handler as EventListener);
    
    // Return unsubscribe function
    return () => {
      window.removeEventListener('msg91-otp-failure', handler as EventListener);
    };
  },

  /**
   * Get channel constant by name
   */
  getChannel(name: 'SMS' | 'VOICE' | 'EMAIL' | 'WHATSAPP'): string {
    return MSG91_CHANNELS[name];
  }
};


export default msg91Service;
