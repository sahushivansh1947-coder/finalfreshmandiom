/**
 * MSG91 OTP Verification Component
 * Advanced OTP verification with retry and channel selection
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Mail, Phone, MessageSquare, RotateCcw, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import msg91Service, { MSG91_CHANNELS, MSG91Channel } from '../msg91Service';
import MSG91_CONFIG from '../msg91Config';

interface MSG91OTPVerificationProps {
  mobile: string;
  onSuccess: (data: any) => void;
  onError: (error: Error) => void;
  showChannelSelect?: boolean;
}

/**
 * MSG91 Channel option with details
 */
const CHANNEL_OPTIONS = [
  { id: MSG91_CHANNELS.SMS, name: 'SMS', icon: Smartphone, description: 'via Text Message' },
  { id: MSG91_CHANNELS.EMAIL, name: 'Email', icon: Mail, description: 'via Email' },
  { id: MSG91_CHANNELS.VOICE, name: 'Voice Call', icon: Phone, description: 'via Phone Call' },
  { id: MSG91_CHANNELS.WHATSAPP, name: 'WhatsApp', icon: MessageSquare, description: 'via WhatsApp' }
] as const;

export const MSG91OTPVerification: React.FC<MSG91OTPVerificationProps> = ({
  mobile,
  onSuccess,
  onError,
  showChannelSelect = true
}) => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [timer, setTimer] = useState(0);
  const [selectedChannel, setSelectedChannel] = useState<MSG91Channel>(MSG91_CHANNELS.SMS);
  const [showChannelMenu, setShowChannelMenu] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Timer countdown for retry
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  /**
   * Verify OTP
   */
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length < 4) {
      setError('Please enter a valid OTP');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      if (MSG91_CONFIG.DEBUG) {
        console.log('Verifying OTP:', otp);
      }

      const data = await msg91Service.verifyOtp(otp);

      if (MSG91_CONFIG.DEBUG) {
        console.log('OTP verified successfully:', data);
      }

      setIsSuccess(true);
      setOtp('');
      
      // Call success callback after brief animation
      setTimeout(() => {
        onSuccess(data);
      }, 800);
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to verify OTP. Please try again.';
      setError(errorMsg);
      onError(new Error(errorMsg));
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Retry OTP via selected channel
   */
  const handleRetryOTP = async (channel?: MSG91Channel) => {
    if (!MSG91_CONFIG.ENABLE_RETRY) {
      setError('Retry functionality is disabled');
      return;
    }

    setError('');
    setIsRetrying(true);

    try {
      const retryChannel = channel || selectedChannel;

      if (MSG91_CONFIG.DEBUG) {
        console.log('Retrying OTP via channel:', retryChannel);
      }

      const data = await msg91Service.retryOtp(retryChannel);

      if (MSG91_CONFIG.DEBUG) {
        console.log('OTP retry successful:', data);
      }

      setTimer(MSG91_CONFIG.RESEND_TIMEOUT);
      setShowChannelMenu(false);
    } catch (err: any) {
      const errorMsg = err?.message || 'Failed to retry OTP. Please try again.';
      setError(errorMsg);
      onError(new Error(errorMsg));
    } finally {
      setIsRetrying(false);
    }
  };

  /**
   * Get widget data for debugging
   */
  const handleGetWidgetData = () => {
    const data = msg91Service.getWidgetData();
    if (MSG91_CONFIG.DEBUG) {
      console.log('MSG91 Widget Data:', data);
    }
  };

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center p-6"
      >
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">OTP Verified!</h3>
        <p className="text-sm text-gray-600">Your phone number has been verified successfully.</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-gap-2"
        >
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </motion.div>
      )}

      {/* Mobile Display */}
      <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          <span className="font-semibold">OTP sent to:</span> +91 {mobile}
        </p>
      </div>

      {/* OTP Input */}
      <form onSubmit={handleVerifyOTP} className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Enter OTP Code
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="000000"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, ''));
              setError('');
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center text-2xl letterSpacing tracking-widest font-semibold focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || otp.length < 4}
          className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifying...
            </>
          ) : (
            'Verify OTP'
          )}
        </button>
      </form>

      {/* Retry Options */}
      {MSG91_CONFIG.ENABLE_RETRY && (
        <div className="space-y-2">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowChannelMenu(!showChannelMenu)}
              disabled={isRetrying || timer > 0}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              {isRetrying ? 'Retrying...' : timer > 0 ? `Resend in ${timer}s` : 'Resend OTP'}
            </button>

            {/* Channel Selection Dropdown */}
            {showChannelMenu && showChannelSelect && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
              >
                <div className="p-2 space-y-1">
                  {CHANNEL_OPTIONS.map(({ id, name, icon: Icon, description }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleRetryOTP(id as MSG91Channel)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-100 rounded transition-colors flex items-center gap-2"
                    >
                      <Icon className="w-4 h-4 text-gray-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-700">{name}</p>
                        <p className="text-xs text-gray-500">{description}</p>
                      </div>
                      {isRetrying && selectedChannel === id && (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Quick Retry Button (Mobile/SMS) */}
          {!showChannelSelect && (
            <button
              type="button"
              onClick={() => handleRetryOTP(MSG91_CHANNELS.SMS)}
              disabled={isRetrying || timer > 0}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
            >
              {isRetrying ? 'Resending...' : timer > 0 ? `Resend in ${timer}s` : 'Resend via SMS'}
            </button>
          )}
        </div>
      )}

      {/* Debug Info Button */}
      {MSG91_CONFIG.DEBUG && (
        <button
          type="button"
          onClick={handleGetWidgetData}
          className="w-full px-4 py-2 text-xs bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Get Widget Data (Debug)
        </button>
      )}

      {/* Info Text */}
      <p className="text-xs text-gray-500 text-center">
        Didn't receive the code? Check your spam folder or try resending.
      </p>
    </div>
  );
};

export default MSG91OTPVerification;
